# 🔴 CVE MASTER COMPLETO — 2025-2026
> Compilado em: 2026-06-03 | 100+ CVEs catalogados
> Uso: Pentest autorizado + Hardening defensivo

---

## 📊 ÍNDICE GERAL

1. [OTP / 2FA Bypass](#1-otp--2fa-bypass)
2. [Shell / RCE / Command Injection](#2-shell--rce--command-injection)
3. [Auth Bypass (Login Sem Senha)](#3-auth-bypass-login-sem-senha)
4. [Session Hijacking / JWT Bypass](#4-session-hijacking--jwt-bypass)
5. [CSRF / Cross-Site Request Forgery](#5-csrf--cross-site-request-forgery)
6. [SSRF — Server-Side Request Forgery](#6-ssrf--server-side-request-forgery)
7. [XXE — XML External Entity](#7-xxe--xml-external-entity)
8. [Deserialization RCE](#8-deserialization-rce)
9. [Buffer Overflow / Memory Corruption](#9-buffer-overflow--memory-corruption)
10. [Privilege Escalation (Windows/Linux)](#10-privilege-escalation-windowslinux)
11. [SQL Injection / Blind SQLi](#11-sql-injection--blind-sqli)
12. [File Upload → Web Shell / RCE](#12-file-upload--web-shell--rce)
13. [Cloud / Container Escape](#13-cloud--container-escape)
14. [Web Cache Deception](#14-web-cache-deception)
15. [Supply Chain / Dependency Confusion](#15-supply-chain--dependency-confusion)
16. [MITM / TLS Bypass](#16-mitm--tls-bypass)
17. [GraphQL / API Injection](#17-graphql--api-injection)
18. [Spring / Java RCE](#18-spring--java-rce)
19. [Top Exploitados CISA KEV 2025](#19-top-exploitados-cisa-kev-2025)
20. [Checklist de Hardening](#20-checklist-de-hardening)

---

## 1. OTP / 2FA BYPASS

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-32433** | Erlang/OTP SSH Server | **10.0** | Auth Bypass → RCE | ✅ PoC Public |
| **CVE-2026-28808** | Erlang OTP inets | **High** | Auth Bypass via path mismatch | ✅ Patched |
| **CVE-2025-8342** | WooCommerce OTP Login | **Critical** | OTP Verification Bypass (empty) | ✅ Patched |
| **CVE-2025-12374** | WordPress User Verification | **Critical** | Empty OTP → Admin Takeover | ✅ Patched |
| **CVE-2025-9967** | Orion SMS OTP (WordPress) | **High** | Privilege Escalation via Account Takeover | ✅ Patched |
| **CVE-2025-4094** | Digits WordPress Plugin | **9.8** | OTP Brute Force (no rate limit) | ✅ Patched |
| **CVE-2025-60424** | Nagios Fusion | **High** | OTP Brute Force (no rate limit) | ✅ Patched |
| **CVE-2026-24038** | Horilla HRMS | **High** | Flawed OTP Equality Check → 2FA Bypass | ✅ Patched |
| **CVE-2025-66489** | Cal.com | **High** | TOTP logic flaw → pula verificação | ⚠️ Limitado |

---

## 2. SHELL / RCE / COMMAND INJECTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-55182** | React2Shell (Next.js/React) | **10.0** | Deserialization → RCE | ✅ Exploited |
| **CVE-2025-37164** | HPE OneView | **10.0** | REST API → RCE | ✅ CISA KEV |
| **CVE-2026-1281** | Ivanti EPMM | **Critical** | Command Injection | ✅ Patched |
| **CVE-2026-1340** | Ivanti EPMM | **Critical** | Command Injection | ✅ Patched |
| **CVE-2026-0625** | D-Link DSL Routers | **Critical** | `dnscfg.cgi` shell injection | ⚠️ EoL (no patch) |
| **CVE-2026-9277** | `shell-quote` npm (214M+ downloads) | **Critical** | `\n` newline bypass → command injection | ✅ Patched |
| **CVE-2026-26832** | `node-tesseract-ocr` npm | **9.8** | `child_process.exec()` path injection | ⚠️ Unpatched |
| **CVE-2025-59536** | Anthropic Claude Code | **Critical** | Hook config → MCP shell execution | ✅ Patched |
| **CVE-2026-21852** | Anthropic Claude Code | **Critical** | API key exfiltration via env | ✅ Patched |
| **CVE-2025-54469** | NeuVector | **10.0** | Env variable command injection | ✅ Patched |
| **CVE-2026-20131** | Cisco FMC | **Critical** | HTTP → arbitrary Java as root | ⚠️ Exploited |
| **CVE-2025-68613** | n8n workflow | **9.9** | Expression injection / eval | ✅ Patched |
| **CVE-2025-11953** | React Native CLI | **9.8** | Dev server OS command execution | ✅ Patched |
| **CVE-2026-25592** | Microsoft Semantic Kernel | **Critical** | Prompt injection → RCE | ✅ Patched |
| **CVE-2026-26030** | Microsoft Semantic Kernel | **Critical** | `eval()` sink via prompt injection | ✅ Patched |
| **CVE-2025-65791** | ZoneMinder v1.36.34 | **Critical** | PHP `exec()` shell metachar injection | ⚠️ Unpatched |
| **CVE-2025-1974** | IngressNightmare (K8s) | **Critical** | Annotation injection → pod RCE | ✅ Patched |
| **CVE-2025-52691** | SmarterMail | **Critical** | Malicious upload → web shell | ✅ Patched |
| **CVE-2025-3248** | Langflow (Flask) | **10.0** | `exec()` injection | ✅ Patched |
| **CVE-2025-55182** | Flask 3.0.0 | **9.8** | cmd injection + pickle + yaml | ✅ Patched |
| **CVE-2026-3854** | GitHub Enterprise Server | **Critical** | Command injection via git push | ✅ Patched |
| **CVE-2026-41089** | Windows Netlogon | **9.8** | RCE | 🔴 Actively exploited |
| **CVE-2026-0300** | Palo Alto PAN-OS | **Critical** | Buffer Overflow → RCE root | 🔴 Actively exploited |
| **CVE-2025-15467** | OpenSSL 3.x | **9.8** | Stack Overflow → RCE | ⚠️ PoC reproduced |
| **CVE-2026-2005** | PostgreSQL pgcrypto | **High** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2026-37541** | OVMS3 | **10.0** | Buffer Overflow → DoS/RCE | ✅ Patched |
| **CVE-2026-0006** | (Multiple) | **9.8** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2026-10292** | UTT HiPER 1200GW | **8.8** | Stack Overflow (public exploit) | 🔴 Public PoC |
| **CVE-2025-22457** | Ivanti Connect Secure | **Critical** | Stack Overflow → RCE | 🔴 APT (Silk Typhoon) |
| **CVE-2026-23918** | Apache HTTP Server | **Critical** | Double-free → RCE | ✅ Patched |
| **CVE-2026-8179** | IBM Aspera | **8.8** | Buffer Overflow → RCE | ❌ No PoC |
| **CVE-2026-0059** | Android Bluetooth | **8.0** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2025-34069** | Werkzeug Debugger | **9.0** | RCE via CSRF + PIN bypass | ✅ Patched |
| **CVE-2025-24813** | Apache Tomcat | **9.8** | Path equivalence → deserialization RCE | ✅ Patched |
| **CVE-2025-66516** | Apache Tika | **10.0** | XXE → SSRF + RCE via PDF | 🔴 Crítico |
| **CVE-2025-53770/71** | Microsoft SharePoint | **9.8** | Unauth RCE via deserialization | ✅ Nation-state |

---

## 3. AUTH BYPASS (LOGIN SEM SENHA)

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-64446** | Fortinet FortiWeb WAF | **9.8** | Path traversal → admin creation | ✅ CISA KEV |
| **CVE-2024-55591** | FortiOS / FortiProxy | **9.6** | WebSocket → Super-Admin | ✅ Ativo |
| **CVE-2025-0108** | Palo Alto PAN-OS | **~9.3** | Auth Bypass → PHP invocation | ✅ Chained |
| **CVE-2025-29927** | Next.js (< patch) | **Critical** | Header injection → middleware bypass | ⚠️ Limitado |
| **CVE-2025-2825 / CVE-2025-31161** | CrushFTP | **Critical** | `Credential=username/` → sem senha | ✅ Ativo |
| **CVE-2025-57819** | FreePBX (Sangoma) | **Critical** | Auth Bypass → SQLi → RCE | ✅ CISA KEV |
| **CVE-2025-13915** | IBM API Connect | **9.8** | Bypass auth → API access | ⚠️ Não confirmado |
| **CVE-2025-55315** | ASP.NET Core | **9.9** | HTTP Request Smuggling | ⚠️ Não confirmado |
| **CVE-2025-58060** | OpenPrinting CUPS | **High** | AuthType mismatch → sem senha | ⚠️ Não confirmado |
| **CVE-2024-21182** | Oracle WebLogic | **Critical** | Unauth network access | ✅ Ativo |
| **CVE-2025-59718 / CVE-2025-59719 / CVE-2026-24858** | Fortinet (all products) | **9.8** | SSO Signature Bypass | ✅ Zero-day wild |

---

## 4. SESSION HIJACKING / JWT BYPASS

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT signature bypass + CSRF | ✅ Patched |
| **CVE-2026-34460** | NamelessMC | **Medium** | Login CSRF via OAuth state | ✅ Patched |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP bypass | ✅ Patched |
| **CVE-2026-3857** | GitLab CE/EE | **TBD** | CSRF (unauthenticated remote) | ⚠️ Listed |
| **CVE-2019-25249** | devolo dLAN | **8.7** | CSRF → Auth Bypass → Root Shell | ✅ Publicado |
| **CVE-2026-28808** | Erlang OTP inets | **High** | Auth Bypass via path mismatch | ✅ Patched |

---

## 5. CSRF / CROSS-SITE REQUEST FORGERY

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-2825 / CVE-2025-31161** | CrushFTP | **9.8** | Auth Bypass via CSRF | ✅ PoC |
| **CVE-2025-59718 / CVE-2025-59719** | Fortinet | **9.8** | SSO Auth Bypass (CSRF element) | ✅ Wild |
| **CVE-2026-3857** | GitLab CE/EE | **TBD** | Unauthenticated Remote CSRF | ⚠️ Listed |
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT + CSRF Bypass | ✅ Patched |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP | ✅ Patched |
| **CVE-2026-34460** | NamelessMC | **Medium** | Login CSRF (OAuth state) | ✅ Patched |
| **CVE-2019-25249** | devolo dLAN | **8.7** | CSRF → Root Access | ✅ Publicado |

---

## 6. SSRF — SERVER-SIDE REQUEST FORGERY

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-53767** | Azure OpenAI | **10.0** | SSRF → privilege escalation | ✅ Patched |
| **CVE-2025-61884** | Oracle E-Business Suite | **Critical** | SSRF (Cl0p ransomware) | 🔴 Actively exploited |
| **CVE-2025-47733** | Microsoft Power Apps | **High** | SSRF → info disclosure | ✅ Patched |
| **CVE-2025-29972** | Azure Storage | **Critical** | SSRF → spoofing | ✅ Patched |
| **CVE-2026-26138** | Microsoft Purview | **High** | SSRF → privilege elevation | ✅ Patched |
| **CVE-2026-33626** | LMDeploy (AI/VLM) | **7.5** | SSRF → cloud metadata (13h exploit) | ✅ Patched |
| **CVE-2026-48843** | Roundcube Webmail | **7.2** | SSRF via CSS email | ✅ Patched |
| **CVE-2025-57822** | Next.js | **High** | SSRF via middleware | ✅ Patched |
| **CVE-2025-1220** | PHP 8.x | **High** | SSRF via null-byte `fsockopen()` | ✅ Patched |
| **CVE-2025-51591** | AWS IMDS | **Critical** | SSRF → roubo IAM creds | ✅ Patched |
| **CVE-2025-54381** | BentoML | **Critical** | SSRF via file upload | ✅ Patched |
| **CVE-2024-46805** | Ivanti Connect Secure | **High** | SSRF no SAML | ✅ Ativo |
| **CVE-2025-2775/76** | SysAid | **High** | XXE → SSRF | ✅ CISA KEV |
| **CVE-2025-58360** | GeoServer | **High** | XXE → SSRF + file read | ✅ KEV |
| **CVE-2025-61882** | Oracle E-Business | **9.8** | SSRF + CRLF → RCE | ✅ Clop ransomware |
| **CVE-2025-66516** | Apache Tika | **10.0** | XXE → SSRF + RCE via PDF | 🔴 Crítico |
| **CVE-2022-45868** | H2 console | **High** | SSRF | ✅ Patched |

---

## 7. XXE — XML EXTERNAL ENTITY

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-66516** | Apache Tika | **10.0** | XXE → SSRF + RCE via PDF | 🔴 Crítico |
| **CVE-2025-2775/76** | SysAid | **High** | XXE → SSRF | ✅ CISA KEV |
| **CVE-2025-58360** | GeoServer | **High** | XXE → SSRF + file read | ✅ KEV |
| **CVE-2026-48843** | Roundcube Webmail | **7.2** | XXE-like via CSS email | ✅ Patched |

---

## 8. DESERIALIZATION RCE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-55182** | React2Shell (Next.js) | **10.0** | Deserialization → RCE | ✅ Exploited |
| **CVE-2025-24813** | Apache Tomcat | **9.8** | Path equivalence → deserialization RCE | ✅ Patched |
| **CVE-2025-53770/71** | Microsoft SharePoint | **9.8** | Unauth RCE via deserialization | ✅ Nation-state |
| **CVE-2026-23918** | Apache HTTP Server | **Critical** | Double-free (deserialization-like) | ✅ Patched |
| **CVE-2025-3248** | Langflow (Flask) | **10.0** | `exec()` injection | ✅ Patched |
| **CVE-2025-55182** | Flask 3.0.0 | **9.8** | Pickle + yaml deserialization | ✅ Patched |

---

## 9. BUFFER OVERFLOW / MEMORY CORRUPTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2026-41089** | Windows Netlogon | **9.8** | Buffer Overflow → RCE | 🔴 Actively exploited |
| **CVE-2026-0300** | Palo Alto PAN-OS | **Critical** | Buffer Overflow → RCE root | 🔴 Actively exploited |
| **CVE-2025-15467** | OpenSSL 3.x | **9.8** | Stack Overflow → RCE | ⚠️ PoC reproduced |
| **CVE-2026-2005** | PostgreSQL pgcrypto | **High** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2026-37541** | OVMS3 | **10.0** | Buffer Overflow → DoS/RCE | ✅ Patched |
| **CVE-2026-0006** | (Multiple) | **9.8** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2026-10292** | UTT HiPER 1200GW | **8.8** | Stack Overflow (public exploit) | 🔴 Public PoC |
| **CVE-2025-22457** | Ivanti VPN | **Critical** | Stack Overflow → RCE | 🔴 APT (Silk Typhoon) |
| **CVE-2026-23918** | Apache HTTP Server | **Critical** | Double-free → RCE | ✅ Patched |
| **CVE-2026-8179** | IBM Aspera | **8.8** | Buffer Overflow → RCE | ❌ No PoC |
| **CVE-2026-0059** | Android Bluetooth | **8.0** | Heap Overflow → RCE | ✅ Patched |
| **CVE-2026-28780** | Apache HTTP Server | **High** | Heap Overflow in mod_proxy_ajp | ✅ Patched |
| **CVE-2026-40407** | Windows CLFS Driver | **8.4** | Heap Overflow → SYSTEM | ✅ Patched |
| **CVE-2025-62221** | Windows Cloud Files | **High** | Use-after-free → SYSTEM | 🔴 CISA KEV |
| **CVE-2025-55680** | Windows Cloud Files | **High** | TOCTOU race → SYSTEM | ✅ Patched |
| **CVE-2025-62215** | Windows Kernel | **7.8** | Race condition + Double Free | 🔴 Actively exploited |
| **CVE-2025-62467** | Windows ProjFS | **7.8** | Integer overflow → SYSTEM | ✅ Patched |
| **CVE-2025-60710** | Windows Tasks | **High** | Symlink TOCTOU → SYSTEM | ✅ Patched |
| **CVE-2025-23358** | NVIDIA App | **8.2** | Search path → elevated | ✅ Patched |
| **CVE-2025-8069** | AWS Client VPN | **7.8** | Hardcoded writable path | ✅ Patched |
| **CVE-2025-29824** | Windows CLFS | **High** | EoP → SYSTEM | 🔴 Ransomware |
| **CVE-2025-32701** | Windows CLFS | **High** | EoP → SYSTEM | 🔴 Ransomware |
| **CVE-2025-32706** | Windows CLFS | **High** | EoP → SYSTEM | 🔴 Ransomware |
| **CVE-2024-49138** | Windows CLFS | **High** | EoP → SYSTEM | 🔴 Ransomware |
| **CVE-2025-30400** | Windows | **High** | EoP → SYSTEM | 🔴 Vários |
| **CVE-2025-32709** | Windows afd.sys | **7.8** | EoP → SYSTEM | 🔴 Vários |
| **CVE-2025-59230** | Windows RasMan | **7.8** | EoP → SYSTEM | 🔴 Desconhecido |
| **CVE-2025-62221** | Windows Cloud Files | **7.8** | EoP → SYSTEM | 🔴 CISA KEV |

---

## 10. PRIVILEGE ESCALATION (WINDOWS/LINUX)

### Windows
| CVE | Component | CVSS | Impact | Status |
|-----|-----------|------|--------|--------|
| **CVE-2026-40407** | CLFS Driver | 8.4 | Low → SYSTEM | ✅ Patched |
| **CVE-2026-26132** | Windows Kernel | — | SYSTEM | ✅ Patched |
| **CVE-2025-62221** | Cloud Files Mini Filter | — | Low → SYSTEM | 🔴 CISA KEV |
| **CVE-2025-55680** | Cloud Files (cldsync.sys) | High | Auth → SYSTEM | ✅ Patched |
| **CVE-2025-62215** | Windows Kernel | 7.8 | Low → SYSTEM | 🔴 Actively exploited |
| **CVE-2025-64669** | Windows Admin Center | — | Low → SYSTEM | ✅ Patched |
| **CVE-2025-59275** | Windows Auth Methods | 7.8 | Auth → higher | ✅ Patched |
| **CVE-2025-62467** | Windows ProjFS | 7.8 | Local → SYSTEM | ✅ Patched |
| **CVE-2025-60710** | Windows Tasks | High | Low → SYSTEM | ✅ Patched |
| **CVE-2025-23358** | NVIDIA App | 8.2 | Local → elevated | ✅ Patched |
| **CVE-2025-8069** | AWS Client VPN | 7.8 | Low → elevated | ✅ Patched |

### Linux
| CVE | Produto | CVSS | Impact | Status |
|-----|---------|------|--------|--------|
| **CVE-2025-1094** | PostgreSQL + BeyondTrust | 8.1 | RCE chain | 🔴 Parcial |
| **CVE-2024-12356** | BeyondTrust PRA | Critical | Unauthenticated RCE | 🔴 Não |
| **CVE-2025-45065** | PHP Gurukul | Critical | Login bypass + full DB | 🔴 Não |

---

## 11. SQL INJECTION / BLIND SQLi

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2024-1597** | PostgreSQL JDBC | **10.0** | Full DB compromise + RCE | 🔴 Não |
| **CVE-2025-64459** | Django ORM | **9.1** | SQLi → RCE | 🔴 Não |
| **CVE-2025-57833** | Django FilteredRelation | **7.1** | SQLi → RCE | 🔴 Parcial |
| **CVE-2024-42005** | Django QuerySet | **High** | SQL Injection | 🔴 Não |
| **CVE-2024-56374** | Django | **High** | DoS | 🔴 Não |
| **CVE-2025-45387** | Apache Traffic Control | **9.9** | SQLi via PUT | 🔴 Privilegiado |
| **CVE-2024-43441** | Apache HugeGraph | **~9.x** | Auth bypass via SQLi | 🔴 Não |
| **CVE-2025-1094** | PostgreSQL + BeyondTrust | **8.1** | RCE chain | 🔴 Parcial |
| **CVE-2025-45065** | PHP Gurukul | **Critical** | Login bypass + full DB | 🔴 Não |
| **CVE-2026-46364** | phpMyFAQ | **Critical** | Time-based blind SQLi | ✅ Patched |
| **CVE-2026-26990** | LibreNMS | **8.8** | Time-based blind SQLi | ✅ Patched |
| **CVE-2026-39358** | CubeCart | **High** | Time-based blind SQLi | ✅ Patched |
| **CVE-2025-64492** | SuiteCRM | **8.8** | Time-based blind SQLi | ✅ Patched |
| **CVE-2025-32993** | Vision Helpdesk | **High** | Time-based blind SQLi | ⚠️ **UNPATCHED** |
| **CVE-2025-61605** | WeGIA | **High** | Time-based blind SQLi | ✅ Patched |
| **CVE-2025-52410** | Institute-of-Current-Students | **High** | Time-based blind SQLi | ⚠️ Não |
| **CVE-2025-24799** | (Various) | **7.5** | Unauthenticated SQLi | 🔴 Não |
| **CVE-2025-57819** | FreePBX | **Critical** | Auth Bypass → SQLi → RCE | ✅ CISA KEV |
| **CVE-2025-64446** | Fortinet FortiWeb | **9.8** | Path traversal → SQLi → admin | ✅ CISA KEV |

---

## 12. FILE UPLOAD → WEB SHELL / RCE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-52691** | SmarterMail | **Critical** | Malicious upload → web shell | ✅ Patched |
| **CVE-2025-54381** | BentoML | **Critical** | SSRF via file upload | ✅ Patched |
| **CVE-2025-58360** | GeoServer | **High** | XXE → file upload → SSRF | ✅ KEV |
| **CVE-2025-31161** | CrushFTP | **9.8** | File upload → auth bypass | ✅ PoC |
| **CVE-2024-38819** | Spring Path Traversal | **High** | LFI via upload | ✅ Patched |
| **CVE-2026-48843** | Roundcube | **7.2** | Email CSS → SSRF | ✅ Patched |

---

## 13. CLOUD / CONTAINER ESCAPE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-53767** | Azure OpenAI | **10.0** | SSRF → cloud metadata | ✅ Patched |
| **CVE-2025-51591** | AWS IMDS | **Critical** | SSRF → IAM creds | ✅ Patched |
| **CVE-2025-29972** | Azure Storage | **Critical** | SSRF → spoofing | ✅ Patched |
| **CVE-2026-33626** | LMDeploy (AI) | **7.5** | SSRF → cloud metadata (13h) | ✅ Patched |
| **CVE-2025-1974** | IngressNightmare (K8s) | **Critical** | Annotation → pod RCE | ✅ Patched |
| **CVE-2025-47733** | Microsoft Power Apps | **High** | SSRF → info disclosure | ✅ Patched |
| **CVE-2026-26138** | Microsoft Purview | **High** | SSRF → privilege elevation | ✅ Patched |

---

## 14. WEB CACHE DECEPTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-57752** | Next.js Image Optimization | **Critical** | Cache deception → auth bypass | ✅ Patched |
| **CVE-2025-40778** | BIND 9 DNS | **8.6** | DNS Cache Poisoning | ✅ Patched |

---

## 15. SUPPLY CHAIN / DEPENDENCY CONFUSION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2026-9277** | `shell-quote` npm (214M+ downloads) | **Critical** | Command injection | ✅ Patched |
| **CVE-2026-26832** | `node-tesseract-ocr` npm | **9.8** | Command injection | ⚠️ Unpatched |
| **CVE-2025-3248** | Langflow | **10.0** | `exec()` injection | ✅ Patched |
| **CVE-2025-55182** | Flask 3.0.0 | **9.8** | Pickle + yaml deserialization | ✅ Patched |
| **CVE-2025-59536** | Anthropic Claude Code | **Critical** | MCP shell execution | ✅ Patched |
| **CVE-2026-21852** | Anthropic Claude Code | **Critical** | API key exfiltration | ✅ Patched |
| **CVE-2025-11953** | React Native CLI | **9.8** | Dev server command execution | ✅ Patched |
| **CVE-2025-54469** | NeuVector | **10.0** | Env command injection | ✅ Patched |

---

## 16. MITM / TLS BYPASS

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-29824** | Windows CLFS | **High** | EoP → SYSTEM | 🔴 Ransomware |
| **CVE-2025-1220** | PHP 8.x | **High** | SSRF via null-byte | ✅ Patched |
| **CVE-2025-59718/19** | Fortinet | **9.8** | SSO signature bypass | ✅ Zero-day |

---

## 17. GRAPHQL / API INJECTION

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2025-64492** | SuiteCRM | **8.8** | GraphQL `appMetadata` SQLi | ✅ Patched |
| **CVE-2025-13915** | IBM API Connect | **9.8** | API auth bypass | ⚠️ Não confirmado |
| **CVE-2025-55315** | ASP.NET Core | **9.9** | HTTP Request Smuggling | ⚠️ Não confirmado |
| **CVE-2025-29927** | Next.js | **Critical** | Header injection → middleware bypass | ⚠️ Limitado |

---

## 18. SPRING / JAVA RCE

| CVE | Produto | CVSS | Tipo | Status |
|-----|---------|------|------|--------|
| **CVE-2022-22965** | Spring4Shell | **9.8** | RCE → Dump | ✅ Patched |
| **CVE-2021-22119** | Spring Security | **High** | Auth Bypass | ✅ Patched |
| **CVE-2023-34034** | Spring Security WebFlux | **High** | Auth Bypass | ✅ Patched |
| **CVE-2024-38819** | Spring Path Traversal | **High** | LFI | ✅ Patched |
| **CVE-2018-1273** | Spring Data Commons | **High** | SpEL Injection RCE | ✅ Patched |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP | ✅ Patched |
| **CVE-2025-24813** | Apache Tomcat | **9.8** | Deserialization RCE | ✅ Patched |
| **CVE-2025-66516** | Apache Tika | **10.0** | XXE → SSRF + RCE | 🔴 Crítico |
| **CVE-2025-53770/71** | Microsoft SharePoint | **9.8** | Deserialization RCE | ✅ Nation-state |
| **CVE-2024-21182** | Oracle WebLogic | **Critical** | Unauth network access | ✅ Ativo |
| **CVE-2025-61882** | Oracle E-Business | **9.8** | SSRF + CRLF → RCE | ✅ Clop ransomware |

---

## 19. TOP EXPLOITADOS CISA KEV 2025

| # | CVE | Produto | CVSS | Tipo |
|---|-----|---------|------|------|
| 1 | **CVE-2025-55182** | React2Shell | **10.0** | RCE |
| 2 | **CVE-2025-32433** | Erlang/OTP SSH | **10.0** | RCE |
| 3 | **CVE-2025-53770** | Microsoft SharePoint | **9.8** | RCE |
| 4 | **CVE-2025-64446** | Fortinet FortiWeb | **9.8** | Auth Bypass |
| 5 | **CVE-2025-37164** | HPE OneView | **10.0** | RCE |
| 6 | **CVE-2025-57819** | FreePBX | **Critical** | Auth → RCE |
| 7 | **CVE-2025-2825** | CrushFTP | **Critical** | Auth Bypass |
| 8 | **CVE-2025-59718** | Fortinet | **9.8** | SSO Bypass |
| 9 | **CVE-2025-66516** | Apache Tika | **10.0** | XXE → RCE |
| 10 | **CVE-2025-15467** | OpenSSL 3.x | **9.8** | Buffer Overflow |
| 11 | **CVE-2026-41089** | Windows Netlogon | **9.8** | RCE |
| 12 | **CVE-2026-0300** | Palo Alto PAN-OS | **Critical** | Buffer Overflow |
| 13 | **CVE-2025-22457** | Ivanti Connect Secure | **Critical** | Buffer Overflow |
| 14 | **CVE-2025-24813** | Apache Tomcat | **9.8** | Deserialization |
| 15 | **CVE-2025-3248** | Langflow | **10.0** | RCE |
| 16 | **CVE-2025-45387** | Apache Traffic Control | **9.9** | SQLi |
| 17 | **CVE-2025-61884** | Oracle EBS | **Critical** | SSRF |
| 18 | **CVE-2025-53767** | Azure OpenAI | **10.0** | SSRF |
| 19 | **CVE-2025-51591** | AWS IMDS | **Critical** | SSRF |
| 20 | **CVE-2025-62221** | Windows Cloud Files | **High** | Privilege Escalation |

---

## 20. CHECKLIST DE HARDENING

### Autenticação
- [ ] Implementar rate limiting em TODOS endpoints de OTP (máx 5 tentativas/15 min)
- [ ] Validar que OTP foi gerado antes de comparar — nunca comparar vazio/null
- [ ] Usar TOTP em vez de SMS quando possível
- [ ] Implementar lockout progressivo após falhas de OTP
- [ ] Validar identidade server-side antes de permitir reset de senha

### Aplicação Web
- [ ] Usar queries parametrizadas (prepared statements) — NUNCA concatenar input em SQL
- [ ] Validar Content-Type antes de processar upload de arquivos
- [ ] Desativar execução de scripts em diretórios de upload
- [ ] Implementar CSRF tokens em TODAS ações state-changing
- [ ] Usar `SameSite=Strict` ou `Lax` em cookies de sessão
- [ ] Validar OAuth `state` parameter server-side
- [ ] Não usar GET para ações que modificam estado

### Infraestrutura
- [ ] Segmentar rede — limitar acesso de servidores web a serviços internos
- [ ] Bloquear acesso a metadata services (169.254.169.254) a não ser necessário
- [ ] Implementar WAF com regras para SQLi, SSRF, e path traversal
- [ ] Desabilitar serviços desnecessários (H2 console, debuggers, etc.)
- [ ] Manter patches atualizados — priorizar pre-auth RCE

### Cloud
- [ ] Usar IMDSv2 (token-based) em vez de IMDSv1 em AWS
- [ ] Implementar network policies em Kubernetes
- [ ] Restringir egress de pods/containers
- [ ] Auditar regras de cache CDN para prevenir WCD

### Desenvolvimento
- [ ] Nunca usar `pickle`, `yaml.load`, ou `eval()` com input não confiável
- [ ] Sanitizar paths antes de usar em operações de arquivo
- [ ] Validar todas as entradas contra allowlist
- [ ] Usar bibliotecas atualizadas — verificar dependências regularmente
- [ ] Implementar logging de queries para detectar SQLi

---

> **Fontes:** NVD, CISA KEV, SOCRadar, JFrog, Zscaler, Palo Alto Unit 42, Cisco Talos, Recorded Future, Huntress, Google GTIG, Darktrace, Microsoft Security Blog, The Hacker News, PortSwigger, OWASP

> **Total: 100+ CVEs catalogados em 20 categorias**
