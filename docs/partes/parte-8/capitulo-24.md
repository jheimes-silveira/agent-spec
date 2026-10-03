---
title: "Capítulo 24 — Memória lazy e memória inline"
description: "As duas formas de memória entre subagentes — quando gravar em disco e quando passar inline no prompt."
---
# Capítulo 24 — Memória lazy e memória inline

O framework tem **duas formas** de memória entre subagentes. Conhecer a diferença evita criar arquivos parasitas — e é uma aplicação direta do princípio do **contexto mínimo**.

## Memória lazy — `T{N}.md` em `.tmp/`

| Atributo | Valor |
| --- | --- |
| Path | `docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` |
| Criada por | Orquestrador, **apenas** em rejeição de gate |
| Lida por | Executor (em retry) e os gates (contexto de retry) |
| Conteúdo | `attempt_count`, `last_severity`, JSON do(s) gate(s) que rejeitaram, paths tocados |
| Apagada quando | Ambos os gates aprovam |
| Versionada | **Não** (`.gitignore`) |

**Por que lazy**: cria custo só quando há rejeição — aprovação na primeira tentativa não gera arquivo nenhum. **Por que dentro da feature** (e não em `.claude/.tmp/`): `.claude/` é área protegida e exigia autorização a cada gravação; mover para `tasks/.tmp/` eliminou o prompt e co-localizou a memória com as tasks.

```mermaid
flowchart TD
EX["Executor implementa a task"] --> G{"Gates avaliam  
(QA Validator + Tech Review)"}
G -->|rejeição| TMP["Orquestrador cria/atualiza .tmp/T{N}.md  
attempt\_count, severidade, JSON do gate"]
TMP --> RT["Retry: executor e gates  
leem a memória"]
RT --> G
G -->|ambos aprovam| CL["Apaga .tmp/T{N}.md (cleanup)"]
CL --> D(["Task concluída — sem arquivo residual"])
classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111
classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#111
class EX phase
class G gate
class TMP,RT reject
class CL,D done
```

## Memória inline — `base_sha` + sumário do executor

| Atributo | Valor |
| --- | --- |
| Persistida em | Variáveis em memória do orquestrador (não em disco) |
| Lida por | Gate 1 e Gate 2, inline em `instrucoes` |
| Conteúdo | `base_sha` (SHA git pré-task) + sumário do executor (4-6 linhas) |

::: tip 💡 Dica
A versão anterior gravava um `T{N}-execution-summary.md` com `git diff --stat`, hashes SHA-256 e paths consolidados. Esses campos eram \*\*redundantes\*\* (o Tech Review gera o diff sozinho via `git diff `) ou \*\*nunca consultados\*\*. Cortar isso economizou ~300-800 tokens × 2 gates × N tasks por run — menos arquivo, fluxo mais simples.
:::

## 📚 Aprofundamento na Referência

* **[Memória temporária (configuração)](/configuration/temp-memory.html)** — o diretório `.tmp/` e seu ciclo.
* **[Depuração da memória temporária](/observability/temp-memory-debug.html)** — como inspecionar a memória lazy.
* **[Contexto mínimo (referência)](/concepts/minimum-context.html)** — o princípio por trás da memória inline.
