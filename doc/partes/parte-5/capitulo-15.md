---
title: "Capítulo 15 — A política débito-controlado"
description: "A decisão de veredito por severidade — bloquear risco real, anotar débito de manutenibilidade."
---
# Capítulo 15 — A política débito-controlado

Esta é a decisão arquitetural mais importante e menos óbvia do framework. Vale explorar com calma.

## O problema com zero-débito

Pipelines de IA com policy **zero-débito** rejeitam qualquer problema, em qualquer severidade. O padrão observável:

* Tarefa com 1 problema BAIXO (uma magic string num teste que já passa) → rejeitada.
* Loop de correção dispara → modelo gera correção mínima → re-roda QA + Tech Review (5-8 min).

**Custo** para "corrigir" essa magic string: ~6 min + ~30-50k tokens. Delta de valor entregue ao usuário: **zero** — o teste já passava. Pior: a forma típica de o modelo "consertar" um BAIXO é introduzir um pequeno desvio (renomear uma variável de teste) que cria sua própria divergência com a convenção do projeto. Você troca um débito BAIXO por outro.

## A reformulação: pensa como dev sênior

Em vez de "todo problema rejeita", o framework adota o critério que devs sênior usam mentalmente em code review:

* **Bloqueia risco real** — bug funcional, vulnerabilidade, teste flaky, antipadrão que mascara regressão.
* **Anota débito de manutenibilidade** — magic string, naming subótimo, duplicação leve, padrão discutível.

Operacionalmente, isso vira a tabela de vereditos dos dois gates:

| Severidade presente | Gate 1 (QA) | Gate 2 (Tech Review) |
| --- | --- | --- |
| Nenhum problema | `APROVADO` | `approved` |
| Só médio/baixo | `APROVADO_COM_OBSERVACOES` | `approved_with_observations` |
| Alto (sem crítico) | `REJEITADO` | `partial` |
| Crítico | `REJEITADO` | `rejected` |

Em forma de gradiente: verde e amarelo viram débito anotado; vermelho bloqueia e dispara o loop de correção.

Baixo

⚠️

anota débito

Médio

⚠️⚠️

anota débito

Alto

⚠️⚠️⚠️

rejeita (partial)

Crítico

⚠️⚠️⚠️

rejeita (rejected)

::: tip 💡 Dica
`APROVADO_COM_OBSERVACOES` **não é "ignorar"**. Cada médio/baixo continua em `problemas.*` com `correcao_sugerida` e é propagado para `qa-observations.md`. A diferença é só **quando** se paga a dívida — em lote depois, não em micro-loops durante a execução.
:::

## 📚 Aprofundamento na Referência

* **[Gates e Loops](../../concepts/gates-loops.md)** — a política em contexto de pipeline.
* **[agent-spec-qa-validator (Gate 1)](../../agents/qa-validator.md)** — onde o veredito por severidade é decidido.
* **[qa-observations.md](../../observability/qa-observations.md)** — onde o débito anotado vive.
