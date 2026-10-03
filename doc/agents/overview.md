---
id: "overview"
title: "Agents — Visão Geral"
sidebar_position: 1
---
# Agents — Visão Geral

**Agents** são subagentes especializados invocados pelas skills do framework. Vivem em `.claude/agents/<nome>.md` e são acionados via `subagent_type` da ferramenta `Agent`.

> **Diferença para skills**: skills são **instruções carregadas no contexto principal**; agents são **subprocessos** com janela de contexto própria, ideal para tarefas que precisam isolamento (gates de validação, executor especialista).

---

## Os 3 agents inclusos no framework

| Agent | Papel | Modelo default | Invocado por |
| --- | --- | --- | --- |
| [agent-spec-qa-validator](qa-validator.md) | **Gate 1** — validação funcional + execução de testes | Sonnet (escala Opus) | `*-run-tasks` (após executor) |
| [agent-spec-staff-architecture-review](staff-architecture-review-agent.md) | **Gate 2** — revisão arquitetural + ADRs + segurança profunda | Sonnet (escala Opus) | `*-run-tasks` (após Gate 1 aprovar) |
| [agent-spec-qa-test-generator](qa-test-generator.md) | Geração de casos de teste de alto valor | Sonnet | Skills `*-generate-*` (durante criação de specs/tasks) |

> **+ 1 executor** que **você registra** em `.claude/agents/` para a sua stack (Node, Python, Java, Flutter, …). O framework não inclui executor pronto — veja [Custom Executor](../customization/custom-executor.md).

---

## Pipeline de validação (Gate 1 e Gate 2)

```
Executor (especialista da stack registrado pelo usuário)
        │
        ▼
[base_sha + sumário do executor persistidos em memória do orquestrador]
        │
        ▼
Gate 1 — agent-spec-qa-validator
        │ (executa testes, valida CAs + Camada 0 escopo declarado, política débito-controlado)
        ▼
Gate 2 — agent-spec-staff-architecture-review
        │ (arquitetura, ADRs, segurança profunda; consome diff git)
        ▼
git add -- <paths>
```

Detalhes completos em [Gates e Loops](../concepts/gates-loops.md).

---

## Quando cada agent é invocado

### Geração (camada 1)

* **`agent-spec-qa-test-generator`** — invocado pelas skills `*-generate-*` para popular seções de testes em TECH_SPEC, TASK ou TaskCard.

### Execução (camada 2)

* **Executor da stack** (registrado pelo usuário em `.claude/agents/`) — invocado pelas skills `*-run-tasks` como agente que implementa o código.

### Validação (camada 3)

* **`agent-spec-qa-validator`** — Gate 1, único que executa testes.
* **`agent-spec-staff-architecture-review`** — Gate 2, revisão arquitetural sobre o diff.

---

## Princípios comuns aos agents

| Princípio | Aplicação |
| --- | --- |
| **Retorno em JSON** | agent-spec-qa-validator, agent-spec-qa-test-generator e agent-spec-staff-architecture-review retornam JSON estruturado para o orquestrador parsear |
| **Idioma pt-BR** | Toda saída textual em português brasileiro |
| **Não releitura de CLAUDE.md / `.claude/rules/*`** | Já estão no system-prompt do agent — qualquer Read seria desperdício |
| **Economia de leitura** | Cada agent tem regras explícitas para ler **apenas** o estritamente necessário |
| **Não Haiku** | agent-spec-qa-validator, agent-spec-staff-architecture-review e agent-spec-qa-test-generator NUNCA rodam em Haiku — pattern recognition exigida não é compatível |

---

## Registrando o executor da sua stack

O framework é **agnóstico** — não inclui executor pronto. Para cada projeto/stack, crie um agent especialista:

1. Crie `.claude/agents/<nome-do-agent>.md` (ex.: `node-task-developer`, `python-task-developer`, `flutter-task-developer`).
2. Defina persona, stack que conhece, responsabilidades e fluxo de trabalho.
3. Invoque via `*-run-tasks <task_plan> <nome-do-agent>`.

Detalhes e template completo em [Custom Executor](../customization/custom-executor.md).

---

## Próximos passos

* [agent-spec-qa-validator](qa-validator.md) — Gate 1 completo.
* [agent-spec-staff-architecture-review](staff-architecture-review-agent.md) — Gate 2 completo.
* [agent-spec-qa-test-generator](qa-test-generator.md) — geração de casos de teste.
* [Custom Executor](../customization/custom-executor.md) — como criar o executor da sua stack.
* [Gates e Loops](../concepts/gates-loops.md) — pipeline completo de validação.
