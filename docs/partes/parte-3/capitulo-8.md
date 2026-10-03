---
title: "Capítulo 8 — SDD: quando a feature é complexa"
description: "O caminho completo — PRD, tech_spec, ADRs e task_plan para features de alto custo de retrabalho."
---
# Capítulo 8 — SDD: quando a feature é complexa

SDD (Spec-Driven Development) é o caminho mais pesado — e o que mais paga quando a feature é grande.

**Quando usar**: ≥ 4 user stories (US), decisões arquiteturais relevantes (candidatas a ADR), refactor cross-módulo, alto custo de retrabalho.

**Quando NÃO usar**: features menores. O SDD custa ~1.5M tokens em discovery + geração. Para 1-3 US, o miniSpec entrega o mesmo valor por ~500-800k.

## Anatomia

```text
docs/specs/features///
├── prd.md (US + CAs + personas + KPIs)
├── tech\_spec.md (arquitetura + ADRs + Estratégia de Testes)
├── task\_plan.md (decomposição + fases + paralelismo)
├── tasks/T1.md … (§4 Aceite Técnico, §5 Arquivos Impactados)
├── .qa\_context.md (resumo denso para os gates)
├── qa-observations.md
└── sdd\_state.yaml
```

## Pipeline

```mermaid
flowchart TD
PR["/agent-spec-pre-refinement (opcional)"] --> PRD["/agent-spec-sdd-generate-prd"]
PRD --> TA["/agent-spec-generate-tech-alignment (opcional)"]
TA --> TS["/agent-spec-sdd-generate-tech-spec"]
TS --> C["/agent-spec-challenge-spec (opcional)"]
C --> TP["/agent-spec-sdd-generate-task-plan"]
TP --> RUN["/agent-spec-sdd-run-tasks"]
RUN --> D(["tasks staged"])
classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
class PR,PRD,TA,TS,C,TP,RUN phase
class D done
```

## O `.qa_context.md` — resumo denso

::: info 📝 Nota
Os gates rodam \*\*uma vez por task\*\*. Sem o `.qa\_context.md`, cada invocação releria o `tech\_spec.md` inteiro. O resumo denso — convenções, decisões arquiteturais, padrões obrigatórios, paths críticos — faz o gate consumir ~5-10x menos tokens em discovery, mantendo a fonte canônica disponível para detalhe sob demanda (lazy). É o princípio do \*\*contexto mínimo\*\* aplicado aos gates.
:::

## 📚 Aprofundamento na Referência

* **[SDD (framework)](/frameworks/sdd.html)** — anatomia completa e estado.
* **[`/agent-spec-sdd-generate-prd`](/skills/sdd/sdd-generate-prd.html)** · **[`-generate-tech-spec`](/skills/sdd/sdd-generate-tech-spec.html)** · **[`-generate-task-plan`](/skills/sdd/sdd-generate-task-plan.html)** — a cadeia geradora.
* **[qa\_context pré-extraído](/advanced/qa-context.html)** — a otimização de contexto dos gates.
