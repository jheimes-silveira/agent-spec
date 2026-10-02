# Padrões positivos — 14 práticas que sobrevivem a refactor

> Reference de `agent-spec-testing-best-practices`. Pseudo-código agnóstico de linguagem; adapte ao framework do projeto.

---

## 1. Query by role / semantic locator

Selecione elementos pela semântica que o usuário/cliente percebe, não pela estrutura interna.

```
// RUIM — quebra ao trocar HTML
const btn = page.querySelector('.btn-primary > span.label')

// BOM — quebra apenas se a semântica mudar (o que deve quebrar o teste)
const btn = page.getByRole('button', { name: 'Enviar pedido' })
```

Para API: selecione por **chave de contrato** (campo do response), nunca por posição em array sem ordem garantida.

---

## 2. Selector hierarchy

Quando precisar selecionar UI, prefira nesta ordem (mais estável → menos estável):

1. `getByRole({ name })` — semântica acessível.
2. `getByLabelText` — labels de form.
3. `getByPlaceholderText`, `getByText` — texto visível.
4. `getByTestId` — escape hatch quando nada acima serve.

Nunca use `xpath`, índice posicional ou classe CSS de estilização.

---

## 3. Wait on observable state

Nunca `sleep(N)`. Espere a **mudança observável** que confirma que o efeito ocorreu.

```
// RUIM — flaky em CI, lento em local
await sleep(2000)
expect(api.calls).toHaveLength(1)

// BOM — espera o sinal real
await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Salvo'))
```

Em testes de backend assíncrono, espere por: log estruturado, mensagem em fila, registro no DB, atributo HTTP. Nunca timeout fixo.

---

## 4. Test independence

Cada teste deve rodar **em qualquer ordem** e **sozinho** com `.only` sem mudar resultado.

Sintomas de violação:
- `beforeAll` populando dados que outros testes consomem.
- Sufixos numéricos no nome do teste indicando ordem ("test_01_create", "test_02_update").
- Falha quando rodado em paralelo.

**Cleanup em `beforeEach` (não `afterEach`)**: garante que o estado é limpo **antes** de cada teste rodar, não depois — se um teste falhar, o próximo ainda começa limpo.

---

## 5. One behavior per test

Uma invariante por teste. Múltiplas assertions são **ok** quando todas validam a mesma invariante.

```
// RUIM — testa 3 invariantes diferentes
it('flow de checkout', () => {
  expect(cart.total).toBe(100)          // pricing
  expect(emailService.sent).toBe(true)  // notification
  expect(db.orders).toHaveLength(1)     // persistence
})

// BOM — invariante explícita
it('persiste pedido confirmado com total final correto', () => {
  const order = db.orders[0]
  expect(order.status).toBe('confirmed')
  expect(order.total_cents).toBe(10000)
  expect(order.confirmed_at).not.toBeNull()
})
// (notification e pricing teriam seus próprios testes em owning_layer adequado)
```

---

## 6. Table-driven / parametrized

N cenários do mesmo comportamento → 1 teste parametrizado.

```
test.each([
  { input: 0,  expected: 'zero' },
  { input: 1,  expected: 'um' },
  { input: 10, expected: 'dez' },
])('formatar($input) retorna $expected', ({ input, expected }) => {
  expect(formatar(input)).toBe(expected)
})
```

Vantagens: menos código, falha localizada (sabe qual linha quebrou), fácil adicionar caso novo.

---

## 7. Builders / object mothers

Fixtures via **builder** ou **object mother**, nunca hardcode espalhado.

```
// RUIM — magic strings replicadas em 30 testes
const user = { id: '123', email: 'a@b.com', role: 'admin', tenantId: 't1', ... }

// BOM — builder com defaults sensatos + override por teste
const user = userBuilder().withRole('admin').build()
```

Object mother centraliza fixtures complexos; builder permite override fluente. Mantenha defaults realistas (não use `null`/`undefined` se produção nunca produz isso).

---

## 8. Mocks at boundaries (apenas)

Mocke I/O externo (rede, disco, clock, RNG). **Nunca** mocke colaborador interno do SUT.

```
// RUIM — mock de colaborador interno
const sut = new OrderService(mockPricingPolicy, mockInventoryPolicy, mockNotifier)
// teste agora valida a fiação, não a invariante

// BOM — mocks só nas bordas
const sut = new OrderService(realPricingPolicy, realInventoryPolicy, mockEmailGateway)
//                                                                     ^^^ borda real (I/O externo)
```

Ver Mock Budget Rule em `ai-escreve-testes.md`.

---

## 9. Real systems on the critical path

Toda feature deve ter **pelo menos um teste** que atravessa fronteira real (DB efêmero, HTTP via testcontainers, filesystem real).

- DB: use container (testcontainers, pg-mem com cuidado), schema completo via migrations reais.
- HTTP externo: cassette (VCR, MSW recordings) com refresh periódico.
- Filesystem: `tmpdir` real, não mock.

Critério: se você desabilitar todos os mocks e rodar o teste, ele ainda passa? Se sim, é real-system. Se não, é mock-driven.

---

## 10. Contract tests

Quando há fronteira entre provider e consumer (microserviços, SDK gerado, plugin), use **contract testing** para evitar drift:

- Provider expõe contrato versionado (OpenAPI, AsyncAPI, Pact, protobuf).
- Consumer testa contra **mock gerado do contrato** (não mock manual).
- Provider valida que sua implementação cumpre o contrato no CI.

Sem contract test, mocks divergem do real silenciosamente até prod quebrar.

---

## 11. Mutation score

Cobertura mede execução; **mutation score** mede detecção. Tools: PIT (Java), Stryker (JS/TS), mutmut (Python), gremlins (Ruby), go-mutesting (Go).

Workflow:
1. Mutator altera o código de produção (ex.: `>` vira `>=`, return invertido).
2. Roda suíte de testes.
3. Se **algum teste falhar** → mutação detectada (good).
4. Se **nenhum falhar** → mutação sobrevive — a suíte tem um buraco.

Meta razoável: 70-80% mutation kill rate em código de regra de negócio. Não persiga 100% — algumas mutações são equivalentes (semanticamente idênticas) e gastar tempo nelas é desperdício.

---

## 12. Page Object Model collapsado

POM ajuda quando há **reuso real** (muitos testes usando o mesmo fluxo). Sem reuso, POM é **abstração prematura** que ofusca o teste.

```
// RUIM — POM com 1 caller
class LoginPage {
  fillEmail(v) { ... }
  fillPassword(v) { ... }
  submit() { ... }
}
test('login', () => {
  const p = new LoginPage()
  p.fillEmail('a@b.com'); p.fillPassword('123'); p.submit()
})

// BOM — inline simples, leitura linear
test('login', () => {
  page.getByLabel('Email').fill('a@b.com')
  page.getByLabel('Senha').fill('123')
  page.getByRole('button', { name: 'Entrar' }).click()
})
```

Use POM apenas quando ≥3 testes compartilham o mesmo fluxo de UI **e** a UI é estável o suficiente para justificar a indireção.

---

## 13. Repository sobre query layer gerada (SQLC/Prisma/jOOQ/etc.)

Regra agnóstica: **nunca mocke o próprio Repository para testar o próprio Repository.** Mocke a camada de queries gerada (`*db.Queries` no SQLC, `PrismaClient` no Prisma, `DSLContext` no jOOQ) **via interface mínima extraída no próprio repository**.

```
// RUIM — mocka Repository para testar Repository (testa contra si mesmo)
type fakeFranchiseDishRepo struct{}
func (f *fakeFranchiseDishRepo) Create(ctx, in) (*dto.X, error) { ... }

func TestRepository_Create(t *testing.T) {
  repo := &fakeFranchiseDishRepo{}      // SUT é o fake
  result, _ := repo.Create(ctx, input)
  // assert no que o próprio fake retornou — mock-driven confidence (AP-10)
}

// BOM — repository declara interface mínima sobre a query layer; teste mocka A INTERFACE
type franchiseDishQuerier interface {
  InsertFranquiaPrato(ctx, params) (db.FranquiaPrato, error)
  CheckDuplicateFranchiseDishName(ctx, params) (int64, error)
}

type FranchiseDishRepository struct { q franchiseDishQuerier }

// teste mocka franchiseDishQuerier, SUT é Repository real
```

**Pegadinhas comuns**:
- Extrair a interface mínima no **arquivo do repository** (não em `internal/db/`) — fica óbvio que ela é específica do consumidor.
- Não inclua na interface métodos que o repository não chama. Interface "mínima" significa **apenas o necessário**.
- Quando a query layer já é interface (Prisma client é "kind of"), embrulhe em interface própria do repository para limitar escopo do mock e controlar o que o teste expressa.

**Heurística de detecção em revisão (QA / agent-spec-qa-test-generator)**: se o arquivo de teste do `XRepository` declara `type fakeXRepository` ou `mockXRepository` cujos métodos têm a **mesma assinatura do próprio Repository**, é mock-driven confidence (AP-10) — peça extração da `XQuerier` interface mínima.

---

## 14. Fail-fast no startup → extrair função pura testável

Validações de boot (bucket vazio, env var ausente, conexão de DB inválida) que terminam o processo (`os.Exit`, `log.Fatal`, `process.exit`, `System.exit`) são intestáveis sem fork de processo. **Sempre extraia a checagem como função pura** que retorna `error` (ou equivalente) e deixe a decisão de morrer ao caller.

```
// RUIM — checagem inlined; teste impossível sem subprocess
func NewServer(cfg *Config) *Server {
  if cfg.Bucket == "" {
    log.Fatalf("FRANQUIA_FICHA_TECNICA vazio") // não dá pra testar
  }
  return &Server{...}
}

// BOM — função pura testável; caller decide morrer
func ValidateServerConfig(cfg *Config) error {
  if cfg.Bucket == "" {
    return fmt.Errorf("FRANQUIA_FICHA_TECNICA vazio: bucket S3 obrigatório no startup")
  }
  return nil
}

func NewServer(cfg *Config, logger *slog.Logger) *Server {
  if err := ValidateServerConfig(cfg); err != nil {
    logger.Error("server config invalid", "error", err)
    os.Exit(1)              // fica isolado e óbvio que é decisão de boot
  }
  return &Server{...}
}

// teste cobre ValidateServerConfig com cada cenário de erro — sem subprocess
```

**Aceitável**:
- `os.Exit(1)` / `process.exit(1)` no caller, **após** a validação falhar e o log ser emitido.
- `log.Fatal` / `log.Fatalf` **só** se o projeto não tiver logger estruturado (raro) — quando tiver, prefira `logger.Error` + `os.Exit(1)` para não pular hooks de flush.

**Antipattern relacionado**: testar o construtor `NewServer` apenas verificando que `cfg.Bucket` foi atribuído ao campo (mock-driven confidence) sem nunca exercitar a regra de validação. Se o teste passa com a validação removida, é AP-10.
