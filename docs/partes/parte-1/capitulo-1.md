---
title: "Capítulo 1 — A dor: por que LLMs falham sob ambiguidade"
description: "Por que entender bem a dor é o que faz o resto do framework parecer inevitável, não arbitrário."
---
# Capítulo 1 — A dor: por que LLMs falham sob ambiguidade

> Você viu a versão de uma frase desta dor no [Capítulo 0](/capitulo-0.html). Aqui ela ganha o **porquê** — porque entender bem o problema é o que faz o resto do framework parecer inevitável, não arbitrário.

Imagine que você abre o terminal e digita:

> *"Implemente o cadastro de produtos da loja."*

Parece uma instrução clara. Para você, que conhece o projeto, ela carrega dezenas de suposições implícitas: qual padrão de camadas o projeto usa, quais validações o domínio exige, qual biblioteca de HTTP está em uso, como erros são tratados. A LLM **não tem nada disso**. Ela preenche os buracos improvisando — e cada improviso é uma aposta:

* Inventa nomes que conflitam com o resto do código.
* Escolhe uma biblioteca que o projeto já abandonou.
* Esquece validações que estavam implícitas no domínio.
* Entrega 80% e declara 100%.

O problema **não é a capacidade do modelo**. É a **densidade de ambiguidade por instrução**. Quanto mais buracos a LLM precisa preencher por conta própria, mais superfície para erro.

::: warning ⚠️ Armadilha comum
Achar que "o modelo é burro". Quase sempre o modelo é capaz — o que faltou foi reduzir a ambiguidade antes de pedir. Uma task mal-formulada gera código ruim mesmo no melhor modelo.
:::

## Onde a ambiguidade morre mais barato

Há um gradiente de custo. Uma ambiguidade resolvida na especificação custa uma frase. A mesma ambiguidade descoberta depois de implementada custa um ciclo inteiro de correção:

Ambiguidade na spec

💰

1 frase

...descoberta no código

💰💰

retrabalho

...descoberta em produção

💰💰💰

incidente

A tese do framework é simples: **empurre a morte da ambiguidade para a esquerda dessa linha.**

## 📚 Aprofundamento na Referência

* **[Capítulo 2 — As quatro convicções](/partes/parte-1/capitulo-2.html)** — como a tese vira mecanismo.
* **[Spec-Driven Development (referência)](/concepts/spec-driven.html)** — visão técnica da prática.
