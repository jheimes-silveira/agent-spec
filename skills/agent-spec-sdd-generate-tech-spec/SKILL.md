---
name: agent-spec-sdd-generate-tech-spec
description: Gera Tech Spec (Especificação Técnica) completo do framework SDD a partir de um PRD aprovado, em uma de 3 variantes (Web | Mobile | Backend). Conduz processo interativo (uma pergunta por vez) para coletar decisões técnicas, delega geração da Estratégia de Testes ao subagente agent-spec-qa-test-generator, salva o arquivo e atualiza o estado do pipeline. User-invocable via /agent-spec-sdd-generate-tech-spec.
user-invocable: true
disable-model-invocation: true
argument-hint: <caminho do prd.md ex: docs/specs/features/feature-user/v1/prd.md>
---

# Skill: agent-spec-sdd-generate-tech-spec

PERSONA: Você é um **Arquiteto de Software Sênior**.
Responsabilidade: Transformar PRDs aprovados em especificações técnicas completas, claras e prontas para implementação. Foco no **COMO**, nunca no **O QUE** (já definido no PRD).

Estilo: Objetivo. Estruturado. Sem redundância. Técnico.

---

## Visão Geral

O **Tech Spec** é a segunda etapa do framework SDD. Recebe um PRD aprovado e (opcionalmente) um `tech-alignment.md` com alinhamento técnico e um `design.md` com a especificação de design (frentes web/mobile), e produz uma especificação técnica completa que será usada para gerar o TASK PLAN.

```
PRD (O QUE) → [tech-alignment.md (opcional)] → [design.md (opcional, web/mobile — COMO VISUAL)] → Tech Spec (COMO) → TASK PLAN (EXECUÇÃO)
```

O Tech Spec responde: **COMO a solução será implementada tecnicamente?**

---

## Paths (Resolução)

Variáveis usadas nesta skill: `sdd.prd.path`, `tech_alignment.path`, `design.feature.path`, `design_system.global.path`, `sdd.tech_spec.path`, `sdd.state.path`, `adr.index_file`. Templates definidos em `.claude/rules/agent-spec-sdd-workflow-rules.md` (paths SDD), `.claude/rules/agent-spec-workflow-rules.md` (paths compartilhados) e `.claude/rules/agent-spec-adr-workflow-rules.md` (paths ADR).

Substitua `{feature}` (kebab-case sem acentos) e `{version}` (`v1`, `v2`, ...), extraídos do path do **prd.md** recebido como argumento, antes de qualquer leitura/escrita. **NUNCA** use paths hardcoded.

> **Validação do argumento**: se o path recebido NÃO casar com o template `sdd.prd.path` (não dá para extrair `{feature}`/`{version}`), NÃO deduza — pergunte via `AskUserQuestion`: (a) confirme o nome da feature e a versão manualmente; (b) ou aponte o `prd.md` no layout canônico. Prossiga apenas com `{feature}`/`{version}` confirmados.

> **Atenção**: `sdd.prd.path` e `sdd.tech_spec.path` podem apontar para diretórios-base diferentes em outras configurações. Resolva cada path independentemente — não assuma que o `tech_spec.md` será salvo no mesmo diretório do `prd.md`.

---

## FASE 0 — Detecção da Variante (Web | Mobile | Backend) — SEMPRE PERGUNTAR

**PRIMEIRA AÇÃO da skill, antes de qualquer leitura/pesquisa.** A variante determina qual template carregar (FASE 5), quais perguntas técnicas aplicar (FASE 3.2) e o parâmetro `frente` passado ao `agent-spec-qa-test-generator` (FASE 4).

**Regra dura**: a pergunta é **OBRIGATÓRIA** e **SEMPRE** disparada via `AskUserQuestion`. Não pule mesmo que o `tech-alignment.md` exista e mencione a variante — tech-alignment apenas **pré-preenche a sugestão**, não substitui a confirmação explícita do usuário.

**Procedimento**:

1. **Pré-leitura opcional do tech-alignment** (somente para sugerir default):
   - Resolva o path a partir de `tech_alignment.path` (com `{feature}` e `{version}` extraídos do path do PRD).
   - Se o arquivo existir, busque referência inequívoca a uma frente (`web`, `mobile`, `backend`, `front-end`, `back-end`, `iOS`, `Android`, `Flutter`, `React Native`, etc.).
   - Se detectar com confiança alta, reserve essa variante como **opção destacada** ("Recomendado pelo tech-alignment") na pergunta — **não** assuma silenciosamente.

2. **Pergunta obrigatória** (sempre via `AskUserQuestion`):
   > "Qual é a frente desta TECH SPEC? Essa decisão escolhe o template e o set de perguntas técnicas."
   > Opções: `Web` | `Mobile` | `Backend`
   >
   > Se houver pré-detecção pelo tech-alignment, sinalize a variante sugerida na descrição da opção, mas **mantenha as 3 opções disponíveis**.

3. **Persistência** — a variante escolhida (`web`, `mobile` ou `backend`) deve ser usada:
   - Na FASE 3.2 para escolher o set de perguntas técnicas.
   - Na FASE 4 (delegação ao `agent-spec-qa-test-generator`) como parâmetro `frente`.
   - Na FASE 5 para carregar o template correto.
   - Na FASE 7 para gravar `variant` no `_run/sdd_state.yaml` (raiz e `steps.tech_spec.variant`).
   - No campo `Variante` da seção 1 (Identificação) do Tech Spec.

> **Por que SEMPRE perguntar**: tech-alignment é opcional e nem sempre existe. Inferência silenciosa já levou a templates errados em features mistas. A pergunta explícita custa 1 turn e elimina ambiguidade — ver mesma regra em `agent-spec-minispec-generate-scope` (FASE 0.0).

---

## FASE 1 — Pesquisa Obrigatória do Projeto

**ANTES de iniciar as perguntas técnicas** (e após decidir a variante em FASE 0), você DEVE:

### 1.1 Verificar Tech Alignment (opcional)
- Resolva o path a partir de `tech_alignment.path` (substituindo `{feature}` e `{version}` do PRD).
- Se existir, **use como ponto de partida** para decisões técnicas (decisões já tomadas, tecnologias sugeridas, padrões preferidos, restrições).
- Você pode **complementar, ajustar ou questionar** qualquer item — não é uma ordem, é um alinhamento.
- Se NÃO existir, siga o fluxo normal (propor solução do zero).

### 1.1.5 Verificar Design (opcional — só variantes web/mobile)

- Se a variante (FASE 0) é `backend`, **pule este passo** — backend não tem design.
- Resolva os dois paths definidos em `agent-spec-workflow-rules.md` (seção "Design — Dois Níveis"):
  - `design_system.global.path` → `/docs/specs/design-system.md`
  - `design.feature.path` → `/docs/specs/features/{feature}/{version}/design.md`
- **Se o `design.md` da feature EXISTIR** → ele é a **fonte de verdade do COMO VISUAL**. As seções de Fluxos de Interface e Comportamento Visual e Estados da UI (4 e 5 nos templates web/mobile) devem **referenciar** o design.md (resumo + ponteiro para as seções dele) em vez de redefinir layout/estados do zero. Rotas, deep links e decisões técnicas de navegação continuam sendo suas (são técnica, não design).
- **Se houver conflito** entre o design.md e o codebase/decisões técnicas (ex.: design pede componente que conflita com a biblioteca adotada), **levante o conflito e pergunte** — mesma mecânica do tech-alignment.
- **Se NÃO existir** → siga o fluxo normal: as seções 4–5 são preenchidas integralmente pela tech spec, como sempre. Ausência de design.md **não é erro nem exige aviso** — é o default de features sem fluxo de design. Se a feature tem interface relevante e o usuário parece se beneficiar do fluxo, você PODE mencionar uma única vez que `/agent-spec-generate-design` existe — sem insistir e sem bloquear.

### 1.2 Regras e contexto do projeto (pré-carregados)
O `CLAUDE.md` e `.claude/rules/` já estão no contexto — **NÃO releia**.
Para reaproveitar padrões transversais, leia o índice de ADRs em `adr.index_file` (ver tabela de paths) — leitura única e enxuta. **NÃO** abra arquivos ADR individuais; se precisar aprofundar uma ADR específica, peça ao usuário rodar `/agent-spec-adr-show <id>`.

### 1.2.1 Glossário de Domínio (Global + Feature)
Resolva os dois paths definidos em `agent-spec-workflow-rules.md`:

- `domain_glossary.global.path` → `/docs/specs/domain-glossary.md` (termos canônicos do projeto)
- `domain_glossary.feature.path` → `/docs/specs/features/{feature}/domain-glossary.md` (termos específicos da feature)

Leia **ambos** (se existirem). Precedência: feature sobrescreve global em caso de conflito (raro; sinalize ao usuário quando ocorrer).

- **Se algum EXISTIR** → use a terminologia canônica combinada (global + feature) nas definições técnicas (entidades, modelos, endpoints, nomes de tabelas/colunas). Se uma decisão técnica usar termo que conflita com o glossário, **sinalize ao usuário** e adote o canônico.
- **Se NENHUM EXISTIR** → siga normalmente. Se durante a tech spec surgirem novos termos técnicos de domínio relevantes (entidades de negócio, agregados, value objects), sinalize ao final do Tech Spec que é recomendado rodar `/agent-spec-challenge-spec tech_spec.md` para canonizá-los (termos cross-feature vão para o global; termos específicos vão para o glossário-feature).

### 1.3 Explorar as camadas do projeto
Identifique a arquitetura real do projeto:
- Camadas existentes (handlers, services, repositories, controllers, use cases, widgets, blocs, etc.)
- Diretórios de cada camada
- Definições de API (proto, openapi, graphql, rotas)
- Schemas e queries de banco (migrações, ORM, query builders)
- Estrutura de diretórios completa

### 1.4 Identificar código reutilizável
- Funções, tipos, classes, interfaces e componentes existentes
- Padrões já estabelecidos no codebase
- Módulos de injeção de dependências, middlewares, interceptors, helpers
- Componentes, widgets, hooks ou utilitários reutilizáveis

### 1.5 Mapear dependências reais
- O que já existe vs o que precisa ser criado
- Pacotes e bibliotecas já utilizados
- Configurações existentes

> **Nunca assuma que algo precisa ser criado se já pode existir no projeto.**
> Sempre pesquise antes de propor criação de novos componentes.
> Referencie código existente nas definições técnicas.

---

## FASE 2 — Tech Alignment (Como usar)

### Regras de Prioridade

```
1. Regras do projeto (.claude/rules/, CLAUDE.md)     → INVIOLÁVEL
2. Tech Alignment do usuário                          → RESPEITAR (prioridade alta)
3. Descoberta autônoma do codebase                    → COMPLEMENTAR
4. Proposta do arquiteto (você)                       → QUANDO NÃO HÁ CONFLITO
```

### Como usar o tech-alignment.md

1. **RESPEITAR** — o tech_alignment tem prioridade sobre suas propostas. Se o usuário definiu "usar JWT", não proponha sessions como alternativa.
2. **VALIDAR** — após pesquisar o codebase, verifique se o alinhamento é viável. Se houver conflito com regras do projeto ou arquitetura existente, **levante o conflito e pergunte ao usuário**.
3. **NÃO SUBSTITUIR pesquisa** — o tech_alignment não elimina a pesquisa obrigatória. Você ainda DEVE explorar o codebase para complementar e detalhar as decisões.
4. **COMPLEMENTAR** — use como ponto de partida e enriqueça com detalhes técnicos descobertos.
5. **REGISTRAR** — inclua as decisões do tech_alignment na seção 2 do Tech Spec (Resumo Técnico) para rastreabilidade.

### Exemplo de Conflito

> "O tech_alignment define SQLite para cache. Porém, identifiquei que o projeto já utiliza Redis para caching no módulo X. Deseja manter SQLite para este caso específico ou prefere seguir o padrão existente com Redis?"

> O `tech-alignment.md` é gerado/atualizado pela skill **`agent-spec-generate-tech-alignment`** (user-invocable, genérica para SDD e miniSpec). Se ele não existir e o usuário quiser registrar alinhamento técnico, **oriente-o** a rodar `/agent-spec-generate-tech-alignment <prd.md> "<descrição técnica>"` — esta skill (agent-spec-sdd-generate-tech-spec) **não invoca** outras skills.

---

## FASE 3 — Coleta de Decisões (UMA PERGUNTA POR VEZ)

### Objetivo

Coletar as decisões técnicas necessárias para preencher o Tech Spec. Cada pergunta alimenta uma seção do template. **Não peça aprovação entre seções.** Após coletar todas as decisões, gere o documento completo, salve e apresente para validação final.

### Regras do Processo

- Faça **apenas UMA pergunta por vez** — aguarde a resposta antes de avançar.
- Perguntas são para **coletar decisões**, não para pedir aprovação de seções.
- Se o usuário já forneceu informação suficiente sobre um tópico, **pule a pergunta e avance**.
- Se algo não ficou claro, **PERGUNTE** — nunca deduza.
- Oferecer **2-4 opções técnicas** quando houver diferentes caminhos possíveis.
- Se o usuário fornecer informações extras, reutilize para seções futuras.
- **NÃO peça "concorda?" ou "valida?" entre perguntas** — use a resposta e siga adiante.
- Use a ferramenta **`AskUserQuestion`** (Claude Code) para coletar decisões.

### Sequência de Perguntas

> A detecção da variante já foi feita em **FASE 0** (no início da skill). Confirme apenas que o valor escolhido está disponível em memória para usar nas FASEs 3.2, 4, 5 e 7.

#### 3.1 Leitura do PRD e Tech Alignment
Leia o PRD aprovado e pesquise o codebase. Resolva o path do tech_alignment e verifique se existe.

**Se existe `tech-alignment.md`**:
> "Li o PRD aprovado. Entendi que o objetivo é [resumo]. Encontrei o tech-alignment.md com os seguintes pontos: [lista dos pontos]. Vou considerar essas decisões como ponto de partida. Algum ponto que eu deva ajustar antes de seguir?"

**Se NÃO existe `tech-alignment.md`**:
> "Li o PRD aprovado. Entendi que o objetivo é [resumo]. Não encontrei tech-alignment.md — vou iniciar as perguntas técnicas."

**Se há conflito entre tech_alignment e codebase**, levante antes de prosseguir:
> "O tech_alignment define [X], porém o projeto atualmente usa [Y] para [motivo]. Qual abordagem seguir?"

#### 3.2 Perguntas técnicas condicionais à variante

> Aplique o set abaixo correspondente à variante escolhida em FASE 0. Mantenha a regra **uma pergunta por vez**, ofereça 2-4 opções quando aplicável, e **pule** qualquer pergunta cuja decisão já esteja resolvida no `tech-alignment.md` ou no `design.md` (ex.: se o design.md já fixa padrão a11y visual e componentes, não re-pergunte o que ele responde — pergunte apenas o complemento técnico).

##### 3.2.A Variante **Web**

1. **Stack frontend**: "Qual stack adotar? React | Vue | Svelte | Angular | Outro. Render: SSR (Next/Nuxt/SvelteKit) ou CSR puro?"
2. **Gestão de estado**: "Solução: Redux Toolkit | Zustand | Context API | Signals | Jotai | Recoil — qual usar e por quê?"
3. **APIs consumidas**: "Quais endpoints serão consumidos? Há contrato OpenAPI/proto disponível? Cliente HTTP: fetch | Axios | TanStack Query | SWR?"
4. **i18n**: "Há requisitos de internacionalização? Idiomas alvo? Solução: i18next | lingui | react-intl | formatjs?"
5. **a11y**: "Padrão de acessibilidade alvo: WCAG 2.1 AA ou AAA? Ferramentas de auditoria (axe-core, Lighthouse)?"
6. **Feature flags**: "Solução: LaunchDarkly | Unleash | GrowthBook | custom? Avaliação build-time ou runtime?"

##### 3.2.B Variante **Mobile**

1. **Stack mobile**: "Plataforma: iOS | Android | iOS+Android. Stack: Flutter | React Native | Nativo iOS (Swift) | Nativo Android (Kotlin) | KMP. Arquitetura: Clean | MVVM | BLoC?"
2. **Gestão de estado**: "Solução: BLoC | Riverpod | Provider | GetX | Redux | MobX — qual usar e por quê?"
3. **Integração com hardware**: "Há integração com hardware? (câmera | bluetooth | impressora | GPS | biometria | NFC). Plugins/SDKs?"
4. **Sincronização offline-first**: "Estratégia: pull on-demand | periódica | push do servidor. Banco local: SQLite/Drift | Realm | Isar | Hive. Resolução de conflitos?"
5. **APIs consumidas**: "Quais endpoints? Cliente HTTP: Dio | Retrofit | URLSession | OkHttp? Interceptadores (auth, logging, retry)?"
6. **i18n / a11y / feature flags** (consolidada): "Idiomas suportados? Padrão a11y (VoiceOver/TalkBack)? Solução de feature flag (Firebase Remote Config / LaunchDarkly / outro)?"

##### 3.2.C Variante **Backend**

1. **Stack backend**: "Linguagem/Framework: Go | Node | Python | Java | .NET | Rust | Outro. Estilo arquitetural: Clean | Hexagonal | Layered | DDD?"
2. **Persistência**: "Banco: relacional (Postgres/MySQL) | documento (Mongo) | KV (Redis) | outro? Tabelas/coleções principais. Estratégia de transação (ACID, isolation level, lock)?"
3. **Contratos de API + versionamento**: "Tipo: REST | gRPC | GraphQL. Schema: OpenAPI | proto | jsonschema. Estratégia de versionamento (URL path | header | content-type)?"
4. **Integrações externas e mensageria**: "Há clientes externos / webhooks / filas (Kafka, SQS, RabbitMQ)? Direção (consumir/expor/ambos)? Garantia de entrega?"
5. **Logs e observabilidade**: "Padrão de logs (structured JSON, biblioteca)? Métricas (Prometheus, OTel, Datadog)? Tracing? Alertas críticos?"
6. **Deploy e infraestrutura**: "Pipeline (CI/CD), empacotamento (container, runtime), IaC (Terraform/Pulumi/Helm), estratégia de rollout (blue-green/canary/rolling), escalabilidade?"

---

## FASE 4 — Estratégia de Testes (delegada ao agent-spec-qa-test-generator)

A seção de **Estratégia de Testes** (numeração varia por variante: **17 Web | 18 Mobile | 19 Backend**) NÃO é preenchida pelo arquiteto diretamente. Você DEVE delegar a geração ao subagente **`agent-spec-qa-test-generator`** e converter o JSON retornado em markdown estruturado.

> **Procedimento completo de delegação, mapeamento JSON→Markdown, regras de deduplicação de CTs e validação**: consulte [qa-delegation.md](references/qa-delegation.md).

Resumo do fluxo (detalhes em `references/qa-delegation.md`):

1. Após preencher as seções anteriores à de Testes, prepare a lista de arquivos relevantes e as instruções para o subagente.
2. **Inclua o parâmetro `frente: <web|mobile|backend>`** (decidido em FASE 0) no prompt enviado ao subagente — esse parâmetro orienta a escolha de stacks de teste (Playwright/Cypress p/ Web, Patrol/Detox/Appium p/ Mobile, Go test/pytest/etc. p/ Backend).
3. Lance o subagente `agent-spec-qa-test-generator` via ferramenta `Agent`.
4. Converta o JSON retornado em markdown (subseções de testes unitários, integração, E2E, cenários de erro + tabela de rastreabilidade CA→CT).
5. Valide coerência com as seções anteriores e cobertura de TODOS os CA-XX do PRD.
6. Aplique a regra de deduplicação de CTs (cada CT em no máximo 1 task).

**NÃO peça aprovação isolada da seção de testes** — apresente o Tech Spec completo para validação final na FASE 6.

---

## FASE 4A — Inventário de ADRs Aplicáveis (OBRIGATÓRIO se ADRs existem no projeto)

Antes de finalizar o Tech Spec, você DEVE produzir um **inventário declarativo de ADRs aplicáveis** que será inserido na seção de **Observações / Notas Técnicas** com o título "ADRs Aplicáveis nesta Feature".

Procedimento:

1. Liste todas as ADRs no índice resolvido via `adr.index_file` com status `accepted` (ignore `deprecated`/`superseded-by:*` — status em minúsculas, como as skills ADR gravam).
2. Para cada ADR:
   - Leia título + decisão (1-2 linhas) para a classificação inicial.
   - Marque uma de 3 classificações:
     - **APLICÁVEL** — o tech_spec toca código que precisa obedecer essa ADR (cite a seção do tech_spec afetada).
     - **PARCIAL** — só parte do tech_spec toca a regra (cite qual seção).
     - **N/A** — o tech_spec não toca a área coberta pela ADR.
3. **Conformidade LITERAL (obrigatória para cada ADR `APLICÁVEL`/`PARCIAL`)** — não basta declarar que "obedece". Para cada ADR aplicável que **restringe um artefato concreto** (path/diretório canônico, biblioteca/lib, padrão estrutural, identificador, naming), **abra a seção `Decision` integral da ADR** (`adr.dir` + `adr.file_pattern`) e **confronte literalmente** cada decisão concreta do tech_spec contra o texto da ADR:
   - Bate exatamente (mesmo path, mesma lib, mesmo padrão) → adicione um **sub-bullet na seção de Definições Técnicas correspondente** citando o trecho da ADR que a decisão satisfaz. Exemplo: "ADR-0010 — tags `form:`/`json:` em §3.3 usam identificadores em inglês conforme a `Decision` da ADR."
   - **Diverge** (ex.: ADR manda `pkg/logger` e a spec propõe `internal/platform/logger`; ou ADR manda lib X e a spec usa Y) → isto é um **CONFLITO spec×ADR**. **PARE** e resolva via `AskUserQuestion` antes de finalizar o tech_spec, apresentando o trecho literal da ADR vs a decisão da spec e duas saídas: **(a) conformar o tech_spec à ADR**; **(b) superseder/atualizar a ADR primeiro** (`/agent-spec-adr-supersede` ou `/agent-spec-adr-create`) — só então a spec pode divergir, agora legitimamente. **NUNCA** escolha um lado em silêncio nem registre o conflito apenas como observação.
   - **PROIBIDO** citar uma ADR como "APLICÁVEL — obedecida" afirmando um path/símbolo que a ADR **não contém** (foi exatamente a falha do caso `arquitetura-projeto`: a spec citou ADR-0003 alegando `internal/platform/logger`, path que a ADR — que dizia `pkg/logger` — nunca teve). A citação de conformidade deve referenciar o texto real da `Decision`.
4. **Consistência ADR×ADR**: se duas ADRs aplicáveis se contradizem nas decisões concretas (ex.: uma estrutura implica `internal/platform/`, outra fixa `pkg/`), trate como conflito a ser sinalizado ao usuário (mesma mecânica de PARE acima) — não escolha qual prevalece sozinho.

> **Por que obrigatório e literal**: o post-mortem `cadastro-pratos-franquia` mostrou que ADR-0010 (idioma de identificadores) só foi detectada no Tech Review de T7, cascateando correções para T5/T6. E o caso `arquitetura-projeto` mostrou o oposto e mais grave: a tech_spec citou ADR-0003 como "obedecida" enquanto contradizia o path que ela mandava — conflito silencioso que só virou débito médio na execução e foi "resolvido" retro-editando a ADR. Inventário declarativo NÃO basta; a conformidade tem de ser confrontada contra o texto real da ADR, e todo conflito tem de subir ao usuário ANTES de gerar tasks.

Quando o diretório de ADRs (via `adr.dir`) não existe ou está vazio: marque o passo como `Sem ADRs ativas no projeto` e siga para a FASE 4B.

> A FASE 4B (detecção de **novos** candidatos a ADR) é complementar — esta FASE 4A trata de ADRs **já existentes**; a 4B trata de decisões inéditas no tech_spec atual.

---

## FASE 4B — Detecção de Candidatos a ADR (Hook)

A skill `agent-spec-sdd-generate-tech-spec` é um **hook** de detecção de ADRs. Após decidir as definições técnicas (componentes, modelos, endpoints, banco), aplique os **5 critérios canônicos** definidos em `.claude/rules/agent-spec-adr-workflow-rules.md` (seção "ADR — Critérios Canônicos de Criação"):

1. Para cada decisão técnica candidata, valide os 5 critérios (TODOS devem ser verdadeiros):
   - **C1 — Transversal**: aplicável a outras features ou ao projeto.
   - **C2 — Tag-alvo**: cai em uma das 14 tags canônicas (`architecture`, `state-management`, `auth`, `security`, `data`, `http`, `validation`, `testing`, `build`, `observability`, `performance`, `ui`, `error-handling`, `cross-cutting`).
   - **C3 — Custo de reversão alto**: reverter implica refactor significativo (≥ médio).
   - **C4 — Surpreendente sem contexto**: leitor futuro se perguntaria "por que assim?" sem o registro.
   - **C5 — Trade-off real**: havia ao menos UMA alternativa genuína rejeitada por razão específica.

2. Classifique cada candidato conforme quantos critérios passam:
   - **5/5 passam** → registre na seção de **Observações / Notas Técnicas** do Tech Spec como **"Candidato a ADR confirmado"** + tag aplicável + 1 frase justificando cada critério.
   - **2-4/5 passam** → registre como **"Candidato a ADR parcial"** + lista dos critérios que falharam.
   - **0-1/5 passam** → registre apenas como decisão técnica nas seções apropriadas — **não** mencione candidatura a ADR.

3. **NÃO** crie a ADR automaticamente — apenas sinalize. O usuário invocará `/agent-spec-adr-create` se desejar (a skill revalida os 5 critérios).

> **Por que aqui**: as decisões técnicas do Tech Spec são o material primário de onde nascem ADRs (escolhas de banco, padrão arquitetural, integração entre módulos, política de segurança). Pular esta detecção significa perder o momento em que a decisão ainda está fresca e o "porquê" é óbvio para quem a tomou.

---

## FASE 5 — Salvar Arquivo (OBRIGATÓRIO antes de apresentar)

**ANTES** de apresentar o Tech Spec ao usuário, você DEVE:

1. Resolver o path final substituindo `{feature}` e `{version}` em `sdd.tech_spec.path` (agent-spec-sdd-workflow-rules.md). **NUNCA** reutilize o diretório do `prd.md` como base — `sdd.prd.path` e `sdd.tech_spec.path` podem apontar para bases diferentes.
2. Criar o diretório pai do path resolvido (se não existir).
3. **Remover todos os comentários `<!-- LLM-ONLY: ... -->`** do conteúdo antes de salvar — são instruções internas do template e **NÃO** devem aparecer no arquivo gerado.
4. **Salvar o arquivo físico** no path resolvido — o nome do arquivo é **literalmente `tech_spec.md`** (snake_case, exatamente esses 12 caracteres). **NÃO derive** o nome de siglas, conceitos ou variações: não use `TechSpec.md`, `TECH_SPEC.md`, `spec_tech.md`, `SpecTech.md` nem qualquer outra forma. O único source-of-truth é o valor literal em `sdd.tech_spec.path`.
5. Confirmar que o arquivo foi criado com sucesso e que o nome bate exatamente com `tech_spec.md`.

### Template (selecionado pela variante)

Carregue o template oficial conforme a variante decidida em **FASE 0**:

| Variante | Template |
|----------|----------|
| `web` | [tech_spec_template_web.md](assets/tech_spec_template_web.md) (21 seções) |
| `mobile` | [tech_spec_template_mobile.md](assets/tech_spec_template_mobile.md) (22 seções) |
| `backend` | [tech_spec_template_backend.md](assets/tech_spec_template_backend.md) (23 seções) |

Todas as seções do template selecionado devem ser preenchidas. Se uma seção não se aplica, indique explicitamente "N/A — [justificativa]".

Conteúdo obrigatório (numeração varia por variante — siga a numeração do template carregado):
- **Mapeamento User Stories → Definições Técnicas** (seção 15 Web, 16 Mobile, 5.3+17 Backend) — rastreabilidade PRD→SPEC.
- **Estratégia de Testes** (seção 17 Web, 18 Mobile, 19 Backend) — preenchida via delegação ao `agent-spec-qa-test-generator` (FASE 4).
- **Arquivos Envolvidos** (seções 3.4-3.7, aninhadas em Arquitetura da Solução, nas três variantes) — Visão em Árvore (3.4) + TODOS os arquivos envolvidos (3.5 criar, 3.6 modificar, 3.7 referência) — posicionada logo após a arquitetura para servir de mapa de impacto; economiza tokens e scans nas etapas seguintes.
- **Checklist Final** (última seção em cada template).
- **Campo `Variante`** na seção 1 (Identificação) — preencha com `web`, `mobile` ou `backend` conforme escolhido em FASE 0.
- **Campo `Design Relacionado`** na seção 1 (templates web/mobile) — path do `design.md` se existir (FASE 1.1.5), ou `—` se a feature não tem design. Quando existir, as seções 4–5 referenciam o design.md conforme as instruções `<!-- LLM-ONLY -->` do template.

---

## FASE 6 — Saída Esperada (após salvar)

Apresente um **resumo compacto** do Tech Spec. **NÃO** exiba o Tech Spec completo no terminal — o usuário lerá o arquivo diretamente.

```
Arquivo salvo em: <path resolvido>

## Resumo do Tech Spec
- **Feature:** <nome>
- **Variante:** web | mobile | backend
- **Componentes novos:** <lista curta>
- **Endpoints/RPCs (se backend):** <quantidade>
- **Tabelas de banco (se backend):** <lista>
- **Telas/Páginas (se web/mobile):** <lista>
- **Casos de teste:** <total> (Unit: X | Integ: Y | E2E: Z)
- **Arquivos a criar:** <quantidade>
- **Arquivos a modificar:** <quantidade>

Essa especificação técnica está aprovada? (sim/não)
```

**IMPORTANTE:**
- **NÃO** exiba o Tech Spec completo — apenas o resumo.
- **NÃO** inicie automaticamente a próxima etapa (TASK PLAN).
- **NÃO** sugira executar o próximo comando do framework.
- Após confirmação do usuário, execute a **FASE 7 (Estado do Pipeline)** e encerre.

---

## FASE 7 — Estado do Pipeline (_run/sdd_state.yaml)

Após salvar o `tech_spec.md` com sucesso, atualize o arquivo no path resolvido a partir de `sdd.state.path`:

```yaml
# atualizar apenas estes campos:
current_step: tech_spec
variant: <web|mobile|backend>            # NOVO no nível raiz — frente decidida em FASE 0
steps:
  tech_spec:
    status: completed
    variant: <web|mobile|backend>        # NOVO redundante para auditoria
    summary: "<componentes novos>, <N RPCs/endpoints>, tabelas: <lista tabelas>"
```

Se o usuário pulou o `tech_alignment`, marque-o como `skipped`:

```yaml
steps:
  tech_alignment:
    status: skipped
```

Para o passo opcional de design (só variantes web/mobile): se o `design.md` existia e foi usado, garanta `steps.design.status: completed`; se não existia, marque `skipped`. Em variante `backend`, **não** registre o passo `design` (não se aplica):

```yaml
steps:
  design:
    status: completed | skipped   # omitir em variante backend
```

> Se o `_run/sdd_state.yaml` NÃO existir, **não crie** — o `agent-spec-sdd-generate-prd` é responsável por criar.
> Se o `_run/sdd_state.yaml` existir mas **não tiver** o campo `variant` no nível raiz (state legado), adicione ao atualizar.

---

## Guardrails Invioláveis

### DEVE

1. Fazer **UMA pergunta por vez** — nunca bombardeie o usuário.
2. **Usar respostas para alimentar o SPEC** — cada resposta preenche a seção correspondente e avança sem pedir aprovação.
3. **Pesquisar o projeto** antes de propor qualquer solução (regras, camadas, código existente).
4. **SEMPRE salvar o arquivo físico** ANTES de apresentar ao usuário.
5. **Decidir a variante** (web/mobile/backend) em FASE 0 e preencher **integralmente** o template correspondente — todas as seções da variante escolhida.
6. Usar **`AskUserQuestion`** no Claude Code para coletar decisões técnicas.
7. **Mapear TODAS as User Stories** do PRD para definições técnicas na seção correspondente do template (15 Web, 16 Mobile, 5.3+17 Backend).
8. **Listar TODOS os arquivos** envolvidos na seção correspondente (20 Web, 21 Mobile, 22 Backend).
9. **Delegar a Estratégia de Testes ao `agent-spec-qa-test-generator`** seguindo [qa-delegation.md](references/qa-delegation.md). Numeração da seção varia por variante (17 Web | 18 Mobile | 19 Backend) e o parâmetro `frente` deve ser passado no prompt.
10. **Verificar tech-alignment.md** — se existir, usar como ponto de partida, validar contra codebase, levantar conflitos.
11. **Verificar design.md (web/mobile)** — se existir, tratá-lo como fonte de verdade do COMO VISUAL: seções 4–5 referenciam (resumo + ponteiro), nunca redefinem; conflitos com o codebase são levantados, não resolvidos silenciosamente.
12. **Validação única no final** — salvar o arquivo e apresentar o Tech Spec completo (resumo) para o usuário validar de uma vez.

### NÃO DEVE

1. **NUNCA** peça aprovação ou "concorda?" entre perguntas — perguntas são para coletar decisões, não para validar seções.
2. **NUNCA** invente informações ou deduza escopo — na DÚVIDA, **PERGUNTE**.
3. **NUNCA** repita conteúdo do PRD — apenas traduza em engenharia.
4. **NUNCA** inicie automaticamente a próxima etapa (TASK PLAN).
5. **NUNCA** sugira executar o próximo comando do framework.
6. **NUNCA** proponha soluções que conflitem com a arquitetura existente do projeto.
7. **NUNCA** misture requisitos de produto (O QUE) com solução técnica (COMO).
8. **NUNCA** escreva textos genéricos ou vagos — seja específico e técnico.
9. **NUNCA** pule seções do template.
10. **NUNCA** ignore o `tech-alignment.md` quando existir — se houver conflito com o codebase, pergunte em vez de descartar.
11. **NUNCA** preencha a Estratégia de Testes manualmente — sempre delegue ao `agent-spec-qa-test-generator` (numeração varia por variante: 17 Web | 18 Mobile | 19 Backend).

---

## Checklist Final (validar antes de salvar)

- [ ] **Variante decidida (web/mobile/backend) em FASE 0 e registrada no campo `Variante` da seção 1 do Tech Spec**
- [ ] **Template correto carregado para a variante** (web/mobile/backend)
- [ ] **`variant` gravado em `_run/sdd_state.yaml`** (raiz e em `steps.tech_spec`)
- [ ] **Frente passada ao `agent-spec-qa-test-generator`** na delegação (FASE 4 / `qa-delegation.md`)
- [ ] **Design verificado (web/mobile)**: `design.md` existente → seções 4–5 referenciam + campo `Design Relacionado` preenchido + `steps.design: completed`; inexistente → seções 4–5 preenchidas integralmente + `steps.design: skipped`
- [ ] Tech Spec cobre todo o PRD (todas as US-XX mapeadas)
- [ ] Resumo técnico claro e objetivo
- [ ] Arquitetura definida com componentes e interações
- [ ] Seções específicas da variante preenchidas:
  - Web: gestão de estado, integração com APIs, i18n, a11y, feature flags
  - Mobile: integração com hardware, sincronização offline-first, plataformas alvo
  - Backend: contratos de API, persistência, logs/observabilidade, versionamento, deploy
- [ ] Dependências técnicas listadas
- [ ] Critérios técnicos de aceite definidos
- [ ] Riscos técnicos identificados com mitigações
- [ ] Estratégia de testes via `agent-spec-qa-test-generator` integrada e validada (com rastreabilidade CA→CT)
- [ ] Arquivos envolvidos listados — criar, modificar, referência
- [ ] Cada CT aparece em **no máximo 1** task na rastreabilidade (regra de deduplicação)
- [ ] Comentários `<!-- LLM-ONLY: ... -->` removidos do arquivo final
- [ ] Pronto para geração do TASK PLAN

---

## Entrada

$ARGUMENTS
