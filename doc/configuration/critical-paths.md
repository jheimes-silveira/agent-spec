---
id: "critical-paths"
title: "Critical Paths"
sidebar_position: 3
---
# Critical Paths

Paths sensíveis (auth, security, crypto, migrations, etc.) recebem tratamento especial pelos orquestradores `*-run-tasks`: tasks que tocam esses paths **escalam automaticamente** o executor e os gates para Opus.

> **Onde a heurística vive**: na rule global `.claude/rules/agent-spec-workflow-rules.md`, seção "Critical Paths — Heurística de Áreas Sensíveis". Carregada no system-prompt — nenhuma skill precisa abrir o arquivo.

---

## Por que existem

Áreas de auth/security/crypto/migrations são **alto risco**: bugs nessas regiões podem ter consequências graves (vazamento de dados, IDOR, perda de dados em migrations). Sonnet é capaz, mas Opus oferece pattern recognition mais sofisticado para vulnerabilidades estruturais.

A heurística: **se a task toca um critical path, vale o custo extra do Opus**.

---

## Categorias canônicas (agnósticas de stack)

A heurística é **semântica por path**, não vinculada a uma stack específica. Funciona nativamente para Go (`internal/`), Java (`src/main/`), JS/TS (`src/`), Python (`app/`), Dart (`lib/`) e qualquer outro layout.

| Categoria | Globs cobertos (qualquer linguagem/stack) |
| --- | --- |
| **auth** | `**/auth/**`, `**/authentication/**`, `**/login/**`, `**/sessions/**`, `**/oauth/**` |
| **security** | `**/security/**`, `**/permissions/**`, `**/authorization/**`, `**/access-control/**`, `**/rbac/**` |
| **crypto** | `**/crypto/**`, `**/encryption/**`, `**/hashing/**`, `**/jwt/**`, `**/tokens/**`, `**/keys/**` |
| **db_migrations** | `**/migrations/**`, `**/migrate/**`, `**/db/migrations/**`, `**/schema/migrations/**`, arquivos `*.sql` em pastas de migração |
| **secrets/config** | `**/secrets/**`, `**/credentials/**`, arquivos `.env*`, `secrets.*` |
| **api_contracts** | `**/openapi*`, `**/swagger*`, `**/proto/**`, `**/graphql/schema*`, `**/contracts/**` |
| **payments** | `**/payment/**`, `**/billing/**`, `**/checkout/**`, `**/transaction/**` |

> O match é **case-insensitive e semântico**. Não importa se o módulo está em `internal/auth/`, `src/auth/`, `lib/auth/`, `app/auth/` ou `pkg/auth/` — todos batem com a categoria `auth`.

---

## Como o orquestrador aplica (runtime)

1. Para a task em execução, examine os arquivos declarados nas seções de impacto (criar/modificar) **e** o `git diff --name-only`.
2. Faça match de cada path contra as categorias acima (case-insensitive, semântico).
3. Se **qualquer** path bate com **qualquer** categoria → `diff_touches_critical_path = true`.
4. Use o resultado para escalar:
   * **Executor**: `sonnet → opus` (se ainda não declarado opus).
   * **Gate 2 (Tech Review)**: `sonnet → opus`.
   * Logs no terminal: `[T5] executor: opus (rule: critical_path)`.

---

## Quando você precisa adaptar

Raramente. As categorias canônicas cobrem o vocabulário comum em qualquer stack moderna.

Edite `.claude/rules/agent-spec-workflow-rules.md` apenas se:

* Sua organização usa **nome incomum** para alguma área (ex.: pasta `tofu/` em vez de `secrets/`, módulo `vault/` em vez de `crypto/`).
* Você tem um **path crítico exclusivo do domínio** que não cabe nas 7 categorias (ex.: `**/medical-records/**` num sistema de saúde).
* Você quer **desabilitar** uma categoria (raríssimo — não recomendado).

---

## Comportamento em retry

Se a task entra em retry após rejeição de gate, o orquestrador também aplica auto-escalação por:

* `attempt_count >= 2` → escala (mesmo se path não é crítico).
* `last_severity` ∈ {`high`, `critical`} → escala imediatamente.
* `qa_security_flags` não vazias no JSON do QA → Gate 2 sobe para Opus.

Veja [Auto-escalação](../advanced/auto-escalation.md).

---

## Inspecionando o que foi escalado

Toda escalação é logada em `qa-observations.md` (path em `shared.qa_observations.path`):

```markdown
## 2026-04-28
- T5 — escalado opus (rule: critical_path **/auth/**)
- T7 — escalado opus (rule: attempt_count=2)
- T9 — escalado opus (Gate 2; rule: qa_security_flags=[hardcoded_secret])
```

---

## Próximos passos

* [Auto-escalação](../advanced/auto-escalation.md) — heurística completa em retry.
* [Gates Condicionais](../advanced/conditional-gates.md) — `requires_qa_revalidation` (também em `agent-spec-workflow-rules.md`).
* [Model Selection](../advanced/model-selection.md) — frontmatter de tasks (`model:`, `risk:`, `gates:`).
* [Override Models](../customization/override-models.md) — forçar modelo manualmente.
* [Gates e Loops](../concepts/gates-loops.md) — onde a escalação é aplicada.
