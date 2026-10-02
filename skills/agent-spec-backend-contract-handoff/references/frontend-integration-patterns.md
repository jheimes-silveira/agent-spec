# Guia — Padrões de Integração Frontend (neutro de framework)

> Usado pela skill durante a FASE 4 para preencher `UI States Required` e seção `Frontend Implementation Notes` do handoff. Descreve padrões e armadilhas comuns **sem assumir** React, Vue, Svelte, Angular, Flutter, SwiftUI, Jetpack Compose ou nenhum framework específico. O handoff orienta — não impõe.

---

## Estados de Tela (canônicos)

Catálogo de estados que **podem** ocorrer numa integração. Para cada operação no handoff, selecione **somente** os aplicáveis.

| Estado | Quando ocorre | UX típica |
|---|---|---|
| `loading` | Request pendente | Skeleton, spinner local, manter última vista renderizada |
| `success` | Response 2xx com dados úteis | Renderizar dados |
| `empty` | 2xx mas dados vazios (`[]`, total=0) | Estado vazio com CTA |
| `validation_error` | 400/422 | Inline ao lado do campo, sem snackbar genérico |
| `unauthorized` | 401 | Redirect login + clear token |
| `forbidden` | 403 | Mensagem clara, esconder ações |
| `not_found` | 404 | Estado dedicado (não rebotar para 500) |
| `conflict` | 409 | Mostrar estado real + escolha do usuário |
| `rate_limited` | 429 | Banner com contagem regressiva |
| `unexpected_error` | 5xx / network down | Fallback com retry + `trace_id` |

Regra: estado `loading` NUNCA convive com estado de erro. Quando erro chega, `loading` termina.

---

## Loading

Padrões:

- **Skeleton** > **spinner global**. Skeleton mantém layout estável e percebe melhor.
- **Optimistic loading**: começa pintando o estado provável antes do success chegar. Use só quando rollback é barato.
- **Stale-while-revalidate**: renderiza dados cacheados imediatamente, dispara refetch em background. Padrão para listas frequentes.
- **Pending por operação**, não global. Botão "Salvar" tem seu próprio `pending`, não trava a tela toda.

Anti-padrão: spinner global em qualquer request — frustra e esconde estado parcial.

---

## Optimistic Update

Aplicável quando:
- A operação é **provavelmente** bem-sucedida (criar item, marcar como lido, curtir).
- O rollback é barato (mostrar erro + restaurar estado anterior).
- O servidor é a verdade, mas o usuário não precisa esperar.

Anti-aplicável:
- Operação financeira (não otimize transferência bancária).
- Operação que dispara side effect visível (envio de email, etc.).

No handoff, declare por operação se otimismo é seguro. Frontend toma a decisão final.

---

## Cache

Padrões:

- **Cache key**: identidade da query (path + params + tenant + user).
- **TTL**: curto para dados voláteis (preços, estoque); longo para dados estáveis (perfil, taxonomia).
- **Stale-while-revalidate**: cache servido instantaneamente + revalidação em background.
- **Invalidação por evento**: após mutation, invalide as queries afetadas (cancelar pedido → invalidar `order:{id}` e `orders:list`).
- **Invalidação por tempo**: TTL natural.
- **Eviction por tamanho**: LRU em listas longas.

No handoff:
- Declare TTL recomendado.
- Liste o conjunto de queries invalidadas após cada mutation.

---

## Refetch

Padrões:

- **On focus**: refetch quando a aba ganha foco (útil para dados que mudam fora do app).
- **On reconnect**: refetch quando rede volta após perda.
- **On mutation success**: invalidar e refetch o que foi afetado.
- **Polling**: para dados que mudam sem causa local (status de job, fila). Use intervalo razoável + backoff em erro.
- **Realtime push**: substitua polling por evento quando disponível.

---

## Pagination

Tipos:
- **Offset/limit** (`?page=2&limit=20`): simples, mas instável quando lista muda. Bom para listas estáticas.
- **Cursor-based** (`?cursor=opaque_token&limit=20`): estável sob mudanças. Padrão para feeds e listas dinâmicas.
- **Infinite scroll vs paginação numerada**: UX. Backend serve os dois — frontend decide.

No handoff, declare o tipo retornado pelo backend e a estrutura do envelope (`{ items: [], next_cursor: "..." }` ou `{ data: [], page: 1, total: 100 }`).

---

## Debounce / Throttle

Onde aplicar:
- **Search inputs**: debounce 250–400ms entre digitação e request.
- **Autosave de form**: debounce 500–1000ms.
- **Resize/scroll listeners**: throttle 16–60ms.
- **Rate-limited APIs**: throttle no cliente para não bater 429.

No handoff, sugira valores apenas quando o backend tiver expectativa específica (ex: search API com rate limit declarado).

---

## Retry

- **GET / idempotente**: retry com **backoff exponencial** + jitter. Máximo 3 tentativas.
- **POST / não idempotente**: NÃO retry automático. Frontend pode usar `Idempotency-Key` para permitir retry seguro — só se o backend honrar.
- **Erros 4xx (exceto 429)**: NÃO retry. Falhou por motivo do cliente; retry não resolve.
- **429**: retry após `Retry-After`.
- **5xx idempotente**: retry com backoff.
- **Network error**: comporta-se como 5xx idempotente — retry com backoff.

---

## Upload / Download

Padrões:

- **Upload pequeno (<5 MB)**: multipart direto.
- **Upload grande / arquivos**: presigned URL (S3 / GCS) — frontend manda direto pro storage, backend só assina.
- **Resumable upload**: tus / multipart chunked. Útil para arquivos grandes em conexões instáveis.
- **Download**: streaming quando arquivo é grande. `fetch` + `Response.body.getReader()` em web; `dio`/`http` com stream em mobile.

Indique no handoff o **mecanismo escolhido pelo backend**, não invente.

---

## Realtime

Tipos:
- **WebSocket bidirecional**: chat, presença, multiplayer.
- **Server-Sent Events (SSE)**: stream unidirecional do servidor para cliente. Mais simples que WS.
- **Push notifications** (mobile / web): out-of-band, requer registro de device.
- **Polling**: fallback quando realtime não está disponível.

No handoff, descreva:
- Transporte (`ws://`, `wss://`, SSE, MQTT, Firebase, Pusher).
- Autenticação no canal (token via query? handshake?).
- Schema de mensagens recebidas.
- Mensagens que o cliente envia (se WS bidirecional).
- Estratégia de reconexão (backoff).

---

## Formulários

Padrões:

- **Validação client-side**: replica regras simples (obrigatório, formato de email, range numérico) para feedback imediato. NÃO confie nela — backend é fonte de verdade.
- **Validação server-side**: mapeie erros 400/422 para campos. Use `field` do payload como chave.
- **Submit em flight**: desabilite o botão durante request. Mostre pending.
- **Erros após submit**: foque o primeiro campo com erro (acessibilidade).
- **Dirty state**: avise antes de sair com mudanças não salvas.
- **Autosave**: para forms longos, debounce + status visual ("salvo às hh:mm").

---

## Validação Client-Side vs Server-Side

| Onde | O que valida | Por quê |
|---|---|---|
| Cliente | Formato (email, telefone, CPF), obrigatoriedade, ranges, comparações entre campos | UX rápida |
| Servidor | Tudo do cliente + regras de negócio + unicidade + ownership + estado | Verdade |

**Regra**: client-side é **espelho** das regras server-side. Frontend duplica para feedback rápido. Backend é autoridade. NUNCA confiar só no cliente.

No handoff, indique se as regras de validação do backend estão expostas para o frontend (ex: via OpenAPI, via endpoint `/schemas`). Se sim, frontend pode gerar validação. Se não, duplicação manual.

---

## Internacionalização

- **Backend retorna chaves**, não mensagens — frontend traduz.
- Se backend retornar mensagens em idioma do usuário, frontend respeita `Accept-Language`.
- Datas: backend envia ISO 8601 UTC; frontend formata no fuso local.
- Moedas: backend envia valor em menor unidade (centavos) + código ISO; frontend formata.

Indique no handoff o padrão usado (chave i18n? mensagem pronta? mista?).

---

## Acessibilidade (não é opcional)

Mesmo neutro de framework, o handoff pode lembrar:
- Estados de erro precisam ser anunciados (ARIA live regions ou equivalente nativo).
- Loading precisa ser perceptível por leitores de tela (não só visualmente).
- Forms precisam de labels associados, mensagens de erro com `aria-describedby`.

---

## Anti-Padrões Comuns

Sinalize no handoff quando relevantes:

- Esconder erros do usuário (snackbar genérico para tudo).
- Retry agressivo em mutation não idempotente.
- Polling sem condição de parada.
- Cachear listas paginadas sem cuidado com cursor stale.
- Confiar em client-side validation como única defesa.
- Mostrar `trace_id` técnico como mensagem principal.
- Loading global bloqueante para qualquer request.
