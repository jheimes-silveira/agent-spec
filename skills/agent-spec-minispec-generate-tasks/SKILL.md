---
name: agent-spec-minispec-generate-tasks
description: Gera TASKS do framework miniSpec a partir de INTENT e SCOPE aprovados. Atua como Engenheiro de Software Sênior, decompõe o SCOPE em tasks atômicas e executáveis, delega a Seção 5 (Testes) ao subagente agent-spec-qa-test-generator (consolidado por camada), salva os arquivos físicos (task_plan.md + tasks/T{n}.md) e atualiza o estado do pipeline. User-invocable via /agent-spec-minispec-generate-tasks.
user-invocable: true
disable-model-invocation: true
argument-hint: <caminho do intent.md> <caminho do scope.md>
---

# Skill: agent-spec-minispec-generate-tasks

PERSONA: Você é um **Engenheiro de Software Sênior** especializado em **decomposição de tarefas para execução por LLM**.
Responsabilidade: Transformar um SCOPE aprovado em (1) um **TASK PLAN** com fases, dependências e paralelismo e (2) **tasks individuais** extremamente claras, técnicas e executáveis. Foco no **COMO executar** — nunca no **O QUE** de produto.

Estilo: Objetivo. Estruturado. Sem redundância. Técnico.

---

## Visão Geral

As **TASKS** são a etapa final do framework miniSpec antes da execução. Recebem INTENT (O QUE) e SCOPE (COMO) aprovados e produzem:

1. Um `task_plan.md` (documento de **REFERÊNCIA/ÍNDICE**) com macro-fases, tabela de tasks, grafo de dependências e visão consolidada de arquivos.
2. **Tasks individuais detalhadas** em arquivos separados `tasks/T1.md`, `tasks/T2.md`, etc.

```
Descrição da Feature
        |
   INTENT (O QUE / POR QUE)
        | (INTENT aprovada)
   TECH ALIGNMENT (decisões técnicas — opcional)
        | (Tech Alignment aprovado/pulado)
   SCOPE (COMO)
        | (SCOPE aprovado)
   TASKS (execução)              <-- você está aqui
        | (Tasks aprovadas)
   Implementação
        |
   Feature Entregue
```

As TASKS respondem: **COMO decompor o SCOPE em unidades atômicas de trabalho?**

### REGRA CRÍTICA: Separação de Documentos

| Documento | Arquivo | Conteúdo |
|---|---|---|
| **TASK PLAN** | `task_plan.md` | **REFERÊNCIA/ÍNDICE**. APENAS: macro-fases, tabela de tasks (IDs, nomes, deps, paralelismo), grafo de dependências, visão consolidada de arquivos e critérios de conclusão. **NUNCA contém o corpo detalhado das tasks.** |
| **Task Individual** | `tasks/TN.md` | **DETALHADO**. Contém: identificação (model/risk/gates), objetivo, arquivos impactados, detalhes de implementação, testes, observações, checklist. Cada task em arquivo separado. |

> **NUNCA coloque o corpo de uma task dentro do `task_plan.md`.** O `task_plan.md` referencia tasks por ID (T1, T2...) apontando para `tasks/TN.md`.

---

## Paths (Resolução)

Variáveis usadas nesta skill: `minispec.intent.path`, `minispec.scope.path`, `minispec.task_plan.path`, `minispec.tasks.dir`, `minispec.tasks.pattern`, `minispec.qa_context.path`, `minispec.state.path`. Templates definidos em `.claude/rules/agent-spec-minispec-workflow-rules.md` (paths miniSpec) e `.claude/rules/agent-spec-workflow-rules.md` (paths compartilhados).

Substitua `{feature}` (kebab-case sem acentos), `{version}` (`v1`, `v2`, ...) e `{n}` (1, 2, 3, ...) antes de qualquer leitura/escrita. **NUNCA** use paths hardcoded.

> O `{feature}` e o `{version}` devem ser **extraídos do path da INTENT/SCOPE fornecidos** como argumento.

---

## Princípio Fundamental

As TASKS transformam o SCOPE aprovado em **unidades atômicas de trabalho** executáveis por humanos ou agentes de IA.

### Critérios de Qualidade

| Atributo | Descrição |
|----------|-----------|
| Atômica | Executável sem novas decisões |
| Independente | Minimize dependências |
| Pequena | Se > 3 subtarefas, quebre em tasks |
| Clara | Suficiente para LLM executar |
| Verificável | Critério claro de conclusão |
| Ordenada | Ordem e dependências definidas |

### Regras Obrigatórias

- Basear-se **exclusivamente** na INTENT e no SCOPE fornecidos
- **NÃO** adicionar funcionalidades não mencionadas
- **NUNCA** deduzir escopo ou inventar informações — na DÚVIDA, **PERGUNTE** ao usuário
- **SEMPRE** salvar os arquivos físicos antes de pedir aprovação
- **NUNCA** iniciar automaticamente a próxima etapa
- Use a ferramenta `AskUserQuestion` para esclarecer dúvidas

---

## FASE 0 — Análise e Validação

**ANTES** de gerar as tasks, analise INTENT e SCOPE recebidos:

1. Leia o `intent.md` (path do argumento) — entenda objetivo, motivação, resultado esperado.
2. Leia o `scope.md` (path do argumento) — entenda o COMO, arquivos envolvidos, critérios de aceite.
   - **Se o SCOPE referencia um `design.md`** (campo "Design de referência" — variantes web/mobile): toda task que cria/modifica componente de camada UI DEVE listá-lo na seção **3.3 Arquivos de Referência** (motivo: "contrato visual — layout e estados das telas"). Tasks sem camada UI **não** o referenciam (minimum-context). **NÃO copie conteúdo do design.md** para dentro da task.
3. Verifique:
   - Intent está claro sobre o objetivo?
   - Scope delimita claramente o que entra e sai?
   - Há ambiguidades que precisam esclarecimento?
   - Detectou dependências ocultas?
   - Algo parece inviável ou conflitante?
4. **Explorar o codebase** para identificar padrões existentes, código reutilizável, dependências reais. Nunca assuma que algo precisa ser criado se já pode existir.

Se houver dúvidas, **PERGUNTE** ao usuário via `AskUserQuestion` antes de prosseguir.

---

## FASE 1 — Geração das Tasks (Decomposição)

Para cada task, preencha o template individual ([task_template.md](assets/task_template.md)) com:

- **ID**: T1, T2, T3... (único)
- **Nome da Task**: Descrição curta
- **model**, **risk**, **gates**: ver FASE 3 (heurística obrigatória)
- **Status**, **Fase**, **Dependências**, **Critério de Conclusão**
- **Objetivo da Task**: O que será entregue (resultado técnico direto)
- **Arquivos Impactados**: a Criar / a Modificar / Referência (economiza tokens e scans)
- **Detalhes de Implementação**: subtasks com checklist
- **Testes**: **PENDENTE** — preenchida na FASE 2 via subagente `agent-spec-qa-test-generator`
- **Notas / Observações**, **Checklist Final**

Além disso, preencha o [task_plan_template.md](assets/task_plan_template.md) com:

- **Identificação** da feature
- **Macro-Fases**: agrupamento lógico das tasks
- **Lista de Tasks**: tabela com links para cada arquivo individual (`tasks/TN.md`)
- **Ordem de Execução** (com paralelismo) e **Grafo de Dependências**
- **Visão consolidada de arquivos**: todos os arquivos impactados (área, ação)
- **Critérios de Conclusão** geral
- **Notas para a LLM Executora**

---

## FASE 2 — Seção 5 (Testes) via Subagente QA

A **seção 5 (Testes)** de cada task **NÃO** deve ser preenchida diretamente. Você DEVE delegar a geração ao subagente **`agent-spec-qa-test-generator`** e converter o JSON retornado em markdown estruturado tabular.

> Testes são parte da especificação de cada task — esta etapa é **obrigatória e bloqueante**.

### Quando executar

Para **cada task**, após preencher todas as seções **EXCETO** a Seção 5 (Testes), **ANTES de salvar** o arquivo final. Se várias tasks estão sendo criadas, dispare subagentes QA em **paralelo** para maximizar eficiência.

### Consolidação por camada (reduzir N subagentes)

Agrupe as tasks por **camada arquitetural** e dispare **1 subagente por grupo** que retorna CTs para TODAS as tasks do grupo em 1 JSON:

| Camada | Tipos de tasks agrupadas |
|---|---|
| **infra** | setup, config, docker, migrations schema, logger, envelope de erro |
| **dominio** | domain models, services de negócio, repositórios, validadores |
| **integracao** | handlers REST, gRPC, wiring de DI, middlewares |
| **e2e + packaging** | testes E2E, smoke, CI, README, Dockerfile final |

**Como invocar**:

1. Classifique cada task em uma das 4 camadas (inferir pelo nome + arquivos impactados).
2. Para cada camada com ≥ 1 task, dispare **1 subagente `agent-spec-qa-test-generator`**.
3. No `instrucoes`, inclua: "Você está gerando testes para um GRUPO de tasks relacionadas. Retorne JSON com chave por task ID (`{'T1': {...}, 'T2': {...}}`). Cada task mantém seu próprio array `casos_teste`."
4. **Regra**: camada com 1 task só → fluxo tradicional (1 subagente = 1 task). Escopo divergente dentro da camada → dividir em mais de 1 subagente.

**Ganho estimado**: ~36-48k por feature média.

### Passo 0: Extrair `qa_context.md` (OBRIGATÓRIO)

> **Motivo**: sem este passo, cada subagente QA lê `intent.md` + `scope.md` completos (~4-6k cada) em todas as tasks. Com N subagentes = N × 8-12k de releitura. O `qa_context` condensado (~1-1.5k tokens) resolve.

**Antes de disparar qualquer subagente QA**, extraia 1× um `qa_context.md` denso:

1. **Resolva o path** via `minispec.qa_context.path` (agent-spec-minispec-workflow-rules.md). Prefixo `.` sinaliza intermediário (adicione ao `.gitignore` se ainda não estiver).
2. **Leia INTENT + SCOPE** uma única vez.
3. **Extraia em formato condensado** (idealmente <1.5k tokens):
   - **Critérios de aceite do INTENT**: lista condensada.
   - **Decisões do SCOPE**: decisões arquiteturais + padrões que as tasks herdam.
   - **Lista de componentes** mencionados no SCOPE (nome + responsabilidade em 1 linha).
   - **Paths relevantes** (migrações, queries, arquivos a criar/modificar agregados).
4. **Salve o `qa_context.md`** no path resolvido, iniciando com um cabeçalho de proveniência (permite detectar staleness depois):
   ```markdown
   > Gerado em {YYYY-MM-DD} a partir de `intent.md` + `scope.md`. Se o `scope.md` for editado
   > após esta data (ex.: via /agent-spec-challenge-spec), este arquivo está STALE — regenere-o
   > ou consulte INTENT/SCOPE diretamente.
   ```
5. **A partir de agora, cada subagente QA recebe o path do `qa_context.md`** — NÃO passe `intent.md` + `scope.md` completos.

**Fallback**: se a feature é pequena (INTENT + SCOPE juntos < 3k tokens), pule este passo e use os arquivos diretamente.

### Passo 1: Preparar a lista de arquivos

Monte a lista de `arquivos` que o subagente deve ler para CADA task. Inclua:

- **`qa_context.md`** (OBRIGATÓRIO): path resolvido via `minispec.qa_context.path`. **Substitui INTENT + SCOPE completos** na maioria dos casos.
- **INTENT completo**: NÃO incluir por padrão. Só incluir se a task toca área pouco coberta pelo `qa_context`.
- **SCOPE completo**: idem.
- **Testes existentes**: arquivos de teste relacionados aos arquivos impactados pela task.
- **Código-fonte existente**: arquivos listados na task (a criar ou modificar).

### Passo 2: Preparar as instruções

Monte o campo `instrucoes` com:

1. O conteúdo completo da **task parcial** que a skill montou até o momento (seções 1-4 e 6-7).
2. Os **critérios de conclusão** da task.
3. Os **arquivos impactados** pela task — para o QA saber quais camadas testar.
4. O **tipo da task** (cria handler, cria service, cria repository, cria migração, etc.).

### Passo 3: Disparar o subagente

Lance o subagente usando a ferramenta `Agent` com:

- **subagent_type**: `agent-spec-qa-test-generator` (configurado em `shared.gates.qa_test_generator`).
- **description**: "QA gerar testes task TN" (ou "QA gerar testes camada X" no modo consolidado).
- **prompt**: Monte o prompt com os 2 parâmetros obrigatórios:

```
Você foi invocado com os seguintes parâmetros:

1. **arquivos**: [lista de caminhos dos arquivos preparados no Passo 1]
2. **instrucoes**: [conteúdo preparado no Passo 2]

OBRIGATÓRIO: Antes de gerar casos de teste, leia (Read) a doutrina de testes: `.claude/skills/agent-spec-testing-best-practices/SKILL.md` e `.claude/skills/agent-spec-testing-best-practices/references/ai-escreve-testes.md`. Aplique os 7 gates (Invariant First, Owning Layer, Real Execution, Failure→Fix Production, No Snapshot Without Contract, No Self-Set Mock, Negative Companion). Cada caso de teste DEVE conter `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion` e, quando aplicável, `precondicao_privilegiada`.
```

> **Modelo**: não passe `model` no `Agent({...})` — confie no default configurado para o subagente.

### Passo 4: Converter JSON em markdown (Seção 5 — índice tabular + detalhamento)

O subagente QA retorna um JSON com `casos_teste[]`. Você DEVE converter para a Seção 5 da task: **tabelas-índice** (5.0-5.5, cobertura num relance) + **5.6 Detalhamento dos Casos de Teste** (card lossless por CT), usando o mapeamento abaixo.

#### Mapeamento de tipos

| Campo `tipo` no JSON | Subseção destino |
|---------------------|-----------------|
| `UNITARIO` | **5.1 Testes Unitários** |
| `COMPONENTE` | **5.1 Testes Unitários** — agrupado sob heading próprio (frontend/mobile) |
| `INTEGRACAO` | **5.2 Testes de Integração** |
| `E2E` | **5.3 Testes E2E** |
| `SEGURANCA` | **5.4 Cenários de Erro** |
| `ACESSIBILIDADE` | **5.1** quando `owning_layer` é `unit` · **5.3** quando `owning_layer` é `e2e` |

> O generator **não emite** `PERFORMANCE` (testes de carga são proibidos por contrato — viram `recomendacoes`). Tipo desconhecido → registre em observação e trate como `INTEGRACAO`.

Além dos testes tipo `SEGURANCA`, inclua em 5.4 todos os `casos_teste` com `categoria` igual a: `tratamento_erro`, `caso_extremo`, `fronteira`.

#### Formato de saída por subseção

**Não infira nomes de arquivo/função por convenção Go.** O `agent-spec-qa-test-generator` é agnóstico de stack e já retorna, no JSON, `stack_discovery` (framework, convenção de nomes) e, por caso, `existing_suite` (caminho real da suíte na convenção da stack). Use **esses valores**:

- **Arquivo de teste**: use o `existing_suite` do caso (ou o equivalente idiomático que o JSON propõe quando `NO_SUITE_FOUND`). Ex. por stack — Go: `pedidos/service_test.go`; TS/Jest: `pedidos/service.spec.ts`; pytest: `tests/pedidos/test_service.py`; Dart: `test/pedidos/service_test.dart`.
- **Nome da função/caso**: use a convenção de `stack_discovery.framework_teste`. Ex. — Go: `TestMetodo_Cenario`; Jest: `describe('Metodo') > it('cenario')`; pytest: `test_metodo_cenario`.
- **Subseção 5.0 (Padrões de Teste detectados)**: preencha a partir de `stack_discovery` (framework, convenção de nomes, fixture/setup, mocks) — é a referência que o executor segue.

Nos blocos de formato abaixo, `<arquivo de teste>` e `<NomeDoTeste_Cenario>` são placeholders que se materializam conforme a stack descoberta (não os deixe literais).

> **Coluna "Setup (caminho legítimo)"** (anti-violação da Iron Law #6): popule de `precondicao_privilegiada` do JSON — `caminho_legitimo` + `teste_analogo` quando `presente: true`; `—` quando ausente. É a receita de montar precondição privilegiada (auth/contexto/relógio/identidade) **sem alargar a superfície de produção**.

**5.1 Testes Unitários** — formato tabular agrupado por componente:

```markdown
#### [Camada]: [NomeComponente] (`<arquivo de teste na convenção da stack>`)

Mock: [interfaces/dependências mockadas]

| CT | Teste | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----------|-------|----------|------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | [invariant do JSON] | dados entrada | resultado esperado | dependências mockadas | imite `[teste_analogo]`: [caminho_legitimo] — ou `—` |
```

**5.2 Testes de Integração** — formato tabular com Setup:

```markdown
#### [CamadaA + CamadaB] (`<arquivo de teste na convenção da stack>`)

Setup: [banco in-memory, migrações, fixtures]

| CT | Teste | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----------|-------|-----------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | [invariant do JSON] | Passos do fluxo | Assertions esperadas | imite `[teste_analogo]`: [caminho_legitimo] — ou `—` |
```

**5.3 Testes E2E** — formato descritivo por fluxo:

```markdown
#### Fluxo: [Nome do Fluxo] (CT-XX)
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida de ponta a ponta)
- **Pré-condições**: (estado inicial do sistema — se o JSON traz `precondicao_privilegiada.presente: true`, transcreva o `caminho_legitimo` e o `teste_analogo`)
- **Passos**:
  1. Passo 1
  2. Passo 2
- **Validações**: (assertions sobre dados e estado final)
```

**5.4 Cenários de Erro** — formato tabular:

```markdown
| Cenário | Objetivo | Trigger | Código/Status | Log Esperado |
|---------|----------|---------|---------------|--------------|
| Descrição | Verificar que [constraint] impede [operação] | Ação trigger | Código erro | Mensagem log |
```

**5.5 Rastreabilidade: Critério de Conclusão → Testes** — prova de cobertura (obrigatória):

```markdown
| # | Critério (seção 1 / aceite) | Teste(s) Correspondente(s) | Tipo |
|---|-----------------------------|----------------------------|------|
| 1 | [critério de conclusão] | [CT-XX / NomeDoTeste] | [Unitário/Integração/E2E] |
```

> Cada critério de conclusão/aceite da task DEVE ter ≥1 teste mapeado. Critério sem teste correspondente = falta de caso de teste (gere) OU critério não-verificável (reescreva). Cruze contra os `casos_teste[]` do JSON.

**5.6 Detalhamento dos Casos de Teste** — destrinchamento lossless por CT (obrigatório):

> **Por quê**: as tabelas 5.1-5.4 são o **índice** (cobertura num relance); o card abaixo é o **detalhe** que dá ao revisor humano poder de validação self-contained e ao executor a receita completa. Sem ele, `pre_condicoes`, `passos`, `negative_companion` e `precondicao_privilegiada` — que o generator JÁ produz — evaporam na compressão tabular. Renderize **um card por caso** de `casos_teste[]` da task:

```markdown
### 5.6 Detalhamento dos Casos de Teste

#### CT-XX — [titulo]

- **Tipo**: [tipo] | **Categoria**: [categoria]
- **Arquivo**: `[existing_suite — ou o arquivo proposto quando NO_SUITE_FOUND]` ([criar|modificar])
- **Invariant**: [invariant]
- **Owning layer**: `[owning_layer]` | **Real execution boundary**: `[real_execution_boundary]`
- **Pré-condições**: [pre_condicoes — um sub-bullet por item]
- **Dados de entrada**: [dados_entrada.descricao + valores relevantes]
- **Passos**: [passos — lista numerada]
- **Resultado esperado**: [resultado_esperado]
- **Negative companion**: [se ct_id == "self": "este é o caso negativo (`ct_id: self`)"; senão: "→ CT-YY: [input_invalido] — [assertion_esperada]"]
- **Precondição privilegiada**: [caminho_legitimo. Análogo: `teste_analogo`]   <!-- OMITIR o bullet quando presente: false -->
- **Critérios validados**: [critérios de conclusão/aceite cobertos]
- **Obs**: [observacoes]   <!-- OMITIR o bullet quando vazio -->
```

Regras do card:
- O heading `#### CT-XX — [titulo]` preserva o ID greppável — a rastreabilidade CT→teste do `agent-spec-qa-validator` e as tabelas-índice continuam apontando para os mesmos IDs.
- **Não invente conteúdo**: cada campo vem do caso correspondente no JSON. Campo vazio → omita o bullet.
- **Canonicidade**: após salvo na task, o card é a fonte de verdade do CT — edições humanas acontecem aqui e NÃO são re-sincronizadas com `shared.test_cases.path` (forward-only).
- **Consistência índice↔detalhe**: cada CT das tabelas 5.1-5.4 tem exatamente 1 card em 5.6 e vice-versa.

#### Testes Existentes a Modificar

Após as subseções 5.1-5.6, adicione a tabela de testes existentes:

```markdown
#### Testes Existentes a Modificar
| Arquivo | Motivo da Modificação |
|---------|----------------------|
```

Se nenhum: `> Nenhum teste existente impactado.`

### Passo 5: Validar como engenheiro de tarefas

Antes de integrar a Seção 5 (Testes) na task:

1. Verifique **coerência** com os arquivos impactados (os componentes testados existem?).
2. Verifique que os testes cobrem os **critérios de conclusão** da task e **materialize a cobertura na tabela 5.5** (Critério → Testes) — todo critério com ≥1 teste; nenhum critério órfão.
3. Ajuste nomenclatura para seguir padrões do projeto.
4. **Concretude da asserção (BLOQUEANTE)**: nenhuma célula de "Expected"/"Validação" **nem o "Resultado esperado" dos cards 5.6** pode conter termo vago ("tratável", "correto", "válido", "não vazio", "funciona"). Cada um deve trazer valor exato, sentinela/tipo de erro ou código de status (priorize `negative_companion.assertion_esperada` do JSON). Se algum ficar vago, reescreva ou regenere com o subagente — o executor implementa literalmente.
5. Para tasks SEM código (documentação, configuração): preencher "N/A — task não envolve código testável".

### Passo 6: Integrar, persistir o JSON e seguir

1. Insira a Seção 5 convertida na task.
2. **Persista o JSON em `shared.test_cases.path`** (`.claude/rules/agent-spec-workflow-rules.md`): envelope `{ "schema_version": 1, "framework": "minispec", "feature": ..., "version": ..., "atualizado_em": ..., "stack_discovery": {...}, "casos_teste": [...], ... }` com `task_id` preenchido em cada caso (no modo consolidado por camada, o envelope por task ID do retorno já dá o mapeamento). Invocações subsequentes fazem **merge append** por (`task_id`, `id`) — nunca remova casos gravados. Forward-only: após o destrinchamento na task, a task markdown é canônica (gates leem a task, nunca o JSON). Tasks `N/A` não geram entrada.
3. Avance para a próxima task — **NÃO peça aprovação isolada da seção de testes**.

> **A skill é a dona de toda a delegação QA**. NÃO há outro componente externo orquestrando. Os Passos 0-6 são executados pela própria skill.

---

## FASE 3 — Heurística de modelo, risk e gates (OBRIGATÓRIA)

Ao gerar cada `tasks/TN.md`, você DEVE preencher os 3 campos do frontmatter da seção 1 (Identificação):

- `model`: modelo de IA para execução (**sonnet** default; **opus** em áreas críticas).
- `risk`: **low** | **medium** | **high**.
- `gates`: **[qa, tech_review]** (default) | **[qa]** | **none** (task trivial).

**Resumo `model` e `risk`** (cross-framework):

```
model: opus    auth/security/crypto/migrations | cross-module (≥3 pacotes) |
               padrão novo que vira ADR | ≥10 arquivos a criar / diff >500 linhas.
model: sonnet  default — CRUD, handlers, services, configs, testes, docs.
model: haiku   NUNCA para o executor.

risk: high     auth/security/crypto/migrations.
risk: medium   refatoração cross-module ou novo padrão.
risk: low      caso contrário.
```

**Heurística `gates` (OBRIGATÓRIA — aplicar a regra "Gates inference rules" de `.claude/rules/agent-spec-workflow-rules.md`)**:

Inferir `gates` a partir do `tipo` da task (sinais textuais sobre nome + arquivos):

| `tipo` inferido | `gates` |
|---|---|
| `docs`, `config_isolada`, `constantes_isoladas` | `none` |
| `wiring/registry` (Wire providers, rotas, barrel exports) | `[qa]` |
| `crud_handler` sobre pattern existente | `[qa]` |
| `service_simples` (≤1 sentinela, sem integração externa) | `[qa]` |
| `db_migrations`, `auth`, `security`, `crypto`, `secrets/config` | `[qa, tech_review]` |
| `padrao_novo` / `candidato_adr` | `[qa, tech_review]` |
| `service_complexo` (≥2 sentinelas, side-effects ext.) | `[qa, tech_review]` |
| `refactor_cross_module` (≥3 módulos/pacotes) | `[qa, tech_review]` |
| `task_risk == high` | `[qa, tech_review]` |
| default na dúvida | `[qa, tech_review]` (conservador) |

**Aplicação**: ao preencher o frontmatter de cada `tasks/TN.md`, classifique o `tipo` e DECLARE `gates` explicitamente com comentário: `gates: [qa]   # tipo=crud_handler`.

**Motivação**: o post-mortem `cadastro-pratos-franquia` rodou Tech Review em 10 tasks; ~5 (config, constante, repo trivial, handlers GET/DELETE simples, wiring) eram `[qa]`-only. Economia esperada: ~30-50min por feature CRUD.

> Os gates declarados são executados pelo orquestrador `/agent-spec-minispec-run-tasks` na fase de execução, invocando os subagentes `agent-spec-qa-validator` e `agent-spec-staff-architecture-review`. **A skill apenas declara os gates** — não os executa.

Usuário pode editar os 3 campos manualmente antes de aprovar — decisão transparente no `.md`.

---

## FASE 4 — Regras de Decomposição (ANTI-FRAGMENTAÇÃO)

Antes de salvar o `task_plan.md`, **APLIQUE** estas regras. Elas evitam fragmentação excessiva — que sobrecarrega a janela de contexto e gera pipelines ineficientes.

### Regra 1 — Teste-como-critério-de-existência (PRINCIPAL)
**Se a task não produz comportamento testável isoladamente, ela NÃO existe como task separada.** Deve ser absorvida pela task que introduz o comportamento que justifica essa mudança.

### Regra 2 — Tamanho mínimo viável
Cada task DEVE satisfazer pelo menos um:
- Cria arquivo novo com ≥ 20 linhas líquidas.
- Introduz capacidade testável isoladamente (≥ 1 teste unitário específico).
- Representa artefato arquitetural completo (classe, componente, migration, endpoint, widget).

### Regra 3 — Proximidade de arquivo
Duas tasks consecutivas que tocam o **mesmo arquivo** e somam < 50 linhas ⇒ **uma task única**.

### Regra 4 — Consolidação por fase de integração
Múltiplas tasks triviais de wire-up na mesma fase (registrar DI + adicionar rota + adicionar item no menu + barrel) ⇒ **1 task "Integração"**.

### Regra 5 — Meta de quantidade como SINAL (não limite)
- Features pequenas: 3-5 tasks.
- Features médias: 5-8 tasks.
- Features grandes: 8-12 tasks.
- **> 12 tasks**: aceitável **apenas** se a feature cobre muitas user stories. Regra operacional: **máx ~3 tasks por user story**. Se uma mesma US aparece em 4+ tasks, **revisar a decomposição daquela US**.

### Regra 6 — Padrões que NUNCA existem sozinhos (agnóstico de stack)
Tasks que isoladamente não produzem comportamento testável — absorva SEMPRE pela task funcional ou agrupe em "Integração":
- **Wire-up / registro de dependência**: container DI, bind IoC, provider tree, `get_it` register, Spring bean, etc.
- **Exposição em exports públicos**: barrel `index.ts`, `mod.rs`, `__init__.py`, `library.dart`, public API.
- **Registro em router/menu/entry point**: rota, item de menu, tab, deeplink, endpoint registration.
- **Wire-up de assets**: ícone, imagem, string i18n, resource bundle.
- **Ajuste trivial de tipo/modelo existente**: adicionar 1-2 campos em struct/class/type.
- **Config isolado**: flag, env var, chave de config, feature toggle.

**Heurística**: se a mudança é puramente mecânica e SÓ ganha sentido quando outra task entrega a funcionalidade que a consome ⇒ pertence à task funcional.

### Regra 7 — Atomic Reviewable Commit
Cada task deve corresponder a um commit atômico que um reviewer entende em isolado. "Commit vazio de significado" (ex: "registrar X no container") **NÃO** é atômico — é parte de outra task.

### Regra 8 — Testes são MANDATÓRIOS (BLOQUEANTE)
A Seção 5 (Testes) gerada pelo `agent-spec-qa-test-generator` **NÃO** é opcional:

- O executor DEVE implementar TODOS os testes especificados antes de retornar a task como concluída.
- Se o projeto **não tem engine de teste configurada**, o executor NÃO pode ignorar silenciosamente. Deve **pausar e perguntar ao usuário**:
  - **(a)** Configurar engine agora (Vitest/Jest para JS-TS, `go test` nativo para Go, `pytest` para Python, `flutter test`/`dart test` para Dart-Flutter, JUnit para Java, `bundle exec rspec` para Ruby, etc.).
  - **(b)** Gerar os testes como arquivos mesmo sem execução automática (código versionado, aguarda engine).
  - **(c)** Ignorar os testes DESTA task explicitamente (requer confirmação do usuário, registrado em observações da task).
- O QA no gate REJEITA se testes exigidos não foram implementados.

### Regra 9 — Anti-Agregação de Contratos + Handlers (BLOQUEANTE)

Se uma task acumula **≥ 3 arquivos de contrato** (DTOs / Requests / Responses) **+ ≥ 1 handler com lógica de domínio**, **quebrar em pelo menos 2 tasks**:

- **Task A — base + contratos**: setup do sub-pacote, DTOs, Requests/Responses, mocks, wire_provider stub.
- **Task B (e C, D...) — handler(s) por verbo ou agrupamento natural**: 1-2 handlers que consomem os contratos da Task A.

**Por que**: o post-mortem `cadastro-pratos-franquia` mostrou que T7 (= base do sub-pacote + Requests + Responses + 2 handlers) gerou cascade: ADR-0010 nas tags HTTP foi detectada tarde, mock-driven confidence em handlers múltiplos compostos com structs novos, correção exigiu mexer simultaneamente em DTO/Service/Responses/Handlers. Cada hit do gate forçou re-trabalho em ≥ 4 arquivos simultaneamente.

**Heurística adicional**:
- 1 contrato (1 Request OU 1 Response) + 1 handler simples → OK em 1 task.
- 1 contrato + ≥ 2 handlers → OK em 1 task **se** os handlers compartilham o contrato e a lógica é simétrica (ex.: GET por ID + DELETE).
- ≥ 3 arquivos de contrato → **sempre** task separada antes de qualquer handler.

### Regra 10 — Coerência de dependências e escopo (BLOQUEANTE)

Antes de fixar a ordem das tasks e salvar o `task_plan.md`, valide três direções que historicamente forçam reorder ou desvio de escopo na execução. Agnóstico de stack.

- **10a — Direção de dependência de símbolos.** Nenhuma task pode referenciar — nem em assertion de teste, nem em compile-time assertion — um símbolo (tipo, função, interface, constante) cujo **nascimento** está numa task **posterior**. Para cada símbolo citado por uma task, verifique em qual task ele é criado: se for posterior, **mova a referência** para a task que cria o símbolo OU declare a dependência explícita e **reordene**. _(Run `esqueci-a-senha`: T3 referenciava `service.EmailSender`, nascida em T5 → reorder forçado em execução.)_ **PERSISTA o resultado**: preencha `Simbolos publicos criados` e `Simbolos consumidos de outras tasks` (símbolo → task de origem) na seção 1 de cada `TN.md`. Esses campos não são opcionais — alimentam a derivação do flag (10d) e o guard de disjunção de símbolo do executor. Sem eles, o executor não consegue provar independência e cai para sequencial.
- **10b — Blast radius além dos arquivos tocados.** Quando a mudança de uma task afeta estado/contrato **compartilhado** além dos arquivos que ela edita (estado global, contrato/schema em camada compartilhada, testes acoplados a ordem/profundidade de uma pilha), liste os **dependentes afetados** em §3.2 — ou uma nota autorizando tocá-los — e registre que a validação roda no **escopo do blast radius**, não só no módulo local. Vale para qualquer estado partilhado (migração no topo de uma pilha, contrato versionado, store global de front).
- **10c — Mudança de assinatura arrasta dependentes.** Quando uma task altera a assinatura de um símbolo público (novo parâmetro obrigatório em construtor/função, mudança de retorno), **inclua em §3.2 os dependentes mecanicamente forçados** (composition root, callers, testes que instanciam) ou uma nota autorizando tocá-los. Tocá-los para o contrato/build permanecer válido é "limpar a própria bagunça", não expansão de escopo — evita falso-positivo de `scope_deviation` no gate.

- **10d — Derivação do flag de paralelismo (NÃO autore por intuição).** A coluna `Pode Rodar em Paralelo?` do `task_plan.md` (seção 4 e grafo da seção 5) é **computada**, não adivinhada. Aplique o **"Invariante de Paralelismo"** de `.claude/rules/agent-spec-workflow-rules.md`. Para cada par de tasks da **mesma fase**, marque ambas `Sim` **somente se** TODAS valerem; caso contrário ambas (ou a consumidora) recebem `Não`:
  1. **Independência no DAG** — nenhuma é ancestral/descendente da outra (deps diretas ou transitivas).
  2. **Disjunção de símbolo** — `consumidos(ti) ∩ criados(tj) = ∅` nos dois sentidos (use os campos preenchidos em 10a).
  3. **Paths declarados disjuntos** — seções 3.1+3.2 sem interseção.
  4. **Nenhuma toca arquivo de alta contenção** em comum (container DI, router/registry, barrel, manifests, diretório de migrations — ver lista canônica na rule).

  **Default em qualquer incerteza: `Não`** (falso-sequencial custa minutos; falso-paralelo corrompe a ordem de execução). As colunas das seções 4 e 5 ficam com a anotação "(derivado)" e devem ser **idênticas entre si**. Uma task que depende de outra da **mesma fase** **nunca** sai `Sim`.

---

## FASE 4.5 — Propagação de ADRs Aplicáveis por task (OBRIGATÓRIA se o scope lista ADRs)

Leia a subseção **"ADRs Aplicáveis nesta Feature"** do `scope.md` (produzida na etapa 0.2.0 da geração do scope, já confrontadas literalmente). Para **cada** `tasks/TN.md`, preencha a subseção **"### ADRs Aplicáveis nesta Task"** (seção 6):

1. Inclua o **subconjunto** das ADRs da feature cujas áreas governadas **intersectam os arquivos da task** (§3.1 + §3.2). Use o path/símbolo concreto da `Decision` da ADR como critério de intersecção.
2. Formato por linha: `ADR-NNNN — decisão concreta a obedecer (path/lib/padrão) — docs/adr/NNNN-slug.md`.
3. Se nenhuma ADR governa os arquivos da task → escreva `Nenhuma`.

> **Por que por task**: o run injeta esta subseção **verbatim** no prompt do executor (bloco "ADRs aplicáveis — REGRA ABSOLUTA"). O executor roda isolado e não vê o scope; sem a lista na task, ele implementa cego à ADR — exatamente a falha do caso `arquitetura-projeto`. Filtrar por intersecção evita poluir cada task com ADRs irrelevantes.

---

## FASE 5 — Salvar Arquivos (OBRIGATÓRIO antes de apresentar)

**ANTES** de apresentar o resumo final ao usuário, você DEVE:

1. **Resolver os paths** substituindo `{feature}`, `{version}` e `{n}`:
   - `minispec.task_plan.path` (saída: `task_plan.md`).
   - `minispec.tasks.dir` + `minispec.tasks.pattern` (saída: `tasks/TN.md`).
2. **Criar diretórios pai** dos paths resolvidos (incluindo `tasks/`).
3. **Remover todos os comentários `<!-- LLM-ONLY: ... -->`** do conteúdo antes de salvar — são instruções internas do template e **NÃO** devem aparecer nos arquivos gerados.
4. **Salvar cada `tasks/TN.md`** ANTES de avançar para a próxima task.
5. **Salvar o `task_plan.md`** APÓS todas as tasks estarem salvas.
6. Confirmar que todos os arquivos foram criados.

### Templates

- **Task Plan** (REFERÊNCIA/ÍNDICE): [task_plan_template.md](assets/task_plan_template.md)
- **Task Individual** (DETALHADO): [task_template.md](assets/task_template.md)

Todas as seções dos templates devem ser preenchidas. Se uma seção não se aplica, indique explicitamente "N/A — [justificativa]".

> O template do Task Plan **NÃO** contém detalhamento de tasks — ele é um índice. O detalhamento vai EXCLUSIVAMENTE em `tasks/TN.md`.

---

## FASE 6 — Saída Esperada (após salvar — ANTES de atualizar o estado)

Apresente um **resumo compacto** ao usuário. **NÃO** exiba o `task_plan.md` ou as tasks completas — o usuário lerá os arquivos diretamente.

```
Arquivos salvos em: <diretório resolvido a partir de minispec.task_plan.path>
  - task_plan.md (índice com [N] tasks)
  - tasks/T1.md ... tasks/T[N].md

Tarefas Geradas
Total: [N] tasks
Sequência: T1 -> T2 -> T3 (paralelo: T4, T5) -> T6

Aprova essas tasks para execução? (sim/não)
```

**IMPORTANTE:**

- **NÃO** inicie `/agent-spec-minispec-run-tasks` automaticamente.
- **NÃO** sugira executar o próximo comando.
- **NÃO** sugira próximos passos do framework.
- **Se "sim"** → execute a FASE 7 (Estado do Pipeline) e encerre.
- **Se "não"** → **NÃO atualize o estado** (o state não pode registrar `completed` para um task plan reprovado). Colete os ajustes, revise tasks/task_plan e repita esta FASE 6.

---

## FASE 7 — Estado do Pipeline (_run/minispec_state.yaml — APÓS aprovação do usuário)

> **Ordem inviolável**: este passo só roda **depois** do "sim" da FASE 6. Atualizar o estado antes da aprovação faz o state mentir quando o usuário reprova o plano.

Atualize o arquivo no path resolvido a partir de `minispec.state.path` (mesmo diretório do `task_plan.md`).

### Se o `_run/minispec_state.yaml` NÃO existir

**NÃO** crie o arquivo. A criação é responsabilidade da skill `agent-spec-minispec-generate-intent`. Apenas registre a omissão e prossiga.

### Se o `_run/minispec_state.yaml` JÁ existir — atualize apenas estes campos:

```yaml
current_step: task_plan
steps:
  task_plan:
    status: completed
    summary: "<N tasks>, <M fases>, <P paralelizáveis>"
  execution:
    status: pending
    tasks_total: <N>
    tasks_completed: 0
```

### Bloco `validation` (atualize junto, se o step existir no state e ainda estiver `pending`)

O step `validation` é marcado `completed` pela `/agent-spec-challenge-spec` quando o usuário a roda sobre o `scope.md`. Se chegou até aqui ainda `pending`, o challenge foi pulado:

```yaml
steps:
  validation:
    status: skipped
```

---

## Guardrails Invioláveis

Estas regras são **absolutas** e não podem ser violadas:

1. **Aprovação obrigatória** — nunca avance sem confirmação do usuário.
2. **Sem invenção** — se faltar informação, **PERGUNTE** ao usuário via `AskUserQuestion`.
3. **Escopo fechado** — cada documento deve ser auto-suficiente.
4. **Template completo** — todas as seções devem ser preenchidas (ou marcadas N/A com justificativa).
5. **Arquivos físicos** — **SEMPRE** salvar antes de apresentar ao usuário.
6. **AskUserQuestion** — use esta ferramenta para esclarecer dúvidas com o usuário.
7. **Pesquisa obrigatória** — explore o codebase antes de criar tasks (FASE 0).
8. **Baseado em INTENT e SCOPE** — **NUNCA** adicione funcionalidades não mencionadas.
9. **Testes via subagente** — **SEMPRE** delegue a Seção 5 (Testes) ao `agent-spec-qa-test-generator` (FASE 2). NUNCA preencha manualmente.
10. **Heurística obrigatória** — preencha `model`, `risk`, `gates` no frontmatter de cada task (FASE 3).
11. **Regras de decomposição 1-10** — aplique antes de finalizar cada task (FASE 4), incluindo a Regra 10 (coerência de dependências/símbolos e derivação do flag de paralelismo).
12. **Separação de documentos** — `task_plan.md` é APENAS referência/índice; corpo detalhado vive EXCLUSIVAMENTE em `tasks/TN.md`.
13. **Listagem completa de arquivos** — liste **TODOS** os arquivos envolvidos em cada task com ação (criar/modificar/referência) para economizar tokens e scans.
14. **NUNCA inicie automaticamente a próxima etapa** — apenas encerre e aguarde aprovação.
15. **NUNCA** use Haiku no executor de uma task — Sonnet (default) ou Opus (áreas críticas).
16. **NUNCA** peça aprovação individual de cada task — avance automaticamente após salvar.
17. **NÃO** peça aprovação isolada da seção de Testes — apresente as tasks completas para validação.

---

## Estrutura de Saída

```
docs/
  specs/
    features/
      <nome-feature>/
        <versão>/
          intent.md          # INTENT aprovada (entrada)
          scope.md           # SCOPE aprovado (entrada)
          _run/qa_context.md     # Contexto denso para QA (gerado por esta skill)
          task_plan.md       # Índice e coordenação (gerado)
          tasks/
            T1.md            # Task individual com Seção 5 preenchida via QA
            T2.md
            T3.md
            ...
          _run/minispec_state.yaml  # Estado do pipeline (atualizado)
```

---

## Checklist Final (validar antes de salvar)

- [ ] Todas as fases macro definidas
- [ ] Todas as tasks criadas com template completo
- [ ] `model`, `risk`, `gates` preenchidos no frontmatter de cada task
- [ ] Regras de Decomposição 1-10 aplicadas (sem fragmentação excessiva, sem agregação ≥ 3 contratos + handler, dependências/símbolos coerentes)
- [ ] Dependências entre tasks mapeadas e coerentes
- [ ] `Simbolos publicos criados` / `Simbolos consumidos de outras tasks` preenchidos em cada `TN.md` (Regra 10a)
- [ ] Flag `Pode Rodar em Paralelo?` **derivado** do DAG + símbolos (Regra 10d) — não autorado por intuição
- [ ] Invariante satisfeito: nenhuma task `Sim` depende (direta/transitiva) de outra da mesma fase; colunas das seções 4 e 5 idênticas
- [ ] **TODOS** os arquivos envolvidos listados em cada task com ação (criar/modificar/referência)
- [ ] `qa_context.md` extraído (se feature ≥ 3k tokens)
- [ ] Seção 5 (Testes) preenchida em cada task via `agent-spec-qa-test-generator` (delegação obrigatória)
- [ ] Critérios de conclusão da feature definidos
- [ ] Cada task salva em arquivo individual `tasks/TN.md`
- [ ] `task_plan.md` contém APENAS referências (sem corpo detalhado de tasks)
- [ ] Comentários `<!-- LLM-ONLY: ... -->` removidos dos arquivos finais
- [ ] Nenhuma informação foi inventada ou deduzida
- [ ] `_run/minispec_state.yaml` atualizado (se existir)
- [ ] Pronto para execução

---

## Exemplo de Output Esperado (apresentação ao usuário)

```
Arquivos salvos em: /docs/specs/features/cardapio-digital/v1/
  - task_plan.md (índice com 6 tasks)
  - tasks/T1.md ... tasks/T6.md

Tarefas Geradas
Total: 6 tasks em 3 fases
Sequência: T1 -> T2 -> T3 (paralelo: T4) -> T5 -> T6

Aprova essas tasks para execução? (sim/não)
```

---

## Entrada

`$ARGUMENTS` deve conter dois caminhos absolutos:

1. **Caminho do `intent.md`** (obrigatório).
2. **Caminho do `scope.md`** (obrigatório).

Exemplo:
```
/docs/specs/features/cardapio-digital/v1/intent.md /docs/specs/features/cardapio-digital/v1/scope.md
```

$ARGUMENTS
