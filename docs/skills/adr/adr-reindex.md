---
id: "agent-spec-adr-reindex"
title: "agent-spec-adr-reindex"
sidebar_position: 8
---
# agent-spec-adr-reindex

`ADR` `Maintenance`
> **Resumo**: Regenera `docs/adr/INDEX.md` a partir dos arquivos ADR existentes (`{id}-{slug}.md`). Operação **determinística** executada por script Node — preserva conteúdo fora dos marcadores `<!-- ADR-INDEX-START -->` / `<!-- ADR-INDEX-END -->` e atualiza a linha `Última atualização`.

> **Esta skill é a dona do script canônico** (`scripts/reindex.cjs`, referenciado por `adr.reindex_script` em framework-paths.md). Demais skills ADR ([create](/skills/adr/adr-create.html), [deprecate](/skills/adr/adr-deprecate.html), [supersede](/skills/adr/adr-supersede.html), [bootstrap](/skills/adr/adr-bootstrap.html)) invocam este script em vez de manter cópias.

---

## Quando usar

| Cenário | Por quê |
| --- | --- |
| **Recuperação** | `INDEX.md` ficou dessincronizado por edição manual de arquivos ADR |
| **Bootstrap** | Após criar N ADRs em lote (ex.: durante [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html)) |
| **CI/CD** | Validar que o `INDEX.md` commitado reflete os arquivos do repositório |

## Quando NÃO usar

* Após [agent-spec-adr-create](/skills/adr/adr-create.html), [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html), [agent-spec-adr-supersede](/skills/adr/adr-supersede.html), [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) — essas skills **já chamam o script** ao final dos seus fluxos.
* Para criar nova ADR → use [agent-spec-adr-create](/skills/adr/adr-create.html).

---

## Inputs

Nenhum argumento.

| Lê | Origem |
| --- | --- |
| Arquivos ADR | `adr.dir/{id}-{slug}.md` |
| Script Node | `adr.reindex_script` |

## Outputs

| Artefato | O que muda |
| --- | --- |
| `INDEX.md` (`adr.index_file`) | Tabela entre marcadores regenerada + linha "Última atualização" atualizada |

> Conteúdo fora dos marcadores `<!-- ADR-INDEX-START -->` / `<!-- ADR-INDEX-END -->` é **preservado**.

---

## Princípios invioláveis

1. **Script é a verdade** — toda lógica de geração da tabela vive em `scripts/reindex.cjs`. Esta skill não interpreta frontmatter, não decide ordenação, não formata colunas.
2. **Idempotência** — rodar o script N vezes consecutivas produz o mesmo `INDEX.md` (assumindo arquivos ADR inalterados).
3. **Auto-contida** — esta skill carrega seu próprio script (`scripts/reindex.cjs`). É a **dona canônica** do reindex.
4. **Token-efficient** — esta skill **não abre** arquivos ADR. Quem lê os arquivos é o script Node em runtime.

---

## Fluxo de execução

```bash
node {adr.reindex\_script}
# = node /.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs
```

O script:

1. Lê todos os arquivos `{id}-{slug}.md` em `adr.dir`.
2. Extrai frontmatter (id, title, status, tags) e primeira linha de Context (problema 1-linha) + primeira linha de Decision.
3. Ordena por `id` numérico ascendente.
4. Reescreve a tabela do `INDEX.md` entre os marcadores `<!-- ADR-INDEX-START -->` / `<!-- ADR-INDEX-END -->`.
5. Atualiza linha `Ultima atualizacao: YYYY-MM-DD`.
6. Preserva todo o resto do `INDEX.md` (cabeçalho, observações).

---

## Gates invocados

Nenhum.

---

## Templates / assets usados

* `scripts/reindex.cjs` — script Node **canônico** (esta skill é a dona).

---

## Exemplo de uso

```bash
/agent-spec-adr-reindex
```
```
[Executa: node /.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs]
✅ INDEX.md regenerado.
12 ADRs indexadas (10 accepted, 1 deprecated, 1 superseded-by:0042).
Última atualização: 2026-04-28
```

---

## Skills relacionadas

* [agent-spec-adr-create](/skills/adr/adr-create.html) — invoca este script ao criar ADR.
* [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html), [agent-spec-adr-supersede](/skills/adr/adr-supersede.html), [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) — invocam este script ao final dos fluxos.
* [agent-spec-adr-review](/skills/adr/adr-review.html) — detecta divergência entre INDEX e arquivos; sugere rodar esta skill.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `adr.reindex_script` (próprio). Veja [Path Templates](/configuration/path-templates.html).
