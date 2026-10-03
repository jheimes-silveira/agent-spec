---
id: "lifecycle"
title: "ADR — Ciclo de Vida"
sidebar_position: 2
---
# ADR — Ciclo de Vida

ADRs têm 3 estados possíveis. Esta página detalha as transições entre eles e quais skills as executam.

---

## Diagrama de estados

```
┌─────────────────────────┐
│ agent-spec-adr-create │
│ agent-spec-adr-bootstrap │
└──────────┬──────────────┘
│
▼
┌──────────┐
│ accepted │ ← ADR ativa (default)
└─┬──────┬─┘
│ │
agent-spec-adr-deprecate│ │agent-spec-adr-supersede
│ │
▼ ▼
┌────────────┐ ┌─────────────────────┐
│ deprecated │ │ superseded-by:NNNN │
└────────────┘ └─────────────────────┘
(sem substituta) (com substituta)
```
> **Apagar ADR é proibido**. Histórico permanece sempre. Mudanças de estado são **acréscimos** (nota em `Consequences`, atualização de frontmatter), nunca remoção de conteúdo.

---

## Estados em detalhe

### `accepted`

Estado **default** ao criar via [agent-spec-adr-create](/skills/adr/adr-create.html) ou [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html).

* ADR é a fonte canônica para a decisão.
* Pode ser referenciada por features sem aviso.
* Aparece na listagem padrão de [agent-spec-adr-list](/skills/adr/adr-list.html).

### `deprecated`

ADR marcada como **não recomendada**, sem substituta direta. Atribuída via [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html).

* A decisão **não é mais válida** mas pode haver código legado seguindo ela.
* Continua **referenciável** (com warning).
* O motivo é obrigatório (coletado via `AskUserQuestion` durante o deprecate).
* Histórico de `Applied in` é **preservado**.

> Use quando a decisão simplesmente saiu do uso (ex.: a área foi removida, a tecnologia foi descontinuada). Se há substituta, prefira [agent-spec-adr-supersede](/skills/adr/adr-supersede.html).

### `superseded-by:NNNN`

ADR substituída pela ADR `NNNN`. Atribuída via [agent-spec-adr-supersede](/skills/adr/adr-supersede.html).

* Aponta explicitamente para a substituta.
* Continua **referenciável** com aviso para migrar.
* A nova ADR registra referência reversa em `Context` (`"Substitui ADR-{old-id}"`).
* `Applied in` da OLD **NÃO é migrado automaticamente** — cada feature decide se adota a nova atualizando seu próprio `## ADRs referenced`.

---

## Transições e skills responsáveis

| De | Para | Skill | O que acontece |
| --- | --- | --- | --- |
| (vazio) | `accepted` | [agent-spec-adr-create](/skills/adr/adr-create.html) | Cria ADR nova com `status: accepted` |
| (vazio) | `accepted` | [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) | Cria N ADRs em lote a partir de varredura |
| `accepted` | `deprecated` | [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html) | Atualiza frontmatter; nota em `Consequences` |
| `accepted` | `superseded-by:NNNN` | [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) | Atualiza frontmatter; cria/aponta para NEW |
| `deprecated` | `superseded-by:NNNN` | [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) | Permitido; preserva nota de depreciação anterior |
| `superseded-by:NNNN` | `superseded-by:MMMM` | (não suportado) | Edição manual; não há comando |

> **Não há volta**: ADR `deprecated` ou `superseded-by:NNNN` **não retorna a `accepted`** via skill. Se for necessário, edite manualmente.

---

## O que `agent-spec-adr-review` audita no ciclo de vida

[agent-spec-adr-review](/skills/adr/adr-review.html) detecta:

* ADR com status inválido (não está em `accepted`/`deprecated`/`superseded-by:NNNN`).
* Feature referencia ADR `deprecated` (avisa: considere migrar).
* Feature referencia ADR `superseded-by:NNNN` (avisa: considere migrar).
* Feature referencia ADR inexistente (erro).
* ADR com `Applied in` mencionando feature que não tem `## ADRs referenced` apontando de volta (bidirecionalidade quebrada).

---

## Princípios

1. **Não apague história** — `Applied in` e conteúdo original ficam preservados em todas as transições.
2. **Motivos são obrigatórios** em deprecate/supersede — coletados via `AskUserQuestion`.
3. **Migração de features é manual** — por design. O sistema **mostra** quem precisa migrar via relatório, mas **não migra** automaticamente.
4. **`Applied in` da OLD não vai para a NEW** em supersede — cada feature decide.

---

## Próximos passos

* [Template Nygard](/adr/template-nygard.html) — estrutura das 5 seções.
* [agent-spec-adr-create](/skills/adr/adr-create.html) — criar ADR nova.
* [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html) — marcar como deprecated.
* [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) — substituir por outra.
* [agent-spec-adr-review](/skills/adr/adr-review.html) — auditoria.
