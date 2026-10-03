---
id: "overview"
title: "Skills — Visão Geral"
sidebar_position: 1
---
# Skills — Visão Geral

**Skills** são especialistas por etapa do pipeline. Vivem em `.claude/skills/<nome>/` e são acionadas via slash command (`/<skill-name>`) ou referenciadas por outras skills.

> **Skills vs Agents**: skills são **instruções carregadas no contexto principal** (geram, orquestram); agents são **subprocessos** com janela de contexto própria (gates, executores). Veja [Agents — Visão Geral](../agents/overview.md).

---

## 30 skills agrupadas por framework

### SDD (4)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-sdd-generate-prd](sdd/sdd-generate-prd.md) | PRD (O QUE / POR QUÊ) | Generator |
| [agent-spec-sdd-generate-tech-spec](sdd/sdd-generate-tech-spec.md) | Tech Spec (COMO) | Generator |
| [agent-spec-sdd-generate-task-plan](sdd/sdd-generate-task-plan.md) | Task Plan + tasks individuais | Generator |
| [agent-spec-sdd-run-tasks](sdd/sdd-run-tasks.md) | Execução com gates QA + Tech Review | Orchestrator |

### miniSpec (4)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-minispec-generate-intent](minispec/minispec-generate-intent.md) | Intent (O QUE / POR QUÊ) | Generator |
| [agent-spec-minispec-generate-scope](minispec/minispec-generate-scope.md) | Scope (COMO) | Generator |
| [agent-spec-minispec-generate-tasks](minispec/minispec-generate-tasks.md) | Task Plan + tasks individuais | Generator |
| [agent-spec-minispec-run-tasks](minispec/minispec-run-tasks.md) | Execução com gates QA + Tech Review | Orchestrator |

### TaskCard (2)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-taskcard-generate](taskcard/taskcard-generate.md) | TaskCard individual | Generator |
| [agent-spec-taskcard-run](taskcard/taskcard-run.md) | Execução de uma TaskCard com gates | Orchestrator |

### ADR — Architecture Decision Records (8)

| Skill | Operação | Tipo |
| --- | --- | --- |
| [agent-spec-adr-bootstrap](adr/adr-bootstrap.md) | Corpus inicial a partir do projeto | Generator |
| [agent-spec-adr-create](adr/adr-create.md) | Nova ADR (dona do template canônico) | Generator |
| [agent-spec-adr-show](adr/adr-show.md) | Exibir ADR específica | Maintenance |
| [agent-spec-adr-list](adr/adr-list.md) | Listar ADRs (filtro por tag/status) | Maintenance |
| [agent-spec-adr-supersede](adr/adr-supersede.md) | Substituir ADR por outra | Generator |
| [agent-spec-adr-deprecate](adr/adr-deprecate.md) | Marcar ADR como deprecated | Maintenance |
| [agent-spec-adr-review](adr/adr-review.md) | Auditoria de consistência (read-only) | Maintenance |
| [agent-spec-adr-reindex](adr/adr-reindex.md) | Regenerar INDEX.md (dona do script canônico) | Maintenance |

### Compartilhadas (14)

| Skill | Propósito | Tipo |
| --- | --- | --- |
| [agent-spec-rule-create](shared/rule-create.md) | Autoria de rule a partir de um tema arquitetural (Chain of Tree, greenfield/brownfield) → rule enxuta + material de ADR | Generator |
| [agent-spec-testing-stack-bootstrap](shared/testing-stack-bootstrap.md) | Descobre a stack de teste do host e gera a rule consumida pelos gates de QA | Generator |
| [agent-spec-pre-refinement](shared/pre-refinement.md) | Discovery: ideia → definição inicial + Strategy Selector | Generator |
| [agent-spec-generate-tech-alignment](shared/generate-tech-alignment.md) | Tech Alignment compartilhado SDD/miniSpec | Expert |
| [agent-spec-generate-design](shared/generate-design.md) | Design (COMO VISUAL) opcional, compartilhado SDD/miniSpec — só web/mobile; gera `design.md` + mantém `design-system.md` global | Generator |
| [agent-spec-design-system-bootstrap](shared/design-system-bootstrap.md) | Consolida o `design-system.md` global standalone (codebase + Figma + docs soltos) — deriva o detectável, pergunta só o não-derivável | Generator |
| [agent-spec-debt-resolution](shared/debt-resolution.md) | Cleanup: lê débitos em `qa-observations.md` + classificação via especialista → gera `v{N+1}-debits/` com tasks | Generator |
| [agent-spec-semantic-commit](shared/semantic-commit.md) | Mensagem de commit Conventional Commits em pt-BR | Maintenance |
| [agent-spec-backend-contract-handoff](shared/backend-contract-handoff.md) | Handoff operacional backend→frontend (endpoints, payloads, erros, fixtures) agnóstico de stack | Generator |
| [agent-spec-challenge-spec](shared/challenge-spec.md) | Stress-test interativo de tech_spec/scope contra domínio, código e ADRs | Expert |
| [agent-spec-curate-project-rules](shared/curate-project-rules.md) | Decide se uma convenção merece virar regra de projeto (CLAUDE.md / `.claude/rules`) e com que escopo | Expert |
| [agent-spec-mine-rule-candidates](shared/mine-rule-candidates.md) | Consolida sinais de N runs em candidatos a regra para o agent-spec-curate-project-rules | Maintenance |
| [agent-spec-testing-best-practices](../concepts/testing-best-practices.md) | Doutrina de testes agnóstica de stack (Iron Laws, antipadrões, gates) consumida pelos dois gates de QA | Expert |
| [agent-spec-docs-sync](shared/docs-sync.md) | Pente fino da documentação do site vs `.claude/` — propõe diffs revisáveis, nunca aplica sozinha | Maintenance |

---

## Tipos de skill (variantes)

| Tipo | Característica | Exemplos |
| --- | --- | --- |
| **Generator** | Produz artefato versionado com processo interativo | agent-spec-sdd-generate-prd, agent-spec-taskcard-generate, agent-spec-adr-create |
| **Orchestrator** | Coordena execução com gates e loops | agent-spec-sdd-run-tasks, agent-spec-minispec-run-tasks, agent-spec-taskcard-run |
| **Expert** | Especialista conversacional/router | agent-spec-generate-tech-alignment |
| **Maintenance** | Operações idempotentes, mecânicas | agent-spec-adr-list, agent-spec-adr-show, agent-spec-adr-reindex, agent-spec-adr-deprecate, agent-spec-semantic-commit |

---

## Pipelines completos por framework

### SDD

```
discovery (agent-spec-pre-refinement) → agent-spec-sdd-generate-prd
                          → [agent-spec-generate-tech-alignment opcional]
                          → [agent-spec-generate-design opcional — só web/mobile]
                          → agent-spec-sdd-generate-tech-spec  (delega a Estratégia de Testes a agent-spec-qa-test-generator)
                          → agent-spec-sdd-generate-task-plan  (delega §6 e qa_context)
                          → agent-spec-sdd-run-tasks           (gates QA + Tech Review)
                                                     → executor (especialista da stack registrado em .claude/agents/)
```

### miniSpec

```
discovery (agent-spec-pre-refinement) → agent-spec-minispec-generate-intent
                          → [agent-spec-generate-tech-alignment opcional]
                          → [agent-spec-generate-design opcional — só web/mobile]
                          → agent-spec-minispec-generate-scope
                          → agent-spec-minispec-generate-tasks (delega §5 consolidado por camada)
                          → agent-spec-minispec-run-tasks      (gates QA + Tech Review)
                                                     → executor
```

### TaskCard

```
[discovery opcional] → agent-spec-taskcard-generate (delega §10 a agent-spec-qa-test-generator)
                    → agent-spec-taskcard-run       (gates QA + Tech Review)
                                                   → executor
```

### ADR (transversal)

```
agent-spec-adr-bootstrap (uma vez no início) → agent-spec-adr-create (sob demanda)
                                  → agent-spec-adr-list / agent-spec-adr-show (consultas)
                                  → agent-spec-adr-supersede / agent-spec-adr-deprecate (ciclo de vida)
                                  → agent-spec-adr-review (auditoria)
                                  → agent-spec-adr-reindex (manutenção do INDEX)
```

---

## Modelo de invocação

Todas as skills rodam por padrão em **Sonnet**.

A única exceção é o **executor** (agent que implementa código), cujo modelo é decidido pelo orquestrador via:

* `model:` do frontmatter da task (declarado).
* Heurística embutida em cada `*-run-tasks` (regras por path / risk / files_count).
* Default `sonnet`.

Detalhes em [Model Selection](../advanced/model-selection.md).

---

## Estrutura interna de uma skill

Toda skill segue o padrão:

```
.claude/skills/<skill-name>/
├── SKILL.md         # persona + regras + fluxo (instruções carregadas no contexto)
├── assets/          # templates de output (ex.: prd_template.md, task_template.md)
└── references/      # docs auxiliares longos (ex.: prompts de gates)
```

`SKILL.md` tem frontmatter:

```yaml
---
name: <nome>
description: <quando usar>
argument-hint: <formato esperado>
user-invocable: true
disable-model-invocation: true
---
```

Skills **user-invocable** aparecem como slash command (`/<skill-name>`).

---

## Como acionar uma skill

### Slash command (preferido)

```bash
/agent-spec-sdd-generate-prd "novo módulo de pagamentos"
/agent-spec-minispec-run-tasks docs/specs/features/X/v1/task_plan.md <seu-executor>
/agent-spec-adr-create rate-limit-strategy
```

### Mencionando "use a skill X"

O modelo carrega a skill e segue o fluxo. Útil quando você quer encadear sem digitar comandos.

---

## Customização

Para criar uma skill nova, veja [Nova Skill](../customization/new-skill.md).

Para criar um executor especialista em outra stack, veja [Custom Executor](../customization/custom-executor.md).

---

## Próximos passos

* [Frameworks — Overview](../frameworks/overview.md) — escolher entre Conversa, TaskCard, miniSpec, SDD.
* [Pipeline de Execução](../pipeline/overview.md) — orquestradores em detalhe.
* [Agents — Visão Geral](../agents/overview.md) — gates e executores.
* [Gates e Loops](../concepts/gates-loops.md) — pipeline de validação.
