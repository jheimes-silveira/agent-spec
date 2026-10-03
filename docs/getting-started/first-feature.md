---
id: "first-feature"
title: "Primeira feature (miniSpec completo)"
sidebar_position: 3
---
# Primeira feature completa — exemplo miniSpec

Exemplo real: **"sistema de filtros e ordenação no catálogo de figurinhas"**.

---

## Passo 1 — Discovery

```bash
/agent-spec-pre-refinement "sistema de filtros e ordenação no catálogo de figurinhas"
```

A skill [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) classifica:

* **S1 = 2-3 US** (filtrar por time, álbum, posse).
* **S2 = dev + 1** (produto valida UX).
* **S3 = incremento** em módulo existente.
* **S6 = não** (reusa padrões).
* **Recomendação**: miniSpec.

---

## Passo 2 — INTENT (O QUE e POR QUÊ)

```bash
/agent-spec-minispec-generate-intent "sistema de filtros e ordenação no catálogo"
```

A skill [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) faz perguntas sobre:

* Problema concreto.
* Público primário.
* Critérios de sucesso.

Gera `docs/specs/features/catalogo-filtros/v1/intent.md`:

```markdown
# INTENT — Filtros e ordenação do catálogo
## 1. Problema
Usuários não encontram figurinhas específicas em coleções grandes (1000+).
Tempo médio de navegação: 3min. Meta: <30s.
## 2. Objetivo
Permitir filtrar por time, álbum, status de posse (tenho/quero)
e ordenar por data/raridade/nome.
## 3. Critérios de Aceite
- CA-01: Filtro combinado (time + álbum) retorna em <500ms
- CA-02: Ordenação persistida na sessão
- CA-03: URL compartilhável refletindo filtros ativos
```

E cria `minispec_state.yaml` com `source: recommended`.

---

## Passo 3 — Tech Alignment (opcional)

```bash
/agent-spec-generate-tech-alignment docs/specs/features/catalogo-filtros/v1/intent.md \
"REST padrão existente, filtros via query params, sem persistência por usuário"
```

A skill [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) gera um documento curto (15-30 linhas) com decisões técnicas de alto nível.

---

## Passo 4 — SCOPE (decisões técnicas)

```bash
/agent-spec-minispec-generate-scope docs/specs/features/catalogo-filtros/v1/intent.md
```

A skill [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) gera `scope.md` com:

* Componentes afetados: `CatalogList`, `FilterBar`, `SortDropdown`, `useCatalogQuery`.
* Decisões:
  + URL state via `useSearchParams`.
  + Debounce 300ms no filtro de texto.
  + Cache local com `useMemo`.
* Paths a criar/modificar.

---

## Passo 5 — Tasks

```bash
/agent-spec-minispec-generate-tasks \
docs/specs/features/catalogo-filtros/v1/intent.md \
docs/specs/features/catalogo-filtros/v1/scope.md
```

**Otimizações automáticas**:

1. **`qa_context.md` proativo (Passo 0)**: skill extrai `~1.5k tokens` densos do scope. Subagentes leem este em vez do scope inteiro. Veja [qa\_context pré-extraído](/advanced/qa-context.html).
2. **Consolidação por camada**: agrupa tasks por camada e dispara **1 subagente [agent-spec-qa-test-generator](/agents/qa-test-generator.html) por camada**. Veja [QA Consolidation](/advanced/qa-consolidation.html).

A skill [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) decompõe em:

```
tasks/
├── T1.md — Adicionar FilterBar com debounce (camada: domínio)
├── T2.md — Adicionar SortDropdown (camada: domínio)
├── T3.md — URL sync via useSearchParams (camada: integração)
└── T4.md — Testes E2E do fluxo completo (camada: e2e)
```

Cada task tem frontmatter preenchido automaticamente:

```markdown
- model: sonnet
- risk: low
- gates: [qa, tech\_review]
```

Veja [Frontmatter de tasks](/advanced/model-selection.html).

---

## Passo 6 — Executar

```bash
/agent-spec-minispec-run-tasks \
docs/specs/features/catalogo-filtros/v1/task\_plan.md \
```
> Substitua `<seu-executor>` pelo nome do agent registrado em `.claude/agents/` para a sua stack (ex.: `react-task-developer`, `node-task-developer`). Veja [Custom Executor](/customization/custom-executor.html).

A skill [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html):

```
[T1] executor: sonnet (declarado) gates: [qa, tech\_review]
├─ executor implementou (FilterBar com debounce)
├─ base\_sha + sumário do executor persistidos (inline no prompt dos gates)
├─ Gate 1 (sonnet): APROVADO | testes 5/5
├─ Gate 2 (sonnet): approved
└─ git add ...
[T2] executor: sonnet gates: [qa, tech\_review]
├─ executor (SortDropdown)
├─ Gate 1: APROVADO | testes 3/3
├─ Gate 2: approved
└─ git add ...
[T3] executor: sonnet gates: [qa, tech\_review]
├─ executor (URL sync)
├─ Gate 1: APROVADO | testes 2/2
├─ Gate 2: approved
└─ git add ...
[T4] executor: sonnet gates: [qa, tech\_review]
├─ executor (E2E)
├─ Gate 1: APROVADO | testes 4/4 (E2E)
├─ Gate 2: approved
└─ git add ...
✅ 4 tasks executadas | 0 bloqueadas
```
> **Política débito-controlado**: críticos/altos detectados pelos gates disparam correção (até 3 tentativas com auto-escalação sonnet→opus). Médios/baixos em categorias `code_review_only` (code\_quality, naming, style, etc.) passam como `APROVADO_COM_OBSERVACOES`, viram débito anotado em `qa-observations.md` e podem ser recolhidos depois pela skill [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html). Veja [Gates e Loops](/concepts/gates-loops.html).

---

## Resultado final

```
docs/specs/features/catalogo-filtros/v1/
├── pre-refinement.md ← origem (discovery)
├── intent.md ← INTENT aprovada
├── tech-alignment.md ← decisões curtas (opcional)
├── scope.md ← SCOPE aprovado
├── task\_plan.md ← índice + dependências
├── tasks/
│ ├── T1.md ← FilterBar
│ ├── T2.md ← SortDropdown
│ ├── T3.md ← URL sync
│ └── T4.md ← E2E tests
├── .qa\_context.md ← denso (gerado no Passo 0)
├── qa-observations.md ← (vazio se nenhuma escalação)
└── minispec\_state.yaml ← estado final
```

**Código stage**: pronto para commit (`git status` mostra arquivos staged).

**Custo estimado**: ~400-500k tokens (com otimizações qa\_context, consolidação por camada e sumário inline do executor).

---

## Passo 7 — Cleanup de débitos (opcional)

Se a execução acumulou débitos `MEDIO`/`BAIXO` em `qa-observations.md` (categorias `code_review_only` — `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`), rode:

```bash
/agent-spec-debt-resolution docs/specs/features/catalogo-filtros/v1/
```

A skill:

1. Lê os débitos anotados.
2. Pergunta qual especialista da stack você quer (Go/Flutter/JS/etc. — descoberta interativa).
3. Especialista classifica cada débito como `recomendado_corrigir` ou `perfumaria`.
4. Você escolhe interativamente quais incluir.
5. Gera `docs/specs/features/catalogo-filtros/v2-debits/` com tasks de cleanup (`gates: [qa]`).

Executar o cleanup:

```bash
/agent-spec-minispec-run-tasks docs/specs/features/catalogo-filtros/v2-debits/task\_plan.md 
```

Pule este passo se `qa-observations.md` está vazio ou se você prefere acumular débitos para um sprint de cleanup futuro. Detalhes em [agent-spec-debt-resolution](/skills/shared/debt-resolution.html).

---

## E se for uma feature ainda maior?

Para features com 4+ User Stories, multi-persona ou ADRs novas, use [SDD](/frameworks/sdd.html). O fluxo é análogo, com mais etapas:

```
/agent-spec-pre-refinement → /agent-spec-sdd-generate-prd → /agent-spec-generate-tech-alignment (opcional)
→ /agent-spec-sdd-generate-tech-spec → /agent-spec-sdd-generate-task-plan → /agent-spec-sdd-run-tasks
```

---

## Próximos passos

* [SDD — feature grande](/frameworks/sdd.html)
* [Gates e Loops](/concepts/gates-loops.html) — pipeline de validação detalhado.
* [Model Selection](/advanced/model-selection.html) — frontmatter de tasks.
* [Pipeline — agent-spec-minispec-run-tasks](/pipeline/minispec-run-tasks.html) — operacional do orquestrador.
* [agent-spec-debt-resolution](/skills/shared/debt-resolution.html) — cleanup de débitos pós-execução.
