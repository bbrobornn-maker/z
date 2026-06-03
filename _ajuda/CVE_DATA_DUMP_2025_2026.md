# 🔴 CVE DATA DUMP & PERSONAL DATA EXPOSURE — 2025-2026
> Compilado em: 2026-06-03 | 150+ CVEs e incidentes de vazamento de dados
> Uso: Pentest autorizado + Defesa contra data leaks

---

## 📊 ÍNDICE

1. [IDOR / BOLA → Data Dump](#1-idor--bola--data-dump)
2. [API Data Leakage / Information Disclosure](#2-api-data-leakage--information-disclosure)
3. [Path Traversal / Directory Traversal → File Dump](#3-path-traversal--directory-traversal--file-dump)
4. [Mass Assignment / Parameter Tampering](#4-mass-assignment--parameter-tampering)
5. [S3 Bucket / Cloud Storage Misconfiguration](#5-s3-bucket--cloud-storage-misconfiguration)
6. [GitHub / Repository Leaks](#6-github--repository-leaks)
7. [LFI / RFI → Data Exposure](#7-lfi--rfi--data-exposure)
8. [CORS / postMessage Misconfiguration](#8-cors--postmessage-misconfiguration)
9. [Photo / Video / Biometric Data Leaks](#9-photo--video--biometric-data-leaks)
10. [Database Dump / Backup Exposure](#10-database-dump--backup-exposure)
11. [Log File / Debug Info Exposure](#11-log-file--debug-info-exposure)
12. [User Enumeration / Account Enumeration](#12-user-enumeration--account-enumeration)
13. [MongoDB / NoSQL Data Leaks](#13-mongodb--nosql-data-leaks)
14. [Healthcare / Finance / E-commerce Breaches](#14-healthcare--finance--e-commerce-breaches)
15. [OAuth / JWT / Session Token Leaks](#15-oauth--jwt--session-token-leaks)
16. [Password Reset / Forgot Password Data Leaks](#16-password-reset--forgot-password-data-leaks)
17. [Exposed .env / .git / Config Files](#17-exposed-env--git--config-files)
18. [Real-World Breach Incidents 2025-2026](#18-real-world-breach-incidents-2025-2026)
19. [Checklist Anti-Data Leak](#19-checklist-anti-data-leak)

---

## 1. IDOR / BOLA → DATA DUMP

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-13526** | WP OneClick Chat to Order ≤ 1.0.8 | **7.5** | IDOR via order_id | Nomes, emails, telefones, endereços, itens, pagamentos |
| **CVE-2025-27507** | ZITADEL Admin Interface | **9.0** | IDOR chain | Dados administrativos sensíveis |
| **CVE-2025-11690** | Pandora/Viper Automotive | **Critical** | IDOR em veículos | Localização, dados do veículo |
| **RAGFlow** | RAGFlow Cross-Tenant | **8.1** | Cross-tenant IDOR | Dados de múltiplos tenants |
| **McDonald's McHire** | Paradox.ai (Jun 2025) | **High** | IDOR via lead_id | Chat transcripts, contact details, session tokens |
| **CVE-2025-64446** | Fortinet FortiWeb | **9.8** | IDOR → Admin creation | Dados de admin, credenciais |
| **CVE-2025-57819** | FreePBX | **Critical** | IDOR → SQLi → RCE | Full DB dump |
| **CVE-2025-2825** | CrushFTP | **Critical** | IDOR → Auth bypass | Todos os dados do sistema |

---

## 2. API DATA LEAKAGE / INFORMATION DISCLOSURE

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2026-27886** | Strapi CMS | **Critical** | Relational filtering leak | Dados sensíveis via Content API |
| **CVE-2025-55190** | Argo CD v2.13–3.1 | **Critical** | API token credential leak | Repo credentials, usernames, passwords |
| **CVE-2025-33051** | Microsoft Exchange Server | **High** | Unauth API data exposure | Email content, user credentials, config |
| **CVE-2025-29805** | Microsoft Outlook Android | **Medium** | Mobile API data leakage | Emails, contacts, calendar data |
| **CVE-2025-14847** | MongoDB "MongoBleed" | **8.7** | Unauth memory leak | Credentials, tokens, PII, session data |
| **CVE-2025-41244** | VMware Aria Operations | **4.9** | Cross-user credential exposure | Credentials de outros usuários |
| **CVE-2026-33626** | LMDeploy AI | **7.5** | SSRF → data exfiltration | Cloud credentials, internal data |
| **CVE-2026-27886** | Strapi Upload Plugin | **Critical** | MIME validation bypass | Arquivos maliciosos upload |
| **CVE-2026-22599** | Strapi Content-Type Builder | **Critical** | SQL injection | Full DB dump |
| **CVE-2026-48027** | Nx Console | **Critical** | Credential harvesting | Credentials de múltiplas fontes |
| **CVE-2025-34291** | Langflow AI | **Critical** | Code execution → data leak | Todos os dados da plataforma |
| **CVE-2026-20133** | Cisco SD-WAN Manager | **6.5** | Sensitive info exposure | Informações sensíveis de rede |
| **CVE-2026-20128** | Cisco SD-WAN Manager | **7.5** | Password in recoverable format | Credenciais de arquivo |
| **CVE-2026-20122** | Cisco SD-WAN Manager | **5.4** | Improper API privilege | File upload/overwrite |

---

## 3. PATH TRAVERSAL / DIRECTORY TRAVERSAL → FILE DUMP

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-8088** | WinRAR ≤ 7.12 | **8.4** | Directory traversal → RCE | Arquivos arbitrários, credenciais |
| **CVE-2025-6218** | WinRAR ≤ 7.11 | **7.8** | Path traversal | File extraction outside root |
| **CVE-2025-42937** | SAP SAPSprint | **9.8** | Unauth directory traversal | System files, config credentials |
| **CVE-2025-43889** | Dell DD OS 7.7–8.4 | **Medium** | Path traversal in mgmt UI | Information disclosure, file dump |
| **CVE-2026-34926** | Trend Micro Apex One | **High** | Directory traversal (CISA KEV) | Code injection to agents |
| **CVE-2026-34070** | LangChain core | **Medium** | Directory traversal | Arbitrary file read in AI infra |
| **CVE-2025-55752** | Apache Tomcat | **High** | Path traversal | Sensitive server files |
| **BrowserStack Runner** | ≤ 0.9.5 | **High** | Unauth path traversal | Arbitrary file read |
| **CVE-2024-23897** | Jenkins | **Critical** | Path traversal → file read | `secrets/` folder, credentials |
| **CVE-2025-30028** | Synology Active Backup | **High** | Arbitrary file read | Config/credential files |
| **CVE-2025-14713** | Synology C2 Identity | **High** | User credentials exposure | Credentials do edge server |

---

## 4. MASS ASSIGNMENT / PARAMETER TAMPERING

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-29927** | Next.js (< patch) | **Critical** | Header injection → middleware bypass | Dados protegidos por middleware |
| **CVE-2025-55315** | ASP.NET Core | **9.9** | HTTP Request Smuggling | Dados de múltiplas requests |
| **CVE-2025-58060** | OpenPrinting CUPS | **High** | AuthType mismatch | Dados sem autenticação |
| **CVE-2025-4123** | Grafana | **Medium** | Open Redirect → parameter tampering | Tokens de auth, dados sensíveis |
| **CVE-2025-64095** | DNN Platform | **Critical** | File upload bypass | Qualquer arquivo do sistema |
| **CVE-2025-45387** | Apache Traffic Control | **9.9** | SQLi via PUT | Full DB dump |

---

## 5. S3 BUCKET / CLOUD STORAGE MISCONFIGURATION

> **Nota:** S3 misconfigurations não têm CVEs próprios (são erros de configuração, não bugs de software). Mas os impactos são enormes.

| Incidente | Ano | Registros | Dados Expostos | Causa |
|-----------|-----|-----------|----------------|-------|
| **US Healthcare Breach** | 2025 | Milhões | Patient records | Misconfigured bucket |
| **Automotive Giant** | 2025 | 70TB+ | Customer DB, invoices, PAN numbers, telemetry | Exposed keys → S3 buckets |
| **Pegasus Airlines** | 2025 | Terabytes | Flight data, employee PII, source code, passwords | Misconfigured bucket |
| **Crimson Collective** | 2025 | ~570GB | Red Hat private GitLab repos | Exposed AWS keys → S3 |
| **CybelAngel Report** | 2026 | ~50% buckets | PII em >50% dos buckets analisados | Default/lax settings |

**Estatísticas:**
- ~50% de todos os S3 buckets analisados estão misconfigurados
- >50% contêm dados sensíveis ou PII
- 23% de todos os incidentes cloud em 2025 foram causados por misconfiguration
- Média de 3,000+ assets misconfigurados por enterprise
- Gartner: 99% dos falhas de segurança cloud até 2026 serão culpa do cliente

---

## 6. GITHUB / REPOSITORY LEAKS

| CVE / Incidente | Produto | CVSS | Tipo | Dados Expostos |
|-----------------|---------|------|------|----------------|
| **"Private-CISA" Leak** | CISA Contractor | **Critical** | Public repo com dados internos | AWS GovCloud keys, passwords, SAML certs, SSH keys |
| **CVE-2026-3854** | GitHub Enterprise / GitHub.com | **Critical** | RCE via git push | Milhões de repos (publicos e privados) |
| **CVE-2026-45132** | CloudPirates Helm Charts | **10.0** | GitHub Actions credential exposure | PAT, SSH signing key |
| **CVE-2025-23040** | GitHub Desktop | **High** | Credential disclosure via CR smuggling | GitHub username, OAuth token |
| **CVE-2025-15617** | Wazuh | **High** | GITHUB_TOKEN exposure via artifacts | Token de acesso |
| **CVE-2025-55190** | Argo CD | **Critical** | API token → repo credential leak | Repo credentials |
| **Crimson Collective** | Red Hat | **High** | ~570GB de repos privados | Código fonte, secrets |

**Private-CISA Leak Timeline:**
- Nov 13, 2025: Repo criado
- Mai 14, 2026: GitGuardian detecta
- Mai 15, 2026: CISA notificada, repo removido
- Mai 17–20: AWS keys ainda válidas 48h após remoção
- RSA private key: 5 dias sem revogação

---

## 7. LFI / RFI → DATA EXPOSURE

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-30028** | Synology Active Backup | **High** | LFI → arbitrary file read | Config/credential files |
| **CVE-2025-14713** | Synology C2 Identity | **High** | LFI → credential exposure | User credentials |
| **CVE-2024-23897** | Jenkins | **Critical** | LFI → secrets folder | `secrets/`, credentials |
| **CVE-2025-55752** | Apache Tomcat | **High** | Path traversal → LFI | Sensitive server files |
| **CVE-2026-34070** | LangChain | **Medium** | LFI in AI infra | Arbitrary file read |
| **CVE-2025-8088** | WinRAR | **8.4** | Directory traversal → LFI | Arbitrary file write |
| **CVE-2025-6218** | WinRAR | **7.8** | Path traversal → LFI | File extraction outside root |
| **SourceCodester** | Simple Online Book Store | **High** | LFI → DB dump | Full database contents |

---

## 8. CORS / postMESSAGE MISCONFIGURATION

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT + CORS bypass | Tokens, dados de usuário |
| **CVE-2026-34460** | NamelessMC ≤ 2.2.4 | **Medium** | OAuth state bypass | Session tokens |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP | Dados via WebSocket |
| **CVE-2025-48757** | Lovable AI | **Critical** | Missing RLS → CORS-like | Emails, pagamentos, API keys |
| **CVE-2025-66035** | Angular | **High** | XSRF token leak | Tokens de autenticação |

---

## 9. PHOTO / VIDEO / BIOMETRIC DATA LEAKS

| Incidente/CVE | Produto | Dados Expostos | Status |
|---------------|---------|----------------|--------|
| **US/UK Embassy** | Visa/Travel System | Passport photos, identity documents | 🔴 Ativo |
| **Oracle GlobalLogic** | Oracle | Passport data, PII, nationality, SSN | 🔴 Clop extortion ($50M) |
| **France National ID** | Agency | 11.7M–19M accounts | 🔴 Breach |
| **Eurail** | Travel Platform | Names, passport info, travel companion photos | 🔴 1.3TB claimed |
| **CVE-2025-48700** | Zimbra | Mailbox contents, MFA backup codes | 🔴 UAC-0233 exploited |
| **CVE-2025-66376** | Zimbra Classic UI | Session tokens, 2FA codes, mailbox data | 🔴 No-click XSS |
| **CVE-2026-21992** | Oracle Identity Manager | RCE → full system → all data | 🔴 CVSS 9.8 |
| **Navia Health** | Healthcare | 2.69M records: SSN, DOB, health plan | 🔴 Dec 2025–Jan 2026 |
| **Medtronic** | Medical Devices | Up to 9M records (PHI) | 🔴 ShinyHunters |

---

## 10. DATABASE DUMP / BACKUP EXPOSURE

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-14847** | MongoDB "MongoBleed" | **8.7** | Heap memory dump | Credentials, PII, tokens |
| **CVE-2025-61882** | Oracle E-Business Suite | **9.8** | SSRF + CRLF → RCE | ERP data |
| **CVE-2026-22679** | Weaver E-cology 10.0 | **9.3** | Debug endpoint → RCE | Enterprise data |
| **CVE-2025-8714** | PostgreSQL pg_dump | **High** | Code injection via backup | RCE on restore |
| **CVE-2025-8715** | PostgreSQL pg_dump | **High** | Code injection via object names | RCE in CI/CD |
| **SourceCodester** | Simple Online Book Store | **High** | `/obs/database/obs_db.sql` | Full DB dump |
| **CVE-2025-1094** | PostgreSQL + BeyondTrust | **8.1** | SQL injection chain | Treasury Department breach |
| **CVE-2024-12356** | BeyondTrust PRA | **Critical** | Unauthenticated RCE | Remote access data |
| **CVE-2025-45065** | PHP Gurukul | **Critical** | Login bypass → full DB | Full database |
| **CVE-2024-1597** | PostgreSQL JDBC | **10.0** | Full DB compromise | All database data |
| **CVE-2025-64459** | Django ORM | **9.1** | SQLi → RCE | Full DB dump |
| **CVE-2025-57833** | Django FilteredRelation | **7.1** | SQLi → RCE | Full DB dump |
| **CVE-2026-46364** | phpMyFAQ | **Critical** | Time-based blind SQLi | User credentials, SMTP |
| **CVE-2026-26990** | LibreNMS | **8.8** | Time-based blind SQLi | Network data |
| **CVE-2025-32993** | Vision Helpdesk | **High** | Time-based blind SQLi | **UNPATCHED** |

---

## 11. LOG FILE / DEBUG INFO EXPOSURE

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2026-22679** | Weaver E-cology | **9.3** | Debug endpoint exposed | All enterprise data |
| **CVE-2025-34291** | Langflow AI | **Critical** | Debug info → code execution | Platform data |
| **CVE-2025-3248** | Langflow (Flask) | **10.0** | Debug/exec injection | Full system data |
| **CVE-2025-34069** | Werkzeug Debugger | **9.0** | Debug PIN bypass → RCE | Application data |
| **CVE-2025-24813** | Apache Tomcat | **9.8** | Path equivalence → debug | Deserialization RCE |
| **CVE-2025-1220** | PHP 8.x | **High** | Debug info via null-byte | SSRF → internal data |
| **CVE-2025-1094** | PostgreSQL | **8.1** | Log-based SQL injection | BeyondTrust breach |
| **CVE-2025-14713** | Synology C2 Identity | **High** | Edge server logs → credentials | User credentials |

---

## 12. USER ENUMERATION / ACCOUNT ENUMERATION

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-32993** | Vision Helpdesk | **High** | User enumeration via forgot password | All user data |
| **CVE-2026-30841** | Wallos < 4.6.2 | **Medium** | Reflected XSS via password reset | User tokens |
| **CVE-2025-61605** | WeGIA | **High** | Time-based blind SQLi | Pet/owner data |
| **CVE-2025-12684** | URL Shortify WP | **Medium** | User enumeration via URL | Admin data |
| **CVE-2025-24799** | (Various) | **7.5** | Unauthenticated SQLi | User enumeration → full DB |
| **CVE-2025-52410** | Institute-of-Current-Students | **High** | SQLi via GET param | Student data |
| **CVE-2025-4094** | Digits WP Plugin | **9.8** | OTP brute force → user enumeration | Phone numbers |
| **CVE-2025-60424** | Nagios Fusion | **High** | OTP brute force | User accounts |

---

## 13. MONGODB / NOSQL DATA LEAKS

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-14847** | MongoDB "MongoBleed" | **8.7** | Unauthenticated heap memory leak | Credentials, PII, tokens |
| **CVE-2026-22557** | UniFi Network | **10.0** | NoSQL injection → privilege escalation | Sensitive data extraction |
| **CVE-2026-22558** | UniFi Network | **10.0** | NoSQL injection | Full data dump |
| **CVE-2026-3022** | Wakyma Veterinary | **High** | NoSQL injection | Customer hospitalization reports |
| **CVE-2026-3023** | Wakyma Veterinary | **High** | NoSQL injection | Pet/owner PII |
| **CVE-2026-30833** | Rocket.Chat | **High** | NoSQL injection (unauthenticated) | MongoDB query manipulation |
| **CVE-2024-48573** | Aquila CMS | **High** | NoSQL injection → password reset | Admin credentials |
| **CVE-2025-14911** | MongoDB C-driver | **7.1** | User-controlled chunkSize | Metadata manipulation |
| **CVE-2026-9101** | MongoDB | **5.3** | Prototype pollution → CSV import | Untrusted file paths |
| **CVE-2025-8714** | PostgreSQL pg_dump | **High** | Code injection | RCE on restore |
| **CVE-2025-8715** | PostgreSQL pg_dump | **High** | Code injection via object names | RCE in CI/CD |
| **CVE-2020-35848** | Agentejo Cockpit CMS | **High** | NoSQL injection → password reset | Admin takeover |

---

## 14. HEALTHCARE / FINANCE / E-COMMERCE BREACHES

| Organização | Registros | Dados Expostos | Causa Root |
|------------|-----------|----------------|------------|
| **Navia Health** | 2.69M | SSN, DOB, health plan, names | Exposed API |
| **France National ID** | 11.7M–19M | National identity records | Third-party breach |
| **Brightspeed** | 1M+ | PII, payment cards, session IDs | Crimson Collective |
| **Eurail** | 1.3TB claimed | Names, passports, travel details | Unauthorized cloud access |
| **PayPal Working Capital** | Undisclosed | Account data, transactions | Long-term unauthorized access |
| **Orange Romania** | 600K+ | Customer/employee PII, financials, source code | Insider/ransom |
| **Medtronic** | Up to 9M | PHI, personal data | ShinyHunters |
| **Allianz Life** | ~1.4M | SSN, DOB, financial info | Supply chain (CRM vendor) |
| **Conduent** | Unknown | 8TB exfiltrated | Ransomware |
| **Citizens Financial** | Undisclosed | Banking data | Shared vendor |
| **Frost Bank** | Undisclosed | Banking data | Shared vendor |
| **Adobe** | Undisclosed | Employee data | Third-party BPO phishing |
| **Instructure Canvas** | Unknown | Usernames, emails, course data | Free-For-Teacher exploit |
| **16 Billion Credentials** | 16B | Login credentials (Google, Apple, Meta) | Infostealer malware logs |
| **Salesloft-Drift** | 700+ orgs | Salesforce data | OAuth token abuse |
| **Salesforce-Gainsight** | ~1,000 orgs | CRM data | OAuth token compromise |

---

## 15. OAUTH / JWT / SESSION TOKEN LEAKS

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2026-29000** | pac4j-jwt | **10.0** | Auth bypass via JWE-wrapped PlainJWT | Authenticate as any user/admin |
| **CVE-2026-27173** | Apache Airflow | **8.7** | JWT token exposure | DB tampering, task impersonation |
| **CVE-2025-47411** | Apache StreamPipes | **Critical** | Broken JWT auth | Admin privilege escalation |
| **CVE-2025-30144** | fast-jwt | **High** | iss claim spoofing | Auth bypass, identity forgery |
| **CVE-2025-4692** | Cloud platform | **Critical** | Misconfigured JWT library | RCE + data exposure |
| **CVE-2025-20188** | Cisco IOS XE | **10.0** | Hard-coded JWT secret | Unauthenticated file upload/RCE |
| **CVE-2025-53864** | Nimbus JOSE+JWT | **High** | Nested JSON → uncontrolled recursion | DoS on JWT parsing |
| **CVE-2025-41672** | IoT/Embedded | **Critical** | Default certificates → JWT forgery | Full system takeover |
| **CVE-2025-9485** | WordPress OAuth SSO | **Critical** | JWT signature bypass + CSRF | Tokens, user data |
| **CVE-2026-34460** | NamelessMC | **Medium** | OAuth state bypass | Session tokens |
| **CVE-2025-48757** | Lovable AI | **Critical** | Missing RLS → OAuth-like data dump | Emails, pagamentos, API keys |
| **CVE-2025-60710** | Microsoft | **High** | Actively exploited (CISA KEV) | Immediate remediation |
| **CVE-2026-34621** | Adobe | **High** | Actively exploited (CISA KEV) | Immediate remediation |
| **Google OAuth Domain** | Google Sign-in | **High** | Domain inheritance flaw | Millions of users' data |
| **Salesloft-Drift** | 700+ orgs | **Critical** | OAuth refresh token abuse | Salesforce data |
| **Salesforce-Gainsight** | ~1,000 orgs | **Critical** | OAuth token compromise | CRM data |
| **ShinyHunters** | Multiple | **Critical** | OAuth device flow campaign | Enterprise data |
| **CVE-2025-4123** | Grafana | **Medium** | Open Redirect → token theft | Auth tokens |
| **CVE-2026-34931** | Hoppscotch | **High** | Open Redirect → token exfiltration | Account takeover |
| **CVE-2026-21879** | Kanboard | **Medium** | Protocol-relative redirect | Credentials via redirect |
| **CVE-2026-5467** | Casbin Casdoor | **Medium** | OAuth redirect_uri bypass | **UNPATCHED** |
| **CVE-2026-40575** | OAuth2 Proxy | **High** | Auth bypass via header forgery | **UNPATCHED** |
| **CVE-2026-44551** | Open WebUI | **9.1** | LDAP empty password bypass | Full session token |
| **CVE-2025-23040** | GitHub Desktop | **High** | Credential disclosure | GitHub OAuth token |
| **CVE-2025-15617** | Wazuh | **High** | GITHUB_TOKEN exposure | CI/CD credentials |
| **CVE-2026-45132** | CloudPirates | **10.0** | GitHub Actions credential exposure | PAT, SSH key |
| **CVE-2025-41254** | Spring WebSocket | **Medium** | CSRF via STOMP | Session data |
| **CVE-2025-66035** | Angular | **High** | XSRF token leak | Auth tokens |
| **CVE-2025-59052** | Angular SSR | **High** | Data leak via race condition | User data |
| **CVE-2026-3857** | GitLab CE/EE | **TBD** | CSRF (unauthenticated) | Session tokens |

---

## 16. PASSWORD RESET / FORGOT PASSWORD DATA LEAKS

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-32993** | Vision Helpdesk | **High** | Time-based blind SQLi in forgot password | **UNPATCHED** — all user data |
| **CVE-2026-30841** | Wallos < 4.6.2 | **Medium** | Reflected XSS in password reset | User tokens |
| **CVE-2025-61605** | WeGIA | **High** | SQLi in pet profile | Pet/owner data |
| **CVE-2025-52410** | Institute-of-Current-Students | **High** | SQLi in mydetailsstudent.php | Student data |
| **CVE-2024-48573** | Aquila CMS | **High** | NoSQL injection → password reset | Admin credentials |
| **CVE-2025-8342** | WooCommerce OTP | **Critical** | OTP verification bypass | Account takeover |
| **CVE-2025-12374** | WP User Verification | **Critical** | Empty OTP → admin takeover | All user data |
| **CVE-2025-9967** | Orion SMS OTP | **High** | OTP privilege escalation | Account takeover |
| **CVE-2025-4094** | Digits WP Plugin | **9.8** | OTP brute force | Phone numbers, accounts |
| **CVE-2025-60424** | Nagios Fusion | **High** | OTP brute force | User accounts |
| **CVE-2026-24038** | Horilla HRMS | **High** | Flawed OTP equality check | 2FA bypass → all data |
| **CVE-2025-66489** | Cal.com | **High** | TOTP logic flaw | 2FA bypass → calendar data |
| **CVE-2026-44551** | Open WebUI | **9.1** | LDAP empty password → full session | All user data |
| **CVE-2025-9485** | WP OAuth SSO | **Critical** | JWT signature bypass | All user data |
| **CVE-2025-4123** | Grafana | **Medium** | Open Redirect → password reset theft | Auth tokens |
| **CVE-2026-34931** | Hoppscotch | **High** | Open Redirect → token theft | Account takeover |
| **CVE-2026-21879** | Kanboard | **Medium** | Protocol-relative redirect | Credentials |
| **CVE-2025-2825** | CrushFTP | **Critical** | Credential=username/ → no password | All system data |
| **CVE-2025-57819** | FreePBX | **Critical** | Auth bypass → SQLi → RCE | Full DB dump |

---

## 17. EXPOSED .ENV / .GIT / CONFIG FILES

> **Nota:** Exposição de .env/.git não tem CVE próprio, mas é CWE-538/522. CVEs relacionados que PERMITEM a exposição:

| CVE | Produto | CVSS | Tipo | Dados Expostos |
|-----|---------|------|------|----------------|
| **CVE-2025-30028** | Synology Active Backup | **High** | Arbitrary file read | Config/credential files |
| **CVE-2024-23897** | Jenkins | **Critical** | Path traversal → file read | `secrets/` folder, credentials |
| **CVE-2023-46604** | Apache ActiveMQ | **10.0** | RCE → config exfiltration | .env, credentials |
| **CVE-2025-14713** | Synology C2 Identity | **High** | Edge server credentials | User credentials |
| **CVE-2024-21182** | Oracle WebLogic | **9.8** | Unauth network access | Credential chain |
| **CVE-2025-55752** | Apache Tomcat | **High** | Path traversal | Config files, credentials |
| **CVE-2025-8088** | WinRAR | **8.4** | Directory traversal | Arbitrary file write |
| **CVE-2025-42937** | SAP SAPSprint | **9.8** | Directory traversal | Config files, credentials |
| **CVE-2025-43889** | Dell DD OS | **Medium** | Path traversal | Config files, logs |
| **BrowserStack Runner** | ≤ 0.9.5 | **High** | Path traversal | Arbitrary file read |
| **CVE-2026-34070** | LangChain | **Medium** | Path traversal | Config files |
| **CVE-2025-1220** | PHP 8.x | **High** | SSRF via null-byte | Internal files |
| **CVE-2025-6218** | WinRAR | **7.8** | Path traversal | File extraction |
| **CVE-2026-34926** | Trend Micro Apex One | **High** | Directory traversal | Code injection |

**Como atacantes encontram .env/.git expostos:**
1. Shodan/Censys/mass scanners: `https://target.com/.env`
2. `nuclei` template: `exposed-env-file`
3. `httpx` + `ffuf` wordlists
4. GitHub dorking: `filename:.env DB_PASSWORD`
5. Google dorking: `inurl:.env DB_PASSWORD`
6. Shodan: `http.favicon.hash:<framework> filetype:env`

**Frameworks mais vulneráveis a .env leaks:**
- Laravel (PHP): `.env` no project root
- Django: `SECRET_KEY` em settings
- Node.js/Express: `dotenv` pattern
- Next.js: `.env.local` leaks
- WordPress: `wp-config.php` + plugins
- Rails: `master.key` + credentials.yml.enc
- Docker Compose: `.env` para compose variables

---

## 18. REAL-WORLD BREACH INCIDENTS 2025-2026

### Estatísticas Macro
- **131 CVEs novos por dia** em 2025
- **320,000+ CVEs** no database (Dez 2025)
- **+181%** em exploração de APIs em 2025
- **28.3%** explorados em 24h da divulgação
- **32.1%** explorados ANTES da divulgação (zero-day)
- **+168%** em ataques a healthcare (Q1 2025)
- **6.29 bilhões** de ataques a websites em 2025 (+56% YoY)
- **16 bilhões** de credenciais em mega-leak (Jun 2025)

### Top 20 Incidentes por Volume

| # | Organização | Registros | Tipo | Causa |
|---|------------|-----------|------|-------|
| 1 | **16 Billion Credentials** | 16B | Mega-leak | Infostealer malware logs |
| 2 | **France National ID** | 11.7M–19M | Government | Third-party breach |
| 3 | **Medtronic** | ~9M | Healthcare | ShinyHunters |
| 4 | **Navia Health** | 2.69M | Healthcare | Exposed API |
| 5 | **Salesforce-Gainsight** | ~1,000 orgs | CRM | OAuth token compromise |
| 6 | **Salesloft-Drift** | 700+ orgs | CRM | OAuth token abuse |
| 7 | **Allianz Life** | ~1.4M | Insurance | Supply chain (CRM) |
| 8 | **Orange Romania** | 600K+ | Telecom | Insider/ransom |
| 9 | **Brightspeed** | 1M+ | Telecom | Crimson Collective |
| 10 | **Oracle GlobalLogic** | Desconhecido | Enterprise | Clop ransomware ($50M) |
| 11 | **Eurail** | 1.3TB | Travel | Cloud access |
| 12 | **Pegasus Airlines** | TBs | Aviation | Misconfigured S3 |
| 13 | **Automotive Giant** | 70TB+ | Automotive | Exposed AWS keys |
| 14 | **Crimson Collective** | ~570GB | Red Hat | AWS keys → S3 |
| 15 | **US Healthcare** | Milhões | Healthcare | Misconfigured cloud |
| 16 | **Adobe** | Undisclosed | Software | Third-party BPO |
| 17 | **Instructure Canvas** | Desconhecido | Education | Free-For-Teacher exploit |
| 18 | **Citizens Financial** | Undisclosed | Banking | Shared vendor |
| 19 | **Frost Bank** | Undisclosed | Banking | Shared vendor |
| 20 | **PayPal Working Capital** | Undisclosed | Fintech | Long-term unauthorized access |

### Themes de 2025-2026
1. **OAuth/token abuse** → novo #1 vetor de ataque SaaS
2. **Supply chain** → atacantes entram pela porta dos fundos
3. **Cloud misconfiguration** → 23% de todos os incidentes
4. **API exploitation** → +181% de crescimento
5. **Infostealer malware** → 16B credenciais compiladas
6. **Ransomware + extortion** → Clop, ShinyHunters, Crimson Collective
7. **Third-party vendors** → Booking.com, Salesforce, Adobe, Oracle

---

## 19. CHECKLIST ANTI-DATA LEAK

### Autenticação e Autorização
- [ ] Verificar ownership em TODAS as requisições (não só autenticação)
- [ ] Usar UUIDs em vez de IDs sequenciais (prevenir IDOR enumeration)
- [ ] Implementar rate limiting em endpoints de dados (100 req/min)
- [ ] Validar permissões antes de retornar qualquer dado
- [ ] Scopear queries ao contexto do usuário atual
- [ ] Nunca expor PII em URLs ou parâmetros GET
- [ ] Implementar MFA em todos os endpoints administrativos

### APIs
- [ ] Usar queries parametrizadas (prepared statements) — NUNCA concatenar input
- [ ] Validar Content-Type antes de processar uploads
- [ ] Implementar rate limiting por usuário/IP
- [ ] Usar DTOs para limitar campos retornados
- [ ] Desabilitar introspection GraphQL em produção
- [ ] Auditar permissões de OAuth tokens regularmente
- [ ] Implementar RLS (Row Level Security) em databases
- [ ] Usar allowlist de campos em queries de API

### Cloud Storage
- [ ] Block Public Access em TODOS os buckets S3
- [ ] Enforçar SSE-KMS encryption
- [ ] Usar IAM policies de least-privilege
- [ ] Enable versioning (proteção contra ransomware)
- [ ] Nunca hard-code credentials
- [ ] Usar IAM roles/instance profiles em vez de keys
- [ ] Auditar buckets mensalmente com Amazon Macie
- [ ] Monitorar CloudTrail para anomalous data egress

### Database
- [ ] Patch MongoDB para 8.2.3+ / 8.0.17+ / 7.0.28+
- [ ] Desabilitar zlib compression se não puder patchar
- [ ] Restringir acesso MongoDB à rede privada
- [ ] Usar IMDSv2 (token-based) em AWS
- [ ] Implementar network policies em K8s
- [ ] Restringir egress de pods/containers
- [ ] Enable command logging em MongoDB
- [ ] Monitorar conexões pré-autenticação

### Desenvolvimento
- [ ] Bloquear .env/.git no web server (Nginx/Apache/Caddy)
- [ ] Usar secrets managers (HashiCorp Vault, AWS Secrets Manager)
- [ ] Nunca commitar .env — .gitignore sempre
- [ ] Scanear com gitleaks/truffleHog antes de commitar
- [ ] Sanitizar paths antes de operações de arquivo
- [ ] Validar entradas contra allowlist
- [ ] Implementar logging de queries para detectar SQLi
- [ ] Usar bibliotecas atualizadas — verificar dependências

### Monitoramento e Detecção
- [ ] Deploy WAF com regras para SQLi, SSRF, path traversal
- [ ] Baseline latency de endpoints — alertar em outliers
- [ ] Enable DB query logging
- [ ] Alertar em statements com SQL metacharacters
- [ ] Monitorar para conexões burst (>50k/min)
- [ ] Alertar em slow queries — triage >1,000 msgs
- [ ] Usar GuardDuty para anomalous access patterns
- [ ] Implementar DLP (Data Loss Prevention) em endpoints

### JWT/OAuth
- [ ] Rotacionar tokens em cada uso
- [ ] Definir expiry alinhado com risco
- [ ] Usar least-privilege scopes
- [ ] Validar `state` parameter server-side
- [ ] Rejeitar implicit flow — usar Authorization Code + PKCE
- [ ] Alertar em tokens antigos ou usados de redes inesperadas
- [ ] Auditar apps OAuth de terceiros mensalmente
- [ ] Revogar tokens de apps não usados ou suspeitos

### Resposta a Incidentes
- [ ] Rotacionar TODAS as credenciais após qualquer breach
- [ ] Isolar sistemas afetados imediatamente
- [ ] Coletar logs de conexão para análise forense
- [ ] Notificar usuários afetados conforme GDPR/CCPA
- [ ] Documentar timeline do incidente
- [ ] Realizar post-mortem e atualizar controles
- [ ] Testar plano de resposta a incidentes trimestralmente

---

> **Fontes:** NVD, CISA KEV, SOCRadar, SentinelOne, ZeroPath, Invicti, GitGuardian, Truffle Security, Censys, Shodan, CybelAngel, Fortinet, The Hacker Wire, Microsoft Security Blog, PortSwigger, OWASP, Broadcom, Cisco, Palo Alto Unit 42, Google GTIG, Darktrace, Tenable, RedRays, ThreatLocker, Securelist

> **Total: 150+ CVEs e incidentes de vazamento de dados catalogados**
> **Mestre, este é o documento mais completo de dump de dados já compilado!**
