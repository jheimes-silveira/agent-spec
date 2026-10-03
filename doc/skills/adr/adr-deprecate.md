---
id: "agent-spec-adr-deprecate"
title: "agent-spec-adr-deprecate"
sidebar_position: 6
---
# agent-spec-adr-deprecate

`ADR` `Maintenance`
> **Resumo**: Marca uma ADR existente como `deprecated` (**sem substituta direta**). Atualiza o frontmatter, registra o motivo em `Consequences`, **preserva** o histórico de `Applied in`, regenera o `INDEX.md` e gera relatório de features que ainda referenciam.

---

## Quando usar

* Decisão arquitetural **não é mais válida**, mas **não tem substituta direta** (a área foi removida, o problema sumiu, etc.).
* Você quer **rastrear publicamente** que a decisão antiga não deve ser seguida.

## Quando NÃO usar

* Há substituta direta → use [agent-spec-adr-supersede](adr-supersede.md).
* ADR ainda é válida e usada → não deprecie.

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `<id>` da ADR a depreciar | Usuário (argumento) | Sim |
| **Motivo** da depreciação | Usuário (via `AskUserQuestion`) | Sim — sem motivo claro, depreciar é ruído |

## Outputs

| Artefato | O que muda |
| --- | --- |
| ADR (`{id}-{slug}.md`) | `status: deprecated`; nota em `Consequences` com motivo + data |
| `INDEX.md` | Regenerado |
| **Relatório** de features que ainda referenciam | Impresso ao usuário |

---

## Princípios invioláveis

1. **Não apague história** — `Applied in` e conteúdo original permanecem. Depreciação **acrescenta**, não remove.
2. **ADR deprecated continua referenciável** (`deprecated_allows_reference: true`) — features podem ainda apontar para ela com aviso.
3. **Motivo é obrigatório** — coletado via `AskUserQuestion`.
4. **Recursos canônicos** — usa script canônico de [agent-spec-adr-reindex](adr-reindex.md).
5. **Token-efficient** — abre apenas o arquivo da ADR alvo + varredura focada de `docs/specs/**/*.md` para o relatório.

---

## Convenção de status

| Estado | Significado | Pode ser referenciada? |
| --- | --- | --- |
| `accepted` | Decisão ativa | Sim |
| `deprecated` | Decisão **não recomendada**, sem substituta direta | Sim (com warning) |
| `superseded-by:NNNN` | Substituída pela ADR `NNNN` | Sim (com aviso para migrar) |

---

## Fluxo de execução

1. **Lê ADR alvo** (`{id}-{slug}.md`).
2. **Pergunta motivo** ao usuário via `AskUserQuestion`.
3. **Atualiza frontmatter**: `status: deprecated`.
4. **Adiciona nota em `Consequences`**: "Deprecated em YYYY-MM-DD. Motivo: ...".
5. **Executa** `node {adr.reindex_script}`.
6. **Varre `docs/specs/**/*.md`** → imprime relatório de features que ainda referenciam.

---

## Gates invocados

Nenhum.

---

## Templates / assets usados

* `adr.reindex_script` (de [agent-spec-adr-reindex](adr-reindex.md)).

---

## Exemplo de uso

```bash
/agent-spec-adr-deprecate 0017
```

```
[Lê 0017-jwt-token-rotation.md]
Motivo da depreciação?
> Migramos toda autenticação para Auth0 — a rotação de tokens é gerenciada externamente.

[Atualiza frontmatter status: deprecated]
[Adiciona nota em Consequences: "Deprecated em 2026-04-28. Motivo: ..."]
[node reindex.cjs]

[Relatório: features que referenciam ADR-0017]
- /docs/specs/features/auth-revisao/v1/scope.md
- /docs/specs/features/login-social/v1/tech_spec.md

✅ ADR-0017 marcada como deprecated. Revise as features acima manualmente.
```

---

## Skills relacionadas

* [agent-spec-adr-supersede](adr-supersede.md) — alternativa quando há substituta.
* [agent-spec-adr-list](adr-list.md) — após depreciar, filtre por status `deprecated` para ver corpus deprecated.
* [agent-spec-adr-reindex](adr-reindex.md) — script canônico invocado.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `adr.reindex_script`, `shared.specs_glob`. Veja [Path Templates](../../configuration/path-templates.md).
