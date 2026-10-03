---
id: "overview"
title: "Skills — Visão Geral"
sidebar_position: 1
---
# Skills — Visão Geral

**Skills** são especialistas por etapa do pipeline. Vivem em `.claude/skills/<nome>/` e são acionadas via slash command (`/<skill-name>`) ou referenciadas por outras skills.

> **Skills vs Agents**: skills são **instruções carregadas no contexto principal** (geram, orquestram); agents são **subprocessos** com janela de contexto própria (gates, executores). Veja [Agents — Visão Geral](/agents/overview.html).

---

## 30 skills agrupadas por framework

### SDD (4)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) | PRD (O QUE / POR QUÊ) | Generator |
| [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) | Tech Spec (COMO) | Generator |
| [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) | Task Plan + tasks individuais | Generator |
| [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) | Execução com gates QA + Tech Review | Orchestrator |

### miniSpec (4)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) | Intent (O QUE / POR QUÊ) | Generator |
| [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) | Scope (COMO) | Generator |
| [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) | Task Plan + tasks individuais | Generator |
| [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html) | Execução com gates QA + Tech Review | Orchestrator |

### TaskCard (2)

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) | TaskCard individual | Generator |
| [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html) | Execução de uma TaskCard com gates | Orchestrator |

### ADR — Architecture Decision Records (8)

| Skill | Operação | Tipo |
| --- | --- | --- |
| [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) | Corpus inicial a partir do projeto | Generator |
| [agent-spec-adr-create](/skills/adr/adr-create.html) | Nova ADR (dona do template canônico) | Generator |
| [agent-spec-adr-show](/skills/adr/adr-show.html) | Exibir ADR específica | Maintenance |
| [agent-spec-adr-list](/skills/adr/adr-list.html) | Listar ADRs (filtro por tag/status) | Maintenance |
| [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) | Substituir ADR por outra | Generator |
| [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html) | Marcar ADR como deprecated | Maintenance |
| [agent-spec-adr-review](/skills/adr/adr-review.html) | Auditoria de consistência (read-only) | Maintenance |
| [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) | Regenerar INDEX.md (dona do script canônico) | Maintenance |

### Compartilhadas (14)

| Skill | Propósito | Tipo |
| --- | --- | --- |
| [agent-spec-rule-create](/skills/shared/rule-create.html) | Autoria de rule a partir de um tema arquitetural (Chain of Tree, greenfield/brownfield) → rule enxuta + material de ADR | Generator |
| [agent-spec-testing-stack-bootstrap](/skills/shared/testing-stack-bootstrap.html) | Descobre a stack de teste do host e gera a rule consumida pelos gates de QA | Generator |
| [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) | Discovery: ideia → definição inicial + Strategy Selector | Generator |
| [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) | Tech Alignment compartilhado SDD/miniSpec | Expert |
| [agent-spec-generate-design](/skills/shared/generate-design.html) | Design (COMO VISUAL) opcional, compartilhado SDD/miniSpec — só web/mobile; gera `design.md` + mantém `design-system.md` global | Generator |
| [agent-spec-design-system-bootstrap](/skills/shared/design-system-bootstrap.html) | Consolida o `design-system.md` global standalone (codebase + Figma + docs soltos) — deriva o detectável, pergunta só o não-derivável | Generator |
| [agent-spec-debt-resolution](/skills/shared/debt-resolution.html) | Cleanup: lê débitos em `qa-observations.md` + classificação via especialista → gera `v{N+1}-debits/` com tasks | Generator |
| [agent-spec-semantic-commit](/skills/shared/semantic-commit.html) | Mensagem de commit Conventional Commits em pt-BR | Maintenance |
| [agent-spec-backend-contract-handoff](/skills/shared/backend-contract-handoff.html) | Handoff operacional backend→frontend (endpoints, payloads, erros, fixtures) agnóstico de stack | Generator |
| [agent-spec-challenge-spec](/skills/shared/challenge-spec.html) | Stress-test interativo de tech\_spec/scope contra domínio, código e ADRs | Expert |
| [agent-spec-curate-project-rules](/skills/shared/curate-project-rules.html) | Decide se uma convenção merece virar regra de projeto (CLAUDE.md / `.claude/rules`) e com que escopo | Expert |
| [agent-spec-mine-rule-candidates](/skills/shared/mine-rule-candidates.html) | Consolida sinais de N runs em candidatos a regra para o agent-spec-curate-project-rules | Maintenance |
| [agent-spec-testing-best-practices](/concepts/testing-best-practices.html) | Doutrina de testes agnóstica de stack (Iron Laws, antipadrões, gates) consumida pelos dois gates de QA | Expert |
| [agent-spec-docs-sync](/skills/shared/docs-sync.html) | Pente fino da documentação do site vs `.claude/` — propõe diffs revisáveis, nunca aplica sozinha | Maintenance |

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
→ agent-spec-sdd-generate-tech-spec (delega a Estratégia de Testes a agent-spec-qa-test-generator)
→ agent-spec-sdd-generate-task-plan (delega §6 e qa\_context)
→ agent-spec-sdd-run-tasks (gates QA + Tech Review)
→ executor (especialista da stack registrado em .claude/agents/)
```

### miniSpec

```
discovery (agent-spec-pre-refinement) → agent-spec-minispec-generate-intent
→ [agent-spec-generate-tech-alignment opcional]
→ [agent-spec-generate-design opcional — só web/mobile]
→ agent-spec-minispec-generate-scope
→ agent-spec-minispec-generate-tasks (delega §5 consolidado por camada)
→ agent-spec-minispec-run-tasks (gates QA + Tech Review)
→ executor
```

### TaskCard

```
[discovery opcional] → agent-spec-taskcard-generate (delega §10 a agent-spec-qa-test-generator)
→ agent-spec-taskcard-run (gates QA + Tech Review)
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
* Heurística embutida em cada `*-run-tasks` (regras por path / risk / files\_count).
* Default `sonnet`.

Detalhes em [Model Selection](/advanced/model-selection.html).

---

## Estrutura interna de uma skill

Toda skill segue o padrão:

```
.claude/skills//
├── SKILL.md # persona + regras + fluxo (instruções carregadas no contexto)
├── assets/ # templates de output (ex.: prd\_template.md, task\_template.md)
└── references/ # docs auxiliares longos (ex.: prompts de gates)
```

`SKILL.md` tem frontmatter:

```yaml
---
name: 
description: 
argument-hint: 
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
/agent-spec-minispec-run-tasks docs/specs/features/X/v1/task\_plan.md 
/agent-spec-adr-create rate-limit-strategy
```

### Mencionando "use a skill X"

O modelo carrega a skill e segue o fluxo. Útil quando você quer encadear sem digitar comandos.

---

## Customização

Para criar uma skill nova, veja [Nova Skill](/customization/new-skill.html).

Para criar um executor especialista em outra stack, veja [Custom Executor](/customization/custom-executor.html).

---

## Próximos passos

* [Frameworks — Overview](/frameworks/overview.html) — escolher entre Conversa, TaskCard, miniSpec, SDD.
* [Pipeline de Execução](/pipeline/overview.html) — orquestradores em detalhe.
* [Agents — Visão Geral](/agents/overview.html) — gates e executores.
* [Gates e Loops](/concepts/gates-loops.html) — pipeline de validação.
