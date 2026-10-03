---
id: "overview"
title: "Frameworks — Visão Geral"
sidebar_position: 1
---
# Frameworks — Visão Geral

O framework oferece **4 caminhos** para diferentes níveis de formalização. Esta página é o portal de comparação. Para detalhes de cada caminho, veja a página específica.

> **Princípio**: a mesma arquitetura (Geração → Execução → Validação) em 4 níveis de densidade. Escolher errado é a maior fonte de desperdício de tokens.

---

## Comparativo

`Conversa`

#### [Conversa direta](conversa-direta.md)

Sem artefato, sem gate. Spike, exploração, aprendizado.

**~10-30k tokens**

`TaskCard`

#### [TaskCard](taskcard.md)

1 arquivo, gates ativos. Task pontual em 1-3 arquivos.

**~80-150k tokens**

`miniSpec`

#### [miniSpec](minispec.md)

Intent + Scope + tasks. Feature média (1-3 US).

**~400-600k tokens**

`SDD`

#### [SDD](sdd.md)

PRD + Tech Spec + ADRs. Feature grande, multi-persona.

**~1.5M tokens**

## Tabela

| Critério | Conversa | **TaskCard CRUD Fast-Path** ⚡ | TaskCard | miniSpec | SDD |
| --- | --- | --- | --- | --- | --- |
| **Artefatos** | 0 | 1 | 1 | ~3 | ~5 |
| **Skills do framework** | — | 2 (modo `--mode=crud-fastpath`) | 2 | 4-5 | 4 |
| **Gates** | 0 | 1 (`[qa]` por default) | 2 | 2 | 2 |
| **Tempo (dev)** | < 1h | **30-45min** | < 1 dia | 1-5 dias | 1-3 semanas |
| **User Stories** | 0 | 1 (CRUD repetindo pattern) | 0-1 | 1-3 | 4+ |
| **Stakeholders** | só dev | só dev | só dev | dev + 1 | múltiplas personas |
| **ADRs novas** | nunca | nunca (pattern repetido) | raramente | raramente | quase sempre considera |
| **Custo típico** | 10-30k | **40-65k** | 80-150k | 400-600k | 1.5M |
| **Reversibilidade** | trivial | fácil | fácil | média | alta |

---

## Discovery: ponto de entrada universal

Independente do caminho final, o **[Discovery](../discovery/overview.md)** é o ponto de entrada recomendado quando a ideia ainda está vaga. A skill [agent-spec-pre-refinement](../skills/shared/pre-refinement.md) gera um documento com:

* Ideia reescrita, problema, escopo, restrições.
* **FATO × HIPÓTESE × DÚVIDA** explícitos.
* Brainstorm de variações.
* **Recomendação de framework** via [Strategy Selector](../discovery/strategy-selector.md) (**9 sinais** — inclui S9 CRUD-pattern-repeat).

```
Ideia crua → /discovery → pre-refinement.md → recomendação de framework → próxima skill
```

---

## Árvore de decisão

```
A ideia é exploração / aprendizado?
│
├── SIM → Conversa direta
│
└── NÃO → Tem decisão arquitetural nova OU greenfield OU multi-persona?
         │
         ├── SIM → SDD
         │
         └── NÃO → É CRUD repetindo pattern existente no projeto (S9=sim)?
                  │
                  ├── SIM → TaskCard CRUD Fast-Path ⚡ (30-45min)
                  │
                  └── NÃO → Tem múltiplas User Stories OU envolve produto/design?
                           │
                           ├── SIM → miniSpec
                           │
                           └── NÃO → TaskCard
```

---

## Tudo passa pelos mesmos gates

Independente do caminho (exceto Conversa direta), **toda task implementada** passa pelos mesmos gates:

* **Gate 1**: [agent-spec-qa-validator](../agents/qa-validator.md) — funcional + testes.
* **Gate 2**: [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md) — arquitetural + ADRs.

Mesmo loop de correção (3 tentativas, auto-escalação sonnet→opus, **política débito-controlado** — críticos/altos rejeitam, médios/baixos viram débito anotado). Detalhes em [Gates e Loops](../concepts/gates-loops.md).

A diferença entre caminhos é a **densidade de spec gerada antes** da execução, não a qualidade da validação.

---

## Próximos passos

* [Conversa direta](conversa-direta.md)
* [TaskCard](taskcard.md)
* [miniSpec](minispec.md)
* [SDD](sdd.md)
* [Discovery — Overview](../discovery/overview.md)
* [Strategy Selector](../discovery/strategy-selector.md)
