---
title: "Apêndice D — Quem chama quem (mapa de skills)"
description: "Referência rápida de todas as skills, agrupadas por etapa do pipeline."
---
# Apêndice D — Quem chama quem (mapa de skills)

```
Discovery
└─ /agent-spec-pre-refinement → Strategy Selector recomenda o framework
Geração (SDD) Geração (miniSpec)
├─ /agent-spec-sdd-generate-prd ├─ /agent-spec-minispec-generate-intent
├─ /agent-spec-generate-tech-alignment (opc.) ├─ /agent-spec-generate-tech-alignment (opc.)
├─ /agent-spec-sdd-generate-tech-spec ├─ /agent-spec-minispec-generate-scope
│ └─ invoca agent-spec-qa-test-generator ├─ /agent-spec-challenge-spec (opcional)
├─ /agent-spec-challenge-spec (opcional) └─ /agent-spec-minispec-generate-tasks
└─ /agent-spec-sdd-generate-task-plan └─ invoca agent-spec-qa-test-generator
└─ invoca agent-spec-qa-test-generator
Geração (TaskCard)
└─ /agent-spec-taskcard-generate
Execução (todos seguem: Executor → Gate 1 → Gate 2 → git add)
├─ /agent-spec-sdd-run-tasks
├─ /agent-spec-minispec-run-tasks
└─ /agent-spec-taskcard-run
ADRs Manutenção
├─ /agent-spec-adr-bootstrap (retroativo) └─ /agent-spec-debt-resolution
├─ /agent-spec-adr-create (recolhe débitos médio/baixo
├─ /agent-spec-adr-supersede e gera v{N+1}-debits/)
├─ /agent-spec-adr-deprecate
├─ /agent-spec-adr-list · /agent-spec-adr-show · /agent-spec-adr-review
└─ /agent-spec-adr-reindex (regenera INDEX.md)
```

## 📚 Aprofundamento na Referência

* **[Skills — visão geral](/skills/overview.html)** — descrição completa de cada skill.
* **[Pipeline — visão geral](/pipeline/overview.html)** — como os orquestradores `*-run-tasks` operam.
* **[Agents — visão geral](/agents/overview.html)** — `agent-spec-qa-validator`, `agent-spec-staff-architecture-review`, `agent-spec-qa-test-generator`.
