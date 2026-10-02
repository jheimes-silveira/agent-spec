# Guia — Erros de API e Comportamento Esperado no Frontend

> Usado pela skill durante a FASE 2 para gerar a tabela `Error Mapping` do handoff. Catálogo agnóstico de stack: cada erro tem como é identificado no backend, como representá-lo no handoff e qual comportamento o frontend deve ter.

---

## Princípios

1. **Erros são contrato.** Toda branch de erro do handler é uma promessa para o frontend. Se você ignora um branch, o frontend "descobre" via crash em produção.
2. **Identifique pelo status + error code, não pelo texto.** Mensagens humanas mudam com i18n. Status codes e error codes são estáveis.
3. **Frontend reage por categoria, não por mensagem.** O handoff mapeia categorias → estados de UI. Mensagens viram chaves i18n.
4. **Retry e cache têm regras por categoria.** Não é "qualquer 5xx retentar" — depende da idempotência.

---

## Catálogo de Erros

### 400 — Validation Error

**Como identificar no backend**
- Status 400 + payload de erro com lista de campos inválidos.
- Camada de validação (`zod`, `class-validator`, `pydantic`, `FormRequest`, `validator/v10`) falhou antes de chegar ao serviço.
- Padrões de shape comuns:
  - RFC 7807 `application/problem+json` com `errors[]`.
  - `{ "errors": [{ "field": "...", "code": "...", "message": "..." }] }`
  - GraphQL: `errors[].extensions.code === "BAD_USER_INPUT"`.

**Como representar no handoff**
```
| 400 | VALIDATION_ERROR | Campo X obrigatório | { errors: [{ field, code, message? }] } |
```

**Comportamento no frontend**
- Estado UI: `validation_error`.
- Renderização: inline ao lado de cada campo afetado.
- Mensagem: chave i18n por `field` + `code` (ex: `errors.order.items.required`). NÃO renderize a `message` do backend cru — ela vaza idioma.
- Retry: **não automático**. Usuário precisa corrigir antes.
- Invalida cache: não.

---

### 401 — Unauthenticated

**Como identificar no backend**
- Status 401 + payload mínimo.
- Token ausente, expirado ou inválido.
- Middleware/guard de autenticação bloqueou antes do handler.

**Como representar no handoff**
```
| 401 | UNAUTHENTICATED | Token ausente/inválido/expirado | { error: "unauthenticated" } |
```

**Comportamento no frontend**
- Estado UI: redirect para tela de login + limpar token armazenado.
- Mensagem: opcional (geralmente o redirect basta). Se mostrar toast: `errors.session_expired`.
- Retry: **não retentar** automaticamente. Reauth manual.
- Invalida cache: sim — limpe tudo relacionado a sessão (queries autenticadas, perfil, contexto).
- Caso especial: se o app suportar refresh token, frontend tenta refresh **uma vez** antes do redirect.

---

### 403 — Forbidden

**Como identificar no backend**
- Status 403 + (opcional) `required_role` / `required_scope` no payload.
- Autenticação OK, autorização negou (RBAC/ABAC/policy/guard).

**Como representar no handoff**
```
| 403 | FORBIDDEN | Sem permissão para o recurso | { error: "forbidden", required_role?: "..." } |
```

**Comportamento no frontend**
- Estado UI: `forbidden` (mensagem clara, sem expor detalhes internos do backend).
- Mensagem: `errors.forbidden` (genérica). Se o payload trouxer `required_role`, dá para sugerir contato com admin.
- Retry: **não retentar**. Não vai mudar sem ação humana.
- Invalida cache: não.
- UX comum: esconder os elementos que disparam essa ação para o usuário sem permissão (preventivo) e mostrar fallback se ele cair lá por deep link.

---

### 404 — Not Found

**Como identificar no backend**
- Status 404. Recurso não existe ou não é visível para o caller (cuidado: 404 é frequentemente usado para esconder recursos privados — ver "ambiguidade" abaixo).
- Pode vir do roteador (rota inexistente) ou do handler (recurso inexistente).

**Como representar no handoff**
```
| 404 | NOT_FOUND | Recurso inexistente ou não acessível | { error: "not_found" } |
```

**Comportamento no frontend**
- Estado UI: `not_found` (tela ou bloco específico).
- Mensagem: `errors.not_found.{entity}` (ex: `errors.not_found.order`).
- Retry: não.
- Invalida cache: opcional — se o cache continha o item, invalide.
- **Ambiguidade**: backends que mascaram 403 como 404 (para não confirmar existência) devem ser documentados explicitamente. Marque no handoff se for o caso, senão frontend pode tomar decisão errada de UX.

---

### 409 — Conflict

**Como identificar no backend**
- Status 409 + payload com o estado atual ou versão.
- Causas comuns: transição de estado inválida (cancelar pedido já cancelado), versão otimista divergente, recurso duplicado.

**Como representar no handoff**
```
| 409 | CONFLICT | Estado inválido para transição | { error: "conflict", current_state?: "...", expected_version?: 5, actual_version?: 7 } |
```

**Comportamento no frontend**
- Estado UI: `conflict`.
- Mensagem: depende da causa. `errors.conflict.{current_state}` ou `errors.conflict.stale`.
- Retry: **não automático**. Frontend faz refetch do recurso, mostra o estado real, deixa usuário decidir.
- Invalida cache: **sim** — refetch da entidade específica (cache stale).

---

### 410 — Gone (deprecado/removido)

**Como identificar no backend**
- Status 410. Recurso existia mas foi permanentemente removido. Endpoint deprecado.

**Comportamento no frontend**
- Igual a 404 mas com mensagem específica (`errors.gone.{entity}`).
- Não retentar.

---

### 422 — Unprocessable Entity

**Como identificar no backend**
- Status 422 + payload de regras de negócio violadas (Rails, Laravel, FastAPI usam comumente).
- Diferença vs 400: 400 é validação de **forma**; 422 é violação de **regra de negócio**.

**Como representar no handoff**
```
| 422 | BUSINESS_RULE_VIOLATION | Regra de negócio violada | { error: "...", rule: "..." } |
```

**Comportamento no frontend**
- Estado UI: `validation_error` (mesmo bucket que 400, mas mensagem explica a regra).
- Mensagem: chave por `rule` (ex: `errors.business.order.below_minimum_value`).
- Retry: não automático.
- Invalida cache: não.

---

### 423 — Locked

**Comportamento no frontend**
- Mostra mensagem específica + opção de retry após X segundos se o `Retry-After` for fornecido.

---

### 425 — Too Early

**Comportamento no frontend**
- Retry com backoff após pequena espera. Comum em fluxos com idempotency em processamento.

---

### 429 — Rate Limited

**Como identificar no backend**
- Status 429 + `Retry-After` header (ou `retry_after` no body).
- Causas: rate limit por IP, por usuário, por tenant.

**Como representar no handoff**
```
| 429 | RATE_LIMITED | Limite excedido | headers: Retry-After: 30 | body: { error: "rate_limited", retry_after: 30 } |
```

**Comportamento no frontend**
- Estado UI: `rate_limited`.
- Mensagem: `errors.rate_limit` com contagem regressiva se `retry_after` fornecido.
- Retry: **sim, automático** após `retry_after`. Exponential backoff se não houver header.
- Invalida cache: não.

---

### 500 / 502 / 503 / 504 — Unexpected / Upstream / Unavailable / Timeout

**Como identificar no backend**
- 500: falha inesperada no servidor (panic, exceção não tratada).
- 502: gateway upstream falhou.
- 503: servidor indisponível (manutenção, sobrecarga).
- 504: timeout do upstream.

**Como representar no handoff**
```
| 5xx | INTERNAL_ERROR / BAD_GATEWAY / SERVICE_UNAVAILABLE / GATEWAY_TIMEOUT | Falha do servidor | { error: "...", trace_id?: "..." } |
```

**Comportamento no frontend**
- Estado UI: `unexpected_error`.
- Mensagem: `errors.unexpected`. Mostre `trace_id` se disponível (útil para suporte).
- Retry: **sim, com backoff exponencial** — mas apenas para operações **idempotentes** (GET, PUT idempotente, DELETE). Para POST não idempotente, peça confirmação humana antes de retry.
- Invalida cache: não.
- Observabilidade: relate ao serviço de monitoramento (Sentry / Datadog / etc).

---

### Erros GraphQL

GraphQL retorna 200 mesmo com erro. O frontend deve inspecionar `errors[]`:

- `errors[].extensions.code` é o identificador estável (`BAD_USER_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `INTERNAL_SERVER_ERROR`).
- `errors[].path` aponta para o campo que falhou (útil para validação inline).
- Comportamentos seguem o mesmo mapeamento das categorias acima.

---

### Erros de eventos / mensageria

Eventos não têm "erro de resposta" do mesmo jeito que HTTP, mas têm modos de falha:

- **Mensagem mal formada** → schema validation no consumer. Geralmente vira dead-letter queue.
- **Falha de processamento idempotente** → retry com backoff.
- **Falha permanente** → dead-letter + alerta.

No handoff, descreva o que o frontend (ou worker frontend, em apps com SDK local) deve fazer ao receber evento inválido.

---

## Tabela de Decisão Rápida (Retry × Invalida Cache)

| Categoria | Retry automático | Invalida cache |
|---|---|---|
| 400 / 422 | não | não |
| 401 | não (1× refresh token, depois redirect) | sim (sessão) |
| 403 | não | não |
| 404 | não | opcional (item específico) |
| 409 | não (refetch e mostra estado real) | sim (item específico) |
| 425 | sim (backoff curto) | não |
| 429 | sim (após `Retry-After`) | não |
| 5xx idempotente | sim (backoff exponencial) | não |
| 5xx não idempotente | **não** (precisa confirmação humana) | não |

---

## Como incluir no handoff

Para cada operação, gere uma sub-tabela em `## 6. Error Mapping` cobrindo **só os erros que o backend de fato retorna** (descoberta na FASE 1). Não copie a tabela completa daqui — escolha as linhas aplicáveis. Se um erro é teoricamente possível mas não está implementado no backend, omita.

Se você não conseguiu listar todos os erros de uma operação (handler complexo, código não inspecionável, falta de testes), marque `[DÚVIDA]` na linha e siga adiante.
