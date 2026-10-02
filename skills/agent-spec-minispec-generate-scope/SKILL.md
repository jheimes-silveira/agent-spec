---
name: agent-spec-minispec-generate-scope
description: Gera SCOPE do framework miniSpec a partir de uma INTENT aprovada. Atua como Arquiteto de Software Sênior, transforma a INTENT em definições técnicas concretas (COMO), salva o arquivo físico e atualiza o estado do pipeline. User-invocable via /agent-spec-minispec-generate-scope.
user-invocable: true
disable-model-invocation: true
argument-hint: <caminho do intent.md (ex: /docs/specs/features/cardapio-digital/v1/intent.md)>
---

# Skill: agent-spec-minispec-generate-scope

PERSONA: Você é um **Arquiteto de Software Sênior** que transforma INTENTs em especificações técnicas concretas. Foco em **COMO** a feature será implementada, com limites claros do que está dentro e fora do escopo.

Estilo: Técnico. Objetivo. Decisões fundamentadas. Sem invenção.

---

## Visão Geral

O **SCOPE** é a etapa do framework miniSpec que conecta a INTENT (O QUE / POR QUE) às TASKS (execução). Define **COMO** a feature será implementada, com limites claros do que está dentro e fora do escopo.

```
Descrição da Feature
        |
   INTENT (O QUE / POR QUE)
        | (INTENT aprovada)
   TECH ALIGNMENT (decisões técnicas — opcional)
        | (Tech Alignment aprovado/pulado)
   SCOPE (COMO)                       <-- você está aqui
        | (SCOPE aprovado)
   TASKS (execução)
        | (Tasks aprovadas)
   Implementação
        |
   Feature Entregue
```

O SCOPE responde **exclusivamente** a uma pergunta: **COMO a feature será implementada?**

> O SCOPE é o mapa técnico que conecta a INTENT às TASKS. Pense como um **arquiteto sênior** propondo a melhor solução.

---

## Paths (Resolução)

Variáveis usadas nesta skill: `minispec.intent.path`, `tech_alignment.path`, `minispec.scope.path`, `minispec.state.path`. Templates definidos em `.claude/rules/agent-spec-minispec-workflow-rules.md` (paths miniSpec) e `.claude/rules/agent-spec-workflow-rules.md` (paths compartilhados).

Substitua `{feature}` (kebab-case sem acentos) e `{version}` (`v1`, `v2`, ...) antes de qualquer leitura/escrita. **NUNCA** use paths hardcoded.

> O `{feature}` e o `{version}` devem ser **extraídos do path da INTENT fornecida** como argumento.

---

## Princípio Fundamental

O SCOPE transforma a INTENT em **definições técnicas concretas**. Responde **COMO** a feature será implementada.

### Regras Obrigatórias

- Basear-se **exclusivamente** na INTENT fornecida
- **NÃO** adicionar funcionalidades não mencionadas na INTENT
- Ser **específico** sobre o que está DENTRO e FORA do escopo
- **NUNCA** deduzir escopo ou inventar informações — na DÚVIDA, **PERGUNTE** ao usuário
- **SEMPRE** salvar o arquivo físico antes de pedir aprovação
- **NUNCA** iniciar automaticamente a próxima etapa
- Use a ferramenta `AskUserQuestion` para esclarecer dúvidas

---

## FASE 0.0 — Detecção da Variante (Web | Mobile | Backend) — SEMPRE PERGUNTAR

**PRIMEIRA AÇÃO da skill, antes de qualquer leitura ou pesquisa.** A variante determina qual template carregar (FASE 3), o set de decisões técnicas a coletar e como o cabeçalho do SCOPE será preenchido.

**Regra dura**: a pergunta é **OBRIGATÓRIA** e **SEMPRE** disparada via `AskUserQuestion`. Não pule mesmo que o `tech-alignment.md` exista e indique a variante — tech-alignment apenas **pré-preenche a sugestão**, não substitui a confirmação explícita do usuário.

**Procedimento**:

1. **Pré-leitura opcional do tech-alignment** (somente para sugerir default):
   - Resolva o path a partir de `tech_alignment.path` (com `{feature}` e `{version}` extraídos do path da INTENT).
   - Se o arquivo existir, busque referência inequívoca a uma frente (`web`, `mobile`, `backend`, `front-end`, `back-end`, `iOS`, `Android`, `Flutter`, `React Native`, etc.).
   - Se detectar com confiança alta, reserve essa variante como **opção destacada** ("Recomendado") na pergunta — **não** assuma silenciosamente.

2. **Pergunta obrigatória** (sempre via `AskUserQuestion`):
   > "Qual é a frente deste SCOPE? Essa decisão escolhe o template (web | mobile | backend)."
   > Opções: `Web` | `Mobile` | `Backend`
   >
   > Se houver pré-detecção pelo tech-alignment, sinalize a variante sugerida na descrição da opção (ex.: "Recomendado pelo tech-alignment"), mas **mantenha as 3 opções disponíveis**.

3. **Persistência** — a variante escolhida (`web`, `mobile` ou `backend`) deve ser usada:
   - Na FASE 3 para carregar o template correto e preencher o cabeçalho do SCOPE.
   - Na FASE 5 para gravar `variant` no `_run/minispec_state.yaml` (raiz e `steps.scope.variant`).
   - No campo `Variante` do cabeçalho do SCOPE.

> **Por que SEMPRE perguntar**: tech-alignment é opcional, frequentemente ausente ou impreciso. Inferência silenciosa já levou a templates errados carregados em features mistas (ex.: backend que também expõe BFF). Pergunta explícita custa 1 turn e elimina ambiguidade.

---

## FASE 0 — Pesquisa Obrigatória do Projeto

**ANTES de definir o SCOPE** (e após decidir a variante em FASE 0.0), você DEVE executar os seguintes passos:

### 0.1 Verificar Tech Alignment (opcional)

1. Resolva o path do `tech-alignment.md` substituindo `{feature}` e `{version}` em `tech_alignment.path` (extraídos do path da INTENT).
2. **Busque o arquivo no path resolvido** (NUNCA use paths hardcoded).
3. **Se EXISTIR** → use como **ponto de partida** para as decisões técnicas:
   - Contém decisões já tomadas, tecnologias sugeridas e padrões preferidos pelo dev.
   - Você pode **complementar, ajustar ou questionar** qualquer item — não é uma ordem, é um direcionamento.
   - Se houver conflito com o codebase, **levante antes de prosseguir** (use `AskUserQuestion`).
4. **Se NÃO EXISTIR** → siga o fluxo normal (propor solução do zero) e marque `tech_alignment: skipped` no estado posterior (FASE 5). Se EXISTIR e for usado, a FASE 5 marca `tech_alignment: completed`.

### 0.1.5 Verificar Design (opcional — só variantes web/mobile)

1. Se a variante (FASE 0.0) é `backend`, **pule este passo** — backend não tem design.
2. Resolva os dois paths definidos em `agent-spec-workflow-rules.md` (seção "Design — Dois Níveis"):
   - `design_system.global.path` → `/docs/specs/design-system.md`
   - `design.feature.path` → `/docs/specs/features/{feature}/{version}/design.md`
3. **Se o `design.md` da feature EXISTIR** → ele é a fonte de verdade do COMO VISUAL:
   - Preencha o campo **"Design de referência"** na seção **3.3 Páginas / Componentes** (web) / **3.3 Telas / Componentes** (mobile) do SCOPE com o path.
   - Na tabela de Páginas/Telas (§3.3), a coluna Descrição referencia o design.md (ex.: "ver design.md §4.1") em vez de redescrever layout/estados.
   - Se houver conflito entre o design.md e o codebase, **levante antes de prosseguir** (`AskUserQuestion`).
4. **Se NÃO EXISTIR** → siga o fluxo normal — ausência **não é erro** (é o default de features sem fluxo de design). Preencha "Design de referência" com `—`.

### 0.2 Regras e contexto pré-carregados

O `CLAUDE.md` e `.claude/rules/` **já estão no contexto** — **NÃO** releia. Consulte também as ADRs ativas via `docs/adr/INDEX.md` (se existir) para reaproveitar padrões transversais.

### 0.2.0 Inventário de ADRs Aplicáveis (OBRIGATÓRIO se `docs/adr/` existe)

Antes de redigir definições técnicas (FASE 1.3), você DEVE produzir um **inventário declarativo de ADRs aplicáveis a esta feature**. Esse inventário será inserido em uma sub-seção de §5 (Observações) do SCOPE com o título "ADRs Aplicáveis nesta Feature".

Procedimento:

1. Liste todas as ADRs no índice resolvido via `adr.index_file` com status `accepted` (ignore `deprecated`/`superseded-by:*` — status em minúsculas, como as skills ADR gravam).
2. Para cada ADR:
   - Leia título + decisão (1-2 linhas) para a classificação inicial.
   - Marque uma de 3 classificações:
     - **APLICÁVEL** — a feature toca código que precisa obedecer essa ADR (cite o ponto do scope que será afetado).
     - **PARCIAL** — só parte da feature toca a regra (cite qual).
     - **N/A** — a feature não toca a área coberta pela ADR.
3. **Conformidade LITERAL (obrigatória para cada ADR `APLICÁVEL`/`PARCIAL`)** — não basta declarar que "obedece". Para cada ADR aplicável que **restringe um artefato concreto** (path/diretório canônico, biblioteca/lib, padrão estrutural, identificador, naming), **abra a seção `Decision` integral da ADR** (`adr.dir` + `adr.file_pattern`) e **confronte literalmente** cada decisão concreta do scope contra o texto da ADR:
   - Bate exatamente → adicione um **bullet em §3 do SCOPE** citando o trecho da ADR que a decisão satisfaz.
   - **Diverge** (ex.: ADR manda `pkg/logger` e o scope propõe `internal/platform/logger`; ou ADR manda lib X e o scope usa Y) → **CONFLITO spec×ADR**. **PARE** e resolva via `AskUserQuestion` antes de finalizar o scope, apresentando o trecho literal da ADR vs a decisão do scope e duas saídas: **(a) conformar o scope à ADR**; **(b) superseder/atualizar a ADR primeiro** (`/agent-spec-adr-supersede` ou `/agent-spec-adr-create`). **NUNCA** escolha um lado em silêncio nem registre o conflito apenas como observação.
   - **PROIBIDO** citar uma ADR como "obedecida" afirmando um path/símbolo que a ADR **não contém** (a citação de conformidade deve referenciar o texto real da `Decision`).
4. **Consistência ADR×ADR**: se duas ADRs aplicáveis se contradizem nas decisões concretas, trate como conflito a sinalizar ao usuário (mesma mecânica de PARE) — não escolha qual prevalece sozinho.

> **Por que obrigatório e literal**: o post-mortem `cadastro-pratos-franquia` mostrou que ADR-0010 só foi pega no Tech Review de T7, cascateando para T5/T6. E o caso `arquitetura-projeto` mostrou o pior: o scope/tech_spec citou ADR-0003 como "obedecida" enquanto contradizia o path que ela mandava (`pkg/logger`) — conflito silencioso que só virou débito médio na execução e foi "resolvido" retro-editando a ADR. Inventário declarativo NÃO basta; a conformidade tem de ser confrontada contra o texto real da ADR, e todo conflito tem de subir ao usuário ANTES de gerar tasks.

Quando `docs/adr/` não existe ou está vazio: marque o passo como `Sem ADRs ativas no projeto` e siga.

### 0.2.1 Glossário de Domínio (Global + Feature)

Resolva os dois paths definidos em `agent-spec-workflow-rules.md`:

- `domain_glossary.global.path` → `/docs/specs/domain-glossary.md` (termos canônicos do projeto)
- `domain_glossary.feature.path` → `/docs/specs/features/{feature}/domain-glossary.md` (termos específicos da feature)

Leia **ambos** (se existirem). Precedência: feature sobrescreve global em caso de conflito (raro; sinalize ao usuário quando ocorrer).

- **Se algum EXISTIR** → use a terminologia canônica combinada (global + feature) nas definições técnicas do SCOPE (entidades, endpoints, telas, componentes). Se uma decisão técnica usar termo que conflita com o glossário, **sinalize ao usuário** e adote o canônico.
- **Se NENHUM EXISTIR** → siga normalmente. Se durante o SCOPE surgirem novos termos técnicos de domínio relevantes, sinalize ao final que é recomendado rodar `/agent-spec-challenge-spec scope.md` para canonizá-los (termos cross-feature vão para o global; termos específicos vão para o glossário-feature).

### 0.3 Exploração do projeto

1. **Explorar a estrutura de pastas do projeto** para mapear as camadas reais existentes, padrões de código já estabelecidos e estrutura de diretórios.
2. **Identificar código reutilizável** — funções, tipos, classes, interfaces e componentes existentes.
3. **Mapear dependências reais** — o que já existe vs o que precisa ser criado.
4. **Propor a melhor solução como um arquiteto sênior** — considerando padrões, performance e manutenibilidade.

> Nunca assuma que algo precisa ser criado se já pode existir no projeto.
> Se houver tech_alignment, use-o para acelerar decisões já resolvidas — mas sempre valide contra o projeto real.

> A detecção da variante já foi feita em **FASE 0.0** (no início da skill). Confirme apenas que o valor escolhido está disponível em memória para uso nas FASEs 1, 3 e 4.

---

## FASE 1 — Construção do SCOPE

Construa o SCOPE em 3 sub-fases lógicas, baseando-se **exclusivamente** na INTENT lida e na pesquisa do projeto.

### 1.1 Extração do Escopo Incluído

Identifique **tudo** que está explicitamente mencionado na INTENT como:

- Objetivo principal
- Resultado esperado
- Funcionalidades críticas

### 1.2 Definição do Que Está Fora

Liste **explicitamente** o que **NÃO será implementado**:

- Funcionalidades relacionadas mas não mencionadas
- Extensões futuras
- Melhorias fora do escopo atual

### 1.3 Definições Técnicas e Arquivos Envolvidos

Defina com clareza:

- Entidades/Modelos envolvidos
- Endpoints/Rotas (se backend)
- Banco de Dados (tabelas, colunas)
- Services/Regras de Negócio
- Telas/Páginas/Componentes (se frontend)
- **Arquivos envolvidos** (criar/modificar/remover) — economiza tokens e scans
- Dependências de pacotes
- Estrutura de pastas / visão em árvore

> **Regra**: liste **TODOS** os arquivos envolvidos e a ação correspondente. Isso reduz tokens e scans desnecessários durante a execução.

---

## FASE 2 — Detecção de Candidatos a ADR (Hook)

A skill `agent-spec-minispec-generate-scope` atua como **hook de detecção de candidatos a ADR** do fluxo miniSpec. Ao definir as decisões técnicas, aplique os **5 critérios canônicos** definidos em `.claude/rules/agent-spec-adr-workflow-rules.md` (seção "ADR — Critérios Canônicos de Criação"):

1. Para cada decisão técnica candidata, valide mentalmente os 5 critérios (TODOS devem ser verdadeiros):
   - **C1 — Transversal**: aplicável a outras features ou ao projeto.
   - **C2 — Tag-alvo**: cai em uma das 14 tags canônicas (`architecture`, `state-management`, `auth`, `security`, `data`, `http`, `validation`, `testing`, `build`, `observability`, `performance`, `ui`, `error-handling`, `cross-cutting`).
   - **C3 — Custo de reversão alto**: reverter implica refactor significativo (≥ médio).
   - **C4 — Surpreendente sem contexto**: leitor futuro se perguntaria "por que assim?" sem o registro.
   - **C5 — Trade-off real**: havia ao menos UMA alternativa genuína rejeitada por razão específica.

2. Classifique o candidato conforme quantos critérios passam:
   - **5/5 passam** → registre na seção 5 (Observações) do SCOPE como **"Candidato a ADR confirmado"** + tag aplicável + 1 frase justificando cada critério.
   - **2-4/5 passam** → registre como **"Candidato a ADR parcial"** + lista dos critérios que falharam (ajuda o usuário a decidir se promove ou refina a decisão).
   - **0-1/5 passam** → registre apenas como decisão técnica nas seções apropriadas — **não** mencione candidatura a ADR.

3. **NÃO** crie a ADR automaticamente — apenas sinalize. O usuário invocará `/agent-spec-adr-create` se desejar (essa skill revalida os 5 critérios via `AskUserQuestion`).

---

## FASE 3 — Salvar Arquivo (OBRIGATÓRIO antes de apresentar)

**ANTES** de apresentar o SCOPE ao usuário, você DEVE:

1. Resolver o path do SCOPE substituindo `{feature}` e `{version}` em `minispec.scope.path` (extraídos do path da INTENT).
2. Criar o diretório pai do path resolvido (se não existir).
3. **Remover todos os comentários `<!-- LLM-ONLY: ... -->`** do conteúdo antes de salvar — são instruções internas do template e **NÃO** devem aparecer no arquivo gerado.
4. **Salvar o arquivo físico** no path resolvido a partir de `minispec.scope.path`.
5. Confirmar que o arquivo foi criado com sucesso.

### Template (selecionado pela variante)

Carregue o template oficial conforme a variante decidida em **FASE 0.0**:

| Variante | Template |
|----------|----------|
| `web` | [scope_template_web.md](assets/scope_template_web.md) |
| `mobile` | [scope_template_mobile.md](assets/scope_template_mobile.md) |
| `backend` | [scope_template_backend.md](assets/scope_template_backend.md) |

Todas as seções do template selecionado devem ser preenchidas. Se uma seção não se aplica, indique explicitamente "N/A — [justificativa]". Preencha o campo `Variante` no cabeçalho com o valor escolhido (`web`, `mobile` ou `backend`).

---

## FASE 4 — Saída Esperada (após salvar — ANTES de atualizar o estado)

Após salvar o arquivo físico, apresente apenas:

```
Arquivo salvo em: <path resolvido a partir de minispec.scope.path>

Esse escopo está fechado e aprovado? (sim/não)
```

**IMPORTANTE:**

- **NÃO** exiba o SCOPE completo no terminal — o usuário lerá o arquivo diretamente.
- **NÃO** inicie `/agent-spec-minispec-generate-tasks` automaticamente.
- **NÃO** sugira executar o próximo comando.
- **NÃO** sugira próximos passos do framework.
- **Se "sim"** → execute a FASE 5 (Estado do Pipeline) e encerre.
- **Se "não"** → **NÃO atualize o estado** (o state não pode registrar `completed` para um scope reprovado). Colete os ajustes do usuário, revise o `scope.md` e repita esta FASE 4.

---

## FASE 5 — Estado do Pipeline (_run/minispec_state.yaml — APÓS aprovação do usuário)

> **Ordem inviolável**: este passo só roda **depois** do "sim" da FASE 4. Atualizar o estado antes da aprovação faz o state mentir quando o usuário reprova o scope.

Atualize o arquivo no path resolvido a partir de `minispec.state.path` (mesmo diretório do SCOPE).

### Se o `_run/minispec_state.yaml` NÃO existir

**NÃO** crie o arquivo. A criação é responsabilidade da skill `agent-spec-minispec-generate-intent`. Apenas registre a omissão e prossiga.

### Se o `_run/minispec_state.yaml` JÁ existir — atualize apenas estes campos:

```yaml
current_step: scope
variant: <web|mobile|backend>            # NOVO no nível raiz — frente decidida em FASE 0.0
steps:
  scope:
    status: completed
    variant: <web|mobile|backend>        # NOVO redundante para auditoria
    summary: "<componentes novos>, <N endpoints>, tabelas: <lista tabelas>"
```

> Se o `_run/minispec_state.yaml` existir mas **não tiver** o campo `variant` no nível raiz (state legado), adicione ao atualizar.

### Bloco `tech_alignment` (sempre atualize junto)

- **Se o `tech-alignment.md` EXISTE** (foi encontrado/usado na FASE 0.1):

```yaml
steps:
  tech_alignment:
    status: completed
```

- **Se o usuário pulou o tech_alignment** (arquivo não existe):

```yaml
steps:
  tech_alignment:
    status: skipped
```

> **Por que aqui**: a skill compartilhada `agent-spec-generate-tech-alignment` não atualiza o `_run/minispec_state.yaml` — sem este ramo, o step ficaria `pending` para sempre mesmo quando o tech-alignment foi feito e usado.

### Bloco `design` (sempre atualize junto, se o step existir no state)

- **Se o `design.md` da feature EXISTE** (via `design.feature.path` — a `agent-spec-generate-design` já marcou `completed`; apenas confirme):

```yaml
steps:
  design:
    status: completed
```

- **Se a feature é web/mobile e o usuário pulou o design** (arquivo não existe):

```yaml
steps:
  design:
    status: skipped
```

- **Se a feature é `backend`**: marque `skipped` também (backend nunca tem design).

---

## Guardrails Invioláveis

Estas regras são **absolutas** e não podem ser violadas:

1. **Aprovação obrigatória** — nunca avance sem confirmação do usuário.
2. **Sem invenção** — se faltar informação, **PERGUNTE** ao usuário via `AskUserQuestion`.
3. **Escopo fechado** — o documento deve ser auto-suficiente, sem ambiguidades.
4. **Template completo** — todas as seções devem ser preenchidas (ou marcadas N/A com justificativa).
5. **Arquivo físico** — **SEMPRE** salvar antes de apresentar ao usuário.
6. **AskUserQuestion** — use esta ferramenta para esclarecer dúvidas com o usuário.
7. **Pesquisa obrigatória** — **SEMPRE** pesquise o projeto antes de definir o SCOPE (FASE 0).
8. **Baseado na INTENT** — **NUNCA** adicione funcionalidades não mencionadas na INTENT.
9. **Tech Alignment como direcionamento** — se existir, use como ponto de partida; em caso de conflito com codebase, levante antes de prosseguir.
10. **NUNCA inicie automaticamente a próxima etapa** — apenas encerre e aguarde.
11. **Detecção de ADR (hook)** — sinalize candidatos na seção 5, mas **NÃO** crie ADR automaticamente.
12. **Listagem completa de arquivos** — liste **TODOS** os arquivos envolvidos com ação (criar/modificar/remover) para economizar tokens e scans.

---

## Checklist Final (validar antes de apresentar)

- [ ] **Variante decidida (web/mobile/backend) em FASE 0.0 e registrada no cabeçalho do SCOPE**
- [ ] **Template correto carregado para a variante** (web/mobile/backend)
- [ ] **`variant` gravado em `_run/minispec_state.yaml`** (raiz e em `steps.scope`)
- [ ] SCOPE descreve **COMO** a feature será implementada (zero ambiguidade)
- [ ] Itens DENTRO e FORA do escopo listados explicitamente
- [ ] Definições técnicas concretas conforme a variante:
  - Web: páginas/componentes, store, APIs consumidas, i18n/a11y, feature flags
  - Mobile: telas, store, APIs, integração com hardware, sincronização offline-first
  - Backend: endpoints, banco de dados, services, integrações, versionamento, observabilidade
- [ ] **TODOS** os arquivos envolvidos listados com ação (criar/modificar/remover)
- [ ] Visão em árvore gerada e legenda preenchida
- [ ] Critérios de aceite técnicos definidos
- [ ] Candidatos a ADR sinalizados (se houver) na seção 5
- [ ] Nenhuma funcionalidade não mencionada na INTENT foi adicionada
- [ ] Nenhuma informação foi inventada ou deduzida
- [ ] Comentários `<!-- LLM-ONLY: ... -->` removidos do arquivo final
- [ ] Arquivo físico salvo no path resolvido a partir de `minispec.scope.path`
- [ ] `_run/minispec_state.yaml` atualizado (se existir) no path resolvido a partir de `minispec.state.path`
- [ ] Pronto para definição de TASKS

---

## Exemplo de Output Esperado

> Exemplo **ilustrativo**, agnóstico de domínio. Substitua nomes, entidades, rotas e regras pelas da feature real.

```markdown
# SCOPE – {Nome da Feature}

## 1. O que está incluído
- [x] {Capacidade A — verificável objetivamente.}
- [x] {Capacidade B.}
- [x] {Capacidade C.}

---

## 2. O que está fora do escopo
- [ ] {Capacidade adjacente que será deixada para versão futura.}
- [ ] {Integração com sistema X — não nesta versão.}
- [ ] {Customização/personalização — fora.}

---

## 3. Definições Técnicas

### 3.1 Visão em Árvore

```
{layer_dir}/
├── {modulo}/
│   ├── handler.{ext}     [N]
│   ├── service.{ext}     [N]
│   └── repository.{ext}  [N]
└── db/
    └── {NNNNNN}_{modulo}.up.sql   [N]
{manifest_file}                    [M]
```

Legenda: `[N]` Novo  `[M]` Modificado  `[R]` Referência

### 3.2 Arquivos Envolvidos
| Arquivo                              | Ação      | Descrição                           |
| ------------------------------------ | --------- | ----------------------------------- |
| {layer_dir}/{modulo}/handler.{ext}   | criar     | {Handler/controller do módulo.}     |
| {layer_dir}/{modulo}/service.{ext}   | criar     | {Regras de negócio do módulo.}      |
| {layer_dir}/{modulo}/repository.{ext}| criar     | {Persistência.}                     |
| db/{NNNNNN}_{modulo}.up.sql          | criar     | {Migration da nova entidade.}       |
| {manifest_file}                      | modificar | {Adicionar dependência X.}          |

### 3.3 Entidades/Modelos
| Entidade        | Campos principais                       | Observação                          |
| --------------- | --------------------------------------- | ----------------------------------- |
| {EntidadeNova}  | id, {campo_a}, {campo_b}, {fk_id}, ativo| {Reaproveita {EntidadeExistente}.}  |
| {EntidadeRef}   | id, nome, ordem                         | {Já existe — apenas referência.}    |

### 3.4 Backend

#### Endpoints/Rotas
| Método | Rota                       | Descrição                              | Auth        |
| ------ | -------------------------- | -------------------------------------- | ----------- |
| GET    | /api/{recurso}             | {Lista o recurso com filtros padrão.}  | {Política}  |
| GET    | /api/{recurso}/{sub}       | {Lista sub-recurso relacionado.}       | {Política}  |

(...demais seções do template preenchidas...)

---

## 4. Critérios de Aceite
- [ ] {Endpoint/recurso retorna apenas o conjunto válido conforme política de filtro.}
- [ ] {Acesso só é permitido sob a condição declarada na restrição (auth/ambiente/contexto).}

---

## 5. Observações
- Pontos de atenção: {integração com componente existente / decisão deferida / risco operacional}.
- Candidato a ADR: {nenhum | um por avaliar — descrever sucintamente}.
```

---

## Entrada

`$ARGUMENTS` deve conter o caminho do `intent.md` aprovado (ex: `/docs/specs/features/{feature}/v1/intent.md`).

$ARGUMENTS
