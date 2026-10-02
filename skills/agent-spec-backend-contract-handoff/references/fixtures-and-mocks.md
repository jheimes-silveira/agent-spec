# Guia — Fixtures e Mocks

> Usado pela skill durante a FASE 5 para preencher a seção `Fixtures` do handoff. Objetivo: gerar fixtures **mínimas e portáveis** que o frontend possa usar para desenvolver offline, escrever testes determinísticos e ensaiar todos os caminhos de erro sem subir backend.

---

## Princípios

1. **Portável > nativo do projeto.** Default JSON. Apenas mude se o frontend já consolidou outro formato.
2. **Mínimo > completo.** Inclua só os campos relevantes para o cenário. Nada de payloads de produção inteiros.
3. **Determinístico.** IDs, datas e tokens fixos (ex: `ord_test_001`, `2024-01-01T00:00:00Z`). Sem `Math.random` ou `now()`.
4. **Realista, não absurdo.** Use valores que aparecem em testes reais ou em dados sanitizados — não `"foo"`, `"bar"`, `"asdf"`.
5. **Uma fixture, um cenário.** Não combine "lista vazia + paginação cheia" no mesmo arquivo.

---

## Cenários Obrigatórios por Tipo de Operação

### GET (recurso único)

- `success.json` — recurso completo, payload típico.
- `not-found.json` — 404 payload.
- `unauthorized.json` — 401 payload.
- `forbidden.json` — 403 payload (se há restrição por permissão).

### GET (listagem)

- `success.json` — lista com 2–3 itens + paginação.
- `empty.json` — lista vazia.
- `success-paginated.json` — primeira página + cursor/total para próxima (se relevante).
- `unauthorized.json` — 401.
- `forbidden.json` — 403.

### POST (criação)

- `request.json` — request body válido mínimo.
- `success.json` — 201 com recurso criado.
- `validation-error.json` — 400/422 com lista de erros por campo.
- `unauthorized.json`, `forbidden.json`.
- `conflict.json` — 409 (se há semântica de unicidade ou estado).

### PUT / PATCH

- `request.json` — payload de atualização válido.
- `success.json` — 200 com recurso atualizado.
- `validation-error.json`.
- `not-found.json`.
- `conflict.json` — 409 versionamento otimista (se aplicável).
- `unauthorized.json`, `forbidden.json`.

### DELETE

- `success.json` — 200/204.
- `not-found.json`.
- `conflict.json` — 409 (se o recurso está em estado que impede deleção).
- `unauthorized.json`, `forbidden.json`.

### Operações de estado (POST /resource/{id}/cancel, etc.)

- `success.json` — transição bem-sucedida.
- `conflict.json` — 409 com `current_state` (transição inválida).
- `not-found.json`.
- `forbidden.json`.

### Eventos / Realtime

- `valid-event.json` — payload de evento bem formado.
- `malformed-event.json` — schema inválido (para testar resiliência do consumer).
- `out-of-order-event.json` — sequência fora de ordem (se relevante).

---

## Formato Padrão

JSON com envelope mínimo descrevendo cenário, request e response:

```json
{
  "name": "create-order/success",
  "description": "POST /api/v1/orders — criação bem-sucedida com 1 item.",
  "request": {
    "method": "POST",
    "path": "/api/v1/orders",
    "headers": {
      "Authorization": "Bearer test-token",
      "Idempotency-Key": "test-idem-001",
      "Content-Type": "application/json"
    },
    "body": {
      "items": [{ "sku": "ABC-123", "qty": 1 }]
    }
  },
  "response": {
    "status": 201,
    "headers": {
      "Content-Type": "application/json",
      "Location": "/api/v1/orders/ord_test_001"
    },
    "body": {
      "id": "ord_test_001",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "items": [{ "sku": "ABC-123", "qty": 1, "price_cents": 1990 }],
      "total_cents": 1990
    }
  }
}
```

### Fixture de Erro

```json
{
  "name": "create-order/validation-error",
  "description": "POST /api/v1/orders — request sem items.",
  "request": {
    "method": "POST",
    "path": "/api/v1/orders",
    "headers": { "Authorization": "Bearer test-token" },
    "body": { "items": [] }
  },
  "response": {
    "status": 400,
    "body": {
      "error": "validation_error",
      "errors": [
        { "field": "items", "code": "min_length", "message": "items deve ter pelo menos 1 elemento" }
      ]
    }
  }
}
```

### Fixture de Listagem Vazia

```json
{
  "name": "list-orders/empty",
  "description": "GET /api/v1/orders — usuário sem pedidos.",
  "request": {
    "method": "GET",
    "path": "/api/v1/orders",
    "headers": { "Authorization": "Bearer test-token" }
  },
  "response": {
    "status": 200,
    "body": {
      "items": [],
      "pagination": { "page": 1, "limit": 20, "total": 0 }
    }
  }
}
```

### Fixture de Evento

```json
{
  "name": "events/order-created/valid",
  "description": "Evento orders.created.v1 com payload válido.",
  "channel": "orders",
  "routing_key": "created.v1",
  "payload": {
    "event_id": "evt_test_001",
    "occurred_at": "2024-01-01T00:00:00Z",
    "data": {
      "order_id": "ord_test_001",
      "user_id": "usr_test_001",
      "total_cents": 1990
    }
  }
}
```

---

## Convenção de Nomes

```
fixtures/
  {operacao}/
    success.json
    empty.json                  (listagens)
    success-paginated.json      (listagens com cursor/page)
    validation-error.json
    unauthorized.json
    forbidden.json
    not-found.json
    conflict.json
    rate-limited.json
    internal-error.json         (5xx)
```

Operação = nome curto kebab-case (`create-order`, `list-orders`, `cancel-order`). Não use método HTTP no nome do diretório — fica redundante.

---

## Formatos Alternativos (use só quando o projeto já adota)

### YAML

```yaml
name: create-order/success
request:
  method: POST
  path: /api/v1/orders
  body:
    items:
      - sku: ABC-123
        qty: 1
response:
  status: 201
  body:
    id: ord_test_001
    status: pending
```

### Dart / Flutter (Map)

```dart
final createOrderSuccess = {
  'request': {
    'method': 'POST',
    'path': '/api/v1/orders',
    'body': {
      'items': [{'sku': 'ABC-123', 'qty': 1}],
    },
  },
  'response': {
    'status': 201,
    'body': {
      'id': 'ord_test_001',
      'status': 'pending',
    },
  },
};
```

### Kotlin (data class ou JSON literal)

```kotlin
val createOrderSuccess = """
{
  "name": "create-order/success",
  "response": { "status": 201, "body": { "id": "ord_test_001", "status": "pending" } }
}
""".trimIndent()
```

### Swift (struct ou JSON literal)

```swift
let createOrderSuccess = """
{
  "name": "create-order/success",
  "response": { "status": 201, "body": { "id": "ord_test_001", "status": "pending" } }
}
"""
```

---

## Como Derivar Fixtures (sem inventar)

A fixture precisa ter origem rastreável. Fontes de verdade aceitáveis:

1. **Testes existentes** — copie payloads de `*_test.*` que exercitam a operação.
2. **Exemplos no contrato formal** — `examples` em OpenAPI, `example` em GraphQL via `@example` directive.
3. **Snapshots de runtime** — se o backend já está rodando, capture uma response real (sanitizando dados pessoais).
4. **Migrations + DTOs** — combine tipos das colunas com shape do DTO para gerar fixture sintética mínima.

**Proibido**:
- Inventar campos que não existem no DTO/schema.
- Inventar status codes que o handler não retorna.
- Usar valores realistas de produção (PII, dados de clientes reais).

Se uma fixture não pode ser derivada de fonte rastreável, marque a operação com `[DÚVIDA]` em vez de inventar.

---

## Sanitização

Quando capturar de runtime:

- Substitua nomes, emails, CPFs, telefones por valores de teste reconhecíveis (`john.test@example.com`).
- IDs viram `*_test_001`, `*_test_002`, etc.
- Timestamps viram `2024-01-01T00:00:00Z` + incrementos previsíveis.
- Tokens / segredos: nunca incluir. Use `test-token`, `test-key`.

---

## Como referenciar no handoff

Na seção `## 7. Fixtures` do handoff:

- Liste paths sugeridos (mas o frontend escolhe a estrutura final do seu projeto).
- Inclua **uma fixture exemplar embutida** (a mais importante — geralmente `success` da operação principal).
- Para o resto, descreva apenas o cenário em uma linha — o frontend gera ou pede ao backend.

Não cole todas as fixtures no handoff — vira documento gigante. Fixtures grandes ficam em arquivos separados.
