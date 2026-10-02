# Regras de Migração — novo processo (`_run/` + glossário PT)

> Especificação canônica das transformações que `assets/migrate.py` aplica.
> A skill usa este arquivo para **verificar** o resultado (intenção), não só rodar o script.

## 1. Relocações (layout `_run/`)

Por `docs/specs/features/{feature}/{version}/`, via `git mv` (preserva histórico; fallback `os.rename`):

| Antigo (topo) | Novo |
|---|---|
| `qa-observations.md` | `_run/run-report.md` |
| `.workflow-report.md` | `_run/workflow-report.md` |
| `rule-candidates.md` | `_run/rule-candidates.md` |
| `test-cases.json` | `_run/test-cases.json` |
| `.qa_context.md` | `_run/qa_context.md` |
| `sdd_state.yaml` | `_run/sdd_state.yaml` |
| `minispec_state.yaml` | `_run/minispec_state.yaml` |
| `tasks/.tmp/` | `_run/tmp/` |

A **spec autorada** (`prd`/`intent`, `tech_spec`/`scope`, `task_plan`, `tasks/T{N}.md`, `design`, `pre-refinement`, `tech-alignment`, `handoff-frontend`, glossários) **permanece no topo**. Invariante: *se não foi autorado por humano, vive em `_run/`*.

## 2. Reescrita de glossário (SÓ nos artefatos GERADOS)

Aplicada a `_run/run-report.md`, `_run/workflow-report.md`, `_run/rule-candidates.md`:

**Veredito** (word-boundary; cobre células de tabela `✅ approved` e enums):
`approved`→`APROVADO` · `approved_with_observations`→`APROVADO_COM_OBSERVACOES` · `partial`→`PARCIAL` · `rejected`→`REJEITADO` · `skipped_qa_rejected`→`PULADO_QA_REJEITOU`

**Severidade** (delimitada `` `x` `` / `"x"` / `**x**`, blocos de débito `· low ·`, e ancorada a `severity`/`last_severity`):
`critical`→`CRITICO` · `high`→`ALTO` · `medium`→`MEDIO` · `low`→`BAIXO`

**H1 do run-report**: `# QA & Tech Review — {f}/{v}` → `# Relatório do Run — {f}/{v}`

## 3. Refs de path (em TODOS os arquivos — gerados E specs autoradas)

Qualquer menção a path antigo é atualizada (com guarda `(?<!_run/)` contra dupla prefixação): `tasks/.tmp`→`_run/tmp`, `.workflow-report.md`→`_run/workflow-report.md`, `qa-observations.md`→`_run/run-report.md`, etc.

> Em specs autoradas, **só** refs de path mudam — o glossário NÃO é reescrito (uma spec descreve o que construir, não é saída de gate).

## 4. Fronteiras — NUNCA converter (mesmas do framework)

- **`status: approved`/`pending`** no frontmatter de `prd`/`tech_spec`/`task_plan` — é o **ciclo de vida da spec**, eixo separado do veredito de gate. Protegido por lookbehind `status: `.
- **`risk: low|medium|high`**, `task_risk == high` — eixo **risco da task** (escalação de modelo).
- **`reasoning_effort` (low/medium/high)** — parâmetro da API.
- **Smell names** em snake_case EN (`mock_driven_confidence` etc.).
- Severidade nunca é convertida como **palavra solta** (senão "critical path", "below", "workflow" corrompem) — só delimitada / ancorada / em bloco `· x ·`.

## 5. Idempotência & segurança

- **Dry-run é o padrão.** Nada é escrito sem `--apply` (e sem confirmação humana na skill).
- **Idempotente**: se o destino já existe em `_run/`, a relocação é **pulada** (não sobrescreve). A guarda `(?<!_run/)` evita re-prefixar refs já migradas.
- **Não-destrutivo**: nunca apaga spec autorada; só relocaliza gerados e reescreve tokens.
- **Pré-requisito recomendado**: working tree limpo/commitado antes do `--apply` (o `git mv` deixa tudo staged e revisável; reverter = `git checkout`).
- Features já no novo layout passam sem relocação, mas ainda recebem correção de glossário/refs se houver resíduo.
