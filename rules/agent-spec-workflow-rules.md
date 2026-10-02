---
description: Regras comuns do framework agent-spec — Critical Paths (heurística de áreas sensíveis), paths compartilhados entre workflows (run_report relatório humano, workflow_report telemetria, temp_memory, pre_refinement, tech_alignment) e convenções de nomenclatura.
paths:
  - "docs/specs/**"
  - "docs/prds/**"
  - "docs/adr/**"
  - ".claude/skills/agent-spec-sdd-*/**"
  - ".claude/skills/agent-spec-minispec-*/**"
  - ".claude/skills/agent-spec-taskcard-*/**"
  - ".claude/skills/agent-spec-adr-*/**"
  - ".claude/skills/agent-spec-pre-refinement/**"
  - ".claude/skills/agent-spec-generate-tech-alignment/**"
  - ".claude/skills/agent-spec-generate-design/**"
  - ".claude/skills/agent-spec-design-system-bootstrap/**"
  - ".claude/skills/agent-spec-challenge-spec/**"
  - ".claude/skills/agent-spec-backend-contract-handoff/**"
  - ".claude/skills/agent-spec-debt-resolution/**"
  - ".claude/skills/agent-spec-mine-rule-candidates/**"
---

# agent-spec — Regras Comuns dos Workflows

> Carregada automaticamente quando o Claude está operando qualquer workflow do framework agent-spec (SDD, miniSpec, TaskCard, ADR) ou skills compartilhadas (agent-spec-pre-refinement, tech-alignment).
> Centraliza Critical Paths, paths compartilhados e convenções. Paths específicos de cada workflow estão em arquivos separados (`agent-spec-sdd-workflow-rules.md`, `agent-spec-minispec-workflow-rules.md`, `agent-spec-taskcard-workflow-rules.md`, `agent-spec-adr-workflow-rules.md`).

---

## Paths Compartilhados

> Variáveis dinâmicas: `{feature}`, `{version}`, `{task_id}` (ex.: `T1`, `T2`, `TC-001`). Substitua antes de ler/salvar.
> **NUNCA** use paths hardcoded — use os templates abaixo.

### Pré-Refinamento (entrada opcional do discovery — compartilhado entre SDD e miniSpec)
- **pre_refinement.path**: `/docs/specs/features/{feature}/{version}/pre-refinement.md`

### Tech Alignment (compartilhado entre SDD e miniSpec)
- **tech_alignment.path**: `/docs/specs/features/{feature}/{version}/tech-alignment.md`

### Handoff Backend → Frontend (gerado por `agent-spec-backend-contract-handoff`)
- **shared.handoff_frontend.path**: `/docs/specs/features/{feature}/{version}/handoff-frontend.md`  <!-- para TaskCard e entrada genérica, ver a tabela de outputs no SKILL.md da skill -->

### Design — Dois Níveis (compartilhado entre SDD e miniSpec — **opcional**, só frentes web/mobile)

O design é dividido em **dois níveis**, espelhando o glossário de domínio:

- **design_system.global.path**: `/docs/specs/design-system.md`
- **design.feature.path**: `/docs/specs/features/{feature}/{version}/design.md`

#### Quando vai pro GLOBAL vs FEATURE

| Vai pro **GLOBAL** (`design-system.md`) se… | Fica no **FEATURE** (`design.md`) se… |
|---|---|
| Tokens (cores, tipografia, espaçamento, raios, sombras) | Layout e composição das telas desta feature |
| Componentes da biblioteca visual reutilizáveis entre features | Estados visuais (loading/erro/vazio/sucesso) das telas desta feature |
| Breakpoints, grid, tema/dark mode do produto | Interações, motion e assets específicos da feature |
| Padrões de feedback visual canônicos (toasts, skeletons, empty states padrão) | Variações pontuais de um padrão global (sinalizar a sobrescrita) |

**Default em caso de dúvida**: FEATURE. Promover um padrão para o global é decisão explícita (afeta todas as features) — o inverso do glossário, porque design global impõe consistência visual imediata em todo o produto.

#### Por que dois níveis (e por que o global não tem `{version}`)

- **GLOBAL**: tokens e biblioteca de componentes têm vida útil maior que qualquer feature — são a fonte canônica da identidade visual do produto. Sem ele, cada feature redesenha botões/estados e a UI diverge silenciosamente.
- **FEATURE**: telas, jornadas visuais e estados são específicos da feature e mudam por versão — por isso `design.feature.path` é versionado (`{version}`), enquanto o global não.

#### Precedência na leitura

Consumidores (tech-spec, scope, tasks de UI, QA) leem **os dois**, nesta ordem:

1. `design_system.global.path` — padrões visuais canônicos do produto.
2. `design.feature.path` (se existir) — design específico da feature.
3. **Conflito**: o FEATURE sobrescreve. Raro e intencional — a skill consumidora deve sinalizar a sobrescrita ao usuário.

#### Lifecycle e quem escreve

- **Opcional por natureza**: features `backend` **nunca** têm design; features web/mobile triviais (ajuste sem impacto visual novo) podem pular. Ausência dos arquivos NÃO é erro — consumidores seguem o fluxo normal (a tech spec/scope especifica a UI nas próprias seções, como sempre fez).
- **Quem escreve**: duas skills user-invocable, com papéis distintos. **`agent-spec-generate-design`** é a dona do **FEATURE** (`design.md`) e faz updates **cirúrgicos** no global (promoção confirmada de tokens/componentes ao longo das features — crescimento lazy). **`agent-spec-design-system-bootstrap`** é a dona da **consolidação standalone do GLOBAL** (`design-system.md`): estrutura definições espalhadas (codebase, Figma, docs do time) sem precisar de feature como gatilho — bootstrap inicial ou enriquecimento. Skills consumidoras (tech-spec, scope, task-plan) **leem e referenciam** — nunca escrevem.
- **Quem consome**: `agent-spec-sdd-generate-tech-spec` (seções de Fluxos de Interface e Comportamento Visual viram referência ao design em vez de redefinição), `agent-spec-minispec-generate-scope`, geradores de tasks (design entra como arquivo de referência nas tasks de camada UI) e `agent-spec-qa-validator` (Camada 4 — completude dos estados visuais contra o design declarado).

### Domain Glossary — Dois Níveis (Global + Feature)

O glossário de domínio é dividido em **dois níveis** para acomodar termos que atravessam features (entidades de negócio) e termos restritos a uma única feature (regras operacionais específicas):

- **domain_glossary.global.path**: `/docs/specs/domain-glossary.md`
- **domain_glossary.feature.path**: `/docs/specs/features/{feature}/domain-glossary.md`

#### Quando vai pro GLOBAL vs FEATURE

| Vai pro **GLOBAL** se… | Fica no **FEATURE** se… |
|---|---|
| O termo é uma entidade de negócio que aparece (ou vai aparecer) em ≥ 2 features | É um conceito operacional restrito a essa feature |
| Existe relacionamento entre entidades de domínio | É uma regra/política específica da feature |
| Ex.: entidades centrais do produto (substantivos referenciados por múltiplas features) | Ex.: parâmetros/limites operacionais, estados de máquina internos, regras específicas do fluxo desta feature |

**Default em caso de dúvida**: GLOBAL. É mais fácil descer um termo do global pro feature do que descobrir depois que duas features divergiram silenciosamente.

#### Por que dois níveis (e não um só)

- **Por que ter GLOBAL**: entidades centrais do produto (substantivos que representam coisas do mundo real do negócio) tendem a aparecer em múltiplas features ao longo do tempo. Sem glossário cross-feature, cada feature redefine os termos e diverge ao longo do tempo. O global garante uma única fonte canônica para o vocabulário do **projeto/produto**.
- **Por que ter FEATURE também**: nem todo termo é compartilhado. Regras operacionais e conceitos transitórios poluiriam o global se fossem registrados lá. O glossário-feature preserva esse nível de detalhe sem inflar o canônico.
- **Por que SEM `/{version}/` em ambos**: tanto o global quanto o feature são fontes canônicas de **terminologia**, com vida útil maior do que uma versão específica. v1, v2, v3 da mesma feature compartilham o mesmo glossário-feature; todas as features compartilham o mesmo glossário-global.

#### Precedência na leitura

Skills consumidoras leem **os dois**, nesta ordem:

1. `domain_glossary.global.path` — termos canônicos do domínio.
2. `domain_glossary.feature.path` (se existir) — termos específicos da feature.
3. **Conflito** (mesmo termo nos dois): o FEATURE sobrescreve. Raro e intencional — só faz sentido quando a feature redefine deliberadamente um termo do domínio. Quando isso acontecer, a skill consumidora deve sinalizar a sobrescrita ao usuário.

#### Quando criar

Lazy — só quando alguma skill de spec (PRD, Intent, Tech Spec, Scope) ou de challenge (`/agent-spec-challenge-spec`) identificar terminologia que merece registro canônico. Features triviais ou puramente técnicas podem nunca ter glossário-feature, e projetos pequenos podem rodar muito tempo sem glossário-global.

#### Estrutura mínima (idêntica para ambos os níveis)

```md
# Glossário de Domínio — {Escopo}   ← {Escopo} = "Projeto" no global, ou "{Feature}" no feature

## Termos

**{Termo Canônico}**:
Definição em 1 frase do que o termo É (não o que faz).
_Evitar_: {alias1}, {alias2}

## Relacionamentos
- Uma **{TermoA}** produz uma ou mais **{TermoB}**
- Um **{TermoB}** pertence a exatamente um **{TermoC}**

## Ambiguidades resolvidas
- "{termo ambíguo}" era usado tanto para **{TermoX}** quanto **{TermoY}** — resolvido: são conceitos distintos.
```

#### Quem escreve

- Skills de geração (PRD / Intent / Tech Spec / Scope): **leem** ambos os níveis e validam terminologia contra eles. **Não escrevem** — apenas sinalizam termos novos ao final.
- Skill `/agent-spec-challenge-spec`: **dona** da criação/atualização. Durante o stress-test, ao canonizar um termo, decide com o usuário se ele vai pro **global** (cross-feature) ou **feature** (local) seguindo o critério acima.

### Relatório do Run (humano) + Workflow Report (telemetria)

> **Dois arquivos, dois públicos.** O `_run/run-report.md` é para **leitura humana** (o que foi feito, que débito sobrou, o que travou). O `_run/workflow-report.md` é o **log de telemetria de pipeline** consumido pela LLM (resume, eval de pipeline, rule mining). **Nunca misture telemetria no relatório humano** — foi exatamente essa mistura que tornava o `_run/run-report.md` ilegível.

- **shared.run_report.path**: `/docs/specs/features/{feature}/{version}/_run/run-report.md`
- **shared.workflow_report.path**: `/docs/specs/features/{feature}/{version}/_run/workflow-report.md`

> **Pasta `_run/` — artefatos gerados pelo pipeline.** Tudo que o run/geração **produz** (não autorado por humano) vive em `{version}/_run/`, separado da spec autorada (`prd`/`intent`, `tech_spec`/`scope`, `task_plan`, `tasks/`, `design`): `run-report.md` (relatório humano), `workflow-report.md` (telemetria), `rule-candidates.md`, `test-cases.json`, `qa_context.md`, `{sdd,minispec}_state.yaml` e `tmp/T{N}.md` (memória lazy efêmera). O orquestrador **cria `_run/` (e `_run/tmp/`) lazy**, na primeira escrita. Invariante: *se não foi autorado por humano, vive em `_run/`*.
>
> **Back-compat de leitura (OBRIGATÓRIA)**: features geradas **antes** desta migração têm o layout plano antigo (`{version}/qa-observations.md`, `.workflow-report.md`, `{sdd,minispec}_state.yaml`, `tasks/.tmp/`, etc.). Todo **leitor** (resume na FASE 0, `/agent-spec-debt-resolution`, mineração) DEVE tolerar ausência em `_run/` e cair no path plano antigo. **Escritores** sempre usam `_run/`; ao reescrever um snapshot/estado de uma feature legada, migra-se para `_run/` (não se mantém o arquivo antigo em paralelo).

#### `_run/run-report.md` — relatório humano (snapshot regenerável)

**NÃO é append-only.** É um **snapshot** reescrito por inteiro pelo orquestrador a cada task concluída/bloqueada e ao fim do run — sempre um retrato limpo do estado atual, nunca um log que cresce. Versionado (entra no Git). Estrutura canônica fixa (4 seções, sempre nesta ordem):

```markdown
# Relatório do Run — {feature}/{version}

> Relatório para revisão humana. Telemetria de pipeline (base_sha, retries, paralelismo, rule mining) vive em `_run/workflow-report.md`.

## 1. Resumo do Run

Status: {N}/{M} tasks concluídas · {testes verdes} · {análise estática}

| Task | Nome | Modelo | Arquivos | QA | Tech Review |
|------|------|--------|----------|-----|-------------|
| T1 | Infraestrutura JWT | opus | 2 criados, 5 mod | ✅ APROVADO | ✅ APROVADO |
| T2 | Base auth | opus | 6 criados | ✅ APROVADO | ✅ APROVADO_COM_OBSERVACOES |

## 2. Débitos Técnicos Não Resolvidos

> Anotados pela política débito-controlado (severidade baixa não bloqueia). Resolva tudo de uma vez com `/agent-spec-debt-resolution docs/specs/features/{feature}/{version}/`.

### D1 · baixo · project_pattern · T2 · Tech Review
- **Onde:** `lib/features/auth/model/authenticated_user.dart:4`
- **Problema:** `AuthenticatedUser` usa parâmetro posicional em vez de named required.
- **Impacto:** inconsistência com o padrão do projeto; o construtor fica frágil de evoluir (call sites quebram ao adicionar um campo).
- **O que fazer:** trocar para `const AuthenticatedUser({required this.id})`.

(Se não houver débito: `✅ Nenhum débito técnico anotado neste run.`)

## 3. Tasks Bloqueadas

(Se nenhuma: `✅ Nenhuma task bloqueada.` — senão, um bloco por task:)

### T{N} — BLOQUEADA após {k} tentativas
- **O que falhou:** {categoria + título do problema persistente do último gate}
- **Próximo passo:** revisar manualmente, ajustar a task/tech_spec e re-rodar.
- **Detalhe técnico:** ver `_run/workflow-report.md` (JSON dos gates preservado em `_run/tmp/T{N}.md` até cleanup).

## 4. Notas para Revisão Humana

(Apenas o que um humano precisa saber para julgar o run — NÃO telemetria. Ex.: escalação de modelo que sugere heurística inicial errada; decisão tomada interativamente; observação não-bloqueante relevante, como colisão de ID de caso de teste para limpeza futura. Se nada relevante: `Nada a destacar.`)
```

**Regras de geração do `_run/run-report.md`**:
- **Seção 1 (tabela)**: a MESMA tabela "Tasks Concluídas" emitida no relatório final em stdout. `Arquivos` = `{X} criados, {Y} mod` (conte do diff staged da task). `QA`/`Tech Review` = veredito final de cada gate; use `—` quando o gate não se aplica (`gates: [qa]` → `Tech Review = — (gates=[qa])`; `gates: none` → ambos `— (sem gates)`).
- **Seção 2 (débitos)**: um bloco `### D{n} · {severidade} · {categoria} · {task} · {gate}` por débito anotado (baixos pela política débito-controlado; médios legados quando aplicável). Os campos `Onde`/`Problema`/`Impacto`/`O que fazer` vêm direto do item do JSON do gate (`file:line`, `title`, `description`, `suggested_fix`). **Nunca descarte `file:line` nem `suggested_fix`** — alimentam a `/agent-spec-debt-resolution`. Severidade/categoria no idioma do gate de origem (QA pt-BR `baixo`; Tech Review inglês `BAIXO`).
- **Seção 3 (bloqueios)**: uma entrada por task que esgotou as 3 tentativas.
- **Seção 4 (notas)**: curadoria — só o que ajuda um humano a julgar o run. Telemetria crua NUNCA entra aqui (vai no `_run/workflow-report.md`).
- **Fonte primária de débito**: a Seção 2 é o que a `/agent-spec-debt-resolution` consome — mantenha-a parseável (ver `debt-collection.md`).

#### `_run/workflow-report.md` — telemetria de pipeline (append-only)

Log **append-only** (cresce durante o run), versionado, consumido pela LLM. Recebe TODA a telemetria de execução que antes poluía o `_run/run-report.md`:

- `[T{N}] base_sha=<sha>` (pré-execução — fallback do resume; ver "Mecânica de Execução Paralela");
- `### {task_id} — retry classification` (loop de correção do Tech Review) e `### T{N} — escalonamento automático` (escalação de modelo);
- `[Fase N] lote paralelo: ...`, `[Fase N] reconciliação: ...`, `[Fase N] fallback: ...`, `[Fase N] T{N} removida do lote: ...`;
- `[T{N}] ADRs injetadas no executor: ...` e `[T{N}] TR consultou: ...` (audit de ADR);
- `[T{N}] scope_deviation revertido: ...`, `[T{N}] staged: ...`, `T{N} executada sem gates`;
- `[run] executor resolvido: ...`, `[run] executor_discipline injetado ...`, `[run] rule_candidates: N ...`;
- resultado bruto de cada gate por fase (critérios, security_flags) quando útil ao eval.

**Criação**: lazy, na primeira linha do run. **Resume**: a FASE 0 dos orquestradores lê o `base_sha` daqui (não mais do `_run/run-report.md`).

### Casos de Teste — Persistência Lossless (artefato de geração)
- **shared.test_cases.path**: `/docs/specs/features/{feature}/{version}/_run/test-cases.json`

> **O que é**: persistência **integral** do JSON retornado pelo `agent-spec-qa-test-generator`. Quem escreve é o **orquestrador** que invocou o agente (`agent-spec-sdd-generate-tech-spec`, `agent-spec-sdd-generate-task-plan`, `agent-spec-minispec-generate-tasks`, `agent-spec-taskcard-generate`) — o contrato do agente NÃO muda (continua retornando apenas JSON). Cada caso ganha um campo extra `task_id` (`null` na fase de tech_spec; preenchido na distribuição/geração de tasks). **Semântica de escrita por contexto**: invocações da **mesma fase de geração** (fallback, batch, consolidação por camada, atualização de `task_id` na distribuição) fazem **merge append** por (`task_id`, `id`) — nunca removem casos já gravados; **re-execução da fase geradora** (ex.: regenerar o tech_spec) é regeneração — **sobrescreve** o arquivo, invalidando distribuições anteriores (o task-plan redistribui na próxima rodada).
>
> **Fluxo forward-only (canonicidade)**: generator → `_run/test-cases.json` → destrinchamento na task (subseção "Detalhamento dos Casos de Teste"). Após o destrinchamento, **a task markdown é canônica** — edições humanas acontecem nela e nunca são sobrescritas pelo JSON. Os gates (`agent-spec-qa-validator`, `agent-spec-staff-architecture-review`) **leem a task, nunca este arquivo**. Consumidores legítimos do JSON: redistribuição heurística do SDD (task-plan lê CTs do tech_spec sem re-parse lossy de markdown), recuperação de CTs cortados por débito (`/agent-spec-debt-resolution`), auditoria e re-render explícito (que avisa que sobrescreve edições).
>
> **Tolerância a ausência (back-compat)**: tasks `N/A — task não envolve código testável` não disparam o generator → não geram entrada; features geradas antes deste artefato não têm o arquivo. Consumidores DEVEM tolerar ausência com fallback aos formatos markdown.

### Candidatos a Regra (rule mining — append-only durante o run)
- **shared.rule_candidates.path**: `/docs/specs/features/{feature}/{version}/_run/rule-candidates.md`

> **Para que serve**: log append-only de **sinais** que podem virar regra de projeto. Cada agente do framework (executores via os orquestradores de execução — `*-run-tasks` e `agent-spec-taskcard-run` —, `agent-spec-qa-validator`, `agent-spec-staff-architecture-review`) emite linhas conforme detecta sinais canônicos durante o run. **Nenhum agente decide se vira regra** — a skill `agent-spec-mine-rule-candidates` consolida sinais de múltiplos runs e entrega clusters para `agent-spec-curate-project-rules` aplicar teste de fricção e definir colocação.
>
> **Por que separar de `workflow_report`**: o `_run/workflow-report.md` é log de **decisão de pipeline** (retry classification, lote paralelo, gates pulados); é consumido pelo eval de pipeline. `_run/rule-candidates.md` é log de **convenção/decisão repetida**; é consumido pela mineração offline. Misturar polui ambos os consumidores. (Nenhum dos dois é o `_run/run-report.md`, que é o relatório humano.)
>
> **Lifecycle**: criado lazy (só na primeira emissão), versionado normalmente (commitado junto com a feature), nunca apagado pelo orquestrador. Mineração lê histórico cross-feature.

#### Vocabulário canônico de sinais

| Sinal | Quem emite | O que captura |
|---|---|---|
| `executor_askquestion` | `*-run-tasks` / `agent-spec-taskcard-run` | Executor disparou `AskUserQuestion` (convenção ausente forçou pergunta). |
| `pre_refinement_decision` | `*-run-tasks` / `agent-spec-taskcard-run` | Decisão registrada na subseção "Decisões já tomadas (fora de negociação)" do agent-spec-pre-refinement (seção 11). |
| `exemplar_file_read` | `*-run-tasks` / `agent-spec-taskcard-run` | Executor leu arquivo "exemplar" para imitar estilo (convenção não escrita). |
| `repeated_fixture` | `agent-spec-qa-validator` | Mesma fixture/mock/setup usado em ≥2 testes do run. |
| `repeated_assertion_shape` | `agent-spec-qa-validator` | Padrão de assert idêntico em ≥3 lugares. |
| `convention_drift` | `agent-spec-staff-architecture-review` | Finding categoria `project_pattern` cuja causa-raiz é convenção não escrita — o Tech Review mapeia para o sinal `convention_drift`. |
| `scope_deviation` | `agent-spec-staff-architecture-review` | Finding categoria `scope_deviation`. |
| `speculative_complexity` | `agent-spec-staff-architecture-review` | Finding categoria `speculative_complexity`. |

> **Vocabulário fechado**: não invente novos sinais. Se um padrão recorrente não cabe em nenhum dos 8, é candidato a expansão do vocabulário — abra discussão antes de emitir.

#### Schema do arquivo (formato "tópico por candidato")

> **Por que NÃO é tabela**: uma tabela `timestamp | signal | evidence` é compacta mas ilegível — não diz **que regra** o sinal sugere nem **o que ela faria**. O formato abaixo é **um tópico (`##`) por sinal emitido**, com a regra sugerida e uma explicação em linguagem simples, para que qualquer pessoa (ou a `agent-spec-mine-rule-candidates`) entenda o candidato sem decifrar a evidência crua.

Cada emissão **anexa uma seção** (nunca reescreve as anteriores):

```markdown
# Rule candidates — {feature}/{version}

> Append-only. Cada tópico abaixo é um candidato a regra detectado durante um run.
> Consumido por `/agent-spec-mine-rule-candidates` (agrupa por tema) e `/agent-spec-curate-project-rules` (decide se vira regra).

## [executor_askquestion] Status HTTP para recurso ausente

**Regra que isto sugere:** padronizar o status de "recurso não encontrado" (404 vs 422) nos handlers.

**O que ela faria (simples):** sem essa regra o executor não sabe qual status usar e PARA para perguntar; com ela, todo handler responde igual para recurso inexistente.

- Evidência: "Devo retornar 404 ou 422 em pedido inexistente?" — `T03 / handler de pedido`
- Sinal: `executor_askquestion` · Origem: `agent-spec-sdd-run-tasks` · 2026-05-29T14:30:00Z

---

## [convention_drift] Logging estruturado inconsistente

**Regra que isto sugere:** todo log usa `zap.Field`, nunca struct literal solta.

**O que ela faria (simples):** uniformiza os logs para a ingestão/parse não quebrar; hoje há mistura dos dois estilos entre serviços.

- Evidência: struct vs `zap.Field` — `services/payments/processor.go:48`
- Sinal: `convention_drift` · Origem: `staff-review` · 2026-05-29T14:40:48Z
```

**Regras de emissão**:
- **Uma seção `##` por sinal.** O título segue `[<signal>] <tema curto>` — `tema` é o assunto em 3-6 palavras (vira o cabeçalho navegável).
- **`Regra que isto sugere`**: 1 linha, o que a regra diria (substantivo + decisão; o imperativo final é da `curate`). Não invente — derive do que foi observado.
- **`O que ela faria (simples)`**: 1-2 frases em linguagem de quem não viu o run — qual erro/atrito aconteceu e o que a regra garantiria na próxima vez. É o campo que torna o arquivo legível; nunca omita.
- **`Evidência`**: texto curto + (quando possível) `path:linha` clicável. Sem evidência verificável → não emita. **O `path:linha` aqui é prova factual do que ocorreu no run (rastreabilidade) — não confundir com o exemplo da regra**: quando este candidato virar regra, a `agent-spec-curate-project-rules` gera um **exemplo de forma inline** (✅/❌, sem `path`), nunca reaproveita este ponteiro como exemplo.
- **Linha de metadados**: `Sinal · Origem · timestamp (ISO-8601)`. O `context` (task/escopo) entra na Evidência.
- **Separe seções com `---`.** Append puro — nunca reescreva seções anteriores.

#### Persistência pelo orquestrador

Os agentes `agent-spec-qa-validator` e `agent-spec-staff-architecture-review` retornam sinais via campo `rule_candidates_emitidos[]` no JSON (não escrevem em arquivo). O orquestrador (`agent-spec-sdd-run-tasks`, `agent-spec-minispec-run-tasks`, `agent-spec-taskcard-run`) é responsável por **traduzir esses sinais em linhas append-only** no `shared.rule_candidates.path`. Além disso, o próprio orquestrador emite 3 sinais que só ele observa.

**Regra de criação lazy do arquivo**: o `_run/rule-candidates.md` só nasce quando o **primeiro sinal qualificado** é emitido no run. Se nada qualifica, **não crie** o arquivo (evita poluir o histórico da feature com arquivos vazios). Ao criar, escreva só o cabeçalho (as seções `##` vêm depois, uma por sinal):

```markdown
# Rule candidates — {feature}/{version}

> Append-only. Cada tópico abaixo é um candidato a regra detectado durante um run.
> Consumido por `/agent-spec-mine-rule-candidates` (agrupa por tema) e `/agent-spec-curate-project-rules` (decide se vira regra).
```

**Trigger points por orquestrador**:

| Momento | Ação | Sinais resultantes |
|---|---|---|
| **Após QA aprovar/rejeitar** (`agent-spec-qa-validator`) | Ler `rule_candidates_emitidos[]` do JSON e **anexar uma seção por item**, com `source: "agent-spec-qa-validator"`. | `repeated_fixture`, `repeated_assertion_shape` |
| **Após Tech Review aprovar/parcial/rejeitar** (`agent-spec-staff-architecture-review`) | Mesmo procedimento, com `source: "staff-review"`. | `convention_drift`, `scope_deviation`, `speculative_complexity` |
| **Executor disparou `AskUserQuestion`** durante a execução | Append seção com `source: "{nome-do-orquestrador}"`, `signal: "executor_askquestion"`, `evidence: <pergunta literal> — <task_id>/<escopo>`. O orquestrador **autora** `tema`/`regra_sugerida`/`explicacao` a partir da pergunta (ele tem o contexto). | `executor_askquestion` |
| **Fase 0 do orquestrador, ao carregar agent-spec-pre-refinement** | Se a subseção "Decisões já tomadas (fora de negociação)" (seção 11) tem itens, append **uma seção por decisão** com `signal: "pre_refinement_decision"`, `evidence: <decisão literal>`; `tema`/`regra_sugerida`/`explicacao` derivados da decisão. | `pre_refinement_decision` |
| **Executor leu arquivo "exemplar"** (declarado em `arquivos_referencia` da task ou citado pelo executor como modelo) | Append seção com `signal: "exemplar_file_read"`, `evidence: <path do arquivo lido> — <task_id>/<escopo>`; `regra_sugerida` ≈ "apontar `<exemplar>` como padrão de `<tipo>`". | `exemplar_file_read` |

**Tradução JSON → seção**:

Para cada item de `rule_candidates_emitidos[]`, anexe:

```markdown

## [{item.signal}] {item.tema}

**Regra que isto sugere:** {item.regra_sugerida}

**O que ela faria (simples):** {item.explicacao}

- Evidência: {item.evidence}{ — `item.context` se houver}
- Sinal: `{item.signal}` · Origem: `{source}` · {ISO-8601 do momento da emissão}

---
```

Gates que não retornarem `tema`/`regra_sugerida`/`explicacao` (contrato antigo): o orquestrador **deriva** os três do `evidence`+`context` (fallback best-effort) e loga a derivação — nunca grava seção sem o "O que ela faria". O `occurrences[]` do JSON **não vai para a seção** — fica no JSON original do gate (já persistido) para a `agent-spec-mine-rule-candidates` consultar as linhas exatas.

**Deduplicação intra-run**: antes de anexar, o orquestrador grepa o `_run/rule-candidates.md` pelo título da seção (`[{signal}] {tema}`, case-insensitive) **e** pela `evidence`. Se já existe seção equivalente no mesmo run, **pule** (evita duplicar quando QA + Tech Review reportam o mesmo padrão). Deduplicação cross-feature é responsabilidade da `agent-spec-mine-rule-candidates`.

**Falhas não-bloqueantes**: se o append falhar (path inválido, permissão, etc.), registre em `shared.workflow_report.path` como observação e siga. **Nunca** rejeite a task por falha de instrumentação de rule mining.

**Log do orquestrador**: emita uma linha em `shared.workflow_report.path` ao final do run com a contagem total de candidatos persistidos:

```
[run] rule_candidates: N sinais persistidos em <shared.rule_candidates.path> (qa=X, staff=Y, orquestrador=Z)
```

Se N == 0, **não** crie o arquivo nem logue (evita ruído).

### Memória Temporária (lazy — só nasce em rejeição de gate)
- **shared.temp_memory.dir**: `/docs/specs/features/{feature}/{version}/_run/tmp/`
- **shared.temp_memory.pattern**: `{task_id}.md`

> **Por que dentro da pasta da feature**: o diretório `.claude/.tmp/` exige autorização explícita a cada gravação (Claude Code trata `.claude/` como área protegida). Movendo para dentro de `_run/tmp/` (já writable como qualquer arquivo da feature) eliminamos o prompt de permissão e mantemos a memória co-localizada com as tasks que ela descreve.
>
> **Limpeza**: o diretório `_run/tmp/` deve estar listado em `.gitignore` para evitar que arquivos efêmeros (memória lazy) sejam versionados. A skill orquestradora deleta cada arquivo após aprovação dos gates.
>
> **Contexto da execução (NÃO mais em arquivo)**: `base_sha` e sumário do executor (4-6 linhas) passam **inline em `instrucoes`** do QA e do Tech Review. A versão anterior gravava um arquivo `{task_id}-execution-summary.md` com `git diff --stat`, hashes SHA-256 pré/pós e paths consolidados — campos que QA/Tech Review na prática não consultavam (Tech Review GERA diff sozinho via `git diff <base_sha> -- <path>`). Cortado em prol de fluxo mais simples e ~300-800 tokens × 2 gates × N tasks economizados por run.

### Specs (varredura cross-feature)
- **shared.specs_root**: `/docs/specs`
- **shared.specs_glob**: `/docs/specs/**/*.md`
- **shared.prds_glob**: `/docs/prds/**/*.md`  <!-- PRDs do SDD vivem fora de /docs/specs (ver sdd.prd.path) — varreduras de duplicação/conflito devem cobrir os DOIS globs -->

---

## Critical Paths — Heurística de Áreas Sensíveis

> Usada por `agent-spec-sdd-run-tasks`, `agent-spec-minispec-run-tasks` e `agent-spec-taskcard-run` para detectar áreas sensíveis e escalar modelo (executor e gates). **Agnóstica de linguagem/stack** — categorização por **semântica do path**, não por layout específico (Go `internal/`, Java `src/main/`, JS `src/`, Python `app/`, Dart `lib/`).

### Categorias Canônicas

| Categoria | Exemplos de match (qualquer linguagem/stack) |
|---|---|
| **auth** | `**/auth/**`, `**/authentication/**`, `**/login/**`, `**/sessions/**`, `**/oauth/**` |
| **security** | `**/security/**`, `**/permissions/**`, `**/authorization/**`, `**/access-control/**`, `**/rbac/**` |
| **crypto** | `**/crypto/**`, `**/encryption/**`, `**/hashing/**`, `**/jwt/**`, `**/tokens/**`, `**/keys/**` |
| **db_migrations** | `**/migrations/**`, `**/migrate/**`, `**/db/migrations/**`, `**/schema/migrations/**`, arquivos `*.sql` em pastas de migração |
| **secrets/config** | `**/secrets/**`, `**/credentials/**`, arquivos `.env*`, `secrets.*` |
| **api_contracts** | `**/openapi*`, `**/swagger*`, `**/proto/**`, `**/graphql/schema*`, `**/contracts/**` |
| **payments** | `**/payment/**`, `**/billing/**`, `**/checkout/**`, `**/transaction/**` |

### Como aplicar (runtime)

1. Para a task em execução, examine os arquivos declarados nas seções de impacto e o `git diff --name-only`.
2. Faça match de cada path contra as categorias acima (case-insensitive, semântico).
3. Se QUALQUER path bater com QUALQUER categoria → `diff_touches_critical_path = true`.
4. Use o resultado para escalar modelo (gates e executor) conforme regras de cada skill.

### Executor model rules (compartilhadas — aplicadas quando frontmatter NÃO declara `model:`)

```
- match: path em categoria "auth"           → opus
- match: path em categoria "security"       → opus
- match: path em categoria "crypto"         → opus
- match: path em categoria "db_migrations"  → opus
- match: path em categoria "secrets/config" → opus
- match: task_risk == "ALTO"                → opus
- match: files_to_create_count >= 10        → opus
- default                                   → sonnet
```

### Gates inference rules (compartilhadas — aplicadas quando frontmatter NÃO declara `gates:`)

> **Motivação**: o post-mortem `cadastro-pratos-franquia` mostrou que rodar Tech Review por default em **todas** as 10 tasks gastou ~30-50min em wiring/config triviais que o TR jamais reprovaria. Inferir `gates` por tipo de task elimina esse overhead.
>
> **Filosofia**: Tech Review é caro (modelo Sonnet/Opus + leitura de ADRs + diff completo). Aplique apenas onde adiciona valor — área crítica, refactor cross-module, padrão novo. Para CRUD/wiring/config seguindo pattern existente, **QA basta**.

Ordem de avaliação (primeira que casar vence; ausência → `[qa, tech_review]`):

```
- match: tipo == "docs" OU "config_isolada" OU "constantes_isoladas"
         (sem código executável de domínio)                            → none

- match: tipo == "wiring/registry" puro
         (apenas Wire/DI providers, rotas em router, barrel exports,
         registro em init)                                              → [qa]

- match: tipo == "crud_handler" SOBRE pattern_existente
         (handler/route/controller seguindo padrão do projeto, repositorio
         sem regra de domínio nova, DTO trivial)                        → [qa]

- match: tipo == "service_simples"
         (service que delega ao repository com 0-1 sentinela; nenhuma
         regra de negócio complexa, nenhum side-effect externo)         → [qa]

- match: path em "auth" | "security" | "crypto" | "secrets/config"      → [qa, tech_review]
- match: path em "db_migrations"                                        → [qa, tech_review]
- match: tipo == "padrao_novo" OU "candidato_adr"                       → [qa, tech_review]
- match: tipo == "refactor_cross_module" (≥ 3 módulos/pacotes)          → [qa, tech_review]
- match: tipo == "service_complexo" (≥ 2 sentinelas, side-effects ext.) → [qa, tech_review]
- match: task_risk == "ALTO"                                            → [qa, tech_review]
- match: files_to_create_count >= 10                                    → [qa, tech_review]
- default                                                                → [qa, tech_review]
```

**Como o gerador de tasks classifica `tipo`** (heurística textual sobre o nome + arquivos da task):

| Sinais textuais | `tipo` inferido |
|---|---|
| `wire`, `provider`, `register`, `routes`, `swag`, `barrel`, `index.ts`, `mod.rs`, `__init__.py` | `wiring/registry` |
| `migration`, `schema`, `.sql` em pasta de migração, `prisma/migrations/` | `db_migrations` |
| `handler`, `controller`, `route`, `endpoint` + sem palavra-chave "novo padrão" + segue exemplo de outro handler do projeto | `crud_handler` |
| `service` + ≤ 1 sentinela declarada + sem integração externa nova | `service_simples` |
| `service` + ≥ 2 sentinelas OU upload/S3/HTTP externo OU race-condition tratada | `service_complexo` |
| `constante`, `const`, `enum` em arquivo isolado | `constantes_isoladas` |
| `config`, `env`, `viper`, `.env` em arquivo isolado | `config_isolada` |
| `docs`, `.md`, `swagger.yaml` puro | `docs` |
| Toca ≥ 3 pacotes / módulos distintos | `refactor_cross_module` |
| Decide algo que vira ADR (sinalizado pelo hook ADR do gerador) | `padrao_novo` |

> **Default conservador**: na dúvida entre `[qa]` e `[qa, tech_review]`, escolha `[qa, tech_review]`. Pular Tech Review indevidamente em área crítica é mais caro do que rodá-lo num CRUD trivial.

**Log obrigatório**: o orquestrador de execução (`*-run-tasks` e `agent-spec-taskcard-run`) DEVE logar a fonte de `gates` antes de invocar:

```
[T5] gates: [qa] (inferido: tipo=crud_handler, sem critical_paths)     model: sonnet
[T6] gates: [qa, tech_review] (declarado no frontmatter)                model: sonnet
[T1] gates: [qa, tech_review] (inferido: tipo=refactor_cross_module)    model: opus
```

---

## Tech Review Correction — Classificação `requires_qa_revalidation`

> Usada por `agent-spec-sdd-run-tasks`, `agent-spec-minispec-run-tasks` e `agent-spec-taskcard-run` no loop de correção do Tech Review (Gate 2). Decide se a re-rodada após correção precisa **passar pelo QA novamente** (re-validar lógica/comportamento) ou pode **pular o QA e ir direto a um novo Tech Review** (apenas conformidade técnica/code-review). Otimiza tokens e tempo evitando re-QA quando nada mudou no comportamento do código.

### Quando o algoritmo se aplica

- **Rejeição do QA (Gate 1)** → a próxima rodada **SEMPRE re-passa pelo QA** (o gate que reprovou precisa re-aprovar a correção). O algoritmo abaixo **não** se aplica.
- **Rejeição do Tech Review (Gate 2)** (`PARCIAL`/`REJEITADO`) → aplique o algoritmo sobre `problems[]` do JSON do Tech Review para decidir se o re-QA pode ser pulado.

### Categorias do JSON do Tech Review (Gate 2)

O `agent-spec-staff-architecture-review` retorna **`problems[]`** (lista única) onde cada item tem `severity` (`CRITICO|ALTO|MEDIO|BAIXO`) e `category`. Vocabulário canônico do TR e classificação:

| Categoria (TR) | Tipo | Justificativa |
|---|---|---|
| `architecture` | **revalidation_required** | Mudança estrutural altera fluxo, dependências e contratos — refazer testes |
| `security` | **revalidation_required** | Correção de vulnerabilidade afeta lógica de validação/autorização — re-QA mandatório |
| `technical_requirement` | **revalidation_required** | Implementar requisito técnico faltante muda comportamento |
| `testability` | **revalidation_required** | Implica mudar/criar testes — QA precisa re-executar a suíte |
| `error_handling` | **revalidation_required** | Mudança em tratamento de erro altera fluxo de exceções e respostas |
| `performance` | **revalidation_required** | Otimização que muda algoritmo/estrutura pode quebrar casos limite |
| `adr_compliance` | **revalidation_required** | Conformidade com ADR pode exigir mudança estrutural — conservador |
| `scope_deviation` | **revalidation_required** | Remover mudança fora de escopo altera surface area |
| `speculative_complexity` | **revalidation_required** | Remoção de abstração/feature especulativa altera surface area e pode quebrar usos inadvertidos — conservador |
| `code_quality` | code_review_only | Refactor sem mudança de comportamento (naming, legibilidade, magic numbers, duplicação local) |
| `project_pattern` | code_review_only | Adequar convenção do projeto (naming, estrutura, idioma, organização) sem mudar comportamento |
| `best_practices` | code_review_only | Clean code localizado (extrair função, coesão) sem mudança de comportamento — correções que mudem a forma do diff são capturadas pelos overrides abaixo |

> **Default conservador**: categoria desconhecida ou ausente → `revalidation_required = true`. Nunca pule QA por dúvida.

### Algoritmo de Classificação (sobre `problems[]` do Tech Review)

```
problemas_corrigir = [p for p in problems[] if p.severity in (CRITICO, ALTO, MEDIO)]

para cada p em problemas_corrigir:
    se p.category está em revalidation_required → return requires_qa_revalidation = true
    se p.category está ausente/desconhecida    → return requires_qa_revalidation = true (default conservador)

# Chegou aqui: TODOS os problemas bloqueantes estão em code_review_only
return requires_qa_revalidation = false
```

> Baixos não entram no cálculo: pela política débito-controlado só os baixos não disparam loop de correção — viram débito anotado. Críticos, altos e médios são todos bloqueantes e entram no cálculo.

### Sinais Adicionais (override)

Independente da categoria, FORÇAR `requires_qa_revalidation = true` se QUALQUER:

- `tocou_area_critica == true` (path em categoria sensível — ver "Critical Paths" acima).
- `qa_security_flags_not_empty` (QA original já reportou flags de segurança).
- `task_risk == "ALTO"` no frontmatter.
- O patch sugerido pelo Tech Review **adiciona/remove arquivos** ou muda a forma do diff (`git diff --stat` muda nº de arquivos vs. iteração anterior).

### Aplicação no Loop de Correção

Após receber o JSON do Tech Review com `status: REJEITADO`/`PARCIAL`:

1. Calcule `requires_qa_revalidation` (algoritmo + overrides).
2. Persista o resultado na memória lazy (`shared.temp_memory.dir`/`{task_id}.md`) sob `requires_qa_revalidation:` e log do motivo.
3. Aplique a correção do executor.
4. **Próxima rodada de validação**:
   - Se `requires_qa_revalidation == true` → volte ao Gate 1 (QA) → depois Gate 2 (Tech Review).
   - Se `requires_qa_revalidation == false` → **PULE QA**, vá direto para Gate 2 (Tech Review).
5. Logue em `shared.workflow_report.path` qual caminho foi tomado e a contagem de problemas por categoria.

> **Por que economizar QA aqui**: correções estritamente de code-review (renomear, formatar, extrair função sem mudar comportamento) **não alteram o comportamento testado pelo QA**. Re-rodar QA nesse caso queima tokens e tempo sem ganho. A classificação é determinística e conservadora (default re-QA), garantindo que mudanças de lógica nunca pulem o QA.

### Log Obrigatório da Decisão (auditoria)

Para cada aplicação do algoritmo, o orquestrador DEVE persistir em `shared.workflow_report.path` o bloco abaixo (substitua valores):

```markdown
### {task_id} — retry classification
- attempt: {N}
- problemas_por_categoria: { architecture: 0, code_quality: 2, project_pattern: 1, adr_compliance: 0, ... }
- overrides_ativos: [tocou_area_critica: false, task_risk: low, qa_security_flags: [], diff_stat_changed: false]
- requires_qa_revalidation: false
- decisao: PULE QA (próxima rodada vai direto a Tech Review)
- justificativa: "todos os problemas bloqueantes em code_review_only (code_quality + project_pattern)"
```

> **Por que log obrigatório**: o post-mortem `cadastro-pratos-franquia` levantou suspeita de que T10 (`naming/style`) foi re-QA indevidamente. Sem log auditável, impossível distinguir bug no algoritmo de execução correta. Com o log, o eval pode validar cada decisão.

### Categorias do `agent-spec-qa-validator` (Gate 1)

> **Importante**: o QA tem vocabulário **próprio**, distinto do Tech Review. Ele retorna `problemas.criticos[]/altos[]/medios[]/baixos[]`, cada item com campo `categoria` entre: `architecture`, `security`, `tests`, `logic`, `data_handling`, `error_handling`, `performance`, `concurrency`, `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`, `adr_compliance`.
>
> Esse campo serve para **classificação de débito e auditoria do loop de correção** — ele NÃO alimenta o algoritmo de skip de QA: quando a rejeição vem do QA, a próxima rodada sempre re-passa pelo QA (ver "Quando o algoritmo se aplica").

---

## Execução Paralela de Tasks (Fase de paralelismo declarado)

> Usada por `agent-spec-sdd-run-tasks` e `agent-spec-minispec-run-tasks` quando o `task_plan.md` marca tasks com `Pode Rodar em Paralelo? = Sim` na mesma fase. **NÃO se aplica a `agent-spec-taskcard-run`** — TaskCard é por definição 1 task por vez.
>
> **Motivação**: o post-mortem `cadastro-pratos-franquia` declarou T1+T2+T3+T4 paralelos no task_plan, mas o orquestrador ignorava a coluna. Rodaram sequenciais (~40min); em paralelo real seriam ~10min. Economia: ~30min por feature com fase paralela.
>
> **Correção de runs com conflito de ordem**: em várias execuções o flag `Pode Rodar em Paralelo?` foi **autorado por intuição** do gerador e os guards de execução eram **cegos a dependências de símbolo em arquivos ainda-não-criados** (o lote inclui tasks `A Criar`, então grep textual nunca acha o consumo). Resultado: tasks que dependiam entre si entravam no mesmo lote → conflito de ordem. As subseções abaixo tornam o paralelismo uma propriedade **derivada, conservadora e auditável**.

### Invariante de Paralelismo (contrato canônico — fonte única)

> Referenciado por geradores (`*-generate-task-plan` / `*-generate-tasks`, Regra 10d) e executores (`*-run-tasks`). É a definição única da semântica do flag.

**Paralelismo é DERIVADO, nunca autorado.** O autor de tasks declara apenas as **arestas** (`Dependências`) e dois conjuntos de símbolos por task (`Símbolos públicos criados`, `Símbolos consumidos de outras tasks`). O flag `Pode Rodar em Paralelo?` é **computado** a partir desses dados. **Default em qualquer incerteza: `Não`.**

Duas tasks `ti`, `tj` são **paralelo-seguras** se e somente se TODAS valem:

1. **Mesma fase** (coluna `Fase`).
2. **Independência no DAG**: nenhuma é ancestral nem descendente da outra (dependência direta OU transitiva) — calculado sobre o grafo de `Dependências`.
3. **Disjunção de símbolo**: `símbolos_consumidos(ti) ∩ símbolos_criados(tj) = ∅` E vice-versa. (Substitui o antigo grep textual em arquivos inexistentes.)
4. **Paths declarados disjuntos** (seções de arquivos a criar/modificar) — incluindo a lista de **arquivos de alta contenção** abaixo.
5. **Nenhuma toca arquivo de alta contenção** em comum.

Se qualquer condição não puder ser **provada**, o par NÃO é paralelo (conservador). Semântica do flag: "`Sim` = paralelizável com os demais pares prontos da mesma fase que também sejam paralelo-seguros entre si".

### Arquivos de Alta Contenção (agnóstico de stack)

> Arquivos de **registro compartilhado** que múltiplas tasks funcionais frequentemente tocam mesmo sem declarar (a Regra 6 manda absorver wire-up na task funcional — em lote paralelo isso converge no mesmo arquivo). Qualquer task que toque um desses é tratada como **sempre sobreposta** → força sequencial dentro da fase.

| Categoria | Exemplos de match (qualquer stack) |
|---|---|
| **DI / container / registro** | `**/container*`, `**/wire_provider*`, `**/wire_gen*`, `**/di/**`, `**/providers*`, `**/injector*`, registro de bean/IoC |
| **router / registry / menu** | `**/router*`, `**/routes*`, `**/routing*`, registro de endpoint, item de menu, tab, deeplink |
| **barrel / public exports** | `**/index.ts`, `**/index.js`, `**/mod.rs`, `**/__init__.py`, `**/library.dart`, public API agregada |
| **manifests / lockfiles** | `go.mod`, `go.sum`, `package.json`, `pyproject.toml`, `Cargo.toml`, `Cargo.lock`, `pubspec.yaml`, `pom.xml`, `build.gradle` |
| **migrations ledger** | diretório `**/migrations/**` (a ordem/numeração é estado compartilhado, mesmo que arquivos sejam distintos) |

> **Por que migrations entram aqui**: duas migrations "de arquivos distintos" compartilham a **ordem** (timestamp/sequência) — estado partilhado. Em paralelo geram colisão de numeração. Sequencial sempre.

### Reconciliação de Dependências (fonte única)

> O executor lê dependências de DOIS lugares (tabela do `task_plan.md` e seção 1 do `TN.md`). Eles podem divergir (RC de runs reais).

- **Autoritativa**: `TN.md` seção 1 (`Dependências`, `Símbolos públicos criados`, `Símbolos consumidos de outras tasks`).
- **Em divergência** entre `TN.md` e a tabela do `task_plan.md`: usar a **UNIÃO** das dependências (mais conservador) e registrar em `_run/workflow-report.md`:
  ```
  [Fase N] reconciliação: T3 deps divergem (task_plan: [T1] | T3.md: [T1, T2]) → união [T1, T2]
  ```
- Parsing tolerante de texto livre: `—`, `-`, `Nenhuma`, `N/A`, vazio ⇒ sem dependências. `T1, T2` / `T1 e T2` / `T1; T2` ⇒ `{T1, T2}`. Texto não-parseável (ex.: `T1 (após migração)`) ⇒ extrair os IDs `T\d+` e logar o resíduo como observação.

### Condições para Paralelizar (TODAS obrigatórias)

Um **lote paralelizável** é um subconjunto de tasks `prontas` (deps satisfeitas) em que **todo par** satisfaz o Invariante de Paralelismo acima. Operacionalmente:

1. **Mesma fase** no task_plan.md (coluna `Fase`).
2. **Todas com flag `Pode Rodar em Paralelo? = Sim`** (já derivado pelo gerador; o executor **re-verifica** — não confia cegamente).
3. **Independência no DAG**: remova do lote qualquer task que seja ancestral/descendente (direta/transitiva) de outra do lote.
4. **Disjunção de símbolo** (substitui o antigo grep textual): para cada par,
   ```
   for ti, tj in pairs(lote):
       if (ti.consumidos ∩ tj.criados) ≠ ∅ or (tj.consumidos ∩ ti.criados) ≠ ∅:
           remova o CONSUMIDOR do lote (mantém o produtor); rode o consumidor depois
   ```
   Se uma task declara consumir símbolo SEM apontar a task produtora, e algum par do lote o cria → conservador: remova o consumidor.
5. **Paths disjuntos** (a criar/modificar) **+ arquivos de alta contenção**:
   ```
   for ti, tj in pairs(lote):
       if (ti.paths ∩ tj.paths) ≠ ∅:                      remova ti e tj; sequencial
       if ti.toca_alta_contencao and tj.toca_alta_contencao: remova ambas; sequencial
   ```
6. **Limite de paralelismo**: máximo `MAX_PARALLEL = 4` tasks por lote. Lotes maiores quebram em ondas de 4. Razão: tool limits do Claude Code + custo de coordenação cresce não-linearmente.

> **Default conservador (inviolável)**: se QUALQUER guard não conseguir **provar** independência (dado ausente, símbolo sem origem, path ambíguo), a task cai para **sequencial**. Falso-sequencial custa minutos; falso-paralelo corrompe a ordem.

### Mecânica de Execução Paralela

Para cada task `ti` do lote:

1. **`base_sha` comum** capturado UMA VEZ antes do lote: `base_sha = git rev-parse HEAD`. Todas as tasks do lote usam o MESMO `base_sha` para o filtro `git diff <base_sha> -- <paths>`.
2. **Lançamento concorrente**: numa ÚNICA mensagem do orquestrador, despachar todos os `Agent({...})` do executor das tasks do lote em paralelo (multiple tool calls no mesmo turn).
3. **Aguardar TODOS** os executores retornarem antes de prosseguir.
4. **Persistir `executor_summary[ti]` em memória** (output enxuto de cada executor) — sem arquivo intermediário. `base_sha` (comum) + `executor_summary[ti]` (por task) viajam inline no prompt dos gates.
5. **Gates em paralelo POR TASK**: cada `ti` tem seu próprio pipeline `Agent(agent-spec-qa-validator)` → `Agent(agent-spec-staff-architecture-review)` que pode rodar em paralelo com os pipelines de outras tasks do lote.
   - **Dentro de uma task**: QA → Tech Review continua **sequencial** (Tech Review precisa do sumário do QA).
   - **Entre tasks**: pipelines isolados → totalmente paralelizáveis.
   - **Guard de recursos de teste (suítes concorrentes)**: o QA é o único gate que EXECUTA testes — N QAs paralelos rodam N suítes simultâneas no MESMO working tree. Se **≥ 2 tasks do lote** têm testes de **integração ou E2E** não-vazios (seções de testes com DB/porta/fixture/filesystem compartilháveis), **serialize a etapa de QA do lote** (executores paralelos; QAs um por vez, em ordem de ID) — colisão de recursos gera flake e queima tentativas do limite de 3. Exceção: se o isolamento for provado (ex.: banco in-memory/efêmero POR suíte, portas dinâmicas), QAs podem rodar em paralelo; logue a prova. Tasks só com testes unitários puros não disparam o guard.
6. **Stage real sequencial**: após TODOS os **gates aplicáveis** do lote aprovarem (Tech Review quando declarado; apenas QA para `gates: [qa]`; nenhum gate para `gates: none`), faça `git add` numa ordem determinística (ID da task ascendente). Tasks fast-path **também são staged** — sem isso terminariam unstaged (e arquivos novos, untracked). Razão da ordem determinística: estado do index reprodutível entre runs.
7. **Falha em um membro do lote**:
   - Se UMA task falhou em QA ou Tech Review → entra em loop de correção isoladamente (não trava as outras).
   - **Guard executor×QA (correção concorrente)**: o executor de correção só pode ser despachado quando **nenhum QA de outra task do lote estiver executando suíte** (integração/E2E/suíte completa) — executor editando o working tree durante uma suíte em execução causa falha de compilação/flake em task inocente, queimando tentativa do limite de 3. Drene os QAs pendentes do lote antes de iniciar a correção. QAs de testes unitários puros e escopados não disparam o guard.
   - As demais tasks do lote que aprovaram são `staged` e marcadas concluídas normalmente.
   - A task em loop continua até esgotar 3 tentativas; se bloquear, marca `Bloqueado` e segue.

### Pseudo-algoritmo

```
fase_atual = primeira_fase_com_tasks_prontas()
tasks_fase = tasks de fase_atual com Status="A Fazer"

# Reconcilia deps (TN.md autoritativa ∪ tabela); constrói DAG
deps = reconcilia_deps(tasks_fase)        # ver "Reconciliação de Dependências"

# Detecta lote paralelizável — re-verifica o flag derivado (não confia cego)
candidatos = [t for t in tasks_fase if t.paralelo == "Sim"]
lote = aplique_guards(candidatos, deps)   # DAG independente + disjunção de símbolo
                                          # + paths disjuntos + alta contenção
lote = lote[:MAX_PARALLEL]
# Qualquer guard sem prova de independência → task removida (sequencial)

# Tasks fora do lote: sequenciais
sequenciais = tasks_fase - lote

# Execução do lote
base_sha = git rev-parse HEAD
dispatch_parallel([Agent(executor, ti) for ti in lote])
aguarde_todos()
executor_summary = {ti.id: ti.output_enxuto for ti in lote}   # em memória, não em arquivo

# Gates paralelos por task (recebem base_sha + executor_summary[ti] INLINE)
dispatch_parallel([pipeline_gates(ti) for ti in lote])
aguarde_todos()

# Stage determinístico
for ti in sorted(lote_aprovados, key=lambda t: t.id):
    git add -- <ti.paths>

# Em seguida, rode as sequenciais da mesma fase
for ti in sequenciais: ...

# Próxima fase
```

### Log Obrigatório do Lote

```
[Fase 1] lote paralelo: T1, T2, T4 (DAG independente + símbolos disjuntos + paths disjuntos)
[Fase 1] base_sha=abc1234
[Fase 1] dispatch_parallel: 3 executores em paralelo
[Fase 1] aprovados: T1, T2 | em retry: T4 (QA: CRITICO em CT-010)
[Fase 1] staged sequencial: T1 → T2
```

### Fallback Automático para Sequencial

Se QUALQUER guard não provar independência, o orquestrador remove a task do lote e faz **fallback determinístico para sequencial**, registrando o motivo **específico** em `_run/workflow-report.md`:

```
[Fase 1] T3 removida do lote: consome símbolo `service.EmailSender` criado por T2 (disjunção de símbolo)
[Fase 1] T5 removida do lote: toca arquivo de alta contenção `internal/di/container.go` (compartilhado com T2)
[Fase 1] paralelismo descartado: T2.paths ∩ T3.paths = ["internal/api/handlers/franchise_dish/wire_provider.go"]
[Fase 1] reconciliação: T3 deps divergem (task_plan: [T1] | T3.md: [T1, T2]) → união [T1, T2]
[Fase 1] fallback: sequencial T1 → T2 → T3 → T4
```

---

## Convenções

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Nome da feature (`{feature}`) | kebab-case, minúsculas, sem acentos | `autenticacao-oauth2`, `cardapio-digital` |
| Versão (`{version}`) | `v1`, `v2`, ... (incremental). Variante de limpeza: `v{N+1}-debits` (criada por `agent-spec-debt-resolution` para resolver débito anotado — skills que parseiam `{version}` devem aceitar o sufixo `-debits`) | `v1`, `v2-debits` |
| Diretório da feature | `/docs/specs/features/{feature}/{version}/` | `/docs/specs/features/cardapio-digital/v1/` |
| Variante (`{variant}`) | `web`, `mobile` ou `backend` — registrada em `_run/sdd_state.yaml`/`_run/minispec_state.yaml` (raiz e em `steps.<step>`) e na seção 1 do `tech_spec.md`/`scope.md`. **NÃO** entra no path (mantém-se `tech_spec.md`/`scope.md` sem sufixo). | `variant: backend` |
