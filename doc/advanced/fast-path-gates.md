---
id: "fast-path-gates"
title: "Fast-path Gates"
sidebar_position: 2
---
# Fast-path Gates

Permite **pular gates** em tasks triviais declarando `gates:` no frontmatter da task. **Estático** — escolhido pelo autor da task durante a geração.

> **Diferente de [Gates Condicionais](conditional-gates.md)**: fast-path é declarativo e vale pra task inteira. Gates condicionais (`requires_qa_revalidation`) são calculados em runtime no loop de correção, baseado nas categorias dos problemas reportados pelo Tech Review.

---

## Campo `gates`

```markdown
## 1. Identificação
- gates: none              # sem Gate 1, sem Gate 2 (apenas executor)
- gates: [qa]              # só Gate 1, pula Gate 2
- gates: [qa, tech_review] # default — ambos os gates
```

---

## Quando usar cada modo

### `gates: none`

Task **trivial**, **sem código executável modificado**:

* Apenas docs (README, CHANGELOG, guias).
* Apenas configs puros (`.gitignore`, `Makefile`, `.editorconfig`).
* Sem impacto em ADRs.
* Sem risco de regressão.

**Comportamento**: orquestrador roda **só** o executor. Marca task como Concluído após executor terminar. Registra em `qa-observations.md`:

```markdown
### T9 — executada sem gates (gates: none)
Task trivial sem validação automática. Review manual se necessário.
```

### `gates: [qa]`

Task com **código mas sem impacto arquitetural**:

* Migração de schema puro (sem lógica de dados).
* Refactor isolado em módulo único.
* Diff pequeno (`<100 linhas`).
* Não toca [critical_paths](../configuration/critical-paths.md).

**Comportamento**: executor → Gate 1 ([agent-spec-qa-validator](../agents/qa-validator.md)) com testes. Gate 2 é pulado.

### `gates: [qa, tech_review]` (default)

Fluxo completo. **Use sempre que estiver em dúvida**.

---

## Heurística aplicada pelas skills geradoras (Gates inference rules)

> Definidas em [`.claude/rules/agent-spec-workflow-rules.md`](../configuration/path-templates.md) → seção "Gates inference rules". Aplicadas pelas 3 skills geradoras (`agent-spec-sdd-generate-task-plan`, `agent-spec-minispec-generate-tasks`, `agent-spec-taskcard-generate`) quando o frontmatter da task não declara `gates:` explicitamente.

### Tabela `tipo → gates`

| `tipo` inferido | `gates` |
| --- | --- |
| `docs`, `config_isolada`, `constantes_isoladas` | `none` |
| `wiring/registry` (Wire providers, rotas, barrel exports) | `[qa]` |
| `crud_handler` sobre pattern existente | `[qa]` |
| `service_simples` (≤ 1 sentinela, sem integração externa) | `[qa]` |
| `db_migrations`, `auth`, `security`, `crypto`, `secrets/config` | `[qa, tech_review]` |
| `padrao_novo` / `candidato_adr` | `[qa, tech_review]` |
| `service_complexo` (≥ 2 sentinelas, efeitos colaterais externos) | `[qa, tech_review]` |
| `refactor_cross_module` (≥ 3 módulos/pacotes) | `[qa, tech_review]` |
| `task_risk == high` | `[qa, tech_review]` |
| default na dúvida | `[qa, tech_review]` (conservador) |

### Classificação textual do `tipo`

| Sinais textuais nos arquivos/nome | `tipo` inferido |
| --- | --- |
| `wire`, `provider`, `register`, `routes`, `swag`, `barrel`, `index.ts`, `mod.rs`, `__init__.py` | `wiring/registry` |
| `migration`, `schema`, `.sql` em pasta de migração, `prisma/migrations/` | `db_migrations` |
| `handler`/`controller`/`route` + segue exemplo de outro handler do projeto | `crud_handler` |
| `service` + ≤ 1 sentinela + sem integração externa nova | `service_simples` |
| `service` + ≥ 2 sentinelas OU upload/S3/HTTP externo OU race-condition tratada | `service_complexo` |
| `constante`, `const`, `enum` em arquivo isolado | `constantes_isoladas` |
| `config`, `env`, `viper`, `.env` em arquivo isolado | `config_isolada` |
| `docs`, `.md`, `swagger.yaml` puro | `docs` |
| Toca ≥ 3 pacotes/módulos distintos | `refactor_cross_module` |
| Decide algo que vira ADR (hook ADR do gerador) | `padrao_novo` |

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: rodar Tech Review por default em todas as 10 tasks gastou ~30-50min em wiring/config/constantes triviais. Inferindo `gates` por `tipo`, ~5 das 10 tasks teriam ido para `[qa]`-only, economizando ~30-50min por feature CRUD.

### Log obrigatório no orquestrador

```
[T5] gates: [qa] (inferido: tipo=crud_handler, sem critical_paths)     model: sonnet
[T6] gates: [qa, tech_review] (declarado no frontmatter)                model: sonnet
[T1] gates: [qa, tech_review] (inferido: tipo=refactor_cross_module)    model: opus
```

---

## Exemplos de tasks por modo

### `gates: none`

```markdown
## 1. Identificação
- ID: T9
- Nome: Atualizar README com instruções de setup
- model: sonnet
- risk: low
- gates: none

## 3. Objetivo
Adicionar seção "Setup local" no README com comandos básicos.

## 5.2 Arquivos a Modificar
- README.md
```

### `gates: [qa]`

```markdown
## 1. Identificação
- ID: T8
- Nome: Schema migration: adicionar campo updated_at em pings
- model: sonnet
- risk: low
- gates: [qa]

## 5.2 Arquivos a Criar
- internal/db/migrations/0042_add_updated_at_pings.sql

## 6.1 DEVE
- Migration idempotente (IF NOT EXISTS).
```

> Nesta task tocar `internal/db/migrations/**` é critical path. O orquestrador escala para Opus mesmo com `gates: [qa]`. Mas **só roda Gate 1**.

### `gates: [qa, tech_review]` (default)

```markdown
## 1. Identificação
- ID: T5
- Nome: Service do módulo pings com validação
- model: sonnet
- risk: medium
- gates: [qa, tech_review]
```

---

## Avisos no log do orquestrador

Tasks com fast-path mostram no log:

```
[T9] executor: sonnet (declarado)  gates: none (WARN: sem validação)
[T8] executor: opus (rule: critical_path)  gates: [qa]   (Gate 2 pulado)
[T5] executor: sonnet (declarado)  gates: [qa, tech_review]
```

> O `WARN` em `gates: none` deixa explícito ao usuário que a task **não** passou por validação. Útil para audit trail.

---

## Compatibilidade retroativa

Tasks **antigas** sem o campo `gates:` ganham automaticamente `[qa, tech_review]` (default). Sem migração necessária.

---

## Quando pular gates é arriscado

| Cenário | Por quê é arriscado |
| --- | --- |
| Refactor que mudou imports/ABI | Pode quebrar consumidores; precisa Gate 2 |
| Schema migration com lógica de dados | Validação de testes obrigatória; precisa Gate 1+2 |
| Mudança em path crítico (auth/security/crypto) | Sempre Gate 2 com Opus |
| Task com testes adicionados | Gate 1 obrigatório para executar testes |

> Quando em dúvida, deixe `gates: [qa, tech_review]`. O custo é justificável.

---

## Próximos passos

* [Gates Condicionais](conditional-gates.md) — skip dinâmico durante o loop de correção (`requires_qa_revalidation`).
* [Gates e Loops](../concepts/gates-loops.md) — fluxo completo dos gates.
* [Auto-escalação](auto-escalation.md) — interação com retry.
* [Critical Paths](../configuration/critical-paths.md) — globs que sobrepõem fast-path para Opus.
* [Model Selection](model-selection.md) — campo `model:` complementar.
