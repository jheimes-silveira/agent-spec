---
id: "installation"
title: "Instalação"
sidebar_position: 1
---
# Instalação

## Pré-requisitos

* **Claude Code CLI** instalado ([docs oficiais](https://docs.claude.com/claude-code)).
* `git` no projeto (necessário para captura de `base_sha` e diffs durante validações).
* Projeto com qualquer stack reconhecível (Node/TS, Python, Go, Java, Dart/Flutter, …). O framework é **agnóstico** — você registra um executor especialista da sua stack em `.claude/agents/`.

---

## Estrutura mínima

O framework vive inteiramente em `.claude/` na raiz do projeto, mais o `CLAUDE.md` na raiz:

```
projeto/
├── .claude/
│ ├── agents/ # gates inclusos (agent-spec-qa-validator, agent-spec-staff-architecture-review,
│ │ # agent-spec-qa-test-generator) + seu executor da stack
│ ├── rules/ # ★ rules globais carregadas no system-prompt
│ │ ├── agent-spec-shared.md
│ │ ├── agent-spec-workflow-rules.md # critical paths + classificação Tech Review
│ │ ├── agent-spec-sdd-workflow-rules.md # paths SDD
│ │ ├── agent-spec-minispec-workflow-rules.md
│ │ ├── agent-spec-taskcard-workflow-rules.md
│ │ └── agent-spec-adr-workflow-rules.md
│ ├── settings.local.json # permissões e allowlists locais
│ └── skills/ # 28 skills (SDD, miniSpec, TaskCard, ADR, compartilhadas)
├── .mcp.json # allowlist MCP (opcional)
├── CLAUDE.md # ★ configurações globais do projeto
└── docs/
├── adr/ # ADRs (criadas sob demanda)
└── specs/
└── features/ # features versionadas
```
> **Nota**: a configuração do framework vive nas rules `.claude/rules/agent-spec-*.md`, todas carregadas automaticamente no system-prompt (mesma prioridade do `CLAUDE.md` da raiz, conforme [doc oficial](https://code.claude.com/docs/en/memory.md#set-up-rules)). O `CLAUDE.md` carrega apenas configurações **específicas do seu projeto** (env vars locais, customizações pontuais).

---

## Passo a passo

### 1. Copie o framework

```bash
# A partir de um projeto que já tem o framework:
cp -r projeto-origem/.claude projeto-destino/
cp projeto-origem/.mcp.json projeto-destino/ # se aplicável
```

### 2. Crie/atualize o CLAUDE.md na raiz

O `CLAUDE.md` carrega configurações **específicas do projeto** (env vars locais, estrutura de docs, customizações pontuais). Os paths canônicos do framework já vêm nas rules `.claude/rules/agent-spec-*.md` — você raramente precisa editar nada relacionado a paths. Veja [framework-paths](/configuration/framework-paths.html) e [Path Templates](/configuration/path-templates.html).

### 3. Adapte critical paths (raramente necessário)

A heurística de critical paths em `.claude/rules/agent-spec-workflow-rules.md` é **agnóstica de stack** e cobre nativamente: `auth/**`, `security/**`, `crypto/**`, `migrations/**`, `secrets/**`, `api_contracts/**`, `payments/**`. Tasks que tocam esses paths automaticamente:

* Usam **Opus** no executor.
* Escalam Gate 2 para **Opus**.

Você só precisa adaptar se seu projeto usa nomes incomuns (ex.: pasta `tofu/` em vez de `secrets/`). Veja [Critical Paths](/configuration/critical-paths.html).

### 4. Registre o agente executor da stack

O framework **não inclui executor pronto**. Crie `.claude/agents/<seu-executor>.md` seguindo o template em [Custom Executor](/customization/custom-executor.html) (ex.: `node-task-developer.md`, `python-task-developer.md`, `flutter-task-developer.md`).

```bash
ls .claude/agents/
# Deve listar: agent-spec-qa-validator.md, agent-spec-staff-architecture-review.md,
# agent-spec-qa-test-generator.md, .md
```

### 5. Valide a instalação

No Claude Code, execute:

```bash
/agent-spec-pre-refinement "teste de instalação"
```

Se a skill for reconhecida e iniciar o processo de discovery, a instalação está OK.

---

## Estrutura de features geradas

Uma vez instalado, cada feature criada vive em:

```
docs/specs/features//v1/
```

Com artefatos que variam por framework escolhido:

| Framework | Artefatos principais |
| --- | --- |
| [TaskCard](/frameworks/taskcard.html) | `tasks/task-{nn}-{slug}.md` |
| [miniSpec](/frameworks/minispec.html) | `intent.md`, `scope.md`, `task_plan.md`, `tasks/T1.md`, ... |
| [SDD](/frameworks/sdd.html) | `prd.md`, `tech_spec.md`, `task_plan.md`, `tasks/T1.md`, ... |

---

## Próximos passos

* [Quick Start](/getting-started/quick-start.html) — primeira feature em 5 minutos.
* [Primeira feature completa](/getting-started/first-feature.html) — exemplo real ponta a ponta.
* [framework-paths.md — Fonte Autoritativa de Paths](/configuration/framework-paths.html) — entender o arquivo central.
* [Frameworks — Overview](/frameworks/overview.html) — escolher o caminho certo.
