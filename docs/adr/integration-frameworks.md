---
id: "integration-frameworks"
title: "Integração com Frameworks"
sidebar_position: 4
---
# Integração de ADRs com SDD/miniSpec

ADRs **alimentam** e **são alimentadas por** SDD/miniSpec automaticamente. Esta página detalha o fluxo de integração entre ADRs e os frameworks de geração.

---

## Skills geradoras que detectam candidatos a ADR

Por design embutido, estas skills aplicam heurísticas de detecção durante a geração:

| Skill | Detecta candidato em |
| --- | --- |
| [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) | Geração do `tech_spec.md` (decisões técnicas transversais) |
| [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) | Geração do `scope.md` (decisões de implementação transversais) |

Quando essas skills rodam:

1. **Lêem** `docs/adr/INDEX.md` (`adr.index_file`).
2. **Identificam** ADRs relevantes à área da feature.
3. **Incluem** seção `## ADRs referenced` no artefato gerado.
4. **Detectam candidatos a ADR nova** na decisão em curso.

---

## Heurísticas de detecção

Uma decisão é candidata a ADR nova se **TODAS** as 3 são verdadeiras:

| Critério | Pergunta | OK se |
| --- | --- | --- |
| `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? | SIM |
| `tag_alvo` | Cai em uma das 14 [tags canônicas](/adr/overview.html#tags-canônicas-lista-fechada)? | SIM |
| `custo_reversao` | Reverter implica refactor significativo (≥ médio) em múltiplos lugares? | SIM |

Se detectado:

1. Skill **pausa** e apresenta candidato ao usuário.
2. Se aceito → **sugere rodar [agent-spec-adr-create](/skills/adr/adr-create.html)** antes de continuar o fluxo.
3. Se recusado → registra como decisão feature-específica no tech\_spec/scope **sem** criar ADR.

---

## Seção "ADRs referenced" nos artefatos

### Em `tech_spec.md` (SDD)

```markdown
## ADRs referenced
| ADR | Título | Como aplica nesta feature |
|-----|--------|---------------------------|
| ADR-0001 | Repository + Service | Handler → Service → Repository em `internal/pings/` |
| ADR-0004 | HTTP client compartilhado | Envia eventos via `pkg/http` com retry padrão |
```

### Em `scope.md` (miniSpec)

```markdown
## ADRs referenced
- ADR-0001 (accepted) — aplica o padrão Repository+Service
- ADR-0003 (accepted) — valida inputs com Zod
```

---

## `Applied in` na própria ADR

A ADR mantém lista de features que a usaram:

```markdown
## Applied in
- /docs/specs/features/backend-figurinhas-copa/v1/ (SDD)
- /docs/specs/features/auth-oauth2/v1/ (SDD)
- /docs/specs/features/catalogo-filtros/v1/ (miniSpec)
- internal/api/middleware/ratelimit.go (módulo)
```
> **Atualização**: hoje a atualização do `Applied in` é manual (durante criação ou ao rodar [agent-spec-adr-create](/skills/adr/adr-create.html)). [agent-spec-adr-review](/skills/adr/adr-review.html) detecta inconsistências bidirecionais (feature → ADR vs ADR → feature).

---

## Validação no Gate 2 (Tech Review)

Durante a execução de tasks ([agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html), [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html), [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html)), o **Gate 2** ([agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html)):

1. **Sempre** lê `docs/adr/INDEX.md` no início da revisão.
2. **Aprofunda** em ADRs específicas quando a task toca a área (ex.: task em HTTP client → lê ADR-0004).
3. **Classifica violações**:

| Violação | Severidade |
| --- | --- |
| Violação clara e não justificada de ADR aceita | `critical`, `category: adr_compliance` |
| Desvio parcial sem justificativa | `high` |
| ADR desatualizada face ao código (ADR diverge da realidade) | `medium` + sugestão de [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) |

> Cada execução de Gate 2 emite `adrs_consultadas[]` no JSON — auditável quais ADRs foram consideradas.

---

## Workflow recomendado

### Projeto novo

1. **Comece sem ADRs**. Crie a primeira feature em SDD/miniSpec.
2. Na geração do `tech_spec.md` / `scope.md`, a skill detecta candidatos (padrões arquiteturais novos).
3. Rode [agent-spec-adr-create](/skills/adr/adr-create.html) para cada candidato aceito.
4. Features subsequentes **reusam** ADRs existentes.

### Projeto existente

1. Rode [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) para capturar decisões **já tomadas** como ADRs retroativas.
2. Revise e aceite as propostas (uma a uma).
3. Continue com `/agent-spec-pre-refinement` + SDD/miniSpec normalmente.

### Refatoração arquitetural

1. Crie nova ADR via [agent-spec-adr-create](/skills/adr/adr-create.html) descrevendo a nova direção.
2. Use [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) na ADR antiga → aponta para a nova.
3. Features futuras usam a nova; código legado continua referenciando a OLD com aviso (estado `superseded-by:NNNN` ainda é referenciável).
4. Migre features manualmente — [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) emite relatório das features afetadas.

---

## Auditoria de bidirecionalidade

[agent-spec-adr-review](/skills/adr/adr-review.html) verifica:

* ADRs referenciadas em features **existem** em `docs/adr/`.
* Features listadas em `Applied in` de uma ADR **têm referência** no seu `tech_spec.md` / `scope.md`.
* Tags fora da lista canônica.
* Status inválidos.
* Divergência entre arquivos ADR e linhas no `INDEX.md`.

Inconsistências viram observações no relatório (read-only — não modifica nada).

---

## Próximos passos

* [ADR — Visão Geral](/adr/overview.html) — quando criar ADR.
* [Lifecycle](/adr/lifecycle.html) — estados e transições.
* [Template Nygard](/adr/template-nygard.html) — estrutura canônica.
* [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) — popular corpus inicial.
* [agent-spec-adr-create](/skills/adr/adr-create.html) — criar ADR nova.
* [agent-spec-staff-architecture-review (Gate 2)](/agents/staff-architecture-review-agent.html) — agente que valida conformidade durante execução.
