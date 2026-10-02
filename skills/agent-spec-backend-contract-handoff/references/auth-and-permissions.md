# Guia — Autenticação e Permissões

> Usado pela skill durante a FASE 3 para preencher os campos `Auth` e `Permissões` de cada operação no handoff. Objetivo: deixar **explícito** quem pode chamar cada operação, o que acontece quando não pode, e quais dados de retorno dependem do usuário autenticado. Sem isso, frontend constrói telas que vazam ou bloqueiam erroneamente.

---

## Dimensões a Extrair

Para **cada operação** no escopo do handoff, registre:

1. **Auth obrigatória?** sim / opcional / não.
2. **Tipo de credencial** — Bearer JWT, cookie de sessão, API key, mTLS, basic auth, anonymous.
3. **Permissão necessária** — roles, scopes, claims, ownership, tenant context, feature flag.
4. **Comportamento se falhar** — 401 vs 403, redirect, refresh token, etc.
5. **Dados condicionais por usuário** — filtros implícitos por tenant/owner, campos ocultos para certos roles.

---

## Auth Obrigatória vs Opcional vs Pública

| Estado | Como identificar |
|---|---|
| **Obrigatória** | Middleware/guard de auth no caminho da rota (`requireAuth`, `@Authorize`, `auth()->` etc.) que retorna 401 quando ausente. |
| **Opcional** | Middleware presente mas não falha quando token ausente; handler ramifica em `if (user) {...}`. Comportamento divergente para autenticado vs anônimo. |
| **Pública / nenhuma** | Sem middleware de auth no caminho. Handler não consulta `req.user`/`current_user`. |

Sempre liste explicitamente. `auth: nenhuma` é uma afirmação útil — não um vazio.

---

## Tipos de Credencial

| Tipo | Sinal no código backend |
|---|---|
| Bearer JWT | Middleware decodifica `Authorization: Bearer <token>` — `jsonwebtoken`, `jwt`, `pyjwt`, `golang-jwt`, `nimbusds`. |
| Cookie de sessão | `express-session`, `cookie-session`, Rails `session[:user_id]`, Django session middleware. |
| API key | Header `X-API-Key`, query param `api_key`, ou Bearer customizado. |
| mTLS | Configuração TLS no servidor com `clientCert: required`. |
| OAuth scopes | Middleware valida `scope` do token (Auth0, Okta, Keycloak). |
| Basic auth | Header `Authorization: Basic ...` decodificado. |
| Anonymous | Sem middleware. Identificação por device id / cookie não autenticado / nada. |

No handoff, declare o tipo e o transporte (header? cookie? query?). Frontend precisa saber onde injetar a credencial.

---

## Permissão: roles, scopes, claims

### Roles (RBAC)

- Sinais: `@RolesAllowed("admin")`, `@HasRole`, `User.role === 'admin'`, `current_user.has_role?(:admin)`.
- Modelo simples: um usuário tem N roles; uma operação requer uma role específica.
- No handoff: liste as roles aceitas. Ex: `permissões: role in [admin, owner]`.

### Scopes (OAuth-style)

- Sinais: `scopes: ['orders:read', 'orders:write']`, `@RequireScope('orders:write')`.
- Modelo: tokens carregam scopes; operação valida presença de scope específico.
- No handoff: liste os scopes necessários. Ex: `permissões: scope 'orders:write'`.

### Claims customizados

- Sinais: middleware inspeciona claims do JWT além de `sub`/`role` — `tenant_id`, `plan`, `region`.
- No handoff: liste os claims relevantes e os valores aceitos. Ex: `permissões: claim 'plan' in ['pro', 'enterprise']`.

### Policies / Guards (ABAC)

- Sinais: classes de policy avaliam regras complexas (`OrderPolicy.canCancel(user, order)`).
- Modelo: lógica dinâmica baseada em atributos do usuário + recurso.
- No handoff: descreva a regra em uma linha + cite o arquivo. Ex: `permissões: usuário deve ser owner do pedido (OrderPolicy::canCancel — src/policies/order.go:42)`.

---

## Ownership

Operações sobre recursos pessoais geralmente exigem que o usuário seja o **dono** (creator/owner) do recurso. Sinais:

- Handler busca `Order.where(id: params[:id], user_id: current_user.id)` — filtra por owner.
- Policy verifica `order.user_id === user.id`.
- Retorno é 404 (não 403) quando falha — para não revelar existência.

No handoff:
```
permissões: usuário deve ser owner do pedido (filtro implícito por user_id)
```

---

## Multi-tenancy

Frontends multi-tenant precisam saber:

1. **Como o backend identifica o tenant** — header `X-Tenant-Id`, subdomain, claim `tenant_id` no JWT, path param.
2. **Se há filtros implícitos** — toda query retorna apenas recursos do tenant.
3. **Se há recursos cross-tenant** — operações de admin podem ver tudo.

Exemplo no handoff:
```
auth: obrigatória (Bearer JWT)
permissões: tenant via claim 'tenant_id'; todas as queries filtram por tenant automaticamente
```

---

## Feature Flags

Quando uma operação só está disponível atrás de uma feature flag:

- Sinal: handler verifica `if (FeatureFlag.isEnabled('new_orders_v2', user))`.
- Comportamento de falha: 404, 403 ou status customizado.

No handoff:
```
permissões: feature flag 'new_orders_v2' habilitada para o usuário
```

E o frontend precisa decidir: esconder a UI quando flag desligada? Ou tentar e tratar erro?

---

## Comportamento de Falha

| Caso | Status esperado | Comportamento frontend |
|---|---|---|
| Token ausente | 401 | Redirect login + clear token |
| Token expirado | 401 (ou 419 em Laravel) | Tentar refresh, depois redirect |
| Token inválido (assinatura) | 401 | Clear token + redirect |
| Role/scope insuficiente | 403 | Mensagem "sem permissão" |
| Ownership falha | 403 OU 404 (verificar) | Conforme política do backend |
| Tenant mismatch | 403 OU 404 | Verificar com backend |
| Feature flag off | 403/404/200 com flag | Esconder UI ou tratar erro |

No handoff, declare o status real (com `[DÚVIDA]` se não confirmado).

---

## Dados Condicionais por Usuário

Algumas respostas mudam **shape** dependendo do usuário:

- Admin vê campos extras (`internal_notes`, `cost_price`).
- Owner vê o recurso completo, não-owner vê versão pública.
- Tenant A não vê dados do tenant B (filtro implícito).

No handoff, descreva isso explicitamente — frontend precisa lidar com schemas variáveis:

```markdown
**Response (200)** — shape depende do role:
- `role=admin`: inclui `cost_price`, `internal_notes`.
- `role=customer`: omite campos sensíveis.
```

---

## Inferência permitida vs proibida

**Permitido inferir** (com `[HIPÓTESE]`):
- Que JWT padrão é Bearer no header `Authorization` (convenção quase universal).
- Que cookie de sessão é HttpOnly se há flag de cookie no middleware.

**Proibido inferir** (precisa evidência ou `[DÚVIDA]`):
- Que existe RBAC se não há middleware/decorator/policy visível.
- Quais roles aceitam uma operação sem ver o código.
- Que multi-tenancy existe sem ver filtro por tenant em queries.
- Que refresh token existe sem ver endpoint `/auth/refresh` ou similar.
- Que feature flag existe sem ver chamada a flag service.

---

## Checklist por operação

- [ ] Auth é obrigatória? Confirmado por middleware/guard?
- [ ] Tipo de credencial identificado?
- [ ] Permissões listadas (roles, scopes, claims, ownership, tenant, flag)?
- [ ] Status code de falha de auth confirmado (401/403)?
- [ ] Status code de falha de autorização confirmado?
- [ ] Dados condicionais por usuário identificados (campos ocultos, filtros implícitos)?
- [ ] Refresh token / re-auth descrito se aplicável?

Item não confirmado → `[DÚVIDA]` no handoff. Frontend não deve adivinhar autenticação.
