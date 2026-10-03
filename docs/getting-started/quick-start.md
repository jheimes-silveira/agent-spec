---
id: "quick-start"
title: "Quick Start (5 min)"
sidebar_position: 2
---
# Quick Start — sua primeira feature em 5 minutos

Cenário: **adicionar validação de CPF no endpoint `/users/register`**.

---

## Passo 1 — Discovery

```bash
/agent-spec-pre-refinement "adicionar validação de CPF no endpoint /users/register"
```

A skill [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) analisa a ideia:

* **Clareza: ALTA** (objetivo claro, escopo fechado).
* Sem brainstorm nem perguntas extras necessárias.
* Gera `pre-refinement.md` com [Strategy Selector](/discovery/strategy-selector.html) preenchido.

**Output**:

```
Arquivo salvo em: docs/specs/features/validar-cpf/v1/pre-refinement.md
## Resumo do Pré-Refinamento
- Ideia: Adicionar validação de CPF no endpoint de registro
- Problema: Dados inválidos chegam no banco
- Público: devs + usuário final
- Escopo inicial: validar CPF antes de salvar
...
────────────────────────────────────────
📋 Recomendação: TaskCard
Sinais decisivos: S1=1 US | S2=só dev | S6=não | S5=<1 dia
Justificativa: Escopo fechado em 1-2 arquivos; nenhuma decisão
arquitetural; validação é padrão existente.
Próximo passo:
/agent-spec-taskcard-generate "adicionar validação de CPF no endpoint /users/register"
────────────────────────────────────────
```

---

## Passo 2 — Gerar TaskCard

```bash
/agent-spec-taskcard-generate "adicionar validação de CPF no endpoint /users/register"
```

A skill [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html):

1. Pergunta sobre lacunas (via `AskUserQuestion`).
2. Preenche as 11 seções do template.
3. Delega §10 (Testes) ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html).
4. Salva `docs/specs/features/validar-cpf/v1/tasks/task-01-validar-cpf.md`.

**Frontmatter gerado**:

```markdown
## 1. Identificação
- ID: TC-001
- Nome da Task: Validar CPF no /users/register
- model: sonnet # task rotineira, não toca crítico
- risk: low
- gates: [qa, tech\_review] # default
```

---

## Passo 3 — Executar

```bash
/agent-spec-taskcard-run docs/specs/features/validar-cpf/v1/tasks/task-01-validar-cpf.md 
```
> Substitua `<seu-executor>` pelo nome do agent registrado em `.claude/agents/` para a sua stack (ex.: `node-task-developer`). Veja [Custom Executor](/customization/custom-executor.html).

A skill [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html):

1. Parseia `model`, `risk`, `gates` do frontmatter.
2. Captura `base_sha = git rev-parse HEAD`.
3. Invoca o executor da stack (Sonnet) para implementar.
4. Persiste `base_sha` + sumário do executor (4-6 linhas) em memória do orquestrador (passados inline aos gates — sem arquivo).
5. Dispara **Gate 1** ([agent-spec-qa-validator](/agents/qa-validator.html)) — APROVADO.
6. Dispara **Gate 2** ([agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html)) — approved.
7. `git add -- src/users/handler.* src/users/handler_test.*`.

**Log no terminal**:

```
[TC-001] executor: sonnet (declarado) gates: [qa, tech\_review]
[TC-001] base\_sha: a1b2c3d
[TC-001] → : implementando…
[TC-001] ✓ 2 arquivos modificados, 1 teste criado | testes 5/5
[TC-001] → agent-spec-qa-validator (sonnet): APROVADO (CA-01..CA-02 PASSOU)
[TC-001] → agent-spec-staff-architecture-review (sonnet): approved
[TC-001] git add -- src/users/handler.\* src/users/handler\_test.\*
[TC-001] Status: Concluído
```

---

## Resultado

* **1 TaskCard** versionada em `docs/specs/features/validar-cpf/v1/tasks/`.
* **Código + testes** implementados passando.
* **2 gates** de validação aprovados.
* **Custo aproximado**: ~80-150k tokens.

---

## E se fosse uma feature maior?

Se a ideia fosse *"sistema completo de cadastro de usuários com validação, autenticação e recuperação de senha"*, o `/agent-spec-pre-refinement` recomendaria **miniSpec** ou **SDD** — e o fluxo teria mais etapas (Intent + Scope ou PRD + Tech Spec antes das tasks).

Veja [Frameworks — Overview](/frameworks/overview.html) para comparativo.

---

## Próximos passos

* [Primeira feature completa (exemplo real)](/getting-started/first-feature.html)
* [Os 4 caminhos](/concepts/four-paths.html)
* [Gates e Loops](/concepts/gates-loops.html) — pipeline de validação.
* [Skills — Visão Geral](/skills/overview.html) — todas as 28 skills disponíveis.
