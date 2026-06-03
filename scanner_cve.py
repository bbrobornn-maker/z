#!/usr/bin/env python3
"""
Scanner CVE - Y1N Security Platform
Testa CVEs documentadas em URLs fornecidas
Autor: Jarvis (Y1N)
"""

import requests
import urllib3
import sys
import json
import time
import re
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class CVEScanner:
    def __init__(self, target_url, timeout=10):
        self.target = target_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        })
        self.results = []
        self.technologies = []
        
    def log(self, level, message, data=None):
        entry = {
            'timestamp': time.strftime('%H:%M:%S'),
            'level': level,
            'message': message,
            'data': data
        }
        self.results.append(entry)
        print(f"[{entry['timestamp']}] [{level}] {message}")
        if data:
            print(f"  -> {json.dumps(data, indent=2)}")
        return entry

    # ============ RECONHECIMENTO ============
    def fingerprint(self):
        """Identifica tecnologias do alvo"""
        self.log('INFO', f'Iniciando fingerprint em {self.target}')
        try:
            resp = self.session.get(self.target, timeout=self.timeout, verify=False)
            headers = dict(resp.headers)
            
            # Detectar tecnologias
            techs = []
            server = headers.get('Server', '')
            x_powered = headers.get('X-Powered-By', '')
            
            if 'Apache' in server: techs.append('Apache')
            if 'nginx' in server: techs.append('Nginx')
            if 'Microsoft' in server or 'IIS' in server: techs.append('IIS')
            if 'PHP' in x_powered or 'php' in resp.text.lower()[:500]: techs.append('PHP')
            if 'WordPress' in resp.text or 'wp-content' in resp.text: techs.append('WordPress')
            if 'Drupal' in resp.text: techs.append('Drupal')
            if 'Joomla' in resp.text: techs.append('Joomla')
            if 'Laravel' in resp.text: techs.append('Laravel')
            if 'Django' in resp.text: techs.append('Django')
            if 'React' in resp.text: techs.append('React')
            if 'Angular' in resp.text: techs.append('Angular')
            if 'Next.js' in resp.text or '_next' in resp.text: techs.append('Next.js')
            if 'Express' in resp.text: techs.append('Express')
            if 'Flask' in resp.text: techs.append('Flask')
            if 'Spring' in resp.text: techs.append('Spring')
            if 'Tomcat' in server: techs.append('Tomcat')
            if 'MongoDB' in resp.text: techs.append('MongoDB')
            if 'Node.js' in x_powered: techs.append('Node.js')
            if 'ASP.NET' in x_powered or '.aspx' in resp.text: techs.append('ASP.NET')
            if 'Shopify' in resp.text: techs.append('Shopify')
            if 'Magento' in resp.text: techs.append('Magento')
            if 'PrestaShop' in resp.text: techs.append('PrestaShop')
            if 'WooCommerce' in resp.text: techs.append('WooCommerce')
            
            self.technologies = techs
            self.log('INFO', f'Tecnologias detectadas: {techs}', {
                'status': resp.status_code,
                'server': server,
                'x_powered': x_powered,
                'technologies': techs
            })
            
            # Detectar headers de segurança
            security_headers = {
                'X-Frame-Options': headers.get('X-Frame-Options'),
                'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
                'Content-Security-Policy': headers.get('Content-Security-Policy'),
                'Strict-Transport-Security': headers.get('Strict-Transport-Security'),
                'X-XSS-Protection': headers.get('X-XSS-Protection'),
                'Referrer-Policy': headers.get('Referrer-Policy'),
                'Permissions-Policy': headers.get('Permissions-Policy')
            }
            
            missing = [k for k, v in security_headers.items() if not v]
            if missing:
                self.log('WARN', f'Headers de segurança ausentes: {missing}', missing)
            
            return techs
        except Exception as e:
            self.log('ERROR', f'Erro no fingerprint: {str(e)}')
            return []

    # ============ TESTES DE CVE ============
    def test_exposed_env(self):
        """Testa exposição de .env"""
        paths = ['/.env', '/.env.local', '/.env.production', '/.env.backup', 
                 '/env', '/environment', '/.env.development']
        for path in paths:
            try:
                url = urljoin(self.target, path)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200 and ('DB_' in resp.text or 'API_' in resp.text or 
                                                   'SECRET' in resp.text or 'PASSWORD' in resp.text):
                    self.log('CRITICAL', f'EXPOSED .env file found at {url}', 
                             {'status': resp.status_code, 'snippet': resp.text[:500]})
                    return True
            except:
                pass
        return False

    def test_exposed_git(self):
        """Testa exposição de .git"""
        paths = ['/.git/config', '/.git/HEAD', '/.git/logs/HEAD', '/.git/index']
        for path in paths:
            try:
                url = urljoin(self.target, path)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200 and ('[core]' in resp.text or 'ref:' in resp.text):
                    self.log('CRITICAL', f'EXPOSED .git folder found at {url}',
                             {'status': resp.status_code, 'snippet': resp.text[:300]})
                    return True
            except:
                pass
        return False

    def test_exposed_backup(self):
        """Testa arquivos de backup expostos"""
        paths = ['/backup.sql', '/database.sql', '/db.sql', '/dump.sql', '/backup.zip',
                 '/backup.tar.gz', '/db_backup.sql', '/backup.tar', '/archive.zip',
                 '/data.sql', '/database_backup.sql', '/backup/db.sql', '/sql/backup.sql']
        for path in paths:
            try:
                url = urljoin(self.target, path)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200 and len(resp.text) > 100:
                    content_type = resp.headers.get('Content-Type', '')
                    if 'sql' in content_type or 'zip' in content_type or 'gzip' in content_type:
                        self.log('CRITICAL', f'EXPOSED backup file found at {url}',
                                 {'status': resp.status_code, 'size': len(resp.text), 'type': content_type})
                        return True
            except:
                pass
        return False

    def test_directory_listing(self):
        """Testa directory listing"""
        paths = ['/uploads/', '/images/', '/files/', '/assets/', '/upload/', 
                 '/static/', '/media/', '/downloads/', '/backup/', '/data/']
        for path in paths:
            try:
                url = urljoin(self.target, path)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200 and ('Index of' in resp.text or 'Directory Listing' in resp.text
                                                 or '<title>Index of' in resp.text):
                    self.log('CRITICAL', f'DIRECTORY LISTING enabled at {url}',
                             {'status': resp.status_code, 'snippet': resp.text[:300]})
                    return True
            except:
                pass
        return False

    def test_idor(self):
        """Testa IDOR básico em endpoints comuns"""
        endpoints = [
            '/api/users/1', '/api/user/1', '/api/profile/1', '/api/account/1',
            '/api/orders/1', '/api/order/1', '/api/posts/1', '/api/post/1',
            '/api/customers/1', '/api/customer/1', '/api/invoices/1',
            '/user/1', '/profile/1', '/account/1', '/order/1', '/invoice/1',
            '/users?id=1', '/user?id=1', '/profile?id=1', '/account?id=1',
            '/api/v1/users/1', '/api/v2/users/1', '/v1/users/1', '/v2/users/1'
        ]
        found = []
        for endpoint in endpoints:
            try:
                url = urljoin(self.target, endpoint)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200 and len(resp.text) > 50:
                    # Verificar se parece dados de outro usuário
                    if any(k in resp.text.lower() for k in ['email', 'username', 'name', 'phone', 'address']):
                        self.log('HIGH', f'Potential IDOR at {url}',
                                 {'status': resp.status_code, 'snippet': resp.text[:300]})
                        found.append(url)
            except:
                pass
        return len(found) > 0

    def test_sql_injection(self):
        """Testa SQL Injection básico"""
        payloads = [
            "' OR '1'='1", "' OR 1=1--", "' OR 1=1#", "1' AND 1=1--",
            "1' AND 1=2--", "' UNION SELECT NULL--", "1 AND 1=1", "1 AND 1=2",
            "1' OR '1'='1' --", "1' OR '1'='1' /*", "1' AND SLEEP(5)--",
            "1'; WAITFOR DELAY '0:0:5'--", "1' AND pg_sleep(5)--"
        ]
        
        params = ['id', 'user', 'uid', 'pid', 'page', 'cat', 'category', 'product',
                  'item', 'search', 'q', 'query', 's', 'term', 'username', 'email']
        
        found = []
        for param in params:
            for payload in payloads:
                try:
                    url = f"{self.target}/?{param}={requests.utils.quote(payload)}"
                    start = time.time()
                    resp = self.session.get(url, timeout=self.timeout, verify=False)
                    elapsed = time.time() - start
                    
                    # Detectar SQL errors
                    sql_errors = ['sql', 'mysql', 'sqlite', 'postgres', 'oracle', 
                                  'syntax', 'unexpected', 'error in', 'odbc', 'jdbc']
                    if any(err in resp.text.lower() for err in sql_errors):
                        self.log('CRITICAL', f'SQL Injection detected at {url}',
                                 {'payload': payload, 'error_snippet': resp.text[:300]})
                        found.append(url)
                        break
                    
                    # Time-based detection
                    if 'SLEEP' in payload or 'pg_sleep' in payload or 'WAITFOR' in payload:
                        if elapsed > 4:
                            self.log('CRITICAL', f'Time-based SQLi at {url} (delay: {elapsed:.2f}s)',
                                     {'payload': payload})
                            found.append(url)
                            break
                            
                except:
                    pass
        return len(found) > 0

    def test_xss(self):
        """Testa XSS refletido"""
        payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            "'><script>alert(1)</script>",
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            'javascript:alert(1)',
            '"><img src=x onerror=alert(1)>',
            "'"><img src=x onerror=alert(1)>"
        ]
        
        params = ['s', 'q', 'search', 'query', 'term', 'name', 'id', 'page', 'cat', 
                  'category', 'tag', 'keyword', 'ref', 'redirect', 'url', 'return']
        
        found = []
        for param in params:
            for payload in payloads:
                try:
                    url = f"{self.target}/?{param}={requests.utils.quote(payload)}"
                    resp = self.session.get(url, timeout=self.timeout, verify=False)
                    
                    if payload in resp.text:
                        self.log('HIGH', f'Reflected XSS at {url}',
                                 {'payload': payload, 'reflected': True})
                        found.append(url)
                        break
                except:
                    pass
        return len(found) > 0

    def test_open_redirect(self):
        """Testa Open Redirect"""
        payloads = [
            'https://evil.com', 'http://evil.com', '//evil.com',
            'https://google.com', 'http://google.com', '//google.com',
            '/\evil.com', '/\/evil.com', 'https://evil.com/%2f..',
            'https://evil.com@target.com', 'https://target.com.evil.com'
        ]
        
        params = ['redirect', 'url', 'next', 'return', 'return_to', 'returnUrl',
                  'redirect_uri', 'redirectUrl', 'callback', 'cb', 'jump', 'to',
                  'link', 'goto', 'target', 'dest', 'destination', 'redir']
        
        found = []
        for param in params:
            for payload in payloads:
                try:
                    url = f"{self.target}/?{param}={requests.utils.quote(payload)}"
                    resp = self.session.get(url, timeout=self.timeout, verify=False, allow_redirects=False)
                    
                    if resp.status_code in [301, 302, 303, 307, 308]:
                        location = resp.headers.get('Location', '')
                        if 'evil.com' in location or 'google.com' in location:
                            self.log('HIGH', f'Open Redirect at {url}',
                                     {'payload': payload, 'location': location})
                            found.append(url)
                            break
                except:
                    pass
        return len(found) > 0

    def test_ssrf(self):
        """Testa SSRF básico"""
        payloads = [
            'http://169.254.169.254/', 'http://169.254.169.254/latest/meta-data/',
            'http://localhost/', 'http://127.0.0.1/', 'http://0.0.0.0/',
            'http://[::1]/', 'file:///etc/passwd', 'dict://127.0.0.1:6379/',
            'http://internal/', 'http://10.0.0.1/', 'http://192.168.1.1/',
            'http://metadata.google.internal/', 'http://169.254.169.254/computeMetadata/v1/'
        ]
        
        params = ['url', 'uri', 'link', 'path', 'file', 'image', 'avatar', 
                  'url', 'endpoint', 'api', 'redirect', 'callback', 'src', 'href']
        
        found = []
        for param in params:
            for payload in payloads:
                try:
                    url = f"{self.target}/?{param}={requests.utils.quote(payload)}"
                    resp = self.session.get(url, timeout=self.timeout, verify=False)
                    
                    # Detectar respostas de metadata services
                    if 'ami-id' in resp.text or 'instance-id' in resp.text or 'accountId' in resp.text:
                        self.log('CRITICAL', f'SSRF (AWS metadata) at {url}',
                                 {'payload': payload, 'snippet': resp.text[:300]})
                        found.append(url)
                        break
                    if 'root:x' in resp.text or 'daemon:' in resp.text:
                        self.log('CRITICAL', f'SSRF (file read) at {url}',
                                 {'payload': payload, 'snippet': resp.text[:300]})
                        found.append(url)
                        break
                    # Detectar diferença de resposta
                    if resp.status_code == 200 and len(resp.text) > 100:
                        if 'error' not in resp.text.lower() and 'invalid' not in resp.text.lower():
                            self.log('MEDIUM', f'Potential SSRF at {url}',
                                     {'payload': payload, 'status': resp.status_code, 'len': len(resp.text)})
                except:
                    pass
        return len(found) > 0

    def test_nosql_injection(self):
        """Testa NoSQL Injection (MongoDB)"""
        payloads = [
            '{"$gt": ""}', '{"$ne": null}', '{"$regex": ".*"}', 
            '{"$where": "this"}', '{"$exists": true}', '[{"$gt": ""}]',
            '[$gt]=', '[$ne]=', '[$regex]=', '[$exists]=true'
        ]
        
        params = ['id', 'user', 'uid', 'where', 'filter', 'query', 'search', 'q']
        
        found = []
        for param in params:
            for payload in payloads:
                try:
                    url = f"{self.target}/?{param}={requests.utils.quote(payload)}"
                    resp = self.session.get(url, timeout=self.timeout, verify=False)
                    
                    # Detectar MongoDB errors
                    mongo_errors = ['mongo', 'bson', 'invalid operator', 'unknown operator',
                                    'cannot parse', 'malformed', 'expected']
                    if any(err in resp.text.lower() for err in mongo_errors):
                        self.log('CRITICAL', f'NoSQL Injection at {url}',
                                 {'payload': payload, 'error': resp.text[:300]})
                        found.append(url)
                        break
                except:
                    pass
        return len(found) > 0

    def test_clickjacking(self):
        """Testa Clickjacking (ausência de X-Frame-Options)"""
        try:
            resp = self.session.get(self.target, timeout=self.timeout, verify=False)
            headers = dict(resp.headers)
            
            x_frame = headers.get('X-Frame-Options')
            csp = headers.get('Content-Security-Policy', '')
            
            if not x_frame and 'frame-ancestors' not in csp:
                self.log('HIGH', 'Clickjacking vulnerability: X-Frame-Options and CSP frame-ancestors missing',
                         {'headers': headers})
                return True
            return False
        except:
            return False

    def test_cors_misconfig(self):
        """Testa CORS misconfiguration"""
        try:
            headers = {'Origin': 'https://evil.com'}
            resp = self.session.get(self.target, headers=headers, timeout=self.timeout, verify=False)
            
            acao = resp.headers.get('Access-Control-Allow-Origin', '')
            acac = resp.headers.get('Access-Control-Allow-Credentials', '')
            
            if acao == 'https://evil.com' or acao == '*':
                if acac == 'true':
                    self.log('CRITICAL', f'CORS misconfiguration: credentials allowed from {acao}',
                             {'acao': acao, 'acac': acac})
                else:
                    self.log('HIGH', f'CORS misconfiguration: any origin allowed ({acao})',
                             {'acao': acao})
                return True
            return False
        except:
            return False

    def test_graphql_introspection(self):
        """Testa GraphQL introspection"""
        query = {'query': '{ __schema { types { name } } }'}
        endpoints = ['/graphql', '/api/graphql', '/query', '/gql', '/api/v1/graphql']
        
        for endpoint in endpoints:
            try:
                url = urljoin(self.target, endpoint)
                resp = self.session.post(url, json=query, timeout=self.timeout, verify=False)
                
                if resp.status_code == 200 and '__schema' in resp.text:
                    self.log('HIGH', f'GraphQL introspection enabled at {url}',
                             {'types_count': len(resp.json().get('data', {}).get('__schema', {}).get('types', []))})
                    return True
            except:
                pass
        return False

    def test_cve_specific(self):
        """Testa CVEs específicas baseadas em tecnologias detectadas"""
        cve_tests = []
        
        if 'WordPress' in self.technologies:
            cve_tests.extend([
                ('/wp-config.php', 'WordPress config exposure'),
                ('/wp-content/uploads/', 'WordPress uploads directory'),
                ('/wp-json/wp/v2/users', 'WordPress REST API user enumeration'),
                ('/wp-login.php', 'WordPress login page'),
                ('/xmlrpc.php', 'WordPress XML-RPC'),
            ])
        
        if 'Next.js' in self.technologies:
            cve_tests.extend([
                ('/_next/static/', 'Next.js static files'),
                ('/_next/image', 'Next.js image optimization'),
            ])
        
        if 'Apache' in self.technologies:
            cve_tests.extend([
                ('/server-status', 'Apache server status'),
                ('/server-info', 'Apache server info'),
            ])
        
        if 'Nginx' in self.technologies:
            cve_tests.extend([
                ('/nginx_status', 'Nginx status'),
            ])
        
        if 'MongoDB' in self.technologies or 'Rocket.Chat' in self.technologies:
            cve_tests.extend([
                ('/api/v1/info', 'Rocket.Chat info endpoint'),
            ])
        
        if 'Tomcat' in self.technologies:
            cve_tests.extend([
                ('/manager/html', 'Tomcat manager'),
                ('/host-manager/html', 'Tomcat host manager'),
            ])
        
        for path, desc in cve_tests:
            try:
                url = urljoin(self.target, path)
                resp = self.session.get(url, timeout=self.timeout, verify=False)
                if resp.status_code == 200:
                    self.log('HIGH', f'{desc} accessible at {url}',
                             {'status': resp.status_code, 'len': len(resp.text)})
            except:
                pass

    def run_all_tests(self):
        """Executa todos os testes"""
        self.log('INFO', '=' * 60)
        self.log('INFO', f'SCANNER CVE - Y1N Security Platform')
        self.log('INFO', f'Target: {self.target}')
        self.log('INFO', '=' * 60)
        
        # Fingerprint
        self.fingerprint()
        
        # Testes de CVE
        tests = [
            ('Exposed .env', self.test_exposed_env),
            ('Exposed .git', self.test_exposed_git),
            ('Exposed backups', self.test_exposed_backup),
            ('Directory listing', self.test_directory_listing),
            ('IDOR', self.test_idor),
            ('SQL Injection', self.test_sql_injection),
            ('XSS', self.test_xss),
            ('Open Redirect', self.test_open_redirect),
            ('SSRF', self.test_ssrf),
            ('NoSQL Injection', self.test_nosql_injection),
            ('Clickjacking', self.test_clickjacking),
            ('CORS Misconfig', self.test_cors_misconfig),
            ('GraphQL Introspection', self.test_graphql_introspection),
            ('CVE-specific', self.test_cve_specific),
        ]
        
        for name, test_func in tests:
            self.log('INFO', f'Running test: {name}')
            try:
                test_func()
            except Exception as e:
                self.log('ERROR', f'Test {name} failed: {str(e)}')
            time.sleep(0.5)
        
        # Resumo
        self.log('INFO', '=' * 60)
        self.log('INFO', 'SCAN COMPLETE')
        self.log('INFO', f'Total findings: {len([r for r in self.results if r["level"] in ["CRITICAL", "HIGH", "MEDIUM"]])}')
        self.log('INFO', '=' * 60)
        
        return self.results

    def save_report(self, filename='cve_scan_report.json'):
        """Salva relatório em JSON"""
        with open(filename, 'w') as f:
            json.dump({
                'target': self.target,
                'technologies': self.technologies,
                'scan_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'results': self.results
            }, f, indent=2)
        self.log('INFO', f'Report saved to {filename}')


def main():
    if len(sys.argv) < 2:
        print("Usage: python scanner_cve.py <target_url>")
        print("Example: python scanner_cve.py https://example.com")
        sys.exit(1)
    
    target = sys.argv[1]
    scanner = CVEScanner(target)
    scanner.run_all_tests()
    scanner.save_report()

if __name__ == '__main__':
    main()
