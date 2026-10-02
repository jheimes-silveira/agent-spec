# Antipadrões — 29 sinais de teste mal escrito

> Reference de `agent-spec-testing-best-practices`. Use como checklist durante revisão (agent-spec-qa-validator) ou geração (agent-spec-qa-test-generator).
>
> Para cada antipattern: **nome canônico** (em inglês, igual ao JSON), **família**, **gate question** (pergunta que detecta), **fix**, **severidade sugerida** para `agent-spec-qa-validator.testing_smells`.

---

## Família 1: Brittleness (AP-01..AP-06; a família tem 7 com o AP-29, listado na seção de adendos)

### AP-01 — `brittle_selector`
**Família**: Brittleness · **Severidade**: MÉDIO

Seletor depende de classe CSS, índice ou xpath.

- **Gate question**: O seletor quebra se um designer trocar `class="btn-primary"` por `class="cta-button"`?
- **Fix**: Use `getByRole`, `getByLabel` ou `getByText`. Se nada serve, `data-testid` como escape hatch.

### AP-02 — `testing_internal_structure`
**Família**: Brittleness · **Severidade**: ALTO

Teste valida estado interno (variável privada, ordem de chamadas internas), não comportamento observável.

- **Gate question**: Renomear o método interno `_calculate()` quebra o teste sem mudar o comportamento externo?
- **Fix**: Reescreva validando o **output** observável pelo cliente do SUT.

### AP-03 — `testing_private_method`
**Família**: Brittleness · **Severidade**: ALTO

Acesso via reflection, `private` exposto só pra teste, helper que retorna estado interno.

- **Gate question**: O teste só compila porque algum modificador de visibilidade foi relaxado?
- **Fix**: Teste via API pública. Se o método privado é complexo demais para ser testado indiretamente, extraia-o como unidade pública própria.

### AP-04 — `snapshot_as_test`
**Família**: Brittleness · **Severidade**: CRÍTICO (sem PRODUCT_CONTRACT) / ALTO (caso de uso questionável)

Snapshot substitui asserções específicas. Diff aceito sem leitura.

- **Gate question**: O artefato snapshotado é `PRODUCT_CONTRACT` (API pública, SDK gerado, OpenAPI) ou `IMPLEMENTATION_DETAIL` (texto UI, DOM, JSON interno)?
- **Fix**: Se IMPLEMENTATION_DETAIL, **proibido** snapshot — escreva assertions específicas. Se PRODUCT_CONTRACT, snapshot é permitido **e** o diff deve ser revisado linha-a-linha.

### AP-05 — `vague_existence_assertion`
**Família**: Brittleness · **Severidade**: MÉDIO

`expect(thing).toBeTruthy()`, `expect(result).toBeDefined()`, `.should('exist')` sem validar conteúdo.

- **Gate question**: Se a função retornar `{}` (vazio mas truthy), o teste passa?
- **Fix**: Asserte o valor específico esperado (`toBe(42)`, `toEqual({id:1,...})`).

### AP-06 — `action_without_assertion`
**Família**: Brittleness · **Severidade**: ALTO

Teste executa ação mas não verifica nada — passa só por não crashar.

- **Gate question**: Removendo a única assertion do teste, ele ainda passa?
- **Fix**: Toda ação precisa de assertion sobre o estado observável resultante.

---

## Família 2: Flakiness (AP-07..AP-09)

### AP-07 — `fixed_sleep_wait`
**Família**: Flakiness · **Severidade**: ALTO

`sleep(N)`, `Thread.sleep(N)`, `cy.wait(2000)`, `await new Promise(r => setTimeout(r, N))` com tempo fixo.

- **Gate question**: Existe um valor literal de milissegundos no teste fora de um setup de timeout máximo (`waitFor({ timeout: 5000 })`)?
- **Fix**: Espere o **sinal observável** (texto na tela, request feito, registro no DB), não um tempo arbitrário.

### AP-08 — `test_order_dependency`
**Família**: Flakiness · **Severidade**: ALTO

Teste A precisa rodar antes de B; falha com `.only` em B ou em ordem alternada.

- **Gate question**: Rodando apenas este teste com filtro, ele passa? Rodando em ordem invertida do arquivo, todos passam?
- **Fix**: Cleanup em `beforeEach`, fixtures locais, sem `beforeAll` populando estado global.

### AP-09 — `non_deterministic_input`
**Família**: Flakiness · **Severidade**: ALTO

Uso direto de `new Date()`, `Math.random()`, `Date.now()`, `process.hrtime()`, locale do sistema sem fixar.

- **Gate question**: Rodando o teste à meia-noite UTC, em fuso UTC-3, com locale `tr_TR`, ele ainda passa?
- **Fix**: Injete clock/RNG/locale como dependência. Em e2e, freeze do clock via `cy.clock()`, `jest.useFakeTimers()` ou equivalente.

---

## Família 3: Mock misuse (AP-10..AP-14; a família tem 6 com o AP-27, listado na seção de adendos)

### AP-10 — `mock_driven_confidence` (assertion em mock auto-setado)
**Família**: Mock misuse · **Severidade**: CRÍTICO

O teste **seta** um valor no mock e depois **asserta** que o mock retornou esse valor. Está testando o próprio setup, não o SUT.

```
// EXEMPLO RUIM
mockUserRepo.findById.mockReturnValue({ id: 1, name: 'Ana' })
const result = await service.getUser(1)
expect(result.name).toBe('Ana') // <-- só confirma que o mock funciona
```

- **Gate question**: Se o SUT ignorar completamente o retorno do mock e devolver hardcoded, o teste detecta?
- **Fix**: Asserte propriedades **derivadas** pelo SUT (formato, transformação, side-effect), não valores que o teste mesmo plantou. Ou use sistema real.

### AP-11 — `mock_drift`
**Família**: Mock misuse · **Severidade**: ALTO

Mock continua retornando shape antigo após o real ter mudado.

- **Gate question**: O contrato do colaborador está versionado (OpenAPI, types compartilhados)? O mock é gerado dele?
- **Fix**: Use contract test ou tipos compartilhados (gerados do schema do colaborador real). Periodicamente, re-grave cassettes contra o real.

### AP-12 — `over_mock_children`
**Família**: Mock misuse · **Severidade**: ALTO

Em testes de componente, todo filho é mockado para "isolar" — o teste vira teste do mock, não da composição.

- **Gate question**: Quantos componentes filhos foram mockados? Mais que 1-2 é red flag.
- **Fix**: Renderize a árvore real. Mocke apenas **fronteiras** (HTTP, storage, navegação externa).

### AP-13 — `incomplete_mock`
**Família**: Mock misuse · **Severidade**: ALTO

Mock retorna apenas os campos que o teste consome — produção quebra ao consumir campo ausente.

- **Gate question**: O retorno do mock tem **todos** os campos que o SUT pode consumir (mesmo em branch não-testada)?
- **Fix**: Use object mother que produz fixture completo, ou tipo gerado do schema.

### AP-14 — `mock_at_wrong_level`
**Família**: Mock misuse · **Severidade**: ALTO

Mocka método rápido e seguro (que poderia ter rodado real) só por hábito; ou mocka cedo demais e perde a chance de testar a integração.

- **Gate question**: O método mockado é I/O externo de verdade? Se for cache local, helper puro ou clock injetável, por que mockar?
- **Fix**: Mock budget — só mocke fronteira do SUT. Tudo dentro roda real.

---

## Família 4: Process (AP-15..AP-24; a família tem 12 com AP-26/AP-28, listados na seção de adendos)

### AP-15 — `coverage_as_vanity`
**Família**: Process · **Severidade**: MÉDIO

`%` de cobertura como única métrica em PR ou OKR.

- **Gate question**: Cobertura subiu para 95% e zero bugs foram introduzidos pelos testes novos?
- **Fix**: Reporte mutation score, defect escape rate ou mean-time-to-detect junto. Cobertura sozinha mente.

### AP-16 — `happy_path_only`
**Família**: Process · **Severidade**: ALTO

Apenas o caminho feliz testado; null, vazio, erro, fronteira ausentes.

- **Gate question**: Cada teste positivo tem um companheiro negativo? (ver Gate 7 em `ai-escreve-testes.md`)
- **Fix**: Negative Companion obrigatório.

### AP-17 — `eternal_beforeAll`
**Família**: Process · **Severidade**: MÉDIO

`beforeAll` populando dados que múltiplos testes leem e mutam — testes ficam acoplados por ordem invisível.

- **Gate question**: Algum teste do arquivo modifica dados criados em `beforeAll`?
- **Fix**: Mover setup para `beforeEach` (limpo a cada teste) ou usar fixtures locais por teste.

### AP-18 — `cleanup_in_afterEach`
**Família**: Process · **Severidade**: BAIXO

Limpeza em `afterEach`: se um teste crasha antes do cleanup, o próximo herda lixo.

- **Gate question**: O `afterEach` pode falhar silenciosamente e deixar estado sujo?
- **Fix**: Cleanup em `beforeEach` (limpa **antes** de cada teste — robusto a crash do anterior).

### AP-19 — `magic_strings`
**Família**: Process · **Severidade**: BAIXO

Constantes/IDs replicados em N testes; lógica de cálculo dentro do teste duplicando o SUT.

- **Gate question**: O mesmo literal (UUID, email, threshold) aparece em 3+ testes?
- **Fix**: Extraia constantes/builders. Mas não exagere — abstração prematura é pior que duplicação leve.

### AP-20 — `testing_third_party`
**Família**: Process · **Severidade**: ALTO

Teste depende de endpoint externo que você não controla (`api.github.com`, `httpbin.org`).

- **Gate question**: O teste falha se o endpoint externo cair?
- **Fix**: Cassette/stub local; teste contra contract gravado, não live.

### AP-21 — `quarantine_as_cemetery`
**Família**: Process · **Severidade**: MÉDIO

`it.skip`, `xit`, `@Disabled` sem owner, sem motivo, sem deadline.

- **Gate question**: Tem comentário com `@owner`, `@motivo`, `@deadline` em cada teste skipado?
- **Fix**: Skipar exige metadados. Sem owner+deadline em 24h, delete o teste.

### AP-22 — `retry_as_fix` (auto-retry escondendo bug)
**Família**: Process · **Severidade**: CRÍTICO

CI configurado para retry de teste 3x; o teste passa eventualmente; merge. Bug real continua lá.

- **Gate question**: O CI retry > 1? Existe telemetria de qual teste retry-ou e qual é o flaky rate?
- **Fix**: Retry só com **telemetria visível** + quarentena automática após N retries. Sem isso, retry é dívida tóxica.

### AP-23 — `duplicate_cross_layer`
**Família**: Process · **Severidade**: MÉDIO

A mesma invariante testada em unit, integration **e** e2e — quebra em 3 lugares quando muda, sem ganho de detecção.

- **Gate question**: Esse comportamento é detectável em layer baixa? Se sim, o e2e está redundante.
- **Fix**: Mova para owning_layer mais baixo possível; e2e fica para fluxo crítico ponta-a-ponta, não para regra de negócio.

### AP-24 — `weakening_test_to_pass`
**Família**: Process · **Severidade**: CRÍTICO

Teste falhou; alguém **relaxou a assertion** para passar (ex.: `toBe(42)` virou `toBeGreaterThan(0)`).

- **Gate question**: O diff git mostra assertions sendo enfraquecidas no mesmo commit que "corrige" o SUT?
- **Fix**: Editar teste exige `SUT_IS_CORRECT_BECAUSE:` justificado (Iron Law #5). Reverter relaxamento.

---

## Família 5: AI-specific e adendos pós-post-mortem (AP-25..AP-29)

> AP-25 é o único da família AI-specific. AP-26..AP-29 são adendos catalogados aqui por ordem cronológica de descoberta, mas pertencem às famílias declaradas em seus corpos (AP-26/AP-28 → Process; AP-27 → Mock misuse; AP-29 → Brittleness).

### AP-25 — `ai_zero_edge_cases`
**Família**: AI-specific · **Severidade**: ALTO

Teste gerado por agente com 6+ assertions de happy-path e zero teste negativo, fronteira ou erro.

- **Gate question**: Existe companheiro negativo (Gate 7)? Existe pelo menos um teste de fronteira/erro para essa invariante?
- **Fix**: Aplique os 7 gates de `ai-escreve-testes.md`. Reject se Negative Companion ausente.

> Os outros antipadrões AI-specific (auto-mock everything, no real execution, snapshot-as-evidence) estão **absorvidos** nos 7 gates de `ai-escreve-testes.md`.

### AP-26 — `semantically_duplicated_test`
**Família**: Process · **Severidade**: MÉDIO

Dois ou mais testes no mesmo arquivo (ou nos arquivos tocados pela task) validando o mesmo cenário com mudança cosmética — variável renomeada, mesmo `(Name, Method, Path/Symbol, Status/Result esperado)`. Confusão comum: usar table-driven seria o caminho, mas o autor copiou-colou.

- **Gate question**: Para cada par de testes, a tupla `(test_name_normalizado, alvo_chamado, parametros_chave, resultado_esperado)` coincide em ≥ 3 dos 4 campos? Há diferença comportamental real entre eles, ou só cosmética?
- **Fix**: Consolidar em um único teste parametrizado (table-driven — ver padrão #6) ou remover o redundante. Inclua justificativa no commit se a duplicação for intencional (extremamente raro).
- **Heurística determinística (agent-spec-qa-validator usa)**: ignorar `it.each`/`test.each`/table-driven — um único teste parametrizado **não** é duplicata. Reportar apenas pares de funções de teste autonômas com tuplas equivalentes.

> Esse antipadrão apareceu no post-mortem `cadastro-pratos-franquia` T8: CT-001 e CT-002 em `franchise_dish_routes_test.go` eram semanticamente idênticos e foram aprovados pelo QA com nota 9. Tech Review apontou tarde. Por isso virou heurística determinística no Camada 5 do `agent-spec-qa-validator`.

### AP-27 — `mock_of_own_repository`
**Família**: Mock misuse · **Severidade**: ALTO

Teste do `XRepository` mocka uma `fakeXRepository`/`mockXRepository` com **assinatura idêntica ao SUT** e asserta no resultado do próprio fake. Variante específica de AP-10 (mock-driven confidence) que aparece sistematicamente em repositórios sobre query layer gerada (SQLC/Prisma/jOOQ).

- **Gate question**: O fake declarado no teste tem a mesma interface que o SUT? Removendo o fake e usando a query layer real (mesmo que mockada em nível mais baixo), o teste detectaria um bug real no repository?
- **Fix**: Extrair `XQuerier` interface mínima sobre a query layer gerada **no próprio arquivo do repository**; o teste mocka `XQuerier`, SUT é o `XRepository` real. Ver padrão #13 em `padroes.md`.

### AP-28 — `untestable_fail_fast`
**Família**: Process · **Severidade**: ALTO

Validação de startup termina o processo inline (`log.Fatal`, `os.Exit`, `process.exit`, `System.exit` dentro do construtor) — impossível testar sem fork de subprocess. Resultado: o "teste" verifica apenas atribuição de campo (`expect(server.cfg.bucket).toBe(cfg.bucket)`), nunca a regra real.

- **Gate question**: A regra de validação tem cobertura de teste? O teste exercita o caminho de erro (campo vazio → erro), ou só verifica que o valor passou através do construtor?
- **Fix**: Extrair `ValidateXConfig(cfg) error` como função pura; o caller (construtor / `main`) chama `ValidateXConfig` e decide morrer com `logger.Error + os.Exit(1)`. Teste cobre `ValidateXConfig`. Ver padrão #14 em `padroes.md`.

### AP-29 — `tautological_assertion`
**Família**: Brittleness · **Severidade**: ALTO

Asserção que **nunca pode falhar**, logo não detecta regressão: ramo sempre-verdadeiro numa disjunção (`assert(A || cond)` onde `cond` já está garantida por uma asserção anterior — ex.: `require.Error(err)` seguido de `assert.True(strings.Contains(msg, "[ERROR]") || err != nil)`, cuja 2ª cláusula é sempre verdadeira), `expect(true).toBe(true)`, comparação de um valor consigo mesmo, ou condição logicamente implicada pelo setup. Distinta de AP-05 (`vague_existence_assertion`): aqui a asserção é **infalível**, não apenas frouxa.

- **Gate question**: Existe ALGUM estado do SUT — incluindo o bug que o teste deveria pegar — em que esta asserção falha? Se não existe, ela é decorativa (Iron Law #1).
- **Fix**: Asserte o ramo específico que importa (a condição real), removendo a disjunção sempre-verdadeira. Se duas condições são alternativas legítimas, separe em casos/asserções distintos.

> Severidade ALTO (bloqueia) **alinhada entre os dois gates**: tanto `agent-spec-qa-validator` (Camada 5) quanto `agent-spec-staff-architecture-review` classificam asserção tautológica como `ALTO`/blocking — mascara regressão (Iron Law #1). Originou-se da divergência de rubrica no run `esqueci-a-senha` T3 (QA marcou MÉDIO via AP-05, Tech Review marcou ALTO para o mesmo achado).

---

## Mapeamento severidade → política débito-controlado

Lembre-se: na política débito-controlado do agent-spec-qa-validator, **críticos, altos e médios bloqueiam** (entram no loop de correção); **só baixos viram observação** (anotados na §2 do `_run/run-report.md` para cleanup futuro, sem reprovar). A severidade aqui define se o antipadrão **bloqueia** ou apenas **anota**.

| Severidade no testing_smells | Mapeia para `problemas.*` | Efeito no veredito |
|---|---|---|
| CRÍTICO | `problemas.criticos[]` | Bloqueia → `REJEITADO` |
| ALTO | `problemas.altos[]` | Bloqueia → `REJEITADO` |
| MÉDIO | `problemas.medios[]` | Bloqueia → `REJEITADO` |
| BAIXO | `problemas.baixos[]` | Anota → `APROVADO_COM_OBSERVACOES` |

Antipattern detectado → vira item no array de problemas correspondente (com `id`, `arquivo`, `linha`, `correcao_sugerida` como qualquer outro problema) com o campo **`smell`** preenchido com o nome canônico; sinais agregados vão em `testing_smells.red_flags_detectadas[]`. (O antipadrão individual NÃO é mais listado num array próprio — contrato pós-redução de payload do `agent-spec-qa-validator`.) Quando crítico/alto/médio, dispara `REJEITADO`; só quando baixo fica registrado sem bloquear.
