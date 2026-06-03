# 🔴 CVE DEFACE, INJECTION & WEBSITE TAKEOVER — 2025-2026
> Compilado em: 2026-06-03 | 80+ CVEs de deface, XSS, content injection e takeover
> Uso: Pentest autorizado + Defesa contra defacement

---

## 📊 ÍNDICE

1. [Content Injection / Defacement Direto](#1-content-injection--defacement-direto)
2. [Stored XSS — Defacement Persistente](#2-stored-xss--defacement-persistente)
3. [Reflected XSS — Defacement Temporário](#3-reflected-xss--defacement-temporário)
4. [DOM-Based XSS](#4-dom-based-xss)
5. [HTML / CSS Injection](#5-html--css-injection)
6. [Open Redirect → Phishing/Deface](#6-open-redirect--phishingdeface)
7. [Clickjacking / UI Redressing](#7-clickjacking--ui-redressing)
8. [Subdomain Takeover](#8-subdomain-takeover)
9. [Cache Poisoning / Web Cache Deception](#9-cache-poisoning--web-cache-deception)
10. [Content Spoofing / Fake Content](#10-content-spoofing--fake-content)
11. [Mass Assignment / Parameter Tampering](#11-mass-assignment--parameter-tampering)
12. [Broken Access Control / IDOR → Deface](#12-broken-access-control--idor--deface)
13. [cPanel / CMS Mass Defacement](#13-cpanel--cms-mass-defacement)
14. [Checklist Anti-Deface](#14-checklist-anti-deface)

---

## 1. CONTENT INJECTION / DEFACEMENT DIRETO

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-64095** | DNN Platform < 10.1.1 | **Critical** | Unauthenticated File Upload → Overwrite any file | ✅ Patched |
| **CVE-2025-52691** | SmarterMail ≤ 9406 | **Critical** | Insecure File Upload → Web Shell | ✅ Patched |
| **CVE-2025-62796** | PrivateBin 1.7.7–2.0.1 | **5.8** | Persistent HTML Injection via attachment_name | ✅ Patched |
| **CVE-2026-26000** | XWiki (all versions) | **Medium** | CSS Injection via Comments → Clickjacking | ⚠️ Parcial |
| **CVE-2025-36918** | Windows MSHTML Engine | **Critical** | Use-After-Free / RCE via HTML/CSS | ✅ Patched |
| **CVE-2025-58196** | UiCore Elements WP ≤ 1.3.4 | **6.5** | Stored XSS → Deface + SEO Poisoning | ✅ Patched |
| **CVE-2026-41940** | cPanel | **Critical** | Auth Bypass → Mass Defacement Campaign | 🔴 Ativo |

---

## 2. STORED XSS — DEFACEMENT PERSISTENTE

| CVE | Produto | CVSS | Tipo | Acesso Necessário |
|-----|---------|------|------|------------------|
| **CVE-2026-44212** | PrestaShop | **9.3** | Stored XSS via email field | ❌ Unauthenticated |
| **CVE-2026-2030** | WPBakery Livemesh Addons ≤ 3.9.4 | **High** | Stored XSS via shortcode attributes | 👤 Contributor+ |
| **CVE-2025-14803** | NEX-Forms WP < 9.1.8 | **High** | Stored XSS em form settings | 👤 Subscriber+ |
| **CVE-2025-13031** | WPeMatico RSS < 2.8.13 | **High** | Stored XSS em plugin settings | 👤 Contributor+ |
| **CVE-2025-62796** | PrivateBin 1.7.7–2.0.1 | **5.8** | Persistent HTML Injection | ❌ Unauthenticated |
| **CVE-2025-54057** | Apache SkyWalking ≤ 10.2.0 | **Critical** | Stored XSS em dashboards | ❌ Unauthenticated |
| **CVE-2026-3005** | WP List Category Posts ≤ 0.94.0 | **Medium** | Stored XSS via catlist shortcode | 👤 Contributor |
| **CVE-2025-66412** | Angular (EOL) | **High** | Stored XSS via SVG/MathML | 👤 Usuário |
| **CVE-2026-22610** | Angular Compiler | **High** | Stored XSS → Session Hijack | 👤 Usuário |
| **CVE-2026-42897** | Microsoft Exchange | **Critical** | Server-side XSS | 👤 Autenticado |
| **CVE-2025-58196** | UiCore Elements WP ≤ 1.3.4 | **6.5** | Stored XSS → SEO Poisoning | 👤 Contributor |
| **CVE-2025-50001** | tagDiv Composer ≤ 5.4.2 | **High** | Reflected/Stored XSS | ❌ Unauthenticated |
| **CVE-2026-9485** | SourceCodester Student Grades | **5.1** | Stored XSS via Remarks param | ❌ Unauthenticated |
| **CVE-2025-24771** | WP Content Manager Light | **Medium** | Reflected XSS → Deface | ❌ Unauthenticated |
| **Endian Firewall ≤ 3.3.25** | Endian Firewall | **High** | Multiple Stored XSS (remark, cert) | 👤 Autenticado |
| **XenForo < 2.3.10** | XenForo | **High** | Stored XSS via mentions/BB code | 👤 Usuário |

---

## 3. REFLECTED XSS — DEFACEMENT TEMPORÁRIO

| CVE | Produto | CVSS | Tipo | Interação |
|-----|---------|------|------|------------|
| **CVE-2026-48209** | OTRS / ((OTRS)) CE 7.0.x | **7.1** | Reflected XSS via ticket action URLs | 👤 Autenticado |
| **CVE-2026-30841** | Wallos < 4.6.2 | **Medium** | Reflected XSS em passwordreset.php | ❌ Requer click |
| **CVE-2025-69384** | Timeline Event History WP | **Medium** | Reflected XSS via URL | ❌ Phishing click |
| **CVE-2025-32625** | Mobile Pages WP (pootlepress) | **Medium** | Reflected XSS via URL/form | ❌ Requer click |
| **CVE-2026-7660** | Easy Updates Manager ≤ 9.0.20 | **Medium** | Reflected XSS em admin pagination | 👤 Admin |
| **CVE-2025-12684** | URL Shortify WP < 1.11.3 | **Medium** | Reflected XSS targeting admins | ❌ Requer click |
| **CVE-2025-50001** | tagDiv Composer ≤ 5.4.2 | **High** | Reflected XSS → Deface | ❌ Requer click |
| **CVE-2025-24771** | WP Content Manager Light | **Medium** | Reflected XSS → Deface | ❌ Unauthenticated |
| **CVE-2025-61886** | FortiSandbox | **Medium** | Reflected XSS Operation Center | 👤 Autenticado |
| **CVE-2025-4123** | Grafana | **Medium** | Open Redirect → XSS chaining | ❌ Várias |

---

## 4. DOM-BASED XSS

| CVE | Produto | CVSS | Tipo | Acesso |
|-----|---------|------|------|--------|
| **GroupOffice < 6.8.119 / 25.0.20** | GroupOffice | **High** | DOM + Stored Blind XSS | ❌ Unauthenticated |
| **CVE-2025-66035** | Angular | **High** | XSRF Token Leak via protocol-relative | ❌ Usuário |
| **CVE-2025-59052** | Angular SSR | **High** | Data Leak via race condition | ❌ Usuário |

---

## 5. HTML / CSS INJECTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-62796** | PrivateBin 1.7.7–2.0.1 | **5.8** | HTML Injection via attachment_name | ✅ Patched |
| **CVE-2026-26000** | XWiki (all versions) | **Medium** | CSS Injection via Comments | ⚠️ Parcial |
| **CVE-2025-2336** | AngularJS ngSanitize | **Medium** | SVG image bypass → Content Spoofing | ✅ Patched |
| **CVE-2026-48843** | Roundcube Webmail | **7.2** | CSS injection via email → SSRF | ✅ Patched |
| **CVE-2025-62459** | Microsoft Defender Portal | **8.3** | UI Spoofing → Fake alerts | ✅ Patched |
| **CVE-2025-65046** | Microsoft Edge Desktop | **Medium** | Fake Permission Prompts | ✅ Patched |
| **CVE-2025-62224** | Microsoft Edge Android | **Medium** | Omnibox Spoofing → Fake domain | ✅ Patched |

---

## 6. OPEN REDIRECT → PHISHING/DEFACE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2026-34931** | Hoppscotch < 2026.3.0 | **High** | Open Redirect → Token Theft / ATO | ✅ Patched |
| **CVE-2026-21879** | Kanboard ≤ 1.2.48 | **Medium** | Protocol-relative URL bypass (`//evil.com`) | ✅ Patched |
| **CVE-2026-5467** | Casbin Casdoor 2.356.0 | **Medium** | OAuth redirect_uri bypass | ⚠️ **Unpatched** |
| **CVE-2026-25477** | AFFiNE | **Medium** | Regex whitelist bypass | ⚠️ **Unpatched** |
| **CVE-2026-40575** | OAuth2 Proxy | **High** | Auth bypass via header forgery | ⚠️ **Unpatched** |
| **CVE-2026-44551** | Open WebUI < 0.9.0 | **9.1** | LDAP empty password → Auth Bypass | ✅ Patched |
| **CVE-2025-4123** | Grafana | **Medium** | Open Redirect → SSRF / ATO | ✅ Patched |
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT + Open Redirect bypass | ✅ Patched |

---

## 7. CLICKJACKING / UI REDRESSING

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2026-24839** | Dokploy < 0.26.6 | **Medium** | Missing X-Frame-Options → Clickjacking | ✅ Patched |
| **CVE-2025-43854** | DIFY AI Platform | **Medium** | Default setup lacks X-Frame-Options | ⚠️ Advisory |
| **CVE-2025-6983** | TP-Link Archer C1200 | **Medium** | Router admin clickjacking | ❌ No patch |
| **CVE-2025-49192** | Vários (CWE-1021) | **Medium** | Improper restriction of rendered UI frames | ✅ Mitigations |
| **WeGIA ≤ 3.6.1** | WeGIA | **Medium** | Full missing-header exposure | ✅ Patched |
| **CVE-2026-26000** | XWiki | **Medium** | CSS Injection → Clickjacking | ⚠️ Parcial |
| **DoubleClickjacking** | Várias plataformas | **High** | Novo bypass de X-Frame-Options | 🔴 2025 |
| **DOM-Based Extension** | 11 Password Managers | **High** | Extension clickjacking → Credential theft | 🔴 DEF CON 33 |

---

## 8. SUBDOMAIN TAKEOVER

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-51591** | AWS IMDS | **Critical** | SSRF → Subdomain takeover via metadata | ✅ Patched |
| **CVE-2025-54381** | BentoML | **Critical** | SSRF via file upload → Subdomain takeover | ✅ Patched |
| **CVE-2025-40778** | BIND 9 DNS | **8.6** | DNS Cache Poisoning → Subdomain hijack | ✅ Patched |
| **CVE-2025-57752** | Next.js Image Optimization | **Critical** | Cache Deception → Subdomain compromise | ✅ Patched |
| **CVE-2026-34931** | Hoppscotch | **High** | Open Redirect → Subdomain takeover | ✅ Patched |

---

## 9. CACHE POISONING / WEB CACHE DECEPTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-57752** | Next.js Image Optimization | **Critical** | Cache Deception → Auth Bypass | ✅ Patched |
| **CVE-2025-40778** | BIND 9 DNS | **8.6** | DNS Cache Poisoning | ✅ Patched |
| **CVE-2025-54057** | Apache SkyWalking | **Critical** | Stored XSS → Cache poisoning | ✅ Patched |
| **CVE-2025-64095** | DNN Platform | **Critical** | File upload → Cache poisoning | ✅ Patched |
| **CVE-2026-26138** | Microsoft Purview | **High** | SSRF → Cache poisoning | ✅ Patched |

---

## 10. CONTENT SPOOFING / FAKE CONTENT

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-62459** | Microsoft Defender Portal | **8.3** | Fake alerts, falsified status | ✅ Patched |
| **CVE-2025-65046** | Microsoft Edge Desktop | **Medium** | Fake Permission Prompts | ✅ Patched |
| **CVE-2025-62224** | Microsoft Edge Android | **Medium** | Fake domain display (Omnibox) | ✅ Patched |
| **CVE-2025-24771** | WP Content Manager Light | **Medium** | Reflected XSS → Content Spoofing | ✅ Patched |
| **CVE-2026-3005** | WP List Category Posts | **Medium** | Stored XSS → Fake Content | ✅ Patched |
| **CVE-2025-2336** | AngularJS ngSanitize | **Medium** | SVG image bypass → Spoofing | ✅ Patched |
| **CVE-2026-41940** | cPanel | **Critical** | Mass defacement + fake content | 🔴 Ativo |

---

## 11. MASS ASSIGNMENT / PARAMETER TAMPERING

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-29927** | Next.js (< patch) | **Critical** | Header injection → middleware bypass | ⚠️ Limitado |
| **CVE-2025-55315** | ASP.NET Core | **9.9** | HTTP Request Smuggling | ⚠️ Não confirmado |
| **CVE-2025-58060** | OpenPrinting CUPS | **High** | AuthType mismatch → sem senha | ⚠️ Não confirmado |
| **CVE-2025-64095** | DNN Platform | **Critical** | File upload bypass → Overwrite | ✅ Patched |
| **CVE-2025-4123** | Grafana | **Medium** | Parameter tampering → Open Redirect | ✅ Patched |

---

## 12. BROKEN ACCESS CONTROL / IDOR → DEFACE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-64446** | Fortinet FortiWeb | **9.8** | Path traversal → Admin creation | ✅ CISA KEV |
| **CVE-2025-57819** | FreePBX | **Critical** | Auth Bypass → SQLi → RCE | ✅ CISA KEV |
| **CVE-2025-2825** | CrushFTP | **Critical** | Credential=username/ → sem senha | ✅ Ativo |
| **CVE-2026-41940** | cPanel | **Critical** | Auth Bypass → Mass defacement | 🔴 Ativo |
| **CVE-2025-59718** | Fortinet | **9.8** | SSO Signature Bypass | ✅ Zero-day |
| **CVE-2026-44551** | Open WebUI < 0.9.0 | **9.1** | LDAP empty password bypass | ✅ Patched |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP bypass | ✅ Patched |
| **CVE-2026-34460** | NamelessMC | **Medium** | Login CSRF via OAuth state | ✅ Patched |
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT signature bypass | ✅ Patched |
| **CVE-2019-25249** | devolo dLAN | **8.7** | CSRF → Auth Bypass → Root | ✅ Publicado |
| **CVE-2025-13915** | IBM API Connect | **9.8** | API auth bypass | ⚠️ Não confirmado |
| **CVE-2025-0108** | Palo Alto PAN-OS | **~9.3** | Auth Bypass → PHP invocation | ✅ Chained |
| **CVE-2024-55591** | FortiOS / FortiProxy | **9.6** | WebSocket → Super-Admin | ✅ Ativo |
| **CVE-2024-21182** | Oracle WebLogic | **Critical** | Unauth network access | ✅ Ativo |
| **CVE-2025-62221** | Windows Cloud Files | **High** | Use-after-free → SYSTEM | 🔴 CISA KEV |

---

## 13. cPANEL / CMS MASS DEFACEMENT

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2026-41940** | cPanel | **Critical** | Auth Bypass → Mass Defacement | 🔴 Multi-actor |
| **CVE-2025-64095** | DNN Platform | **Critical** | Unauth File Upload → Overwrite | ✅ Patched |
| **CVE-2025-52691** | SmarterMail | **Critical** | Upload → Web Shell → Mass Deface | ✅ Patched |
| **CVE-2025-58196** | UiCore Elements WP | **6.5** | Stored XSS → SEO Poisoning | ✅ Patched |
| **CVE-2026-44212** | PrestaShop | **9.3** | Stored XSS → Admin Takeover | ✅ Patched |
| **CVE-2025-24771** | WP Content Manager Light | **Medium** | Reflected XSS → Deface | ✅ Patched |
| **CVE-2026-3005** | WP List Category Posts | **Medium** | Stored XSS → Deface | ✅ Patched |
| **CVE-2025-50001** | tagDiv Composer | **High** | Reflected/Stored XSS | ⚠️ No patch |
| **CVE-2025-62796** | PrivateBin | **5.8** | HTML Injection → Deface | ✅ Patched |
| **CVE-2025-54057** | Apache SkyWalking | **Critical** | Stored XSS → Dashboard Deface | ✅ Patched |
| **CVE-2026-26000** | XWiki | **Medium** | CSS Injection → Page manipulation | ⚠️ Parcial |
| **CVE-2025-36918** | Windows MSHTML | **Critical** | RCE via HTML/CSS → System takeover | ✅ Patched |

---

## 14. CHECKLIST ANTI-DEFACE

### Prevenção de XSS
- [ ] Encode TODAS as saídas de dados do usuário antes de renderizar em HTML
- [ ] Implementar CSP (Content-Security-Policy) com `default-src 'self'`
- [ ] Usar `HttpOnly` e `Secure` em cookies de sessão
- [ ] Validar entrada no servidor — NUNCA confiar apenas em client-side
- [ ] Usar bibliotecas de sanitização como DOMPurify
- [ ] Auditar shortcodes e plugins de WordPress regularmente
- [ ] Implementar WAF com regras para `<script>`, `onerror=`, `javascript:`

### Prevenção de File Upload → Deface
- [ ] Validar MIME type e extensão do arquivo no servidor
- [ ] Renomear arquivos com nomes aleatórios
- [ ] Desativar execução de scripts em diretórios de upload
- [ ] Usar storage separado para uploads (S3/Cloud)
- [ ] Implementar anti-virus scan em uploads

### Prevenção de Cache Poisoning
- [ ] Respeitar headers `Cache-Control: no-store` / `private`
- [ ] Cachear por Content-Type, não por extensão de URL
- [ ] Retornar 404/302 para paths inexistentes
- [ ] Normalizar URLs consistentemente entre CDN e origin
- [ ] Auditar regras de cache CDN (Cloudflare/Fastly/Akamai)

### Prevenção de Clickjacking
- [ ] Usar `X-Frame-Options: DENY` ou `SAMEORIGIN`
- [ ] Implementar CSP `frame-ancestors 'none'`
- [ ] Usar `SameSite=Strict` em cookies
- [ ] Implementar JavaScript frame-busters
- [ ] Proteger contra DoubleClickjacking (novo bypass 2025)

### Prevenção de Open Redirect
- [ ] Validar `redirect_uri` contra allowlist server-side
- [ ] Bloquear URLs protocol-relative (`//evil.com`)
- [ ] Usar `^` e `$` anchors em regex de validação
- [ ] Rejeitar redirects para domínios externos
- [ ] Implementar token de redirect assinado

### Prevenção de Content Spoofing
- [ ] Sanitizar TODOS inputs antes de renderizar
- [ ] Usar headers `Content-Type` corretos
- [ ] Implementar `X-Content-Type-Options: nosniff`
- [ ] Validar origem de mensagens postMessage
- [ ] Configurar CORS restritivamente

### Prevenção de Subdomain Takeover
- [ ] Auditar DNS records regularmente (subdomain enumeration)
- [ ] Remover registros DNS apontando para serviços deletados
- [ ] Monitorar expiração de domínios
- [ ] Usar CNAME flattening quando possível
- [ ] Implementar monitoring de subdomains suspeitos

### Prevenção de Mass Assignment
- [ ] Usar allowlist de campos permitidos
- [ ] Nunca expor campos sensíveis em APIs
- [ ] Validar permissões antes de atualizar registros
- [ ] Implementar rate limiting em endpoints de atualização
- [ ] Usar DTOs (Data Transfer Objects) para input

---

## 📈 ESTATÍSTICAS DE DEFACE 2025-2026

- **6.29 bilhões** de ataques a websites em 2025 (+56% YoY)
- **131 CVEs novos por dia** — median time to exploit < 5 dias
- **21,500+ CVEs** em H1 2025 — recorde histórico
- **28%** dos exploits lançados no mesmo dia da divulgação
- **XSS, SQLi, Deserialization** dominam — ~10,000 CVEs em 2025
- **48,174 CVEs** publicados em 2025 — maior volume já registrado

---

> **Fontes:** NVD, CISA KEV, SOCRadar, ZeroPath, SentinelOne, Invicti, PortSwigger, OWASP, WP-Firewall, Security Boulevard, The Hacker Wire, Microsoft Security Blog, Indusface

> **Total: 80+ CVEs de deface, XSS, content injection e website takeover**
