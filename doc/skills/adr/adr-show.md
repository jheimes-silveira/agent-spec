---
id: "agent-spec-adr-show"
title: "agent-spec-adr-show"
sidebar_position: 3
---
# agent-spec-adr-show

`ADR` `Maintenance`
> **Resumo**: Exibe o conteúdo completo de uma ADR específica. **Read-only** — não modifica arquivos. Recebe ID (ex.: `0001`, `1`, `42`) ou slug (ex.: `repository-service-pattern`).

---

## Quando usar

* Após consultar [agent-spec-adr-list](adr-list.md) e querer ler uma ADR específica.
* Quando o ID ou slug já é conhecido.

## Quando NÃO usar

* Para ver lista geral → use [agent-spec-adr-list](adr-list.md).
* Para auditoria de consistência → use [agent-spec-adr-review](adr-review.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `<id-ou-slug>` | Usuário (argumento) | Sim |

## Outputs

Conteúdo completo da ADR impresso em pt-BR. Avisos contextuais quando aplicável (ADR `superseded` ou `deprecated`).

---

## Comportamento

| Situação | Output |
| --- | --- |
| ADR encontrada com status `accepted` | Conteúdo completo |
| ADR encontrada com status `superseded-by:NNNN` | Conteúdo completo + aviso "Esta ADR foi substituída pela ADR-NNNN" |
| ADR encontrada com status `deprecated` | Conteúdo completo + aviso "Esta ADR está deprecated. Motivo: ..." |
| ADR não encontrada (ID/slug inválido) | Mensagem de erro + sugestão de rodar `/agent-spec-adr-list` |

---

## Princípios

1. **Read-only** — não modifica arquivos, não dispara reindex.
2. **Resolução flexível**: aceita ID numérico (`42`, `0042`) ou slug (`rate-limit-strategy`).
3. **Avisos contextuais** quando ADR não está mais ativa.
4. **Exibição verbatim** — conteúdo entregue sem reformatar, traduzir ou resumir.

### Algoritmo de resolução do path

1. **Se o argumento é numérico puro** (ex.: `1`, `42`): normaliza para 4 dígitos com zero à esquerda — `id_padded = printf "%04d" $ARGUMENTS` (ex.: `1` → `0001`, `42` → `0042`).
2. **Padrão de busca**: `{adr.dir}/{id_padded}-*.md`.
3. **Se o argumento é alfanumérico** (slug): padrão `{adr.dir}/*-{slug}.md`.
4. **Múltiplos matches encontrados** (improvável, mas defensivo): lista os matches e pede ao usuário para refinar.
5. **Zero matches**: mensagem de erro + sugestão de rodar `/agent-spec-adr-list`.

---

## Gates invocados

Nenhum.

---

## Exemplo de uso

```bash
/agent-spec-adr-show 0042
# ou
/agent-spec-adr-show rate-limit-strategy
```

```
# ADR-0042: Rate Limit Strategy

Status: accepted
Tags: [http, performance]

## Context
A API recebe picos esporádicos que comprometem latência ...

## Decision
Adotar token bucket via Redis, escala 100 req/s por usuário.

## Consequences
+ Proteção contra abuso
+ Compartilhamento de contadores entre instâncias
- Dependência adicional do Redis (já existente)

## Alternatives considered
- Sliding window: rejeitado (custoso em memória)
- Leaky bucket: rejeitado (latência irregular)

## Applied in
- internal/api/middleware/ratelimit.go
- internal/users/handler.go
```

---

## Skills relacionadas

* [agent-spec-adr-list](adr-list.md) — listar todas as ADRs.
* [agent-spec-adr-review](adr-review.md) — auditoria de consistência.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.file_pattern`, `adr.index_file` (apenas para sugestão em caso de erro). Veja [Path Templates](../../configuration/path-templates.md).
