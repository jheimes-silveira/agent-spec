---
title: "Capítulo 2 — As quatro convicções e os princípios cardeais"
description: "Cada convicção do agent-spec vira um mecanismo concreto. Esta é a tabela mestre dos princípios."
---
# Capítulo 2 — As quatro convicções e os princípios cardeais

O `agent-spec` nasce de **quatro convicções operacionais**. Elas não são aspiracionais — cada uma vira um mecanismo concreto que você vai ver funcionando ao longo desta documentação.

Especificação antes de código

Quanto mais cedo a ambiguidade morre, mais barato sai.

Contexto mínimo por subagente

Cada agente recebe só o que precisa para sua etapa; o resto polui e empobrece o output.

Modelo mínimo viável

Sonnet por padrão; Opus só onde o custo se paga.

Débito técnico controlado

Bloquear o que é risco real; anotar o que é dívida de manutenibilidade.

🔎 Aprofundamento — sobre a convicção nº 2

A convicção do **contexto mínimo** é contraintuitiva. A tentação é dar todo o contexto ao agente "por garantia". Mas contexto irrelevante dilui a atenção do modelo e piora o resultado — o mesmo fenômeno que faz uma reunião com gente demais decidir pior. O framework é militante em dar a cada subagente exatamente o recorte que ele precisa.

## Os princípios cardeais

Cada convicção acima se manifesta como um mecanismo. Guarde esta tabela — ela é o **índice mental** do resto do conteúdo:

| Princípio | Mecanismo concreto | Onde você vê |
| --- | --- | --- |
| **Spec antes de código** | Skills `*-generate-*` produzem artefatos versionados antes de qualquer linha de código | Parte III |
| **Contexto mínimo** | Gates recebem `base_sha` + sumário inline, não arquivos inteiros | Partes IV, VIII |
| **Modelo mínimo** | `model: sonnet` por default; escala para Opus por heurística | Parte IV |
| **Débito-controlado** | Veredito por severidade: crítico/alto reprova, médio/baixo vira dívida anotada | Parte V |
| **Fonte única de paths** | `.claude/rules/framework-paths.md` é autoritativo; nunca hardcode | Apêndice A |
| **Rastreabilidade total** | US → CA → CT → código; cada problema carrega o critério violado | Capítulo 3 |

## 📚 Aprofundamento na Referência

* **[Capítulo 3 — Rastreabilidade](/partes/parte-1/capitulo-3.html)** — o fio que costura todo o framework.
* **[framework-paths.md (referência)](/configuration/framework-paths.html)** — a regra que centraliza os paths canônicos.
* **[Contexto mínimo (referência)](/concepts/minimum-context.html)** — visão técnica do princípio nº 2.
