---
id: "overview"
title: "Visão Geral"
sidebar_position: 1
---
# Visão Geral dos Conceitos

Esta seção cobre os fundamentos do framework. Recomendado ler em ordem na primeira vez:

1. [Spec-Driven Development](spec-driven.md) — princípio central: spec antes de código.
2. [Os 4 Caminhos](four-paths.md) — Conversa, TaskCard, miniSpec, SDD.
3. [Contexto Mínimo](minimum-context.md) — economia de tokens via passagem mínima de contexto.
4. [Gates e Loops](gates-loops.md) — pipeline de validação automática (QA + Tech Review).
5. [O papel do framework-paths.md](framework-paths.md) — rule global onde vivem os paths canônicos.

---

## A 1 minuto

```
┌────────────────────────────────────────────────────┐
│  1. GERAÇÃO de specs (skills *-generate-*)         │
│     PRD, Intent, Scope, Tech Spec, Task Plan,      │
│     TaskCard — artefatos versionados em            │
│     /docs/specs/features/                          │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  2. EXECUÇÃO (skills *-run-tasks)                  │
│     Delegação ao executor (agent_name da stack)    │
│     Sequencial, respeita dependências              │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  3. VALIDAÇÃO (gates automáticos)                  │
│     Gate 1 — agent-spec-qa-validator (funcional + testes)     │
│     Gate 2 — agent-spec-staff-architecture-review       │
│     Loop de correção até 3 tentativas              │
└────────────────────────────────────────────────────┘
```

Cada camada é detalhada em [Spec-Driven Development](spec-driven.md).

---

## Os 4 caminhos

A **mesma arquitetura** em 4 níveis de formalização:

`Conversa`

#### Conversa direta

Sem artefato, sem gate. Spike, exploração, aprendizado.

**~10-30k tokens**

`TaskCard`

#### TaskCard

1 arquivo, gates ativos. Task pontual em 1-3 arquivos.

**~80-150k tokens**

`miniSpec`

#### miniSpec

Intent + Scope + tasks. Feature média (1-3 US).

**~400-600k tokens**

`SDD`

#### SDD

PRD + Tech Spec + ADRs. Feature grande, multi-persona.

**~1.5M tokens**

[Detalhe completo dos 4 caminhos](four-paths.md).

---

## Princípios cardeais

### 1. Contexto mínimo

Cada subagente recebe **apenas o que precisa** para cumprir sua função. Detalhes em [Contexto Mínimo](minimum-context.md).

### 2. Modelo mínimo que resolve

| Papel | Default | Escala para Opus quando |
| --- | --- | --- |
| Executor | Sonnet (ou `model:` da task) | área crítica, retry ≥ 2, severity=high |
| agent-spec-qa-validator (Gate 1) | Sonnet | área crítica, risk=high |
| agent-spec-staff-architecture-review (Gate 2) | Sonnet | área crítica, security_flags, retry ≥ 1 |
| agent-spec-qa-test-generator | Sonnet | nunca escala (papel de geração) |

> **Nunca Haiku** em executor, QA ou Tech Review. Code review exige pattern recognition.

Detalhes em [Model Selection](../advanced/model-selection.md).

### 3. Gate opt-out explícito

Tasks triviais podem declarar `gates:` no frontmatter:

```markdown
- gates: none              # apenas executor
- gates: [qa]              # só Gate 1
- gates: [qa, tech_review] # default — ambos
```

Veja [Fast-path Gates](../advanced/fast-path-gates.md).

### 4. Política débito-controlado

Críticos/altos sempre rejeitam (loop de correção até 3 tentativas com auto-escalação sonnet→opus). Médios/baixos em categorias `code_review_only` (code_quality, naming, style, documentation, dead_code, imports) passam como `APROVADO_COM_OBSERVACOES` (Gate 1) / `approved_with_observations` (Gate 2) — débito anotado em [`qa-observations.md`](../observability/qa-observations.md) e recolhido pela skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) para gerar uma `v{N+1}-debits/` de cleanup. Detalhes em [Gates e Loops](gates-loops.md).

### 5. Single source of truth de paths no `framework-paths.md`

Os paths canônicos do framework vivem em `.claude/rules/framework-paths.md`, uma rule global carregada automaticamente no system-prompt. O `CLAUDE.md` da raiz traz configurações específicas do projeto e importa a rule. Veja [O papel do framework-paths.md](framework-paths.md).

---

## Próximos passos

* [Spec-Driven Development](spec-driven.md) — princípio central detalhado.
* [Os 4 Caminhos](four-paths.md) — escolher o caminho certo.
* [Gates e Loops](gates-loops.md) — pipeline de validação.
* [Discovery](../discovery/overview.md) — ponto de entrada (agent-spec-pre-refinement + Strategy Selector).
* [Skills — Visão Geral](../skills/overview.md) — todas as 28 skills disponíveis.
