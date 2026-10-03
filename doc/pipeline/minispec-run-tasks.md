---
id: "agent-spec-minispec-run-tasks"
title: "Pipeline — agent-spec-minispec-run-tasks"
sidebar_position: 3
---
# Pipeline — agent-spec-minispec-run-tasks

Foco operacional do orquestrador miniSpec. Para o contrato da skill, veja [skills/minispec/minispec-run-tasks](../skills/minispec/minispec-run-tasks.md). Pipeline **idêntico** ao [agent-spec-sdd-run-tasks](sdd-run-tasks.md) — diferença é apenas o estado (`minispec_state.yaml` em vez de `sdd_state.yaml`) e os artefatos de entrada (intent + scope em vez de prd + tech_spec).

---

## Comando

```bash
/agent-spec-minispec-run-tasks <task_plan.md> [agent_name]
```

---

## Pré-requisitos

```bash
# 1. Repositório git inicializado
git status

# 2. Task plan + tasks individuais geradas
ls docs/specs/features/<feature>/<version>/task_plan.md
ls docs/specs/features/<feature>/<version>/tasks/

# 3. CLAUDE.md presente
test -f CLAUDE.md

# 4. Agent executor registrado (opcional — se omitir agent_name, a skill faz descoberta interativa)
ls .claude/agents/<agent_name>.md
```

---

## Fluxo executado

Estrutura idêntica ao [agent-spec-sdd-run-tasks](sdd-run-tasks.md). Veja [pipeline/overview](overview.md) para o diagrama unificado.

```
FASE 0   git ok | cleanup | minispec_state.yaml: in_progress
         + carregar bloco "Disciplina do Executor (Iron Rules)"
         + 6.1 Resume pós-interrupção: task "Em Progresso", memória lazy
           recente (< 24h) ou diff não-staged em paths declarados →
           AskUserQuestion (retomar nos gates [base_sha da memória lazy
           ou grep `[T{N}] base_sha=` em qa-observations] / reexecutar do
           zero [git checkout + deleta untracked declarados em "a criar"]
           / resolver manualmente)
         + 6.2 Validade do qa_context.md: scope.md mais novo que
           .qa_context.md → loga stale, trata como não-confiável
FASE 1   Grafo de dependências de task_plan.md
FASE 2   Por FASE do task_plan: re-verifica flag derivado (guards) ⚡
         · DAG independente + disjunção de símbolo + paths disjuntos
           + sem arquivo de alta contenção + lote ≤ 4
         · Sucesso: despacho concorrente numa única mensagem
         · Qualquer guard sem prova de independência: fallback sequencial
FASE 2.4 Pós-executor: git add -N -- <task_paths> (torna arquivos novos/
         untracked visíveis no git diff --name-only <base_sha> desde o
         Gate 1) + captura inline de base_sha/sumário
FASE 3   Gate 1 (agent-spec-qa-validator)
         · No lote paralelo: 1 invocação por task em paralelo
         · Guard de QA serializado: se ≥ 2 tasks do lote têm testes de
           integração/E2E não-vazios, os QAs rodam um por vez (ordem de ID)
           — suítes concorrentes colidem (DB/porta/fixture)
FASE 3.5 Loop QA em rejeição
FASE 4   Gate 2 (agent-spec-staff-architecture-review)
         · No lote paralelo: pipelines isolados SEM barreira — o TR de
           cada task despacha assim que o QA DELA aprova
FASE 4.4 Loop Tech Review em rejeição (revalidação conforme
         requires_qa_revalidation — bloqueantes só de code-review pulam QA;
         rejeição do QA sempre re-passa pelo QA)
FASE 4.5 / FASE 5(0)  git add (stage real) — ordem determinística por ID;
         TODA task aprovada é staged, inclusive fast-path ([qa], none)
FASE 5   minispec_state.yaml + task_plan.md atualizados
```

> **Disciplina do Executor (Iron Rules) 🛡️**: a cada delegação ao executor, o orquestrador injeta **verbatim** o bloco entre `<<<EXECUTOR_DISCIPLINE … EXECUTOR_DISCIPLINE>>>` da referência [`references/executor-discipline.md`](../configuration/executor-discipline.md) — arquivo **canônico desta skill**, com symlinks em `agent-spec-sdd-run-tasks` e `agent-spec-taskcard-run` (**não é rule** do system-prompt; é carregado lazy na FASE 0). Sem esse bloco, o sub-agente (que roda em contexto isolado) não recebe as **6 Iron Laws** anti-vícios-de-LLM — as 4 adaptadas das Karpathy Guidelines (Pense antes / Simplicidade / Cirúrgico / Goal-driven) + Disciplina de testes + Lei do seam (Iron Law #6). Violações da Regra #2 são detectadas no Gate 2 pela categoria [`speculative_complexity`](../advanced/conditional-gates.md).
>
> **Execução Paralela de Tasks ⚡**: a coluna "Pode Rodar em Paralelo?" do `task_plan.md` é **derivada** (Regra 10d do gerador) e o orquestrador a **re-verifica** com os guards — nunca confia cego. Uma task entra no lote só se TODOS provarem independência: **DAG independente** (sem ancestral/descendente no lote), **disjunção de símbolo** (`consumidos ∩ criados` de par = ∅), **paths disjuntos**, **nenhum arquivo de alta contenção** compartilhado (container DI, router/registry, barrel, manifests, migrations) e **lote ≤ 4**. Default na incerteza: sequencial. Dependências **reconciliadas** com a seção 1 do `TN.md` (autoritativa) pela união. Detalhes em [Path Templates → Execução Paralela de Tasks](../configuration/path-templates.md).
>
> **Motivação (post-mortem `cadastro-pratos-franquia` + runs com conflito de ordem)**: T1-T4 declaradas paralelas rodaram sequenciais (~40min; em paralelo ~10min). Em outros runs, flag autorado por intuição + guard cego a símbolo em arquivo ainda-não-criado colocaram tasks dependentes no mesmo lote → conflito de ordem. O contrato derivado fecha as duas falhas.
>
> **`design.md` no Gate 1**: se a task é de camada UI e referencia o `design.md` da feature (via `design.feature.path`), o orquestrador o inclui em `arquivos[]` do QA — é o **contrato visual** da Camada 4 (Completude). As `instrucoes` ao QA dizem: estados visuais (loading/erro/vazio/sucesso) implementados devem corresponder ao especificado no design.md — divergência é problema de COMPLETUDE.

---

## Exemplo de execução (caminho de sucesso)

```bash
$ /agent-spec-minispec-run-tasks docs/specs/features/catalogo-filtros/v1/task_plan.md <seu-executor>

[FASE 0] ✓ git ok | minispec_state.yaml: in_progress
[FASE 1] Grafo: T1 → T2 → T3 → T4

[T1] executor: sonnet                    gates: [qa, tech_review]
  ├─ executor implementou (repository de filtros)
  ├─ Gate 1: APROVADO  | testes 8/8
  ├─ Gate 2: approved
  └─ git add -- internal/catalogo/filtros_repository.go ...

[T2] executor: sonnet                    gates: [qa, tech_review]
  ├─ executor (service)
  ├─ Gate 1: APROVADO
  ├─ Gate 2: approved
  └─ git add ...

[T3] executor: sonnet                    gates: [qa]    ← fast-path
  ├─ executor (handler)
  ├─ Gate 1: APROVADO  (Gate 2 pulado por declaração)
  └─ git add ...

[T4] executor: sonnet                    gates: [qa, tech_review]
  ├─ executor (e2e + packaging)
  ├─ Gate 1: APROVADO  | testes 14/14
  ├─ Gate 2: approved
  └─ git add ...

✅ 4 tasks executadas | 0 bloqueadas
```

---

## Diferenças vs agent-spec-sdd-run-tasks

| Aspecto | agent-spec-minispec-run-tasks | agent-spec-sdd-run-tasks |
| --- | --- | --- |
| Estado | `minispec_state.yaml` | `sdd_state.yaml` |
| Artefatos de spec lidos | `intent.md`, `scope.md` | `prd.md`, `tech_spec.md` |
| Tamanho típico | 2-5 tasks | 6-12 tasks |
| Custo típico | ~400-600k tokens | ~1M-1.5M tokens |

**O que é igual**:

* Gates (agent-spec-qa-validator + agent-spec-staff-architecture-review).
* Loops e auto-escalação.
* Memória lazy / proativa.
* Política débito-controlado.
* Fast-paths.

---

## Logs e troubleshooting

Mesmas convenções e cenários de troubleshooting do [agent-spec-sdd-run-tasks](sdd-run-tasks.md). Veja a seção lá.

---

## Próximos passos

* [agent-spec-minispec-run-tasks (skill)](../skills/minispec/minispec-run-tasks.md) — contrato e fluxo detalhado.
* [Gates e Loops](../concepts/gates-loops.md) — referência conceitual.
* [Pipeline — Overview](overview.md) — comparativo dos 3 orquestradores.
* [Pipeline — agent-spec-sdd-run-tasks](sdd-run-tasks.md) — análogo SDD.
* [Pipeline — agent-spec-taskcard-run](taskcard-run.md) — para uma TaskCard isolada.
