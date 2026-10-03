---
id: "agent-spec-sdd-run-tasks"
title: "agent-spec-sdd-run-tasks"
sidebar_position: 4
---
# agent-spec-sdd-run-tasks

`SDD` `Orchestrator`
> **Resumo**: Quarta e última etapa do framework SDD. Orquestra a execução das tasks geradas pelo `task_plan.md`, delegando ao executor da stack e validando cada task pelos 2 gates (QA + Tech Review). É **coordenador**, não implementador.

Detalhes operacionais (logs, exemplos de retry) em [Pipeline — agent-spec-sdd-run-tasks](../../pipeline/sdd-run-tasks.md).

---

## Quando usar

* Após `task_plan.md` + `tasks/T{n}.md` aprovados.
* Para executar todas as tasks de uma feature SDD em sequência com gates ativos.

## Quando NÃO usar

* Pipeline miniSpec → use [agent-spec-minispec-run-tasks](../minispec/minispec-run-tasks.md).
* Pipeline TaskCard → use [agent-spec-taskcard-run](../taskcard/taskcard-run.md).
* Tasks sem `task_plan.md` aprovado → primeiro rode [agent-spec-sdd-generate-task-plan](sdd-generate-task-plan.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `task_plan.md` | Usuário (argumento) | Sim |
| `agent_name` (executor da stack — ex.: `node-task-developer`, `python-task-developer`) | Usuário (argumento) | Não — se omitido, descoberta interativa |
| `tasks/T{n}.md` | Geradas em [agent-spec-sdd-generate-task-plan](sdd-generate-task-plan.md) | Sim |
| `tech_spec.md`, `prd.md`, `.qa_context.md` | Referência sob demanda | Sim |
| `sdd_state.yaml` | Atualizado durante execução | Sim |
| Repositório git inicializado | Pré-requisito (aborta se ausente) | Sim |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path | Quando |
| --- | --- | --- |
| Código implementado (stage real via `git add`) | Repositório | Após gates aplicáveis aprovarem (Gate 2 para `[qa, tech_review]`; fechamento da task para `[qa]`/`none`) |
| `task_plan.md` atualizado (status das tasks) | `sdd.task_plan.path` | Após cada task |
| `sdd_state.yaml` atualizado | `sdd.state.path` | Início e fim |
| `qa-observations.md` (auto-escalações, tasks bloqueadas) | `shared.qa_observations.path` | Quando aplicável |
| `base_sha` + sumário do executor | em memória do orquestrador (inline no prompt dos gates) | Após cada executor concluir; sem arquivo em disco |
| `T{N}.md` (memória lazy) | `shared.temp_memory.dir` | Apenas em rejeição |

> Memória lazy `T{N}.md` (só nasce em rejeição) é **deletada após ambos os gates aprovarem**. `base_sha` + sumário do executor não geram arquivo — viajam inline no prompt.

---

## Fluxo de execução

### Resolução do executor — descoberta interativa

Quando `agent_name` é **omitido**, o orquestrador **não aborta**: lista os subagentes em `.claude/agents/` (excluindo os reservados aos gates — `agent-spec-qa-validator`, `agent-spec-staff-architecture-review`, `agent-spec-qa-test-generator`), pergunta via `AskUserQuestion` qual executor usar e oferece sempre a opção final **"Default (orquestrador genérico)"** — sentinel `__default__`, que invoca o executor **sem `subagent_type`** (agente padrão do Claude Code). A escolha (argumento explícito | descoberta interativa | default) é logada em `qa-observations.md` e vale para todas as tasks do run.

### FASE 0 — Inicialização

* Valida git (`git rev-parse --is-inside-work-tree`).
* Cleanup de memória stale (>24h em `/docs/specs/features/{feature}/{version}/tasks/.tmp/`).
* Atualiza `sdd_state.yaml` para `execution: in_progress`.
* **Resume pós-interrupção**: se há sinal de execução interrompida (task `Em Progresso` no task_plan, memória lazy recente de task não-concluída ou diff não-staged em paths declarados), pergunta via `AskUserQuestion`: **(a)** retomar nos gates (usa o `base_sha` da memória lazy; se ela ainda não existe, recupera via grep da linha `[T{N}] base_sha=` persistida em `qa-observations.md` na pré-execução) e vai direto ao Gate 1; **(b)** reexecutar do zero (`git checkout -- <paths declarados>` restaura os modificados; arquivos declarados a criar que existam como untracked são deletados explicitamente — `git checkout` não os remove —, com confirmação); **(c)** resolver manualmente. Escolha logada em `qa-observations.md`.
* **Carrega o bloco "Disciplina do Executor (Iron Rules)"** da referência [`references/executor-discipline.md`](../../configuration/executor-discipline.md) (symlink para o canônico em `agent-spec-minispec-run-tasks/references/` — **não é rule** do system-prompt; é lida sob demanda) — será injetado verbatim no prompt de cada executor na FASE 2. Sem isso, o sub-agente (contexto isolado) não recebe as **6 Iron Laws** (Pense antes de codar / Simplicidade primeiro / Cirúrgico / Goal-driven / Testes honestos / Lei do seam). Violações da Lei #2 viram problemas `speculative_complexity` no Gate 2.
* **Instrumenta rule mining (não-bloqueante)** — durante o run, persiste candidatos a regra em `shared.rule_candidates.path` para a skill [`agent-spec-mine-rule-candidates`](../shared/mine-rule-candidates.md) consolidar offline. Trigger points: (1) se existir `pre-refinement.md`, emite `pre_refinement_decision` para cada item da subseção "Decisões já tomadas (fora de negociação)" (seção 11); (2) executor disparou `AskUserQuestion` → `executor_askquestion`; (3) executor leu arquivo "exemplar" → `exemplar_file_read`; (4) pós-QA → consome `rule_candidates_emitidos[]` do JSON do [Gate 1](../../agents/qa-validator.md); (5) pós-Tech Review → idem do [Gate 2](../../agents/staff-architecture-review-agent.md). Arquivo é lazy (só nasce no primeiro sinal qualificado); falhas de append são não-bloqueantes; deduplicação intra-run via grep `{signal} | {evidence}`.

### FASE 1 — Grafo de dependências

Lê `task_plan.md`, constrói grafo de dependências, identifica tasks prontas (sem deps pendentes).

### FASE 2 — Execução por Fase (paralelismo declarado quando seguro) ⚡

O flag "Pode Rodar em Paralelo?" do `task_plan.md` é **derivado** (nunca autorado por intuição) e o orquestrador **re-verifica** os guards de [Execução Paralela de Tasks](../../configuration/path-templates.md) — não confia cego na coluna:

1. Mesma fase no task_plan.
2. `Paralelo? = Sim` em todas as candidatas (flag derivado; re-verificado).
3. **Independência no DAG** — nenhuma task do lote é ancestral/descendente (direta ou transitiva) de outra.
4. **Disjunção de símbolo declarado** — `consumidos(ti) ∩ criados(tj) = ∅` (campos "Símbolos públicos criados"/"Símbolos consumidos" da seção 1 de cada task); em interseção, o **consumidor** sai do lote.
5. **Paths disjuntos** (união de §5.1+§5.2 de cada task não intersecciona) + nenhuma toca **arquivo de alta contenção** em comum (container DI, router/registry, barrel, manifests, migrations).
6. Lote ≤ **MAX_PARALLEL = 4** (corta em ondas se maior).

Falha em qualquer guard → **fallback automático para sequencial** com log do motivo.

**Mecânica do lote paralelo**:

1. `base_sha` capturado UMA vez antes do lote (todas as tasks usam o mesmo).
2. **Despacho concorrente**: todos os `Agent()` do executor numa ÚNICA mensagem do orquestrador.
3. Aguarda TODOS retornarem.
4. Execution summaries criados em paralelo.
5. **Gates por task em paralelo**: cada `ti` tem pipeline isolado `Agent(agent-spec-qa-validator)` → `Agent(agent-spec-staff-architecture-review)`. Dentro de uma task: QA→TR continua sequencial. Entre tasks do lote: pipelines paralelos.
6. **Guard de QA serializado**: se ≥ 2 tasks do lote têm testes de integração/E2E (§6.2/§6.3 não-vazias), os QAs rodam **um por vez** (ordem de ID) — suítes concorrentes no mesmo working tree colidem (DB/porta/fixture) e geram flake. Executores continuam paralelos.
7. **Stage determinístico**: após TODOS os **gates aplicáveis** do lote aprovarem (Tech Review quando declarado; apenas QA para `gates: [qa]`; nenhum gate para `gates: none`), `git add` em ordem `T1 → T2 → ... → Tn`. Tasks fast-path **também são staged** (senão terminariam unstaged/untracked).
8. **Falha isolada**: 1 task em retry não trava as outras. **Guard executor×QA**: o executor de correção só é despachado quando nenhum QA de outra task do lote estiver rodando suíte (integração/E2E/completa) — drene os QAs pendentes antes de corrigir (editar o working tree durante uma suíte queima tentativa de task inocente). QAs de testes unitários puros não disparam o guard.

**Por task (sequencial dentro do lote OU fora dele)**:

1. Parseia frontmatter (`model`, `risk`, `gates`).
2. Resolve modelo do executor (declarado → heurística → default `sonnet`).
3. Resolve `gates` (declarado → inferido por tipo via [Gates inference rules](../../advanced/fast-path-gates.md) → default `[qa, tech_review]`).
4. Invoca executor (`agent_name`) com a task individual.
5. Persiste `base_sha` + sumário do executor (4-6 linhas) em variáveis do orquestrador. Passados **inline em `instrucoes`** aos gates — sem arquivo intermediário.

> **Motivação**: post-mortem declarou T1-T4 paralelos mas rodaram sequenciais (~40min). Em paralelo real seriam ~10min. Economia: ~30min por feature com fase paralela declarada.

### FASE 3 — Gate 1 (agent-spec-qa-validator)

* Invoca [agent-spec-qa-validator](../../agents/qa-validator.md) com arquivos enxutos + instruções (CA, CTs, comando de teste). A lista de arquivos é a **lista real de tocados** (`git diff --name-only <base_sha>` rodado pelo orquestrador — o QA é proibido de git; mantém a Camada 0 não-circular).
* Se `APROVADO` ou `APROVADO_COM_OBSERVACOES` → avança para Gate 2.
* Se `REJEITADO` → entra na FASE 3.5.

### FASE 3.5 — Loop QA (em rejeição)

1. Cria/atualiza `T{N}.md` (memória lazy) com JSON completo + `attempt_count` + `last_severity` + `base_sha`.
2. Aplica auto-escalação para `opus[xhigh]` se `attempt_count >= 2` ou `last_severity == high`.
3. Monta prompt de correção **débito-controlado**: bloqueantes = críticos+altos; médios/baixos entram como "Observações" opcionais (registrados em `qa-observations.md`).
4. Re-invoca executor. Em retry, o QA recebe o path da memória lazy + resumo da tentativa anterior (instrução AP-24: teste removido/asserção afrouxada sem `SUT_IS_CORRECT_BECAUSE:` = CRÍTICO).
5. Re-roda **apenas Gate 1** (não Gate 2).

### FASE 4 — Gate 2 (agent-spec-staff-architecture-review)

* Envia **sumário mínimo do QA** (6 campos: veredito, security_flags, executou_testes, escopo_testes, tocou_area_critica, escopo_declarado), não JSON completo.
* Tech Review gera diffs sozinho via `git diff <base_sha> -- <path>`.
* 5 status possíveis:
  + `approved` (0 problemas) → FASE 4.5.
  + `approved_with_observations` (só medium/low) → FASE 4.5 + registra débito em `qa-observations.md`.
  + `partial` (≥1 high) → FASE 4.4.
  + `rejected` (≥1 critical) → FASE 4.4.
  + `skipped_qa_rejected` (TR invocado com QA reprovado — erro de orquestração) → loga e volta ao loop do QA (FASE 3.5).

### FASE 4.4 — Loop Tech Review (em rejeição)

1. Atualiza `T{N}.md` com JSON do Tech Review; registra os médios/baixos em `qa-observations.md`.
2. Aplica auto-escalação para `opus[xhigh]`.
3. Monta prompt de correção (bloqueantes = critical/high; médios/baixos como Observações).
4. Re-invoca executor. O TR em retry recebe o bloco "Memória de retry" (path da memória lazy).
5. **Re-valida conforme `requires_qa_revalidation`**: se TODOS os problemas bloqueantes do TR estão em `code_quality`/`project_pattern`/`best_practices` → **pula o QA** e vai direto a novo Tech Review; caso contrário, QA → Tech Review. (Rejeição do QA, na FASE 3.5, sempre re-passa pelo QA.) Detalhes em [Conditional Gates](../../advanced/conditional-gates.md).

### FASE 4.5 — Stage real

* `git add -- <task_paths>` (não commita; apenas stage). Aplica-se a `[qa, tech_review]` aqui; tasks `gates: [qa]`/`none` são staged no fechamento (FASE 5, passo 0). O `git add -N -- <task_paths>` já rodou logo após o executor (pré-Gate 1) para tornar arquivos novos visíveis no `git diff --name-only <base_sha>` do QA.
* Deleta `T{N}.md` (memória lazy, se foi criada por rejeição) — cleanup.

### FASE 5 — Atualização de estado

* Marca task como concluída em `task_plan.md`.
* Atualiza `sdd_state.yaml`.

### Hard stop em 3 tentativas

Se `attempt_count >= 3` em qualquer ponto: marca task como **Bloqueada** em `task_plan.md`, registra em `qa-observations.md` e escala ao usuário com relatório completo.

---

## Gates invocados

| Gate | Agent | Quando |
| --- | --- | --- |
| **Gate 1** | [agent-spec-qa-validator](../../agents/qa-validator.md) | Após executor concluir cada task |
| **Gate 2** | [agent-spec-staff-architecture-review](../../agents/staff-architecture-review-agent.md) | Após Gate 1 aprovar |

Detalhes completos em [Gates e Loops](../../concepts/gates-loops.md).

---

## Loops e correção

* **Limite**: 3 tentativas TOTAIS compartilhadas QA + Tech Review (contador NÃO reseta entre gates).
* **Memória lazy**: `/docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` (criada apenas em rejeição; co-localizada com as tasks da feature).
* **Auto-escala** sonnet→`opus[xhigh]` se: `attempt_count >= 2` OR `last_severity` ∈ {`high`, `critical`} OR `diff_touches_critical_path` OR `task_risk: high` OR (Gate 2) `qa_security_flags` não vazio OR (Gate 2) `retry_attempt >= 1`. `attempt_count` conta **rejeições** (execução inicial = tentativa 1; 3 tentativas = inicial + 2 correções).
* **Política débito-controlado**: críticos/altos rejeitam (loop); médios/baixos viram débito anotado em `qa-observations.md`.

> Detalhes e diagrama em [Gates e Loops](../../concepts/gates-loops.md).

---

## Fast-paths

Tasks declaram fast-path no frontmatter:

```markdown
- gates: none              # apenas executor
- gates: [qa]              # só Gate 1
- gates: [qa, tech_review] # default
```

Veja [Fast-path Gates](../../advanced/fast-path-gates.md).

---

## Critical paths embutidos

A detecção é **agnóstica de stack** — por categorias semânticas do path (case-insensitive), não por globs de linguagem específica:

```
auth, security, crypto, db_migrations, secrets/config, api_contracts, payments
```

Qualquer path da task que bata com uma categoria dispara escalação automática do modelo (gates e executor). Veja [Critical Paths](../../configuration/critical-paths.md).

---

## Lógica de seleção de modelo (6 passos)

Para cada task, o orquestrador executa em ordem:

| Passo | O que faz |
| --- | --- |
| **1. Parse frontmatter** | Lê `model`, `risk`, `gates` da task. Ausente → marca para resolução por heurística |
| **2. Resolução do modelo** | Se `model` declarado → usa. Senão: aplica [Executor model rules](../../concepts/framework-paths.md) (critical paths → opus, `risk: high` → opus, `files_to_create_count >= 10` → opus, default → sonnet) |
| **3. Auto-escalação em retry** | Se `attempt_count >= 2` OR `last_severity` ∈ {`high`, `critical`} → força `opus[xhigh]` na próxima tentativa |
| **4. Resolução de gates** | Se `gates` declarado → usa. Senão: aplica [Gates inference rules](../../concepts/framework-paths.md) por tipo (wiring=`[qa]`, crud_handler=`[qa]`, padrao_novo=`[qa,tech_review]`, etc.) |
| **5. Fast-path** | Se `gates: none` → executor apenas + git add (sem gates). Se `gates: [qa]` → pula Tech Review (staged no fechamento). Se `gates: [qa, tech_review]` → fluxo completo. Toda task aprovada é staged (inclusive `[qa]`/`none`). |
| **6. Log obrigatório** | Persiste em `qa-observations.md` antes de invocar executor (fonte autoritativa para auditoria de modelo e gates) |

**Formato do log** (obrigatório):

```
[T5] gates: [qa] (inferido: tipo=crud_handler, sem critical_paths)     model: sonnet
[T6] gates: [qa, tech_review] (declarado no frontmatter)                model: sonnet
[T1] gates: [qa, tech_review] (inferido: tipo=refactor_cross_module)    model: opus (auto-escalado: critical_path)
```

---

## Configuração embutida (escalações automáticas)

No SDD, a configuração é **inline no SKILL.md** (seção "Configuração Embutida") — o único arquivo em `references/` é o `executor-discipline.md` (symlink para o canônico do miniSpec). Blocos:

| Bloco | Conteúdo |
| --- | --- |
| **Subagentes dos gates** | Default `agent-spec-qa-validator` (Gate 1), `agent-spec-staff-architecture-review` (Gate 2); override via config (raro) |
| **Critical paths** | Categorias semânticas agnósticas (auth, security, crypto, db_migrations, secrets/config, api_contracts, payments) para match contra os paths da task |
| **Executor model rules** | Tabela de match categoria → modelo (auth/security/crypto/db_migrations/secrets/config → opus) |
| **Auto-Escalate sonnet→`opus[xhigh]`** | Triggers em retry: `attempt_count >= 2`, `last_severity` ∈ {`high`, `critical`}, `qa_security_flags` não vazio, `retry_attempt >= 1` (Gate 2) |
| **`qa_summary_fields`** | 6 campos do sumário mínimo do QA enviado ao Tech Review (veredito, security_flags, executou_testes, escopo_testes, tocou_area_critica, escopo_declarado) |

---

## Execução paralela (FASE 2 — guards)

O flag `Pode Rodar em Paralelo?` é **derivado** (nunca autorado por intuição) e o orquestrador **re-verifica** com guards **se TODOS passam** (qualquer guard sem prova de independência → sequencial):

1. **Mesma fase** no task_plan.
2. **Independência no DAG** — nenhuma é ancestral/descendente de outra (deps reconciliadas: `TN.md` seção 1 ∪ tabela do task_plan).
3. **Disjunção de símbolo declarado** — `Símbolos consumidos(ti) ∩ Símbolos criados(tj) = ∅` (campos da seção 1 de cada `TN.md`; substitui o antigo grep textual em arquivos inexistentes).
4. **Paths disjuntos** — união de `§5.1 + §5.2` de cada task não intersecciona.
5. **Nenhuma toca arquivo de alta contenção** em comum (DI/container, router/registry, barrel/exports, manifests/lockfiles, diretório de migrations).
6. **`MAX_PARALLEL = 4`** — lotes maiores quebram em ondas.

**Mecânica**:

1. `base_sha = git rev-parse HEAD` capturado **UMA vez** antes do lote (todas as tasks do lote usam o mesmo).
2. Despacho concorrente: **TODOS os `Agent()` do executor numa ÚNICA mensagem** do orquestrador.
3. Aguarda todos retornarem.
4. Gates por task em paralelo (cada `ti` tem pipeline isolado QA → Tech Review). **Guard de recursos de teste**: se ≥2 tasks do lote têm testes de integração/E2E não-vazios, os QAs são serializados (um por vez, ordem de ID) — suítes concorrentes no mesmo working tree colidem (DB/porta/fixture).
5. **Stage determinístico** — após todos os **gates aplicáveis** do lote aprovarem (Tech Review quando declarado; apenas QA para `gates: [qa]`; nenhum gate para `gates: none`), `git add` em ordem `T1 → T2 → ... → Tn`. Tasks fast-path **também são staged**.
6. **Falha isolada** — 1 task em retry não trava as outras do lote. **Guard executor×QA (correção concorrente)**: despache o executor de correção só quando nenhum QA de outra task do lote estiver executando suíte (integração/E2E/completa); drene os QAs pendentes antes de corrigir. QAs de testes unitários puros não disparam o guard.

**Fallback**: qualquer guard falhando → **sequencial** com log do motivo em `qa-observations.md`.

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: T1-T4 declaradas paralelas no task_plan rodaram sequenciais (~40min). Em paralelo real: ~10min. Economia: ~30min por feature com fase paralela.

---

## Economia de contexto (inline vs arquivo)

`base_sha` + sumário do executor (4-6 linhas) viajam **INLINE em `instrucoes`** dos gates — sem arquivo intermediário. Versão anterior gravava `T{N}-execution-summary.md` com `git diff --stat`, hashes SHA-256 pré/pós e paths consolidados — campos que nunca foram consultados pelos gates (Tech Review GERA diff sozinho).

**Economia**: ~300-800 tokens × 2 gates × N tasks por run.

---

## Templates / assets usados

* `references/executor-discipline.md` — **único** arquivo em `references/` (symlink para o canônico em `agent-spec-minispec-run-tasks/references/`); bloco das 6 Iron Laws injetado no prompt de cada executor.
* Configuração dos gates, prompts (Gate 1/Gate 2), guardrails e lógica de modelo vivem **inline no SKILL.md** ("Configuração Embutida"), não em `references/`.

> ⚠️ **Antidrift**: os blocos de Gate 1/Gate 2 deste SKILL são espelho dos equivalentes em `agent-spec-minispec-run-tasks/references/{qa-validator,staff-review}-prompt.md` e em `agent-spec-taskcard-run/SKILL.md` — alterações devem ser replicadas nos espelhos.

---

## Exemplo de uso

```bash
/agent-spec-sdd-run-tasks docs/specs/features/pagamentos/v1/task_plan.md <seu-executor>
```

```
[FASE 0] git ok | cleanup memória stale | sdd_state.yaml: in_progress
[FASE 1] Grafo: T1 → T2 → (T3, T4 parallel-safe via dep) → T5 → T6 → T7 → T8

[T1] executor: sonnet (declarado)         gates: [qa, tech_review]
  ├─ executor implementou (3 arquivos)
  ├─ base_sha + sumário do executor persistidos (inline no prompt dos gates)
  ├─ Gate 1 (sonnet): APROVADO
  ├─ Gate 2 (sonnet): approved
  └─ git add -- internal/payments/**

[T2] executor: opus (rule: critical_path) gates: [qa, tech_review]
  ├─ ... [executa]
  ├─ Gate 1 (opus): REJEITADO (CRIT-001)
  ├─ Loop QA: tentativa 2 (auto-escala? não, attempt < 2)
  ├─ executor (opus): re-implementa
  ├─ Gate 1: APROVADO
  ├─ Gate 2 (opus): approved
  └─ git add ...

[...]

✅ 8 tasks executadas | 0 bloqueadas | sdd_state.yaml: completed
```

---

## Skills relacionadas

* [agent-spec-sdd-generate-task-plan](sdd-generate-task-plan.md) — etapa anterior.
* [agent-spec-minispec-run-tasks](../minispec/minispec-run-tasks.md) — equivalente miniSpec.
* [agent-spec-taskcard-run](../taskcard/taskcard-run.md) — equivalente TaskCard.

## Agents relacionados

* [agent-spec-qa-validator (Gate 1)](../../agents/qa-validator.md)
* [agent-spec-staff-architecture-review (Gate 2)](../../agents/staff-architecture-review-agent.md)

## Configuração via framework-paths.md

Paths usados: `sdd.task_plan.path`, `sdd.tasks.dir`, `sdd.tech_spec.path`, `sdd.prd.path`, `sdd.state.path`, `sdd.qa_context.path`, `shared.qa_observations.path`, `shared.temp_memory.dir`, `shared.temp_memory.pattern`, `adr.index_file`. Veja [Path Templates](../../configuration/path-templates.md).
