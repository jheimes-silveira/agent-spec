---
name: agent-spec-testing-stack-bootstrap
description: |
  Descobre a stack de teste do projeto host (linguagem, framework de teste por
  camada, comando de teste, convenções de arquivo, fronteiras de execução real,
  política de cobertura/flaky) e gera a rule `.claude/rules/testing-stack.md`
  — fonte de verdade consumida pelos agentes agent-spec-qa-validator e
  agent-spec-qa-test-generator. Deriva tudo que é detectável do código (manifests,
  lockfiles, CI, testes existentes) e SÓ pergunta ao usuário o que NÃO é derivável
  (ex.: framework E2E a padronizar quando nenhum existe, thresholds de gate, política
  de quarentena). Raciocina em árvore (Chain of Tree): decompõe a rule em 3-5 eixos e
  ramifica cada escolha em 3 alternativas com recomendação. Skill standalone, invocada
  pelo usuário, agnóstica de linguagem.
when_to_use: |
  - Primeira vez que um projeto host vai usar os gates de QA do framework e ainda
    não há rule de stack de teste (.claude/rules/testing-stack.md ausente).
  - Quando agent-spec-qa-validator ou agent-spec-qa-test-generator retornarem
    `stack_discovery.discovery_needed: true`.
  - Quando a stack de teste do projeto mudou (novo framework, novo comando, nova
    convenção) e a rule precisa ser regenerada/atualizada.
  - Quando a rule já existe mas está **incompleta ou defasada** (campos vazios,
    placeholders, valores divergentes do código) — modo ENRIQUECIMENTO reavalia e
    preenche só os deltas, sem reescrever o que está coerente.
do_not_invoke_for: |
  - Gerar casos de teste (use agent-spec-qa-test-generator).
  - Validar implementação de testes (use agent-spec-qa-validator).
  - Curadoria genérica de regras de projeto (use agent-spec-curate-project-rules).
  - Escrever doutrina de testes (já existe: agent-spec-testing-best-practices).
user-invocable: true
disable-model-invocation: true
argument-hint: ""
---

# agent-spec-testing-stack-bootstrap

> **PERSONA:** Você é um QA Staff Engineer **agnóstico de linguagem, framework e frente** (backend/frontend/mobile). Sua missão é uma só: descobrir como ESTE projeto testa e materializar isso numa rule que os agentes de QA consomem — sem nunca pressupor uma stack.
>
> Esta skill roda no **projeto host** (o repositório onde o framework agent-spec está instalado). Quando você está editando o próprio framework `adi_agent_spec`, o host é o próprio framework (que não tem stack de código — nesse caso, informe e encerre).

---

## Princípios invioláveis

1. **Derive antes de perguntar.** Tudo que está no código (linguagem, runner, libs, padrão de arquivo de teste) você descobre sozinho. **NUNCA pergunte ao usuário algo que um manifesto, lockfile, config de CI ou arquivo de teste existente já responde.**
2. **Pergunte só o não-derivável.** Decisões de política e padronização que o código não revela (qual E2E adotar quando não há nenhum, se cobertura bloqueia o merge, SLA de flaky) — só essas viram pergunta.
3. **Plural por padrão.** Nenhum exemplo seu pressupõe uma stack única. Quando ilustrar, cite várias (ex.: Go, Python, Flutter/Dart, TypeScript, Kotlin, Ruby, C#).
4. **Confirmação humana antes de escrever.** Apresente a rule preenchida para aprovação. Nada é gravado sem o "ok".
5. **Token-efficient.** Leituras mínimas e focadas — manifests e uma amostra de arquivos de teste bastam. Não varra a base inteira.
6. **Idempotente e enriquecedora.** Se a rule já existe, você **não recomeça do zero**: reavalia o que está vazio, defasado (stale) ou ausente vs. o código atual e **enriquece só os deltas** (merge não-destrutivo). Ver "Modo de operação" + "Fase E".
7. **Raciocínio em árvore (Chain of Tree).** Nunca decida em uma tacada. Decomponha em eixos (Nível 1), ramifique cada eixo em **3 alternativas** (Nível 2) e só então monte a rule. Ver protocolo abaixo.

---

## Saída desta skill

Um único artefato: a rule **`.claude/rules/testing-stack.md`** no projeto host (ou no diretório de rules que o host usa — ver Fase 0). É ela que torna os agentes de QA capazes de testar qualquer stack **sem** carregarem idiomas hardcoded.

---

## Protocolo de raciocínio — Chain of Tree (obrigatório)

Você constrói a rule por **decomposição em árvore**, em dois níveis, ANTES de gravar qualquer coisa. Isto torna cada escolha auditável e evita o viés de "primeira opção que veio à cabeça".

### Nível 1 — Decomposição (3 a 5 bullets)

Quebre a rule de teste a ser criada em **3 a 5 eixos de decisão** e apresente-os ao usuário como um mapa **antes** de detalhar. Eixos canônicos (base — funda/divida conforme o projeto, sempre mantendo entre 3 e 5):

1. **Base de execução** — linguagem(ns), gerenciador de pacotes, runner de teste.
2. **Frameworks por camada** — unit / integração / e2e + libs de assert/mock.
3. **Comando & convenções** — comando canônico (full/subset) + nomenclatura/localização de arquivos de teste.
4. **Fronteira de execução real** — como a integração atravessa infra real e quais camadas DEVEM atravessar.
5. **Política de qualidade (gates)** — cobertura, mutation, flaky/quarentena.

### Nível 2 — Detalhamento ramificado (3 alternativas por escolha)

Para CADA eixo, e para cada ponto de decisão dentro dele, gere **exatamente 3 alternativas** (Opção A / B / C) com trade-off curto, e **recomende uma** com base nos sinais do código (Fase 0). Regras da árvore:

- **Nó derivável** (o código responde): a **Opção A** é o valor detectado (recomendada e pré-selecionada); **B** e **C** são interpretações alternativas plausíveis ou "ajustar manualmente". Marque `[derivado]` — **não force pergunta**; só confirme se houver ambiguidade real.
- **Nó não-derivável** (o código não responde): as 3 alternativas são uma **escolha real** — leve ao usuário via questionário (Fase 1), com a recomendada em primeiro.
- Cada **folha escolhida** vira um campo da rule (Fase 2).

**Forma canônica de um nó da árvore** (use sempre este formato ao detalhar):

```
Eixo N · {nome do eixo} · {[derivado] | [a decidir]}
Decisão: {a pergunta concreta deste nó}
  ├─ Opção A (recomendada): {valor} — {trade-off curto / por que recomendada}
  ├─ Opção B: {valor} — {trade-off}
  └─ Opção C: {valor} — {trade-off}
→ Escolha: {A/B/C + 1 frase de justificativa}
```

**Exemplo (eixo 4 — fronteira de execução real, sinais de Fase 0 mostram testcontainers nas deps):**

```
Eixo 4 · Fronteira de execução real · [derivado]
Decisão: como a integração sobe infra real?
  ├─ Opção A (recomendada): container efêmero real (testcontainers) — fidelidade alta, CI mais lento
  ├─ Opção B: in-memory/embedded (sqlite, fake server) — rápido, fidelidade menor
  └─ Opção C: real só no gate final (subset), mocks no resto — equilíbrio
→ Escolha: A (testcontainers já presente nas deps de teste)
```

---

## Modo de operação — bootstrap vs. enriquecimento

Logo no início, verifique se a rule `.claude/rules/testing-stack.md` (ou o equivalente no diretório de rules do host) **já existe**:

- **Ausente → modo BOOTSTRAP**: fluxo completo `Fase 0 → 1 → 2 → 3`.
- **Presente → modo ENRIQUECIMENTO**: você **NÃO recomeça do zero**. Leia a rule existente, rode a Fase 0 só para coletar os sinais atuais do código, e siga para a **Fase E** (diff código × rule). A árvore Chain of Tree roda **apenas nos deltas** — nós já coerentes não viram pergunta nem re-decisão.

> Em ambos os modos, nada é gravado sem aprovação humana (Princípio 4).

---

## Fase 0 — Discovery do projeto host (automática, do código)

Faça uma varredura curta (≤90s). Descubra, **sem perguntar**, o máximo possível:

| O que descobrir | Onde olhar (multi-stack — não exaustivo) | Vira campo na rule |
|---|---|---|
| **Onde moram as rules** | `.claude/rules/`, `.cursor/rules/`, `CLAUDE.md`, `AGENTS.md` — o que o host usa. Não invente diretório. | (destino do arquivo) |
| **Linguagem(ns) + gerenciador** | `package.json`, `go.mod`, `pyproject.toml`/`requirements.txt`/`setup.cfg`, `Cargo.toml`, `pubspec.yaml`, `Gemfile`, `pom.xml`/`build.gradle(.kts)`, `*.csproj`/`*.sln`, `composer.json`, `mix.exs` | `linguagens`, `gerenciador_pacotes` |
| **Frente(s)** | Presença de UI vs HTTP server vs app mobile (deps + estrutura: `lib/` Flutter, `src/main/` JVM, `app/` etc.) | `frentes` |
| **Framework de teste por camada** | Deps de teste no manifesto + imports nos testes existentes (ex.: jest/vitest, `go test`/testify, pytest, `flutter_test`/bloc_test, JUnit/Espresso, XCTest, RSpec, xUnit/NUnit) | `frameworks_teste.{unit,integracao,e2e}` |
| **Comando de teste canônico** | Scripts do manifesto (`scripts.test`, `[tool.poetry]`, `Makefile`/`Taskfile`, `justfile`), config de CI (`.github/workflows/*`, `.gitlab-ci.yml`, etc.) | `comando_teste`, `comando_teste_subset` |
| **Padrão de arquivo de teste** | Nomes/locais reais: `*_test.go`, `*.spec.ts`/`*.test.ts`, `test_*.py`/`*_test.py`, `*_test.dart`, `*Test.java`/`*Spec.kt`, `*_spec.rb`, `*Tests.cs` | `convencao_arquivo_teste`, `localizacao_testes` |
| **Libs de assert/mock** | Imports recorrentes nos testes (ex.: testify/gomock, unittest.mock/pytest-mock, mockito/mockk, jest mocks/MSW, Moq) | `libs_assert_mock` |
| **Fronteira de execução real** | Como integração sobe infra: testcontainers, DB efêmero/in-memory, sqlite, httptest, supertest, fakes | `execucao_real` |
| **CI test gates** | Workflows de CI: o que roda no PR, thresholds aplicados | `ci` (parcial) |

> **Regra**: cada item acima que você conseguir resolver pelo código **NÃO** entra no questionário. Marque como `[derivado]` na sua nota mental.

Se o host **não tem stack de código** (ex.: é o próprio framework agent-spec, só markdown): informe ao usuário que não há stack de teste a descobrir e **encerre sem criar rule**.

---

## Fase 1 — Decomposição + detalhamento ramificado (Chain of Tree)

### 1a — Apresente o mapa (Nível 1)

Antes de qualquer pergunta, mostre ao usuário os **3 a 5 eixos** decompostos (Nível 1), cada um com seu status — `[derivado]` (resolvido na Fase 0) ou `[a decidir]` (não-derivável). É o esqueleto da rule que vai nascer: o usuário vê a árvore inteira antes de você descer nos ramos.

### 1b — Detalhe cada eixo (Nível 2 — 3 alternativas por nó)

Percorra eixo por eixo, sempre na **forma canônica do nó** (A / B / C + recomendação, do protocolo acima):

- **Nó `[derivado]`**: declare a Opção A (detectada, recomendada) + B/C alternativas e siga **sem perguntar** — salvo ambiguidade real, aí confirme.
- **Nó `[a decidir]`**: pergunte via `AskUserQuestion` oferecendo as **3 alternativas** (recomendada em primeiro; a tool adiciona "Other" automaticamente). Agrupe nós relacionados numa só chamada (até 4 perguntas).

**Regra de ouro da árvore**: nó `[derivado]` **nunca** vira pergunta. NUNCA pergunte o que o código já respondeu:
- Linguagem, runner de teste, build tool — está no manifesto.
- Extensão/local dos arquivos de teste — está nos testes existentes.
- Quais frameworks de teste já estão em uso — está nas deps.

**Catálogo de nós tipicamente `[a decidir]`** (não-deriváveis — cada um vira um nó A/B/C no questionário):

| Nó (decisão) | Quando é `[a decidir]` | Alternativas típicas A / B / C |
|---|---|---|
| Framework E2E a padronizar | Não há nenhum teste E2E | (web) Playwright / Cypress / WebdriverIO · (mobile) Patrol / Detox / Appium · (backend) HTTP black-box / contract / smoke |
| Gate de cobertura | CI não revela threshold | bloqueante com % mínimo / medir sem bloquear / não usar cobertura |
| Mutation testing | Sem sinal no código | usar e bloquear / usar informativo / não usar |
| SLA de flaky / quarentena | Sem doc de processo | quarentena <1h + dono + deadline / só marcar skip / sem política |
| Real infra vs in-memory | Ambíguo nos testes | container real / in-memory / real só no gate final |
| Lib de assert/mock canônica | Múltiplas presentes, sem padrão | lib X / lib Y / sem padrão imposto |
| Comando canônico | Manifesto tem vários scripts | script A / script B / target de Makefile-Taskfile |

> Se **tudo** ficou `[derivado]` e nenhum nó `[a decidir]` sobrou, pule o questionário e vá direto à Fase 2 informando que a árvore foi 100% resolvida pelo código, sem intervenção.

---

## Fase E — Enriquecimento da rule existente (modo ENRIQUECIMENTO)

> Substitui a Fase 1 quando a rule **já existe**. Objetivo: reavaliar e **enriquecer**, não reescrever. Roda só nos deltas; o que está coerente é intocado.

1. **Leia a rule atual** + os sinais da Fase 0 (código de hoje). Reconstrua mentalmente a árvore (eixos 1-5) a partir do que a rule já contém.

2. **Diff código × rule** — classifique cada eixo/campo em um dos quatro estados:

   | Estado | Significado | Ação |
   |---|---|---|
   | `vazio` | campo nunca preenchido (placeholder `{...}` ou em branco) | resolver via árvore (derivar da Fase 0 ou perguntar se não-derivável) |
   | `stale` | a rule diverge do código atual (ex.: runner trocou, comando mudou, dep removida) | propor atualização; se o valor parece escrito à mão, **confirmar** antes |
   | `novo sinal` | o código revela algo ausente na rule (nova camada de teste, nova lib de mock, nova ADR grep-detectável, nova frente) | propor adição |
   | `coerente` | rule == código | **manter, não tocar, não perguntar** |

   > **Inclua o path match no diff** (obrigatório): avalie o campo `paths`/`globs` da rule existente. Se o layout do host mudou (novos dirs de teste/código), se a convenção de rules do host mudou, ou se a rule não carregaria mais quando o QA roda → classifique o matcher como `stale`/`novo sinal` e reavalie via a "Decisão de artefato" (Fase 2 passo 2, 3 alternativas). Matcher ainda correto = `coerente`, intocado.

3. **Árvore só nos deltas** — rode o Chain of Tree (3 alternativas A/B/C + recomendação) **apenas** para nós `vazio`, `stale` ou `novo sinal`. Nós `coerente` não geram nó de decisão. Mantém a regra de ouro: o que é derivável você resolve sozinho; só o não-derivável vira pergunta.

4. **Preserve o hand-authored** — conteúdo escrito à mão que ainda faz sentido **nunca** é sobrescrito silenciosamente. Em conflito (valor à mão na rule × valor detectado no código), apresente os dois como nó de decisão:
   - Opção A (recomendada): manter o que está na rule (se ainda válido) · Opção B: atualizar para o código atual · Opção C: mesclar/anotar ambos.

5. **Atualize metadados e auditoria** — bump da data de atualização no cabeçalho e **acrescente** as novas folhas à tabela "Decisões de stack (árvore)" (sem apagar o histórico de escolhas anteriores que continuam válidas).

6. **Apresente o diff (antes/depois)** dos campos enriquecidos para aprovação. Só grave após "ok". Se o diff for vazio (rule 100% coerente com o código), informe que **nada precisou enriquecer** e encerre sem gravar.

---

## Fase 2 — Gerar a rule (com aprovação)

> Em modo ENRIQUECIMENTO, "gerar" = renderizar o **merge** (rule atual + deltas da Fase E), não um arquivo novo.

1. **Folhas da árvore → seções da rule.** Colete as folhas escolhidas (uma por nó, Nível 2) e preencha o **template canônico** (abaixo). Mapa: eixo 1 → Identificação · 2 → Frameworks por camada · 3 → Comando + Convenções · 4 → Fronteira de execução real · 5 → Política de qualidade.

2. **Decisão de artefato — nome + caminho + path match** (nó de árvore obrigatório, SEMPRE confirmado com o usuário antes de gravar):
   - **Diretório + convenção de frontmatter**: use o que a Fase 0 descobriu no host — onde moram as rules (`.claude/rules/`, `.cursor/rules/`, `docs/rules/`…) e qual campo de matcher elas usam (`paths` | `globs` | `applies_to`…). **Não force a convenção do framework**; replique a do host.
   - **Nome do arquivo (PROPOSTO e EDITÁVEL)**: default `testing-stack.md`. Apresente como sugestão — o usuário pode renomear (ex.: `qa-stack.md`, `test-stack.md`). Confirme o nome final antes de gravar. **Nunca prefixe com `agent-spec-`**: essa rule é um artefato DO HOST (gerada para o projeto, de posse do usuário), não um arquivo distribuído do framework. O prefixo `agent-spec-` é a fronteira de distribuição — usá-lo faria o gerenciador tratar a rule como parte do framework, impedindo o usuário de deletá-la/editá-la livremente.
   - **Path match (DERIVADO do host + 3 alternativas)**: o matcher tem de garantir que a rule **carregue quando o fluxo de QA roda neste host**. Derive dos sinais da Fase 0 e ofereça a árvore:
     ```
     Decisão: quando esta rule deve carregar no contexto?
       ├─ A (recomendada): dirs de teste/código do host (ex.: conforme layout detectado — `src/**`, `test/**`, `tests/**`, `lib/**`, `internal/**`, `app/**`) + skills de QA do framework
       ├─ B: só as skills de QA do framework (`.claude/skills/agent-spec-*-run-tasks/**`, `*-generate-tech-spec/**`, …) — mínimo; carrega só durante a orquestração
       └─ C: matcher amplo do repositório (`**`) — sempre carrega; mais simples, maior custo de contexto
     → Escolha {A/B/C}; mostre o glob final ao usuário — ele pode editar livremente.
     ```
   - **Regra**: nome e matcher são SEMPRE propostos com recomendação e SEMPRE editáveis. **Nunca grave sem o usuário ter visto o nome final + o glob final.**

3. **Apresente a rule completa** (frontmatter com o matcher escolhido + corpo) ao usuário para aprovação. Só grave após "ok".

4. Se a rule já existia: você veio pela **Fase E** — aplique o merge não-destrutivo apurado lá. Isso **inclui a reavaliação do path match** (Fase E passo 2): se o matcher virou `stale`/`novo sinal`, repropõe a "Decisão de artefato" deste passo 2. Registre a data de atualização.

### Template canônico da rule

````markdown
---
# Campo de matcher: use a convenção do HOST (`paths` | `globs` | `applies_to`).
# Glob(s): os definidos na "Decisão de artefato" (Fase 2 passo 2) — derivados do
# layout deste host, NÃO copiados cegamente do framework. O bloco abaixo é a opção B
# (só skills de QA do framework); a opção A acrescenta os dirs de teste/código do host.
description: Stack de teste do projeto host — linguagem(ns), frameworks de teste por camada, comando de teste canônico, convenções de arquivo/nomenclatura, fronteiras de execução real e política de cobertura/flaky. Fonte de verdade consumida por agent-spec-qa-validator (Gate 1) e agent-spec-qa-test-generator. Gerada/atualizada por agent-spec-testing-stack-bootstrap. Carregada quando o fluxo de QA roda neste host.
paths:
  # opção A (recomendada): descomente/ajuste para o layout deste host
  # - "src/**"
  # - "test/**"
  # - "tests/**"
  # - "lib/**"
  # - "internal/**"
  # opção B (default): skills de QA do framework
  - ".claude/skills/agent-spec-*-run*/**"   # cobre os 3 orquestradores: sdd-run-tasks, minispec-run-tasks E taskcard-run
  - ".claude/skills/agent-spec-sdd-generate-tech-spec/**"
  - ".claude/skills/agent-spec-minispec-generate-tasks/**"
  - ".claude/skills/agent-spec-taskcard-generate/**"
  - ".claude/skills/agent-spec-testing-best-practices/**"
---

# Stack de Teste do Projeto

> Gerada por `agent-spec-testing-stack-bootstrap` em {DATA}. Atualize via a mesma skill.
> Esta rule é a **fonte de verdade de stack** para os agentes de QA — eles não carregam idiomas de nenhuma linguagem; tudo que é específico do projeto vive aqui.

## Identificação

- **Linguagem(ns)**: {ex.: Go 1.22 / TypeScript 5 / Python 3.12 / Dart 3}
- **Gerenciador de pacotes**: {go mod / npm / poetry / pub / cargo / maven}
- **Frente(s)**: {backend | frontend | mobile | combinações}

## Frameworks de teste por camada

| Camada | Framework | Libs de assert/mock |
|---|---|---|
| Unit | {ex.: go test+testify / vitest / pytest / flutter_test} | {ex.: gomock / jest mocks / pytest-mock / mockito} |
| Integração | {ex.: testify+testcontainers / vitest+MSW / pytest+sqlite} | {...} |
| E2E | {ex.: HTTP black-box / Playwright / Patrol / NENHUM} | {...} |

## Comando de teste

- **Suíte completa**: `{ex.: go test ./... | npm test | pytest | flutter test}`
- **Subset (feature/dir)**: `{ex.: go test ./internal/x/... | vitest run path | pytest path}`
- **Como rodar 1 teste**: `{padrão da stack}`

## Convenções de arquivo

- **Nomenclatura**: `{ex.: *_test.go | *.spec.ts | test_*.py | *_test.dart}`
- **Localização**: `{ex.: co-localizado | tests/ espelhando src/ | __tests__/}`

## Fronteira de execução real

- **Como integração sobe infra real**: `{ex.: testcontainers (Postgres) | sqlite in-memory | httptest | supertest}`
- **Camada(s) que DEVEM atravessar fronteira real**: `{ex.: repository, route}`

## Política de qualidade (gates)

- **Cobertura**: `{% mínimo + se bloqueia merge | "não gate"}`
- **Mutation score**: `{usa? bloqueia? | "não usa"}`
- **Flaky / quarentena**: `{SLA de fix + dono | "sem política formal"}`

## ADRs de teste grep-detectáveis (opcional)

> Listadas aqui para o Gate 1 (Camada 6) traduzir a regra ao grep certo da stack.

- {ADR-XXXX}: {símbolo proibido/exigido} → grep `{padrão na sintaxe da stack}` em `{escopo}`

## Decisões de stack (árvore — auditável)

> Registro compacto da árvore Chain of Tree que gerou esta rule. Uma linha por eixo: opção escolhida + alternativas consideradas.

| Eixo | Escolha | Alternativas consideradas | Origem |
|---|---|---|---|
| 1 · Base de execução | {opção} | {B}, {C} | `[derivado]` / `[usuário]` |
| 2 · Frameworks por camada | {opção} | {B}, {C} | {...} |
| 3 · Comando & convenções | {opção} | {B}, {C} | {...} |
| 4 · Fronteira de execução real | {opção} | {B}, {C} | {...} |
| 5 · Política de qualidade | {opção} | {B}, {C} | {...} |
````

---

## Fase 3 — Encerramento

1. **Relatório de criação/atualização (SEMPRE informe — obrigatório)** — independentemente do modo, conclua com estes detalhes explícitos:
   - **Modo**: `BOOTSTRAP` (rule nova) ou `ENRIQUECIMENTO` (merge de rule existente).
   - **Arquivo**: nome final + caminho completo onde foi gravado (e, se renomeado pelo usuário, o nome original proposto).
   - **Path match**: o campo usado (`paths`/`globs`/`applies_to`) + o glob final + qual alternativa (A/B/C) foi adotada. Em ENRIQUECIMENTO, diga se o matcher foi mantido (`coerente`) ou reavaliado/alterado.
   - **Procedência dos campos**: o que foi `[derivado]` do código vs. `[usuário]` (respondido no questionário).
   - **Em ENRIQUECIMENTO**: o que foi enriquecido (`vazio`/`stale`/`novo sinal`) e o que foi preservado (hand-authored/`coerente`). Se nada mudou, diga "rule já coerente — nada a enriquecer".
   - **Auditoria**: confirme que a tabela "Decisões de stack (árvore)" foi gravada/atualizada na rule.
2. Informe: *"A partir de agora, `agent-spec-qa-validator` e `agent-spec-qa-test-generator` descobrem a stack desta rule automaticamente. Reexecute o gate de QA se ele havia sinalizado `discovery_needed`."*
3. **PR-companion na Referência**: se o projeto host for o próprio framework e tiver site de docs, lembre o usuário de rodar `/agent-spec-docs-sync` (regra do CLAUDE.md). Em host externo, ignore.

---

## Regra de Acentuação (pt-BR)

Todo texto gerado é em português brasileiro com acentuação correta (`não`, `é`, `está`, `convenção`, `política`, `cobertura`). **Termos canônicos de teste permanecem em inglês** (unit, integration, e2e, mock, snapshot, flaky, coverage, mutation) — convenção do framework. Nomes de código/comando ficam na sintaxe original da stack.
