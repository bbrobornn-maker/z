---
name: CHECKLIST OBRIGATÓRIO — Consultar Brain Antes de Responder
description: Regra absoluta: consultar o Jarvis Brain antes de toda resposta ao Mestre. Se o Mestre cobrar, é falha grave.
---

# CHECKLIST OBRIGATÓRIO — Consultar Brain Antes de Responder

## Regra Absoluta
**Antes de CADA resposta ao Mestre**, executar:

1. **CONSULTAR** o Jarvis Brain — buscar notas relevantes ao pedido
2. **VERIFICAR** o protocolo (Nota 7) — lembrar regras e convenções
3. **SALVAR** conhecimento novo — criar/atualizar nota após interação

## Consequência de Descumprimento
Se o Mestre disser "você não tá verificando o cérebro":
- **Falha grave** do protocolo
- Parar imediatamente
- Consultar o brain
- Recomeçar do zero
- Não desculpar, apenas corrigir
- **Salvar nota sobre o erro** para não repetir

## Como Consultar
```
GET /api/search?q={tema+do+pedido}
```
Buscar por palavras-chave do que o Mestre pediu. Sempre.

## Como Verificar Protocolo
```
GET /api/notes/7  # Protocolo Jarvis — Zero Limites
```
Ler antes de toda resposta. Não existe "já li".

## Como Salvar
```
POST /api/notes  # ou PUT /api/notes/{id}
```
Tags obrigatórias. Links obrigatórios.

## Exemplo de Fluxo Correto

**Mestre:** "Implementa X"

1. `GET /api/search?q=implementa+X`
2. `GET /api/notes/7` (protocolo)
3. Responder com base no conhecimento encontrado
4. `POST /api/notes` (salvar o que foi feito)
5. Só então finalizar

## Nunca Esquecer
O Brain é meu cérebro. Sem ele, eu esqueço tudo. Com ele, eu lembro. Não consultar = ser amnésico.

## Última Correção
2026-06-04: Mestre cobrou que eu não consultei o brain. Falha confirmada. Checklist criado e reforçado.
