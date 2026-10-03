---
title: "Prefácio — Como navegar esta documentação"
description: "Para quem é o agent-spec, o que você vai saber fazer ao final e as três trilhas de leitura."
---
# Prefácio — Como navegar esta documentação

## Para quem é

Para você que usa LLMs para escrever código e já sentiu a frustração de pedir *"implemente o cadastro de produtos"* e receber 200 linhas que quase funcionam: nomes que conflitam com o resto do projeto, uma biblioteca que o time abandonou, validações esquecidas, 80% entregue e declarado como 100%.

Você sabe programar. Conhece Git, testes e revisão de código. O que você **não** precisa saber de antemão é o `agent-spec` — vamos construí-lo do zero, peça por peça, com o porquê de cada escolha.

## O que você vai saber fazer ao final

Explicar a dor

Por que ambiguidade destrói o output de uma LLM — e como spec antes de código ataca isso.

Escolher o caminho certo

Conversa, TaskCard, miniSpec ou SDD para qualquer demanda, com sinais objetivos.

Gerar artefatos

Os artefatos de especificação corretos para o caminho escolhido.

Rodar a pipeline

Interpretar os vereditos dos dois gates de qualidade.

Aplicar débito-controlado

Fechar o ciclo da dívida técnica sem acumular.

Decidir o que vira ADR

Manter conformidade arquitetural.

Diagnosticar a pipeline

Saber o que fazer quando ela trava.

## As três trilhas de leitura

::: tip 💡 Dica
**Escolha sua trilha**:
**Trilha rápida (~1h)** — [Prefácio](prefacio.md) → [Capítulo 0](capitulo-0.md) → [Parte II (passo a passo)](partes/parte-2/capitulo-4.md) → [Apêndice D](apendices/D-mapa-skills.md). Você sai sabendo operar o básico.
**Trilha completa (onboarding — capacitação inicial)** — leia linear, do Prefácio aos Apêndices. É o caminho desenhado para aprender de verdade.
**Trilha de referência** — use a busca ou a área **🔧 Referência** da sidebar; depois do Capítulo 0, cada capítulo é autocontido.
:::

## Convenções e callouts

Ao longo da documentação, blocos destacados sinalizam o tipo de informação:

::: info 📝 Nota
Contexto que ajuda, mas não trava o fluxo principal.
:::
::: tip 💡 Dica
Atalho prático ou recomendação operacional.
:::
::: warning ⚠️ Armadilha comum
Um erro frequente que custa caro. Preste atenção nestes — quase todos vêm de casos reais.
:::
🔎 Aprofundamento

Detalhe para quem quer o fundo do assunto. Pode pular na primeira leitura sem prejuízo.

::: danger 🚫 Regra
Regra inegociável — quebrar tem consequência operacional.
:::

### Outras convenções

* Comandos de skill aparecem como `/nome-da-skill` (ex.: `/agent-spec-sdd-generate-prd`).
* Caminhos de arquivo em monospace (ex.: `docs/specs/features/...`).
* Siglas recorrentes: **US** = User Story, **CA** = Critério de Aceitação, **CT** = Caso de Teste, **ADR** = Architecture Decision Record, **PRD** = Product Requirements Document. Todas reaparecem no [Glossário (Apêndice E)](apendices/E-glossario.md).
* Cada parte termina com **exercícios de fixação**; o gabarito está no [Apêndice F](apendices/F-gabarito.md).

## Sumário

* [Capítulo 0 — O framework em 5 minutos](capitulo-0.md)
* **[Parte I — Por que especificar antes de codar](partes/parte-1/index.md)**
* **[Parte II — Seu primeiro fluxo, do início ao fim](partes/parte-2/index.md)**
* **[Parte III — Escolhendo o caminho: os quatro frameworks](partes/parte-3/index.md)**
* **[Parte IV — A pipeline e os dois gates](partes/parte-4/index.md)**
* **[Parte V — A política débito-controlado](partes/parte-5/index.md)**
* **[Parte VI — Qualidade de testes](partes/parte-6/index.md)**
* **[Parte VII — ADRs: a memória das decisões](partes/parte-7/index.md)**
* **[Parte VIII — Observabilidade, memória e estado](partes/parte-8/index.md)**
* **[Apêndices — referência, glossário e gabarito](apendices/B-categorias.md)**



## 📚 Aprofundamento na Referência

* **[Skills — visão geral](skills/overview.md)** — catálogo completo de todas as skills do framework.
* **[Pipeline — visão geral](pipeline/overview.md)** — anatomia da execução: orquestradores, executores e os dois gates.
* **[Agents — visão geral](agents/overview.md)** — os subagentes de QA, Tech Review e geração de testes.
* **[Conceitos — visão geral](concepts/overview.md)** — fundamentos do desenvolvimento spec-driven.
