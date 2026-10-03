---
id: "override-models"
title: "Override de Modelos"
sidebar_position: 3
---
# Override de Modelos

Como forçar um modelo específico (pontual ou global).

---

## Override pontual (1 task específica)

Edite o frontmatter da task antes de executar:

```markdown
## 1. Identificação
- ID: T5
- model: opus # originalmente era sonnet; forçado pelo usuário
- risk: high
```

**Efeito**: orquestrador respeita 100%. Override manual é prerrogativa humana.

**Quando**: você sabe que essa task específica precisa de Opus, mas o resto da feature pode rodar Sonnet.

---

## Override global (toda a stack do projeto)

Edite a configuração embutida em cada orquestrador `*-run-tasks` no `.claude/skills/<orquestrador>/references/config.md`.

Exemplo — forçar Opus em todos os QAs e Tech Reviews do projeto:

```markdown
## Configuração de modelos (override do default)
| Papel | Modelo |
|---|---|
| Gate 1 — agent-spec-qa-validator | opus ← forçado |
| Gate 2 — agent-spec-staff-architecture-review | opus ← forçado |
```
> **Quando**: projetos em área altamente crítica (healthcare, financeiro, defesa) onde falso-negativo é inaceitável.

> **Custo**: ~3-5× mais caro em $.

---

## Override de critical paths

Você pode adicionar paths específicos do seu projeto à lista de `critical_paths` embutida em cada `*-run-tasks`. Tasks que tocarem esses paths automaticamente:

* Usam Opus no executor.
* Escalam Gate 2 para Opus.

Veja [Critical Paths](/configuration/critical-paths.html) para detalhes.

---

## Resumo das opções

| Override | Onde | Escopo | Exemplo |
| --- | --- | --- | --- |
| **Pontual (task)** | Frontmatter da task | 1 task | `model: opus` em T5 |
| **Por path crítico** | Config embutida em `*-run-tasks` | Todas as tasks que tocam glob | `internal/payments/**` |
| **Global de gate** | Config embutida em `*-run-tasks` | Todos os Gate 1 (ou Gate 2) | `qa_validator_model: opus` |
| **Por skill** | Frontmatter da skill | Toda invocação dessa skill | (raro) |

---

## Auto-escalação ainda funciona

Mesmo com override, a auto-escalação em retry continua ativa. Por exemplo:

* Task declarada `model: opus` → executor já roda em Opus.
* Auto-escalação não tem efeito (não há Opus de "para cima" a escalar).
* Se Gate 2 estiver declarado `model: opus`, a escalação por `qa_security_flags` é redundante mas não causa erro.

---

## Logs

Logs do orquestrador deixam claro quando há override:

```
[T5] executor: opus (declarado) gates: [qa, tech\_review]
[T5] agent-spec-qa-validator: opus (rule: critical\_path)
[T5] agent-spec-staff-architecture-review: opus (rule: qa\_security\_flags)
```

---

## Próximos passos

* [Model Selection](/advanced/model-selection.html) — heurística padrão.
* [Auto-escalação](/advanced/auto-escalation.html) — escala automática em retry.
* [Critical Paths](/configuration/critical-paths.html) — paths que disparam Opus.
* [Custom Executor](/customization/custom-executor.html) — criar agent com modelo padrão diferente.
