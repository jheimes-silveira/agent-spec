---
description: Paths canônicos do framework miniSpec (Intent → Scope → Task Plan → Tasks). Carregada quando uma skill minispec-* está ativa. Paths compartilhados de docs/specs são tratados pela rule comum agent-spec-workflow-rules.md (para evitar carregamento cruzado entre os 3 frameworks que dividem o diretório docs/specs).
paths:
  - ".claude/skills/agent-spec-minispec-*/**"
  - ".claude/skills/agent-spec-debt-resolution/**"
---

# miniSpec — Paths do Workflow

> Variáveis dinâmicas: `{feature}`, `{version}`. Substitua sempre antes de ler/salvar.
> **NUNCA** use paths hardcoded — use os templates abaixo.
> Paths compartilhados (pre_refinement, tech_alignment, run_report, workflow_report, temp_memory) e Critical Paths estão em `agent-spec-workflow-rules.md`.

---

## miniSpec — Etapa INTENT
- **minispec.intent.path**: `/docs/specs/features/{feature}/{version}/intent.md`
- **minispec.state.path**: `/docs/specs/features/{feature}/{version}/_run/minispec_state.yaml`

## miniSpec — Etapa SCOPE
- **minispec.scope.path**: `/docs/specs/features/{feature}/{version}/scope.md`

## miniSpec — Etapa Task Plan
- **minispec.task_plan.path**: `/docs/specs/features/{feature}/{version}/task_plan.md`
- **minispec.tasks.dir**: `/docs/specs/features/{feature}/{version}/tasks/`
- **minispec.tasks.pattern**: `T{n}.md`
- **minispec.qa_context.path**: `/docs/specs/features/{feature}/{version}/_run/qa_context.md`

---

## miniSpec — Etapa Opcional: Challenge do Scope

Entre `/agent-spec-minispec-generate-scope` e `/agent-spec-minispec-generate-tasks`, o usuário pode invocar `/agent-spec-challenge-spec` para stress-testar o scope contra código, ADRs e glossário de domínio antes de decompor em tasks.

- **Comando**: `/agent-spec-challenge-spec /docs/specs/features/{feature}/{version}/scope.md`
- **Skill**: `.claude/skills/agent-spec-challenge-spec/SKILL.md`
- **Quando usar**: scopes com decisão técnica não-trivial, terminologia nova ou conflito potencial com código existente.
- **Quando pular**: scopes pequenos (1-2 endpoints, sem complexidade arquitetural).
- **Efeito**: pode modificar inline o `scope.md`, criar/atualizar `domain_glossary.global.path` (`/docs/specs/domain-glossary.md`, cross-feature) e/ou `domain_glossary.feature.path` (raiz da feature, compartilhado entre versões), e sugerir ADRs novas (que o usuário cria via `/agent-spec-adr-create`).
