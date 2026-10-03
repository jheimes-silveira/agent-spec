---
title: "Exercícios — Parte V"
description: "Fixe a política débito-controlado e o ciclo de cleanup. Gabarito no Apêndice F."
---
# Exercícios — Parte V

1. **(Veredito)** Para cada conjunto de problemas de um Gate 1, diga o veredito (`APROVADO` / `APROVADO_COM_OBSERVACOES` / `REJEITADO`):

   * a. 1 magic string num teste (`baixo`, `code_quality`).
   * b. 1 caminho de erro não tratado (`alto`, `logic`).
   * c. nenhum problema.
   * d. 2 médios de `naming` + 1 crítico de `security`.
2. **(Re-validação)** Um fix do Gate 2 mexe só em `naming` e `imports`. A próxima rodada precisa re-rodar o Gate 1? E se a task original tivesse `tocou_area_critica: true`?
3. **(Ciclo)** Por que o débito MÉDIO/BAIXO é recolhido por `/agent-spec-debt-resolution` num batch depois, em vez de ser corrigido no momento em que o gate o detecta?

::: info 📝 Gabarito
Confira no **[Apêndice F — Gabarito dos exercícios](../../apendices/F-gabarito.md#parte-v)**.
:::
