---
id: "agent-spec-adr-review"
title: "agent-spec-adr-review"
sidebar_position: 7
---
# agent-spec-adr-review

`ADR` `Maintenance`
> **Resumo**: Valida **consistência e bidirecionalidade** das ADRs do projeto. Skill **read-only** — apenas gera relatório de problemas detectados, nunca modifica arquivos.

---

## Quando usar

* Auditoria periódica do corpus de ADRs.
* Antes de releases para validar que ADRs e features estão sincronizadas.
* Após alterações manuais em arquivos ADR (verificar tags, status, formato).
* CI/CD para garantir integridade.

## Quando NÃO usar

* Para regenerar o `INDEX.md` → use [agent-spec-adr-reindex](adr-reindex.md).
* Para listar ADRs → use [agent-spec-adr-list](adr-list.md).

---

## Inputs

Nenhum argumento — varre todo o corpus.

| Lê | Origem |
| --- | --- |
| `INDEX.md` | `adr.index_file` |
| Arquivos ADR | `adr.dir/{id}-{slug}.md` |
| Specs | `shared.specs_glob` → `/docs/specs/**/*.md` (em busca de referências bidirecionais) |

## Outputs

Relatório textual com problemas detectados, classificados por severidade.

---

## O que valida

### Consistência interna do corpus

| Validação | Severidade |
| --- | --- |
| Frontmatter completo (id, title, status, date, tags) | Erro |
| Tag fora da lista canônica de 14 entradas | Erro |
| Status válido (`accepted` / `deprecated` / `superseded-by:NNNN`) | Erro |
| ID duplicado | Erro |
| Slug em kebab-case | Aviso |
| Seção `Context`, `Decision`, `Consequences` presente | Erro |
| Data válida (YYYY-MM-DD) | Aviso |

### Bidirecionalidade com specs

| Validação | Severidade |
| --- | --- |
| `Applied in` da ADR cita feature, mas feature não menciona a ADR (subseção "ADRs Aplicáveis nesta Feature") | Aviso |
| Feature cita ADR-NNNN em "ADRs Aplicáveis nesta Feature", mas ADR-NNNN não tem essa feature em `Applied in` | Aviso |
| Feature cita ADR-NNNN com status `deprecated` ou `superseded-by:NNNN` | Aviso (suggest migrar) |
| Feature cita ADR inexistente | Erro |

### Consistência do INDEX

| Validação | Severidade |
| --- | --- |
| ADR existe no diretório mas não no INDEX | Erro (sugere rodar [agent-spec-adr-reindex](adr-reindex.md)) |
| INDEX cita ADR que não existe no diretório | Erro |
| Linha do INDEX divergente do arquivo (título, status, tags) | Erro |

---

## Lista canônica de tags

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```

Tag fora dessa lista → **erro** no relatório.

---

## Princípios invioláveis

1. **Read-only** — nunca modifica arquivos.
2. **Apenas gera relatório** — quem corrige é o usuário (manualmente ou via skills de escrita).
3. Não chama [agent-spec-adr-reindex](adr-reindex.md) automaticamente — apenas sugere se INDEX divergente.

---

## Gates invocados

Nenhum.

---

## Exemplo de uso

```bash
/agent-spec-adr-review
```

```
[Varre adr.dir, INDEX.md, /docs/specs/**/*.md]

=== ADR Review Report ===

Erros (3):
  • ADR-0042 tem tag "ratelimit" fora da lista canônica
  • feature pagamentos/v1/scope.md cita ADR-0099 (inexistente)
  • INDEX.md divergente do arquivo: ADR-0017 tem status "accepted" no INDEX mas "deprecated" no arquivo
    → Sugestão: rodar /agent-spec-adr-reindex

Avisos (2):
  • ADR-0017 (deprecated) ainda é referenciada em login-social/v1/tech_spec.md — considere migrar
  • feature catalogo-filtros/v1 cita ADR-0001, mas ADR-0001 Applied in não menciona essa feature

✅ Relatório completo. 3 erros + 2 avisos. Nenhum arquivo modificado.
```

---

## Skills relacionadas

* [agent-spec-adr-reindex](adr-reindex.md) — corrige divergência do INDEX detectada por esta skill.
* [agent-spec-adr-supersede](adr-supersede.md) / [agent-spec-adr-deprecate](adr-deprecate.md) — para migrar/depreciar ADRs antigas.
* [agent-spec-adr-list](adr-list.md) — visão geral.
* [agent-spec-staff-architecture-review](../../agents/staff-architecture-review-agent.md) — agent que aplica ADRs em validação de tasks.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `shared.specs_glob`, `shared.specs_root`. Veja [Path Templates](../../configuration/path-templates.md).
