---
id: "agent-spec-sdd-generate-tech-spec"
title: "agent-spec-sdd-generate-tech-spec"
sidebar_position: 2
---
# agent-spec-sdd-generate-tech-spec

`SDD` `Generator`
> **Resumo**: Segunda etapa do framework SDD. Recebe um PRD aprovado (e opcionalmente `tech-alignment.md`) e produz `tech_spec.md` completo — o **COMO** técnico. Delega geração da Estratégia de Testes ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html).

---

## Quando usar

* Após `prd.md` aprovado.
* Quando o pipeline SDD precisa avançar para definição técnica.
* Antes de [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html).

## Quando NÃO usar

* PRD ainda em rascunho/não aprovado → finalize o PRD primeiro.
* Feature em pipeline miniSpec → use [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `prd.md` | Usuário (argumento) | Sim |
| `tech-alignment.md` | [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) | Não (recomendado se houver decisões técnicas explícitas) |
| `design.md` + `design-system.md` | [agent-spec-generate-design](/skills/shared/generate-design.html) | Não (só web/mobile — quando existe, as §4–5 referenciam em vez de redefinir) |
| `docs/adr/INDEX.md` | Existente no projeto | Não (consultado se existir) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `tech_spec.md` | `sdd.tech_spec.path` → `/docs/specs/features/{feature}/{version}/tech_spec.md` | [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) |

---

## Fluxo de execução

### FASE 0 — Detecção da Variante (Web | Mobile | Backend) — SEMPRE PERGUNTAR

**Primeira ação da skill, antes de qualquer leitura/pesquisa ou pergunta técnica.** A variante determina qual template carregar (FASE 5) e quais perguntas técnicas aplicar (FASE 3.2).

**Regra dura**: a pergunta é **OBRIGATÓRIA** e **SEMPRE** disparada via `AskUserQuestion`. Tech-alignment, quando presente, apenas pré-preenche a sugestão — **não** substitui a confirmação explícita.

**Procedimento**:

1. **Pré-leitura opcional do tech-alignment** (só para sugerir default): se existir, busca referência inequívoca (`Flutter`, `React Native`, `iOS`, `Android`, `frontend`, `backend`, etc.) e reserva a variante como **opção destacada** ("Recomendado pelo tech-alignment").
2. **Pergunta obrigatória** (sempre via `AskUserQuestion`):
   > "Qual é a frente desta TECH SPEC? `Web` | `Mobile` | `Backend`"
   >
   > Mantém as 3 opções disponíveis, mesmo com pré-detecção.

**Persistência:**

* Carrega o template correspondente na FASE 5.
* Grava `variant: web|mobile|backend` no `sdd_state.yaml` (raiz e `steps.tech_spec`).
* Preenche o campo `Variante` na seção 1 (Identificação) do TECH\_SPEC.
* Passa o parâmetro `frente` ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html) na FASE 4.

> **Por que SEMPRE perguntar**: tech-alignment é opcional, frequentemente ausente ou impreciso. Inferência silenciosa já levou a templates errados em features mistas. Pergunta explícita custa 1 turn e elimina ambiguidade.

### FASE 0.5 — Glossário de Domínio (2 níveis)

Carrega ambos os glossários se existirem:

* `domain_glossary.global.path` — `/docs/specs/domain-glossary.md` (cross-feature).
* `domain_glossary.feature.path` — `/docs/specs/features/{feature}/domain-glossary.md` (específico).

**Precedência**: feature sobrescreve global em conflito (raro; sinaliza). Use a terminologia combinada nos nomes de entidades, contratos e fluxos do tech\_spec.

> Skill **lê e valida** — não escreve. Termos novos identificados ficam para `/agent-spec-challenge-spec` canonizar. Veja [Glossário de domínio (2 níveis)](/agent-spec-completo.html#18-glossário-de-domínio-2-níveis).

### FASE 1 — Pesquisa obrigatória do projeto

Antes de qualquer pergunta técnica, a skill:

1. **Verifica `tech-alignment.md`**: se existir, usa como ponto de partida (decisões já tomadas, tecnologias sugeridas, restrições). Pode complementar/questionar — não é uma ordem. 1.5. **Verifica o design (opcional — só web/mobile)**: resolve `design.feature.path` e `design_system.global.path`. Se o `design.md` existir, ele é a **fonte de verdade do COMO VISUAL** — as seções 4 (Fluxos de Interface) e 5 (Comportamento Visual e Estados da UI) **referenciam** o design (resumo + ponteiro) em vez de redefinir; rotas/deep links continuam sendo decisão técnica da spec. Conflito design × codebase é levantado, não resolvido silenciosamente. Ausência **não é erro** — as §4–5 são preenchidas integralmente como sempre. Registra `steps.design: completed|skipped` no state (omitido em backend) e o campo `Design Relacionado` na seção 1.
2. **Lê o `INDEX.md` das ADRs** (`adr.index_file`): índice leve de padrões transversais já decididos. Não abre ADRs individuais salvo se a área da feature exigir aprofundamento.
3. **Explora as camadas do projeto** (handlers, services, repositories, controllers, blocs, etc.).
4. **Identifica código reutilizável** (funções, tipos, interfaces, componentes existentes).
5. **Mapeia dependências reais** — o que já existe vs. o que precisa ser criado.

> **Princípio**: nunca assume que algo precisa ser criado se já pode existir no projeto.

### FASE 2 — Tech Alignment (regras de prioridade)

```
1. Regras do projeto (.claude/rules/, CLAUDE.md) → INVIOLÁVEL
2. Tech Alignment do usuário → RESPEITAR (alta prioridade)
3. Descoberta autônoma do codebase → COMPLEMENTAR
4. Proposta do arquiteto (skill) → QUANDO NÃO HÁ CONFLITO
```

Conflito entre tech-alignment e codebase é **levantado para o usuário decidir**.

---

### FASE 3 — Construção interativa do TECH\_SPEC

**Uma pergunta por vez**. Inclui:

* Resumo Técnico (decisões do tech-alignment registradas)
* Componentes (handlers, services, repositories)
* Fluxos técnicos (diagramas, sequências)
* Schemas de dados
* Contratos de API
* Estratégia de Testes (delegada ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html))
* Arquivos Envolvidos e Ações
* ADRs referenciadas

### FASE 4 — Geração da Estratégia de Testes

Delegada ao [agent-spec-qa-test-generator](/agents/qa-test-generator.html) — **único** ponto onde a skill SDD invoca esse agent durante geração. Resultado: tabela de CTs mapeada a CAs, com cada CT aparecendo em **no máximo 1 task** na rastreabilidade (evita duplicação).

Após a validação do arquiteto, o JSON do agent é persistido **integralmente** em `shared.test_cases.path` (`test-cases.json`, com `task_id: null` — as tasks ainda não existem). A tabela do tech\_spec é o **índice** da feature; o JSON é a fonte **lossless** que o [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) consome na redistribuição — preservando `pre_condicoes`, `passos`, `negative_companion` e `precondicao_privilegiada` para o Detalhamento (§6.6) das tasks, sem re-parse de markdown.

### FASE 4A — Inventário de ADRs Aplicáveis (ADRs EXISTENTES) ⚡

> **Diferente da FASE 4B**: 4A cruza decisões ATUAIS contra ADRs já aceitas no projeto; 4B detecta decisões NOVAS para virar ADR.

Quando o diretório de ADRs existe, a skill DEVE produzir inventário declarativo:

1. Listar todas as ADRs no índice resolvido via `adr.index_file` com status `Accepted` (ignorar `Deprecated`/`Superseded`).
2. Para cada ADR: ler título + decisão (1-2 linhas) e classificar como **APLICÁVEL** / **PARCIAL** / **N/A**, citando a seção do tech\_spec afetada.
3. Para cada ADR `APLICÁVEL`/`PARCIAL`, adicionar **sub-bullet** na seção de Definições Técnicas correspondente mostrando como a feature obedece. Exemplo: "ADR-0010 — todas as tags `form:`/`json:` dos Requests em §3.3 usam identificadores em inglês."

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: ADR-0010 (idioma de identificadores) só foi detectada no Tech Review de T7, cascateando correções para T5/T6. Inventário explícito no tech\_spec antecipa o impacto.

Resultado: o inventário entra na seção de **Observações / Notas Técnicas** do tech\_spec com o título "ADRs Aplicáveis nesta Feature". Quando o diretório de ADRs (via `adr.dir`) não existe ou está vazio: marcar `Sem ADRs ativas no projeto` e seguir para a FASE 4B.

### FASE 4B — Detecção de Candidatos a ADR (decisões NOVAS)

Aplica os 5 critérios canônicos para sinalizar decisões técnicas que mereçam virar ADR — ver "Detecção de candidatos a ADR" abaixo. Não cria ADR automaticamente — apenas sinaliza; o usuário invoca `/agent-spec-adr-create` se desejar.

### Subseção 4.1.1 — Exemplo de Payload por Endpoint (`PUT`/`PATCH` parcial)

Para cada endpoint que aceita **atualização parcial** (`PUT`/`PATCH` cujo CA diga "campos opcionais", "multipart parcial"), o template backend (seção 4.1.1) exige:

1. Exemplo de body/form **mínimo** (só com 1 campo).
2. Observação literal: "campos ausentes são ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request — apenas o ID na URL é obrigatório".
3. Diferenciar do `POST` correspondente: no `POST` campos obrigatórios continuam obrigatórios; no `PUT`/`PATCH` parcial, **não**.

> **Motivação**: T9 do post-mortem gastou rodada extra porque o executor copiou `binding:"required"` do `POST` para o `PUT`. Payload-exemplo explícito elimina a ambiguidade.

### FASE 5 — Salvamento

Resolve `sdd.tech_spec.path`. Atualiza `sdd_state.yaml` para `tech_spec: completed`.

---

## Gates invocados

Nenhum gate de validação (QA, Tech Review). Apenas invocação do gerador:

* **[agent-spec-qa-test-generator](/agents/qa-test-generator.html)** — para gerar a Estratégia de Testes.

> Esta skill **não** roda gates de qualidade. Validação acontece apenas em [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) durante execução.

---

## Detecção de candidatos a ADR

Durante a construção do tech\_spec, a skill aplica heurísticas para detectar candidatos a ADR:

| # | Critério | Pergunta |
| --- | --- | --- |
| C1 | `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? |
| C2 | `tag_alvo` | Cai em uma das 14 tags canônicas (architecture, auth, security, data, http, validation, testing, build, observability, performance, ui, error-handling, cross-cutting, state-management)? |
| C3 | `custo_reversao_alto` | Reverter implica refactor significativo (≥ médio) em múltiplos lugares? |
| C4 | `surpreendente_sem_contexto` | Um leitor futuro vai se perguntar "por que fizeram assim?" sem este registro? |
| C5 | `trade_off_real` | Havia ao menos UMA alternativa genuinamente considerada, rejeitada por razão específica (não "única opção viável")? |

**Sinalização no tech\_spec**:

* **5/5 critérios** → seção "Observações" recebe `Candidato a ADR confirmado` com tag aplicável e justificativa de cada critério. Skill propõe `/agent-spec-adr-create` ao usuário.
* **2-4/5 critérios** → seção "Observações" recebe `Candidato a ADR parcial` + lista dos critérios que falharam.
* **0-1/5 critérios** → não menciona candidatura (decisão é local/trivial).

> Skill **não cria ADR diretamente** — sempre orienta usuário a rodar `/agent-spec-adr-create` (que revalida critérios). Veja [ADR — Visão Geral](/adr/overview.html) e [Os 5 critérios](/agent-spec-completo.html#13-o-que-vira-adr--os-5-critérios).

---

## Templates / assets usados

A skill seleciona o template conforme a **variante** (`web | mobile | backend`) decidida em FASE 0:

| Variante | Template | Seções | Aspectos exclusivos |
| --- | --- | --- | --- |
| **Web** | `tech_spec_template_web.md` | 21 | Core Web Vitals, bundle size, i18n, a11y WCAG, XSS/CSRF, gestão de estado (Redux/Zustand/Context/Signals) |
| **Mobile** | `tech_spec_template_mobile.md` | 22 | BLoC/Riverpod/Provider, offline-first, hardware (câmera/GPS/biometria/NFC), cold start, jailbreak detection, Keychain/Keystore |
| **Backend** | `tech_spec_template_backend.md` | 23 | Endpoints, tabelas+migrações, eventos/filas, rate limiting, observabilidade (logs estruturados/métricas/tracing), contratos OpenAPI/proto |

A variante escolhida é gravada em `sdd_state.yaml` (raiz e em `steps.tech_spec`) e na seção 1 (Identificação) do TECH\_SPEC.

**Campos/colunas notáveis dos templates**:

* **`Stack`** (seção 1 do template **web**): stack frontend escolhida (React | Vue | Svelte | Angular | Outro) com a estratégia SSR/CSR, coletada na FASE 3.2.
* **Coluna `Setup (caminho legítimo)`** nas tabelas de teste dos **3 templates**: receita anti-violação da **Iron Law #6 (Lei do seam)**. Quando o teste depende de precondição que a produção não expõe (auth/contexto/relógio/identidade), registra o caminho legítimo de montagem (imitar teste análogo → boundary real → mecanismo teste-interno nativo da stack), populada a partir de `precondicao_privilegiada` do JSON do [agent-spec-qa-test-generator](/agents/qa-test-generator.html). Usa `—` quando não há precondição privilegiada. Nunca exportar/criar símbolo de produção só para teste.

> Veja também: [Variantes do Tech Spec — referência completa](/reference/tech-spec-variants.html)

---

## Exemplo de uso

```bash
/agent-spec-sdd-generate-tech-spec docs/prds/features/pagamentos/v1/prd.md
```
```
[Lê PRD, tech-alignment se existir, ADR index, codebase]
[Faz perguntas técnicas uma a uma]
[Detecta candidato a ADR: "Padrão de retry para PSP"]
→ Propõe /agent-spec-adr-create "ADR-XXXX padrão de retry PSP"
[Delega a Estratégia de Testes ao agent-spec-qa-test-generator]
[Salva tech\_spec.md]
✅ tech\_spec.md salvo em /docs/specs/features/pagamentos/v1/tech\_spec.md
✅ ADRs referenciadas: ADR-0004 (HTTP Rest Client), ADR-0007 (PSP Retry)
Próximo passo: /agent-spec-sdd-generate-task-plan 
```

---

## Skills relacionadas

* [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html) — etapa anterior.
* [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) — entrada opcional com decisões curtas.
* [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) — próxima etapa.
* [agent-spec-adr-create](/skills/adr/adr-create.html) — disparada quando a skill detecta candidato a ADR.
* [agent-spec-qa-test-generator](/agents/qa-test-generator.html) — invocada para gerar a Estratégia de Testes.

## Configuração via framework-paths.md

Paths usados: `sdd.prd.path`, `tech_alignment.path`, `sdd.tech_spec.path`, `adr.index_file`, `sdd.state.path`. Veja [Path Templates](/configuration/path-templates.html).
