---
id: "minispec"
title: "miniSpec"
sidebar_position: 4
---
# miniSpec

`miniSpec`

Caminho intermediário. **Intent + (Tech Direction opcional) + Scope + Tasks**. Para features médias com 1-3 User Stories, módulo existente, sem ADR nova.

> 🗺️ **[Fluxograma completo do miniSpec](fluxogramas/minispec.md)** — ecossistema visual com o fluxo principal e todos os alternativos (reprovações nos gates, loops de correção, débito).

---

## Por que miniSpec existe

Entre TaskCard (1 task atômica) e SDD (feature grande, multi-persona), há um espaço enorme: **features com 1-3 US, uma persona, decisões técnicas claras mas que precisam decomposição em tasks**.

A miniSpec cobre esse espaço sem o overhead do PRD, Tech Spec formal e ADRs do SDD. Mantém:

* **Rastreabilidade**: Intent → Scope → Tasks → CTs.
* **Gates ativos**: cada task passa por QA + Tech Review.
* **Anti-fragmentação**: regras de decomposição evitam tasks atômicas demais.

E elimina:

* PRD pesado (Intent é mais leve).
* Tech Spec longo com 16 seções (Scope é direto).
* ADRs novas (assume reuso de padrões existentes).

---

## Quando usar

* **1-3 User Stories** distintas.
* Envolve **produto ou design** (revisão de UX).
* **Incremento em módulo existente** (não greenfield).
* **Sem decisão arquitetural nova** que vire ADR.

**Exemplos**:

* "Adicionar filtros e ordenação no catálogo".
* "Implementar password reset".
* "Adicionar export CSV nos relatórios".

## Quando **não** usar

* Task isolada com 1-3 arquivos → use [TaskCard](taskcard.md).
* ≥ 4 US, multi-persona, ADR nova, greenfield → use [SDD](sdd.md).
* Spike/aprendizado → use [Conversa direta](conversa-direta.md).

---

## Variantes do Scope

A skill [agent-spec-minispec-generate-scope](../skills/minispec/minispec-generate-scope.md) detecta automaticamente (ou confirma com o usuário) a frente do projeto e seleciona um template especializado:

| Variante | Template | Seções-chave |
| --- | --- | --- |
| **Web** | `scope_template_web.md` | Páginas/Componentes, Estado (Redux/Zustand/Context/Signals), Integração com APIs, i18n/a11y, Feature Flags |
| **Mobile** | `scope_template_mobile.md` | Telas/Componentes, Estado (BLoC/Riverpod/Provider), Hardware (câmera/GPS/biometria/NFC), Offline-first |
| **Backend** | `scope_template_backend.md` | Endpoints/Rotas, Banco de Dados (tabelas + migrações), Services/Regras de Negócio, Integrações Externas, Observabilidade |

A variante é escolhida na **FASE 0.0** da skill, gravada em `minispec_state.yaml` e no cabeçalho do SCOPE. Veja [Variantes do Scope — referência completa](../reference/scope-variants.md).

---

## Skills do framework

```
[discovery opcional]
   │
   ▼
agent-spec-minispec-generate-intent
   │
   ▼ (intent.md aprovado)
[agent-spec-generate-tech-alignment — opcional]
   │
   ▼ (tech-alignment salvo ou pulado)
agent-spec-minispec-generate-scope
   │
   ▼ (scope.md aprovado)
agent-spec-minispec-generate-tasks (delega §5 consolidado por camada ao agent-spec-qa-test-generator)
   │
   ▼ (task_plan.md + tasks/T*.md aprovados)
agent-spec-minispec-run-tasks (executor + Gate 1 QA + Gate 2 Tech Review)
```

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-minispec-generate-intent](../skills/minispec/minispec-generate-intent.md) | Intent (O QUE / POR QUÊ) | Generator |
| [agent-spec-generate-tech-alignment](../skills/shared/generate-tech-alignment.md) | Tech Alignment direto (compartilhado SDD/miniSpec) | Expert |
| [agent-spec-minispec-generate-scope](../skills/minispec/minispec-generate-scope.md) | Scope (COMO) | Generator |
| [agent-spec-minispec-generate-tasks](../skills/minispec/minispec-generate-tasks.md) | Task Plan + tasks individuais | Generator |
| [agent-spec-minispec-run-tasks](../skills/minispec/minispec-run-tasks.md) | Execução com gates | Orchestrator |

> **Tech Alignment é opcional**: gera um documento curto com decisões técnicas que o usuário já tem na cabeça (REST vs GraphQL, stack, padrões). Pule esta etapa se a feature for trivial e nenhuma decisão precisa ser registrada.

---

## Artefatos gerados

```
docs/specs/features/<feature>/v1/
├── intent.md                   # O QUE / POR QUÊ
├── tech-alignment.md           # decisões técnicas curtas (opcional)
├── scope.md                    # COMO
├── task_plan.md                # índice (fases + tabela)
├── tasks/
│   ├── T1.md
│   ├── T2.md
│   └── ... TN.md
├── .qa_context.md              # extraído proativamente
└── minispec_state.yaml         # estado do pipeline
```

Paths resolvidos via [framework-paths.md](../configuration/framework-paths.md). Veja [Path Templates](../configuration/path-templates.md).

---

## Pipeline (fluxo completo)

```
1. /agent-spec-pre-refinement (opcional)                  → pre-refinement.md (recomenda miniSpec)
2. /agent-spec-minispec-generate-intent                   → intent.md
3. /agent-spec-generate-tech-alignment                    → tech-alignment.md (opcional)
4. /agent-spec-minispec-generate-scope                    → detecta variante (FASE 0.0: Web|Mobile|Backend) → scope.md
5. /agent-spec-minispec-generate-tasks                     → task_plan.md + tasks/ + .qa_context.md
6. /agent-spec-minispec-run-tasks <task_plan> <agent>     → executa com gates
7. /agent-spec-debt-resolution <feature_path> [agent]     → OPCIONAL — gera v{N+1}-debits/ com cleanup
8. /agent-spec-minispec-run-tasks v{N+1}-debits/...       → executa cleanup
```

Aprovação humana **mandatória entre cada etapa**. Claude não avança sem aprovação.

### Pós-execução: cleanup de débitos (opcional)

Após o passo 6, `qa-observations.md` da v{N} pode conter débitos `MEDIO`/`BAIXO` em categorias `code_review_only` que passaram pelos gates pela política débito-controlado. A skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) consome esses débitos:

* Lê `qa-observations.md` da v{N}.
* Pergunta o especialista da stack (Go/Flutter/JS/etc.) via descoberta interativa.
* Especialista classifica cada débito como `recomendado_corrigir` ou `perfumaria`.
* Usuário escolhe interativamente quais incluir.
* Gera `docs/specs/features/<feature>/v{N+1}-debits/` com `intent.md` + `scope.md` + `task_plan.md` + `tasks/T{n}.md` (frontmatter `gates: [qa]` — cleanup é `code_review_only`).
* Executar com `/agent-spec-minispec-run-tasks v{N+1}-debits/task_plan.md`.

A versão `v{N+1}-debits/` é uma **versão técnica de cleanup**, não funcional — coexiste com a próxima `v{N+1}/` funcional sem conflito.

---

## Frontmatter de cada task

```markdown
- model: sonnet                # ou opus se crítico
- risk: low                    # low | medium | high
- gates: [qa, tech_review]     # default
```

Detalhes em [Model Selection](../advanced/model-selection.md) e [Fast-path Gates](../advanced/fast-path-gates.md).

---

## Gates ativos

Idêntico ao [SDD](sdd.md) e [TaskCard](taskcard.md):

* **Gate 1**: [agent-spec-qa-validator](../agents/qa-validator.md).
* **Gate 2**: [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md).
* Loop de correção até 3 tentativas com auto-escalação sonnet→opus.
* Política débito-controlado (críticos/altos rejeitam; médios/baixos viram débito anotado em `qa-observations.md`, recolhido por `/agent-spec-debt-resolution`).

Detalhes em [Gates e Loops](../concepts/gates-loops.md). Operacional em [Pipeline — agent-spec-minispec-run-tasks](../pipeline/minispec-run-tasks.md).

---

## Custo típico

| Fase | Tokens |
| --- | --- |
| Intent | ~30-50k |
| Tech Alignment (opcional) | ~10-20k |
| Scope | ~50-80k |
| Task Plan + tasks | ~80-120k |
| Execução (4 tasks, caminho de sucesso) | ~200-300k |
| **Total** | **~400-600k** |

Com otimizações (qa_context, consolidação por camada), pode cair para ~250-400k.

---

## Customização via framework-paths.md

Edite `.claude/rules/framework-paths.md` para:

* Mover artefatos miniSpec (`minispec.intent.path`, `minispec.scope.path`, etc.).
* Customizar paths de testes / qa_context.

Veja [Path Templates](../configuration/path-templates.md).

---

## Exemplo

```bash
# 1. Discovery
/agent-spec-pre-refinement "filtros e ordenação no catálogo de produtos"

# 2. Intent
/agent-spec-minispec-generate-intent "adicionar filtros e ordenação no catálogo"

# 3. Tech Alignment (opcional)
/agent-spec-generate-tech-alignment docs/specs/features/catalogo-filtros/v1/intent.md \
  "REST padrão existente, filtros via query params, sem persistência por usuário"

# 4. Scope
/agent-spec-minispec-generate-scope docs/specs/features/catalogo-filtros/v1/intent.md

# 5. Tasks
/agent-spec-minispec-generate-tasks docs/specs/features/catalogo-filtros/v1/intent.md \
                          docs/specs/features/catalogo-filtros/v1/scope.md

# 6. Execução
/agent-spec-minispec-run-tasks docs/specs/features/catalogo-filtros/v1/task_plan.md <seu-executor>
```

---

## Próximos passos

* [Pipeline — agent-spec-minispec-run-tasks](../pipeline/minispec-run-tasks.md) — execução operacional.
* [TaskCard](taskcard.md) — alternativa para escopo menor.
* [SDD](sdd.md) — alternativa formal para escopo maior.
* [Strategy Selector](../discovery/strategy-selector.md) — checklist de decisão.
* [Gates e Loops](../concepts/gates-loops.md) — pipeline de validação.
* [agent-spec-debt-resolution](../skills/shared/debt-resolution.md) — pós-execução opcional para cleanup de débitos.
