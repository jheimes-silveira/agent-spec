---
title: "Apêndice B — Categorias canônicas"
description: "O vocabulário de categorias de problema e a divisão revalidation_required vs code_review_only."
---
# Apêndice B — Categorias canônicas

Toda entrada em `problemas.*[]` dos gates carrega uma `categoria`. O vocabulário é canônico (definido em `agent-spec-workflow-rules.md`) e divide-se em duas classes que governam se a próxima rodada de correção **re-roda o QA** ou vai direto ao Tech Review.

| Categoria | Classe | Justificativa |
| --- | --- | --- |
| `architecture` | **revalidation\_required** | Estrutura altera fluxo/dependências |
| `security` | **revalidation\_required** | Correção de vulnerabilidade afeta lógica |
| `tests` | **revalidation\_required** | Implica mudar/criar testes |
| `logic` | **revalidation\_required** | Bug de lógica muda comportamento |
| `data_handling` | **revalidation\_required** | Parsing/validação afeta entrada/saída |
| `error_handling` | **revalidation\_required** | Fluxo de exceção muda |
| `performance` | **revalidation\_required** | Pode quebrar casos limite |
| `concurrency` | **revalidation\_required** | Comportamento sob carga muda |
| `adr_compliance` | **revalidation\_required** | Pode exigir mudança estrutural |
| `code_quality` | code\_review\_only | Refactor sem mudança de comportamento |
| `naming` | code\_review\_only | Renomear sem mudar API |
| `style` | code\_review\_only | Formatação |
| `documentation` | code\_review\_only | Comentários, docstrings |
| `dead_code` | code\_review\_only | Remoção de código não executado |
| `imports` | code\_review\_only | Reorganização |

> **Default conservador**: categoria desconhecida → tratada como `revalidation_required`. Pular o QA indevidamente custa mais caro do que rodá-lo num naming fix.

## 📚 Aprofundamento na Referência

* **[Parte V — Capítulo 16](/partes/parte-5/capitulo-16.html)** — a explicação narrativa da divisão.
* **[Gates e Loops](/concepts/gates-loops.html)** — como a categoria alimenta a re-validação seletiva.
* **[Critical Paths](/configuration/critical-paths.html)** — os overrides que sempre forçam re-QA.
