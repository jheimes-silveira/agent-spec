---
id: "agent-spec-taskcard-generate"
title: "agent-spec-taskcard-generate"
sidebar_position: 1
---
# agent-spec-taskcard-generate

`TaskCard` `Generator`
> **Resumo**: Gera uma TaskCard individual — unidade atômica de trabalho técnico com escopo fechado, guardrails e critérios de aceite objetivos. Conduz processo interativo (uma pergunta por vez) e delega §10 (Testes) ao [agent-spec-qa-test-generator](../../agents/qa-test-generator.md).

---

## Quando usar

* Task isolada com escopo fechado em 1-2 arquivos.
* Reuso de padrão existente no codebase, sem decisão arquitetural nova.
* Bug fix, ajuste, refactor pontual.
* Quando o [Strategy Selector](../../discovery/strategy-selector.md) recomendou TaskCard.

## Quando NÃO usar

* Feature com User Stories múltiplas → use [agent-spec-minispec-generate-intent](../minispec/minispec-generate-intent.md).
* Feature grande, multi-persona, ADR nova → use [agent-spec-sdd-generate-prd](../sdd/sdd-generate-prd.md).
* Spike / aprendizado → [Conversa direta](../../frameworks/conversa-direta.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `$ARGUMENTS` (contexto da tarefa ou Intent + Scope) | Usuário | Sim |
| `pre-refinement.md` | [agent-spec-pre-refinement](../shared/pre-refinement.md) | Não (recomendado) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `task-{nn}-{slug}.md` | `taskcard.tasks.dir` + `taskcard.tasks.pattern` → `/docs/specs/features/{feature}/{version}/tasks/task-01-cadastro-usuario.md` | [agent-spec-taskcard-run](taskcard-run.md), executor |

---

## Fluxo de execução

### FASE 0.-1 — Detecção da Frente (Web | Mobile | Backend) — SEMPRE PERGUNTAR

**Primeira ação da skill, antes de detectar modo ou ler o agent-spec-pre-refinement.** TaskCard usa **template único**, mas a frente escolhida é necessária para:

* Alimentar o subagente [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) (parâmetro `frente`) na FASE 6.
* Preencher o campo `Variante` no frontmatter da TaskCard (seção 1).
* Calibrar a heurística de `model`/`risk` (FASE 3) quando os paths são ambíguos.

**Regra dura**: pergunta **OBRIGATÓRIA** e **SEMPRE** disparada via `AskUserQuestion`. Não infere a partir de paths, nome da feature ou contexto.

**Procedimento**:

1. **Pré-leitura opcional** (só para sugerir default): se houver `tech_alignment.path`, `minispec.scope.path` ou `sdd.tech_spec.path` derivável, tenta extrair a variante registrada e reserva como **opção destacada** ("Recomendado").
2. **Pergunta obrigatória** (sempre via `AskUserQuestion`):
   > "Qual é a frente desta TaskCard? `Web` | `Mobile` | `Backend`"

**Persistência:**

* FASE 6: enviada ao `agent-spec-qa-test-generator` como parâmetro `frente`.
* FASE 5: preenche campo `Variante` do frontmatter/seção 1.
* Variável de sessão `taskcard.variant` reaproveitada em modo batch e CRUD Fast-Path.

> **Por que SEMPRE perguntar**: TaskCard pode ser invocada sem upstream (`scope.md`/`tech_spec.md`). Sem fonte canônica, inferência é frágil — pergunta explícita custa 1 turn e elimina ambiguidade.

### FASE 0.0 — Detecção de modo (Standard vs CRUD Fast-Path) ⚡

Antes de tudo, detecta o modo:

* **Standard mode (default)**: comportamento normal — template completo, perguntas interativas, decomposição em N TaskCards se necessário.
* **CRUD Fast-Path mode**: ativado quando:
  + `$ARGUMENTS` começa com `--mode=crud-fastpath` (flag explícita), **OU**
  + `pre-refinement.md` da feature tem `S9 = sim` em §15.1 + §15.2 recomenda "TaskCard CRUD Fast-Path".

Veja [Strategy Selector](../../discovery/strategy-selector.md) e [TaskCard — Frameworks](../../frameworks/taskcard.md) para detalhes do modo.

**Diferenças entre os modos**:

| Aspecto | Standard mode | CRUD Fast-Path |
| --- | --- | --- |
| **Template** | 11 seções completas | Enxuto: TODAS as seções em formato reduzido (§2 em 2 linhas, §4 com 1-3 bullets, §6 com ADRs + pattern, §7 com checklist de 5-7 itens; §8 inclui a 8.1 com os arquivos exemplares do pattern) |
| **Perguntas interativas** | 4-5 perguntas (escopo, arquivos, restrições, dependências, aceite) | 2 perguntas (entidade+campos, endpoints) |
| **Granularidade** | Múltiplas TaskCards OK | **1 TaskCard apenas** para a feature CRUD inteira |
| **Gates default** | Inferido por tipo (`[qa]` ou `[qa, tech_review]`) | **`gates: [qa]`** forçado |
| **`task_plan.md`** | Pode criar (se múltiplas TaskCards) | **NÃO cria** — 1 TaskCard só |
| **Chamadas agent-spec-qa-test-generator** | 1 por TaskCard | **1 batched** para a feature inteira |
| **Tempo alvo** | 30-90min por TaskCard | **30-45min total** para a feature CRUD |

### FASE 0 — Pré-verificação

Lê `pre-refinement.md` (se existir) e checa recomendação de framework. Aviso não-bloqueante se divergente.

### FASE 1 — Análise obrigatória do projeto

Inclui sub-passo **1.2 — Inventário de ADRs Aplicáveis** (obrigatório se `docs/adr/` existe):

1. Lista todas as ADRs em `docs/adr/INDEX.md` com status `Accepted`.
2. Para cada ADR, marca `APLICÁVEL` / `PARCIAL` / `N/A` com 1 linha de motivo, citando a seção da TaskCard afetada.
3. Para cada `APLICÁVEL`/`PARCIAL`, adiciona **item explícito na seção 6 (Guardrails — DEVE)** da TaskCard: "Obedecer ADR-XXXX: <descrição curta da regra>". Vira **guardrail bloqueante para o executor**.
4. Escreve a subseção canônica **"ADRs Aplicáveis nesta Feature"** na §11 (Notas) — uma linha por ADR (`ADR-NNNN — descrição curta`), ou "Nenhuma". É o nome exato auditado pela [/agent-spec-adr-review](../adr/adr-review.md) (rastreabilidade Feature→ADR).

### FASE 2 — Construção interativa

**Standard mode**: faz 4-5 perguntas via `AskUserQuestion`.

**Standard mode — sub-passo 2.1 (Gate Anti-Agregação) ⚡**: ao mapear arquivos preliminares (§8.2/§8.3), conta arquivos de contrato (DTOs/Requests/Responses/types) e handlers. Se `≥ 3 contratos novos + ≥ 1 handler com lógica` → pergunta:

> "Histórico mostra que esse formato cascateia retrabalho. Quebrar em (A) TaskCard de base+contratos e (B) TaskCard(s) de handler(s)?"

Opções: `Sim, quebrar em 2+ TaskCards` | `Não, manter agregado (justificativa em source_note)` | `Other`.

**CRUD Fast-Path mode**: 2 perguntas apenas (entidade+campos / endpoints).

### FASE 3 — Heurística model/risk/gates

Preenche frontmatter (seção 1):

* `model`: `sonnet` default; `opus` se area crítica.
* `risk`: `low` | `medium` | `high`.
* `gates`: **inferido pela [Gates inference rules](../../advanced/fast-path-gates.md)** a partir do `tipo` da TaskCard. CRUD Fast-Path força `gates: [qa]`.

### FASE 5 — Construção do template

**Standard mode**: preenche todas as 11 seções padronizadas:

1. Identificação (frontmatter) — inclui **Variante**, **mode**, **source/source_note** (instrumentação de aderência ao discovery) e **Símbolos públicos criados/consumidos** ⚡ (direção de dependência de símbolo entre cards; usados pela validação de ordem da FASE 8 — em execução, o run processa 1 card por vez e a ordem é do usuário)
2. Objetivo
3. Descrição
4. Aceite Técnico
5. **Escopo (DENTRO / FORA)** + **Subseção 5.1 — Exemplo de Payload** ⚡ (obrigatório se TaskCard expõe endpoint `PUT`/`PATCH` parcial)
6. Guardrails (DEVE / NÃO DEVE) — inclui ADRs aplicáveis (FASE 1.2)
7. Restrições
8. Arquivos Envolvidos (8.1 existentes, 8.2 a criar, 8.3 a modificar)
9. Dependências
10. Testes — delegada ao [agent-spec-qa-test-generator](../../agents/qa-test-generator.md)
11. Checklist final

**CRUD Fast-Path mode (FASE 6.5)**: template enxuto. Preenche TODAS as seções em formato reduzido (fonte de verdade: FASE 6.5.2), incluindo §8.1 com os arquivos exemplares do pattern e `mode: crud-fastpath` no frontmatter. `gates: [qa]`. **1 chamada batched** do agent-spec-qa-test-generator para a feature inteira (não 1 por endpoint).

### Subseção 5.1 — Exemplo de Payload (`PUT`/`PATCH` parcial)

Para endpoint que aceita atualização parcial, exige:

1. Exemplo de body/form **mínimo** (só com 1 campo).
2. Observação literal: "campos ausentes ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request — apenas o ID na URL é obrigatório".
3. **Distinção POST vs PUT/PATCH**:

| Operação | Comportamento de campos |
| --- | --- |
| `POST` (criação) | Campos obrigatórios continuam obrigatórios (`binding:"required"`, `@NotNull` aplicam) |
| `PUT`/`PATCH` parcial (atualização) | Campos ausentes são ignorados — **nenhum** é obrigatório no Request, apenas o ID na URL |

Marca "N/A — sem payload parcial" se não aplicável.

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: T9 gastou rodada extra porque o executor copiou `binding:"required"` do `POST` para o `PUT`. Payload-exemplo explícito com a observação literal acima elimina a ambiguidade no executor.

### FASE 6 — Delegação da §10 (Testes)

* O prompt do agente passa `arquivos`, `instruções` **e `frente`** (da FASE 0.-1), e manda ler a doutrina **via Read** (subagentes não invocam skills).
* **Exceção N/A**: `gates: none` por tipo docs/config/constantes → NÃO dispara o agente; §10 recebe `N/A — task não envolve código testável` (literal que o run reconhece).
* **Modo batch** (≥ 2 TaskCards do mesmo domínio): 1 chamada com envelope por TC-ID — formalizado no contrato do agente (`{"TC-001": <schema>, "TC-002": <schema>}`).

### FASE 7 — Formatação e edição da §10

Transforma JSON do agent-spec-qa-test-generator em §10 (10.1 a 10.6) da TaskCard. Regras-chave: agrupamento da 10.2 por **`owning_layer`** (agnóstico de frente); **§10.2.1 Detalhamento dos Casos de Teste** — 1 card lossless por CT (Invariant, Owning layer, Pré-condições, Passos, Resultado esperado, Negative companion, Precondição privilegiada), destrinchado do JSON: 10.1/10.2 são o **índice**, o card é o **detalhe** que o revisor humano valida self-contained e o executor implementa; sub-bullet **"Setup (caminho legítimo)"** quando `precondicao_privilegiada.presente == true` (receita do seam — Iron Law #6, consumida pelo executor no run); coluna Tipo da 10.6 com o **enum completo** (Unitário/Integração/Componente/E2E/Segurança/Acessibilidade); padrões da 10.4 extraídos de **`stack_discovery`**; célula vaga em Expected (índice ou card) é bloqueante. Ao final, o JSON é persistido integralmente em `shared.test_cases.path` (`test-cases.json`, `task_id` = TC-ID por caso; no batch, a chave do envelope) — forward-only: após o destrinchamento, a TaskCard é canônica.

### FASE 8 — Salvamento e Task Plan

Resolve path com `taskcard.tasks.dir` + `taskcard.tasks.pattern`. Com **≥ 2 TaskCards**, criar o `task_plan.md` é **obrigatório** (tabela com Ordem, ID, Dependências e Status — **sem coluna de paralelismo**: o run executa 1 card por vez; a coluna Status é atualizada pelo run). **CRUD Fast-Path NÃO cria `task_plan.md`** — é 1 TaskCard apenas.

> **Coerência de dependências e escopo (quando há múltiplas TaskCards)**: antes de fixar a ordem no `task_plan.md`, valide (bloqueante): nenhuma card referencia símbolo nascido em card posterior (mover ref OU reordenar); mudança com blast radius além dos arquivos tocados lista os dependentes em §8.3 e valida no escopo do blast radius; mudança de assinatura inclui os dependentes mecanicamente forçados em §8.3 (não é `scope_deviation`). *(Originado do run `esqueci-a-senha`, onde uma referência a símbolo de task posterior forçou reorder em execução.)*

---

## Gates invocados

* **[agent-spec-qa-test-generator](../../agents/qa-test-generator.md)** — para gerar Seção 10 (Testes) com casos de teste de alto valor.

> Esta skill **não** roda gates de validação. Apenas geração.

---

## Princípios de design da TaskCard

| Princípio | Aplicação |
| --- | --- |
| **Atômica** | Uma única entrega clara. Se precisa de 5+ arquivos, é miniSpec. |
| **Escopo fechado** | Limites explícitos (DENTRO / FORA). |
| **Guardrails objetivos** | DEVE / NÃO DEVE invalidam a task se violadas. |
| **Aceite técnico mensurável** | Critérios que LLMs e humanos podem verificar sem ambiguidade. |
| **Reuso de stack** | Inspeciona projeto antes de propor tecnologia nova. |

---

## Templates / assets usados

* `assets/taskcard-template.md` — estrutura canônica (11 seções).

---

## Exemplo de uso

```bash
/agent-spec-taskcard-generate "adicionar validação de CPF no endpoint de cadastro"
```

```
[FASE 0] pre-refinement.md não existe → segue
[FASE 1] Pergunta 1/N: Em qual arquivo está o endpoint hoje?
> internal/users/handler.go:42

[Pergunta 2/N: O CPF é obrigatório ou opcional?]
> obrigatório

[continua interativamente]

[FASE 2] Delegação §10 ao agent-spec-qa-test-generator
[Cria task-01-validar-cpf-cadastro.md]

✅ TaskCard salva em /docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf-cadastro.md
Próximo passo: /agent-spec-taskcard-run <task_path> [agent_name]
```

---

## Skills relacionadas

* [agent-spec-pre-refinement](../shared/pre-refinement.md) — entrada universal.
* [agent-spec-taskcard-run](taskcard-run.md) — próxima etapa (executa a TaskCard).
* [agent-spec-qa-test-generator](../../agents/qa-test-generator.md) — invocado para Seção 10.
* [agent-spec-minispec-generate-intent](../minispec/minispec-generate-intent.md) — alternativa para feature pequena com US.
* [agent-spec-sdd-generate-prd](../sdd/sdd-generate-prd.md) — alternativa formal para feature grande.

## Configuração via framework-paths.md

Paths usados: `pre_refinement.path`, `taskcard.tasks.dir`, `taskcard.tasks.pattern`. Veja [Path Templates](../../configuration/path-templates.md).
