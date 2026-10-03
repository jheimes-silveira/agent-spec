---
title: "Capítulo 0 — O framework em 5 minutos"
description: "O mapa antes do território. Volte aqui sempre que se perder."
---
# Capítulo 0 — O framework em 5 minutos

> Antes de dissecar cada peça, veja o todo. Este capítulo é o **mapa** — você vai voltar a ele sempre que se perder. Não se preocupe em entender cada termo agora; eles reaparecem com calma nas partes seguintes.

## A dor, em uma frase

> **LLMs codificam bem em escopo pequeno e bem definido, e mal sob ambiguidade.**

Quanto mais vaga a tarefa, mais o modelo improvisa — e improviso, em código, é onde nascem os bugs.

## A tese

Se ambiguidade é o veneno, **especificação é o antídoto**. O `agent-spec` mata a ambiguidade antes da primeira linha de código, e depois protege o resultado com revisão automática.

Pense numa obra: mudar a planta no papel custa um apagador; derrubar uma parede já levantada custa uma semana. O framework empurra o máximo de decisões para a fase "papel".

## As quatro peças que você precisa reconhecer

Escolher o caminho

Conversa, TaskCard, miniSpec ou SDD — pelo tamanho da feature.

Gerar a spec

Skills `*-generate-*` produzem artefatos antes do código.

Executar (run-tasks)

O orquestrador implementa task a task, respeitando dependências.

Dois gates revisam

QA (funcional) + Tech Review (arquitetural). Aprovou → `git add`.

### 1. Quatro caminhos

Nem toda feature merece o mesmo cerimonial. O framework oferece quatro "veículos", do mais leve ao mais pesado:

| Caminho | Para quê |
| --- | --- |
| **Conversa direta** | Spike, exploração — código que vai ser jogado fora. Sem gates. |
| **TaskCard** | Mudança pontual e isolada (1 task). |
| **miniSpec** | Feature de 1 a 3 user stories. |
| **SDD** | Feature complexa, multi-US, alto custo de retrabalho. |

### 2. Gerar a spec

Skills `*-generate-*` produzem os documentos (PRD, tech spec, intent, scope, tasks) **antes de qualquer código**. Tudo versionado em `docs/specs/features/{feature}/{version}/`.

### 3. Executar

A skill `*-run-tasks` pega as tasks e as implementa, uma a uma, respeitando dependências.

### 4. Dois gates

Cada task implementada passa por duas revisões automáticas:

* **Gate 1 — `agent-spec-qa-validator`**: o olho funcional. Roda os testes, verifica escopo e corretude.
* **Gate 2 — `agent-spec-staff-architecture-review`**: o olho arquitetural. Avalia design, segurança profunda, ADRs.

Se algum gate reprova, entra um **loop de correção** (no máximo 3 tentativas). Se aprova, o código é staged (`git add`) — o commit fica com você.

### O fluxo, de uma vez

```
   ┌────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Ideia  ├──▶ │ 1.Escolher  ├──▶ │ 2.Gerar  ├──▶ │ 3.Run    ├──▶ │ Executor │
   │        │    │  caminho    │    │   spec   │    │ -tasks   │    │          │
   └────────┘    └─────────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                                          │
                                            ┌─────────────────────────────┘
                                            ▼
                                       ┌─────────┐    aprovado   ┌─────────┐
                                       │ Gate 1  ├─────────────▶ │ Gate 2  │
                                       └────┬────┘               └────┬────┘
                                            │ rejeitado               │ rejeitado
                                            ▼                          ▼
                                       ┌──────────────────────────────────────┐
                                       │ Loop de correção (máx. 3 tentativas) │
                                       └──────────────────┬───────────────────┘
                                                          │
                                                          ▼
                                                    volta ao Executor

                              Aprovado nos dois gates → git add (stage, sem commit)
```

## A ideia mais importante: débito-controlado

A decisão de design que mais separa o `agent-spec` de pipelines típicas de IA:

::: danger 🚫 Regra de ouro
**Médios e baixos não reprovam. Só risco real (crítico/alto) bloqueia.**
:::

Bugs, vulnerabilidades e testes que mascaram regressão → reprovam e disparam o loop. Uma magic string num teste que já passa? Vira **dívida anotada**, não um loop de 6 minutos. Depois, a skill `/agent-spec-debt-resolution` recolhe a dívida acumulada num batch só.

::: info 📝 Nota
Se você só tem 5 minutos, este é o resumo. As próximas 8 partes apenas detalham cada uma dessas quatro peças e o débito-controlado — com o porquê de cada escolha.
:::

## 📚 Aprofundamento na Referência

* **[Parte I — Por que especificar antes de codar](partes/parte-1/index.md)** — a dor, as convicções, a rastreabilidade.
* **[Parte II — Seu primeiro fluxo](partes/parte-2/capitulo-4.md)** — demonstração passo a passo de uma feature ponta a ponta.
* **[Apêndice D — Quem chama quem](apendices/D-mapa-skills.md)** — mapa rápido de todas as skills.
