# Delegação QA — Estratégia de Testes (multi-variante)

> Este arquivo é consultado pela skill `agent-spec-sdd-generate-tech-spec` no momento de preencher a **Seção de Estratégia de Testes** do TECH_SPEC. A numeração varia por variante:
>
> - **Web**: seção **17** (sub: 17.1 Unit, 17.2 Integ, 17.3 E2E, 17.4 Erros)
> - **Mobile**: seção **18** (sub: 18.1, 18.2, 18.3, 18.4)
> - **Backend**: seção **19** (sub: 19.1, 19.2, 19.3, 19.4)

A seção de testes do TECH_SPEC **NÃO** deve ser preenchida pelo arquiteto. Você DEVE delegar para o subagente **`agent-spec-qa-test-generator`** que retorna um JSON estruturado. Depois, você converte o JSON em markdown para a seção correta.

---

## Quando executar

Após coletar todas as decisões técnicas e preencher as seções anteriores à de Testes, **ANTES de salvar o arquivo final**.

---

## Passo 1: Preparar a lista de arquivos

Monte a lista de `arquivos` que o subagente deve ler. Inclua TODOS os caminhos relevantes:

- **PRD aprovado**: path resolvido a partir de `sdd.prd.path` (`.claude/rules/agent-spec-sdd-workflow-rules.md`)
- **Regras do projeto**: `CLAUDE.md`, `.claude/rules/*.md` (se existirem)
- **Migrações / schema**: arquivos de migração/esquema relacionados à feature, conforme o padrão do codebase (ex.: `*/migrations/*.sql`, `*/migrate/*.go`, `prisma/migrations/*`, `db/migrate/*.rb`, `alembic/versions/*.py`)
- **Camada de dados**: arquivos de queries/repositories relacionados à feature, conforme a stack (ex.: `*.sql` com SQLC, schema Prisma, repositórios/DAOs)
- **Testes existentes**: busque arquivos de teste do projeto na convenção da stack (ex.: `*_test.go`, `*.spec.ts`/`*.test.ts`, `test_*.py`, `*_test.dart`, `*Test.java`) para o subagente entender padrões
- **Código-fonte existente**: arquivos que serão modificados pela feature

---

## Passo 2: Preparar as instruções

Monte o campo `instrucoes` com:

1. **Frente da TECH SPEC** (`frente: web | mobile | backend`) — decidida em FASE 0 da skill. Esse campo orienta o subagente a aplicar a **matriz de stacks de teste** correta (Passo 3).
2. O conteúdo completo do **TECH_SPEC parcial (seções já preenchidas)** que você montou até o momento.
3. Os **critérios de aceitação (CA-XX)** extraídos do PRD.
4. Os **componentes arquiteturais** envolvidos (handlers, services, repositories, BLoCs, hooks, páginas, etc.) — variam por frente.
5. Qualquer contexto adicional relevante para o QA.

---

## Passo 3: Disparar o subagente

Lance o subagente usando a ferramenta `Agent` com:

- **subagent_type**: `agent-spec-qa-test-generator`
- **description**: "QA gerar testes tech_spec"
- **prompt**: Monte o prompt com os 3 parâmetros obrigatórios:

```
Você foi invocado com os seguintes parâmetros:

1. **frente**: <web | mobile | backend>          ← NOVO. Deriva de FASE 0 da skill agent-spec-sdd-generate-tech-spec.
2. **arquivos**: [lista de caminhos dos arquivos preparados no Passo 1]
3. **instrucoes**: [conteúdo preparado no Passo 2]

OBRIGATÓRIO: Antes de gerar casos de teste, leia (Read) a doutrina de testes: `.claude/skills/agent-spec-testing-best-practices/SKILL.md` e `.claude/skills/agent-spec-testing-best-practices/references/ai-escreve-testes.md`. Aplique os 7 gates (Invariant First, Owning Layer, Real Execution, Failure→Fix Production, No Snapshot Without Contract, No Self-Set Mock, Negative Companion). Cada caso de teste DEVE conter os campos `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion` e, quando aplicável, `precondicao_privilegiada`.
```

> **Modelo**: não passe `model` no `Agent({...})` — confie no default configurado para o subagente.

### Matriz de stacks de teste por frente

Inclua no campo `instrucoes` esta matriz para guiar o subagente:

| Frente | Unitários (típicos) | Integração (típicos) | E2E (típicos) | Cenários de Erro / Especiais |
|--------|---------------------|----------------------|---------------|------------------------------|
| **web** | Vitest / Jest + Testing Library, MSW para mocks de fetch | Componente + store + API mockada (MSW) | Playwright \| Cypress \| WebdriverIO | Erros de rede, fallback offline, validação a11y/i18n |
| **mobile** | Jest (RN) \| `flutter_test` \| XCTest \| JUnit/Espresso; bloc_test, mockito, mockk | Repository + DB local in-memory; mocks de hardware | Patrol \| Detox \| Appium \| XCUITest \| Espresso | Permissão negada, sem rede, conflito offline-first, hardware indisponível |
| **backend** | Vitest/Jest \| `go test` \| pytest \| JUnit; mocks de interfaces | Handler + service + DB real (testcontainers / sqlite in-memory) | HTTP black-box (supertest, RestAssured, custom client) | Constraints, rate-limit, timeouts de dependências, idempotência |

> Se o subagente desconhecer um framework do stack do projeto, ele deve **propor** o equivalente idiomático e nomear claramente. Não invente frameworks.

---

## Passo 4: Converter JSON em Markdown (Seção de Testes)

O subagente retorna um JSON com `casos_teste[]`. Você DEVE converter para o formato markdown da seção de testes correspondente à variante:

| Frente | Seção destino do TECH_SPEC |
|--------|----------------------------|
| Web    | **17** (subseções 17.1 / 17.2 / 17.3 / 17.4) |
| Mobile | **18** (subseções 18.1 / 18.2 / 18.3 / 18.4) |
| Backend | **19** (subseções 19.1 / 19.2 / 19.3 / 19.4) |

> Nas instruções abaixo, `X` representa a numeração da seção principal (17, 18 ou 19) — substitua conforme a variante.

### Mapeamento de tipos

| Campo `tipo` no JSON | Subseção destino |
|---------------------|-----------------|
| `UNITARIO` | **X.1 Testes Unitários** |
| `COMPONENTE` | **X.1 Testes Unitários** — agrupado sob heading próprio `Componente: ...` / `Widget: ...` (frontend/mobile) |
| `INTEGRACAO` | **X.2 Testes de Integração** |
| `E2E` | **X.3 Testes End-to-End** |
| `SEGURANCA` | **X.4 Cenários de Erro** (subseção segurança) |
| `ACESSIBILIDADE` | **X.1** quando `owning_layer` é `unit` (teste de componente) · **X.3** quando `owning_layer` é `e2e` |

> O generator **não emite** `PERFORMANCE` (testes de carga são proibidos por contrato — viram `recomendacoes`). Se aparecer tipo desconhecido, registre em observação e trate como `INTEGRACAO`.

### Mapeamento de categorias para X.4

Além dos testes tipo `SEGURANCA`, inclua em X.4 todos os `casos_teste` com `categoria` igual a:
- `tratamento_erro`
- `caso_extremo`
- `fronteira` (quando o teste foca em comportamento de erro)

### Formato de saída por subseção

> **IMPORTANTE**: o formato abaixo é **idêntico** ao das subseções da Estratégia de Testes nos templates (`tech_spec_template_*.md`) — CT-ID, CA e Objetivo são obrigatórios em toda linha. Sem eles, o `agent-spec-sdd-generate-task-plan` não consegue fazer a redistribuição heurística (que exige "CTs detalhados com mapeamento CA") e re-dispara o QA desnecessariamente.
>
> **Coluna "Setup (caminho legítimo)"** (anti-violação da Iron Law #6): popule de `precondicao_privilegiada` do JSON — `caminho_legitimo` + `teste_analogo` quando `presente: true`; use `—` quando `presente: false`. É a receita de como montar precondição privilegiada (auth/contexto/relógio/identidade) **sem alargar a superfície de produção**.
>
> **Célula "Objetivo"**: priorize o campo `invariant` do JSON (propriedade que deve valer independente da implementação).

**X.1 Testes Unitários** — agrupe os testes pela camada arquitetural correspondente à frente:

- **Web**: `Componente: [NomeComponente]`, `Hook: [useNomeHook]`, `Store/Slice: [NomeSlice]`
- **Mobile**: `BLoC/ViewModel: [Nome]`, `Widget: [Nome]`, `Repository: [Nome]`
- **Backend**: `Service: [NomeService]`, `Apresentação: [NomeHandler]`, `Dados: [NomeRepository]`

```markdown
#### [Camada]: [Nome] (`arquivo de teste na convenção da stack`)

Mock: [interfaces mockadas]

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-XX | [nome na convenção da stack] | CA-XX | [invariant do JSON] | [dados_entrada] | [resultado_esperado] | [mocks] | imite `[teste_analogo]`: [caminho_legitimo] |
```

**X.2 Testes de Integração**:

```markdown
#### [Camada A + Camada B] (`arquivo de teste na convenção da stack`)

Setup: [extrair de pre_condicoes — DB in-memory, MSW, mocks de hardware, fixtures]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-XX | [nome na convenção da stack] | CA-XX | [invariant do JSON] | [passos resumidos] | [resultado_esperado] | imite `[teste_analogo]`: [caminho_legitimo] |
```

**X.3 Testes E2E**:

```markdown
#### Fluxo: [título do CT] (CT-XX)
- **Framework**: [framework E2E da stack descoberta — rule de testing-stack / CLAUDE.md / testes existentes]
- **CA**: CA-XX, CA-YY
- **Objetivo**: [invariant do JSON]
- **Pré-condições**: [pre_condicoes — se `precondicao_privilegiada.presente: true`, transcreva o `caminho_legitimo` e o `teste_analogo`]
- **Passos**:
  1. [passo 1]
  2. [passo 2]
- **Validações**: [resultado_esperado + observacoes]
```

**X.4 Cenários de Erro**:

```markdown
| Cenário | CA | Objetivo | Trigger | Status / Log Esperado |
|---------|----|----------|---------|------------------------|
| [título] | CA-XX | [invariant do JSON] | [dados_entrada] | [resultado_esperado] |
```

### Tabela de Rastreabilidade

Monte a tabela a partir do campo `criterios_aceitacao_validados` de cada caso de teste — formato **idêntico** ao dos templates:

```markdown
### Rastreabilidade: Critérios de Aceite → Testes

| CA (PRD) | Descrição Resumida | Testes |
|----------|--------------------|--------|
| CA-01    | (descrição curta do CA no PRD) | CT-01, CT-10, CT-20 |
```

### Informações adicionais do JSON

- **`cenarios_nao_cobertos`**: adicione como nota após a tabela de rastreabilidade
- **`recomendacoes`**: adicione como nota após cenários não cobertos
- **`erros_leitura`**: se houver, mencione quais arquivos não puderam ser lidos

---

## Passo 5: Validar como arquiteto

Antes de integrar a seção de testes no TECH_SPEC:

1. Verifique **coerência** com as seções anteriores (componentes, fluxos, APIs/telas/integrações mencionados nos testes existem?).
2. Verifique que **todos os CA-XX** do PRD têm pelo menos um teste na tabela de rastreabilidade — e a **validação reversa**: nenhum CT referencia um CA que **não existe** no PRD (`criterios_aceitacao_validados` alucinado). Se houver CA inexistente, rejeite o JSON e re-dispare com instrução pontual.
3. Verifique que os **frameworks de teste** propostos batem com a **stack descoberta** (rule `testing-stack.md` → CLAUDE.md → testes existentes do projeto). NÃO imponha frameworks específicos — a matriz do Passo 3 é ilustrativa; a fonte de verdade é o que o projeto já usa.
4. Ajuste nomenclatura de componentes se o subagente usou nomes diferentes dos definidos nas seções anteriores.
5. Complemente se algum cenário crítico ficou de fora.
6. **Conformidade com `agent-spec-testing-best-practices`** (NOVO):
   - `mock_budget_observado` no JSON é `true`?
   - `gates_aplicados` contém os 7 gates?
   - Cada caso de teste tem `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion` preenchidos?
   - Pelo menos um caso por feature tem `real_execution_boundary != "none"`?
   - Cada caso positivo (`categoria: caminho_feliz | interacao_usuario`) tem `negative_companion.presente: true` apontando para um caso negativo?
   - Se algum item falhar, **re-disparar** o subagente com instrução pontual para corrigir, OU rejeitar o JSON e abrir solicitação no chat.
   - **`stack_discovery.discovery_needed`**: se `true`, o subagente não conseguiu resolver um detalhe **não-derivável do código** (ex.: framework E2E não padronizado). Recomende ao usuário rodar **`/agent-spec-testing-stack-bootstrap`** para descobrir a stack (com questionário do não-derivável) e gerar a rule `.claude/rules/testing-stack.md` — depois reexecute a delegação. Não bloqueie a geração por isso; siga best-effort com o proposto.

---

## Passo 5.5: Persistir o JSON em `shared.test_cases.path` (OBRIGATÓRIO)

Após a validação do Passo 5 (JSON aceito), persista o retorno do subagente **integralmente** no path resolvido via `shared.test_cases.path` (`.claude/rules/agent-spec-workflow-rules.md`). A renderização markdown da seção de testes é **lossy** (comprime `pre_condicoes`, `passos`, `negative_companion`, `precondicao_privilegiada` em células de tabela); o JSON persistido é a fonte **lossless** que o `agent-spec-sdd-generate-task-plan` consome na redistribuição heurística — sem re-parse de markdown e sem re-invocação do generator.

Formato do arquivo (envelope do orquestrador em volta do schema canônico do agente):

```json
{
  "schema_version": 1,
  "framework": "sdd",
  "feature": "{feature}",
  "version": "{version}",
  "atualizado_em": "YYYY-MM-DD",
  "stack_discovery": { ...do JSON do agente... },
  "casos_teste": [ { ...caso canônico do agente..., "task_id": null } ],
  "cenarios_nao_cobertos": [],
  "recomendacoes": [],
  "mock_budget_observado": true,
  "gates_aplicados": []
}
```

Regras:
- `task_id: null` em todos os casos — nesta fase as tasks ainda não existem; o `agent-spec-sdd-generate-task-plan` preenche na distribuição.
- Se o arquivo já existe (re-execução da skill), **sobrescreva** — nesta fase o tech_spec ainda é o documento em construção e o JSON acompanha sua última geração.
- Se você re-disparou o subagente (Passo 5, item 6) e fez merge de correções, persista o resultado final consolidado.
- **Canonicidade**: este arquivo é artefato de geração forward-only — depois que os CTs forem destrinchados nas tasks pelo task-plan, a task markdown é canônica e os gates leem só ela (ver bloco em `agent-spec-workflow-rules.md`).

---

## Passo 6: Integrar e continuar

1. Insira a seção de testes convertida no TECH_SPEC (seção 17 Web | 18 Mobile | 19 Backend).
2. Preencha a seção **Arquivos Envolvidos** (seções 3.4-3.7, aninhadas em Arquitetura da Solução nas três variantes).
3. Preencha o **Checklist Final** (última seção do template).
4. Salve o arquivo e apresente ao usuário.

**NÃO peça aprovação isolada da seção de testes** — apresente o TECH_SPEC completo para validação final.

---

## Regra de unicidade de CTs (na fase de tech_spec)

> A deduplicação **CT→task** acontece na fase de task plan (tasks ainda não existem aqui) — a regra completa vive em `agent-spec-sdd-generate-task-plan/references/qa-delegation-tasks.md`. Na fase de tech_spec, garanta apenas:

- [ ] Cada CT tem **ID único** (sem CT-XX repetido na Estratégia de Testes).
- [ ] Cada CT pertence a **exatamente 1 camada** (unit OU integração OU E2E) — o mesmo comportamento validado em camadas diferentes usa CTs distintos.
- [ ] Smoke/manual tests aparecem 1 única vez.
