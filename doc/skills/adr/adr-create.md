---
id: "agent-spec-adr-create"
title: "agent-spec-adr-create"
sidebar_position: 2
---
# agent-spec-adr-create

`ADR` `Generator`
> **Resumo**: Cria uma nova **Architecture Decision Record (ADR)** — registro curto e versionado de uma decisão arquitetural **transversal e evergreen**. Coleta interativamente Context, Decision, Consequences, Alternatives e Tags. Salva o arquivo `{id}-{slug}.md` em `docs/adr/` e regenera o `INDEX.md`.

> **Esta skill é a dona do template canônico** (`assets/adr-template.md`, referenciado por `adr.template` em framework-paths.md). Demais skills ADR (bootstrap, supersede) usam este template em vez de manter cópias.

---

## Quando usar

* Capturar uma **decisão arquitetural nova** que se aplica a múltiplas features ou ao projeto inteiro.
* Quando uma skill geradora ([agent-spec-sdd-generate-tech-spec](../sdd/sdd-generate-tech-spec.md), [agent-spec-minispec-generate-scope](../minispec/minispec-generate-scope.md)) detecta candidato a ADR e sugere criar.
* Para registrar decisões antes que se percam em conversas/PRs.

## Quando NÃO usar

* Decisão **feature-específica** (vai no Tech Spec / Scope, não na ADR).
* Decisão de baixo custo de reversão (não atende ao critério `custo_reversao`).
* Para depreciar/superseder ADR existente → use [agent-spec-adr-deprecate](adr-deprecate.md) ou [agent-spec-adr-supersede](adr-supersede.md).
* Para criar lote de ADRs a partir de varredura → use [agent-spec-adr-bootstrap](adr-bootstrap.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `[titulo-sugerido]` (kebab-case) | Usuário (argumento) | Não (skill pergunta se ausente) |
| Informações via `AskUserQuestion` | Usuário (interativo) | Sim — toda info vem do usuário, nunca da skill |
| `INDEX.md` atual (para descobrir próximo ID) | Existente no projeto | Sim |

## Outputs

| Artefato | Path resolvido |
| --- | --- |
| ADR | `adr.dir/{id}-{slug}.md` (ex.: `/docs/adr/0042-rate-limit-strategy.md`) |
| `INDEX.md` regenerado | `adr.index_file` |

---

## Critérios de existência (TODOS verdadeiros)

Antes de criar, valida:

| Critério | Pergunta | OK se |
| --- | --- | --- |
| `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? | SIM |
| `tag_alvo` | Cai em uma das 14 tags canônicas? | SIM |
| `custo_reversao` | Reverter implicaria refactor significativo (≥ médio) em múltiplos lugares? | SIM |

Se algum for `NÃO` → skill orienta a NÃO criar ADR e sugere onde a decisão deveria viver (Tech Spec, Scope, código).

---

## Tags canônicas (controladas)

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```

> Lista **fechada** com 14 entradas. Tag fora da lista é proibida. Se nenhuma cobre o tema, a skill sinaliza que é caso de atualizar a lista primeiro (e não cria a ADR).

---

## Estrutura da ADR (template Nygard enxuto)

```markdown
---
id: NNNN
title: <kebab-case-title>
status: accepted
date: YYYY-MM-DD
tags: [<1-a-3-tags>]
---

# ADR-NNNN: <Título Humano>

## Context
[1-3 parágrafos: o problema, a pressão, o trade-off em jogo]

## Decision
[A decisão tomada, em uma frase clara]

## Consequences
[Bullets com consequências positivas e negativas]

## Alternatives considered
[Bullets com alternativas e por que foram rejeitadas]

## Applied in
[Bullets de features/módulos que aplicam esta ADR — atualizado conforme aplicação]
```

---

## Fluxo de execução

1. **Lê INDEX.md** uma única vez para descobrir o próximo `id`.
2. **Pergunta ao usuário** (via `AskUserQuestion`):
   * Critérios de existência (3 perguntas)
   * Title sugerido (kebab-case)
   * Context, Decision, Consequences, Alternatives
   * Tags (1-3 da lista canônica)
3. **Carrega o template canônico** (`adr.template` → `assets/adr-template.md`).
4. **Preenche** o template com as respostas.
5. **Salva** em `adr.dir/{id}-{slug}.md`.
6. **Executa** `node {adr.reindex_script}` para regenerar `INDEX.md`.

---

## Gates invocados

Nenhum.

---

## Templates / assets usados

* `assets/adr-template.md` — template Nygard enxuto **canônico** (esta skill é a dona).
* `adr.reindex_script` (de [agent-spec-adr-reindex](adr-reindex.md)) — para regenerar INDEX.

---

## Exemplo de uso

```bash
/agent-spec-adr-create rate-limit-strategy
```

```
[Lê INDEX.md → próximo id: 0042]

Pergunta 1 — A decisão se aplica a múltiplas features? (s/N)
> s
Pergunta 2 — Cai em uma tag canônica? (architecture, http, security, ...)
> http
Pergunta 3 — Reverter implica refactor significativo?
> s

[Coleta Context, Decision, Consequences, Alternatives, Tags=[http, performance]]

[Carrega template, preenche, salva 0042-rate-limit-strategy.md]
[node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs]

✅ ADR-0042 (rate-limit-strategy) criada.
✅ INDEX.md regenerado.
```

---

## Skills relacionadas

* [agent-spec-adr-list](adr-list.md) — listar ADRs existentes.
* [agent-spec-adr-show](adr-show.md) — exibir ADR específica.
* [agent-spec-adr-bootstrap](adr-bootstrap.md) — criar lote a partir de varredura do projeto.
* [agent-spec-adr-supersede](adr-supersede.md) — substituir ADR existente.
* [agent-spec-adr-deprecate](adr-deprecate.md) — depreciar sem substituta.
* [agent-spec-adr-reindex](adr-reindex.md) — script canônico que esta skill invoca ao final.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `adr.template` (próprio), `adr.reindex_script`, `adr.file_pattern`. Veja [Path Templates](../../configuration/path-templates.md).
