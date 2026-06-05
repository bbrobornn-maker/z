#!/usr/bin/env python3
"""Analyze portal JS for API endpoints"""
import requests
import urllib3
import re
import json

urllib3.disable_warnings()

PROXY = {'http': 'http://glflytku:qjy9vrlulx4v@45.38.89.92:6027', 'https': 'http://glflytku:qjy9vrlulx4v@45.38.89.92:6027'}
s = requests.Session()
s.proxies = PROXY
s.verify = False

js_url = 'https://mportal.ssp.go.gov.br/scripts/scripts.604fb85d.js'
r = s.get(js_url, timeout=15)
print(f'JS Status: {r.status_code}')
print(f'JS Length: {len(r.text)}')

# Find all string literals that look like URLs
strings = re.findall(r'"([^"]*?)"', r.text)
strings += re.findall(r"'([^']*?)'", r.text)

# Filter for API-looking strings
api_strings = [s for s in strings if 'api' in s.lower() or 'login' in s.lower() or 'auth' in s.lower() or 'token' in s.lower()]
print(f'\nAPI/Login strings: {len(set(api_strings))}')
for u in sorted(set(api_strings))[:30]:
    print(f'  -> {u}')

# Find all URLs
urls = [s for s in strings if s.startswith('http') or s.startswith('/api/') or s.startswith('/rest/') or s.startswith('/service/')]
print(f'\nURLs: {len(set(urls))}')
for u in sorted(set(urls))[:30]:
    print(f'  -> {u}')

# Find patterns with 'login' or 'autenticar'
login = [s for s in strings if 'login' in s.lower() or 'autentic' in s.lower() or 'senha' in s.lower() or 'password' in s.lower()]
print(f'\nLogin-related strings: {len(set(login))}')
for u in sorted(set(login))[:20]:
    print(f'  -> {u}')

# Save JS for manual inspection
with open('/home/runner/workspace/portal_js.txt', 'w') as f:
    f.write(r.text)
print('\nJS saved to portal_js.txt')
