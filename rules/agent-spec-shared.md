---
description: Regras compartilhadas entre os workflows do framework agent-spec (SDD, miniSpec, TaskCard, ADR e skills auxiliares de spec) — apenas conteúdo cross-workflow. Regras específicas de cada workflow ficam nos respectivos arquivos workflow-rules. Carregada automaticamente quando qualquer skill desses workflows está em execução.
paths:
  - ".claude/skills/agent-spec-sdd-*/**"
  - ".claude/skills/agent-spec-minispec-*/**"
  - ".claude/skills/agent-spec-taskcard-*/**"
  - ".claude/skills/agent-spec-adr-*/**"
  - ".claude/skills/agent-spec-pre-refinement/**"
  - ".claude/skills/agent-spec-generate-tech-alignment/**"
  - ".claude/skills/agent-spec-generate-design/**"
  - ".claude/skills/agent-spec-design-system-bootstrap/**"
  - ".claude/skills/agent-spec-challenge-spec/**"
  - ".claude/skills/agent-spec-backend-contract-handoff/**"
  - ".claude/skills/agent-spec-debt-resolution/**"
---

# Regras Compartilhadas — Workflows agent-spec

> Carregada automaticamente quando qualquer skill SDD, miniSpec, TaskCard, ADR ou skill auxiliar de spec (agent-spec-pre-refinement, agent-spec-generate-tech-alignment, agent-spec-challenge-spec, agent-spec-backend-contract-handoff) está em execução. Centraliza apenas conteúdo **cross-workflow** (válido em qualquer um deles). Conteúdo específico de cada workflow fica nos respectivos `agent-spec-{workflow}-workflow-rules.md`.

---

## Regra de Acentuação (pt-BR)

Todo artefato gerado pelos skills (`prd.md`, `tech_spec.md`, `task_plan.md`, `tasks/TN.md`, `intent.md`, `scope.md`, `taskcard.md`, ADRs em `docs/adr/`, `domain-glossary.md`, `pre-refinement.md`, `tech-alignment.md`, `design.md`, `design-system.md`) é em português brasileiro com acentuação correta:

- Títulos/seções: `Descrição`, `Restrições`, `Instruções`, `Validação`, `Configuração`
- Corpo: `não`, `é`, `está`, `será`, `também`, `através`, `após`, `até`, `único`
- Termos técnicos em pt-BR: `autenticação`, `paginação`, `migração`, `funcionalidade`

Apenas nomes de código (funções, variáveis, structs, pacotes) permanecem em inglês sem acento.
