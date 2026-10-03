---
id: "spec-driven"
title: "Spec-Driven Development"
sidebar_position: 2
---
# Spec-Driven Development

> **Princípio central**: a spec precede o código. Sempre. O modelo só implementa o que está especificado, e a especificação é o artefato versionado que sobrevive entre sessões.

---

## O problema que resolve

Sem spec-driven, o ciclo típico com IA é:

```
"Faz X pra mim" → modelo gera código → "ah, esqueci, também precisa Y"
→ modelo regenera (perdeu contexto) → "agora quebrou Z"
→ modelo tenta consertar → débito técnico acumulado
```

Os 3 sintomas:

1. **Contexto evapora** entre sessões — o que foi decidido ontem não chega ao Claude amanhã.
2. **Escopo fugitivo** — sem critério explícito, o modelo decide o que é "suficiente".
3. **Qualidade inconsistente** — uma task crítica recebe o mesmo nível de revisão que um typo.

Spec-driven inverte: você produz **artefatos rastreáveis** (`prd.md`, `intent.md`, `taskcard.md`) que viram fonte de verdade, e a IA opera sobre eles.

---

## A separação em 3 camadas

```
┌─ Camada 1: GERAÇÃO de specs ─────────────────────────────┐
│ Skills \*-generate-\* produzem artefatos declarativos: │
│ PRD, Intent, Scope, Tech Spec, Task Plan, TaskCard │
│ • Artefato versionado em /docs/specs/features/ │
│ • Aprovação humana entre cada etapa │
└──────────────────────┬───────────────────────────────────┘
│
▼
┌─ Camada 2: EXECUÇÃO ──────────────────────────────────────┐
│ Skills \*-run-tasks orquestram implementação task a task: │
│ • Delegação ao executor (agent\_name da stack) │
│ • Sequencial respeitando dependências │
│ • Captura base\_sha por task │
└──────────────────────┬───────────────────────────────────┘
│
▼
┌─ Camada 3: VALIDAÇÃO ─────────────────────────────────────┐
│ Gates automáticos (agent-spec-qa-validator, tech-review): │
│ • Funcional + testes (Gate 1) │
│ • Arquitetural + ADRs (Gate 2) │
│ • Loop de correção débito-controlado até 3 tentativas │
└──────────────────────────────────────────────────────────┘
```

Cada camada tem **uma responsabilidade clara** e não invade a vizinha:

| Camada | Faz | NÃO faz |
| --- | --- | --- |
| Geração | Produz artefatos legíveis e versionados | Implementa código |
| Execução | Coordena executor por task | Valida qualidade |
| Validação | Aprova ou rejeita com critérios objetivos | Implementa correções |

---

## Por que rastreabilidade importa

Cada artefato linka para o anterior:

```
pre-refinement.md (FATO × HIPÓTESE × DÚVIDA)
│
▼ (entrada opcional)
PRD.md / intent.md / taskcard.md
│
▼ (se SDD ou miniSpec)
tech-alignment.md (decisões técnicas curtas)
│
▼
tech\_spec.md / scope.md
│
▼
task\_plan.md + tasks/T1.md, T2.md, ...
│
▼
[execução com gates]
```

Isso permite:

* **Voltar no tempo**: ler `task_plan.md` revela qual US originou a task.
* **Mudar de mente**: revisão de PRD propaga via `tech_spec` → `task_plan` regenerado.
* **Auditoria**: um problema em produção tem trilha até a US/CA que o originou.
* **Onboarding**: novo dev lê `pre-refinement.md` e entende o porquê em 5 minutos.

---

## Quem precisa especificar quanto?

A intensidade da especificação **não é fixa** — varia com a complexidade da feature. O framework oferece [4 caminhos](/concepts/four-paths.html):

| Caminho | Quando | Custo |
| --- | --- | --- |
| **Conversa direta** | Spike, exploração, aprendizado | ~zero artefato |
| **TaskCard** | Task isolada (1-3 arquivos) | 1 arquivo |
| **miniSpec** | Feature pequena/média (1-3 US, 1 persona) | Intent + Scope + Tasks |
| **SDD** | Feature grande, múltiplas personas, ADRs novas | PRD + Tech Spec + Task Plan + ADRs |

O [Strategy Selector](/discovery/strategy-selector.html) recomenda automaticamente o caminho a partir de 8 sinais.

---

## Princípios invioláveis

1. **Spec antes de código** — modelo não improvisa. Se a spec é ambígua, ele pergunta.
2. **Artefato versionado** — não há "memória do agente"; o que vale é o que está em `/docs/specs/features/`.
3. **Aprovação humana entre etapas** — Claude não avança para Tech Spec antes que você aprove o PRD.
4. **Contexto mínimo** — spec carrega só o que a IA precisa para a próxima etapa, nada mais (ver [Contexto Mínimo](/concepts/minimum-context.html)).
5. **Gates automáticos** — toda task implementada passa por QA + Tech Review.
6. **Débito-controlado** — críticos/altos sempre disparam correção; médios/baixos viram débito anotado em `qa-observations.md` (cleanup futuro via `/agent-spec-debt-resolution`). Veja [Gates e Loops](/concepts/gates-loops.html).

---

## Diferença para "AI assistant solta"

| Aspecto | AI solta | Spec-driven (framework) |
| --- | --- | --- |
| Ponto de partida | Pergunta livre | Artefato versionado |
| Memória entre sessões | Nenhuma (você re-explica) | `/docs/specs/features/` carrega contexto |
| Critério de aceite | Implícito | Explícito (CA-01, CA-02, ...) |
| Validação | Manual ad-hoc | Gates automáticos com JSON de saída |
| Rastreabilidade | Histórico de chat | Artefato + commits + qa-observations |
| Ajuste de escopo | "ah, não era isso" | Editar PRD → regenerar tech\_spec |

---

## Próximos passos

* [4 Caminhos](/concepts/four-paths.html) — escolher entre Conversa, TaskCard, miniSpec, SDD.
* [Contexto Mínimo](/concepts/minimum-context.html) — princípio de economia de tokens.
* [Gates e Loops](/concepts/gates-loops.html) — como a Camada 3 valida cada task.
* [Discovery](/discovery/overview.html) — ponto de entrada universal antes de escolher caminho.
