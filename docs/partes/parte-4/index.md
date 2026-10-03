---
title: "Parte IV — A pipeline e os dois gates"
description: "A anatomia do *-run-tasks, os dois gates (QA e Tech Review), os loops de correção e a auto-escalação de modelo."
---
# Parte IV — A pipeline e os dois gates

> **A pergunta desta parte:** depois que a spec vira tasks, o que garante que o código gerado realmente funciona e está bem construído — sem revisão humana linha a linha?
>
> **Analogia âncora:** a linha de montagem com dois inspetores em série — o primeiro confere se a peça **funciona**, o segundo se foi **bem construída**. Nada segue adiante sem passar pelos dois.

Toda execução (`*-run-tasks`) segue a mesma anatomia, independente do framework gerador. Esta Parte abre a caixa-preta: como o orquestrador despacha as tasks, o que cada gate examina, e o que acontece quando algo é reprovado.

## Capítulos desta parte

Anatomia da pipeline

Orquestrador → executor → gates → stage. [Capítulo 10 →](/partes/parte-4/capitulo-10)

Gate 1 — QA Validator

O olho funcional, em 8 camadas. [Capítulo 11 →](/partes/parte-4/capitulo-11)

Gate 2 — Tech Review

O olho arquitetural. [Capítulo 12 →](/partes/parte-4/capitulo-12)

Loops de correção

Rejeição, retry e hard stop. [Capítulo 13 →](/partes/parte-4/capitulo-13)

Auto-escalação

Quando sobe de Sonnet para Opus. [Capítulo 14 →](/partes/parte-4/capitulo-14)

Ao final, faça os **[exercícios da Parte IV](/partes/parte-4/exercicios.html)** para fixar (gabarito no [Apêndice F](/apendices/F-gabarito.html#parte-iv)).
