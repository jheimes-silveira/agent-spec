---
id: "framework-paths"
title: "Rules de paths — Fonte Autoritativa"
sidebar_position: 1
---
# Rules `agent-spec-*` — Fonte Autoritativa de Paths

A configuração de paths e regras transversais do framework vive em **rules** dentro de `.claude/rules/`, carregadas automaticamente no system-prompt quando os globs declarados no frontmatter (`paths:`) casam com o contexto da sessão. Skills resolvem paths a partir desse contexto sem precisar abrir nenhum arquivo.

> **Princípio**: skills são auto-contidas. Os paths que elas precisam para gravar/ler artefatos vêm das rules `agent-spec-*`; comportamento (gates, escalações, allowlists) vive embutido na própria skill. Não há arquivo de configuração paralelo.

---

## As 6 rules

| Rule | Conteúdo |
| --- | --- |
| `.claude/rules/agent-spec-shared.md` | Regras transversais (ex.: acentuação pt-BR obrigatória, convenções gerais) |
| `.claude/rules/agent-spec-workflow-rules.md` | **Comum a todos os fluxos de trabalho**: critical paths heurística agnóstica, classificação `requires_qa_revalidation` para gates condicionais, paths compartilhados (temp_memory, qa_observations, **rule_candidates**, agent-spec-pre-refinement, tech-alignment), vocabulário canônico de sinais para [rule mining](../skills/shared/mine-rule-candidates.md), convenções de nomenclatura |
| `.claude/rules/agent-spec-sdd-workflow-rules.md` | Paths do framework **SDD** (PRD, tech_spec, task_plan, tasks/) |
| `.claude/rules/agent-spec-minispec-workflow-rules.md` | Paths do framework **miniSpec** (intent, scope, task_plan, tasks/) |
| `.claude/rules/agent-spec-taskcard-workflow-rules.md` | Paths do framework **TaskCard** |
| `.claude/rules/agent-spec-adr-workflow-rules.md` | Paths do framework **ADR** (dir, INDEX, file_pattern, template, reindex_script) |

---

## Como as rules chegam no contexto

Nenhuma das rules tem `paths` no frontmatter. Pela [documentação oficial](https://code.claude.com/docs/en/memory.md#set-up-rules), rules sem filtro de path são carregadas no system-prompt na inicialização da sessão, com a mesma prioridade do `CLAUDE.md` da raiz.

Resultado prático: ao iniciar o Claude Code num projeto que tem o framework instalado, **toda skill já enxerga**:

* Os templates de path (ex.: `sdd.prd.path → /docs/specs/features/{feature}/{version}/prd.md`).
* A heurística de critical paths (categorias `auth`, `security`, `crypto`, `db_migrations`, `secrets/config`, `api_contracts`, `payments`).
* A classificação de problemas do Tech Review (categorias que forçam re-QA vs. categorias `code_review_only`).
* As convenções (`{feature}` em kebab-case, `{version}` como `v1/v2`, `{variant}` como `web/mobile/backend`).

Sem reler nenhum arquivo, sem parser, sem build step.

---

## E o `CLAUDE.md` da raiz?

O `CLAUDE.md` continua existindo, mas carrega apenas **configurações globais específicas do projeto** (ex.: estrutura do site de docs, env vars locais, customizações pontuais). Ele referencia explicitamente as rules `agent-spec-*` para que quem abrir o arquivo saiba onde os paths e regras vivem — mas o conteúdo canônico está nas rules, não no `CLAUDE.md`.

Você não precisa abrir o `CLAUDE.md` para entender ou customizar paths do framework. Vá direto na rule correspondente em `.claude/rules/`.

---

## O que tem dentro de cada rule

### `agent-spec-shared.md`

Regras transversais a todos os workflows. Pequena (poucas dezenas de linhas). Hoje cobre principalmente a **regra de acentuação pt-BR**.

### `agent-spec-workflow-rules.md`

**A mais importante.** Contém:

* **Paths compartilhados**: `agent-spec-pre-refinement`, `tech-alignment`, `qa_observations`, `rule_candidates` (append-only por feature; consumido por [`agent-spec-mine-rule-candidates`](../skills/shared/mine-rule-candidates.md) — lazy: só nasce quando o primeiro sinal qualifica), `test_cases` (`test-cases.json` — persistência **lossless** do JSON do [`agent-spec-qa-test-generator`](../agents/qa-test-generator.md), escrita pelos orquestradores de geração; forward-only — após o destrinchamento na task, a task markdown é canônica e gates nunca leem o arquivo), `temp_memory.{dir,pattern}` (memória lazy de retry — `base_sha` e sumário do executor passam inline no prompt, sem arquivo), `specs_root`.
* **Design — Dois Níveis** (opcional, só frentes web/mobile): `design_system.global.path` (`/docs/specs/design-system.md` — tokens, biblioteca de componentes, breakpoints; **não versionado** por feature) e `design.feature.path` (`/docs/specs/features/{feature}/{version}/design.md` — layout, estados visuais e interações da feature). Em dúvida, o conteúdo vai pro **FEATURE**; na leitura, consumidores leem global → feature e o **FEATURE sobrescreve** em conflito (sinalizando a sobrescrita). Quem escreve: [`agent-spec-generate-design`](../skills/shared/generate-design.md) (dona do FEATURE + updates cirúrgicos do global) e [`agent-spec-design-system-bootstrap`](../skills/shared/design-system-bootstrap.md) (consolidação standalone do GLOBAL); tech-spec, scope, geradores de tasks e [`agent-spec-qa-validator`](../agents/qa-validator.md) (Camada 4) apenas leem e referenciam. Ausência dos arquivos **não é erro** — o fluxo segue normal.
* **Invariante de Paralelismo (contrato canônico)**: o flag `Pode Rodar em Paralelo?` é **derivado, nunca autorado**. O autor de tasks declara apenas `Dependências`, `Símbolos públicos criados` e `Símbolos consumidos de outras tasks`; duas tasks só são paralelo-seguras se passam em TODOS os guards: mesma fase, **independência no DAG** (sem ancestral/descendente direto ou transitivo), **disjunção de símbolo** (consumidos ∩ criados = ∅ nos dois sentidos), **paths disjuntos** e **nenhum arquivo de alta contenção** em comum — com lote ≤ `MAX_PARALLEL = 4`. Default em qualquer incerteza: `Não` (falso-sequencial custa minutos; falso-paralelo corrompe a ordem). Os executores `*-run-tasks` **re-verificam** o flag — nunca confiam cego na coluna.
* **Arquivos de Alta Contenção** (agnóstico de stack): 5 categorias de arquivos de registro compartilhado que forçam sequencial — DI/container/registro, router/registry/menu, barrels/public exports (`index.ts`, `__init__.py`, …), manifests/lockfiles (`go.mod`, `package.json`, `pubspec.yaml`, …) e o ledger de `migrations/` (a ordem/numeração é estado compartilhado).
* **Reconciliação de Dependências**: o `TN.md` (seção 1) é a fonte **autoritativa**; em divergência com a tabela do `task_plan.md`, o executor usa a **UNIÃO** (mais conservador) e registra a reconciliação em `qa-observations.md`. Parsing tolerante (`—`, `Nenhuma`, `T1 e T2`, etc.).
* **Vocabulário canônico de sinais para rule mining**: 8 sinais (`executor_askquestion`, `pre_refinement_decision`, `exemplar_file_read`, `repeated_fixture`, `repeated_assertion_shape`, `convention_drift`, `scope_deviation`, `speculative_complexity`) — emitidos pelos orquestradores de execução (`*-run-tasks` e `agent-spec-taskcard-run`), [`agent-spec-qa-validator`](../agents/qa-validator.md) e [`agent-spec-staff-architecture-review`](../agents/staff-architecture-review-agent.md), persistidos pelo orquestrador em `rule_candidates.path`.
* **Critical paths heurística (agnóstica)**: 7 categorias canônicas com glob-patterns multi-stack (`**/auth/**`, `**/migrations/**`, etc.).
* **Tech Review correction — classificação `requires_qa_revalidation`**: tabela de categorias do JSON do Gate 2 + algoritmo determinístico + sinais de override. Veja [Gates Condicionais](../advanced/conditional-gates.md).
* **Convenções**: `{feature}` kebab-case, `{version}`, `{variant}`.

### `agent-spec-sdd-workflow-rules.md`

Paths SDD: `sdd.prd.path`, `sdd.tech_spec.path`, `sdd.task_plan.path`, `sdd.tasks.dir`, `sdd.tasks.pattern`, `sdd.state.path`, `sdd.qa_context.path`.

### `agent-spec-minispec-workflow-rules.md`

Paths miniSpec: `minispec.intent.path`, `minispec.scope.path`, `minispec.task_plan.path`, `minispec.tasks.dir`, `minispec.state.path`.

### `agent-spec-taskcard-workflow-rules.md`

Paths TaskCard: `taskcard.tasks.dir`, `taskcard.tasks.pattern`, `taskcard.task_plan.path`.

### `agent-spec-adr-workflow-rules.md`

Paths ADR: `adr.dir`, `adr.index_file`, `adr.file_pattern`, `adr.template`, `adr.reindex_script`.

Veja [Path Templates](path-templates.md) para a referência completa de cada chave.

---

## Como skills usam as rules

Toda skill que toca disco resolve paths em **3 passos**:

1. **Identifica a chave canônica** declarada na rule do workflow (ex.: `sdd.prd.path` em `agent-spec-sdd-workflow-rules.md`).
2. **Substitui as variáveis dinâmicas** (`{feature}`, `{version}`, `{task_id}`, `{nn}`, `{slug}`).
3. **Lê ou escreve** no path resolvido.

Exemplo concreto — `agent-spec-sdd-generate-prd` salvando o PRD para a feature `cardapio-digital v1`:

```
Chave canônica:    sdd.prd.path
Template:          /docs/specs/features/{feature}/{version}/prd.md
Substituição:      {feature} = cardapio-digital, {version} = v1
Path resolvido:    /docs/specs/features/cardapio-digital/v1/prd.md
```

> **Regra inviolável**: nenhuma skill pode usar path fixo no código. Se o template muda na rule, a skill se adapta automaticamente sem alteração de código.

---

## Quando editar as rules

Na maioria dos projetos, **ninguém edita**. As convenções padrão (`/docs/specs/features/{feature}/{version}/...`) cobrem o caso geral.

Você só precisa editar se:

* Quiser **mover artefatos para outra pasta** (ex.: usar `/specs/` em vez de `/docs/specs/`) — edite a rule do workflow correspondente.
* Estiver mantendo **múltiplos projetos** com convenções diferentes no mesmo workspace.
* Tiver requisitos corporativos para ter ADRs em `/architecture/decisions/` em vez de `/docs/adr/` — edite `agent-spec-adr-workflow-rules.md`.
* Precisar adicionar uma categoria de critical path com nome incomum (ex.: pasta `tofu/` em vez de `secrets/`) — edite `agent-spec-workflow-rules.md`.

Para detalhes do que muda em cada chave, veja [Path Templates](path-templates.md).

---

## Próximos passos

* [Path Templates](path-templates.md) — referência completa de cada chave.
* [Critical Paths](critical-paths.md) — heurística agnóstica de áreas sensíveis (vive em `agent-spec-workflow-rules.md`).
* [Gates Condicionais](../advanced/conditional-gates.md) — `requires_qa_revalidation` (também em `agent-spec-workflow-rules.md`).
* [Conceito: framework-paths](../concepts/framework-paths.md) — visão de alto nível do papel das rules.
