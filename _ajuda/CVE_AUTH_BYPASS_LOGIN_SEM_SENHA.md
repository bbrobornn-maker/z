# 🔓 CVE — LOGIN SEM AUTENTICAÇÃO / AUTH BYPASS
> Compilado em: 2026-06-03 | Famosos + Menos Conhecidos | Alguns sem patch em sistemas legados
> Fontes: NVD, CISA KEV, SOCRadar, ZeroPath, SentinelOne, HeroDevs, Obsidian Security

---

## 📊 ÍNDICE

1. [Bypass Direto de Login — Pre-Auth RCE / Admin](#1-bypass-direto-de-login--pre-auth-rce--admin)
2. [Credenciais Hardcoded / Padrão](#2-credenciais-hardcoded--padrão)
3. [JWT / Token Bypass](#3-jwt--token-bypass)
4. [SAML / OAuth2 / SSO Bypass](#4-saml--oauth2--sso-bypass)
5. [Password Reset Bypass → Account Takeover](#5-password-reset-bypass--account-takeover)
6. [API Endpoint Sem Autenticação](#6-api-endpoint-sem-autenticação)
7. [Menos Conhecidos / Obscuros (muitos sem patch)](#7-menos-conhecidos--obscuros-muitos-sem-patch)
8. [SAP / Oracle / Cisco — Corporativos](#8-sap--oracle--cisco--corporativos)
9. [Spring Boot / Framework Bypasses](#9-spring-boot--framework-bypasses)
10. [Técnicas de Bypass — Referência Rápida](#10-técnicas-de-bypass--referência-rápida)

---

## 1. BYPASS DIRETO DE LOGIN — PRE-AUTH RCE / ADMIN

| CVE | Produto | CVSS | Mecanismo | Wild? |
|-----|---------|------|-----------|-------|
| CVE-2025-32432 | **Craft CMS** 3.x/4.x/5.x | **10.0** | POST unauthenticado → PHP object injection → RCE | ✅ Ativo |
| CVE-2025-32433 | **Erlang/OTP SSH** | **10.0** | SSH packets pré-login → RCE (geralmente como root) | ✅ PoC público |
| CVE-2025-55182 | **Next.js / React Server** | **10.0** | Pre-auth RCE via Flight protocol | ✅ CISA KEV |
| CVE-2025-3248  | **Langflow AI** (< 1.3.0) | **9.8** | POST `/api/v1/validate/code` → Python `exec()` arbitrário | ✅ Flodric botnet |
| CVE-2025-31324 | **SAP NetWeaver** Visual Composer | **10.0** | Upload de arquivo sem auth → webshell → RCE | ✅ Zero-day ativo |
| CVE-2024-27198 | **JetBrains TeamCity** | **9.8** | Auth bypass via alternate path → admin CI/CD | ✅ 1.400+ servidores |
| CVE-2023-42793 | **JetBrains TeamCity** | **9.8** | Auth bypass → admin takeover | ✅ APT29 (Cozy Bear) |
| CVE-2023-22515 | **Atlassian Confluence** DC/Server | **9.8** | Broken access → criar usuário admin via `/server-info.action` | ✅ CISA KEV |
| CVE-2023-22518 | **Atlassian Confluence** DC/Server | **9.1** | `/json/setup-restore.action` → sobrescreve DB, injeta admin | ✅ CISA KEV |
| CVE-2024-38856 | **Apache OFBiz** (≤18.12.14) | 7.5 | Endpoint sem auth → RCE via screen rendering | ✅ Ativo |
| CVE-2024-23692 | **Rejetto HTTP File Server** | High | Pre-auth RCE via HTTP request craftado | ✅ Ativo |
| CVE-2024-12356 | **BeyondTrust** Remote Support/PRA | Critical | OS command injection pre-auth (US Treasury breach) | ✅ Silk Typhoon |
| CVE-2025-54322 | **XSpeeder/SXZOS** Network Devices | Critical | `eval()` em query params → root RCE — 70.000+ hosts expostos | ⚠️ **SEM PATCH** |
| CVE-2024-46506 | **NetAlertX** Admin Panel | High | POST `/savesettings` sem auth → command injection → RCE | ✅ PoC público |
| CVE-2025-0282  | **Ivanti Connect Secure** VPN | **9.0** | Stack buffer overflow → RCE unauthenticado (zero-day Nominet) | ✅ Ativo |
| CVE-2025-6704  | **Sophos Firewall** (HA+SPX) | Critical | File write arbitrário no SPX → pre-auth RCE | ✅ Hotfix |
| CVE-2025-7382  | **Sophos Firewall** WebAdmin | High | Command injection WebAdmin → pre-auth RCE (HA) | ✅ Hotfix |

### 🔍 Técnicas notáveis

**CVE-2025-32433 — Erlang/OTP SSH (CVSS 10.0)**
```bash
# Qualquer SSH daemon Erlang/OTP exposto = RCE sem credenciais
# Afeta sistemas de telecom, IoT, RabbitMQ, CouchDB, Ejabberd
# PoC público disponível no GitHub
```

**CVE-2023-22515 — Atlassian Confluence**
```http
POST /server-info.action?bootstrapStatusProvider.applicationConfig.setupComplete=false
# Cria usuário admin do zero — sem senha necessária
```

**CVE-2024-27198 — TeamCity**
```http
GET /app/rest/server HTTP/1.1
# Path alternativo bypassa autenticação completamente
# Fixed em 2023.11.4
```

---

## 2. CREDENCIAIS HARDCODED / PADRÃO

| CVE | Produto | CVSS | Credencial Hardcoded | Status |
|-----|---------|------|---------------------|--------|
| CVE-2025-34511 | **Sitecore XP** (Enterprise CMS) | 8.8 | Usuário `sitecore\ServicesAPI`, senha: **`"b"`** (um caractere) | Patched |
| CVE-2025-68926 | **RustFS** (object storage) | **9.8** | Token gRPC estático hardcoded no código-fonte — válido em todos os deploys | Fixed v1.0.0-alpha.78 |
| CVE-2025-8077  | **NeuVector** (Kubernetes security) | Critical | Senha admin padrão fixa para conta built-in (≤5.4.5) | Patched |
| CVE-2025-1393  | **CERT@VDE** industrial devices | Critical | Credenciais hardcoded → acesso admin total sem auth | VDE-2025-021 |
| CVE-2025-32815 | **Infoblox NetMRI** | N/A | Auth bypass via credenciais hardcoded | PoC público (Rhino Security) |
| CVE-2025-13315 | **Twonky Server** 8.5.2 | Critical | API privilegiada vaza credenciais admin criptografadas | ⚠️ **SEM PATCH** |
| CVE-2025-13316 | **Twonky Server** 8.5.2 | Critical | Chaves de criptografia hardcoded → decrypt das credenciais admin | ⚠️ **SEM PATCH** |
| CVE-2024-2420  | **LenelS2 NetBox** (controle físico) | Critical | Credenciais hardcoded no firmware de controle de acesso | Patch >5.6.1 |
| CVE-2024-54085 | **AMI MegaRAC SPx** (BMC firmware) | Critical | Auth bypass por spoofing | CISA KEV |
| CVE-2019-6693  | **Fortinet FortiOS** (legado) | High | Credenciais hardcoded | Adicionado CISA KEV 2025 (legados sem patch!) |
| CVE-2022-40684 | **Fortinet FortiOS/FortiProxy** | **9.8** | Auth bypass na interface de gestão | Patched; PoC público |
| CVE-2023-32302 | **Silverstripe CMS** | Medium | Contas com senha em branco bypassam formulários de login customizados | Patched |

### ⚠️ ATENÇÃO — Sem Patch Ativo
- **CVE-2025-13315 / CVE-2025-13316**: Twonky Server 8.5.2 — fabricante não lançou patch. Sistemas de mídia corporativos/domésticos com esse software permanecem vulneráveis.
- **CVE-2019-6693**: Fortinet legado ainda presente em muitas redes. CISA adicionou ao KEV em 2025 porque ainda há exploração ativa.

---

## 3. JWT / TOKEN BYPASS

| CVE | Biblioteca/Produto | CVSS | Técnica |
|-----|-------------------|------|---------|
| CVE-2026-29000 | **pac4j-jwt** (Java) | **10.0** | PlainJWT bypass: assina com chave pública → `signedJWT=null` → auth aceita sem verificação |
| CVE-2024-48916 | **Ceph RadosGW** OIDC | High | `alg=none` bypass — sem verificação de assinatura |
| CVE-2024-54150 | **cjwt** library | High | Algorithm confusion → chave pública usada como segredo HMAC |
| CVE-2025-29927 (HugeGraph) | **Apache HugeGraph** | — | JWT secret hardcoded → forge tokens arbitrários |

### 🔍 Técnicas JWT Universais (independente de CVE)

```python
# 1. alg=none bypass
# Header: {"alg": "none", "typ": "JWT"}
# Corpo: qualquer payload de admin
# Assinatura: vazia (sem verificar)
token_header = base64.b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip('=')
token_payload = base64.b64encode(b'{"sub":"admin","role":"admin"}').decode().rstrip('=')
token = f"{token_header}.{token_payload}."

# 2. RS256 → HS256 algorithm confusion
# Se servidor usa RS256 com chave pública conhecida,
# assinar com HMAC usando a chave pública como segredo
# Servidor confunde e verifica como HMAC válido

# 3. kid (key ID) injection
# {"kid": "../../dev/null"} → segredo vira string vazia
# {"kid": "x; DROP TABLE keys;--"} → SQLi no kid

# 4. JWK injection
# Incluir no header um JWK customizado → servidor usa sua própria chave enviada pelo atacante
```

---

## 4. SAML / OAuth2 / SSO BYPASS

| CVE | Produto | CVSS | Técnica | Status |
|-----|---------|------|---------|--------|
| CVE-2025-59718 | **Fortinet FortiOS** | Critical | SSO bypass via SAML forgery | ✅ Ativo |
| CVE-2025-59719 | **Fortinet** (outros produtos) | Critical | SSO auth bypass | ✅ Ativo |
| CVE-2025-47949 | **Samlify** (Node.js) | Critical | Signature wrapping — assertions não assinados aceitos | PoC disponível |
| CVE-2025-54982 | **Zscaler SP** | Critical | Verificação de chave pública IdP ausente | Patched |
| CVE-2025-25291 | **ruby-saml** ≤1.17.0 | Critical | Parser differential (Nokogiri vs REXML) → bypass | Fixed v1.18.0 |
| CVE-2025-25292 | **ruby-saml** ≤1.17.0 | Critical | Parser differential (libxml2 canonicalization) | Fixed v1.18.0 |
| CVE-2025-54576 | **OAuth2-Proxy** ≤7.10.0 | **9.1** | Auth bypass via `skip_auth_routes` query param matching | Fixed v7.11.0 |
| CVE-2024-45409 | **ruby-saml** | **9.8** | XML Signature Wrapping (XSW) clássico | Patched |
| CVE-2024-6800  | **GitHub Enterprise Server** | Critical | SAML SSO bypass | Patched |
| CVE-2024-6202  | **HaloITSM** | Critical | Impersonação de usuário via XSW | Patched |
| CVE-2023-40545 | **PingFederate** 11.3 | High | OAuth2 bypass via `client_secret_jwt` craftado | Patched |
| CVE-2022-47966 | **Zoho ManageEngine** | Critical | SAML XML bypass → RCE unauthenticado | Patched; muitos sem patch ainda |

### 🔍 XML Signature Wrapping (XSW) — Conceito
```xml
<!-- Assinatura válida cobre apenas o primeiro elemento -->
<!-- Atacante duplica o elemento fora da assinatura -->
<Response>
  <Assertion ID="legit"> <!-- assinado -->
    <Subject>user@legitimo.com</Subject>
  </Assertion>
  <Assertion ID="fake"> <!-- NÃO assinado, mas processado primeiro -->
    <Subject>admin@sistema.com</Subject>
  </Assertion>
</Response>
```

---

## 5. PASSWORD RESET BYPASS → ACCOUNT TAKEOVER

| CVE | Produto | CVSS | Mecanismo | Auth |
|-----|---------|------|-----------|------|
| CVE-2023-7028  | **GitLab** CE/EE | **10.0** | Reset enviado para email não verificado (atacante controla) | ❌ Nenhuma |
| CVE-2023-42820 | **JumpServer** | Critical | Seed aleatório previsível/vazado para código de reset | ❌ Nenhuma |
| CVE-2025-58434 | **FlowiseAI Flowise** | **9.8** | Token `tempToken` retornado diretamente na resposta da API | ❌ Nenhuma |
| CVE-2025-2746/47 | **Kentico Xperience** | **9.8** | Auth bypass no staging service → takeover completo | ❌ Nenhuma |
| CVE-2024-6914  | **WSO2 API Manager** | Critical | Logic flaw no serviço SOAP de recuperação de conta | ❌ Nenhuma |
| CVE-2024-34077 | **MantisBT** | High | Broken access control em `/account_update.php` via `verify_user_id` | ❌ Nenhuma |
| CVE-2023-51478 | **WordPress Build App Online** plugin | High | Código numérico de 8 dígitos → força bruta trivial | ❌ Nenhuma |

### 🔍 CVE-2023-7028 — GitLab CVSS 10.0 (detalhe)
- Permite takeover **sem interação da vítima**
- Único detalhe: usuários com **2FA ativo** são parcialmente protegidos (senha reseta, mas não loga)
- Introduzido em 16.1.0 (01/05/2023), fix em 16.5.6 / 16.6.4 / 16.7.2
- Muitas instâncias self-hosted ainda sem patch

---

## 6. API ENDPOINT SEM AUTENTICAÇÃO

| CVE | Produto | CVSS | Endpoint Vulnerável | Impact |
|-----|---------|------|-------------------|--------|
| CVE-2025-61928 | **better-auth** (TypeScript) | Critical | `POST /api/auth/api-key/create` | Cria API key para qualquer usuário → MFA bypass → account takeover |
| CVE-2025-34291 | **Langflow** | Critical | CORS/refresh token endpoint | Account takeover + RCE via CSRF chain |
| CVE-2025-4427  | **Ivanti EPMM** | 5.3 | API component (chain com 4428) | Acesso a recursos protegidos sem auth |
| CVE-2025-4428  | **Ivanti EPMM** | 7.2 | EPMM API (pós chain) | RCE quando encadeado com CVE-2025-4427 |
| CVE-2025-58434 | **Flowise** | High | `POST /api/v1/forgot-password` | Token de reset exposto sem auth |
| CVE-2025-53770 | **Microsoft SharePoint** Server | Critical | SharePoint REST API / HTTP | RCE unauthenticado via deserialization ("ToolShell") |
| CVE-2024-23943 | **ICS/Cloud API Devices** | Critical | Cloud API endpoints | Acesso remoto completo sem credenciais |
| CVE-2026-22731 | **Spring Boot Actuator** | High | Actuator endpoints expostos | Acesso sem auth a `/actuator/env`, `/actuator/heapdump` etc. |
| CVE-2026-22733 | **Spring Boot Actuator** | High | Actuator endpoints expostos | Variante do mesmo problema |

---

## 7. MENOS CONHECIDOS / OBSCUROS (MUITOS SEM PATCH)

| CVE | Produto | CVSS | Mecanismo | Patch? |
|-----|---------|------|-----------|--------|
| CVE-2023-27350 | **PaperCut MF/NG** (gestão de impressão) | **9.8** | Auth bypass + execução de script → RCE; ransomware explorou | Patched |
| CVE-2023-27351 | **PaperCut NG/MF** | 8.2 | Improper auth via `SecurityRequestFilter` class | Patched (Lace Tempest) |
| CVE-2022-29464 | **WSO2** API Manager / Identity Server | **9.8** | Upload irrestrito de arquivo → RCE sem auth | Patched; PoC no GitHub |
| CVE-2023-46805 | **Ivanti Connect Secure** VPN | 8.2 | Web component auth bypass via HTTP craftado | Patched; exploração ativa |
| CVE-2024-21893 | **Ivanti Connect Secure** | High | XXE / token invalido → auth bypass + RCE | Patched; atores nation-state |
| CVE-2024-22024 | **Ivanti Connect Secure** | High | Auth bypass adicional (série Ivanti) | Patched |
| CVE-2023-49070 | **Apache OFBiz** (ERP) | Critical | Auth bypass (fix incompleto — predecessor do 2024-45195) | Patched; cuidado com instâncias antigas |
| CVE-2022-47966 | **Zoho ManageEngine** (15+ produtos) | Critical | SAML bypass → RCE unauth | Patched; **muitos sistemas legados sem patch** |
| CVE-2025-13315 | **Twonky Server** 8.5.2 | Critical | Vaza credenciais admin via API privilegiada | ⚠️ **SEM PATCH** |
| CVE-2025-13316 | **Twonky Server** 8.5.2 | Critical | Chaves hardcoded → decrypt admin | ⚠️ **SEM PATCH** |
| CVE-2025-54322 | **XSpeeder/SXZOS** Network Devices | Critical | `eval()` em query params → root RCE; 70k+ hosts | ⚠️ **SEM PATCH no disclosure** |
| CVE-2019-6693  | **Fortinet FortiOS** (legado) | High | Credenciais hardcoded em firmware antigo | Legado sem patch; KEV 2025 |
| CVE-2024-54085 | **AMI MegaRAC SPx** (BMC/IPMI) | Critical | Auth bypass por spoofing em BMC firmware | CISA KEV |

### 🔍 Por que sistemas legados importam
- `CVE-2022-47966` (Zoho ManageEngine): afeta 15+ produtos, muitas empresas usam versões antigas sem equipe de patch
- `CVE-2019-6693` (Fortinet legado): firmware antigo de appliances físicos que nunca foram atualizados — CISA listou em 2025 porque exploração ativa continua
- `CVE-2023-49070` (Apache OFBiz): o fix original estava **incompleto** — sistemas que aplicaram o patch antigo ainda podem ser vulneráveis

---

## 8. SAP / ORACLE / CISCO — CORPORATIVOS

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| CVE-2025-31324 | **SAP NetWeaver** Visual Composer | **10.0** | Upload sem auth → webshell → RCE | ✅ CISA KEV; zero-day |
| CVE-2025-42999 | **SAP NetWeaver** Visual Composer | **9.1** | Insecure deserialization (chain com 31324) | ✅ CISA KEV |
| CVE-2025-61882 | **Oracle E-Business Suite** 12.2.x (BI Publisher) | **9.8** | SSRF + CRLF → RCE pre-auth | ✅ Clop ransomware |
| CVE-2024-21182 | **Oracle WebLogic** Server | Critical | Acesso via T3/IIOP sem credenciais | ✅ Ativo |
| CVE-2025-22457 | **Cisco / Ivanti Connect Secure** | Critical | Stack buffer overflow → RCE | ✅ China-nexus actors |

### 🔍 SAP NetWeaver Chain (mais devastador de 2025)
```
CVE-2025-31324 (upload sem auth) 
  → upload de webshell PHP
  → CVE-2025-42999 (deserialization)  
  → RCE com privileges de "adm"
  → acesso ao banco SAP
  → ransomware / exfiltração completa
```
- Afeta **todos os NetWeaver 7.xx** com Visual Composer instalado
- Endpoint: `/developmentserver/metadatauploader`
- PoC publicado pelo VX Underground (15/08/2025)

---

## 9. SPRING BOOT / FRAMEWORK BYPASSES

| CVE | Produto | CVSS | Endpoint | Impacto |
|-----|---------|------|---------|---------|
| CVE-2026-22731 | **Spring Boot Actuator** | High | `/actuator/*` | Acesso a variáveis de ambiente, heap dump, beans |
| CVE-2026-22733 | **Spring Boot Actuator** | High | `/actuator/*` | Variante — endpoints admin expostos |
| CVE-2022-22965 | **Spring Framework** (Spring4Shell) | **9.8** | Qualquer endpoint com `@RequestMapping` | RCE via ClassLoader manipulation |
| CVE-2022-22950 | **Spring Framework** | High | SpEL expression injection | RCE via expressões Spring |

### 🔍 Spring Boot Actuator — Endpoints mais perigosos sem auth
```bash
/actuator/env          # variáveis de ambiente (senhas, secrets)
/actuator/heapdump     # dump de memória JVM (contém tokens, senhas em memória)
/actuator/loggers      # alterar nível de log
/actuator/mappings     # lista todos os endpoints da aplicação
/actuator/beans        # todos os beans Spring (arquitetura completa)
/actuator/httptrace    # histórico de requisições HTTP
/actuator/shutdown     # DESLIGAR a aplicação (se habilitado)
```

---

## 10. TÉCNICAS DE BYPASS — REFERÊNCIA RÁPIDA

### Por tipo de mecanismo

| Técnica | CVEs Associados | Como Testar |
|---------|-----------------|-------------|
| **Path traversal auth bypass** | CVE-2025-64446, CVE-2024-27199 | Adicionar `/../` antes do endpoint autenticado |
| **Header injection bypass** | CVE-2025-29927 | Adicionar `x-middleware-subrequest: 1` |
| **HTTP request smuggling** | CVE-2025-55315 | CL.TE ou TE.CL com proxy intermediário |
| **alg=none JWT** | CVE-2024-48916 | Trocar header do JWT para `"alg":"none"` |
| **Algorithm confusion RS256→HS256** | CVE-2024-54150 | Usar chave pública como segredo HMAC |
| **XML Signature Wrapping** | CVE-2024-45409, CVE-2025-47949 | Duplicar elemento SAML fora da assinatura |
| **Credential header crafted** | CVE-2025-2825 | `Authorization: Credential=admin/` (sem `~`) |
| **WebSocket alternate path** | CVE-2024-55591 | Node.js WebSocket module em FortiOS |
| **Hardcoded secret token** | CVE-2025-68926 | Token presente no código-fonte do repositório público |
| **Default/blank password** | CVE-2025-34511, CVE-2023-32302 | Testar senhas: `""`, `"b"`, `"admin"`, `"password"` |
| **Predictable reset token** | CVE-2023-42820 | Gerar tokens com mesmo seed, enumerar |
| **Reset token in API response** | CVE-2025-58434 | Chamar forgot-password sem auth, ler resposta |
| **SAML IdP key not verified** | CVE-2025-54982 | Enviar assertion assinado com chave própria |
| **Missing auth check CWE-306** | CVE-2025-3248, CVE-2025-61928 | Chamar endpoints diretamente sem token |
| **eval() in query params** | CVE-2025-54322 | Injetar código em parâmetros de URL |

### Headers úteis para testar bypass
```http
X-Forwarded-For: 127.0.0.1
X-Real-IP: 127.0.0.1
X-Original-URL: /admin
X-Rewrite-URL: /admin
x-middleware-subrequest: 1
Authorization: Credential=admin/
Authorization: Basic YWRtaW46
X-Custom-IP-Authorization: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Remote-Addr: 127.0.0.1
```

### Paths de admin comuns para testar sem auth
```
/admin
/admin/
/admin.php
/admin/login
/administrator
/manage
/management
/actuator
/actuator/env
/actuator/heapdump
/api/v1/admin
/api/admin
/console
/debug
/.env
/server-info.action
/developmentserver/metadatauploader
/api/v1/validate/code
/api/auth/api-key/create
/api/v1/forgot-password
```

---

## 🔗 FONTES E FERRAMENTAS

| Recurso | URL |
|---------|-----|
| CISA KEV Catalog | https://www.cisa.gov/known-exploited-vulnerabilities-catalog |
| NVD Search | https://nvd.nist.gov/vuln/search |
| CVEDetails | https://www.cvedetails.com |
| Gecko Security SQLi DB | https://www.gecko.security/blog/sqli-cve-database |
| Rhino Security PoCs | https://github.com/rhinosecuritylabs/cves |
| SOCRadar CVE | https://socradar.io/blog |
| ZeroPath Blog | https://zeropath.com/blog |
| Vulhub (labs práticos) | https://vulhub.org |
| OWASP Auth Cheatsheet | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html |

---

*Gerado pelo Jarvis — y1n project | 2026-06-03*
*Uso: pentest autorizado + hardening defensivo*
