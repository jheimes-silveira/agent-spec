---
description: Paths canônicos do framework SDD (PRD → Tech Spec → Task Plan → Tasks). Carregada quando uma skill sdd-* está ativa. Paths compartilhados de docs/specs e docs/prds são tratados pela rule comum agent-spec-workflow-rules.md (para evitar carregamento cruzado entre os 3 frameworks que dividem o diretório docs/specs).
paths:
  - ".claude/skills/agent-spec-sdd-*/**"
---

# SDD — Paths do Workflow

> Variáveis dinâmicas: `{feature}`, `{version}`. Substitua sempre antes de ler/salvar.
> **NUNCA** use paths hardcoded — use os templates abaixo.
> Paths compartilhados (pre_refinement, tech_alignment, run_report, workflow_report, temp_memory) e Critical Paths estão em `agent-spec-workflow-rules.md`.

---

## SDD — Etapa PRD
- **sdd.prd.path**: `/docs/prds/features/{feature}/{version}/prd.md`
- **sdd.state.path**: `/docs/specs/features/{feature}/{version}/_run/sdd_state.yaml`

## SDD — Etapa Tech Spec
- **sdd.tech_spec.path**: `/docs/specs/features/{feature}/{version}/tech_spec.md`

## SDD — Etapa Task Plan
- **sdd.task_plan.path**: `/docs/specs/features/{feature}/{version}/task_plan.md`
- **sdd.tasks.dir**: `/docs/specs/features/{feature}/{version}/tasks/`
- **sdd.tasks.pattern**: `T{n}.md`
- **sdd.qa_context.path**: `/docs/specs/features/{feature}/{version}/_run/qa_context.md`

---

## SDD — Etapa Opcional: Challenge da Tech Spec

Entre `/agent-spec-sdd-generate-tech-spec` e `/agent-spec-sdd-generate-task-plan`, o usuário pode invocar `/agent-spec-challenge-spec` para stress-testar a tech spec contra código, ADRs e glossário de domínio antes de decompor em tasks.

- **Comando**: `/agent-spec-challenge-spec /docs/specs/features/{feature}/{version}/tech_spec.md`
- **Skill**: `.claude/skills/agent-spec-challenge-spec/SKILL.md`
- **Quando usar**: features com risco arquitetural relevante (toca critical_paths, decisões com trade-off real, novos domínios).
- **Quando pular**: features triviais, ajustes pontuais, specs já revisadas manualmente com profundidade.
- **Efeito no estado**: ao concluir, atualiza `steps.validation.status: completed` no `_run/sdd_state.yaml` (se a etapa for pulada, o `agent-spec-sdd-generate-task-plan` marca `skipped`).
- **Efeito**: pode modificar inline o `tech_spec.md`, criar/atualizar `domain_glossary.global.path` (`/docs/specs/domain-glossary.md`, cross-feature) e/ou `domain_glossary.feature.path` (raiz da feature, compartilhado entre versões), e sugerir ADRs novas (que o usuário cria via `/agent-spec-adr-create`).
