---
description: Paths canônicos do framework TaskCard (tasks individuais e task plan agregador). Carregada quando uma skill taskcard-* está ativa. Paths compartilhados de docs/specs são tratados pela rule comum agent-spec-workflow-rules.md (para evitar carregamento cruzado entre os 3 frameworks que dividem o diretório docs/specs).
paths:
  - ".claude/skills/agent-spec-taskcard-*/**"
---

# TaskCard — Paths do Workflow

> Variáveis dinâmicas: `{feature}`, `{version}`, `{nn}` (sequencial 01, 02, ...), `{slug}` (kebab-case descritivo). Substitua sempre antes de ler/salvar.
> **NUNCA** use paths hardcoded — use os templates abaixo.
> Paths compartilhados (pre_refinement, run_report, workflow_report, temp_memory) e Critical Paths estão em `agent-spec-workflow-rules.md`.

---

## TaskCard — Tasks Individuais
- **taskcard.tasks.dir**: `/docs/specs/features/{feature}/{version}/tasks/`
- **taskcard.tasks.pattern**: `task-{nn}-{slug}.md`

## TaskCard — Task Plan (múltiplas TaskCards)
- **taskcard.task_plan.path**: `/docs/specs/features/{feature}/{version}/task_plan.md`
