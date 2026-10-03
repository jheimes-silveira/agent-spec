---
title: "Parte VIII — Observabilidade, memória e estado"
description: "qa-observations.md como trilha de auditoria, memória lazy vs inline, e os state files de rastreabilidade."
---
# Parte VIII — Observabilidade, memória e estado

> **A pergunta desta parte:** quando uma task é bloqueada ou um gate decide pular o QA, como você reconstrói **o que** aconteceu e **por quê** — depois do fato?
>
> **Analogia âncora:** a caixa-preta do avião — não muda o voo, mas é o que permite entender (e corrigir) quando algo sai do esperado.

O framework não é uma caixa fechada. Esta Parte mostra o que ele grava enquanto executa: a trilha de auditoria em `qa-observations.md`, as duas formas de memória entre subagentes, e os arquivos de estado que tornam cada run rastreável.

## Capítulos desta parte

Trilha de auditoria

qa-observations.md e os eventos gravados. [Capítulo 23 →](/partes/parte-8/capitulo-23)

Memória lazy e inline

As duas memórias entre subagentes. [Capítulo 24 →](/partes/parte-8/capitulo-24)

State files

sdd\_state / minispec\_state. [Capítulo 25 →](/partes/parte-8/capitulo-25)

Ao final, faça os **[exercícios da Parte VIII](/partes/parte-8/exercicios.html)** para fixar (gabarito no [Apêndice F](/apendices/F-gabarito.html#parte-viii)).
