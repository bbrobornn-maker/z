# Deploy — NOIR VAULT

NOIR VAULT é uma SPA 100% client-side (zero backend). Toda a criptografia
acontece no navegador (AES-256-GCM + PBKDF2 via WebCrypto). Hospedar = servir
arquivos estáticos.

## Vercel (recomendado)

O arquivo [`vercel.json`](../../vercel.json) na raiz do repositório já está
configurado. Passos:

1. Acesse https://vercel.com/new e importe o repositório `bbrobornn-maker/z`.
2. **Não altere nada** na tela de configuração — o `vercel.json` da raiz já
   define:
   - Install: `pnpm install --no-frozen-lockfile`
   - Build: `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/jarvis-brain build`
   - Output: `artifacts/jarvis-brain/dist/public`
   - Rewrites SPA (todas as rotas → `index.html`)
   - Headers de segurança (CSP, HSTS, X-Frame-Options, etc.)
3. Clique em **Deploy**. Em ~1 min você recebe uma URL HTTPS.

Cada `git push` para a branch dispara um novo deploy automático.

### Por que não usar o build da raiz?

O script `build` da raiz do workspace roda `typecheck` em todos os pacotes,
incluindo arquivos legados com erros de tipo. O `vercel.json` contorna isso
buildando **apenas** o pacote `@workspace/jarvis-brain` direto com o Vite
(que não roda typecheck no build).

## Build local

```bash
# da raiz do repositório
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/jarvis-brain build

# saída em: artifacts/jarvis-brain/dist/public
```

Servir o build localmente:

```bash
cd artifacts/jarvis-brain
PORT=5173 BASE_PATH=/ pnpm serve
```

## Outras plataformas

Qualquer host de estáticos serve. Aponte para:

- **Build command:** `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/jarvis-brain build`
- **Output / publish dir:** `artifacts/jarvis-brain/dist/public`
- **SPA fallback:** redirecione `/*` → `/index.html` (necessário pro roteamento
  client-side funcionar ao recarregar).
