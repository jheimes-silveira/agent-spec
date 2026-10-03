---
id: "new-skill"
title: "Criar Skill Nova"
sidebar_position: 2
---
# Criar Skill Nova

Para casos onde as 28 skills existentes não cobrem o que você precisa.

---

## Estrutura de uma skill

```
.claude/skills/minha-skill/
├── SKILL.md # definição completa (instruções)
├── assets/ # opcional — templates de output
│ └── algum-template.md
└── references/ # opcional — docs auxiliares longos
└── prompt-detalhado.md
```

---

## `SKILL.md`

Estrutura mínima:

```markdown
---
name: minha-skill
description: |
[Quando acionar. Seja específico. Inclua triggers concretos.
Ex.: "Especialista em migração de schemas. Use quando o usuário pedir
para refatorar estrutura de banco mantendo compatibilidade. NÃO gera
tasks de implementação — só o plano de migração."]
argument-hint: "[descrição do argumento esperado]"
user-invocable: true
disable-model-invocation: true
---
# Skill: minha-skill
PERSONA: [quem a skill atua como — Product Owner, Arquiteto, QA, etc.]
IDIOMA: pt-BR
FORMATO: [como a resposta é estruturada — ex.: "Markdown com seções numeradas"]
## Visão Geral
[O que a skill faz; em que etapa do pipeline entra]
## Paths (Resolução)
[Use chaves do framework-paths.md — nunca fixos no código]
| Variável | Path Template |
|---|---|
| `chave.path` | `/docs/...` |
## Princípio Fundamental
[Regra central inviolável]
## Regras Invioláveis
[Lista]
## Fluxo de Execução
[Etapas numeradas]
## Templates / Assets
[Se a skill gera artefato]
## Entrada
$ARGUMENTS
```

---

## Decisões de design

### `user-invocable: true`

Skill aparece como slash command (`/<nome>`). Sem isso, ela só pode ser carregada por outras skills via "use a skill X".

### `disable-model-invocation: true`

Impede o modelo de invocar a skill **automaticamente**. Apenas usuário ou skill explicitamente. Recomendado para skills que escrevem em disco / mexem em estado.

---

## Convenções

| Aspecto | Convenção |
| --- | --- |
| **Nome** | kebab-case: `minha-skill`, `gerador-de-relatorios` |
| **Idioma** | pt-BR sempre na descrição e instruções |
| **Persona** | Específica e clara |
| **Description** | Triggers concretos + exclusões explícitas |
| **Paths** | Sempre via framework-paths.md — nunca fixos no código |
| **Assets** | Templates em `assets/` |
| **References** | Docs longos em `references/` (carregados sob demanda) |

---

## Exemplo: skill de geração de release notes

```markdown
---
name: generate-release-notes
description: |
Gera release notes a partir de commits desde a última tag. Use quando
o usuário pedir release notes, changelog ou notas de versão.
NÃO faz tag git — apenas gera o markdown.
argument-hint: "[--since=v1.2.0] [--format=markdown|json]"
user-invocable: true
disable-model-invocation: true
---
# Skill: generate-release-notes
PERSONA: Tech writer que classifica mudanças por tipo (feat/fix/chore/breaking).
## Fluxo
1. Identifica última tag via `git describe --tags`.
2. Lista commits via `git log ..HEAD --pretty=…`.
3. Classifica via Conventional Commits.
4. Agrupa por tipo.
5. Salva em `docs/CHANGELOG.md` ou retorna em terminal.
```

---

## Onde a skill é registrada

Após criar `.claude/skills/<nome>/SKILL.md`, o Claude Code reconhece automaticamente. Não há registry central.

---

## Boas práticas

* **Description com triggers**: aumenta a chance do modelo escolher a skill quando o usuário deveria invocá-la.
* **Description com exclusões**: `"NÃO faz X — apenas Y"` evita uso errado.
* **Persona específica**: "Arquiteto Senior" gera output diferente de "Product Manager".
* **Usar paths via framework-paths.md**: nunca `docs/specs/...` direto. Sempre via chave.

---

## Próximos passos

* [Skills — Visão Geral](/skills/overview.html) — exemplos das skills existentes.
* [Rules de paths — Fonte Autoritativa](/configuration/framework-paths.html) — paths para a skill consumir.
* [Custom Executor](/customization/custom-executor.html) — para criar **agent** (não skill).
