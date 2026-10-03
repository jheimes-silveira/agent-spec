---
id: "agent-spec-minispec-generate-intent"
title: "agent-spec-minispec-generate-intent"
sidebar_position: 1
---
# agent-spec-minispec-generate-intent

`miniSpec` `Generator`
> **Resumo**: Primeira etapa do framework miniSpec. Conduz processo interativo (uma pergunta por vez) para gerar `intent.md` — define **O QUE** e **POR QUÊ**, sem detalhes técnicos. Equivalente leve do PRD do SDD.

---

## Quando usar

* Iniciar uma feature pequena/média (1-3 User Stories, módulo existente, sem ADR nova).
* Quando o [Strategy Selector](/discovery/strategy-selector.html) recomendou miniSpec.
* Sempre antes de [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html).

## Quando NÃO usar

* Feature grande/multi-persona/greenfield → use [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html).
* Task isolada → use [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `$ARGUMENTS` (descrição da feature em texto livre) | Usuário | Sim |
| `pre-refinement.md` | [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) | Não (recomendado) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `intent.md` | `minispec.intent.path` → `/docs/specs/features/{feature}/{version}/intent.md` | [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html), [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) |
| `minispec_state.yaml` | `minispec.state.path` | [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html) |

---

## Fluxo de execução

### FASE 0 — Pré-verificação

Lê `pre-refinement.md` (se existir) e checa recomendação de framework. Se divergente, emite aviso não-bloqueante. Registra `source` no `minispec_state.yaml` (`recommended` / `overridden` / `no_discovery`).

### FASE 1 — Construção interativa do INTENT

**Uma pergunta por vez**. Define **exclusivamente**:

* **O QUE** precisa ser feito
* **POR QUÊ** precisa ser feito

> A INTENT descreve o destino, não o caminho. Pense sempre no O QUÊ, nunca no COMO.

### FASE 2 — Salvamento e confirmação

Resolve `minispec.intent.path`, salva a INTENT e pede confirmação ("Essa Intent representa o que você quer? sim/não"). Após o "sim", cria/atualiza `minispec_state.yaml` (steps: `intent=completed`, `tech_alignment`/`scope`/`task_plan`/`execution=pending`).

---

## Gates invocados

Nenhum. Skill puramente de **geração interativa**.

---

## Templates / assets usados

* `assets/intent-template.md` — estrutura canônica da INTENT.

---

## Exemplo de uso

A skill aceita opcionalmente um **path para `pre-refinement.md`** junto com a descrição — quando passado, dispensa a inferência de `{feature}`/`{version}` para localizar o discovery.

```bash
# Texto livre (skill resolve o pre-refinement.md via template path)
/agent-spec-minispec-generate-intent "adicionar filtros e ordenação no catálogo de produtos"
# Texto + path explícito do agent-spec-pre-refinement (recomendado quando você já o tem)
/agent-spec-minispec-generate-intent "filtros no catálogo" docs/specs/features/catalogo-filtros/v1/pre-refinement.md
# Só o path — a ideia é extraída das seções 2-6 do próprio agent-spec-pre-refinement
/agent-spec-minispec-generate-intent docs/specs/features/catalogo-filtros/v1/pre-refinement.md
```
```
Pergunta 1/N: Qual é a dor que essa feature alivia?
> ...
[continua interativamente]
✅ intent.md salvo em /docs/specs/features/catalogo-filtros/v1/intent.md
✅ minispec\_state.yaml criado.
Próximo passo: /agent-spec-generate-tech-alignment  (opcional)
ou /agent-spec-minispec-generate-scope 
```

---

## Skills relacionadas

* [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) — entrada universal antes do INTENT.
* [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) — opcional, decisões técnicas curtas.
* [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) — próxima etapa.
* [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) — equivalente formal para feature grande.

## Configuração via framework-paths.md

Paths usados: `pre_refinement.path`, `minispec.intent.path`, `minispec.state.path`, `tech_alignment.path`. Veja [Path Templates](/configuration/path-templates.html).
