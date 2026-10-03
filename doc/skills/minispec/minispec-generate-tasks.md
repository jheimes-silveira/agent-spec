---
id: "agent-spec-minispec-generate-tasks"
title: "agent-spec-minispec-generate-tasks"
sidebar_position: 4
---
# agent-spec-minispec-generate-tasks

`miniSpec` `Generator`
> **Resumo**: Terceira etapa do framework miniSpec. Recebe INTENT + SCOPE aprovados e gera (1) `task_plan.md` (índice) e (2) `tasks/T1.md`, `T2.md`, ... (tasks individuais). Delega Seção 5 (Testes) ao [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) **consolidado por camada**.

---

## Quando usar

* Após `intent.md` e `scope.md` aprovados.
* Antes de [agent-spec-minispec-run-tasks](minispec-run-tasks.md).

## Quando NÃO usar

* SCOPE em rascunho/não aprovado.
* Pipeline SDD → use [agent-spec-sdd-generate-task-plan](../sdd/sdd-generate-task-plan.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `intent.md` | Usuário (argumento) | Sim |
| Caminho do `scope.md` | Usuário (argumento) | Sim |
| `docs/adr/INDEX.md` | Existente no projeto | Não |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `task_plan.md` (índice) | `minispec.task_plan.path` | [agent-spec-minispec-run-tasks](minispec-run-tasks.md) |
| `tasks/T{n}.md` | `minispec.tasks.dir` + `minispec.tasks.pattern` | [agent-spec-minispec-run-tasks](minispec-run-tasks.md), executor |
| `.qa_context.md` (denso) | `minispec.qa_context.path` | [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) consolidado |

> **Regra crítica**: o `task_plan.md` é apenas **índice** (macro-fases + tabela). O **corpo** das tasks vive em `tasks/T{n}.md` separados.

---

## Fluxo de execução

### FASE 1 — Leitura e pesquisa

* Lê INTENT + SCOPE + ADR INDEX (se existir).
* **Verifica o campo "Design de referência"** no §3.1 do SCOPE (variantes web/mobile): se apontar para um `design.md`, **toda task que cria/modifica componente de camada UI** o lista na seção **3.3 Arquivos de Referência** (motivo: "contrato visual — layout e estados das telas"). Tasks sem camada UI não o referenciam (minimum-context); o conteúdo **nunca** é copiado para dentro da task — referência, não duplicação.
* Pesquisa codebase para reaproveitar implementações.

### FASE 2 — Decomposição em tasks

* Define macro-fases (geralmente 2-4).
* Para cada task: cria seções 1-4 e 6-7 do template (incluindo **§4.1 Exemplo de Payload** ⚡ quando expõe `PUT`/`PATCH` parcial).
* Aplica **10 regras** de decomposição (anti-fragmentação + anti-agregação + coerência).
* Delega Seção 5 (Testes) ao [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) **consolidado por camada**.
* Salva cada `tasks/TN.md`.

> **Seção 5 (Testes) — agnóstica de stack**: nomes de arquivo/função e framework derivam de `stack_discovery`/`existing_suite` do JSON (nunca cravados em Go/backend). Inclui **5.0 Padrões de Teste detectados**, **5.5 Rastreabilidade Critério de Conclusão → Testes** e **5.6 Detalhamento dos Casos de Teste** — 1 card lossless por CT (Invariant, Owning layer, Pré-condições, Passos, Resultado esperado, Negative companion, Precondição privilegiada), destrinchado do JSON. As tabelas 5.1–5.4 são o **índice**; o card é o **detalhe** que o revisor humano valida self-contained e o executor implementa. O JSON é persistido integralmente em `shared.test_cases.path` (`test-cases.json`, `task_id` por caso) — forward-only: após o destrinchamento, a task markdown é canônica. No `task_plan.md`, o flag "Pode Rodar em Paralelo?" tem **fonte única** (seção 4) — o grafo da seção 5 registra só a topologia, sem duplicar a coluna.

#### Regras de decomposição (10 regras)

As regras 1-8 cobrem anti-fragmentação e mandato de testes (Regras 1-7 anti-fragmentação + Regra 8 "Testes são MANDATÓRIOS — BLOQUEANTE" — ver detalhe em [Skill: agent-spec-minispec-generate-tasks](https://github.com/)). A 9ª é **anti-agregação** e a 10ª é **coerência de dependências e escopo**:

**Regra 9 ⚡ — Anti-Agregação de Contratos + Handlers (BLOQUEANTE)**: se uma task acumula `≥ 3 contratos novos` (DTOs/Requests/Responses) + `≥ 1 handler com lógica` → quebrar em ≥ 2 tasks:

* Task A: base do sub-pacote + DTOs + Requests/Responses + mocks
* Task B (e C, D...): handlers por verbo ou agrupamento natural

> **Motivação**: T7 do post-mortem `cadastro-pratos-franquia` (= base + Requests + Responses + 2 handlers) cascateou ADR-0010 nas tags HTTP, mock-driven confidence em handlers compostos, e correção exigiu mexer em DTO+Service+Responses+Handlers simultaneamente.

**Regra 10 ⚡ — Coerência de dependências e escopo (BLOQUEANTE)**: validada antes de fixar a ordem das tasks — **10a** nenhuma task referencia (nem em assertion) símbolo nascido em task posterior, **e persiste** `Símbolos públicos criados`/`Símbolos consumidos de outras tasks` na seção 1 de cada `TN.md`; **10b** mudança com blast radius além dos arquivos tocados lista os dependentes em §3.2 e valida no escopo do blast radius; **10c** mudança de assinatura inclui os dependentes mecanicamente forçados em §3.2 (não conta como `scope_deviation`); **10d** o flag `Pode Rodar em Paralelo?` é **derivado** do DAG + símbolos persistidos ([Invariante de Paralelismo](../../configuration/framework-paths.md)), nunca autorado — default na incerteza: `Não`.

> **Motivação (run `esqueci-a-senha`)**: T3 referenciava `service.EmailSender`, nascida em T5 → reorder forçado (10a); mudanças de assinatura forçaram tocar callers fora do escopo (10c); migração no topo da pilha quebrou down-tests cross-package (10b).

### FASE 3 — Frontmatter de cada task

Cada `tasks/T{n}.md` recebe frontmatter obrigatório:

```markdown
- model: sonnet | opus
- risk: low | medium | high
- gates: [qa] | [qa, tech_review] | none   # INFERIDO por tipo de task
```

#### Heurística `gates` por tipo de task (Gates inference rules) ⚡

Cross-framework definida em [`agent-spec-workflow-rules.md`](../../configuration/path-templates.md). Resumo:

| `tipo` inferido | `gates` |
| --- | --- |
| `docs`, `config_isolada`, `constantes_isoladas` | `none` |
| `wiring/registry`, `crud_handler` (pattern existente), `service_simples` | `[qa]` |
| `db_migrations`, `auth/security/crypto`, `padrao_novo`, `refactor_cross_module`, `service_complexo` | `[qa, tech_review]` |
| Default na dúvida | `[qa, tech_review]` (conservador) |

**Aplicação**: cada `tasks/T{n}.md` declara `gates` com comentário explícito: `gates: [qa] # tipo=crud_handler`.

> **Motivação**: rodar Tech Review em 10 tasks do post-mortem gastou ~30-50min em wiring/config triviais. Inferindo por `tipo`, ~5 tasks vão para `[qa]`-only.

### FASE 4 — task_plan.md (índice)

Após todas as tasks salvas, monta `task_plan.md` com macro-fases, tabela, dependências.

### FASE 5 — Otimização: qa_context proativo

Gera `.qa_context.md` (~1.5k tokens) consumido pelo gerador consolidado.

---

## Gates invocados

* **[agent-spec-qa-test-generator](../../agents/qa-test-generator.md)** — para Seção 5 (Testes), invocado em modo **consolidado por camada** (1 invocação por camada de infra/domínio/integração/e2e+packaging).

> Esta skill **não** roda gates de validação.

---

## Otimizações

### qa_context.md proativo (Passo 0)

Antes de invocar qualquer subagente, extrai `~1.5k tokens` densos de INTENT + SCOPE com:

* **Mapa CA → CT** (rastreabilidade compactada).
* **Componentes-chave** com paths absolutos.
* **Fluxos críticos** (1-2 linhas cada).
* **Decisões arquiteturais** que afetam testes.

Subagentes leem esse arquivo em vez do scope completo. **Economia**: ~4-6k tokens × N subagentes invocados.

O arquivo começa com um **cabeçalho de proveniência** (data de geração + fonte `intent.md`+`scope.md` + aviso de staleness) para permitir detectar quando o scope foi editado depois (ex.: via `/agent-spec-challenge-spec`) e o contexto ficou STALE — nesse caso o run-tasks loga o aviso e consulta INTENT/SCOPE diretamente.

### Consolidação por camada

A skill agrupa tasks por **4 camadas canônicas** e dispara **1 subagente por camada** (não 1 por task):

| Camada | Conteúdo típico |
| --- | --- |
| **infra** | Migrations, schemas, repositories, providers, DI |
| **domínio** | Services, regras de negócio, validators, entidades |
| **integração** | Handlers/controllers, contratos HTTP/GraphQL, eventos |
| **e2e + packaging** | Fluxos completos, smoke tests, build/release |

Retorno: JSON multitask com **chave por task ID**:

```json
{
  "T1": { "section_5_testes": "<conteúdo da Seção 5 da T1>" },
  "T2": { "section_5_testes": "<...>" }
}
```

**Economia**: `N invocações → 4 invocações` (ou menos se alguma camada está vazia). Para feature com 6 tasks: 6 → 4 (33% menos).

Detalhes em [qa_context pré-extraído](../../advanced/qa-context.md) e [QA Consolidation](../../advanced/qa-consolidation.md).

---

## Templates / assets usados

* `assets/task_plan_template.md` — estrutura do índice.
* `assets/task_template.md` — estrutura da task individual (7 seções).

---

## Exemplo de uso

```bash
/agent-spec-minispec-generate-tasks docs/specs/features/catalogo-filtros/v1/intent.md \
                          docs/specs/features/catalogo-filtros/v1/scope.md
```

```
[Lê intent + scope + ADR index]
[Decompõe em 4 tasks: T1 (repository), T2 (service), T3 (handler), T4 (e2e)]
[Consolidação por camada: 1 invocação agent-spec-qa-test-generator]
[Salva 4 tasks/T*.md + task_plan.md + .qa_context.md]

✅ task_plan.md + 4 tasks salvas.
Próximo passo: /agent-spec-minispec-run-tasks <task_plan.md> <agent_name>
```

---

## Skills relacionadas

* [agent-spec-minispec-generate-scope](minispec-generate-scope.md) — etapa anterior.
* [agent-spec-minispec-run-tasks](minispec-run-tasks.md) — próxima etapa.
* [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) — invocado consolidado por camada.
* [agent-spec-sdd-generate-task-plan](../sdd/sdd-generate-task-plan.md) — equivalente SDD.

## Configuração via framework-paths.md

Paths usados: `minispec.intent.path`, `minispec.scope.path`, `minispec.task_plan.path`, `minispec.tasks.dir`, `minispec.tasks.pattern`, `minispec.qa_context.path`, `minispec.state.path`, `adr.index_file`. Veja [Path Templates](../../configuration/path-templates.md).
