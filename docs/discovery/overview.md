---
id: "overview"
title: "Discovery — Overview"
sidebar_position: 1
---
# Discovery — Overview

Discovery é o **ponto de entrada universal** do framework. Transforma uma ideia bruta/vaga em uma definição inicial estruturada via **brainstorm em Tree of Thought** (divergir os rumos, convergir com o usuário), **separando FATO × HIPÓTESE × DÚVIDA** e **recomendando o framework certo** (SDD/miniSpec/TaskCard/Conversa direta).

```
Ideia crua ──────► /agent-spec-pre-refinement ──────► pre-refinement.md
│
▼
Strategy Selector (Seção 15)
│
┌────────┼─────────┬─────────┐
▼ ▼ ▼ ▼
Conversa TaskCard miniSpec SDD
```

---

## Quando rodar discovery

* **Sempre** que a ideia ainda está vaga ou em aberto.
* Quando você não tem certeza qual framework usar.
* Antes de qualquer skill de geração (PRD, Intent, TaskCard).

## Quando pular

* Ideia já cristalina, decisões tomadas, próxima skill clara.
* Spike/aprendizado óbvio (vai direto para [Conversa direta](/frameworks/conversa-direta.html)).

---

## Páginas desta seção

* **[agent-spec-pre-refinement](/discovery/pre-refinement.html)** — a skill principal do discovery (produto). Skill é [agent-spec-pre-refinement](/skills/shared/pre-refinement.html).
* **[Brainstorm (Tree of Thought)](/discovery/brainstorm.html)** — o método de 2 fases (esqueleto + expansão) que é o coração do pre-refinement.
* **[Strategy Selector](/discovery/strategy-selector.html)** — recomendação por complexidade (3 dimensões) aplicada na Seção 15.
* **[agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html)** — discovery **técnico**: discute a arquitetura via TOT e registra as decisões (etapa seguinte ao PRD/Intent).

---

## Output

`pre-refinement.md` em `/docs/specs/features/{feature}/{version}/pre-refinement.md` (path resolvido via [framework-paths.md](/configuration/framework-paths.html)).

Contém:

* Ideia reescrita, problema, escopo, restrições.
* **FATO × HIPÓTESE × DÚVIDA** explícitos.
* Esqueleto dos rumos (Seção 3) + árvore de rumos do TOT (Seção 4).
* **Recomendação de framework** com justificativa (Seção 15).

---

## Como cada skill geradora consome o agent-spec-pre-refinement

| Skill | Comportamento |
| --- | --- |
| [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) | Lê Seção 15; se recomendação ≠ SDD, emite aviso não-bloqueante e registra `source: overridden` em `sdd_state.yaml` |
| [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) | Idem para miniSpec |
| [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) | Idem para TaskCard |

> O agent-spec-pre-refinement é **sempre opcional** — qualquer skill geradora aceita ser invocada sem ele. Mas com discovery, a recomendação aplicada via Strategy Selector reduz drasticamente erros de escolha de framework.

---

## Próximos passos

* [agent-spec-pre-refinement](/discovery/pre-refinement.html) — uso prático.
* [Strategy Selector](/discovery/strategy-selector.html) — recomendação por complexidade (3 dimensões).
* [Brainstorm (Tree of Thought)](/discovery/brainstorm.html) — o método de 2 fases.
* [Frameworks — Overview](/frameworks/overview.html) — comparativo dos 4 caminhos.
