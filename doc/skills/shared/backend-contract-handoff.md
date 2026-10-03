---
id: "agent-spec-backend-contract-handoff"
title: "agent-spec-backend-contract-handoff"
sidebar_position: 5
---
# agent-spec-backend-contract-handoff

`Compartilhada`
> **Resumo**: Gera um handoff operacional do backend para o frontend a partir de código-fonte, contratos formais (OpenAPI/GraphQL/protobuf) e/ou especificações (PRD, tech_spec, scope, TaskCard, ADR). Produz um markdown curto, auditável e executável — endpoints, payloads, erros, auth, permissões, estados de UI, fixtures e critérios de aceite — agnóstico de linguagem/framework do frontend.

**Persona**: Engenheiro de Integração. Direto, operacional, agnóstico de stack. Toda afirmação é rastreável até código, contrato formal ou especificação. Quando falta evidência, marca `[DÚVIDA]` ou `[HIPÓTESE]` — nunca inventa.

---

## Quando usar

* Frontend precisa consumir um backend novo ou existente e você quer um contrato curado, não a leitura crua dos handlers.
* Fechamento de TaskCard/task SDD/miniSpec que atravessa backend → frontend.
* Pareamento humano/agente entre times: o backend "passa o bastão" sem reunião.
* Geração de stubs/fixtures/mocks para o frontend trabalhar offline ou em paralelo.
* Auditoria de divergência (drift): comparar o que o frontend assume com o que o backend de fato expõe.

## Quando NÃO usar

| Cenário | Use |
| --- | --- |
| Documentação pública de API para terceiros | OpenAPI / portal de docs |
| Discovery de domínio ou design da API | [`agent-spec-sdd-generate-prd`](../sdd/sdd-generate-prd.md), [`agent-spec-sdd-generate-tech-spec`](../sdd/sdd-generate-tech-spec.md), [`agent-spec-minispec-generate-scope`](../minispec/minispec-generate-scope.md) |
| Refatoração de backend | [`agent-spec-challenge-spec`](challenge-spec.md) ou Tech Review |
| Frontend com regra de negócio rica que precisa de PRD próprio | Spec de produto |

---

## Entrada

### Obrigatória — pelo menos UM artefato de spec

| Artefato | Quando usar |
| --- | --- |
| `tech_spec.md` (SDD) | Feature com ciclo completo: PRD → tech_spec → tasks |
| `scope.md` (miniSpec) | Feature menor: intent → scope → tasks |
| TaskCard (`task-{nn}-{slug}.md`) | Escopo cirúrgico: uma task isolada com contrato de integração |

> **Por quê obrigatório**: sem âncora de spec, o handoff seria extração crua do código atual sem distinguir intenção, legado e adição. A spec é o ponto de vista canônico do que o frontend **deve** consumir; código é confirmação.
>
> **Erro de entrada**: skill **para e pede** o artefato se nenhum for fornecido. Não degrada silenciosamente.

### Complementares (opcionais, enriquecem)

| Tipo | Exemplos |
| --- | --- |
| Contrato formal | `openapi.yaml`, `schema.graphql`, `service.proto` |
| Código backend | `src/`, `internal/`, `routes.go`, `OrderController.java` |
| Migrations / queries | `*.sql`, ORM models, schema definitions |
| Testes backend | `*_test.*`, `*.spec.*` — forte fonte de edge cases e fixtures |
| ADRs | `/docs/adr/INDEX.md` — quando a spec referencia ADRs |

### Prioridade de evidência quando fontes conflitam

1. **Contrato formal** (OpenAPI/GraphQL/protobuf) — declaração explícita de API.
2. **Código** (handlers/controllers/resolvers) — verdade de runtime.
3. **Testes** — comportamento exercitado.
4. **Spec** (tech_spec/scope/taskcard) — intenção declarada (âncora obrigatória).
5. **PRD** — intenção de produto (contexto, não contrato).

---

## Outputs

| Origem | Path do output |
| --- | --- |
| SDD: `tech_spec.md` ou diretório `{feature}/{version}/` | `/docs/specs/features/{feature}/{version}/handoff-frontend.md` |
| miniSpec: `scope.md` ou diretório `{feature}/{version}/` | `/docs/specs/features/{feature}/{version}/handoff-frontend.md` |
| TaskCard: `task-{nn}-{slug}.md` | mesma pasta do TaskCard, nome `handoff-frontend.md` |
| Entrada genérica | `./handoff-frontend.md` no diretório atual, ou path explícito do usuário |

> **NUNCA** sobrescreve sem confirmação. Se o arquivo já existe, lê primeiro, identifica o que mudou e propõe um diff antes de gravar.

---

## Fluxo de execução

### FASE 0 — Detecção e validação de entrada

* Valida artefato de spec obrigatório (aborta com pedido explícito se ausente).
* Carrega artefato completo (input primário).
* Resolve `{feature}` e `{version}` e carrega contexto adicional: `prd.md`/`intent.md`, ADRs citadas, e **glossário de domínio (2 níveis)** — global em `/docs/specs/domain-glossary.md` + feature em `/docs/specs/features/{feature}/domain-glossary.md`. Em conflito entre os dois, feature sobrescreve global (raro; sinaliza).
* Carrega fontes complementares (contrato formal, código, testes).
* Lista operações no escopo derivadas da spec. Confirma com usuário **apenas se escopo for ambíguo**.

### FASE 1 — Descoberta de contratos

Para cada operação no escopo, descobre:

* Tipo de transporte (REST / GraphQL / RPC / WebSocket / Event / Local SDK).
* Método e path (ou nome da operação).
* DTO de entrada (body, query, path params, headers).
* DTO de saída (success, paginação, envelope).
* Erros possíveis (status codes, error codes, payloads).
* Autenticação (obrigatória? token type? scopes?).
* Permissões (roles, scopes, ownership, tenant).
* Side effects observáveis (eventos, jobs, cache invalidado).
* Idempotência e cache (TTL? invalidação?).

Usa o guia [`references/contract-discovery.md`](https://github.com/) da skill (padrões por linguagem/framework). Itens não confirmáveis → `[DÚVIDA]`.

### FASE 2 — Mapeamento de erros

Para cada operação, mapeia erros para comportamentos frontend. Cada entrada tem:

* Como o backend sinaliza (status code + error code/shape).
* O que o frontend deve fazer (estado de UI, mensagem, retry, invalidação).

### FASE 3 — Auth e permissões

Extrai:

* Quem pode chamar cada operação.
* O que acontece quando não pode (401? 403? redirect?).
* Dados de retorno que dependem do usuário autenticado (filtros implícitos por tenant/owner).

### FASE 4 — Estados de UI

Para cada operação, declara quais estados o frontend **precisa** tratar. Estados canônicos:

`loading`, `success`, `empty`, `validation_error`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `rate_limited`, `unexpected_error`.

Inclui apenas estados aplicáveis. Não infla.

### FASE 5 — Fixtures

Para cada operação relevante, gera fixtures mínimas. Padrão JSON portável por default; outros formatos (YAML, Dart Map, Kotlin object) só se o projeto frontend já os usar.

### FASE 6 — Critérios de aceite e testes mínimos

Lista critérios objetivos do ponto de vista do frontend (não copia CA do PRD — converte em condições verificáveis na UI/integração). Lista testes mínimos esperados (ex.: "renderiza estado vazio quando API retorna lista vazia").

### FASE 7 — Montagem do handoff

Usa template canônico (em `references/handoff-template.md`). Seções vazias são **deletadas**, não deixadas com placeholders.

### FASE 8 — Auto-revisão

Checklist de qualidade (em `references/review-checklist.md`). Corrige antes de salvar.

### FASE 9 — Persistência

* Resolve path do output.
* Se arquivo existe, lê e propõe diff em vez de sobrescrever.
* Grava.
* Lista no chat: path + N operações + N `[DÚVIDA]` pendentes + N fixtures geradas.

---

## Formato de saída

Um único arquivo markdown. Características obrigatórias:

| Característica | Regra |
| --- | --- |
| **Curto** | 1-3 páginas por operação. Se passar, fragmenta em múltiplos handoffs por escopo |
| **Tabular onde couber** | Errors, permissões e estados são tabelas — não parágrafos |
| **Snippets, não prosa** | Payloads em blocos de código, não descritos em texto corrido |
| **Rastreabilidade** | Cada afirmação não óbvia tem referência inline ao arquivo/linha do backend ou contrato formal (`<!-- fonte: src/handlers/orders.go:142 -->`) |
| **Marcas explícitas** | `[DÚVIDA]` (precisa ser respondido antes do frontend implementar) ou `[HIPÓTESE]` (inferência razoável mas não confirmada — pode prosseguir validando) |

### Regras de concisão

* Sem introdução, conclusão, agradecimento, contexto histórico.
* Sem "Este documento descreve..." — o título já descreve.
* Sem repetir o PRD/tech_spec — referencia e cita só o necessário.
* Sem listar arquivos do backend "porque é interessante" — só os que o frontend precisaria abrir.
* Sem código de exemplo para frontend (skill não impõe framework) — só payloads e contratos.

---

## Critérios de qualidade (aprovação)

| # | Critério |
| --- | --- |
| 1 | Cada contrato tem request, response e erros — sem buracos |
| 2 | Cada operação tem permissão e auth explicitadas (mesmo que seja "auth: nenhuma; permissão: pública") |
| 3 | Erros estão mapeados para comportamento de UI — não apenas listados |
| 4 | Há pelo menos uma fixture por operação que altera estado (POST/PUT/PATCH/DELETE), e pelo menos uma para listagens com paginação |
| 5 | `[DÚVIDA]` e `[HIPÓTESE]` estão explícitas quando não há evidência — nenhuma especulação silenciosa |
| 6 | Toda afirmação tem origem rastreável — código, contrato, teste ou spec |
| 7 | Outro agente consegue implementar a integração lendo só o handoff — sem precisar abrir o backend |

---

## Integração com PRD, tech_spec, TaskCard e ADR

A skill **lê** esses artefatos quando existem, mas **não os reescreve**:

* **PRD / `intent.md`**: usado para entender intenção de produto e nomear a feature. Não copia texto — referencia com link relativo.
* **`tech_spec.md` / `scope.md`**: fonte das decisões técnicas (transporte, autenticação, estrutura de dados). O handoff é **derivado** delas — em conflito entre spec e código, marca `[DÚVIDA]` e sinaliza.
* **TaskCard (`task-{nn}-{slug}.md`)**: define escopo cirúrgico. O handoff cobre apenas as operações que entram na TaskCard, não a API inteira.
* **ADR**: se uma ADR define padrão transversal (ex.: ADR-0007 manda erros em `application/problem+json`), o handoff reflete o padrão e cita a ADR por ID.
* **Glossário de domínio (2 níveis)**: usa terminologia canônica nos nomes de entidades, operações e campos. Em divergência entre identificador literal do código e termo canônico, prefere o canônico nos textos descritivos mas mantém o nome literal nos trechos de payload.

Sem nenhum desses artefatos, a skill degrada para "extrair contrato do código + contrato formal", marcando ausência de intenção declarada como `[HIPÓTESE]` onde for relevante.

---

## Regras críticas (inferência)

* **Nunca afirma comportamento sem evidência rastreável.** Se inferir, marca `[HIPÓTESE]`. Se for crítico, `[DÚVIDA]`.
* **Nunca inventa**:
  + Regras de negócio que não estão em código, teste ou spec.
  + Estados de UI que o backend não suporta (ex.: não inventa paginação se API retorna lista crua).
  + Esquema de autenticação (sem middleware/guard → "sem auth detectada" como `[DÚVIDA]`).
  + Payloads (campos, tipos, formato de data).
  + Permissões (não supõe RBAC — extrai do código ou marca `[DÚVIDA]`).
  + Side effects (não supõe que cria evento ou job — verifica).
* **Auditabilidade**: cada bloco de contrato é reconstruível a partir das fontes citadas. Se um revisor abrir o arquivo/linha referenciado e não vir o que o handoff afirma, o handoff está errado.

---

## Comando

```bash
/agent-spec-backend-contract-handoff <tech_spec.md | scope.md | task-{nn}-{slug}.md> [+ backend dir/contrato formal opcional]
```

### Exemplos

```bash
# A partir de um SDD tech_spec:
/agent-spec-backend-contract-handoff docs/specs/features/pedidos/v1/tech_spec.md

# A partir de uma TaskCard com path adicional do backend:
/agent-spec-backend-contract-handoff docs/specs/features/avaliacao/v1/tasks/task-01-criar-avaliacao.md internal/api/handlers/avaliacao/

# A partir de scope miniSpec + contrato formal:
/agent-spec-backend-contract-handoff docs/specs/features/notificacoes/v1/scope.md openapi.yaml
```

---

## Skills relacionadas

* [`agent-spec-sdd-generate-tech-spec`](../sdd/sdd-generate-tech-spec.md) — gera o tech_spec consumido por esta skill.
* [`agent-spec-minispec-generate-scope`](../minispec/minispec-generate-scope.md) — gera o scope consumido por esta skill.
* [`agent-spec-taskcard-generate`](../taskcard/taskcard-generate.md) — gera taskcard consumida por esta skill.
* [`agent-spec-challenge-spec`](challenge-spec.md) — stress-test da spec antes do handoff.
* [`agent-spec-adr-show`](../adr/adr-show.md) — consulta ADRs referenciadas pela spec.

---

## Configuração via framework-paths.md

Paths resolvidos via:

* `sdd.tech_spec.path` — `tech_spec.md` (SDD).
* `minispec.scope.path` — `scope.md` (miniSpec).
* `taskcard.tasks.dir` — taskcards.
* `domain_glossary.global.path` + `domain_glossary.feature.path` — glossário de domínio (2 níveis).
* `adr.index.path` — `docs/adr/INDEX.md`.

---

## Próximos passos

* Veja [Skills — Visão Geral](../overview.md) para contexto do framework.
* Veja [Glossário de Domínio](../../concepts/overview.md) (precedência global vs feature).
* Para gerar/validar contratos antes do handoff: [`agent-spec-challenge-spec`](challenge-spec.md).
