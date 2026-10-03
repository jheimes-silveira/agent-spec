---
id: "agent-spec-semantic-commit"
title: "agent-spec-semantic-commit"
sidebar_position: 4
---
# agent-spec-semantic-commit

`Shared` `Maintenance`
> **Resumo**: Gera mensagens de commit em **Português Brasileiro** seguindo a especificação [Conventional Commits](https://www.conventionalcommits.org/), escolhendo o tipo correto (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`, `ci`, `build`, `revert`), definindo escopo e redigindo a linha de assunto no imperativo pt-BR dentro de 72 caracteres.

---

## Quando usar

* Usuário quer **commitar mudanças** ou pedir uma mensagem de commit.
* Usuário mostra um diff e quer registrar a alteração no git.
* Usuário pergunta "commita isso", "como commito isso?", "gera o commit", "qual seria o commit?" ou simplesmente descreve o que mudou no código.
* Mesmo que o usuário **não mencione** "semântico", "conventional commits" ou tipos como `feat`/`fix`/`refactor`.

## Quando NÃO usar

* Para gerar PR/release notes — esta skill foca apenas na mensagem de commit individual.
* Para reescrever histórico (squash, rebase) — essa é responsabilidade do usuário no git.

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Diff (staged, unstaged ou inline) | `git diff --staged`, `git diff` ou usuário | Sim |
| Contexto da mudança | Análise automática do diff | Sim |

## Outputs

| Artefato | Destino | Consumido por |
| --- | --- | --- |
| Mensagem de commit no formato `<tipo>(<escopo>): <descrição>` | Apresentada ao usuário; opcionalmente executada via `git commit -m` | Repositório git |

---

## Fluxo de trabalho

```
1. Capturar contexto
│ git diff --staged (prioridade)
│ git diff (fallback se stage vazio)
│ git status --short (visão geral)
▼
2. Identificar tipo e escopo (analisa diff)
▼
3. Redigir mensagem (assunto ≤ 72 chars, imperativo pt-BR, minúsculas)
▼
4. Propor ao usuário (aprovar / ajustar / dividir em commits)
▼
5. Executar git commit (se aprovado)
```

---

## Tipos semânticos

| Tipo | Quando usar | Escopo típico |
| --- | --- | --- |
| `feat` | Nova funcionalidade visível ao usuário ou consumidor da API | `auth`, `pagamento`, `api` |
| `fix` | Correção de bug | `login`, `db`, `handler` |
| `refactor` | Reorganização interna sem mudança de comportamento observável | `user`, `core`, `pkg` |
| `perf` | Melhoria de performance sem alterar comportamento | `query`, `cache` |
| `test` | Adiciona ou corrige testes (sem mudar código de produção) | `user_test`, `e2e` |
| `docs` | Apenas documentação (README, comentários, godoc, swagger) | `readme`, `api` |
| `style` | Formatação, espaçamento, lint — zero lógica alterada | `fmt`, `lint` |
| `chore` | Manutenção: deps, scripts de build, configs de ferramentas | `deps`, `makefile`, `ci` |
| `ci` | Mudanças exclusivas em pipelines de CI/CD | `github`, `gitlab` |
| `build` | Sistema de build, Dockerfile, compilação | `docker`, `go`, `gradle` |
| `revert` | Reverte um commit anterior | (tipo revertido ou hash) |

---

## Formato oficial

```
(): 
[corpo — explica o quê e o porquê, não o como]
[rodapé: BREAKING CHANGE: ]
[rodapé: Closes #]
```

**Regras obrigatórias:**

* Linha de assunto: **máximo 72 caracteres**.
* Verbo em **imperativo presente pt-BR**: "adiciona", "corrige", "remove", "atualiza" — nunca "adicionado", "corrigindo", "foi adicionado".
* **Letras minúsculas** em toda a linha de assunto; **sem ponto final**.
* Escopo entre parênteses é opcional mas recomendado quando a mudança é localizada.
* Breaking change: adicione `!` após tipo/escopo (`feat!:`) **e** `BREAKING CHANGE:` no rodapé.
* Corpo e rodapé separados da linha de assunto por **uma linha em branco**.
* Nomes em PascalCase/camelCase devem ser convertidos para minúsculas ou colocados entre backticks (ex.: `TotalPrice` → `totalprice` ou `` `TotalPrice` ``).

---

## Exemplos

```
feat(handler): adiciona endpoint GET /products/:id
fix(auth): corrige expiração de token JWT em timezone UTC-3
refactor(pkg): centraliza utilitários de string em pacote dedicado
feat(api)!: renomeia campo `preco` para `valor` em todos os endpoints
```

A skill mantém um catálogo completo de exemplos por tipo em `.claude/skills/agent-spec-semantic-commit/references/exemplos.md` (incluindo breaking change com corpo, revert, ci, etc.).

---

## Boas práticas aplicadas pela skill

* **Um commit = uma responsabilidade.** Se o diff mistura uma nova feature com um fix em módulo diferente, a skill propõe dois commits.
* **O corpo explica o porquê**, não o como — omitido quando o assunto já é óbvio.
* **`chore` nunca é para bug fix.** Se algo estava quebrado, é `fix`.
* **`style` é só formatação.** Se qualquer linha de lógica mudou, o tipo é outro.
* **Revert inclui referência:** `revert: reverte feat(auth): adiciona login social (abc1234)`.
* **Issues no rodapé:** `Closes #N` (fecha), `Fixes #N` (sinônimo) ou `Refs #N` (só referencia).

---

## Gates invocados

Nenhum.

---

## Skills relacionadas

* [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) — discovery de feature; antecede a fase de implementação que culminará em commits.

## Configuração via framework-paths.md

Esta skill **não usa paths canônicos do framework** — opera sobre o git do projeto e não persiste artefatos em `docs/specs/`. Customizações (ex.: tipos adicionais, escopo padrão) podem ser feitas editando a própria skill em `.claude/skills/agent-spec-semantic-commit/`.
