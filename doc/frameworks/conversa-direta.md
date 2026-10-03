---
id: "conversa-direta"
title: "Conversa Direta"
sidebar_position: 2
---
# Conversa Direta

`Conversa`

O caminho mais leve: **sem artefato, sem gate, sem comando específico**. Apenas conversa com o Claude.

---

## Quando usar

* **Aprendizado**: *"me mostra como usar `context.WithTimeout`"*.
* **Exploração**: *"por que esse teste está flaky?"*.
* **Decisão curta**: *"vale trocar lib X por Y?"*.
* **Debug sem commit**: *"o que é esse erro `runtime: goroutine leak`?"*.

## Quando NÃO usar

* Vai gerar código que será **commitado**.
* Precisa **rastreabilidade** (decisões, critérios de aceite).
* Equipe precisa **entender** o que foi decidido.
* Features com qualquer ambição de reuso ou expansão.

---

## Custo

**~10-30k tokens**. Basicamente só o que você trocou com o modelo.

---

## Sem gates

Não passa por [agent-spec-qa-validator](../agents/qa-validator.md) (Gate 1) nem por [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md) (Gate 2). **Você é responsável pela qualidade** do que vier dessa conversa.

> Se quer gates, escolha [TaskCard](taskcard.md) ou superior.

---

## Transição para outro caminho

Se durante a conversa perceber que é maior do que pensou:

1. Invoque `/agent-spec-pre-refinement` com o que aprendeu.
2. A skill [agent-spec-pre-refinement](../skills/shared/pre-refinement.md) roda o [Strategy Selector](../discovery/strategy-selector.md) e recomenda TaskCard / miniSpec / SDD.

---

## Exemplo

```
Você: "Como usar context.WithTimeout em Go para fazer request HTTP com timeout?"

Claude: [explica com exemplos]

Você: "Posso combinar com context.WithCancel?"

Claude: [explica hierarquia de contextos]

Você: "Obrigado, vou implementar"

Claude: [fim da conversa]
```

Nenhum arquivo é gerado. Se depois você quer implementar isso num projeto, inicie uma [TaskCard](taskcard.md).

---

## Próximos passos

* [TaskCard](taskcard.md) — quando a conversa virar implementação.
* [Discovery — Overview](../discovery/overview.md) — quando a ideia for crescendo.
* [Frameworks — Overview](overview.md) — comparativo dos 4 caminhos.
