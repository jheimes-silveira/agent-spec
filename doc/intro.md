---
id: "intro"
title: "Introdução"
sidebar_position: 1
---
# AgentSpec Framework — Introdução

Um conjunto de **skills**, **agents** e **convenções** para o [Claude Code](https://docs.claude.com/claude-code) que guia o desenvolvimento assistido por IA de forma **rastreável** e com **qualidade consistente**.

---

## O que esse framework resolve

| Problema | Como o framework resolve |
| --- | --- |
| **Escolha de ferramenta errada** | `/agent-spec-pre-refinement` aplica uma checklist objetiva ([Strategy Selector](discovery/strategy-selector.md)) e recomenda TaskCard / miniSpec / SDD / Conversa direta |
| **Contexto perdido entre sessões** | Artefatos versionados (`prd.md`, `intent.md`, `taskcard.md`) em `docs/specs/features/` |
| **Qualidade inconsistente** | Gates **QA** + **Tech Review** rodam automaticamente em cada task; críticos/altos bloqueiam e disparam loop, médios/baixos viram débito anotado (política débito-controlado) |
| **Custo alto de IA** | Modelo Sonnet por padrão; Opus só em crítico; memória proativa; qa_context pré-extraído |

---

## Para quem é

**Dev solo**  
 Use TaskCard ou miniSpec sem processo pesado.

**Equipe pequena**  
 miniSpec garante rastreabilidade US→Task.

**Feature grande**  
 SDD: PRD + Tech Spec + ADRs + validação automática.

**Spike / aprendizado**  
 Conversa direta, sem artefato.

---

## Próximo passo

* [Instalação](getting-started/installation.md) — como copiar o framework para o seu projeto.
* [Quick Start](getting-started/quick-start.md) — primeira feature em 5 minutos.
* [Primeira feature completa](getting-started/first-feature.md) — exemplo miniSpec ponta a ponta.
* [Conceitos](concepts/overview.md) — spec-driven, 4 caminhos, gates.

---

## Mapa mental

```
Ideia crua
    │
    ▼
/agent-spec-pre-refinement  ──────► pre-refinement.md
                          (FATO × HIPÓTESE × DÚVIDA + Brainstorm + Strategy Selector)
                                          │
            ┌─────────────────┬───────────┴──────────────────┐
            ▼                 ▼                              ▼
       [Conversa]       [TaskCard]      [miniSpec]                [SDD]
                       gera + executa   Intent → (Tech Align)     PRD → (Tech Align)
                                        Scope → tasks             Tech Spec → tasks
                                        run-tasks                 run-tasks
                                        (gates QA + Tech)         (gates QA + Tech)
```

---

## Componentes principais

| Componente | O que é | Onde aprender |
| --- | --- | --- |
| **Skills** (28) | Especialistas por etapa do pipeline — inclui [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md) para cleanup de débitos pós-execução | [Skills — Visão Geral](skills/overview.md) |
| **Agents** (4) | Subprocessos para gates e executores | [Agents — Visão Geral](agents/overview.md) |
| **Pipelines** (3) | Orquestradores que coordenam executor + gates | [Pipeline — Visão Geral](pipeline/overview.md) |
| **framework-paths.md** | Rule global com paths canônicos do framework, carregada no system-prompt | [framework-paths.md — Fonte Autoritativa de Paths](configuration/framework-paths.md) |
| **ADRs** | Architecture Decision Records transversais | [ADR — Visão Geral](adr/overview.md) |

---

## Princípios cardeais

1. **Spec antes de código** — modelo não improvisa.
2. **Contexto mínimo** — cada subagente recebe só o necessário.
3. **Modelo mínimo** — Sonnet por padrão; Opus só onde justifica.
4. **Política débito-controlado** — críticos/altos rejeitam e disparam loop; médios/baixos viram débito anotado em `qa-observations.md` (cleanup futuro via `/agent-spec-debt-resolution`).
5. **`framework-paths.md` como fonte única de verdade dos paths** — rule global carregada no system-prompt; skills resolvem chaves canônicas, nunca caminhos fixados no código.
6. **Rastreabilidade total** — US → Task → CT → código.

Detalhes em [Conceitos — Visão Geral](concepts/overview.md).
