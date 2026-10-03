---
title: "Capítulo 13 — Loops de correção"
description: "O que acontece numa rejeição — memória lazy, prompt de correção, re-validação seletiva e o hard stop em 3 tentativas."
---
# Capítulo 13 — Loops de correção

Quando um gate reprova, o orquestrador não desiste nem entra em loop infinito. Ele executa um ciclo determinístico de correção.

## O ciclo

```mermaid
flowchart TD
REJ["gate rejeitou"] --> MEM["1. memória lazy T{N}.md  
(attempt\_count, last\_severity, JSON do gate)"]
MEM --> ESC["2. auto-escalação se trigger atingido"]
ESC --> P["3. prompt de correção  
TODOS os problemas, sem filtro"]
P --> EXEC["4. executor corrige (modelo escalado)"]
EXEC --> REV{"5. re-validação seletiva"}
REV -->|aprovado| OK(["avança / conclui"])
REV -->|rejeitado de novo| CHK{"attempt\_count >= 3?"}
CHK -->|não| ESC
CHK -->|sim| STOP["BLOQUEADO → escala ao usuário"]
classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111
classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#111
class MEM,ESC,P,EXEC phase
class REV,CHK gate
class OK done
class REJ,STOP reject
```

## Re-validação seletiva

Nem toda rejeição re-roda tudo. O orquestrador bifurca conforme `requires_qa_revalidation`:

* **Gate 1 rejeitou** → re-roda **apenas Gate 1**.
* **Gate 2 rejeitou** + `requires_qa_revalidation: true` → Gate 1 **+** Gate 2.
* **Gate 2 rejeitou** + `requires_qa_revalidation: false` → **só Gate 2**.

A `categoria` do problema decide: se o conserto pode ter quebrado algo funcional, exige re-QA; se é puramente arquitetural (naming, organização), não exige.

::: danger 🚫 Regra
\*\*Hard stop em 3 tentativas.\*\* O contador é compartilhado entre os dois gates e \*\*não reseta\*\*. Tentativa 3 (já em Opus) reprovada → a task é marcada \*\*BLOQUEADA\*\*, e o framework para e pergunta ao usuário, entregando o relatório completo (JSONs dos gates, memória lazy, paths tocados). Não há loop infinito: quando se chega aqui, geralmente a task estava \*\*mal-formulada\*\* — não que o modelo é incapaz.
:::

## 📚 Aprofundamento na Referência

* **[Gates e Loops](/concepts/gates-loops.html)** — o fluxo de validação e loop completo.
* **[qa-observations.md](/observability/qa-observations.html)** — onde cada rodada é logada para auditoria.
* **[Pipeline — visão geral](/pipeline/overview.html)** — o orquestrador que conduz o loop.
