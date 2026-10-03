---
id: "custom-executor"
title: "Criar Agent Executor Custom"
sidebar_position: 1
---
# Criar Agent Executor Custom

O framework é **agnóstico de stack** — não inclui executor pronto. Você registra um agent especialista da sua stack em `.claude/agents/`. Os gates ([agent-spec-qa-validator](../agents/qa-validator.md), [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md), [agent-spec-qa-test-generator](../agents/qa-test-generator.md)) já vêm prontos e funcionam para qualquer executor.

---

## Quando criar

* Stack não coberta (Python, TypeScript, Rust, Elixir, Bun, etc.).
* Domínio específico do projeto (ex.: `firmware-agent` para embarcados).
* Persona especializada (ex.: `security-auditor` para auditoria).

---

## Estrutura de um agent

Crie `.claude/agents/<nome>.md`:

```markdown
---
name: ts-task-developer
description: "Especialista em TypeScript / Node. Use para tasks em Node/TS seguindo padrões do projeto (camadas, validação Zod, testes Vitest)."
model: sonnet
color: blue
---

**PERSONA:** Você é um engenheiro Node/TS sênior. Escreve código idiomático TypeScript com tipos estritos. Segue os padrões arquiteturais do projeto.

**IDIOMA:** Respostas em pt-BR. Código em inglês (identificadores, variáveis).

**STACK QUE VOCÊ CONHECE:**
- Node 22+ / Bun
- TypeScript 5+ com `strict: true`
- Zod para validação
- Vitest para testes
- Drizzle/Prisma para persistência

**RESPONSABILIDADES:**

1. Implementar tasks em TS com código idiomático.
2. Analisar contexto do projeto antes de codificar (CLAUDE.md, package.json, padrões existentes).
3. Aplicar boas práticas (tipagem estrita, error handling explícito, testes robustos).
4. Cobertura de erros e edge cases.

[…seções específicas da stack…]
```

> Mantenha o agent **conciso** — peso de tokens importa: ele é carregado em toda invocação. Foque em persona, stack e responsabilidades; deixe convenções genéricas para o `CLAUDE.md` da raiz.

---

## Estrutura recomendada

| Seção | Conteúdo |
| --- | --- |
| **Persona** | Quem o agent atua como |
| **Idioma** | pt-BR para output, inglês para código |
| **Stack que conhece** | Versões e libs específicas |
| **Responsabilidades** | Lista numerada do que o agent deve fazer |
| **Boas práticas obrigatórias** | Padrões idiomáticos da stack |
| **Fluxo de trabalho** | Passos de execução |
| **Quando pedir esclarecimento** | Casos onde o agent **não** improvisa |
| **Autoavaliação** | Checklist antes de concluir |

---

## Como o orquestrador invoca

```bash
/agent-spec-sdd-run-tasks docs/specs/features/<feature>/v1/task_plan.md ts-task-developer
```

O `agent_name` (`ts-task-developer`) deve corresponder ao nome do arquivo (`.claude/agents/ts-task-developer.md`).

::: info 📝 Nota — Disciplina do Executor (Iron Rules)
A cada delegação, o orquestrador injeta **verbatim** no prompt do seu executor as **6 Iron Laws** anti-vícios-de-LLM (Pense antes de codar / Simplicidade primeiro / Mudanças cirúrgicas / Goal-driven / Testes honestos / Lei do seam). Fonte canônica: [`executor-discipline.md`](../configuration/executor-discipline.md) (arquivo sob demanda em `references/`, symlink para o canônico do miniSpec — não é rule do system-prompt).
**Não duplique** essas leis no seu agent — vão chegar pelo prompt. Foque seu agent em **persona, stack e idiomas específicos**. As regras universais já são tratadas no nível do orquestrador. Violações da Lei #2 (simplicidade) são detectadas no Gate 2 pela categoria [`speculative_complexity`](../advanced/conditional-gates.md).
:::

---

## Modelo do agent

* Default: **Sonnet** (declare em `model: sonnet` no frontmatter).
* Escalação para **Opus** é decidida pelo orquestrador (não pelo agent) — veja [Auto-escalação](../advanced/auto-escalation.md).

> **Nunca Haiku** em executor — code execution exige pattern recognition.

---

## Boas práticas

| Prática | Detalhe |
| --- | --- |
| Lê CLAUDE.md e padrões existentes ANTES de codar | Evita propor tecnologia nova já existente |
| Erros explícitos | Sem swallow silencioso |
| Validação de input | Camada de boundary |
| Testes idiomáticos | Padrão da stack (table-driven em Go, beforeEach em Vitest, etc.) |
| Sem secrets fixos no código | Use env vars / configs |
| Concorrência cuidadosa | Sem races, sem leaks |

---

## Múltiplos agentes para a mesma stack

Você pode ter especialistas mais granulares:

```
.claude/agents/
├── ts-task-developer.md       # generalista Node/TS
├── ts-security-expert.md      # especialista em auth/crypto Node/TS
└── ts-migration-expert.md     # especialista em migrations
```

E invocar conforme a feature/task. O orquestrador aceita qualquer `agent_name` registrado.

---

## Próximos passos

* [Override Models](override-models.md) — forçar modelo específico.
* [Nova Skill](new-skill.md) — criar skill (não executor).
* [agents/overview](../agents/overview.md) — todos os agents do framework.
