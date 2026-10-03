---
id: "overview"
title: "Visão Geral"
sidebar_position: 1
---
# Visão Geral dos Conceitos

Esta seção cobre os fundamentos do framework. Recomendado ler em ordem na primeira vez:

1. [Spec-Driven Development](/concepts/spec-driven.html) — princípio central: spec antes de código.
2. [Os 4 Caminhos](/concepts/four-paths.html) — Conversa, TaskCard, miniSpec, SDD.
3. [Contexto Mínimo](/concepts/minimum-context.html) — economia de tokens via passagem mínima de contexto.
4. [Gates e Loops](/concepts/gates-loops.html) — pipeline de validação automática (QA + Tech Review).
5. [O papel do framework-paths.md](/concepts/framework-paths.html) — rule global onde vivem os paths canônicos.

---

## A 1 minuto

```
┌────────────────────────────────────────────────────┐
│ 1. GERAÇÃO de specs (skills \*-generate-\*) │
│ PRD, Intent, Scope, Tech Spec, Task Plan, │
│ TaskCard — artefatos versionados em │
│ /docs/specs/features/ │
└────────────────┬───────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────┐
│ 2. EXECUÇÃO (skills \*-run-tasks) │
│ Delegação ao executor (agent\_name da stack) │
│ Sequencial, respeita dependências │
└────────────────┬───────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────┐
│ 3. VALIDAÇÃO (gates automáticos) │
│ Gate 1 — agent-spec-qa-validator (funcional + testes) │
│ Gate 2 — agent-spec-staff-architecture-review │
│ Loop de correção até 3 tentativas │
└────────────────────────────────────────────────────┘
```

Cada camada é detalhada em [Spec-Driven Development](/concepts/spec-driven.html).

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

[Detalhe completo dos 4 caminhos](/concepts/four-paths.html).

---

## Princípios cardeais

### 1. Contexto mínimo

Cada subagente recebe **apenas o que precisa** para cumprir sua função. Detalhes em [Contexto Mínimo](/concepts/minimum-context.html).

### 2. Modelo mínimo que resolve

| Papel | Default | Escala para Opus quando |
| --- | --- | --- |
| Executor | Sonnet (ou `model:` da task) | área crítica, retry ≥ 2, severity=high |
| agent-spec-qa-validator (Gate 1) | Sonnet | área crítica, risk=high |
| agent-spec-staff-architecture-review (Gate 2) | Sonnet | área crítica, security\_flags, retry ≥ 1 |
| agent-spec-qa-test-generator | Sonnet | nunca escala (papel de geração) |

> **Nunca Haiku** em executor, QA ou Tech Review. Code review exige pattern recognition.

Detalhes em [Model Selection](/advanced/model-selection.html).

### 3. Gate opt-out explícito

Tasks triviais podem declarar `gates:` no frontmatter:

```markdown
- gates: none # apenas executor
- gates: [qa] # só Gate 1
- gates: [qa, tech\_review] # default — ambos
```

Veja [Fast-path Gates](/advanced/fast-path-gates.html).

### 4. Política débito-controlado

Críticos/altos sempre rejeitam (loop de correção até 3 tentativas com auto-escalação sonnet→opus). Médios/baixos em categorias `code_review_only` (code\_quality, naming, style, documentation, dead\_code, imports) passam como `APROVADO_COM_OBSERVACOES` (Gate 1) / `approved_with_observations` (Gate 2) — débito anotado em [`qa-observations.md`](/observability/qa-observations.html) e recolhido pela skill [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html) para gerar uma `v{N+1}-debits/` de cleanup. Detalhes em [Gates e Loops](/concepts/gates-loops.html).

### 5. Single source of truth de paths no `framework-paths.md`

Os paths canônicos do framework vivem em `.claude/rules/framework-paths.md`, uma rule global carregada automaticamente no system-prompt. O `CLAUDE.md` da raiz traz configurações específicas do projeto e importa a rule. Veja [O papel do framework-paths.md](/concepts/framework-paths.html).

---

## Próximos passos

* [Spec-Driven Development](/concepts/spec-driven.html) — princípio central detalhado.
* [Os 4 Caminhos](/concepts/four-paths.html) — escolher o caminho certo.
* [Gates e Loops](/concepts/gates-loops.html) — pipeline de validação.
* [Discovery](/discovery/overview.html) — ponto de entrada (agent-spec-pre-refinement + Strategy Selector).
* [Skills — Visão Geral](/skills/overview.html) — todas as 28 skills disponíveis.
