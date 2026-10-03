---
title: "Exercícios — Parte IV"
description: "Fixe a anatomia da pipeline, os dois gates e os loops. Gabarito no Apêndice F."
---
# Exercícios — Parte IV

1. **(Divisão de trabalho)** Para cada verificação, diga qual gate a faz (Gate 1 / Gate 2):

   * a. "O endpoint trata corpo vazio sem estourar 500?"
   * b. "A camada de domínio depende da camada de infra (viola a ADR de dependências)?"
   * c. "Existe um IDOR no acesso ao recurso por ID?"
   * d. "A suíte de testes passa?"
2. **(Re-validação seletiva)** O Gate 2 rejeitou uma task por um problema puramente de nomenclatura (`categoria: naming`). O executor corrigiu. Quais gates devem rodar na re-validação e por quê?
3. **(Hard stop)** Uma task foi reprovada nas 3 tentativas (a última já em Opus). O que o framework faz, e o que isso normalmente indica sobre a task?

::: info 📝 Gabarito
Confira no **[Apêndice F — Gabarito dos exercícios](../../apendices/F-gabarito.md#parte-iv)**.
:::
