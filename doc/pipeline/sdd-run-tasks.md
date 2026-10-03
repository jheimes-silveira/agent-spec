---
id: "agent-spec-sdd-run-tasks"
title: "Pipeline — agent-spec-sdd-run-tasks"
sidebar_position: 2
---
# Pipeline — agent-spec-sdd-run-tasks

Foco operacional do orquestrador SDD. Para o contrato da skill (inputs/outputs), veja [skills/sdd/sdd-run-tasks](../skills/sdd/sdd-run-tasks.md). Para a referência conceitual de gates e loops, veja [Gates e Loops](../concepts/gates-loops.md).

---

## Comando

```bash
/agent-spec-sdd-run-tasks <task_plan.md> [agent_name]
```

| Argumento | Obrigatório | Exemplo |
| --- | --- | --- |
| `task_plan.md` | sim | `docs/specs/features/pagamentos/v1/task_plan.md` |
| `agent_name` | **não** — se omitido, descoberta interativa | nome do executor da stack em `.claude/agents/` (ex.: `node-task-developer`, `python-task-developer`) |

---

## Pré-requisitos antes de invocar

```bash
# 1. Repositório git inicializado e em estado limpo (recomendado)
git status

# 2. Task plan + tasks individuais geradas
ls docs/specs/features/<feature>/<version>/task_plan.md
ls docs/specs/features/<feature>/<version>/tasks/

# 3. CLAUDE.md presente
test -f CLAUDE.md

# 4. (Opcional) Agent executor da stack — se não passar agent_name, a skill faz descoberta interativa
ls .claude/agents/
```

Se o **git** faltar, [agent-spec-sdd-run-tasks](../skills/sdd/sdd-run-tasks.md) aborta com mensagem clara. Se o `agent_name` for omitido, **não aborta** — lista os executores disponíveis e pergunta via `AskUserQuestion` (com a opção "Default").

---

## Fluxo executado

Detalhe completo das 5 fases em [skills/sdd/sdd-run-tasks](../skills/sdd/sdd-run-tasks.md). Resumo operacional:

```
FASE 0   git ok | cleanup memória stale | sdd_state.yaml: in_progress
         + carregar bloco "Disciplina do Executor (Iron Rules)"
FASE 1   Grafo de dependências de task_plan.md
FASE 2   Por FASE do task_plan: re-verifica flag derivado (guards) ⚡
         · DAG independente + disjunção de símbolo + paths disjuntos
           + sem arquivo de alta contenção + lote ≤ 4
         · Sucesso: despacho concorrente numa única mensagem
         · Qualquer guard sem prova de independência: fallback sequencial
FASE 3   Gate 1 (agent-spec-qa-validator)         → APROVADO ou loop
         · No lote paralelo: 1 invocação por task em paralelo
FASE 3.5 Loop QA em rejeição (até attempt=3)
FASE 4   Gate 2 (tech-review)          → approved ou loop
         · No lote paralelo: pipelines isolados SEM barreira — o TR de cada
           task despacha assim que o QA DELA aprova
FASE 4.4 Loop Tech Review em rejeição (até attempt=3; revalida conforme
         requires_qa_revalidation — pula QA se bloqueantes só de code-review)
FASE 4.5 git add (stage real, sem commit) — ordem determinística por ID
         (tasks [qa]/none são staged na FASE 5; o git add -N pós-executor,
          pré-Gate 1, tornou arquivos novos visíveis ao diff do QA)
FASE 5   Atualiza task_plan.md + sdd_state.yaml
```

### Disciplina do Executor (Iron Rules) 🛡️

A cada delegação ao executor, o orquestrador injeta **verbatim** o bloco entre `<<<EXECUTOR_DISCIPLINE … EXECUTOR_DISCIPLINE>>>` da referência [`executor-discipline.md`](../configuration/executor-discipline.md) (arquivo sob demanda em `references/` — symlink para o canônico do miniSpec; **não é rule** do system-prompt). Sem esse bloco, o sub-agente (que roda em contexto isolado) não recebe as **6 Iron Laws** (Pense antes de codar / Simplicidade primeiro / Cirúrgico / Goal-driven / Testes honestos / Lei do seam). Violações da Lei #2 são detectadas no Gate 2 pela categoria [`speculative_complexity`](../advanced/conditional-gates.md).

### Execução Paralela de Tasks ⚡

A coluna "Pode Rodar em Paralelo?" do `task_plan.md` é **derivada** (não autorada por intuição — Regra 10d do gerador) e o orquestrador a **re-verifica** com os guards, nunca confia cego nela. Uma task entra no lote apenas se TODOS os guards provarem independência: **independência no DAG** (sem ancestral/descendente no lote), **disjunção de símbolo** (`consumidos ∩ criados` de qualquer par = ∅), **paths disjuntos**, **nenhum arquivo de alta contenção** compartilhado (container DI, router/registry, barrel, manifests, migrations) e **lote ≤ MAX_PARALLEL=4**. Default na incerteza: sequencial. As dependências são **reconciliadas** entre `task_plan.md` e a seção 1 do `TN.md` (autoritativa) pela união. Detalhes da rule em [Path Templates → Execução Paralela de Tasks](../configuration/path-templates.md).

**Motivação (post-mortem `cadastro-pratos-franquia` + runs com conflito de ordem)**: T1-T4 declaradas paralelas rodaram sequenciais (~40min; em paralelo seriam ~10min). E, em outros runs, o flag autorado por intuição + guards cegos a símbolo em arquivos ainda-não-criados colocaram no mesmo lote tasks que dependiam entre si → conflito de ordem. O contrato derivado (DAG + símbolo) fecha as duas falhas.

### `design.md` no Gate 1

Se a task é de camada UI e o `T{N}.md` (§5.3) referencia o `design.md` da feature (via `design.feature.path`), o orquestrador o inclui em `arquivos[]` do QA — é o **contrato visual** da Camada 4 (Completude). As `instrucoes` ao QA dizem: estados visuais (loading/erro/vazio/sucesso) implementados devem corresponder ao especificado no design.md — divergência é problema de COMPLETUDE.

---

## Exemplo de execução (caminho de sucesso)

```bash
$ /agent-spec-sdd-run-tasks docs/specs/features/pagamentos/v1/task_plan.md <seu-executor>

[FASE 0] ✓ git rev-parse HEAD: a1b2c3d
         ✓ Cleanup: 0 arquivos stale removidos
         ✓ sdd_state.yaml → execution: in_progress

[FASE 1] Grafo: T1 → T2 → (T3, T4) → T5 → T6 → T7 → T8

[T1] executor: sonnet (declarado)        gates: [qa, tech_review]
  ├─ executor implementou (3 arquivos novos)
  ├─ base_sha + sumário do executor persistidos em memória (inline no prompt dos gates)
  ├─ Gate 1 (sonnet): APROVADO  CA-01..CA-03 PASSOU; testes 12/12
  ├─ Gate 2 (sonnet): approved   adrs_consultadas: [ADR-0001]
  └─ git add -- internal/payments/types.go internal/payments/types_test.go ...

[T2] executor: opus (rule: critical_path)  gates: [qa, tech_review]
  ├─ executor implementou
  ├─ Gate 1 (opus): APROVADO
  ├─ Gate 2 (opus): approved
  └─ git add ...

[T3, T4 ... T8 ...]

[FASE 5] sdd_state.yaml → execution: completed
         task_plan.md atualizado: 8/8 tasks Concluídas

✅ 8 tasks executadas | 0 bloqueadas
```

---

## Exemplo de execução com retry (Gate 1 rejeita uma vez)

```bash
[T5] executor: sonnet                    gates: [qa, tech_review]
  ├─ executor implementou
  ├─ Gate 1 (sonnet): REJEITADO (CRIT-001: CA-04 não atendido)
  ├─ Loop QA tentativa 2/3:
  │    ├─ T5.md (memória lazy) criada com JSON completo do QA
  │    ├─ Auto-escala? não (attempt < 2)
  │    ├─ executor (sonnet): re-implementa
  │    └─ Gate 1 (sonnet): APROVADO
  ├─ Gate 2 (sonnet): approved
  └─ git add ...
```

---

## Exemplo de hard stop em 3 tentativas

```bash
[T7] executor: sonnet                    gates: [qa, tech_review]
  ├─ executor: implementa
  ├─ Gate 1: REJEITADO (CRIT-002)
  ├─ Loop QA 2/3:
  │    ├─ executor (sonnet) re-implementa
  │    └─ Gate 1: REJEITADO (CRIT-002 persistente)
  ├─ Loop QA 3/3:
  │    ├─ Auto-escala: sonnet → opus[xhigh] (attempt >= 2)
  │    ├─ executor (opus[xhigh]) re-implementa
  │    └─ Gate 1: REJEITADO (CRIT-002 persistente)
  └─ ⚠️  T7 marcada como BLOQUEADA. Relatório completo abaixo.

=== Relatório de bloqueio ===
Task: T7 (Implementar PSP retry com circuit breaker)
Tentativas: 3
Última falha: CRIT-002 — circuit breaker estado inconsistente após N falhas

JSON Gate 1 (Tentativa 3): { ... }
Memória lazy: /docs/specs/features/{feature}/{version}/tasks/.tmp/T7.md
Paths tocados: internal/psp/circuit_breaker.go, internal/psp/circuit_breaker_test.go

Próximo passo: revisar manualmente. Edite a task e re-rode /agent-spec-sdd-run-tasks.
```

---

## Logs em qa-observations.md

Auto-escalações e tasks bloqueadas vão para `docs/specs/features/<feature>/<version>/qa-observations.md`:

```markdown
## 2026-04-28
- T5 — auto-escalado sonnet → opus[xhigh] (attempt=2, severity=high)
- T7 — BLOQUEADA após 3 tentativas (CRIT-002 persistente)
```

---

## Troubleshooting

| Sintoma | Possível causa | Ação |
| --- | --- | --- |
| "Aborted: not a git repo" | `git status` falha | `git init` ou rodar de dentro de repo válido |
| "Task plan não encontrado" | Path errado no argumento | Confira o argumento; lembre kebab-case da feature |
| Gate 1 rejeitando consistentemente em CA-X | Spec ambígua ou CA mal definido | Pause execução, revise tech_spec/task, regenere |
| Gate 2 cita ADR que não existe | INDEX.md desatualizado | `/agent-spec-adr-reindex` |
| Não existe arquivo `T{N}-execution-summary.md` em `.tmp/` | Comportamento atual esperado | `base_sha` + sumário do executor passam inline no prompt (não em arquivo). Ver [Memória Proativa](../advanced/proactive-memory.md) |
| Tokens explodindo | qa_context.md ausente OU consolidação por camada não aplicada | Veja [qa_context](../advanced/qa-context.md) e [QA Consolidation](../advanced/qa-consolidation.md) |

---

## Próximos passos

* [agent-spec-sdd-run-tasks (skill)](../skills/sdd/sdd-run-tasks.md) — contrato e fluxo detalhado.
* [Gates e Loops](../concepts/gates-loops.md) — referência conceitual.
* [Auto-escalação](../advanced/auto-escalation.md) — heurística sonnet→opus.
* [Pipeline — agent-spec-minispec-run-tasks](minispec-run-tasks.md) — análogo para miniSpec.
* [Pipeline — agent-spec-taskcard-run](taskcard-run.md) — para uma TaskCard isolada.
