---
title: "Exercícios — Parte VI"
description: "Fixe as Iron Laws, as famílias de antipadrões e os 7 gates. Gabarito no Apêndice F."
---
# Exercícios — Parte VI

1. **(Iron Laws)** Qual Iron Law cada teste abaixo viola?

   * a. Um teste que usa `new Date()` para montar a data esperada.
   * b. Um teste que só passa se rodar depois de outro (que popula um cache global).
   * c. `expect(resultado).toBeDefined()` como única asserção.
2. **(Antipadrão)** Um teste mocka o repository, o cache e o cliente HTTP, e não há nenhum teste de integração da mesma feature. Que Iron Law / família de antipadrão isso fere, e qual o risco?
3. **(7 gates)** Por que o framework torna o `negative_companion` (cenário negativo) um campo **obrigatório** no gerador de casos de teste, em vez de só recomendá-lo?

::: info 📝 Gabarito
Confira no **[Apêndice F — Gabarito dos exercícios](../../apendices/F-gabarito.md#parte-vi)**.
:::
