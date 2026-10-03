---
id: "agent-spec-adr-list"
title: "agent-spec-adr-list"
sidebar_position: 4
---
# agent-spec-adr-list

`ADR` `Maintenance`
> **Resumo**: Lista as ADRs do projeto a partir do `INDEX.md`, com filtro opcional por tag ou status. **Token-efficient** — abre apenas o `INDEX.md`, nunca arquivos ADR individuais.

---

## Quando usar

* Visão geral de todas as ADRs do projeto.
* Filtrar ADRs por tag (ex.: `auth`, `security`) ou status (`accepted`, `deprecated`, `superseded`).
* Antes de [agent-spec-adr-show](/skills/adr/adr-show.html) para descobrir ID a aprofundar.

## Quando NÃO usar

* Para ver detalhes de uma ADR específica → use [agent-spec-adr-show](/skills/adr/adr-show.html).
* Auditoria de consistência → use [agent-spec-adr-review](/skills/adr/adr-review.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `[tag|status]` | Usuário (argumento, opcional) | Não — sem argumento, lista tudo |

## Outputs

Tabela do `INDEX.md` (ou subconjunto filtrado) impressa em terminal.

---

## Princípios invioláveis

1. **Token-efficient by design** — abre **apenas** o `INDEX.md`. **NUNCA** abre arquivos ADR individuais.
2. **Single source of truth** — a fonte é exclusivamente o `INDEX.md` regenerado pelas skills de escrita ([agent-spec-adr-create](/skills/adr/adr-create.html), [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html), [agent-spec-adr-supersede](/skills/adr/adr-supersede.html), [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html)). Não recompõe a tabela varrendo `adr.dir`.
3. **Saída fiel ao INDEX** — preserva a tabela como está no INDEX.md (não reformata colunas, não trunca células).

---

## Filtros suportados

| Tipo | Exemplo | Comportamento |
| --- | --- | --- |
| **Por tag** | `/agent-spec-adr-list auth` | Mostra apenas ADRs com tag `auth` |
| **Por status** | `/agent-spec-adr-list deprecated` | Mostra apenas ADRs com status `deprecated` |
| **Sem filtro** | `/agent-spec-adr-list` | Mostra a tabela inteira |

> Se `INDEX.md` não existe, sugere rodar [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) ou [agent-spec-adr-reindex](/skills/adr/adr-reindex.html).

---

## Gates invocados

Nenhum.

---

## Exemplo de uso

```bash
# Listar tudo:
/agent-spec-adr-list
# Filtro por tag:
/agent-spec-adr-list http
# Filtro por status:
/agent-spec-adr-list deprecated
```
```
| ID | Título | Status | Tags | Problema (1-linha) |
|-------|---------------------------------|------------|------------------|----------------------------|
| 0001 | repository-service-pattern | accepted | architecture | Padrão de acesso a dados |
| 0042 | rate-limit-strategy | accepted | http,performance | Picos comprometem latência |
| 0017 | jwt-token-rotation | superseded | auth,security | Rotação de tokens |
```

---

## Skills relacionadas

* [agent-spec-adr-show](/skills/adr/adr-show.html) — aprofundar ADR específica após listar.
* [agent-spec-adr-review](/skills/adr/adr-review.html) — auditoria.
* [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) — regenerar INDEX se estiver dessincronizado.

## Configuração via framework-paths.md

Paths usados: `adr.dir` (apenas para mensagem de erro), `adr.index_file`. Veja [Path Templates](/configuration/path-templates.html).
