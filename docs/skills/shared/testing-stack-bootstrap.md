---
id: "agent-spec-testing-stack-bootstrap"
title: "agent-spec-testing-stack-bootstrap"
sidebar_position: 11
---
# agent-spec-testing-stack-bootstrap

`Compartilhada`
> **Resumo**: Descobre a **stack de teste** do projeto host (linguagem, framework de teste por camada, comando de teste, convenções de arquivo, fronteiras de execução real, política de cobertura/flaky) e gera a rule **`.claude/rules/agent-spec-testing-stack.md`** — fonte de verdade consumida por [`agent-spec-qa-validator`](/agents/qa-validator.html) (Gate 1) e [`agent-spec-qa-test-generator`](/agents/qa-test-generator.html). Deriva tudo que é detectável do código e **só pergunta o que NÃO é derivável**. Agnóstico de linguagem.

> É esta rule que torna os agentes de QA capazes de testar **qualquer stack** sem carregarem idiomas hardcoded. Sem ela, o QA cai num fallback de descoberta best-effort.

---

## Quando usar

* **Primeira vez** que um projeto host vai usar os gates de QA e ainda não há rule de stack de teste.
* Quando `agent-spec-qa-validator` ou `agent-spec-qa-test-generator` retornarem `stack_discovery.discovery_needed: true`.
* Quando a stack de teste **mudou** (novo framework, novo comando, nova convenção).
* Quando a rule já existe mas está **incompleta ou defasada** (modo enriquecimento).

## Quando NÃO usar

| Cenário | Use |
| --- | --- |
| Gerar casos de teste | [`agent-spec-qa-test-generator`](/agents/qa-test-generator.html) |
| Validar implementação de testes | [`agent-spec-qa-validator`](/agents/qa-validator.html) |
| Autoria de rule de **outro tema** arquitetural | [`agent-spec-rule-create`](/skills/shared/rule-create.html) |
| Doutrina de testes (Iron Laws, antipadrões) | [`agent-spec-testing-best-practices`](/concepts/testing-best-practices.html) |

---

## Chain of Tree (descoberta em árvore)

A skill raciocina em árvore antes de gravar:

* **Nível 1 — Decomposição (3-5 eixos canônicos, ajustáveis)**: base de execução · frameworks por camada · comando & convenções · fronteira de execução real · política de qualidade (gates). São uma **base** — funda ou divida eixos conforme o projeto, mantendo sempre entre 3 e 5.
* **Nível 2 — Ramificação (3 alternativas/nó)**: nó `[derivado]` (código responde) → não pergunta; nó `[a decidir]` (não-derivável) → questionário com 3 alternativas e recomendação.

**Regra de ouro**: nunca pergunta o que o código já responde (linguagem, runner, padrão de arquivo). Só o **não-derivável** (framework E2E a padronizar, threshold de cobertura, política de quarentena) vira pergunta.

---

## Dois modos

| Modo | Quando | Comportamento |
| --- | --- | --- |
| **Bootstrap** | rule ausente | fluxo completo de descoberta → gera a rule |
| **Enriquecimento** | rule presente | diff código × rule (`vazio`/`stale`/`novo sinal`/`coerente`) → enriquece **só os deltas**, preserva o hand-authored, reavalia o path match |

---

## O que gera

A rule `agent-spec-testing-stack.md` com: identificação (linguagem/frente), frameworks por camada, comando de teste (full/subset), convenções de arquivo, fronteira de execução real, política de qualidade, ADRs de teste grep-detectáveis e a tabela **"Decisões de stack (árvore)"** (auditável).

* **Nome e path match** propostos e **editáveis**, derivados do host (matcher estreito).
* **Relatório de criação/atualização** obrigatório ao final (modo, arquivo, matcher, procedência, o que foi enriquecido).

---

## Integração com os gates de QA

Os agentes de QA resolvem a stack por **precedência**: (1) esta rule → (2) CLAUDE.md/rules → (3) sinais do código → (4) lacuna sinalizada (`stack_discovery.discovery_needed: true`). Quando o sinal aparece, os orquestradores (`*-run-tasks`, `generate-tech-spec`) **recomendam** rodar esta skill.

---

## Skills relacionadas

* [`agent-spec-testing-best-practices`](/concepts/testing-best-practices.html) — doutrina estática consumida pelos gates; esta skill produz a rule **específica do projeto**.
* [`agent-spec-rule-create`](/skills/shared/rule-create.html) — facilitador genérico de rules; o testing-stack é o caso especializado do tema "stack de teste".
* [`agent-spec-curate-project-rules`](/skills/shared/curate-project-rules.html) — avaliação manual de escopo/matcher da rule gerada.
