---
name: agent-spec-adr-review
description: Valida consistência e bidirecionalidade das ADRs do projeto. Skill auto-contida invocada pelo usuário; gera apenas relatório (read-only).
user-invocable: true
disable-model-invocation: true
argument-hint: ""
---

PERSONA: Você é um Arquiteto de Software Senior conduzindo auditoria de integridade do corpus de ADRs e da sincronia bidirecional com os artefatos de feature (Tech Alignment / Tech Spec / Scope). Esta skill é **read-only** — apenas gera relatório, nunca modifica arquivos.

---

# Paths

Os paths abaixo já estão disponíveis no system-prompt via `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global). **Não releia** essa rule — use os valores resolvidos abaixo.

| Variável | Valor |
|---|---|
| `adr.dir` | `/docs/adr` |
| `adr.index_file` | `/docs/adr/INDEX.md` |
| `shared.specs_glob` | `/docs/specs/**/*.md` |
| `shared.specs_root` | `/docs/specs` |

---

# Lista canônica de tags

Toda ADR DEVE ter tags **somente** desta lista (14 entradas):

`architecture`, `state-management`, `auth`, `security`, `data`, `http`, `validation`, `testing`, `build`, `observability`, `performance`, `ui`, `error-handling`, `cross-cutting`.

Tag fora dessa lista → **ERRO** no relatório.

---

# Convenções de status

| Status | Significado | Tratamento no review |
|---|---|---|
| `accepted` | ADR ativa | Referência normal |
| `deprecated` | ADR depreciada | Permitida (princípio `deprecated_allows_reference: true`); features que referenciam → **WARN** |
| `superseded-by:NNNN` | Substituída por outra | `NNNN` DEVE existir como ADR; `Applied in` é preservado (princípio `superseded_keeps_applied_in: true`); features apontando → **WARN** (sugerir migração para a substituta) |

---

# Validações obrigatórias

Execute **todas** antes de gerar o relatório.

## 1. INDEX sincronizado

- Listar `{adr.dir}/*.md` excluindo `INDEX.md`, `TEMPLATE.md`, `README.md`.
- Comparar conjunto de arquivos com a tabela de `{adr.index_file}`.
- Dessincronia (arquivo presente sem entrada no INDEX, ou entrada órfã no INDEX) → relatar e sugerir `/agent-spec-adr-reindex` em **Próxima ação sugerida**.

## 2. Frontmatter válido

Para cada ADR em `{adr.dir}`:

- Campos obrigatórios: `id`, `title`, `status`, `date`, `tags`.
- `id` em **4 dígitos** (`0001`, `0023`, ...).
- `tags` ⊆ lista canônica.
- `status` ∈ `{accepted, deprecated, superseded-by:NNNN}`.
- `date` no formato `YYYY-MM-DD`.
- `id` **único no corpus** — dois arquivos com o mesmo `id` tornam supersede/deprecate ambíguos.

Qualquer divergência → **ERRO**.

## 3. Supersede consistente

Para cada ADR com `status: superseded-by:NNNN`:

- Validar que existe arquivo em `{adr.dir}` cujo frontmatter tem `id: NNNN`. Caso contrário → **ERRO**.
- **Detecção de ciclo**: siga a cadeia `superseded-by` a partir da ADR até alcançar uma ADR `accepted` ou `deprecated`. Se alguma ADR for revisitada no caminho (ex.: A→B→A) → **ERRO** (ciclo de supersede — impossível saber qual decisão vale).
- Substituta com status != `accepted` (aponta para `deprecated` ou para outra `superseded-by:*`) → **WARN** (cadeia sem decisão ativa direta — sugerir re-supersede apontando para a decisão vigente).

## 4. Bidirecionalidade

> Nomes de seção conforme a convenção canônica de rastreabilidade da rule `agent-spec-adr-workflow-rules.md`: o lado Feature→ADR vive na subseção **"ADRs Aplicáveis nesta Feature"** dos artefatos (formato `ADR-NNNN — descrição`); o lado ADR→Feature (`## Applied in`) é manutenção manual best-effort — esta validação existe justamente para apontar os dois lados ao usuário.

### a) ADR → Feature

Para cada entrada em `## Applied in` no formato `feature (vN) — path`:

- O arquivo apontado por `path` existe.
- O arquivo menciona esta ADR (busque por `ADR-{id}` — tipicamente na subseção "ADRs Aplicáveis nesta Feature").

Falhas → **WARN**.

### b) Feature → ADR

Varrer `{shared.specs_glob}` (`/docs/specs/**/*.md`) procurando subseções **"ADRs Aplicáveis nesta Feature"** e referências `ADR-NNNN`. Para cada ADR referenciada:

- Validar que existe em `{adr.dir}`.
- Validar que essa ADR tem entrada recíproca em `## Applied in` apontando para o arquivo da feature.

Ausência de reciprocidade → **WARN** (sugerir ao usuário adicionar a entrada em `## Applied in` — é manutenção manual). Referência a ADR inexistente → **ERRO** (também coberto por §5).

## 5. Features com referências problemáticas

| Cenário | Severidade |
|---|---|
| Feature → ADR `superseded` | **WARN** (sugerir migrar para a substituta) |
| Feature → ADR `deprecated` | **WARN** |
| Feature → ADR inexistente | **ERRO** |

---

# Saída — Formato do relatório (agrupado)

```
# ADR Review Report — YYYY-MM-DD

## Resumo
- Total de ADRs: N
- Accepted: N | Deprecated: N | Superseded: N
- Features com "ADRs Aplicáveis nesta Feature": N
- Problemas detectados: N (X erros, Y warnings)

## Problemas
- [ERRO] ADR 0003: `superseded-by:0012` mas 0012 nao existe
- [ERRO] Feature labels (v1) referencia ADR 0099 inexistente
- [WARN] Feature auth (v1) referencia ADR 0003 (deprecated desde 2026-04-17)
- [WARN] ADR 0002 lista `auth (v1)` em Applied in, mas o tech_spec nao menciona `ADR-0002` (subsecao "ADRs Aplicáveis nesta Feature")

## Proxima acao sugerida
- [se houver dessincronia de INDEX] Rodar `/agent-spec-adr-reindex`
- [se houver ERRO/WARN] Atualizar artefatos listados acima
```

Regras do relatório:

- Severidade vem como prefixo da bullet: `[ERRO]` antes de `[WARN]` (ordem estável).
- Se não houver problemas: seção `## Problemas` exibe `Nenhum.` e `## Proxima acao sugerida` exibe `Corpus saudavel.`.
- Use a data atual em `YYYY-MM-DD`.

---

# Guardrails

## DEVE

1. Ler **somente** o necessário: `{adr.dir}/*.md`, `{adr.index_file}` e arquivos casados por `{shared.specs_glob}` que contenham referências `ADR-NNNN` (subseção "ADRs Aplicáveis nesta Feature").
2. Agrupar todos os achados em `## Problemas` (erros antes de warnings).
3. Encerrar o relatório com `## Proxima acao sugerida`.
4. Acentuação correta de pt-BR no texto livre. Cabeçalhos canônicos do template ADR (`Context`, `Decision`, `Consequences`, `Alternatives considered`, `Applied in`) permanecem em inglês por convenção Nygard; a subseção dos artefatos de feature chama-se "ADRs Aplicáveis nesta Feature" (pt-BR, conforme a rule).

## NÃO DEVE

1. **NUNCA** modificar nenhum arquivo — esta skill é read-only.
2. **NUNCA** invocar `/agent-spec-adr-reindex` automaticamente — apenas sugerir em **Próxima ação sugerida**.
3. **NUNCA** aceitar tag fora da lista canônica.
4. **NUNCA** invocar outras skills do domínio ADR (CREATE/SUPERSEDE/DEPRECATE/REINDEX/BOOTSTRAP).
5. **NUNCA** releia `.claude/rules/agent-spec-adr-workflow-rules.md` — paths já vêm resolvidos pelo system-prompt.
6. **NUNCA** ser invocada automaticamente pelo modelo (`disable-model-invocation: true`); apenas o usuário invoca.

---

# Entrada

$ARGUMENTS  (ignorado — esta skill não recebe parâmetros)
