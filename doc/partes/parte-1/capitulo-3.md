# Capítulo 3 — Rastreabilidade: US → CA → CT → código

Há um fio que costura o framework inteiro. Toda funcionalidade percorre a mesma cadeia:

US

User Story

Como X, quero Y

→

CA

Critério de Aceitação

condição verificável

→

CT

Caso de Teste

valida o CA

→

Code

Código

satisfaz o CT

* **US (User Story)** — a necessidade, na voz de quem precisa: *"Como gestor, quero exportar a lista de pedidos para conferir offline."*
* **CA (Critério de Aceitação)** — a condição objetiva que torna a US "pronta": *"O arquivo gerado contém uma linha por pedido com data, cliente e total."*
* **CT (Caso de Teste)** — o teste que prova o CA: *"Dado 3 pedidos, o CSV tem 3 linhas de dados + cabeçalho."*
* **Código** — a implementação que faz o CT passar.

## Por que isso importa tanto

Quando o Gate 1 encontra um problema, ele **não diz apenas "está errado"** — ele aponta qual CA foi violado. A rastreabilidade transforma *"tem um bug"* em *"o CA-03 falhou porque o total não soma o frete"*. Isso é o que torna a correção **barata** e **auditável**.

::: tip 💡 Dica
Se você não consegue escrever o CA de uma funcionalidade, é sinal de que a US ainda está vaga demais — exatamente a ambiguidade que o [Capítulo 1](capitulo-1.md) alertou. Escrever o CA é o **primeiro teste de clareza**.
:::

## 📚 Aprofundamento na Referência

* **[Exercícios da Parte I](exercicios.md)** — fixe os conceitos antes da próxima parte.
* **[Parte II — Passo a passo](../parte-2/capitulo-4.md)** — vai ver a cadeia em ação numa feature real.
* **[agent-spec-qa-validator (referência)](../../agents/qa-validator.md)** — como o Gate 1 usa a rastreabilidade.
