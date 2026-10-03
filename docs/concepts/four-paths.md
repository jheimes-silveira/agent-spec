---
id: "four-paths"
title: "Os 4 Caminhos"
sidebar_position: 3
---
# Os 4 Caminhos

O framework oferece 4 níveis de formalização. Escolher errado é a maior fonte de desperdício de tokens.

## Matriz comparativa

| Critério | Conversa | TaskCard | miniSpec | SDD |
| --- | --- | --- | --- | --- |
| **Artefatos** | 0 | 1 | ~3 | ~5 |
| **Skills envolvidas** | 0 | 2 | 4-5 | 4 |
| **Gates** | 0 | 2 | 2 | 2 |
| **Tempo (dev)** | <1h | <1 dia | 1-5 dias | 1-3 semanas |
| **User Stories** | 0 | 0-1 | 1-3 | 4+ |
| **Stakeholders** | só dev | só dev | dev + 1 | múltiplas personas |
| **ADRs novas** | nunca | raramente | raramente | quase sempre considera |
| **Custo típico** | 10-30k | 80-150k | 400-600k | 1.5M |
| **Reversibilidade** | trivial | fácil | média | alta |

---

## Quando usar cada um

### Conversa direta

[Detalhe](/frameworks/conversa-direta.html)

**Use quando**:

* Está aprendendo (*"me mostra como usar `context.WithTimeout`"*).
* Explorando uma hipótese (*"por que esse teste está flaky?"*).
* Decidindo algo curto (*"vale a pena trocar `encoding/json` por `sonic`?"*).

**Não use quando**: vai gerar artefato (documentação, código commitado, spec).

### TaskCard

[Detalhe](/frameworks/taskcard.html) · skills: [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) → [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html)

**Use quando**:

* Escopo fechado em 1-2 arquivos.
* Nenhuma decisão arquitetural nova.
* Está reusando padrão existente no codebase.
* Solo, sem validação de produto/design.

**Exemplos típicos**:

* "Adicionar validação de CPF no endpoint X".
* "Refatorar função Y para usar padrão existente Z".
* "Atualizar lib W para versão mais recente".

### miniSpec

[Detalhe](/frameworks/minispec.html) · skills: [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) → ([agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) opcional) → [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) → [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) → [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html)

**Use quando**:

* 1-3 User Stories distintas.
* Envolve produto ou design (revisão de UX).
* Incremento em módulo existente (não greenfield).
* Sem decisão arquitetural nova que vire ADR.

**Exemplos típicos**:

* "Adicionar filtros e ordenação no catálogo".
* "Implementar password reset".
* "Adicionar export CSV nos relatórios".

### SDD

[Detalhe](/frameworks/sdd.html) · skills: [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) → ([agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) opcional) → [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) → [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) → [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html)

**Use quando** (qualquer gatilho):

* ≥ 4 User Stories implícitas.
* Múltiplas personas afetadas.
* Decisão arquitetural nova que vira ADR.
* Greenfield (módulo novo do zero).

**Exemplos típicos**:

* "Novo módulo de pagamentos".
* "Multi-tenant".
* "Esqueleto arquitetural de um backend novo".

---

## Árvore de decisão (simplificada)

```
A ideia é exploração / aprendizado?
│
├── SIM → Conversa direta
│
└── NÃO → Tem decisão arquitetural nova OU greenfield OU multi-persona?
│
├── SIM → SDD
│
└── NÃO → Tem múltiplas User Stories OU envolve produto/design?
│
├── SIM → miniSpec
│
└── NÃO → TaskCard
```

---

## Não adivinhe — rode o Strategy Selector

O `/discovery` aplica essa lógica automaticamente via checklist de 8 sinais. Veja:

* [Discovery — Overview](/discovery/overview.html) — fluxo do discovery.
* [Strategy Selector](/discovery/strategy-selector.html) — checklist completa.
* [Pre-refinement](/discovery/pre-refinement.html) — entrada universal antes do Strategy Selector.

---

## Tudo passa pelos mesmos gates

Independente do caminho, **toda task implementada** passa pelos mesmos gates (Gate 1 QA + Gate 2 Tech Review) com o mesmo loop de correção. Veja [Gates e Loops](/concepts/gates-loops.html).

A diferença entre caminhos é a **densidade de spec gerada antes** da execução, não a qualidade da validação.
