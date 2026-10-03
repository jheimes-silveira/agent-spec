---
title: "Capítulo 25 — State files"
description: "Os arquivos de estado (sdd_state.yaml, minispec_state.yaml) que tornam cada versão de feature rastreável."
---
# Capítulo 25 — State files

Cada framework persistente tem um `state.yaml` na raiz da versão — a fonte estruturada de rastreabilidade do run.

## Quem tem state

| Arquivo | Framework |
| --- | --- |
| `sdd_state.yaml` | SDD |
| `minispec_state.yaml` | miniSpec |
| (nenhum) | TaskCard — task única, sem state |

## Campos canônicos

```yaml
feature: cardapio-digital
version: v1
variant: backend # web | mobile | backend (NÃO entra no path)
source: recommended # recommended | overridden | no\_discovery
steps:
prd: { status: approved, variant: backend }
tech\_spec: { status: approved }
task\_plan: { status: approved }
execution:
status: in\_progress # not\_started | in\_progress | complete | blocked
tasks\_total: 7
tasks\_completed: 4
tasks\_blocked: 0
```

O bloco `steps` é a cadeia de rastreabilidade da versão — cada etapa carrega seu status:

PRD

PRD

status: approved

→

TS

Tech Spec

status: approved

→

TP

Task Plan

status: approved

→

Exec

Execução

in\_progress — 4/7 tasks

## O campo `source` — confiança no Strategy Selector

| Valor | Significado |
| --- | --- |
| `recommended` | O Strategy Selector recomendou este caminho e foi seguido. |
| `overridden` | Recomendou outro caminho; o usuário forçou este. |
| `no_discovery` | Pulou o `/agent-spec-pre-refinement`. |

::: info 📝 Nota
O `source` é \*\*puramente observacional\*\* — não muda o comportamento do run. Mas, agregado ao longo de muitos runs, permite auditar \*\*quanto o time confia no Strategy Selector\*\*: muitos `overridden` para o mesmo tipo de feature são sinal de que a heurística de recomendação precisa de ajuste.
:::

## 📚 Aprofundamento na Referência

* **[State files](/observability/state-files.html)** — todos os campos e estados.
* **[Strategy Selector](/discovery/strategy-selector.html)** — o que o campo `source` rastreia.
* **[Memória proativa](/advanced/proactive-memory.html)** — como o estado alimenta decisões futuras.
