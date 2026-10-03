---
id: "agent-spec-minispec-run-tasks"
title: "agent-spec-minispec-run-tasks"
sidebar_position: 5
---
# agent-spec-minispec-run-tasks

`miniSpec` `Orchestrator`
> **Resumo**: Etapa final do framework miniSpec. Orquestra a execução das tasks geradas pelo `task_plan.md`, delegando ao executor da stack e validando cada task pelos 2 gates (QA + Tech Review). Estrutura idêntica ao [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html).

Detalhes operacionais em [Pipeline — agent-spec-minispec-run-tasks](/pipeline/minispec-run-tasks.html).

---

## Quando usar

* Após `task_plan.md` + `tasks/T{n}.md` aprovados (gerados em [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html)).

## Quando NÃO usar

* Pipeline SDD → use [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html).
* Pipeline TaskCard → use [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `task_plan.md` | Usuário (argumento) | Sim |
| `agent_name` (executor da stack) | Usuário (argumento) | Não (omitido → descoberta interativa) |
| `tasks/T{n}.md` | Gerados em [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) | Sim |
| `scope.md`, `intent.md`, `.qa_context.md` | Referência sob demanda | Sim |
| `minispec_state.yaml` | Atualizado durante execução | Sim |
| Repositório git inicializado | Pré-requisito (aborta se ausente) | Sim |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path | Quando |
| --- | --- | --- |
| Código implementado (stage real via `git add`) | Repositório | Após gates aplicáveis aprovarem (Gate 2 para `[qa, tech_review]`; fechamento da FASE 5 para `[qa]`/`none`) |
| `task_plan.md` atualizado (status) | `minispec.task_plan.path` | Após cada task |
| `minispec_state.yaml` atualizado | `minispec.state.path` | Início e fim |
| `qa-observations.md` | `shared.qa_observations.path` | Auto-escalações e tasks bloqueadas |
| `base_sha` + sumário do executor | em memória do orquestrador (inline no prompt dos gates) + linha `[T{N}] base_sha=<sha>` em `qa-observations.md` | Após cada executor concluir; sem arquivo intermediário `execution-summary` |
| `T{N}.md` (memória lazy) | `shared.temp_memory.dir` | Apenas em rejeição |

---

## Fluxo de execução

Estrutura idêntica ao [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html). As fases são:

1. **FASE 0** — Inicialização (git, cleanup, state, carregamento do bloco [Disciplina do Executor (Iron Rules)](/configuration/executor-discipline.html), **instrumentação de [rule mining](/skills/shared/mine-rule-candidates.html)** — emite `pre_refinement_decision` se houver agent-spec-pre-refinement, prepara consumo de `rule_candidates_emitidos[]` dos gates —, **Resume pós-interrupção** (item 6.1): se QUALQUER dos 3 sinais de sessão interrompida existir — task com Status `Em Progresso` no task\_plan.md, memória lazy recente (< 24h) de task não-concluída, diff não-staged em paths declarados de task não-concluída — pergunta via `AskUserQuestion` com 3 opções: **retomar nos gates** (usa `base_sha` da memória lazy ou, se ausente, o grep de `[T{N}] base_sha=` em `qa-observations.md` persistido na pré-execução 2.1) / **reexecutar do zero** (`git checkout` nos modificados + deleção explícita de untracked declarados em "a criar", já que `git checkout` não os remove) / **resolver manualmente**, e **validade do `qa_context.md`** (item 6.2: se `scope.md` for mais recente que `.qa_context.md`, loga stale e trata o contexto como não-confiável).
2. **FASE 1** — Grafo de dependências.
3. **FASE 2** — Execução por Fase (paralelismo declarado quando seguro) ⚡ — ver abaixo.
4. **FASE 3** — Gate 1 ([agent-spec-qa-validator](/agents/qa-validator.html)).
5. **FASE 3.5** — Loop QA em rejeição.
6. **FASE 4** — Gate 2 ([agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html)).
7. **FASE 4.4** — Loop Tech Review em rejeição.
8. **FASE 4.5 / FASE 5 (passo 0)** — Stage real (`git add`) de TODA task aprovada (no Gate 2 para `[qa, tech_review]`; no fechamento da FASE 5 para `[qa]` e `none`).
9. **FASE 5** — Atualização de estado (task\_plan.md + minispec\_state.yaml).

### Disciplina do Executor (Iron Rules) 🛡️

A cada delegação ao executor (FASE 2), o orquestrador injeta **verbatim** o bloco entre `<<<EXECUTOR_DISCIPLINE … EXECUTOR_DISCIPLINE>>>` da referência [`references/executor-discipline.md`](/configuration/executor-discipline.html) — arquivo **canônico desta skill**, com symlinks em `agent-spec-sdd-run-tasks` e `agent-spec-taskcard-run` (**não é rule** do system-prompt; é carregado lazy na FASE 0). O sub-agente roda em contexto isolado e não enxerga essa referência. Sem o bloco, as **6 Iron Laws** anti-vícios-de-LLM — as 4 adaptadas das Karpathy Guidelines (Pense antes / Simplicidade / Cirúrgico / Goal-driven) + Disciplina de testes + Lei do seam (Iron Law #6) — não chegam ao executor. Violações da Regra #2 viram problemas `speculative_complexity` no Gate 2.

### Instrumentação de Rule Mining (não-bloqueante)

Durante o run, o orquestrador persiste candidatos a regra em `shared.rule_candidates.path` para a skill [`agent-spec-mine-rule-candidates`](/skills/shared/mine-rule-candidates.html) consolidar offline. Trigger points no fluxo miniSpec:

| Quando | Sinal | Origem |
| --- | --- | --- |
| **FASE 0** | `pre_refinement_decision` | Cada item da seção 11 ("Decisões já tomadas (fora de negociação)") do `pre-refinement.md` (se existir) |
| **FASE 2 (executor)** | `executor_askquestion` | Executor disparou `AskUserQuestion` durante a task |
| **FASE 2 (executor)** | `exemplar_file_read` | Executor leu arquivo de `arquivos_referencia` da task |
| **Pós-Gate 1** | `repeated_fixture`, `repeated_assertion_shape` | Consome `rule_candidates_emitidos[]` do JSON do [agent-spec-qa-validator](/agents/qa-validator.html) |
| **Pós-Gate 2** | `convention_drift`, `scope_deviation`, `speculative_complexity` | Consome `rule_candidates_emitidos[]` do JSON do [staff-review](/agents/staff-architecture-review-agent.html) |

Arquivo é **lazy** (só nasce quando o primeiro sinal qualifica); deduplicação intra-run via grep `{signal} | {evidence}`; **falhas de append são não-bloqueantes** — orquestrador nunca rejeita task por falha de instrumentação.

### FASE 2 — Execução por Fase ⚡

A coluna "Pode Rodar em Paralelo?" do `task_plan.md` é um flag **DERIVADO** (computado pelo gerador, nunca autorado por intuição) que o orquestrador **RE-VERIFICA** com os guards da rule [Execução Paralela de Tasks](/configuration/path-templates.html) — não confia cego na coluna:

1. Mesma fase no task\_plan.
2. `Paralelo? = Sim` (flag derivado).
3. **Independência no DAG** (nenhuma task do lote é ancestral/descendente de outra — dependência direta ou transitiva).
4. **Disjunção de símbolo declarado** (campos `Símbolos públicos criados` / `Símbolos consumidos de outras tasks` da seção 1 de cada task: `consumidos(ti) ∩ criados(tj) = ∅`; em interseção, o consumidor sai do lote).
5. **Paths declarados disjuntos** (sem interseção entre tasks do lote).
6. **Nenhum arquivo de alta contenção** em comum (container DI, router/registry, barrel exports, manifests/lockfiles, migrations).
7. Lote ≤ **MAX\_PARALLEL = 4**.

Qualquer guard sem **prova** de independência → **fallback automático para sequencial** com log do motivo específico (qual guard, qual símbolo/arquivo).

**Mecânica**:

* `base_sha` capturado UMA vez antes do lote.
* Despacho concorrente: todos `Agent()` numa ÚNICA mensagem.
* Gates por task em paralelo (QA→TR sequencial POR task).
* **Guard de recursos de teste**: se ≥ 2 tasks do lote têm testes de integração/E2E não-vazios, os QAs do lote são **serializados** (um por vez, em ordem de ID) — suítes concorrentes no mesmo working tree colidem (DB/porta/fixture) e geram flake. Exceção: isolamento provado (banco efêmero por suíte, portas dinâmicas) — logue a prova. Executores continuam paralelos.
* `git add -N -- <task_paths>` roda logo após o executor (FASE 2.4, **antes do Gate 1**) — torna arquivos novos/untracked visíveis no `git diff --name-only <base_sha>` que alimenta a Camada 0 do QA.
* Gates por task em pipelines independentes **SEM barreira**: o Tech Review de cada task despacha assim que o QA DELA aprova (não espera os QAs das demais).
* Stage determinístico (ordem de ID) após os **gates aplicáveis** de cada task aprovarem — inclui tasks fast-path (`[qa]`, `none`), que de outro modo terminariam unstaged.
* Falha isolada: 1 task em retry não trava as outras. **Guard executor×QA**: o executor de correção só é despachado quando nenhum QA de outra task do lote estiver rodando suíte (integração/E2E/completa) — editar o working tree durante uma suíte gera flake e queima tentativa de task inocente. Drene os QAs pendentes antes de iniciar a correção. QAs de testes unitários puros não disparam o guard.

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: T1-T4 foram declaradas paralelas mas rodaram sequenciais (~40min). Em paralelo real seriam ~10min.

### Resolução de `gates` (Gates inference rules) ⚡

Ao parsear frontmatter de cada task:

```
gates resolvido =
1. task.frontmatter.gates # declarado
OR 2. Gates inference rules (tipo → gates) # inferido
OR 3. [qa, tech\_review] # default conservador
```

Tabela completa em [Fast-path Gates — Heurística aplicada pelas skills geradoras](/advanced/fast-path-gates.html).

---

## Gates invocados

| Gate | Agent | Quando |
| --- | --- | --- |
| **Gate 1** | [agent-spec-qa-validator](/agents/qa-validator.html) | Após executor concluir cada task |
| **Gate 2** | [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html) | Após Gate 1 aprovar |

* **Lista real de arquivos para o QA (Camada 0 não-circular)**: o QA é proibido de rodar git — o **orquestrador** roda `git diff --name-only <base_sha>` e envia essa lista como autoritativa de arquivos tocados. A lista NÃO é montada apenas das seções declaradas da task (isso tornaria circular a checagem de presença dos entregáveis na Camada 0).
* **Status do Tech Review (5)**: `approved`, `approved_with_observations`, `partial` (≥ 1 `high`, sem `critical`), `rejected` (≥ 1 `critical`) e `skipped_qa_rejected` — este último sinaliza erro de orquestração (TR invocado com QA reprovado): o orquestrador loga em `qa-observations.md` e volta ao loop de correção do QA.

Detalhes em [Gates e Loops](/concepts/gates-loops.html).

---

## Loops e correção

* **Limite**: 3 tentativas TOTAIS compartilhadas QA + Tech Review.
* **Memória lazy**: `/docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` (criada apenas em rejeição; co-localizada com as tasks). Guarda `attempt_count`, **`base_sha`** (também persistido na pré-execução como linha `[T{N}] base_sha=<sha>` em `qa-observations.md`, que alimenta o resume quando a memória lazy ainda não nasceu), `last_severity`, sumário do executor, JSON do gate e paths tocados.
* **Retry alimenta os 2 gates**: em re-validação, o QA recebe o path da memória lazy + resumo da tentativa anterior com instrução explícita de comparar contra ela — teste que sumiu ou asserção que afrouxou sem `SUT_IS_CORRECT_BECAUSE:` é **AP-24** (weakening test to pass) → CRÍTICO; o Tech Review recebe o bloco **"Memória de retry"** (apenas quando `attempt_count >= 1`).
* **Auto-escala** sonnet→`opus[xhigh]` (Opus com effort xhigh — raciocínio estendido) em retry ≥ 2 ou severity high; critical paths e security flags escalam para opus na resolução inicial.
* **Semântica de tentativas** (canônica — tabela em `references/config.md`): "3 tentativas TOTAIS" = execução inicial + 2 correções; `attempt_count` na memória lazy conta **rejeições**, não execuções (1ª rejeição grava `attempt_count: 1`; com `attempt_count: 2` a 3ª tentativa roda em `opus[xhigh]`; `attempt_count: 3` → escala ao usuário, task `Bloqueado`).
* **Política débito-controlado**: críticos/altos rejeitam (loop); médios/baixos viram débito anotado em `qa-observations.md`.
* **Relatório Final com débito**: se `qa-observations.md` recebeu itens no run, o relatório inclui a seção **"Débito técnico anotado"** — contagem por severidade (`medium: N, low: M`) + ponteiro de fechamento de ciclo: "Para transformar o débito em versão de limpeza, rode `/agent-spec-debt-resolution <feature_path>`" (nunca auto-executa — a decisão é do usuário).

> Detalhes completos em [Gates e Loops](/concepts/gates-loops.html).

---

## Fast-paths

```markdown
- gates: none # apenas executor
- gates: [qa] # só Gate 1
- gates: [qa, tech\_review] # default
```

Veja [Fast-path Gates](/advanced/fast-path-gates.html).

---

## Referências modulares (lógica operacional)

A skill **centraliza toda a lógica operacional em 5 arquivos** lidos em momentos específicos do pipeline (lazy):

| Arquivo | Quando é lido | Conteúdo |
| --- | --- | --- |
| **`references/config.md`** | FASE 0 (inicialização) | Modelos default, escalações (incl. `opus[xhigh]` e a tabela de semântica de tentativas), critical paths, `qa_summary_fields` (6 campos), auto-escalate triggers |
| **`references/executor-discipline.md`** | FASE 0 (inicialização) | Bloco verbatim com as **6 Iron Laws** injetado no prompt de cada executor — arquivo **canônico desta skill** (symlinks em `agent-spec-sdd-run-tasks` e `agent-spec-taskcard-run`) |
| **`references/qa-validator-prompt.md`** | FASE 3 (Gate 1) | Prompt completo para invocar [agent-spec-qa-validator](/agents/qa-validator.html) |
| **`references/staff-review-prompt.md`** | FASE 4 (Gate 2) | Prompt completo para invocar [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html), incluindo `qa_summary_fields` enviados |
| **`references/guardrails.md`** | Toda invocação (lido cedo) | DEVE / NÃO DEVE invioláveis + checklist final |

> **Por que modular**: skills grandes ficam difíceis de manter. Separar prompts dos gates de configuração e guardrails permite atualizar cada peça independentemente. Skill principal vira coordenador enxuto.

::: warning ⚠️ Armadilha comum
Os prompts de gate (`qa-validator-prompt.md` e `staff-review-prompt.md`) carregam nota \*\*⚠️ ANTIDRIFT\*\* no topo: o conteúdo de gates/loops é ESPELHO do equivalente em `agent-spec-sdd-run-tasks/SKILL.md` e `agent-spec-taskcard-run/SKILL.md` (difere apenas em paths e numeração de seções). Toda alteração DEVE ser replicada nos espelhos no mesmo PR — divergência entre frameworks já produziu políticas contraditórias (zero-débito vs débito-controlado).
:::

---

## Resolução do executor — descoberta interativa

Se `agent_name` é **omitido** no comando, a skill executa descoberta interativa:

1. Lista agentes em `.claude/agents/` (filtra agentes reservados do framework: `agent-spec-qa-validator`, `agent-spec-staff-architecture-review`, `agent-spec-qa-test-generator`).
2. Apresenta via `AskUserQuestion` com opção `Default (orquestrador genérico)` inclusa.
3. Persiste escolha em `qa-observations.md` para auditoria.

---

## Lógica de seleção de modelo (6 passos)

Idêntica ao [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html). Para cada task:

| Passo | O que faz |
| --- | --- |
| **1. Parse frontmatter** | Lê `model`, `risk`, `gates` |
| **2. Resolução do modelo** | Declarado → usa. Senão: critical paths → opus; `risk: high` → opus; `files_to_create_count >= 10` → opus; default → sonnet |
| **3. Auto-escalação em retry** | `attempt_count >= 2` OR `last_severity` ∈ {`high`, `critical`} → força `opus[xhigh]` |
| **4. Resolução de gates** | Declarado → usa. Senão: [Gates inference rules](/concepts/framework-paths.html) por tipo |
| **5. Fast-path** | `gates: none` → executor apenas. `[qa]` → pula TR. `[qa, tech_review]` → fluxo completo |
| **6. Log obrigatório** | Persiste em `qa-observations.md` antes de invocar executor |

---

## Loops de correção — contador e escalação

* **3 tentativas TOTAIS compartilhadas** entre Gate 1 e Gate 2 (contador **não reseta** entre gates).
* Após 3 falhas: marca task como **Bloqueada** em `task_plan.md`, registra em `qa-observations.md` com relatório completo, **escala ao usuário** (não tenta loop infinito).
* **`requires_qa_revalidation`** (classificação inteligente de retry): após Gate 2 rejeitar, orquestrador decide se a próxima rodada passa pelo QA novamente ou pula direto para Tech Review — baseado nas categorias dos `problems[]` **bloqueantes** (critical/high) do JSON do Tech Review. Categorias `code_review_only` (`code_quality`, `project_pattern`, `best_practices`) pulam QA; as 9 categorias `revalidation_required` (`architecture`, `security`, `technical_requirement`, `testability`, `error_handling`, `performance`, `adr_compliance`, `scope_deviation`, `speculative_complexity`) forçam re-QA — e categoria desconhecida/ausente cai no default conservador (re-QA). **Rejeição do QA (Gate 1) sempre re-passa pelo QA** — o algoritmo só se aplica a rejeições do Tech Review. Veja [Tech Review Correction Classification](/agent-spec-completo.html#7-a-política-débito-controlado-em-profundidade).

---

## Economia de contexto (inline vs arquivo)

`base_sha` + sumário do executor (4-6 linhas) viajam **INLINE em `instrucoes`** dos gates — sem arquivo intermediário. Versão anterior gravava `T{N}-execution-summary.md` com `git diff --stat` e SHA-256 (nunca consultados pelos gates — Tech Review GERA diff sozinho).

**Economia**: ~300-800 tokens × 2 gates × N tasks por run.

---

## Exemplo de uso

```bash
/agent-spec-minispec-run-tasks docs/specs/features/catalogo-filtros/v1/task\_plan.md 
```
```
[FASE 0] git ok | cleanup | minispec\_state.yaml: in\_progress
[FASE 1] Grafo: T1 → T2 → T3 → T4
[T1] sonnet | gates: [qa, tech\_review]
├─ executor implementou
├─ Gate 1 (sonnet): APROVADO
├─ Gate 2 (sonnet): approved
└─ git add ...
[T2] sonnet | gates: [qa] ← fast-path declarado
├─ executor
├─ Gate 1 (sonnet): APROVADO (Gate 2 pulado)
└─ git add ...
[T3, T4] ...
✅ 4 tasks executadas | 0 bloqueadas
```

---

## Skills relacionadas

* [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) — etapa anterior.
* [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) — equivalente SDD.
* [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html) — equivalente TaskCard.

## Agents relacionados

* [agent-spec-qa-validator (Gate 1)](/agents/qa-validator.html)
* [agent-spec-staff-architecture-review (Gate 2)](/agents/staff-architecture-review-agent.html)

## Configuração via framework-paths.md

Paths usados: `minispec.task_plan.path`, `minispec.tasks.dir`, `minispec.scope.path`, `minispec.intent.path`, `minispec.state.path`, `minispec.qa_context.path`, `shared.qa_observations.path`, `shared.temp_memory.*`, `adr.index_file`. Veja [Path Templates](/configuration/path-templates.html).
