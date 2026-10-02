# Delegação QA — Seção 6 das Tasks (Testes)

> Este arquivo é consultado pela skill `agent-spec-sdd-generate-task-plan` no momento de preencher a **seção 6 (Testes)** de cada task.

A seção 6 de cada task **NÃO** deve ser preenchida pelo engenheiro de tarefas. Você DEVE delegar para o subagente **`agent-spec-qa-test-generator`** que retorna um JSON estruturado. Depois, você converte o JSON em markdown na seção 6: **tabelas-índice** (6.0-6.5, cobertura num relance) + **Detalhamento por CT** (6.6, card lossless para validação humana e execução). O JSON também é persistido em `shared.test_cases.path`.

> Testes são parte da especificação de cada task — esta etapa é obrigatória.

---

## Pré-verificação: a Estratégia de Testes do tech_spec já cobre os CTs? (skip QA quando completa)

**Antes** de invocar qualquer `agent-spec-qa-test-generator`, verifique se a fase de tech_spec já gerou os CTs. **Fonte preferencial: o JSON lossless** persistido pelo `agent-spec-sdd-generate-tech-spec` em `shared.test_cases.path` (`.claude/rules/agent-spec-workflow-rules.md`). **Fallback (features geradas antes do artefato)**: a tabela markdown da seção **Estratégia de Testes** do tech_spec (§19 backend / §17 web / §18 mobile, conforme a `variant`).

```
SE shared.test_cases.path existe E casos_teste[] não-vazio E cada caso tem criterios_aceitacao_validados não-vazio:
  → REDISTRIBUIÇÃO VIA JSON (fluxo primário — SEM reinvocar o generator): distribuir os casos por task
    via match componente→task (lossless — preserva pre_condicoes, passos, negative_companion,
    precondicao_privilegiada para o Detalhamento §6.6).
  → NÃO invocar agent-spec-qa-test-generator para essas tasks.
  → Invocar agent-spec-qa-test-generator APENAS para tasks onde a heurística não achou match (fallback —
    a geração do tech_spec acontece ANTES da decomposição; uma task pode emergir sem CT correspondente).
SENÃO SE tech_spec.md tem a Estratégia de Testes com >= 10 CTs detalhados E cada CT tem mapeamento para CA:
  → REDISTRIBUIÇÃO HEURÍSTICA (legado, lossy): distribuir CTs existentes por task via match componente→task
    parseando a tabela markdown. O Detalhamento §6.6 fica limitado ao que a tabela carrega — registre isso
    em observação na task.
  → Mesmas regras de fallback acima.
SENÃO:
  → Invocar agent-spec-qa-test-generator normalmente para todas as tasks (fluxo padrão).
```

**Redistribuição** (passo a passo — via JSON quando disponível; senão parse da tabela):
1. **Via JSON**: leia `casos_teste[]` de `shared.test_cases.path` — cada caso já traz `id`, `tipo`, `existing_suite`, `invariant`, `dados_entrada`, `resultado_esperado`, `criterios_aceitacao_validados` e os campos ricos. **Via markdown (legado)**: parseie a tabela da Estratégia de Testes do tech_spec, extraindo `CT-XX, componente, tipo, input, expected, mock, CA-XX`.
2. Para cada task em `task_plan`, extraia os componentes/arquivos da seção 5 (A Criar + A Modificar).
3. Faça match componente↔task via grep/regex dos paths (no JSON, use `existing_suite` + `camada` do caso):
   - Se CT menciona `internal/pings/handler/*` e a task T5 tem `internal/pings/handler/ping_handler.go` em 5.1 → CT-XX pertence a T5.
4. Para CTs sem match claro, agrupe e apresente ao usuário via `AskUserQuestion`:
   - "Identifiquei 3 CTs não distribuídos automaticamente: CT-15 (integração), CT-18 (E2E), CT-22 (smoke). Deseja: (a) atribuir manualmente, (b) invocar agent-spec-qa-test-generator para esses específicos, (c) criar uma task 'T-extra-tests'?"
5. Mostre a distribuição proposta ao usuário para aprovação:
   ```
   Distribuição proposta (extraída da Estratégia de Testes do tech_spec):
   T1: CT-01, CT-02, CT-03 (3 CTs)
   T2: CT-04, CT-05 (2 CTs)
   T3: CT-06 (1 CT)
   ...
   Total: 28/30 CTs distribuídos; 2 CTs em fallback (CT-15, CT-18).
   Aprovar? [s/N]
   ```

**Economia estimada**: em features onde `agent-spec-sdd-generate-tech-spec` já produz a Estratégia de Testes completa, **elimina 70-90% das invocações QA**.

**Fallback robusto**: se a heurística falhar para qualquer task, o `agent-spec-qa-test-generator` ainda é invocado (não há perda de qualidade).

**Atualização do `task_id` no JSON (OBRIGATÓRIA ao fechar a distribuição)**: para cada caso distribuído, grave o ID da task no campo `task_id` do caso correspondente em `shared.test_cases.path`. Casos vindos de invocações fallback (que retornam JSON novo do generator) são **anexados** ao mesmo arquivo com `task_id` já preenchido — merge append por (`task_id`, `id`), nunca remova casos existentes. Se o arquivo não existia (fluxo padrão sem tech_spec ou feature legada), **crie-o** com o envelope descrito em `agent-spec-workflow-rules.md` (`framework: "sdd"`) consolidando os JSONs de todas as invocações desta fase.

**Renumeração de CTs de fallback (SDD — IDs globais da feature)**: no SDD os IDs `CT-XX` são **globais da feature** (a tabela CA→CT do tech_spec os referencia), mas o generator retorna IDs **locais** (cada invocação começa em CT-001). Antes de integrar/persistir casos de uma invocação fallback, **renumere-os para continuar a sequência global** (ex.: tech_spec parou em CT-30 → fallback vira CT-31, CT-32, …), atualizando as referências internas (`negative_companion.ct_id` e menções em `observacoes`). Sem isso, dois CTs textualmente "CT-001" coexistem em tasks diferentes — a chave (`task_id`, `id`) não colide no JSON, mas a unicidade exigida pela fase de tech_spec ("cada CT tem ID único") quebra para o leitor humano. Aplique a mesma renumeração no **fluxo padrão consolidado por camada** quando a feature usa IDs globais; quando NÃO há tech_spec com CTs (feature partiu direto para tasks), IDs locais por task são aceitáveis — registre a convenção adotada em observação no `task_plan.md`.

---

## Quando executar

Para **cada task**, após preencher as seções 1-5 e 7-8, **ANTES de salvar o arquivo da task**. Se várias tasks estão sendo criadas, dispare subagentes QA em **paralelo** para maximizar eficiência.

---

## Consolidação por camada (reduzir N subagentes para 4)

**Problema**: N tasks → N subagentes paga ~3k de system prompt + ~6k de MCP por invocação. Em 8 tasks isso é ~72k de overhead fixo repetido.

**Estratégia**: agrupe as tasks por **camada arquitetural** e dispare **1 subagente por grupo** que retorna CTs para TODAS as tasks do grupo em 1 JSON:

| Camada | Tipos de tasks agrupadas |
|---|---|
| **infra** | setup de projeto, config, docker, migrations schema, logger, envelope de erro |
| **dominio** | domain models, services de negócio, repositórios, validadores |
| **integracao** | handlers REST, gRPC, wiring de DI, middlewares |
| **e2e + packaging** | testes E2E, smoke, CI, README, Dockerfile final |

**Como invocar**:
1. Classifique cada task em uma das 4 camadas (inferir pelo nome + arquivos impactados).
2. Para cada camada com ≥ 1 task, dispare **1 subagente `agent-spec-qa-test-generator`**.
3. No `instrucoes`, inclua: "Você está gerando testes para um GRUPO de tasks relacionadas. Retorne JSON com chave por task ID (`{'T1': {...}, 'T2': {...}}`). Cada task mantém seu próprio array `casos_teste`."
4. No `arquivos`, passe o `qa_context.md` + TODAS as tasks do grupo (concatenadas) + arquivos relevantes compartilhados pelo grupo.

**Economia estimada**: 8 tasks → 4 subagentes = ~36-48k de overhead eliminado, **sem** perda de qualidade.

**Fallback**: se uma camada tem ≥ 4 tasks com escopo muito divergente, divida em 2 subagentes (ex.: dominio-pings + dominio-auth). Se uma camada tem só 1 task, segue o fluxo tradicional (1 subagente = 1 task).

---

## Passo 0: Extrair `qa_context.md` (OBRIGATÓRIO)

> **Motivo**: sem este passo, cada subagente QA lê o `tech_spec.md` inteiro (~10.5k tokens) apenas para localizar as seções de Arquitetura/Componentes, Fluxos, Critérios de Aceitação e Estratégia de Testes. Com N subagentes = N × 10.5k de releitura desnecessária. O `qa_context` condensado (~1.5-2k tokens) resolve isso.

**Antes de disparar qualquer subagente QA**, extraia 1× um `qa_context.md` denso:

1. **Resolva o path** via `sdd.qa_context.path` (`.claude/rules/agent-spec-sdd-workflow-rules.md`). O prefixo `.` sinaliza artefato intermediário — adicione ao `.gitignore` se ainda não estiver.
2. **Leia o `tech_spec.md`** uma única vez.
3. **Extraia em formato condensado** (idealmente <2k tokens):
   - **Mapa CA→CT**: tabela com `CA-01 → CT-01, CT-02, CT-05 / CA-02 → CT-03, CT-04 / ...` a partir da rastreabilidade do tech_spec.
   - **Componentes** (seção Arquitetura da Solução, condensada): nome + camada + responsabilidade principal (1 linha cada).
   - **Fluxos técnicos críticos** (seção Fluxos, condensada): apenas os fluxos invocados por ≥ 1 task.
   - **Critérios de Aceitação** (condensados do PRD / rastreabilidade CA→CT do tech_spec): lista de `CA-XX: título + regra em 1 linha`.
   - **Estratégia de Testes** (condensada): lista de `CT-XX: tipo + input → expected` em 1 linha cada. **Fonte preferencial**: `casos_teste[]` de `shared.test_cases.path` (já estruturado — mais barato que re-parse da tabela markdown); fallback: a tabela do tech_spec.
   - **Paths relevantes**: lista de arquivos que serão tocados (migrações, queries, etc.).
4. **Salve o `qa_context.md`** no path resolvido.
5. **A partir de agora, cada subagente QA recebe o path do `qa_context.md`** na lista `arquivos` do Passo 1 — NÃO passe `tech_spec.md` completo.

**Ganho estimado**: ~8k × N subagentes ≈ 60-80k tokens economizados em features médias (8 tasks).

**Fallback**: se o `tech_spec.md` for pequeno (<4k tokens), pule este passo e use o `tech_spec.md` diretamente — o overhead de extração não compensa.

---

## Passo 1: Preparar a lista de arquivos

Monte a lista de `arquivos` que o subagente deve ler para CADA task. Inclua:

- **`qa_context.md`** (OBRIGATÓRIO): caminho resolvido via `sdd.qa_context.path`. **Este substitui a passagem do `tech_spec.md` completo** na maioria dos casos.
- **PRD aprovado**: caminho resolvido via `sdd.prd.path` — passado como **referência opcional** para o QA consultar sob demanda.
- **TECH_SPEC completo**: NÃO incluir por padrão. Se o `qa_context.md` não tiver sido gerado (ex.: tech_spec pequeno) OU se a task tocar área pouco coberta pelo contexto condensado, incluir aqui via `sdd.tech_spec.path`.
- **Regras do projeto**: `CLAUDE.md`, `.claude/rules/*.md` (já são carregadas automaticamente no contexto do subagente — NÃO re-liste aqui).
- **Migrações**: arquivos de migração relacionados à task (ex: `internal/db/migrations/*.sql`).
- **Queries**: arquivos de query relacionados à task (ex: `internal/db/queries/*.sql`).
- **Testes existentes**: arquivos de teste relacionados aos arquivos impactados pela task, na convenção da stack (ex.: `*_test.go`, `*.spec.ts`/`*.test.ts`, `test_*.py`, `*_test.dart`, `*Test.java`).
- **Código-fonte existente**: arquivos listados na seção 5 da task (a criar ou modificar).

---

## Passo 2: Preparar as instruções

Monte o campo `instrucoes` com:

1. O conteúdo completo da **task parcial (seções 1-5)** que você montou até o momento.
2. Os **critérios de aceite técnico** da task (seção 4).
3. Os **arquivos impactados** pela task (seção 5) — para o QA saber quais camadas testar.
4. O **tipo da task** (cria handler, cria service, cria repository, cria migração, etc.).
5. Qualquer contexto adicional relevante para o QA.

---

## Passo 3: Disparar o subagente

Lance o subagente usando a ferramenta `Agent` com:

- **subagent_type**: `agent-spec-qa-test-generator`
- **description**: "QA gerar testes task TN"
- **prompt**: Monte o prompt com os 2 parâmetros obrigatórios:

```
Você foi invocado com os seguintes parâmetros:

1. **arquivos**: [lista de caminhos dos arquivos preparados no Passo 1]
2. **instrucoes**: [conteúdo preparado no Passo 2]

OBRIGATÓRIO: Antes de gerar casos de teste, leia (Read) a doutrina de testes: `.claude/skills/agent-spec-testing-best-practices/SKILL.md` e `.claude/skills/agent-spec-testing-best-practices/references/ai-escreve-testes.md`. Aplique os 7 gates (Invariant First, Owning Layer, Real Execution, Failure→Fix Production, No Snapshot Without Contract, No Self-Set Mock, Negative Companion). Cada caso de teste DEVE conter `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion` e, quando aplicável, `precondicao_privilegiada`.
```

> **Modelo**: não passe `model` no `Agent({...})` — confie no default configurado para o subagente.

---

## Passo 4: Converter JSON em Markdown (seção 6)

O subagente retorna um JSON com `casos_teste[]`. Você DEVE converter para o **formato tabular** da seção 6 usando o mapeamento abaixo.

### Mapeamento de tipos

| Campo `tipo` no JSON | Subseção destino |
|---------------------|-----------------|
| `UNITARIO` | **6.1 Testes Unitários** |
| `COMPONENTE` | **6.1 Testes Unitários** — agrupado sob heading próprio `[Componente]: ...` (frontend/mobile) |
| `INTEGRACAO` | **6.2 Testes de Integração** |
| `E2E` | **6.3 Testes E2E** |
| `SEGURANCA` | **6.4 Cenários de Erro** |
| `ACESSIBILIDADE` | **6.1** quando `owning_layer` é `unit` (teste de componente) · **6.3** quando `owning_layer` é `e2e` |

> O generator **não emite** `PERFORMANCE` (testes de carga são proibidos por contrato — viram `recomendacoes`). Se aparecer tipo desconhecido, registre em observação e trate como `INTEGRACAO`.

### Mapeamento de categorias para 6.4

Além dos testes tipo `SEGURANCA` e `PERFORMANCE`, inclua em 6.4 todos os `casos_teste` com `categoria` igual a:
- `tratamento_erro`
- `caso_extremo`
- `fronteira` (quando o teste foca em comportamento de erro)

### Formato de saída por subseção

O formato DEVE seguir o **formato tabular** idêntico ao da seção de **Estratégia de Testes** do TECH_SPEC (seção 17 Web | 18 Mobile | 19 Backend, conforme a `variant` registrada em `_run/sdd_state.yaml`). Isso garante consistência entre os dois documentos e facilita a validação visual.

Infira o nome do arquivo de teste a partir do componente testado, **na convenção da stack do projeto** (descoberta via `.claude/rules/testing-stack.md`, CLAUDE.md ou pelos testes existentes). Exemplos multi-stack para a mesma camada "Service":
- Go → `service_test.go` · Python → `test_service.py` · TS → `service.spec.ts` · Dart → `service_test.dart` · JVM → `ServiceTest.kt`

Infira o nome da função/caso de teste a partir do título do CT, **na convenção da stack** (ex.: `TestMetodo_Cenario` em Go, `test_metodo_cenario` em Python, `describe/it("...")` em JS-TS, `metodo_cenario_test` em Dart). Não imponha a convenção de uma linguagem específica.

**6.0 Padrões de Teste (detectados)** — preencha a partir de `stack_discovery` do JSON (a referência que o executor segue):

```markdown
### 6.0 Padrões de Teste (detectados)
- **Framework**: [stack_discovery.framework_teste]
- **Convenção de nomes**: [convenção da stack — ex.: Test<Layer>_<Function>_<Scenario>, describe/it, test_<function>]
- **Fixture/Setup**: [detectado — ex.: banco in-memory, factory functions, fixtures]
- **Mocks**: [detectado — ex.: interfaces com mock, jest.mock, mocktail, mockito]
```

**6.1 Testes Unitários** — formato tabular agrupado por componente:

```markdown
#### [Camada]: [NomeComponente] (`[arquivo de teste na convenção da stack]`)

Mock: [interfaces mockadas]

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-XX | TestMetodo_Cenario | CA-XX | Verificar que [comportamento] quando [condição] | dados entrada | resultado esperado | dependências mockadas | imite `[teste_analogo]`: [caminho_legitimo] |
```

> **Coluna "Setup (caminho legítimo)"** (anti-violação da Iron Law #6): popule de `precondicao_privilegiada` do JSON — `caminho_legitimo` + `teste_analogo` quando `presente: true`; use `—` quando `presente: false`. É a receita de como montar precondição privilegiada (auth/contexto/relógio/identidade) **sem alargar a superfície de produção**. Descartá-la é a causa nº 1 de executor exportando símbolo de produção só para teste.
>
> **Célula "Objetivo"**: priorize o campo `invariant` do JSON (propriedade que deve valer independente da implementação) em vez de parafrasear o título.

**6.2 Testes de Integração** — formato tabular com Setup acima:

```markdown
#### [CamadaA + CamadaB] (`[arquivo de teste na convenção da stack]`)

Setup: [banco in-memory, migrações, fixtures]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-XX | TestIntegracao_Cenario | CA-XX | Verificar que [comportamento] quando [condição] | Passos do fluxo | Assertions esperadas | imite `[teste_analogo]`: [caminho_legitimo] |
```

**6.3 Testes E2E** — formato descritivo por fluxo:

```markdown
#### Fluxo: [Nome do Fluxo] (CT-XX)
- **CA**: CA-XX, CA-YY
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida de ponta a ponta)
- **Pré-condições**: (estado inicial do sistema — se o JSON traz `precondicao_privilegiada.presente: true`, transcreva aqui o `caminho_legitimo` e o `teste_analogo`)
- **Passos**:
  1. Passo 1
  2. Passo 2
- **Validações**: (assertions sobre dados e estado final)
```

**6.4 Cenários de Erro** — formato tabular:

```markdown
| Cenário | CA | Objetivo | Trigger | Código/Status | Log Esperado |
|---------|----|----------|---------|---------------|-------------|
| Descrição do cenário | CA-XX | Verificar que [constraint] impede [operação] | Ação trigger | Código erro | Mensagem log |
```

**6.5 Rastreabilidade: Aceite Técnico → Testes** — prova de cobertura reversa (obrigatória):

```markdown
| # | Critério de Aceite (§4) / CA | Teste(s) Correspondente(s) | Tipo |
|---|------------------------------|----------------------------|------|
| 1 | [critério §4 ou CA-XX] | [CT-XX / NomeDoTeste] | [Unitário/Integração/E2E] |
```

> Cada critério da seção 4 e cada CA-XX coberto por esta task DEVE ter ≥1 teste mapeado — cruze contra os `casos_teste[]` do JSON. Espelha a "Rastreabilidade: Critérios de Aceite → Testes" da seção Estratégia de Testes do Tech Spec (§19 backend / §17 web / §18 mobile), no escopo da task. Critério/CA órfão = falta de caso (gere) ou critério não-verificável (reescreva).

**6.6 Detalhamento dos Casos de Teste** — destrinchamento lossless por CT (obrigatório):

> **Por quê**: as tabelas 6.1-6.4 são o **índice** (cobertura num relance); o card abaixo é o **detalhe** que dá ao revisor humano poder de validação self-contained e ao executor a receita completa (pré-condições, passos, seam). Sem ele, `pre_condicoes`, `passos`, `negative_companion` e `precondicao_privilegiada` — que o generator JÁ produz — evaporam na compressão tabular. Renderize **um card por caso** de `casos_teste[]` da task, no formato canônico:

```markdown
### 6.6 Detalhamento dos Casos de Teste

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
- **Critérios validados**: [criterios_aceitacao_validados]
- **Obs**: [observacoes]   <!-- OMITIR o bullet quando vazio -->
```

Regras do card:
- O heading `#### CT-XX — [titulo]` preserva o ID greppável — a rastreabilidade CT→teste do `agent-spec-qa-validator` e as tabelas-índice continuam apontando para os mesmos IDs.
- **Não invente conteúdo**: cada campo vem do caso correspondente no JSON. Campo vazio no JSON → omita o bullet (não escreva placeholder).
- **Canonicidade**: após salvo na task, o card é a fonte de verdade do CT — edições humanas acontecem aqui e NÃO são re-sincronizadas com `shared.test_cases.path` (forward-only).
- Na **redistribuição legada via markdown** (sem JSON), preencha o card com o que a tabela carrega (Invariant=Objetivo, Dados de entrada=Input, Resultado esperado=Expected, Precondição privilegiada=Setup) e registre em `## 7. Notas` da task: "Detalhamento §6.6 parcial — redistribuído de tech_spec sem _run/test-cases.json".

### Testes Existentes a Modificar

Após as subseções 6.1-6.5, adicione a tabela de testes existentes. Infira a partir de:
- Campo `recomendacoes` do JSON (se mencionar testes existentes).
- Arquivos de teste já existentes para os componentes impactados pela task (seção 5.2 — Arquivos a Modificar).

```markdown
### Testes Existentes a Modificar
| Arquivo | Motivo da Modificação |
|---------|----------------------|
| [arquivo] | [motivo] |
```

Se nenhum teste existente precisa ser modificado: `> Nenhum teste existente impactado.`

### Informações adicionais do JSON

- **`cenarios_nao_cobertos`**: adicione como nota após a seção 6.4.
- **`recomendacoes`**: use para complementar testes ou identificar testes existentes a modificar.
- **`erros_leitura`**: se houver, mencione quais arquivos não puderam ser lidos.

---

## Passo 5: Validar como engenheiro de tarefas

Antes de integrar a seção 6 na task:

1. Verifique **coerência** com as seções 1-5 da task (os componentes testados existem na seção 5?).
2. Verifique que os testes cobrem os **critérios de aceite técnico** da seção 4 e **materialize a cobertura na tabela 6.5** (Aceite → Testes) — todo critério/CA com ≥1 teste; nenhum órfão.
3. Ajuste nomenclatura de arquivos e funções de teste para seguir os padrões do projeto.
4. **Concretude da asserção (BLOQUEANTE)**: nenhuma célula de "Expected"/"Validação" das tabelas 6.1-6.4 **nem o "Resultado esperado" dos cards 6.6** pode conter termo vago ("tratável", "correto", "válido", "não vazio", "funciona"). Cada um deve trazer valor exato, sentinela/tipo de erro ou código de status (priorize `negative_companion.assertion_esperada` do JSON). Se algum ficar vago, reescreva ou regenere com o subagente — o executor implementa literalmente.
4.1. **Consistência índice↔detalhe**: cada CT das tabelas 6.1-6.4 tem exatamente 1 card em 6.6 e vice-versa (exceto redistribuição legada parcial, anotada em Notas).
5. Para tasks que NÃO envolvem código (ex: documentação, configuração), preencha "N/A — task não envolve código testável".

---

## Passo 6: Integrar e salvar

1. Insira a seção 6 convertida na task.
2. Salve o arquivo `tasks/TN.md`.
3. Avance para a próxima task automaticamente — **NÃO peça aprovação isolada da seção 6**.

---

## Regra de deduplicação de CTs entre tasks (OBRIGATÓRIA)

Cada **CT** (caso de teste) DEVE aparecer em **NO MÁXIMO 1 task**. Isso evita que o mesmo teste seja implementado 2× em tasks diferentes — problema detectado em execução real.

Regras específicas:

1. **CTs compartilhados entre tasks**: se um CT valida integração entre módulos de 2 tasks (ex.: CT-28 de SQL injection entre T6 e T7), atribua-o **apenas à task que IMPLEMENTA o código que é validado**. A outra task apenas "consome" — não precisa listar o CT na sua seção 6.
2. **Testes manuais / smoke / validação humana**: ficam na task que canonicamente os possui (geralmente a última task da fase, ou a task de E2E/packaging). NÃO duplique em tasks anteriores.
3. **Validação cruzada**: se o mesmo comportamento precisa ser validado em camadas diferentes (unit + integração), use CTs distintos (CT-10 unit em T3, CT-11 integração em T5) — NÃO o mesmo CT em ambas.

Ao fechar a distribuição (heurística ou via subagente), verifique explicitamente:
- [ ] Cada CT aparece na seção 6 de exatamente 1 task.
- [ ] Nenhum CT é referenciado em múltiplas tasks.
- [ ] Smoke/manual tests estão em 1 task canônica.
