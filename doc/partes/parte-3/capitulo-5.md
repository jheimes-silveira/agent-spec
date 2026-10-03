---
title: "Capítulo 5 — Como escolher o caminho"
description: "Os quatro caminhos do agent-spec e o Strategy Selector que recomenda o peso certo para cada feature."
---
# Capítulo 5 — Como escolher o caminho

Nem toda mudança merece o mesmo cerimonial. Trocar a cor de um botão e construir um subsistema de pagamentos são problemas de pesos completamente diferentes — e o erro mais caro do framework é tratar os dois igual. O `agent-spec` oferece **quatro caminhos** e uma checklist objetiva para escolher entre eles.

## Os quatro caminhos

| Caminho | Artefato gerador | Quando |
| --- | --- | --- |
| **Conversa direta** | Nenhum — Claude conversa, edita, propõe | Spike, exploração, prototipagem. Sem gates, sem versionamento. |
| **TaskCard** | `taskcard.md` (1 task única) | Mudança pontual e isolada (bug fix, ajuste de UI, refactor de 1 arquivo). |
| **miniSpec** | `intent.md` + `scope.md` + `tasks/T{n}.md` | Feature de 1-3 user stories (US), risco baixo a médio. |
| **SDD** | `prd.md` + `tech_spec.md` + ADRs + `task_plan.md` + tasks | Feature complexa, multi-US, alto custo de retrabalho. |

Cada caminho tem um custo típico em tokens muito diferente — de quase zero (conversa) a ~1.5M (SDD em discovery + geração). Escolher o caminho é, no fundo, calibrar quanto cerimonial a mudança paga de volta.

Conversa direta

💰

~0 cerimonial

TaskCard

💰

1 task

miniSpec

💰💰

1-3 US

SDD

💰💰💰

multi-US + ADRs

## O Strategy Selector

A skill `/agent-spec-pre-refinement` aplica um **Strategy Selector** — uma checklist objetiva de **8 sinais (S1–S8)**: número de user stories, presença de decisão arquitetural nova, risco, acoplamento cross-módulo, entre outros. Em vez de deixar a escolha no feeling, o selector lê os sinais e **recomenda** o caminho.

::: warning ⚠️ Armadilha comum
Começar como TaskCard "porque parece simples" e descobrir 4 tasks depois que era miniSpec. O custo de **promover** (refazer como miniSpec) é alto; o de **degradar** (rodar SDD numa coisa trivial) é só overhead temporal. **Na dúvida, suba uma estrada.**
:::

## 📚 Aprofundamento na Referência

* **[Os 4 Caminhos (referência)](../../concepts/four-paths.md)** — matriz comparativa completa e custos típicos em tokens.
* **[Strategy Selector (referência)](../../discovery/strategy-selector.md)** — os 8 sinais S1–S8 em detalhe.
* **[`/agent-spec-pre-refinement` (skill)](../../skills/shared/pre-refinement.md)** — onde a recomendação acontece.
