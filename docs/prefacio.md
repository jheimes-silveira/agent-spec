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
\*\*Escolha sua trilha\*\*:
\*\*Trilha rápida (~1h)\*\* — [Prefácio](/prefacio.html) → [Capítulo 0](/capitulo-0.html) → [Parte II (passo a passo)](/partes/parte-2/capitulo-4.html) → [Apêndice D](/apendices/D-mapa-skills.html). Você sai sabendo operar o básico.
\*\*Trilha completa (onboarding — capacitação inicial)\*\* — leia linear, do Prefácio aos Apêndices. É o caminho desenhado para aprender de verdade.
\*\*Trilha de referência\*\* — use a busca ou a área \*\*🔧 Referência\*\* da sidebar; depois do Capítulo 0, cada capítulo é autocontido.
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
* Siglas recorrentes: **US** = User Story, **CA** = Critério de Aceitação, **CT** = Caso de Teste, **ADR** = Architecture Decision Record, **PRD** = Product Requirements Document. Todas reaparecem no [Glossário (Apêndice E)](/apendices/E-glossario.html).
* Cada parte termina com **exercícios de fixação**; o gabarito está no [Apêndice F](/apendices/F-gabarito.html).

## Sumário

* [Capítulo 0 — O framework em 5 minutos](/capitulo-0.html)
* **[Parte I — Por que especificar antes de codar](/partes/parte-1/)**
* **[Parte II — Seu primeiro fluxo, do início ao fim](/partes/parte-2/)**
* **Parte III — Escolhendo o caminho certo** *(em migração — consulte [`/agent-spec-completo`](/agent-spec-completo.html#parte-iii-—-os-frameworks-em-profundidade))*
* **Parte IV — A pipeline e os dois gates** *(em migração)*
* **Parte V — A política débito-controlado** *(em migração)*
* **Parte VI — Qualidade de testes** *(em migração)*
* **Parte VII — ADRs: a memória das decisões** *(em migração)*
* **Parte VIII — Observabilidade, memória e estado** *(em migração)*
* **Apêndices** — referência, glossário e gabarito *(em migração)*

::: info 📝 Nota sobre a migração
A documentação está sendo reorganizada em dois caminhos coexistentes: a \*\*espinha narrativa\*\* (Prefácio → Capítulos → Apêndices) e a \*\*🔧 Referência técnica\*\* (consulta). Partes ainda em migração permanecem disponíveis na [versão consolidada em uma página](/agent-spec-completo.html).
:::

## 📚 Aprofundamento na Referência

* **[Skills — visão geral](/skills/overview.html)** — catálogo completo de todas as skills do framework.
* **[Pipeline — visão geral](/pipeline/overview.html)** — anatomia da execução: orquestradores, executores e os dois gates.
* **[Agents — visão geral](/agents/overview.html)** — os subagentes de QA, Tech Review e geração de testes.
* **[Conceitos — visão geral](/concepts/overview.html)** — fundamentos do desenvolvimento spec-driven.
