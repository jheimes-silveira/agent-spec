---
id: "qa-context"
title: "qa_context Pré-extraído"
sidebar_position: 4
---
# qa\_context Pré-extraído

Resume o `tech_spec.md` (SDD) ou `intent.md` + `scope.md` (miniSpec) em um artefato denso consumido por N invocações de [agent-spec-qa-test-generator](/agents/qa-test-generator.html). Aplicado tanto no SDD quanto no miniSpec.

---

## Problema

Sem `qa_context`, cada invocação do `agent-spec-qa-test-generator` lia o `tech_spec.md` completo (~10.5k tokens) apenas para extrair seções específicas (Arquitetura/Componentes, Fluxos, Critérios de Aceitação e Estratégia de Testes).

Em uma feature de 8 tasks: **8 × 10.5k = 84.000 tokens de releitura** para extrair ~15k úteis.

## Solução

Orquestrador extrai 1× um resumo denso antes de disparar os subagentes:

```
tech\_spec.md (~10.5k tokens)
│
│ Passo 0: skill extrai
▼
.qa\_context.md (~1.5-2k tokens, denso)
│
│ passado a N subagentes
▼
[qa-test-gen 1, ..., qa-test-gen N] — cada um lê 1.5k em vez de 10.5k
```

**Economia**: `~8k × N` tokens em features de 8 tasks ≈ 60-80k tokens.

---

## Conteúdo do qa\_context.md

Pensado para cobrir as seções que os subagentes **realmente** usam:

```markdown
> Gerado em {YYYY-MM-DD} a partir de `intent.md` + `scope.md`. Se o `scope.md` for editado
> após esta data (ex.: via /agent-spec-challenge-spec), este arquivo está STALE — regenere-o
> ou consulte INTENT/SCOPE diretamente.
# QA Context — /
## 1. Mapa CA → CT (rastreabilidade)
| CA | CTs |
|---|---|
| CA-01 | CT-01, CT-02, CT-05 |
| CA-02 | CT-03, CT-04 |
## 2. Componentes (condensada)
- HealthHandler (handler): responde GET /health
- PingsHandler (handler): CRUD de pings
- PingsService (service): regras de negócio
- PingsRepository (repository): SQLC para pings
## 3. Fluxos técnicos críticos (condensada)
- Fluxo 1: cadastro de ping (POST /pings → handler → service → repository)
- Fluxo 2: query de pings por estabelecimento
## 4. Critérios de Aceitação (condensada)
- CA-01: POST /pings retorna 201 com ID criado
- CA-02: GET /pings?estab=X filtra corretamente
## 5. Estratégia de Testes (condensada)
- CT-01: TestCreatePing\_Valido (input: payload OK, expected: 201 + ID)
- CT-02: TestCreatePing\_Invalido (input: CPF ruim, expected: 400)
## 6. Paths relevantes
- Migrações: internal/db/migrations/0002\_pings.sql
- Queries: internal/db/queries/pings.sql
- Handlers: internal/pings/handler.go
```

**Tamanho típico**: 1.500-2.000 tokens. Suficiente para subagente gerar testes de alta qualidade sem reler o tech\_spec.

---

## Path

Salvo em `sdd.qa_context.path` (ou `minispec.qa_context.path`):

```
/docs/specs/features/{feature}/{version}/.qa\_context.md
```

Prefixo `.` sinaliza **artefato intermediário**. Adicione ao `.gitignore` se preferir não versionar.

---

## Quando é gerado

### SDD

**Passo 0** do [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html):

1. Resolve path via `sdd.qa_context.path`.
2. Lê `tech_spec.md` 1×.
3. Extrai em formato denso.
4. Salva no path.
5. A partir daqui, cada invocação de `agent-spec-qa-test-generator` recebe o path do `.qa_context.md` em `arquivos[]` — **não** o tech\_spec completo.

### miniSpec

**Passo 0** do [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html):

* Mesma lógica com `minispec.qa_context.path`, consolidando INTENT + SCOPE.

---

## Fallback automático

Se o `tech_spec.md` for pequeno (`<4k tokens`), o overhead de extração não compensa. O orquestrador **pula o Passo 0** e usa o tech\_spec diretamente.

---

## Regeneração

O `.qa_context.md` é **reversível**: pode deletar a qualquer momento. Na próxima execução do `generate-task-plan` (ou `generate-tasks`), será regenerado a partir do tech\_spec/scope atual.

Útil quando o tech\_spec/scope é atualizado e você quer que os CTs sejam regenerados com contexto novo.

O **cabeçalho de proveniência** (data + fonte) no topo do arquivo permite detectar staleness automaticamente: no miniSpec, o `run-tasks` compara o mtime do `scope.md` com o do `.qa_context.md` (FASE 0, item 6.2) e, se o scope for mais novo, loga o aviso e trata o contexto como não-confiável — consultando INTENT/SCOPE diretamente.

---

## Não confundir

* `.qa_context.md` ≠ `tech_spec.md` ≠ `prd.md`
* `.qa_context.md` ≠ Seção 6 das tasks (Testes)
* `.qa_context.md` ≠ contexto inline da execução (`base_sha` + sumário do executor passados no prompt do Gate 1 e Gate 2 — sem arquivo; ver [Memória Proativa](/advanced/proactive-memory.html) para histórico do antigo `execution-summary.md`).

---

## Logs

Terminal mostra:

```
[generate-task-plan] Passo 0: extraindo .qa\_context.md de tech\_spec.md (10.500 tokens)
[generate-task-plan] → .qa\_context.md salvo (1.750 tokens)
[generate-task-plan] Disparando 4 subagentes agent-spec-qa-test-generator em paralelo (consolidação por camada)
```

---

## Próximos passos

* [QA Consolidation](/advanced/qa-consolidation.html) — agrupar tasks por camada na geração.
* [Skip QA quando a Estratégia de Testes completa](/advanced/skip-qa-section14.html) — eliminar invocações redundantes.
* [Memória Proativa](/advanced/proactive-memory.html) — economia análoga em execução.
* [Contexto Mínimo](/concepts/minimum-context.html) — princípio geral.
