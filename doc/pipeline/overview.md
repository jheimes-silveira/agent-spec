---
id: "overview"
title: "Pipeline — Visão Geral"
sidebar_position: 1
---
# Pipeline de Execução — Visão Geral

Os 3 orquestradores `*-run-tasks` (SDD, miniSpec, TaskCard) compartilham o **mesmo pipeline operacional**: executor → persiste `base_sha` + sumário enxuto em memória → Gate 1 (QA) → Gate 2 (Tech Review) → `git add`. `base_sha` e o sumário do executor passam **inline em `instrucoes`** aos gates (sem arquivo intermediário). Esta categoria cobre o lado **operacional** (logs, exemplos, troubleshooting); a referência conceitual está em [Gates e Loops](../concepts/gates-loops.md).

> **Skills vs Pipeline**: cada `*-run-tasks` tem **duas páginas** — uma de skill (em `/skills/...`, foca contrato) e uma de pipeline (aqui, foca operação).

---

## Diagrama unificado

```
┌──────────────────────────────────────────────────────────────────────┐
│ PIPELINE — Idêntico para SDD, miniSpec, TaskCard                     │
│                                                                       │
│ FASE 0: Inicialização                                                │
│   • Valida git (git rev-parse --is-inside-work-tree)                │
│   • Cleanup memória stale (>24h em <feature>/<v>/tasks/.tmp/)       │
│   • Resume pós-interrupção: se há task Em Progresso / memória lazy  │
│     recente / diff não-staged → AskUserQuestion (retomar nos gates  │
│     / reexecutar do zero / resolver manual)                         │
│   • Atualiza state.yaml para in_progress                            │
│                                                                       │
│ FASE 1: Grafo de dependências (apenas SDD/miniSpec)                 │
│   • Lê task_plan.md, identifica tasks prontas                       │
│     (pronta = deps todas Concluído; Bloqueado propaga às dependentes)│
│   • TaskCard pula esta fase (uma task por invocação)                │
│                                                                       │
│ FASE 2: Por fase — lote paralelo derivado + sequenciais (SDD/mini)  │
│   • Parse frontmatter: model, risk, gates                           │
│   • Resolve modelo do executor                                      │
│   • Captura base_sha = git rev-parse HEAD                           │
│   • Invoca executor (agent_name)                                    │
│   • Persiste base_sha + sumário enxuto do executor em memória      │
│     (inline no prompt dos gates — sem arquivo)                      │
│                                                                       │
│ FASE 3: Gate 1 (agent-spec-qa-validator)                                       │
│   • Valida funcional + executa testes                               │
│   • Política débito-controlado: críticos/altos → REJEITADO         │
│   • APROVADO / APROVADO_COM_OBSERVACOES → FASE 4                   │
│   • REJEITADO (críticos ou altos) → FASE 3.5 (loop)                │
│                                                                       │
│ FASE 3.5: Loop QA em rejeição                                       │
│   • Cria/atualiza memória lazy T{N}.md                              │
│   • Auto-escala sonnet→opus[xhigh] se attempt>=2 ou severity=high   │
│   • Re-invoca executor com prompt de correção                       │
│   • Re-roda APENAS Gate 1                                           │
│                                                                       │
│ FASE 4: Gate 2 (agent-spec-staff-architecture-review)                   │
│   • Recebe sumário mínimo do QA (6 campos)                          │
│   • Gera diffs sozinho (git diff <base_sha> -- <path>)              │
│   • approved → FASE 4.5                                             │
│   • partial/rejected → FASE 4.4 (loop)                              │
│                                                                       │
│ FASE 4.4: Loop Tech Review em rejeição                              │
│   • Atualiza memória lazy T{N}.md com JSON do Tech Review           │
│   • Auto-escala (opus[xhigh]) se security_flags ou retry>=1         │
│   • Calcula requires_qa_revalidation só sobre problems[]            │
│     BLOQUEANTES (critical/high) do Tech Review:                     │
│       code_quality/project_pattern/best_practices → SKIP QA         │
│       demais categorias do TR → re-QA                               │
│   • (rejeição do QA na 3.5 sempre re-passa pelo QA)                 │
│   • Re-invoca executor; bifurca:                                    │
│       requires_qa_revalidation=true  → Gate 1 + Gate 2              │
│       requires_qa_revalidation=false → SÓ Gate 2 (skip Gate 1)      │
│                                                                       │
│ FASE 4.5: Stage real                                                │
│   • git add -- <task_paths>  (sem commit)                           │
│   • Deleta T{N}.md (memória lazy de retry, se foi criada)           │
│                                                                       │
│ FASE 5: Atualização de estado                                       │
│   • Marca task concluída em task_plan.md                            │
│   • Atualiza state.yaml                                             │
│                                                                       │
│ HARD STOP em 3 tentativas: BLOQUEADA + escala ao usuário            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Tabela comparativa dos 3 orquestradores

| Aspecto | [agent-spec-sdd-run-tasks](sdd-run-tasks.md) | [agent-spec-minispec-run-tasks](minispec-run-tasks.md) | [agent-spec-taskcard-run](taskcard-run.md) |
| --- | --- | --- | --- |
| Input | `task_plan.md` + `[agent_name]` | `task_plan.md` + `[agent_name]` | TaskCard individual + `[agent_name]` |
| Iteração | N tasks com grafo de dependências | N tasks com grafo de dependências | Uma task |
| Estado | `sdd_state.yaml` | `minispec_state.yaml` | — (TaskCard avulsa) |
| Memória temporária | `T{N}.md` (lazy, só em rejeição) | Idem | `TC-{NN}.md` (lazy, só em rejeição) |
| `agent_name` | Opcional (descoberta interativa) | Opcional (descoberta interativa) | Opcional (descoberta interativa) |

**O que é idêntico**:

* Gates (agent-spec-qa-validator + agent-spec-staff-architecture-review).
* Loops e auto-escalação.
* Memória lazy `T{N}.md` (só em rejeição) + `base_sha`/sumário do executor inline no prompt.
* Política débito-controlado (críticos/altos rejeitam; médios/baixos viram débito anotado).
* Fast-paths (`gates: none / [qa] / [qa, tech_review]`) — declarativos no frontmatter.
* [Gates condicionais](../advanced/conditional-gates.md) (`requires_qa_revalidation`) — dinâmicos no loop de correção.
* `git add` sem commit.

---

## Logs típicos do orquestrador

Os orquestradores emitem logs com formato consistente:

```
[T5] executor: sonnet (declarado)                gates: [qa, tech_review]
[T6] executor: opus (rule: critical_path)        gates: [qa, tech_review]
[T8] executor: opus (auto-escalated, attempt=2)  gates: [qa, tech_review]
[T9] executor: sonnet                            gates: none           ← fast-path
```

Indicação clara de:

* **Modelo escolhido** + razão (declarado / regra / auto-escalation).
* **Gates ativos** para a task.

---

## Quando uma task é marcada como Bloqueada

Após 3 tentativas TOTAIS sem aprovação dos dois gates:

1. Task marcada como `Bloqueada` em `task_plan.md`.
2. Linha em `qa-observations.md` com:
   * `task_id`
   * JSONs dos gates da última tentativa
   * `attempt_count`
   * Paths tocados
3. Relatório completo apresentado ao usuário.

> O framework **não** tenta loop infinito. O usuário recebe contexto suficiente para decidir manualmente.

---

## Ciclo completo (com cleanup de débitos)

Após o pipeline rodar e a feature `v{N}` concluir, é comum sobrarem débitos `MEDIO`/`BAIXO` em categorias `code_review_only` anotados em `qa-observations.md` pela política débito-controlado. A skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) fecha esse ciclo:

```
┌─────────────────────────────────────────────────────────────────┐
│ Ciclo de uma feature (com cleanup opcional)                     │
│                                                                  │
│   /agent-spec-pre-refinement                                                │
│        ↓                                                         │
│   /agent-spec-minispec-generate-intent (ou /agent-spec-sdd-generate-prd)               │
│        ↓                                                         │
│   /agent-spec-minispec-generate-scope (ou /agent-spec-sdd-generate-tech-spec)          │
│        ↓                                                         │
│   /agent-spec-minispec-generate-tasks (ou /agent-spec-sdd-generate-task-plan)          │
│        ↓                                                         │
│   /agent-spec-minispec-run-tasks (ou /agent-spec-sdd-run-tasks)  ← gates aqui          │
│        ↓                                                         │
│   [v{N} concluída; qa-observations.md tem débitos MEDIO/BAIXO]  │
│        ↓                                                         │
│   /agent-spec-debt-resolution docs/specs/features/<feature>/v{N}/   ← OPC. │
│        ↓                                                         │
│   [gera v{N+1}-debits/ com tasks de cleanup, gates: [qa]]       │
│        ↓                                                         │
│   /agent-spec-minispec-run-tasks v{N+1}-debits/task_plan.md  ← cleanup    │
│        ↓                                                         │
│   [feature limpa; segue para v{N+1} funcional se aplicável]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

A skill `/agent-spec-debt-resolution` é **opcional**. Use quando:

* Você acabou de rodar uma feature e quer limpar dívida antes de partir para v2 funcional.
* O time decidiu rodar um "sprint de cleanup" sobre features estáveis.
* O `qa-observations.md` acumulou ≥ 5 débitos `APROVADO_COM_OBSERVACOES`.

Pule quando:

* Feature ainda em execução.
* Sem débitos anotados.
* Débitos críticos/altos pendentes (esses **bloqueiam** o pipeline, não passam para `qa-observations.md`).

---

## Próximos passos

* [agent-spec-sdd-run-tasks (operacional)](sdd-run-tasks.md)
* [agent-spec-minispec-run-tasks (operacional)](minispec-run-tasks.md)
* [agent-spec-taskcard-run (operacional)](taskcard-run.md)
* [Gates e Loops (referência conceitual)](../concepts/gates-loops.md)
* [Auto-escalação](../advanced/auto-escalation.md)
* [Fast-path Gates](../advanced/fast-path-gates.md) — skip estático.
* [Gates Condicionais](../advanced/conditional-gates.md) — skip dinâmico em retry (`requires_qa_revalidation`).
* [agent-spec-debt-resolution (skill)](../skills/shared/debt-resolution.md) — cleanup de débitos acumulados.
