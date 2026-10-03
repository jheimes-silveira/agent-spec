---
id: "state-files"
title: "Arquivos de Estado"
sidebar_position: 1
---
# Arquivos de Estado

`sdd_state.yaml` e `minispec_state.yaml` rastreiam o progresso do pipeline de cada feature.

---

## Paths

Resolvidos via [framework-paths.md](/configuration/framework-paths.html):

| Framework | Chave | Path resolvido |
| --- | --- | --- |
| SDD | `sdd.state.path` | `/docs/specs/features/{feature}/{version}/sdd_state.yaml` |
| miniSpec | `minispec.state.path` | `/docs/specs/features/{feature}/{version}/minispec_state.yaml` |

> TaskCard **não** tem state file — cada TaskCard é independente.

---

## Estrutura — `sdd_state.yaml`

```yaml
feature: "backend-figurinhas-copa"
version: "v1"
current\_step: "tech\_spec"
source: "recommended" # aderência ao discovery
source\_note: "" # preenchido se overridden
steps:
prd:
status: "completed"
summary: "14 US, 23 CA. Backend greenfield para figurinhas."
timestamp: "2026-04-20T14:30:00Z"
tech\_alignment:
status: "completed" # se a etapa foi rodada
summary: "REST + JWT, soft delete, retry com backoff."
tech\_spec:
status: "in\_progress"
summary: ""
task\_plan:
status: "pending"
summary: ""
execution:
status: "in\_progress" # in\_progress | completed
started\_at: "2026-04-22T10:00:00Z"
tasks\_total: 8
tasks\_completed: 5
tasks\_blocked: 0
source\_recommendation:
detected\_in\_discovery: "SDD" # o que o Strategy Selector recomendou
user\_chose: "SDD" # o que o usuário rodou
```

---

## Estrutura — `minispec_state.yaml`

Estrutura análoga:

```yaml
feature: "catalogo-filtros"
version: "v1"
current\_step: "scope"
source: "recommended"
steps:
intent:
status: "completed"
tech\_alignment:
status: "completed"
scope:
status: "in\_progress"
tasks:
status: "pending"
execution:
status: "pending"
tasks\_total: 0
```

---

## Campo `source` (instrumentação do discovery)

| Valor | Significado |
| --- | --- |
| `recommended` | Usuário seguiu a recomendação do [Strategy Selector](/discovery/strategy-selector.html) |
| `overridden` | Usuário divergiu da recomendação (registra qual era em `source_note`) |
| `no_discovery` | Não havia `pre-refinement.md` (skill foi invocada direto) |

Permite medir taxa de aderência ao discovery ao longo do tempo.

---

## Quem atualiza

| Skill | Quando atualiza |
| --- | --- |
| [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) | Cria `sdd_state.yaml` com `prd: completed` |
| [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) | `tech_spec: completed` |
| [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) | `task_plan: completed`, `execution: pending` |
| [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) | `execution: in_progress` (início) → `completed` (fim) |
| [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) | Cria `minispec_state.yaml` |
| [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) | `scope: completed` |
| [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) | `tasks: completed` |
| [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html) | `execution: in_progress` → `completed` |

---

## Quem lê

* **Orquestradores** verificam que pré-requisitos estão completos antes de prosseguir.
* **Comando de status** (se existir) imprime resumo legível.
* **Você** ao retomar uma feature: `cat sdd_state.yaml` mostra onde parou.

---

## Recovery / retomada

Se a sessão Claude Code é interrompida no meio de uma feature, você pode:

1. Verificar `current_step` em `<framework>_state.yaml`.
2. Continuar do passo apropriado.

Ex.: se `current_step: tech_spec` e `steps.prd.status: completed`, basta rodar [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html).

---

## Próximos passos

* [qa-observations.md](/observability/qa-observations.html) — log de auto-escalações e bloqueios.
* [Memória Temporária Debug](/observability/temp-memory-debug.html) — `docs/specs/features/{feature}/{version}/tasks/.tmp/`.
* [Discovery — Overview](/discovery/overview.html) — onde `source` é definido.
