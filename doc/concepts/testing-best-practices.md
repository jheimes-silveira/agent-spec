---
id: "agent-spec-testing-best-practices"
title: "Testing Best Practices (skill)"
sidebar_position: 6
---
# Testing Best Practices

> **Skill**: `agent-spec-testing-best-practices` · Framework reutilizável agnóstico de stack para gerar, revisar e executar testes com qualidade. Consumida pelos dois gates de QA.

Arquivo-fonte da skill: `.claude/skills/agent-spec-testing-best-practices/SKILL.md` + `references/`.

---

## TL;DR

A skill `agent-spec-testing-best-practices` é a **doutrina de testes** do projeto. Carrega sob demanda Iron Laws, padrões positivos, antipadrões nomeados, gates obrigatórios para agentes que escrevem testes, e disciplina de CI/flakiness. É invocada **antes** da execução por:

* **`agent-spec-qa-test-generator`** — aplica os 7 gates ao gerar cada caso de teste (Invariant First, Owning Layer, Real Execution, Failure→Fix Production, No Snapshot Without Contract, No Self-Set Mock, Negative Companion).
* **`agent-spec-qa-validator`** — aplica a checklist de 29 antipadrões + 15 red flags ao revisar arquivos de teste tocados pela task.

---

## Por que existe

Validar apenas critérios funcionais aprova testes oco: mocks que asseguram a si mesmos, snapshots de detalhes de implementação, sleeps fixos que mascaram flakiness, suítes 100% happy-path. A skill fornece o **vocabulário comum e os critérios objetivos** que os dois agentes de QA usam para detectar e bloquear esses defeitos antes que cheguem ao merge.

Sem a skill: cada agente improvisava sua noção de "teste ruim". Com a skill: nomes canônicos (`mock_driven_confidence`, `snapshot_as_test`, `fixed_sleep_wait`) entram em `testing_smells.antipadroes_detectados[]` no JSON do `agent-spec-qa-validator`, e o executor recebe correção dirigida.

---

## Arquitetura da skill

```
.claude/skills/agent-spec-testing-best-practices/
├── SKILL.md                              # gateway: Iron Laws + reference index + red flags
└── references/
    ├── fundamentos.md                    # placement, invariant-first, pyramid vs trophy
    ├── padroes.md                        # 12 padrões positivos
    ├── antipadroes.md                    # 29 antipadrões em 5 famílias
    ├── ai-escreve-testes.md              # 7 gates obrigatórios + Mock Budget Rule
    ├── ci-flakiness.md                   # taxonomia + quarentena + flaky_rate
    └── fontes.md                         # atribuição + bibliografia
```

`SKILL.md` é leve (~250 linhas). References só carregam quando o agente precisa do detalhe.

---

## As 6 Iron Laws

Ordem de precedência (menor número vence em conflito):

1. Testes existem para expor defeitos, não para manter CI verde.
2. Um teste falha por exatamente uma razão (a violação de uma invariante explícita).
3. Coloque o teste na camada mais baixa que ainda detecta a falha.
4. Sistemas reais portam o merge final — mocks isolam, não validam.
5. Falha = corrija o SUT, não o teste (editar o teste exige `SUT_IS_CORRECT_BECAUSE:`).
6. Nenhum código test-only vaza em produção.

---

## Os 7 gates para agentes (agent-spec-qa-test-generator)

Cada caso de teste gerado por agente DEVE atravessar:

| # | Gate | Output do gate |
| --- | --- | --- |
| 1 | **Invariant First** | `invariant`, `owning_layer`, `existing_suite` declarados |
| 2 | **Owning Layer** | Estende suíte existente OU justifica novo arquivo |
| 3 | **Real Execution** | `real_execution_boundary` declarado; pelo menos 1 caso por feature `!= "none"` |
| 4 | **Failure → Fix Production** | Falha investiga SUT primeiro; editar teste exige justificativa |
| 5 | **No Snapshot Without Contract** | Snapshot só se `PRODUCT_CONTRACT` |
| 6 | **No Self-Set Mock Assertion** | Mock Budget Rule + nada de assertion em mock auto-setado |
| 7 | **Negative Companion** | Caso positivo emparelhado com caso negativo |

Detalhe verbatim em [.claude/skills/agent-spec-testing-best-practices/references/ai-escreve-testes.md](https://github.com/).

---

## As 5 famílias de antipadrões (agent-spec-qa-validator)

**29 antipadrões nomeados** (3 adicionados após o post-mortem `cadastro-pratos-franquia`; AP-29 após o run `esqueci-a-senha`), mapeados para severidade na política débito-controlado do `agent-spec-qa-validator`:

| Família | Antipadrões críticos | Antipadrões altos | Antipadrões médios |
| --- | --- | --- | --- |
| **Brittleness** | `snapshot_as_test` (sem PRODUCT_CONTRACT) | `testing_internal_structure`, `testing_private_method`, `action_without_assertion`, **`tautological_assertion` (AP-29)** | `brittle_selector`, `vague_existence_assertion` |
| **Flakiness** | — | `fixed_sleep_wait`, `test_order_dependency`, `non_deterministic_input` | — |
| **Mock misuse** | `mock_driven_confidence` (assertion em mock auto-setado) | `mock_drift`, `over_mock_children`, `incomplete_mock`, `mock_at_wrong_level`, **`mock_of_own_repository` (AP-27)** | — |
| **Process** | `retry_as_fix`, `weakening_test_to_pass` | `happy_path_only`, `testing_third_party`, **`untestable_fail_fast` (AP-28)** | **`semantically_duplicated_test` (AP-26)** |
| **AI-specific** | — | `ai_zero_edge_cases` | — |

### Adições do post-mortem `cadastro-pratos-franquia`

| ID | Nome | Família | Motivação |
| --- | --- | --- | --- |
| **AP-26** | `semantically_duplicated_test` | Process / MÉDIO | T8 do post-mortem: CT-001 e CT-002 em `franchise_dish_routes_test.go` eram semanticamente idênticos e o QA aprovou com nota 9. Agora detecção determinística por tupla `(test_name_normalizado, alvo_chamado, parametros_chave, resultado_esperado)` — coincidência em ≥3/4 sem justificativa = duplicata. Table-driven (1 teste parametrizado) NÃO é duplicata. |
| **AP-27** | `mock_of_own_repository` | Mock misuse / ALTO | T5 do post-mortem: 3 rejeições de QA por mock do próprio `Repository` para testar `Repository` (variante de AP-10). Forçou extração ad-hoc da `franchiseDishQuerier` interface mínima. Agora a doutrina crava: extrair `XQuerier` no próprio repository; mock incide sobre a interface, SUT é o `Repository` real. |
| **AP-28** | `untestable_fail_fast` | Process / ALTO | T10 do post-mortem: `log.Fatalf` inline em `NewServer` impedia teste sem subprocess. Solução: extrair `ValidateXConfig(cfg) error` como função pura; caller decide `os.Exit(1)`. |

### Adição do run `esqueci-a-senha`

| ID | Nome | Família | Motivação |
| --- | --- | --- | --- |
| **AP-29** | `tautological_assertion` | Brittleness / ALTO | T3 do run: `assert.True(strings.Contains(msg,"[ERROR]") || sendErr != nil)` — a 2ª cláusula era sempre verdadeira (o `require.Error` anterior já garantia), tornando a asserção infalível. **QA marcou MÉDIO (via AP-05), Tech Review marcou high** — divergência de rubrica. Agora é antipadrão próprio com severidade **ALTO/blocking alinhada entre os dois gates**: asserção que nunca pode falhar mascara regressão (Iron Law #1). Distinto de AP-05 (`vague_existence_assertion`): aqui é *infalível*, não só frouxo. |

Todos os 29 estão em [.claude/skills/agent-spec-testing-best-practices/references/antipadroes.md](https://github.com/) com **gate question** (pergunta de detecção) e **fix** sugerido.

---

## Padrões positivos novos (#13 e #14)

Catálogo de padrões positivos cresceu de 12 → 14 após o post-mortem:

### #13 — Repository sobre query layer gerada (SQLC/Prisma/jOOQ/etc.)

> **Regra agnóstica**: nunca mocke o próprio `Repository` para testar `Repository`. Mocke a query layer gerada (`*db.Queries`, `PrismaClient`, `DSLContext`) **via interface mínima extraída no próprio repository**.

Pegadinha de detecção: se o teste de `XRepository` declara `type fakeXRepository` cujos métodos têm a **mesma assinatura do SUT**, é mock-driven confidence (AP-27). Fix: criar `XQuerier` interface no próprio arquivo do repository com **apenas os métodos que o repository chama**.

### #14 — Fail-fast testável

> **Regra**: validações de boot que terminam o processo (`os.Exit`, `log.Fatal`, `process.exit`) DEVEM ser extraídas como função pura `ValidateXConfig(cfg) error`. Caller (construtor / `main`) chama a função e decide morrer com `logger.Error + os.Exit(1)`.

Por que `logger.Error + os.Exit(1)` em vez de `log.Fatal`: garante que hooks de flush do logger executem antes do exit.

---

## Como os agentes usam

### agent-spec-qa-test-generator

1. Antes de gerar qualquer caso de teste, invoca `Skill(skill="agent-spec-testing-best-practices")`.
2. Lê `references/ai-escreve-testes.md` e `references/fundamentos.md`.
3. Para cada caso de teste, popula:
   * `invariant` (Gate 1)
   * `owning_layer` (Gate 1)
   * `existing_suite` (Gate 2)
   * `real_execution_boundary` (Gate 3)
   * `negative_companion` (Gate 7)
4. No nível raiz, popula `mock_budget_observado` (Gate 6) e `gates_aplicados`.

Ver [agent-spec-qa-test-generator (JSON de saída)](../agents/qa-test-generator.md).

### agent-spec-qa-validator

1. Antes de produzir o JSON, invoca `Skill(skill="agent-spec-testing-best-practices")`.
2. Lê `references/antipadroes.md`, `references/ai-escreve-testes.md`, `references/ci-flakiness.md`.
3. Aplica a checklist aos arquivos de teste tocados pela task.
4. Cada antipadrão detectado vira **simultaneamente**:
   * Item em `testing_smells.antipadroes_detectados[]` (nome canônico para telemetria).
   * Item em `problemas.{criticos|altos|medios|baixos}[]` (com `id`, `arquivo`, `linha`, `correcao_sugerida`).
   * O `problema_relacionado` em `testing_smells.*` aponta para o ID em `problemas.*` — assim o executor recebe contexto detalhado no loop de correção.

Política débito-controlado: antipadrões críticos/altos (mock-driven confidence, retry-as-fix, snapshot-as-test, weakening test to pass, fixed sleep, etc.) **reprovam** a task. Antipadrões médios/baixos (brittle selector, vague existence assertion, magic strings, cleanup leve, duplicata semântica) passam como `APROVADO_COM_OBSERVACOES` com débito anotado em `qa-observations.md`.

Ver [agent-spec-qa-validator (Gate 1)](../agents/qa-validator.md).

---

## Mock Budget Rule

Regra transversal aplicada em Gate 6 e em revisão:

* Testes podem mockar **apenas a fronteira do SUT** (rede, disco, clock).
* Testes que mockam **todos os colaboradores** DEVEM ter um companheiro de integração **sem mocks** para a mesma invariante.
* **Nenhuma assertion** em valor que o próprio teste escreveu no mock, a menos que:
  + (a) o SUT transforme o valor e a assertion seja sobre a transformação,
  + (b) a assertion seja sobre efeito colateral observável (DB, log, fila),
  + (c) o expected value venha de fonte externa verificável (contrato, constante do SUT).

Violação → `mock_budget_violado: true` no `testing_smells` + ALTO em `problemas.altos[]`.

---

## Disciplina de flakiness

Taxonomia, quarentena com owner+deadline, métricas mínimas (`flaky_rate < 1-2%`, `mean_time_to_quarantine < 1h`). Detalhe em [.claude/skills/agent-spec-testing-best-practices/references/ci-flakiness.md](https://github.com/).

Quando o `agent-spec-qa-validator` detecta indicadores de flakiness (presença de `sleep`, dependência de ordem, RNG não-determinístico, etc.), popula:

* `testing_smells.determinismo_observado`: `ok | suspeito | nao_determinista`.

---

## Fontes

Bibliografia consolidada em `references/fontes.md`.

---

## Próximos passos

* [agent-spec-qa-test-generator](../agents/qa-test-generator.md) — quem **aplica** os 7 gates ao gerar testes.
* [agent-spec-qa-validator (Gate 1)](../agents/qa-validator.md) — quem **detecta** antipadrões na revisão.
* [Gates e Loops](gates-loops.md) — onde a skill encaixa no pipeline.
