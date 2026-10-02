# Template — Backend Contract Handoff

> Template do output final. **Não altere a estrutura de seções**, mas remova seções não aplicáveis em vez de deixar placeholders. Toda afirmação não-óbvia precisa de comentário de fonte: `<!-- fonte: caminho/arquivo.ext:linha -->` ou `<!-- fonte: openapi.yaml#/paths/... -->`.
>
> Marcações obrigatórias quando faltar evidência:
> - `[DÚVIDA]` — bloqueia ou pode causar drift. Frontend NÃO deve adivinhar.
> - `[HIPÓTESE]` — inferência razoável, frontend pode prosseguir mas deve validar.

---

```markdown
# Backend Contract Handoff — {Feature}

> Gerado em: {YYYY-MM-DD}
> Fonte primária: {OpenAPI | GraphQL schema | protobuf | código backend | tech_spec.md | scope.md | taskcard.md}
> Referências: {prd.md | intent.md | tech_spec.md | scope.md | taskcard.md | adr-XXXX} (apenas as que existem)

---

## 1. Feature

{Nome curto, em pt-BR, alinhado ao glossário se existir. Uma linha sobre o que o frontend vai entregar com esta integração.}

## 2. Scope

- {O que entra no escopo do frontend.}
- {O que NÃO entra (delimitação).}
- {Versão da API alvo, se aplicável.}

## 3. Backend Entry Points

Lista plana de operações que o frontend vai consumir. Uma linha por operação.

| # | Operação | Transporte | Método/Ação | Path/Nome |
|---|---|---|---|---|
| 1 | Listar pedidos | REST | GET | `/api/v1/orders` |
| 2 | Criar pedido | REST | POST | `/api/v1/orders` |
| 3 | Cancelar pedido | REST | POST | `/api/v1/orders/{id}/cancel` |
| 4 | OrderCreated | Event | subscribe | `orders.created.v1` |

---

## 4. Contracts

> Uma subseção por operação. Mantenha a ordem da tabela do bloco 3.

### 4.1 {Nome da operação}

- **Tipo**: REST | GraphQL | RPC | WebSocket | Event | Local SDK
- **Método/Ação**: GET | POST | PUT | PATCH | DELETE | query | mutation | subscription | RPC name
- **Path/Operação**: `/api/v1/...` ou `nome.da.operacao`
- **Auth**: obrigatória/opcional/nenhuma — {tipo: Bearer JWT, cookie, API key, mTLS, ...}
- **Permissões**: {roles/scopes/claims/ownership} — `[DÚVIDA]` se não confirmado
- **Idempotência**: sim (header `Idempotency-Key`) | não | desconhecida
- **Cache**: TTL / Cache-Control / invalida quando {evento} ocorre

**Request**
<!-- fonte: ... -->
```json
{
  "campo_obrigatorio": "tipo",
  "campo_opcional?": "tipo | null"
}
```

Path params: `{id}: string (uuid)`
Query params: `?page=number&limit=number&sort=string`
Headers relevantes: `Authorization`, `Idempotency-Key`, `X-Tenant-Id`

**Response (200 / sucesso)**
<!-- fonte: ... -->
```json
{
  "id": "uuid",
  "status": "string",
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 0 }
}
```

**Erros possíveis**

| Status | Error code | Quando ocorre | Payload |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Campo obrigatório ausente | `{ "errors": [{ "field": "...", "code": "..." }] }` |
| 401 | `UNAUTHENTICATED` | Token ausente/expirado | `{ "error": "unauthenticated" }` |
| 403 | `FORBIDDEN` | Sem permissão | `{ "error": "forbidden", "required_role": "..." }` |
| 404 | `NOT_FOUND` | Recurso inexistente | `{ "error": "not_found" }` |
| 409 | `CONFLICT` | Estado inválido para transição | `{ "error": "conflict", "current_state": "..." }` |
| 429 | `RATE_LIMITED` | Limite excedido | `{ "error": "rate_limited", "retry_after": 30 }` |
| 5xx | `INTERNAL_ERROR` | Falha do servidor | `{ "error": "internal_error", "trace_id": "..." }` |

**Side effects**

- {Evento emitido: `orders.created.v1` em RabbitMQ exchange `orders`}
- {Job disparado: `SendOrderConfirmationEmail`}
- {Cache invalidado: chave `orders:user:{user_id}` removida}
- {Nenhum} — se for query pura

**Observações**

- {Notas relevantes que não cabem nos campos acima — ex: comportamento sob retry, race conditions conhecidas, semântica de soft-delete}

---

## 5. UI States Required

> Estados que o frontend **precisa** tratar para cada operação. Liste por operação só os aplicáveis.

| Operação | loading | success | empty | validation_error | unauthorized | forbidden | not_found | conflict | rate_limited | unexpected_error |
|---|---|---|---|---|---|---|---|---|---|---|
| Listar pedidos | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ |
| Criar pedido | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Cancelar pedido | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 6. Error Mapping

Tradução de erro backend → comportamento esperado no frontend.

| Operação | Erro backend | Estado UI | Mensagem (ou chave i18n) | Retry permitido | Invalida cache |
|---|---|---|---|---|---|
| Criar pedido | 400 `VALIDATION_ERROR` | `validation_error` (inline por campo) | `errors.order.validation.{field}.{code}` | não | não |
| Criar pedido | 409 `CONFLICT` (`current_state`) | `conflict` (toast + reload) | `errors.order.conflict.{current_state}` | não | sim (refetch `order:{id}`) |
| Listar pedidos | 401 | redirect login + clear token | — | — | sim (clear all) |
| Listar pedidos | 429 | banner com `retry_after` | `errors.rate_limit` | sim após `retry_after` | não |
| qualquer | 5xx | `unexpected_error` (Sentry + fallback) | `errors.unexpected` | sim (backoff) | não |

## 7. Fixtures

Fixtures mínimas em JSON portável. Caminhos sugeridos (o frontend escolhe a estrutura final):

- `fixtures/{operacao}/success.json`
- `fixtures/{operacao}/empty.json` — se aplicável (listagens)
- `fixtures/{operacao}/validation-error.json`
- `fixtures/{operacao}/unauthorized.json`
- `fixtures/{operacao}/forbidden.json`
- `fixtures/{operacao}/conflict.json`
- `fixtures/{operacao}/not-found.json`

Exemplo embutido (uma fixture):

```json
{
  "name": "create-order/success",
  "request": {
    "method": "POST",
    "path": "/api/v1/orders",
    "headers": { "Authorization": "Bearer ...", "Idempotency-Key": "..." },
    "body": { "items": [{ "sku": "ABC", "qty": 1 }] }
  },
  "response": {
    "status": 201,
    "body": { "id": "ord_123", "status": "pending", "items": [{ "sku": "ABC", "qty": 1 }] }
  }
}
```

## 8. Frontend Implementation Notes

> Neutro de framework. Aponta padrões de integração relevantes, não impõe React/Flutter/Vue/etc.

- {Paginação: cursor-based vs offset; tamanho padrão; estratégia recomendada — ver [frontend-integration-patterns.md](frontend-integration-patterns.md)}
- {Cache: TTL recomendado, chaves, invalidação por evento}
- {Optimistic update: aplicável a {operação X}, rollback em 4xx/5xx}
- {Realtime: subscrever `orders.created.v1` para atualizar lista}
- {Upload: multipart vs presigned URL — ver fonte}
- {Validação cliente: replicar regras de {arquivo de validator do backend}}

## 9. Acceptance Criteria

Checklist do ponto de vista do frontend (não copiar CA do PRD — converter em condições verificáveis na UI/integração).

- [ ] Listagem renderiza estado de loading enquanto a request está pendente.
- [ ] Lista vazia renderiza estado `empty` com CTA `Criar pedido`.
- [ ] Erro 401 redireciona para login e limpa o token.
- [ ] Erro 403 mostra mensagem "Sem permissão" sem expor detalhes do backend.
- [ ] Erro de validação aparece inline no campo errado.
- [ ] Após criação bem-sucedida, a lista é atualizada (refetch ou push via evento).
- [ ] Botão "Cancelar" desabilita enquanto a request está pendente.
- [ ] {N testes mínimos: ver seção 10 abaixo}

## 10. Minimum Tests

Lista enxuta de testes mínimos esperados no frontend. Sem detalhar framework — descreva o **comportamento testado**.

| # | Tipo | Comportamento |
|---|---|---|
| 1 | Component | Lista renderiza skeleton enquanto request pendente |
| 2 | Component | Lista renderiza estado vazio quando API retorna `[]` |
| 3 | Integration | Criação chama POST com payload correto e atualiza lista no sucesso |
| 4 | Integration | Erro 409 mostra toast e refetch do item específico |
| 5 | Integration | Erro 401 limpa token e redireciona |

## 11. Open Questions

Dúvidas que **bloqueiam** ou podem gerar drift. Cada item é resolvido **antes** da entrega ou marcado como `[HIPÓTESE]` aceita.

- [ ] `[DÚVIDA]` Paginação é cursor-based ou offset? Código sugere offset (`/api/v1/orders?page=&limit=`), mas tech_spec menciona cursor.
- [ ] `[DÚVIDA]` Há rate limit por usuário ou global? Não há middleware visível em `src/middleware/`.
- [ ] `[HIPÓTESE]` `Idempotency-Key` é honrado por 24h — inferido por padrão da indústria; não confirmado em código.

---

<!-- Fim do handoff. Seções abaixo são reservadas para handoffs estendidos (raros). Remova se não usar. -->

## 12. Eventos / Realtime (opcional)

Para integrações via WebSocket, SSE, MQTT, RabbitMQ, Kafka, GraphQL subscriptions, etc.

| # | Evento | Transporte | Tópico/Canal | Schema | Quando dispara | Garantias |
|---|---|---|---|---|---|---|
| E1 | `orders.created.v1` | RabbitMQ | exchange `orders`, routing key `created.v1` | {ref ou inline} | Após POST /orders bem-sucedido | at-least-once |

## 13. Versionamento e Compatibilidade (opcional)

- Versão atual da API: `v1`
- Estratégia de versionamento: path | header | content-type
- Próxima quebra prevista: {versão / data / referência}
- Campos deprecados ainda retornados: {lista}
```

---

## Notas para o gerador

- Remova qualquer seção sem conteúdo aplicável. Documento curto vence documento completo.
- Adapte o nível de detalhe ao escopo: TaskCard cirúrgico → handoff de 1 página; integração de feature inteira → até 3 páginas por operação.
- Se houver mais de 6–8 operações no escopo, sugira ao usuário fragmentar em múltiplos handoffs (`handoff-frontend-orders.md`, `handoff-frontend-billing.md`).
- Se a feature for puramente backend-to-backend (sem UI), recuse a geração e oriente o usuário a buscar contrato de integração de serviço, não handoff de frontend.
