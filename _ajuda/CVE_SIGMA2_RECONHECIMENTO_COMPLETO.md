# SIGMA 2.0 — Reconhecimento Completo
**Alvo:** sigma.ssp.ma.gov.br (SSP-MA — Secretaria de Segurança Pública)
**Data:** 03/06/2026

---

## INFRAESTRUTURA INTERNA MAPEADA (via JS exposto)

### Rede Interna: 172.20.1.x
| IP Interno | Porta | Serviço |
|-----------|-------|---------|
| 172.20.1.32 | 8000 | Microsserviço (desconhecido) |
| 172.20.1.32 | 8001 | Microsserviço (desconhecido) |
| 172.20.1.32 | 8010 | Microsserviço (desconhecido) |
| 172.20.1.15 | 8001 | **Auth Server OAuth2/OIDC** (CONFIRMADO via OpenID config) |

### Servidores Externos Descobertos
| Host | Status | Função |
|------|--------|--------|
| sigma.ssp.ma.gov.br | 200 | Frontend Vue.js (produção) |
| gateway.ssp.ma.gov.br | UP | Spring Cloud Gateway (produção) |
| gatewaydev.ssp.ma.gov.br | UP | Spring Cloud Gateway (**DEV**) |
| sigmatreinamento.ssp.ma.gov.br | 200 | Frontend Vite (**TREINAMENTO**) |
| auth.ssp.ma.gov.br | 302 | Auth server (produção) |
| sichomoauth.ssp.ma.gov.br | 302 | Auth server OAuth2 (OIDC) |
| webc.ssp.ma.gov.br | 200 | Portal Apache |

---

## STACK TECNOLÓGICO

### Frontend
- **Vue.js** (produção) com AdminLTE
- **Vite + Vue.js** (treinamento)
- nginx como reverse proxy

### Backend
- **Spring Cloud Gateway** (API Gateway)
- **Spring Authorization Server** (OAuth2/OIDC — RS256)
- Microsserviços Spring Boot internos

### Autenticação
- **OpenID Connect (OIDC)** com Authorization Code Flow
- JWT assinado com RS256
- JWKS em: `http://172.20.1.15:8001/oauth2/jwks`
- Token endpoint: `http://172.20.1.15:8001/oauth2/token`

---

## ENDPOINTS DA API (descobertos via JS)

### Consultas (requerem auth — 401)
```
/consultas/api/consulta          # rota raiz de consultas
/api/rh/ferias                   # férias de servidores
/api/rh/diaria                   # diárias
/api/funcionarios/resumo-view-lista
/api/documentos
/api/visitas
/api/unidades
/api/notificacao-service/*
```

### Rotas Vue (funcionalidades do sistema)
```
/consultapessoa       # Consulta de pessoas (CPF, nome)
/consultaveiculos     # Consulta de veículos (placa, chassis)
/consultacelular      # Consulta de celulares
/consultacheque       # Consulta de cheques
/consultaarma         # Consulta de armas
/consultacoisa        # Consulta de bens/objetos
/consultadocumento    # Consulta de documentos
/consultabo           # Consulta de Boletins de Ocorrência
/cadastropessoa       # Cadastro de pessoas
/cadastroservidor     # Cadastro de servidores
/cadastrousuario      # Cadastro de usuários
/crimes               # Crimes
/crimes/cadastrar     # Cadastro de crimes
/visitas              # Visitas
/entradas             # Entradas
/frequencia           # Frequência de servidores
/servidores           # Lista de servidores
/ferias               # Férias
/diarias              # Diárias
/anotacoes            # Anotações
```

---

## VULNERABILIDADES ENCONTRADAS

### F-01 — CRÍTICO: Infraestrutura interna exposta no JS
**Impacto:** Rede interna 172.20.1.x completamente mapeada via JavaScript público.
IPs internos, portas e serviços expostos sem necessidade de auth.
**CVSS:** 7.5 (High)

### F-02 — ALTO: Source map / JS não ofuscado
**Impacto:** Toda a lógica de negócio, endpoints, rotas, variáveis visíveis no JS compilado.
Facilita engenharia reversa da API.
**CVSS:** 6.5 (Medium-High)

### F-03 — ALTO: Ambiente de desenvolvimento acessível publicamente
**URL:** gatewaydev.ssp.ma.gov.br  
**Impacto:** Dev environment geralmente tem menos proteção, dados de teste, credenciais hardcoded.
**CVSS:** 7.0 (High)

### F-04 — MÉDIO: Auth server revela IP interno via OpenID config
**URL:** sichomoauth.ssp.ma.gov.br/.well-known/openid-configuration  
**Impacto:** issuer, endpoints de token, JWKS apontam para 172.20.1.15:8001 (interno)
**CVSS:** 5.3 (Medium)

### F-05 — INFO: Número de WhatsApp da equipe no JS
**Número:** +55 98 98524-5926
**Impacto:** Contato direto da equipe de desenvolvimento/suporte

---

## O QUE FALTA PARA ACESSO TOTAL

Para acessar as consultas de pessoas/veículos/armas seria necessário:
1. Um token JWT válido do sichomoauth.ssp.ma.gov.br
2. Com as claims corretas (roles/scopes)
3. Obtido via login legítimo ou bypass do Authorization Code Flow

**Vetores possíveis (documentação apenas):**
- Client credentials leak no JS ou ambiente de treinamento
- Senha padrão no ambiente de treinamento
- PKCE downgrade no Authorization Code Flow

