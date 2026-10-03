---
id: "sdd"
title: "SDD"
sidebar_position: 5
---
# SDD — Software Design Document

`SDD`

Caminho mais formal. **PRD + (Tech Alignment opcional) + Tech Spec + Task Plan + Tasks**. Para features grandes, multi-persona, greenfield ou que envolvem decisões arquiteturais novas (ADRs).

> 🗺️ **[Fluxograma completo do SDD](fluxogramas/sdd.md)** — ecossistema visual com o fluxo principal e todos os alternativos (reprovações nos gates, loops de correção, débito).

---

## Por que o SDD existe

Os dois caminhos mais leves ([TaskCard](taskcard.md) e [miniSpec](minispec.md)) assumem:

* **Poucas User Stories** (1-3).
* **Uma ou duas personas** (dev + talvez produto).
* **Nenhuma decisão arquitetural nova**.
* **Módulo já existe** e a feature é incremento/bugfix.

Quando qualquer uma dessas premissas quebra — feature com 4+ US, múltiplas personas, greenfield, integração com sistemas externos, compliance, decisão de padrão que vai reverberar — o SDD entrega:

1. **PRD formal** que alinha produto, design, engenharia, QA, compliance **antes** de qualquer código.
2. **Tech Alignment** (opcional, via [agent-spec-generate-tech-alignment](../skills/shared/generate-tech-alignment.md)) — documento curto de decisões técnicas de alto nível.
3. **Tech Spec denso** com diagramas, contratos de API, schemas, fluxos técnicos **e Estratégia de Testes** mapeada a cada CA.
4. **Task Plan** com fases, dependências explícitas, paralelização marcada, rastreabilidade US → Task.
5. **Rastreabilidade de casos de teste** — cada CT aparece em no máximo 1 task (dedup).
6. **Detecção automática de candidatos a ADR** durante geração do Tech Spec.

> **Filosofia**: o SDD é o caminho **mais caro e mais seguro**. Use quando o risco de errar produto/arquitetura supera o custo de gerar a spec. O [Strategy Selector](../discovery/strategy-selector.md) evita que features pequenas caiam aqui por engano.

### Quando **não** usar

* **Task isolada com 1-3 arquivos** → [TaskCard](taskcard.md).
* **1-3 User Stories em módulo existente** → [miniSpec](minispec.md).
* **Ideia vaga, ainda não validada** → `/agent-spec-pre-refinement` primeiro.

### Simplificação para miniSpec no meio do caminho

Se no final da geração do PRD perceber que:

* Tem só 2 User Stories.
* Apenas 1 persona (dev).
* Nenhuma decisão arquitetural nova.

→ **Pare**. Considere migrar para miniSpec editando o `pre-refinement.md` e re-rodando o discovery.

---

## Quando usar

Veja [Strategy Selector](../discovery/strategy-selector.md). Qualquer dos gatilhos:

* **S1 ≥ 4** User Stories.
* **S2 = múltiplas personas** afetadas (dev + produto + design + QA + compliance).
* **S6 = sim** — decisão arquitetural nova.
* **S3 = greenfield** (módulo novo do zero).

Exemplos: *"novo módulo de pagamentos"*, *"multi-tenant"*, *"backend novo do zero"*, *"integração com banking as a service"*.

---

## Variantes do Tech Spec

A skill [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) detecta automaticamente (ou confirma com o usuário) a frente do projeto e seleciona um template especializado:

| Variante | Template | Seções | Aspectos exclusivos |
| --- | --- | --- | --- |
| **Web** | `tech_spec_template_web.md` | 21 | Core Web Vitals, bundle size, i18n, a11y WCAG, XSS/CSRF, gestão de estado (Redux/Zustand/Context) |
| **Mobile** | `tech_spec_template_mobile.md` | 22 | BLoC/Riverpod, offline-first, hardware (câmera/GPS/biometria), cold start, jailbreak detection |
| **Backend** | `tech_spec_template_backend.md` | 23 | Endpoints, tabelas+migrações, eventos/filas, rate limiting, observabilidade (logs/métricas/tracing) |

A variante é escolhida na **FASE 0** da skill, gravada em `sdd_state.yaml` e na seção 1 do TECH_SPEC. Veja [Variantes do Tech Spec — referência completa](../reference/tech-spec-variants.md).

---

## Skills do framework

```
[discovery opcional]
   │
   ▼
agent-spec-sdd-generate-prd
   │
   ▼ (prd.md aprovado)
[agent-spec-generate-tech-alignment — opcional]
   │
   ▼ (tech-alignment.md salvo ou pulado)
agent-spec-sdd-generate-tech-spec
   ├── FASE 0: detecta variante (Web | Mobile | Backend)
   ├── delega a Estratégia de Testes ao agent-spec-qa-test-generator
   └── detecta candidatos a ADR
   │
   ▼ (tech_spec.md aprovado)
agent-spec-sdd-generate-task-plan (gera task_plan.md + tasks/T*.md + .qa_context.md proativo)
   │
   ▼ (task_plan + tasks aprovados)
agent-spec-sdd-run-tasks (executor + Gate 1 QA + Gate 2 Tech Review)
```

| Skill | Etapa | Tipo |
| --- | --- | --- |
| [agent-spec-sdd-generate-prd](../skills/sdd/sdd-generate-prd.md) | PRD (O QUE / POR QUÊ) — Product Manager | Generator |
| [agent-spec-generate-tech-alignment](../skills/shared/generate-tech-alignment.md) | Tech Alignment (opcional, compartilhado SDD/miniSpec) | Expert |
| [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) | Tech Spec — Staff Engineer; delega a Estratégia de Testes | Generator |
| [agent-spec-sdd-generate-task-plan](../skills/sdd/sdd-generate-task-plan.md) | Task Plan + tasks; gera qa_context proativo; redistribuição heurística | Generator |
| [agent-spec-sdd-run-tasks](../skills/sdd/sdd-run-tasks.md) | Execução com gates QA + Tech Review | Orchestrator |

---

## Requisitos mínimos

| Requisito | Obrigatório? | Observação |
| --- | --- | --- |
| Claude Code instalado e autenticado | Sim | Skills vivem em `.claude/skills/` |
| **Repositório git** com commit baseline | Sim | Capturado por `base_sha` em [agent-spec-sdd-run-tasks](../skills/sdd/sdd-run-tasks.md) |
| **`.claude/rules/agent-spec-*.md`** presentes | Sim | Conjunto de rules globais com paths canônicos e convenções (carregadas no system-prompt) |
| **Agente executor da stack** | Sim | `.claude/agents/<nome>.md` registrado pelo usuário (ex.: `node-task-developer`, `python-task-developer`) — veja [Custom Executor](../customization/custom-executor.md) |
| **Comando de teste canônico** | Sim | Detectado via manifest (`go.mod`, `package.json`, etc.) |
| **`docs/adr/INDEX.md`** populado | Recomendado | [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) consulta para reaproveitar padrões |

---

## Artefatos gerados

```
docs/specs/features/<feature>/v1/
├── prd.md                      # PRD: US, CA, KPIs, personas
├── tech-alignment.md           # decisões técnicas curtas (opcional)
├── tech_spec.md                # Tech Spec com Estratégia de Testes
├── task_plan.md                # plano com fases, dependências, rastreabilidade
├── tasks/
│   ├── T1.md
│   ├── T2.md
│   └── ... TN.md
├── .qa_context.md              # extraído proativamente (Passo 0)
└── sdd_state.yaml              # estado do pipeline
```

Paths resolvidos via [framework-paths.md](../configuration/framework-paths.md). Veja [Path Templates](../configuration/path-templates.md).

---

## Pipeline (fluxo completo)

```
1. /agent-spec-pre-refinement (opcional)                  → pre-refinement.md (recomenda SDD)
2. /agent-spec-sdd-generate-prd                           → prd.md + sdd_state.yaml
3. /agent-spec-generate-tech-alignment          → tech-alignment.md (opcional)
4. /agent-spec-sdd-generate-tech-spec                     → detecta variante (FASE 0: Web|Mobile|Backend) → tech_spec.md (com a Estratégia de Testes e ADRs)
5. /agent-spec-sdd-generate-task-plan                     → task_plan.md + tasks/ + .qa_context.md
6. /agent-spec-sdd-run-tasks <task_plan> <agent>         → executa cada task com gates
7. /agent-spec-debt-resolution <feature_path> [agent]   → OPCIONAL — gera v{N+1}-debits/ com cleanup
8. /agent-spec-minispec-run-tasks v{N+1}-debits/...     → executa cleanup
```

Aprovação humana **mandatória entre cada etapa**. Claude não avança para tech_spec antes que você aprove o PRD.

### Pós-execução: cleanup de débitos (opcional)

Após o passo 6, `qa-observations.md` da v{N} pode conter débitos `MEDIO`/`BAIXO` em categorias `code_review_only` que passaram pelos gates pela política débito-controlado. A skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) consome esses débitos:

* Lê `qa-observations.md` da v{N}.
* Pergunta o especialista da stack (Go/Flutter/JS/etc.) via descoberta interativa.
* Especialista classifica cada débito como `recomendado_corrigir` ou `perfumaria`.
* Usuário escolhe interativamente quais incluir.
* Gera `docs/specs/features/<feature>/v{N+1}-debits/` com `intent.md` + `scope.md` + `task_plan.md` + `tasks/T{n}.md` (`gates: [qa]`).
* Executar com `/agent-spec-minispec-run-tasks v{N+1}-debits/task_plan.md` (a versão de débitos usa o pipeline miniSpec mesmo vindo de SDD — cleanup é trivial e não precisa de PRD/TechSpec).

> **Por que usa `/agent-spec-minispec-run-tasks` em vez de `/agent-spec-sdd-run-tasks`**: a versão de débitos é tecnicamente um conjunto de tasks atômicas de cleanup, sem PRD/TechSpec próprios. O orquestrador miniSpec é suficiente e mais leve.

---

## Frontmatter de cada task

```markdown
- model: sonnet                # ou opus se crítico (auto-detect via critical_paths)
- risk: low                    # low | medium | high
- gates: [qa, tech_review]     # default
```

Detalhes em [Model Selection](../advanced/model-selection.md) e [Fast-path Gates](../advanced/fast-path-gates.md).

---

## Gates ativos

Idêntico aos demais frameworks:

* **Gate 1**: [agent-spec-qa-validator](../agents/qa-validator.md).
* **Gate 2**: [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md).
* Loop de correção até 3 tentativas com auto-escalação sonnet→opus.
* Política débito-controlado (críticos/altos rejeitam; médios/baixos viram débito anotado em `qa-observations.md`, recolhido por `/agent-spec-debt-resolution`).

Detalhes em [Gates e Loops](../concepts/gates-loops.md). Operacional em [Pipeline — agent-spec-sdd-run-tasks](../pipeline/sdd-run-tasks.md).

---

## Otimizações críticas (Task Plan)

| Otimização | Detalhe | Economia |
| --- | --- | --- |
| **qa_context proativo (Passo 0)** | Extrai `~1.5k tokens` densos do tech_spec; subagentes leem este em vez do tech_spec completo | `~8k × N` subagentes |
| **Redistribuição heurística** | Se a Estratégia de Testes já tem ≥10 CTs, distribui CTs por task via match componente↔task — evita invocar agent-spec-qa-test-generator | 70-90% das invocações |
| **Consolidação por camada** | Quando precisa invocar agent-spec-qa-test-generator, agrupa por camada (infra/domínio/integração/e2e+packaging) | N → 4 invocações |
| **Sumário inline do executor** | `base_sha` + 4-6 linhas passam inline no prompt do Gate 1 e Gate 2 (sem arquivo intermediário) | ~300-800 tokens × 2 gates por task vs versão anterior com arquivo |
| **Tech Review reusa `files_reviewed` do QA** | Gate 2 não relê arquivos cobertos pelo Gate 1 (salvo `critical_paths`) | ~5-10k por task |

Detalhes:

* [qa_context pré-extraído](../advanced/qa-context.md)
* [QA Consolidation](../advanced/qa-consolidation.md)
* [Skip QA quando a Estratégia de Testes completa](../advanced/skip-qa-section14.md)
* [Memória Proativa](../advanced/proactive-memory.md)

---

## Detecção de candidatos a ADR

Durante a geração do `tech_spec.md`, [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) aplica 3 heurísticas (TODAS verdadeiras):

| Critério | Pergunta |
| --- | --- |
| `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? |
| `tag_alvo` | Cai em uma das 14 tags canônicas (`architecture`, `auth`, `security`, ...)? |
| `custo_reversao` | Reverter implica refactor significativo (≥ médio)? |

Se SIM em todos → propõe criar ADR via [agent-spec-adr-create](../skills/adr/adr-create.md) **antes** de continuar a geração do tech_spec.

ADR é referenciada em `## ADRs referenced` no `tech_spec.md`. O [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md) (Gate 2) valida conformidade durante execução — violação clara = `severity: critical`, `category: adr_compliance`.

Veja [ADR — Visão Geral](../adr/overview.md).

---

## Custo típico

| Fase | Tokens |
| --- | --- |
| PRD | ~150-200k |
| Tech Alignment (opcional) | ~10-30k |
| Tech Spec | ~200-300k |
| Task Plan (com otimizações) | ~100-200k |
| Execução (8 tasks, caminho de sucesso) | ~400-600k |
| **Total** | **~1M-1.5M** |

Com **todas** as otimizações aplicadas (qa_context proativo, consolidação por camada, skip QA quando a Estratégia de Testes completa, memória proativa, reuso de files_reviewed, auto-escalação sob demanda), pode cair para **~500-800k**.

---

## Customização via framework-paths.md

Edite `.claude/rules/framework-paths.md` para:

* Mover artefatos SDD (`sdd.prd.path`, `sdd.tech_spec.path`, etc.).
* Customizar paths de tasks / state / qa_context.

Veja [Path Templates](../configuration/path-templates.md).

### Critical paths embutidos em agent-spec-sdd-run-tasks

A skill `agent-spec-sdd-run-tasks` carrega lista ilustrativa de paths sensíveis (auth, security, crypto, migrations) que disparam escalação automática para Opus. Adapte conforme o layout do seu projeto.

Veja [Critical Paths](../configuration/critical-paths.md).

### Forçar modelo/gates por task

Edite manualmente `tasks/T{N}.md`:

```markdown
- model: opus
- gates: [qa]
```

O orquestrador respeita o que está no arquivo — override manual é prerrogativa humana.

### Executor customizado

Registre agentes em `.claude/agents/<nome>.md`. Invocado via `/agent-spec-sdd-run-tasks <task_plan> <agent_name>`. O framework não inclui executor pronto — veja [Custom Executor](../customization/custom-executor.md) para o template e exemplos por stack.

---

## Exemplo real

Feature `backend-figurinhas-copa/v1`:

* **PRD**: 14 US, 23 CA, 4 personas (dev, mobile, colecionador, moderador), 3 KPIs (taxa de troca, MAU, abandono de onboarding).
* **Tech Alignment**: REST + JWT, soft delete, retry com exponential backoff em PSP.
* **Tech Spec**: 35 componentes, 12 fluxos técnicos, a Estratégia de Testes com 30 CTs detalhados.
* **Detectados**: 2 candidatos a ADR (cache strategy, rate limit) — ambos criados antes de finalizar tech_spec.
* **Task Plan**: 8 tasks distribuídas em 3 fases, dependências explícitas, 2 tasks paralelizáveis.
* **Execução**: ~460k tokens (medição real antes de todas as otimizações; hoje seria ~350k).

---

## Próximos passos

* [Pipeline — agent-spec-sdd-run-tasks](../pipeline/sdd-run-tasks.md) — execução operacional.
* [miniSpec](minispec.md) — alternativa mais leve.
* [TaskCard](taskcard.md) — para tasks isoladas.
* [Strategy Selector](../discovery/strategy-selector.md) — checklist de decisão.
* [Gates e Loops](../concepts/gates-loops.md) — fluxo de QA + Tech Review.
* [ADR — Visão Geral](../adr/overview.md) — integração com decisões arquiteturais.
* [Model Selection](../advanced/model-selection.md) — resolução de `model`/`risk`/`gates`.
* [Path Templates](../configuration/path-templates.md) — todas as chaves de configuração.
* [agent-spec-debt-resolution](../skills/shared/debt-resolution.md) — pós-execução opcional para cleanup de débitos `MEDIO`/`BAIXO`.
