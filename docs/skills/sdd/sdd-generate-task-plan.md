---
id: "agent-spec-sdd-generate-task-plan"
title: "agent-spec-sdd-generate-task-plan"
sidebar_position: 3
---
# agent-spec-sdd-generate-task-plan

`SDD` `Generator`
> **Resumo**: Terceira etapa do framework SDD. Recebe um TECH\_SPEC aprovado e gera (1) `task_plan.md` (índice/referência com fases, dependências, paralelismo) e (2) `tasks/T1.md`, `T2.md`, ... (tasks individuais detalhadas). Aplica regras anti-fragmentação e otimizações de QA.

---

## Quando usar

* Após `tech_spec.md` aprovado.
* Antes de [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html).

## Quando NÃO usar

* TECH\_SPEC ainda em rascunho/não aprovado.
* Pipeline miniSpec → use [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `tech_spec.md` | Usuário (argumento) | Sim |
| `prd.md` correspondente | Lido automaticamente | Sim |
| `docs/adr/INDEX.md` | Existente no projeto | Não (consultado se existir) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `task_plan.md` (referência/índice) | `sdd.task_plan.path` → `/docs/specs/features/{feature}/{version}/task_plan.md` | [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) |
| `tasks/T{n}.md` (uma por task) | `sdd.tasks.dir` + `sdd.tasks.pattern` | [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html), executor |
| `.qa_context.md` (denso ~1.5k tokens) | `sdd.qa_context.path` | [agent-spec-qa-test-generator](/agents/qa-test-generator.html) durante consolidação |

> **Regra crítica**: o `task_plan.md` é apenas **referência/índice** (fases + tabela de tasks + rastreabilidade). O **corpo** das tasks vive em `tasks/T{n}.md` separados.

---

## Fluxo de execução

### FASE 1 — Pesquisa obrigatória do projeto

Lê TECH\_SPEC + PRD, consulta ADRs ativas, explora codebase em busca de implementações reaproveitáveis. Mesmo princípio de [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html): não cria task de criação se a coisa já existe.

**Verifica o campo `Design Relacionado`** na seção 1 do Tech Spec (variantes web/mobile): se apontar para um [`design.md`](/skills/shared/generate-design.html), **toda task que cria/modifica componente de camada UI** o lista na seção **5.3 Arquivos de Referência** (motivo: "contrato visual — layout e estados das telas"). Tasks sem camada UI (service, API client, store puro) não o referenciam (minimum-context); o conteúdo **nunca** é copiado para dentro da task — referência, não duplicação.

### FASE 2 — Processo interativo (uma pergunta por vez)

1. Extrai nome da feature do TECH\_SPEC.
2. Confirma o nome com o usuário.
3. Define **macro-fases** com o usuário.
4. Destrincha **fase a fase**, criando rascunho de cada task aplicando regras de decomposição.
5. Para cada task: cria seções 1-5 e 7-8 (incluindo **§3.1 Exemplo de Payload** ⚡ quando expõe `PUT`/`PATCH` parcial) → aplica anti-fragmentação → delega Seção 6 (Testes) ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html) → salva `tasks/TN.md`.
6. Após todas as tasks salvas: monta `task_plan.md` (índice) com fases, tabela, **§4.1 Ordem de Execução** (grafo topológico) e rastreabilidade US→Task.

> **Seção 6 (Testes) — agnóstica de stack**: nomes de arquivo/função e framework derivam de `stack_discovery`/`existing_suite` do JSON do gerador (nunca cravados em Go/backend). Inclui **6.0 Padrões de Teste detectados**, **6.5 Rastreabilidade Aceite Técnico → Testes** — cada critério da §4/CA com ≥1 teste mapeado, espelhando a Estratégia de Testes do Tech Spec no escopo da task — e **6.6 Detalhamento dos Casos de Teste**: 1 card lossless por CT (Invariant, Owning layer, Pré-condições, Passos, Resultado esperado, Negative companion, Precondição privilegiada), destrinchado do JSON. As tabelas 6.1–6.4 são o **índice**; o card é o **detalhe** que o revisor humano valida self-contained e o executor implementa. Após salvo, o card é canônico (edições humanas na task; nunca re-sincronizado de `test-cases.json`).

### FASE 3 — Regras de decomposição (anti-fragmentação e anti-agregação)

Aplica **10 regras** para evitar tasks excessivamente pequenas (atomização desnecessária) ou excessivamente grandes (não cabe na janela do executor):

| # | Regra | Direção |
| --- | --- | --- |
| 1 | Teste-como-critério-de-existência (task sem comportamento testável não existe) | anti-frag |
| 2 | Tamanho mínimo viável (≥ 20 linhas líquidas OU 1 teste isolável) | anti-frag |
| 3 | Proximidade de arquivo (consecutivas no mesmo arquivo < 50 linhas → 1 task) | anti-frag |
| 4 | Consolidação por fase de integração (wire-up (conexão/registro) trivial em 1 task) | anti-frag |
| 5 | Meta de quantidade como sinal (3-12 tasks; > 12 só com many US) | anti-frag |
| 6 | Padrões que nunca existem sozinhos (wire-up — conexão/registro — , barrel, registro) | anti-frag |
| 7 | Atomic reviewable commit | anti-frag |
| 8 | Testes mandatórios (bloqueante) | anti-frag |
| **9** ⚡ | **Anti-Agregação de Contratos + Handlers**: se ≥ 3 contratos novos (DTOs/Requests/Responses) + ≥ 1 handler com lógica → **quebrar em ≥ 2 tasks** (Task A = base+contratos; Task B = handlers) | **anti-aggr** |
| **10** ⚡ | **Coerência de dependências e escopo** (bloqueante): **10a** nenhuma task referencia símbolo nascido em task posterior (mover ref OU reordenar) **e persiste** `Símbolos públicos criados`/`consumidos` na seção 1 do `TN.md`; **10b** mudança com blast radius além dos arquivos tocados lista dependentes em §5.2 e valida no escopo do blast radius; **10c** mudança de assinatura inclui os dependentes mecanicamente forçados em §5.2 (não é `scope_deviation`); **10d** flag `Pode Rodar em Paralelo?` **derivado** do DAG + símbolos (Invariante de Paralelismo), nunca autorado — default na incerteza: `Não` | **coerência** |

> **Motivação da Regra 9 (post-mortem `cadastro-pratos-franquia`)**: T7 (= base do sub-pacote + Requests + Responses + 2 handlers) cascateou correções em 4+ arquivos por iteração. ADR-0010 nas tags HTTP foi detectada tarde, mock-driven confidence em handlers múltiplos. Cada hit do gate forçou re-trabalho simultâneo.

> **Motivação da Regra 10 (run `esqueci-a-senha` + runs com conflito de paralelismo)**: T3 referenciava `service.EmailSender`, símbolo nascido em T5 → reorder forçado durante a execução (10a). Mudanças de assinatura em T5/T8 forçaram tocar callers/composition root fora do escopo declarado, gerando ruído de `scope_deviation` (10c). Migração no topo da pilha quebrou down-tests cross-package não listados (10b). E, em vários runs, o flag de paralelismo autorado por intuição colocava no mesmo lote tasks que dependiam entre si → conflito de ordem; a 10d torna o flag **derivado** do grafo + símbolos persistidos (10a), fechando a falha na origem. As quatro direções são validadas **antes** de fixar a ordem.

**Pergunta interativa ao usuário (quando regra dispara)**: skill apresenta via `AskUserQuestion`:

```
Achado: T{N} acumula {N} contratos novos + {N} handlers com lógica.
Regra 9 sugere quebrar em:
- T{N}a: base do sub-pacote + contratos (DTOs/Requests/Responses)
- T{N}b: handlers com lógica de domínio
Opções:
1. Quebrar em 2 tasks (recomendado)
2. Manter agregada (registrar justificativa em source\_note)
```

**Exceção válida**: 1-2 contratos triviais + 1 handler simples sobre pattern existente pode permanecer agregado (overhead de quebra > ganho).

### FASE 4 — Otimizações críticas

#### 4.1 qa\_context.md proativo (Passo 0)

Extrai `~1.5k tokens` densos do `tech_spec.md` antes de invocar qualquer subagente. Conteúdo mínimo:

* **Mapa CA → CT** (rastreabilidade compactada).
* **Componentes-chave** (com paths absolutos da seção Arquivos Envolvidos do tech\_spec).
* **Fluxos críticos** (1-2 linhas cada).
* **Estratégia de Testes condensada** (CTs já consolidados, sem narrativa).
* **Decisões arquiteturais** que afetam testes (mocks vs integração, framework de teste, fixtures).

Subagentes [agent-spec-qa-test-generator](/agents/qa-test-generator.html) leem este arquivo em vez do `tech_spec.md` completo.

**Economia**: `~8k tokens × N subagentes invocados`. Para feature com 8 tasks consolidadas em 4 camadas: 4 × 8k = 32k tokens economizados. Veja [qa\_context pré-extraído](/advanced/qa-context.html).

#### 4.2 Redistribuição de CTs (Skip QA quando a Estratégia de Testes completa)

**Fonte preferencial**: `shared.test_cases.path` (`test-cases.json` persistido pela fase de tech-spec) — redistribuição **lossless** (preserva pré-condições, passos, negative companion e precondição privilegiada para os cards da §6.6). **Fallback legado** (features sem o JSON): parse da tabela markdown da Estratégia de Testes do tech\_spec — o Detalhamento fica limitado ao que a tabela carrega, anotado nas Notas da task.

Algoritmo:

```
if test-cases.json existe com casos mapeados a CA (ou, no legado sem JSON, estrategia\_testes.total\_CTs >= 10):
para cada task ti:
paths\_ti = §5.1 ∪ §5.2 (arquivos a criar + modificar)
cts\_ti = [ct in estrategia\_testes if grep\_match(ct.componente, paths\_ti)]
atribua cts\_ti à Seção 6 da task ti
se TODAS as tasks têm cts\_ti não-vazio:
PULE agent-spec-qa-test-generator nesta feature (skip total)
senão:
invoca agent-spec-qa-test-generator apenas para tasks sem match
else:
fluxo normal — invoca agent-spec-qa-test-generator (consolidado por camada)
```

**Economia**: 70-90% das invocações QA quando o tech\_spec já trouxe a Estratégia de Testes robusta. Veja [Skip QA quando a Estratégia de Testes completa](/advanced/skip-qa-section14.html).

#### 4.3 Consolidação por camada

Quando precisa invocar `agent-spec-qa-test-generator` (4.2 não pulou), agrupa tasks por **4 camadas canônicas** e dispara **1 subagente por camada**:

| Camada | Conteúdo típico |
| --- | --- |
| **infra** | Migrations, schemas, repositories, providers, DI/wire |
| **domínio** | Services, regras de negócio, validators, entidades |
| **integração** | Handlers/controllers, contratos HTTP/GraphQL, eventos |
| **e2e + packaging** | Fluxos completos, smoke tests, build/release |

Resultado: JSON multitask retornado pelo subagente, com **chave por task ID** — cada task mantém seu próprio array `casos_teste`, que a skill converte para a Seção 6: tabelas-índice (6.0–6.5) + Detalhamento por CT (6.6). Ao fechar a distribuição, a skill persiste/atualiza `shared.test_cases.path` com o `task_id` de cada caso (merge append — nunca remove casos gravados; re-execução da fase de **tech-spec** sobrescreve o arquivo, invalidando a distribuição anterior). Como no SDD os IDs `CT-XX` são **globais da feature**, casos vindos de invocações fallback (IDs locais do generator) são **renumerados** para continuar a sequência global antes de integrar — atualizando `negative_companion.ct_id`:

```json
{
"T1": { "casos\_teste": [ ... ] },
"T2": { "casos\_teste": [ ... ] },
"T3": { "casos\_teste": [ ... ] }
}
```

**Economia**: `N invocações → 4 invocações` (ou menos se alguma camada está vazia). Para feature com 8 tasks: 8 → 4 (50% menos). Veja [QA Consolidation](/advanced/qa-consolidation.html).

### FASE 5 — Frontmatter de cada task

Cada `tasks/T{n}.md` recebe frontmatter obrigatório:

```markdown
- model: sonnet | opus # ou ausente (resolvido por heurística)
- risk: low | medium | high # indica escalação
- gates: [qa] | [qa, tech\_review] | none # INFERIDO por tipo de task
```

#### Heurística `gates` por tipo de task (Gates inference rules) ⚡

Inferida pela skill a partir de sinais textuais sobre nome + arquivos (regra cross-framework em [`agent-spec-workflow-rules.md`](/configuration/path-templates.html)):

| `tipo` inferido | `gates` |
| --- | --- |
| `docs`, `config_isolada`, `constantes_isoladas` | `none` |
| `wiring/registry` (Wire providers, rotas, barrel) | `[qa]` |
| `crud_handler` sobre pattern existente | `[qa]` |
| `service_simples` (≤ 1 sentinela, sem integração externa) | `[qa]` |
| `db_migrations`, `auth`, `security`, `crypto`, `secrets/config` | `[qa, tech_review]` |
| `padrao_novo` / `candidato_adr` | `[qa, tech_review]` |
| `service_complexo` (≥ 2 sentinelas, efeitos colaterais externos) | `[qa, tech_review]` |
| `refactor_cross_module` (≥ 3 módulos/pacotes) | `[qa, tech_review]` |
| `task_risk == high` | `[qa, tech_review]` |
| default na dúvida | `[qa, tech_review]` (conservador) |

**Aplicação**: cada `tasks/T{n}.md` declara `gates` com comentário explícito: `gates: [qa] # tipo=crud_handler`.

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: rodar Tech Review em 10 tasks gastou ~30-50min em wiring/config/constantes triviais. ~5 das 10 tasks teriam ido para `[qa]`-only, economizando ~30-50min por feature CRUD.

Veja [Model Selection](/advanced/model-selection.html) e [Fast-path Gates](/advanced/fast-path-gates.html).

---

## Gates invocados

* **[agent-spec-qa-test-generator](/agents/qa-test-generator.html)** — para Seção 6 (Testes) de cada task quando a Estratégia de Testes do TECH\_SPEC não traz CTs detalhados, OR para consolidação por camada.

> Esta skill **não** roda gates de validação. Apenas invocação do gerador.

---

## Templates / assets usados

* `assets/task_plan_template.md` — estrutura do índice (fases + tabela).
* `assets/task_template.md` — estrutura da task individual (8 seções).

---

## Exemplo de uso

```bash
/agent-spec-sdd-generate-task-plan docs/specs/features/pagamentos/v1/tech\_spec.md
```
```
[Lê tech\_spec.md + prd.md + ADR INDEX]
[Confirma feature: "Pagamentos PIX/Cartão/Boleto v1"]
[Define macro-fases: 1. Infra | 2. Domínio | 3. Integração PSP | 4. E2E]
[Fase 1] T1 (Infra: schemas + repositories) → criada e salva
[Fase 1] T2 (Infra: migrations) → criada e salva
[Fase 2] T3, T4, T5 → criadas e salvas
[Fase 3] T6, T7 → criadas e salvas
[Fase 4] T8 (E2E + packaging) → criada e salva
[Otimização: a Estratégia de Testes do tech\_spec tem 28 CTs. Redistribui via heurística.]
[Consolidação por camada: 1 invocação agent-spec-qa-test-generator por camada]
[Monta task\_plan.md como índice]
✅ task\_plan.md + 8 tasks/T\*.md salvos.
✅ .qa\_context.md proativo gerado (~1.5k tokens).
✅ sdd\_state.yaml atualizado.
Próximo passo: /agent-spec-sdd-run-tasks  
```

---

## Skills relacionadas

* [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) — etapa anterior.
* [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) — próxima etapa (executa as tasks).
* [agent-spec-qa-test-generator](/agents/qa-test-generator.html) — invocado para Seção 6 de cada task.
* [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) — equivalente leve para miniSpec.

## Configuração via framework-paths.md

Paths usados: `sdd.tech_spec.path`, `sdd.prd.path`, `sdd.task_plan.path`, `sdd.tasks.dir`, `sdd.tasks.pattern`, `sdd.qa_context.path`, `sdd.state.path`, `adr.index_file`. Veja [Path Templates](/configuration/path-templates.html).
