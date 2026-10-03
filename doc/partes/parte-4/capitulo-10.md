---
title: "Capítulo 10 — Anatomia da pipeline de execução"
description: "Como o orquestrador *-run-tasks despacha tasks pelo executor e pelos dois gates até o stage."
---
# Capítulo 10 — Anatomia da pipeline de execução

Todo orquestrador `*-run-tasks` — seja SDD, miniSpec ou TaskCard — segue **a mesma anatomia**. Muda o gerador da spec; o motor de execução é idêntico.

## As quatro fases

```mermaid
flowchart TD
  O["Orquestrador (*-run-tasks)"] --> F1["FASE 1: grafo de dependências  
tasks prontas + lotes paralelos"]
  F1 --> F2["FASE 2: executor (agent da stack)  
implementa → sumário + paths tocados"]
  F2 --> G1{"FASE 3: Gate 1 — QA Validator"}
  G1 -->|rejeitado| L1["loop QA"]
  L1 --> F2
  G1 -->|aprovado| G2{"FASE 4: Gate 2 — Tech Review"}
  G2 -->|partial / rejected| L2["loop TR"]
  L2 --> F2
  G2 -->|approved| ST["git add (stage, sem commit)"]
  ST --> D(["Task concluída"])
  classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
  classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111
  classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
  classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#111
  class O,F1,F2,ST phase
  class G1,G2 gate
  class D done
  class L1,L2 reject
```

## Quatro invariantes

1. **Contador de tentativas compartilhado** entre Gate 1 e Gate 2 (máximo 3, **não reseta** entre gates).
2. **Gate 1 é o único que executa testes.** Gate 2 só re-executa em três casos: QA não executou; QA rodou parcial em área crítica; ou Tech Review detectou violação `critical` em arquitetura/segurança.
3. **Gate 2 não recebe o JSON completo do QA** — apenas ~7 campos do sumário (veredito, security_flags, executou_testes, escopo_testes, tocou_area_critica, escopo_declarado…). Economia de ~5k tokens por task — o princípio do **contexto mínimo** em ação.
4. **`git add` sem commit** — o orquestrador apenas faz stage. O commit fica com o humano (ou com `/agent-spec-semantic-commit`).

::: tip 💡 Dica
Tasks na mesma fase do `task_plan.md`, marcadas como paralelizáveis e com **paths disjuntos**, rodam concorrentemente (limite `MAX_PARALLEL = 4`). Qualquer guard que falhe → fallback automático para execução sequencial, com o motivo logado em `qa-observations.md`.
:::

## 📚 Aprofundamento na Referência

* **[Pipeline — visão geral](../../pipeline/overview.md)** — anatomia operacional detalhada.
* **[Contexto mínimo (referência)](../../concepts/minimum-context.md)** — por que o Gate 2 recebe só o sumário.
* **[Gates e Loops](../../concepts/gates-loops.md)** — o fluxo completo de validação.
