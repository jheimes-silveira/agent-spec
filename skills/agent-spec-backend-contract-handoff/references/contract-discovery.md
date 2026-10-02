# Guia — Descoberta de Contratos (agnóstico de stack)

> Usado pela skill durante a FASE 1. Objetivo: localizar **toda evidência observável** de um contrato antes de gerar a seção `Contracts` do handoff. Sem evidência, marca `[DÚVIDA]`.

---

## Ordem de Prioridade

Sempre comece pela fonte mais formal e desça:

1. **Contrato formal**: `openapi.yaml` / `openapi.json` / `*.proto` / `schema.graphql`. É o único lugar onde tipos, paths e operações estão declarados sem ambiguidade.
2. **Roteador / registry de rotas**: arquivo único que lista todas as rotas (`routes.go`, `main.py`, `app.module.ts`, `RouteServiceProvider.php`, `routes.rb`). Confirma quais paths existem e quais handlers respondem.
3. **Handlers / controllers / resolvers**: o código que executa a operação. Confirma payloads, validação, status codes e side effects.
4. **DTOs / models / serializers / validators**: declaram o shape de entrada/saída e regras de validação.
5. **Middlewares / guards / policies / interceptors**: declaram autenticação, autorização, rate limit.
6. **Migrations / ORM models**: confirmam tipos de coluna, nullability, defaults — fonte de verdade para o shape de retorno.
7. **Testes** (`*_test.*`, `*.spec.*`, `*Test.*`): exercitam comportamento real — fonte forte para fixtures e edge cases.
8. **Documentação inline** (docstrings, anotações `@OpenAPI`, `swagger:operation`): valiosa quando bate com 1–7. Suspeite se divergir.

> Se 1 (contrato formal) **conflitar** com 3 (código), assuma que o **código** é a fonte de verdade e marque `[DÚVIDA]` para alinhar o contrato formal. Backend real sempre vence backend declarado.

---

## Onde procurar — por área de responsabilidade

### Rotas / Entry points

| Sinal | Termos para grep / glob |
|---|---|
| Definição de rotas | `route`, `router`, `register_route`, `app.get/post/put`, `mount`, `Endpoint`, `@RestController`, `@RequestMapping`, `@app.route`, `Route::get`, `routes.draw` |
| Definição de handler | `func ... (w http.ResponseWriter, r *http.Request)`, `async def handler`, `public ResponseEntity`, `IActionResult`, `Response`, `Reply` |
| GraphQL | `type Query`, `type Mutation`, `type Subscription`, `@Resolver`, `Resolver`, `resolveType`, `schema.graphql` |
| RPC/gRPC | `service ... { rpc }`, `*.proto`, `RpcController`, `ServerStreaming`, `Bidirectional` |
| WebSocket / events | `WebSocket`, `Hub`, `Channel`, `EventEmitter`, `subscribe`, `publish`, `consumer`, `producer` |

### DTOs / Schemas / Validação

| Sinal | Termos para grep / glob |
|---|---|
| Validação declarativa | `zod`, `yup`, `joi`, `class-validator`, `@IsString`, `@NotNull`, `@Valid`, `pydantic.BaseModel`, `Validator`, `FormRequest`, `serializer`, `Marshmallow` |
| Tipos de dados | `struct`, `class`, `interface`, `type`, `record`, `data class`, `case class`, `dataclass`, `attrs` |
| Schemas | `openapi.yaml`, `schema.graphql`, `*.proto`, `*.json-schema`, `*.avsc` |

### Auth / AuthZ

| Sinal | Termos para grep / glob |
|---|---|
| Middleware/guard | `middleware`, `guard`, `policy`, `authorize`, `requires_auth`, `@RolesAllowed`, `@Authorize`, `@PreAuthorize`, `before_action`, `requires_scopes` |
| Sessão / token | `session`, `cookie`, `jwt`, `bearer`, `oauth`, `token`, `access_token`, `refresh_token`, `claims` |
| Multi-tenant / RBAC | `tenant_id`, `account_id`, `org_id`, `role`, `permission`, `scope`, `cabac`, `abac`, `casbin`, `cancan`, `pundit` |

### Side effects

| Sinal | Termos para grep / glob |
|---|---|
| Eventos | `publish`, `emit`, `produce`, `dispatch`, `event_bus`, `outbox`, `Notification`, `Listener`, `Subscriber` |
| Jobs | `enqueue`, `dispatch`, `delay`, `queue`, `sidekiq`, `celery`, `bullmq`, `taskqueue`, `Worker`, `Job`, `Cron` |
| Cache | `cache.set`, `cache.del`, `invalidate`, `evict`, `Redis`, `Memcached`, `CDN`, `purge` |

### Migrations / Schema do banco

| Sinal | Globs típicos |
|---|---|
| Migrations puras | `**/migrations/*.sql`, `**/db/migrate/*.rb`, `**/migrations/*.py`, `**/migrations/V*__*.sql` (Flyway), `**/changelogs/**` (Liquibase) |
| ORM/ODM models | `**/models/**`, `**/entities/**`, `**/schemas/**`, `**/domain/**` |

### Testes (validam comportamento real)

| Globs típicos |
|---|
| `**/*_test.go`, `**/*_test.py`, `**/*.test.{ts,js}`, `**/*.spec.{ts,js}`, `**/*Test.java`, `**/*Tests.kt`, `**/*_spec.rb`, `**/Test*.cs`, `**/feature/**` |

---

## Padrões por stack (referência rápida — não acoplar)

> **Use como ponto de partida**, não como verdade. Sempre confirme abrindo arquivos do projeto real.

### Go

- Rotas: `chi`, `gorilla/mux`, `gin`, `echo`, `fiber`, `net/http`. Procure `func registerRoutes`, `r.Get`, `r.Mount`, `router.GET`.
- Handlers: `func(w http.ResponseWriter, r *http.Request)` ou `func(c *gin.Context)`.
- DTOs: `struct` com tags `json:"..." validate:"..."` (validator/v10), `binding:"..."` (gin).
- Auth: middlewares em `internal/middleware/`, frequentemente JWT via `github.com/golang-jwt/jwt`.
- Migrations: `golang-migrate`, `goose`, `atlas` → `*.sql` em `internal/db/migrations/`.
- Queries: `sqlc`, `sqlx`, `pgx` — gera código a partir de `*.sql` em `internal/db/queries/`.

### Node.js / TypeScript

- Rotas: `express`, `fastify`, `hapi`, `koa`, NestJS (`@Controller`, `@Get`, `@Post`), tRPC (`router({...})`).
- DTOs: `zod`, `joi`, `yup`, `class-validator` + `class-transformer`.
- Auth: `passport`, `next-auth`, `@nestjs/jwt`, `@nestjs/passport`, custom middleware.
- GraphQL: `apollo-server`, `mercurius`, `nestjs/graphql` — resolvers + schema.
- Migrations: `prisma migrate`, `knex`, `typeorm`, `drizzle-kit`.

### Java / Kotlin

- Rotas: `@RestController` + `@RequestMapping`/`@GetMapping`/`@PostMapping` (Spring), Micronaut `@Controller`, Ktor `routing { get {} }`.
- DTOs: classes/records com `@Valid`, `@NotNull`, `@Size`, `@Pattern` (jakarta.validation / hibernate-validator).
- Auth: Spring Security (`SecurityFilterChain`), `@PreAuthorize`, `@RolesAllowed`.
- Migrations: Flyway (`V*__name.sql`), Liquibase (XML/YAML changelogs).
- ORM: JPA/Hibernate (`@Entity`), JOOQ, Exposed (Kotlin).

### C# / .NET

- Rotas: `[ApiController]` + `[Route]` + `[HttpGet]/[HttpPost]`, Minimal APIs (`app.MapGet`).
- DTOs: `record`s, `class`es com `[Required]`, `[StringLength]`, FluentValidation.
- Auth: `[Authorize]`, policies (`AddAuthorization` + `RequireClaim`), ASP.NET Identity.
- Migrations: EF Core (`dotnet ef migrations`), Dapper + raw SQL.

### Python

- Rotas: FastAPI (`@app.get`/`@app.post` + `BaseModel`), Flask (`@app.route`), Django REST (`ViewSet`, `APIView`), Litestar, Starlette.
- DTOs: `pydantic.BaseModel`, `marshmallow.Schema`, `serpy`, Django serializers.
- Auth: `Depends(get_current_user)` em FastAPI, `@login_required` em Django, `flask-login`, Authlib.
- Migrations: Alembic (`versions/*.py`), Django migrations (`*/migrations/*.py`).

### Ruby

- Rotas: `config/routes.rb` (Rails — `resources`, `get`, `namespace`), Sinatra (`get '/path' do`).
- DTOs: ActiveModel + Strong Parameters, dry-validation, contratos via `dry-schema`.
- Serializers: `ActiveModel::Serializer`, `jsonapi-serializer`, `blueprint`.
- Auth: Devise, Pundit (políticas), CanCanCan (abilities).
- Migrations: Rails (`db/migrate/*.rb`).

### PHP / Laravel

- Rotas: `routes/api.php`, `routes/web.php` — `Route::get`, `Route::resource`, `Route::middleware`.
- DTOs: `FormRequest` (`app/Http/Requests/`), API Resources (`app/Http/Resources/`).
- Auth: `auth` middleware, Sanctum (`auth:sanctum`), Passport, Gates, Policies (`app/Policies/`).
- Migrations: `database/migrations/*.php` (Eloquent).

### Mobile como backend (Local SDK)

- iOS: módulos Swift que expõem repositories/data sources locais; persistência via Core Data / Realm / SQLite.
- Android: módulos Kotlin/Java com Room, Realm, SQLDelight.
- Cross-platform: Flutter (`drift`, `isar`, `sembast`), React Native (`watermelondb`, `realm`, `sqlite`).
- O "contrato" são as interfaces/funções expostas do módulo, não endpoints HTTP. Documente como API local com mesma estrutura.

---

## Checklist de descoberta — por operação

Para cada operação no escopo, confirme as evidências:

- [ ] Encontrei a rota/registro (qual arquivo+linha).
- [ ] Encontrei o handler/controller/resolver.
- [ ] Encontrei o DTO/schema de entrada com regras de validação.
- [ ] Encontrei o DTO/schema de saída.
- [ ] Mapeei TODOS os branches de erro do handler (não apenas o happy path).
- [ ] Confirmei auth/permissão (middleware/guard/decorator presente ou ausente).
- [ ] Listei side effects emitidos (eventos, jobs, cache).
- [ ] Olhei os testes que exercitam essa operação — capturei casos de teste para virar fixtures.
- [ ] Se há contrato formal, comparei com o código — anotei divergências.

Item não confirmado → `[DÚVIDA]` ou `[HIPÓTESE]` no handoff. Nunca silenciar.

---

## Sinais de drift entre código e contrato formal

Quando OpenAPI/GraphQL/protobuf existe, compare com o código real. Sinais de drift comuns:

- Campo no spec, ausente no código (campo morto) → marque `[DÚVIDA]` e cite ambos.
- Campo no código, ausente no spec (subdocumentado) → use o código.
- Status code declarado vs status code real divergem → use o código.
- Tipo declarado vs tipo serializado divergem (ex: spec diz `integer`, código retorna `string`) → use o código.
- Auth declarada no spec mas middleware ausente, ou vice-versa → marque `[DÚVIDA]`.
