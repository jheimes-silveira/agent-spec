---
title: "Apêndice B — Categorias canônicas"
description: "O vocabulário de categorias de problema e a divisão revalidation_required vs code_review_only."
---
# Apêndice B — Categorias canônicas

Toda entrada em `problemas.*[]` dos gates carrega uma `categoria`. O vocabulário é canônico (definido em `agent-spec-workflow-rules.md`) e divide-se em duas classes que governam se a próxima rodada de correção **re-roda o QA** ou vai direto ao Tech Review.

| Categoria | Classe | Justificativa |
| --- | --- | --- |
| `architecture` | **revalidation_required** | Estrutura altera fluxo/dependências |
| `security` | **revalidation_required** | Correção de vulnerabilidade afeta lógica |
| `tests` | **revalidation_required** | Implica mudar/criar testes |
| `logic` | **revalidation_required** | Bug de lógica muda comportamento |
| `data_handling` | **revalidation_required** | Parsing/validação afeta entrada/saída |
| `error_handling` | **revalidation_required** | Fluxo de exceção muda |
| `performance` | **revalidation_required** | Pode quebrar casos limite |
| `concurrency` | **revalidation_required** | Comportamento sob carga muda |
| `adr_compliance` | **revalidation_required** | Pode exigir mudança estrutural |
| `code_quality` | code_review_only | Refactor sem mudança de comportamento |
| `naming` | code_review_only | Renomear sem mudar API |
| `style` | code_review_only | Formatação |
| `documentation` | code_review_only | Comentários, docstrings |
| `dead_code` | code_review_only | Remoção de código não executado |
| `imports` | code_review_only | Reorganização |

> **Default conservador**: categoria desconhecida → tratada como `revalidation_required`. Pular o QA indevidamente custa mais caro do que rodá-lo num naming fix.

## 📚 Aprofundamento na Referência

* **[Parte V — Capítulo 16](../partes/parte-5/capitulo-16.md)** — a explicação narrativa da divisão.
* **[Gates e Loops](../concepts/gates-loops.md)** — como a categoria alimenta a re-validação seletiva.
* **[Critical Paths](../configuration/critical-paths.md)** — os overrides que sempre forçam re-QA.
