---
title: "Capítulo 14 — Auto-escalação de modelo"
description: "Quando e por que a pipeline sobe de Sonnet para Opus — os gatilhos de escalação no executor e nos gates."
---
# Capítulo 14 — Auto-escalação de modelo

O default é **Sonnet** em todas as etapas — é o princípio do **modelo mínimo viável**. Mas há situações em que pagar por Opus se justifica. A pipeline escala automaticamente quando um gatilho objetivo é atingido.

## Os gatilhos

| Trigger | Quem escala | Quando |
| --- | --- | --- |
| Path toca `critical_paths` | Executor / QA / Tech Review | Antes de invocar |
| `task_risk: high` (frontmatter) | Executor / QA / Tech Review | Antes de invocar |
| `files_to_create_count >= 10` | Executor | Antes de invocar |
| `attempt_count >= 2` | Executor | Em rejeição |
| `last_severity == high` | Executor | Em rejeição |
| `qa_security_flags` não vazio | Tech Review | Antes do Gate 2 |
| `retry_attempt >= 1` | Tech Review (segundo olho) | Em retry |

O Gate 2 é **mais agressivo** na escalação que o Gate 1: uma rejeição prévia ou um flag de segurança do QA já bastam para o segundo olho subir para Opus.

No executor, os gatilhos se combinam neste fluxo de decisão:

```mermaid
flowchart TD
T["Task pronta para invocar"] --> PRE{"Gatilho pré-invocação?  
(critical\_paths, task\_risk: high,  
files\_to\_create\_count >= 10)"}
PRE -->|"não"| SO["roda em Sonnet (default)"]
PRE -->|"sim"| OP["roda em Opus"]
SO --> G{"Gate reprovou?"}
OP --> G
G -->|"não"| OK(["segue a pipeline"])
G -->|"sim"| REJ["rejeição registrada na memória lazy  
(attempt\_count, last\_severity)"]
REJ --> RET{"attempt\_count >= 2 ou  
last\_severity == high?"}
RET -->|"sim"| OP
RET -->|"não"| SO
classDef phase fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#111
classDef gate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#111
classDef done fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#111
classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#111
class T,SO,OP phase
class PRE,G,RET gate
class OK done
class REJ reject
```
::: tip 💡 Dica
Escalação nunca desce para Haiku: \*\*nenhum gate roda em Haiku\*\*. Code review e geração de testes exigem pattern recognition que Haiku ainda não domina com segurança. O eixo de escalação é \*\*Sonnet → Opus\*\*, nunca abaixo de Sonnet.
:::

## Por que automático

Deixar a escolha de modelo no feeling do operador reproduz o mesmo problema da escolha de caminho: ou se gasta Opus à toa, ou se usa Sonnet onde o risco pedia mais. Os gatilhos são **objetivos e auditáveis** — o mesmo diff sempre escala (ou não) da mesma forma.

## 📚 Aprofundamento na Referência

* **[Auto-escalação (referência)](/advanced/auto-escalation.html)** — a heurística sonnet→opus completa.
* **[Seleção de modelo (referência)](/advanced/model-selection.html)** — defaults por etapa.
* **[Critical Paths](/configuration/critical-paths.html)** — as categorias sensíveis que disparam escalação.
