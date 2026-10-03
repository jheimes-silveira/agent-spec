---
title: "Capítulo 22 — ADR Compliance Light no Gate 1"
description: "O sweep grep-detectável de ADRs ativas no Gate 1 — o que ele pega e o que fica para o Gate 2."
---
# Capítulo 22 — ADR Compliance Light no Gate 1

A Camada 6 do Gate 1 faz um **sweep grep-detectável** das ADRs ativas. Não é análise profunda — é grep + comparação. A análise estrutural fica no Gate 2.

## Grep-detectável (Gate 1) vs estrutural (Gate 2)

| Grep-detectável → Gate 1 | Estrutural → Gate 2 |
| --- | --- |
| Idioma de identificadores (tags `json:`/`form:` em inglês) → grepa termos em pt-BR | Estrutura de camadas (Repository/Service/Handler) |
| Naming para soft delete (`SoftDelete(`) | Composição de erros (exige entender o fluxo) |
| Injeção direta de pool de DB fora do startup | Estilo de testes (exige semântica) |
| Provider singleton para SDK fora do Wire | — |

A regra é simples: se a violação aparece num `grep` sobre o diff, é Gate 1; se exige entender a arquitetura, é Gate 2.

```mermaid
flowchart TD
IDX["INDEX.md das ADRs"] --> FIL["Filtra ADRs Accepted  
com regra grep-detectável"]
FIL --> G1{"Gate 1 — Camada 6  
grep nos arquivos tocados"}
G1 -->|"violação encontrada"| L["loop de correção"]
G1 -->|"sweep limpo"| G2{"Gate 2 — Tech Review  
análise estrutural profunda"}
G2 -->|"violação estrutural"| L
G2 -->|"conforme"| OK(["Task em conformidade com as ADRs"])
classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111
classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#111
class IDX,FIL phase
class G1,G2 gate
class OK done
class L reject
```
::: info 📝 Nota
\*\*Por que pegar isso já no Gate 1\*\*: o post-mortem `cadastro-pratos-franquia` mostrou que violações grep-detectáveis de ADR cascateavam por 3+ tasks quando só apareciam no Gate 2 (a ADR-0010 atingiu T5, T6 e T7 ao mesmo tempo). Pegar cedo, com um grep barato, evita rodadas de correção em tasks posteriores. O procedimento lê o `INDEX.md`, filtra ADRs `Accepted` e grepa cada regra detectável nos arquivos tocados.
:::

## 📚 Aprofundamento na Referência

* **[agent-spec-qa-validator (Gate 1)](/agents/qa-validator.html)** — a Camada 6 (ADR Compliance Light).
* **[agent-spec-staff-architecture-review (Gate 2)](/agents/staff-architecture-review-agent.html)** — a análise estrutural profunda de ADRs.
* **[Lifecycle de ADRs](/adr/lifecycle.html)** — por que só ADRs `Accepted` entram no sweep.
