---
id: "path-templates"
title: "Path Templates"
sidebar_position: 2
---
# Path Templates

Referência completa das chaves de path declaradas nas rules `.claude/rules/agent-spec-workflow-rules.md` (paths compartilhados) + `agent-spec-{sdd,minispec,taskcard,adr}-workflow-rules.md` (paths de cada framework), todas carregadas no system-prompt via glob `agent-spec-*`. Visão de alto nível em [framework-paths](/configuration/framework-paths.html). Toda skill resolve paths a partir destas tabelas substituindo as variáveis dinâmicas.

## Variáveis dinâmicas

| Variável | Significado | Exemplo |
| --- | --- | --- |
| `{feature}` | Nome da feature em kebab-case sem acentos | `cardapio-digital` |
| `{version}` | Versão incremental | `v1`, `v2` |
| `{variant}` | Variante da feature: `web`, `mobile` ou `backend`. Registrada em `sdd_state.yaml` / `minispec_state.yaml` e na seção 1 do `tech_spec.md` / `scope.md`. **NÃO** entra no path. | `backend` |
| `{task_id}` | Identificador da task no orquestrador | `T1`, `T2` |
| `{nn}` | Sequencial de TaskCard | `01`, `02` |
| `{slug}` | Slug curto descritivo da TaskCard | `cadastro-usuario` |
| `{id}` | ID numérico da ADR | `0001`, `0042` |

> Convenção: `{feature}` é sempre kebab-case minúsculo sem acento; `{version}` é `v` + número incremental.

---

## SDD — Software Design Document

| Chave | Path resolvido | Skill responsável |
| --- | --- | --- |
| `sdd.prd.path` | `/docs/specs/features/{feature}/{version}/prd.md` | [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) |
| `sdd.tech_spec.path` | `/docs/specs/features/{feature}/{version}/tech_spec.md` | [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) |
| `sdd.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` | [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) |
| `sdd.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` | [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) |
| `sdd.tasks.pattern` | `T{n}.md` | [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) |
| `sdd.state.path` | `/docs/specs/features/{feature}/{version}/sdd_state.yaml` | [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) |
| `sdd.qa_context.path` | `/docs/specs/features/{feature}/{version}/.qa_context.md` | [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) |

---

## miniSpec

| Chave | Path resolvido | Skill responsável |
| --- | --- | --- |
| `minispec.intent.path` | `/docs/specs/features/{feature}/{version}/intent.md` | [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) |
| `minispec.scope.path` | `/docs/specs/features/{feature}/{version}/scope.md` | [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) |
| `minispec.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` | [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) |
| `minispec.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` | [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) |
| `minispec.tasks.pattern` | `T{n}.md` | [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) |
| `minispec.state.path` | `/docs/specs/features/{feature}/{version}/minispec_state.yaml` | [agent-spec-minispec-run-tasks](/skills/minispec/minispec-run-tasks.html) |
| `minispec.qa_context.path` | `/docs/specs/features/{feature}/{version}/.qa_context.md` | [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) |

---

## TaskCard

| Chave | Path resolvido | Skill responsável |
| --- | --- | --- |
| `taskcard.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` | [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) |
| `taskcard.tasks.pattern` | `task-{nn}-{slug}.md` | [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) |
| `taskcard.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` | [agent-spec-taskcard-run](/skills/taskcard/taskcard-run.html) |

---

## Compartilhados (Gates, Memória, Specs)

Usados pelos orquestradores `*-run-tasks` e por [agent-spec-qa-validator](/agents/qa-validator.html) / [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html).

| Chave | Path resolvido | Quem lê / escreve |
| --- | --- | --- |
| `pre_refinement.path` | `/docs/specs/features/{feature}/{version}/pre-refinement.md` | [agent-spec-pre-refinement](/skills/shared/pre-refinement.html), consumido por [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) e [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) |
| `tech_alignment.path` | `/docs/specs/features/{feature}/{version}/tech-alignment.md` | [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) — compartilhado entre SDD e miniSpec |
| `shared.qa_observations.path` | `/docs/specs/features/{feature}/{version}/qa-observations.md` | Orquestradores (`*-run-tasks`) registram auto-escalações e tasks bloqueadas |
| `shared.test_cases.path` | `/docs/specs/features/{feature}/{version}/test-cases.json` | Persistência **lossless** do JSON do [agent-spec-qa-test-generator](/agents/qa-test-generator.html), escrita pelos orquestradores de geração (tech-spec, task-plan, minispec-generate-tasks, taskcard-generate). Forward-only: após o destrinchamento na task, a task markdown é canônica — gates **nunca** leem este arquivo. Consumido pela redistribuição do SDD, debt-resolution e re-render explícito |
| `shared.temp_memory.dir` | `/docs/specs/features/{feature}/{version}/tasks/.tmp/` | Memória temporária volátil (não versionada) |
| `shared.temp_memory.pattern` | `{task_id}.md` | Memória lazy criada **apenas** em rejeições de gate (`base_sha` + sumário do executor passam inline no prompt — sem arquivo) |
| `shared.specs_root` | `/docs/specs` | Varredura cross-feature |
| `shared.specs_glob` | `/docs/specs/**/*.md` | Idem |
| `design_system.global.path` | `/docs/specs/design-system.md` | [agent-spec-design-system-bootstrap](/skills/shared/design-system-bootstrap.html) (consolidação standalone) e [agent-spec-generate-design](/skills/shared/generate-design.html) (updates cirúrgicos) escrevem; tech-spec, scope, geradores de tasks e [agent-spec-qa-validator](/agents/qa-validator.html) leem. **Não versionado** por feature (tokens e componentes vivem mais que qualquer feature) |
| `design.feature.path` | `/docs/specs/features/{feature}/{version}/design.md` | [agent-spec-generate-design](/skills/shared/generate-design.html) escreve; mesmas leitoras. Opcional — só frentes web/mobile; ausência não é erro |

---

## ADR — Architecture Decision Records

| Chave | Path resolvido | Skill responsável |
| --- | --- | --- |
| `adr.dir` | `/docs/adr` | Diretório das ADRs |
| `adr.index_file` | `/docs/adr/INDEX.md` | Regenerado por [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) |
| `adr.file_pattern` | `{id}-{slug}.md` | Padrão do nome de cada ADR |
| `adr.reindex_script` | `/.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` | Script Node.js canônico — dono é [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) |
| `adr.template` | `/.claude/skills/agent-spec-adr-create/assets/adr-template.md` | Template canônico Nygard enxuto — dono é [agent-spec-adr-create](/skills/adr/adr-create.html) |

> Skills auxiliares (`agent-spec-adr-bootstrap`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`) referenciam o template e o script via `adr.template` / `adr.reindex_script` em vez de manter cópias.

---

## Convenções de nomenclatura

| Elemento | Regra | Exemplo correto | Exemplo errado |
| --- | --- | --- | --- |
| Nome da feature | kebab-case, minúsculo, sem acento | `autenticacao-oauth2` | `Autenticação_OAuth2` |
| Versão | `v` + número | `v1`, `v2` | `1`, `version-1` |
| Diretório da feature | `/docs/specs/features/{feature}/{version}/` | `/docs/specs/features/cardapio-digital/v1/` | `/docs/specs/cardapio-digital/` |
| Task ID | `T` + número | `T1`, `T12` | `task-1`, `T-001` |
| TaskCard sequencial | `task-{nn}-{slug}` | `task-01-cadastro-usuario` | `01-cadastro` |

---

## Customizando paths

Edite a rule correspondente em `.claude/rules/` (`agent-spec-workflow-rules.md` para paths compartilhados; `agent-spec-{sdd,minispec,taskcard,adr}-workflow-rules.md` para paths de um framework) e ajuste o template da chave desejada. As skills pegam o novo template no próximo carregamento de system-prompt — nenhuma alteração de código é necessária.

Exemplo — mover ADRs de `/docs/adr/` para `/architecture/decisions/`:

```markdown
- \*\*adr.dir\*\*: `/architecture/decisions`
- \*\*adr.index\_file\*\*: `/architecture/decisions/INDEX.md`
```
> Mantenha o **prefixo `/`** nos paths (raiz do projeto). Skills resolvem o path relativo ao repositório git.

---

## Próximos passos

* [framework-paths.md — Fonte Autoritativa de Paths](/configuration/framework-paths.html) — visão de alto nível do arquivo.
* [Critical Paths](/configuration/critical-paths.html) — declarar áreas que disparam escalação automática.
* [Memória Temporária](/configuration/temp-memory.html) — detalhes do `shared.temp_memory.*`.
