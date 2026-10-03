---
id: "taskcard"
title: "TaskCard"
sidebar_position: 3
---
# TaskCard

`TaskCard`

Caminho leve para tasks pontuais. **Uma TaskCard = uma entrega atômica** com escopo fechado, guardrails e critérios de aceite objetivos. Gera 1 arquivo `.md` e roda gates QA + Tech Review.

> 🗺️ **[Fluxograma completo do TaskCard](fluxogramas/taskcard.md)** — ecossistema visual com o fluxo principal e todos os alternativos (reprovações nos gates, loops de correção, débito).

---

## Por que TaskCard existe

Para casos onde TaskCard é overkill:

* Conversa direta basta para spike/aprendizado.

Para casos onde TaskCard fica curta:

* 1-3 User Stories distintas → use [miniSpec](minispec.md).
* 4+ US, multi-persona, ADR nova → use [SDD](sdd.md).

A TaskCard cobre o **meio**: implementação pontual em 1-3 arquivos, padrões já existentes, guardrails claros.

---

## Quando usar

### Standard mode (default)

* Escopo fechado em **1-2 arquivos**.
* **Nenhuma decisão arquitetural nova**.
* Está reusando padrão existente no codebase.
* Solo, sem validação de produto/design.

**Exemplos**:

* "Adicionar validação de CPF no endpoint X".
* "Refatorar função Y para usar padrão existente Z".
* "Atualizar lib W para versão mais recente".
* "Bug fix na função de paginação".

### CRUD Fast-Path mode ⚡

* CRUD completo de **uma entidade nova** repetindo pattern existente no projeto.
* Passa em todos 6 critérios do [gate S9](../discovery/strategy-selector.md) (CRUD-pattern-repeat).
* Tempo alvo: **30-45min wall-clock** para CRUD de 4-6 campos × 4-6 endpoints.

**Exemplos**:

* "CRUD de pratos de franquia (nome, nome no buffet, PDF da ficha técnica, status ativo)".
* "CRUD de categorias de produto seguindo o pattern de `internal/api/handlers/marcas/`".

## Quando **não** usar

* Múltiplas US distintas → use [miniSpec](minispec.md).
* Decisão arquitetural nova ou greenfield → use [SDD](sdd.md).
* Spike/aprendizado → use [Conversa direta](conversa-direta.md).

---

## Skills do framework

```
[discovery opcional] → agent-spec-taskcard-generate → agent-spec-taskcard-run
                       (gera task-NN-slug.md)        (executa com gates)
```

| Skill | Etapa | Documentação |
| --- | --- | --- |
| [agent-spec-taskcard-generate](../skills/taskcard/taskcard-generate.md) | Gera TaskCard com 11 seções, delega §10 (Testes) ao [agent-spec-qa-test-generator](../agents/qa-test-generator.md) | Generator |
| [agent-spec-taskcard-run](../skills/taskcard/taskcard-run.md) | Executa a TaskCard com gates QA + Tech Review | Orchestrator |

---

## Artefatos gerados

```
docs/specs/features/<feature>/<version>/
└── tasks/
    └── task-{nn}-{slug}.md          # ex.: task-01-validar-cpf.md
```

Path resolvido via `taskcard.tasks.dir` + `taskcard.tasks.pattern` no [framework-paths.md](../configuration/framework-paths.md).

---

## Estrutura da TaskCard (11 seções)

1. **Identificação** (frontmatter: model, risk, gates)
2. **Objetivo**
3. **Descrição**
4. **Aceite Técnico** (critérios objetivos)
5. **Escopo** (DENTRO / FORA)
6. **Guardrails** (DEVE / NÃO DEVE)
7. **Restrições**
8. **Arquivos Envolvidos**
   * 8.1 Existentes (leitura)
   * 8.2 A criar
   * 8.3 A modificar
9. **Dependências**
10. **Testes** (subseções 10.1 a 10.6 — delegada ao agent-spec-qa-test-generator)
11. **Checklist final**

---

## Pipeline (fluxo completo)

```
1. /agent-spec-pre-refinement (opcional)              → pre-refinement.md (recomenda TaskCard)
2. /agent-spec-taskcard-generate             → tasks/task-{nn}-{slug}.md
3. /agent-spec-taskcard-run <task> [agent]   → executa com gates
                                              (executor → Gate 1 → Gate 2 → git add)
```

Detalhes operacionais em [Pipeline — agent-spec-taskcard-run](../pipeline/taskcard-run.md).

---

## Modos de geração — Standard vs CRUD Fast-Path

### Standard mode

```bash
/agent-spec-taskcard-generate "<descrição>"
```

Comportamento normal:

* Template completo (seções 1-11).
* Perguntas interativas (4-5 via `AskUserQuestion`).
* Pode decompor em N TaskCards + `task_plan.md` se a entrega exigir.
* `gates: [qa, tech_review]` por default (ou inferido pelas [Gates inference rules](../advanced/fast-path-gates.md)).

### CRUD Fast-Path mode ⚡

```bash
/agent-spec-taskcard-generate --mode=crud-fastpath "<descrição>"
```

Ativado por flag explícita OU automaticamente quando o `pre-refinement.md` tem `S9 = sim` em §15.

Comportamento enxuto:

* **Template reduzido**: preenche §1, §3, §5, §8, §9, §10, §11; marcadores mínimos em §4/§6/§7.
* **2 perguntas apenas** (entidade + endpoints) em vez de 4-5.
* **1 única TaskCard** cobrindo a feature CRUD inteira — NÃO decompõe em N.
* **`gates: [qa]`** por default (pula Tech Review). Justificativa: pattern repetido sem decisão arquitetural.
* **1 chamada batched do `agent-spec-qa-test-generator`** para a feature inteira (não 1 por endpoint).
* **Frontmatter inclui `source: crud-fastpath`** para auditoria.

## Frontmatter da TaskCard

```markdown
---
id: TC-001
model: sonnet            # ou opus se crítico
risk: low                # low | medium | high
gates: [qa, tech_review] # default Standard; CRUD Fast-Path usa [qa]
source: <recommended | overridden | no_discovery | crud-fastpath>
---
```

`model` e `gates` controlam:

* Modelo do executor (auto-escala para `opus` em critical paths).
* Quais gates são executados ([fast-paths](../advanced/fast-path-gates.md) permitem pular).

Veja [Model Selection](../advanced/model-selection.md) e [Fast-path Gates](../advanced/fast-path-gates.md).

---

## Gates ativos

Toda TaskCard executada via [agent-spec-taskcard-run](../skills/taskcard/taskcard-run.md) passa por:

| Gate | Agent | Quando |
| --- | --- | --- |
| **Gate 1** | [agent-spec-qa-validator](../agents/qa-validator.md) | Após executor concluir |
| **Gate 2** | [agent-spec-staff-architecture-review](../agents/staff-architecture-review-agent.md) | Após Gate 1 aprovar |

Loop de correção até **3 tentativas TOTAIS** com auto-escalação sonnet→opus. Detalhes em [Gates e Loops](../concepts/gates-loops.md).

---

## Custo típico

### Standard mode

| Etapa | Tokens |
| --- | --- |
| Geração da TaskCard | ~20-40k |
| Execução com gates | ~50-100k |
| **Total** | **~80-150k** |

Com `gates: [qa]` (pula Tech Review) ou `gates: none` (sem gates), o custo cai significativamente.

### CRUD Fast-Path mode

| Etapa | Tokens (estimado) |
| --- | --- |
| Geração da TaskCard (template reduzido, 2 perguntas, 1 chamada batched do agent-spec-qa-test-generator) | ~15-25k |
| Execução com `gates: [qa]` (Tech Review pulado) | ~25-40k |
| **Total** | **~40-65k** |

Wall-clock: **30-45min** para CRUD de 4-6 campos × 4-6 endpoints. Vs ~2h no fluxo Standard.

---

## Customização via framework-paths.md

Editando `.claude/rules/framework-paths.md`, você pode:

* Mover `tasks/` para outra pasta (`taskcard.tasks.dir`).
* Mudar pattern do nome (`taskcard.tasks.pattern`).

Veja [Path Templates](../configuration/path-templates.md).

---

## Exemplo

```bash
# 1. (opcional) Discovery
/agent-spec-pre-refinement "validação de CPF no cadastro"

# 2. Gerar TaskCard
/agent-spec-taskcard-generate "adicionar validação de CPF no endpoint POST /users"

# 3. Executar com gates
/agent-spec-taskcard-run docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf.md <seu-executor>
```

```
[Geração: TaskCard salva em tasks/task-01-validar-cpf.md]
[Execução: executor → Gate 1 APROVADO → Gate 2 approved → git add]

✅ TaskCard concluída.
```

---

## Próximos passos

* [agent-spec-taskcard-generate (skill)](../skills/taskcard/taskcard-generate.md)
* [agent-spec-taskcard-run (skill)](../skills/taskcard/taskcard-run.md)
* [Pipeline — agent-spec-taskcard-run](../pipeline/taskcard-run.md) — operacional.
* [miniSpec](minispec.md) — para escopo um pouco maior.
* [Strategy Selector](../discovery/strategy-selector.md) — checklist de decisão.
