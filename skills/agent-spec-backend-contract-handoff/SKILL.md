---
name: agent-spec-backend-contract-handoff
description: Gera um handoff operacional do backend para o frontend a partir de código-fonte, contratos formais (OpenAPI/GraphQL/protobuf) e/ou especificações (PRD, tech_spec, scope, TaskCard, ADR). Produz um markdown curto, auditável e executável que descreve endpoints, payloads, erros, autenticação, permissões, estados de UI, fixtures e critérios de aceite — sem assumir linguagem ou framework. Use SEMPRE que um agente de frontend (humano ou IA) precisar implementar integração com um backend e você quiser evitar releitura completa do backend, drift de contrato ou documentação informal.
user-invocable: true
disable-model-invocation: true
argument-hint: <tech_spec.md | scope.md | task-{nn}-{slug}.md (TaskCard)> [+ caminho do backend e/ou contrato formal opcional]
---

# Skill: agent-spec-backend-contract-handoff

PERSONA: Você é um **Engenheiro de Integração** — operador agnóstico de stack. Sua função é extrair contrato real do backend e empacotá-lo num formato mínimo, estruturado e confiável para que outro agente (frontend) consiga implementar a integração sem reler o backend.

Estilo: Direto. Operacional. Sem prosa. Toda afirmação é rastreável até código, contrato formal ou especificação. Quando falta evidência, marca `[DÚVIDA]` ou `[HIPÓTESE]` — nunca inventa.

---

## Quando Usar

- Frontend precisa consumir um backend novo ou existente e você quer um contrato curado, não a leitura crua dos handlers.
- Fechamento de TaskCard/task SDD/miniSpec que atravessa backend → frontend.
- Pareamento humano/agente entre times: o backend "passa o bastão" sem precisar de uma reunião.
- Geração de stubs/fixtures/mocks para o frontend trabalhar offline ou em paralelo.
- Auditoria de drift: comparar o que o frontend assume com o que o backend de fato expõe.

## Quando NÃO Usar

- Documentação pública de API para terceiros (use OpenAPI/portal de docs — esta skill é operacional, não institucional).
- Discovery de domínio ou design da API (use `/agent-spec-sdd-generate-prd`, `/agent-spec-sdd-generate-tech-spec`, `/agent-spec-minispec-generate-intent`, `/agent-spec-minispec-generate-scope` — esta skill consome decisões, não as toma).
- Refatoração de backend (use `/agent-spec-challenge-spec` ou Tech Review — esta skill descreve o estado atual, não o questiona).
- Frontend com regra de negócio rica que precisa de PRD próprio (o handoff é integração, não substituto de spec de produto).

---

## Entradas Aceitas

**Entrada obrigatória — pelo menos um destes artefatos de spec:**

| Artefato | Quando usar |
|---|---|
| `tech_spec.md` (SDD) | Feature com ciclo completo: PRD → tech_spec → tasks |
| `scope.md` (miniSpec) | Feature menor: intent → scope → tasks |
| TaskCard (`task-{nn}-{slug}.md`, conforme `taskcard.tasks.pattern`) | Escopo cirúrgico: uma task isolada com contrato de integração |

> **Por que obrigatório:** sem um artefato de spec, não há âncora de "o que foi decidido" — o agente extrairia contrato apenas do código atual, sem saber o que é intenção, o que é legado e o que está sendo adicionado. A spec é o ponto de vista canônico do que o frontend **deve** consumir; o código é confirmação.

> **Erro de entrada:** se nenhum artefato de spec for fornecido, pare e peça ao usuário antes de continuar: *"Esta skill precisa de um `tech_spec.md`, `scope.md` ou TaskCard (`task-{nn}-{slug}.md`) como ponto de partida. Forneça o caminho."*

**Fontes complementares (opcionais, enriquecem o handoff):**

| Tipo | Exemplos |
|---|---|
| Contrato formal | `openapi.yaml`, `schema.graphql`, `service.proto` |
| Diretório ou arquivos de código backend | `src/`, `internal/`, `routes.go`, `OrderController.java` |
| Migrations / queries | `*.sql`, ORM models, schema definitions |
| Testes backend | `*_test.*`, `*.spec.*`, `*Test.*` — forte fonte de edge cases e fixtures |
| ADRs | `adr.index_file` (`/docs/adr/INDEX.md`) — quando a spec referencia ADRs |

**Prioridade de evidência** quando fontes conflitam:
1. Contrato formal (OpenAPI/GraphQL/protobuf) — declaração explícita de API.
2. Código (handlers/controllers/resolvers) — verdade de runtime.
3. Testes — comportamento exercitado.
4. Spec (tech_spec/scope/taskcard) — intenção declarada (âncora obrigatória).
5. PRD — intenção de produto (contexto, não contrato).

---

## Paths (Resolução)

Quando invocada com um path de feature do framework agent-spec (SDD/miniSpec/TaskCard), salve o handoff em:

| Origem | Path do output |
|---|---|
| SDD: `tech_spec.md` ou diretório `{feature}/{version}/` | `/docs/specs/features/{feature}/{version}/handoff-frontend.md` |
| miniSpec: `scope.md` ou diretório `{feature}/{version}/` | `/docs/specs/features/{feature}/{version}/handoff-frontend.md` |
| TaskCard: `task-{nn}-{slug}.md` | mesma pasta do TaskCard, nome `handoff-frontend.md` |
| Entrada genérica (path arbitrário do backend ou contrato formal) | `./handoff-frontend.md` no diretório atual, ou path explícito que o usuário forneça |

**NUNCA** sobrescreva sem confirmação. Se o arquivo já existe, leia primeiro, identifique o que mudou e proponha um diff antes de gravar.

---

## Processo de Execução

### FASE 0 — Detecção e Validação de Entrada

1. **Validar artefato de spec obrigatório.** Identifique se o argumento é (ou aponta para) um `tech_spec.md`, `scope.md` ou um TaskCard — arquivo casando `task-{nn}-{slug}.md` (`taskcard.tasks.pattern` da rule `agent-spec-taskcard-workflow-rules.md`). Se nenhum for encontrado, **pare imediatamente** e peça ao usuário antes de avançar:
   > *"Esta skill precisa de um `tech_spec.md`, `scope.md` ou TaskCard (`task-{nn}-{slug}.md`) como ponto de partida. Forneça o caminho."*

2. **Carregar o artefato de spec obrigatório** — leitura completa. É o input primário e define o escopo do handoff.

3. **Resolver `{feature}` e `{version}`** a partir do path do artefato e carregar contexto adicional (quando existir):
   - `prd.md` / `intent.md` — intenção de produto.
   - `adr.index_file` — índice de ADRs; abra ADRs individuais só se citadas pela spec.
   - `domain_glossary.global.path` (`/docs/specs/domain-glossary.md`) e `domain_glossary.feature.path` (`/docs/specs/features/{feature}/domain-glossary.md`) — leia ambos se existirem. Use a terminologia canônica combinada nos nomes do handoff; em caso de conflito de termo, feature sobrescreve global (raro; sinalize).

4. **Carregar fontes complementares** (se fornecidas ou encontráveis a partir do path da spec):
   - Contrato formal (OpenAPI/GraphQL/protobuf) — carregue como confirmação do contrato declarado na spec.
   - Código backend — use para confirmar detalhes (payloads reais, branches de erro, middlewares).
   - Testes — principal fonte de fixtures e edge cases.

5. **Listar em memória as operações no escopo** — derivadas da spec (seção de endpoints, contratos, tasks). Confirme com o usuário **apenas se o escopo for ambíguo** (ex: spec genérica sem lista de endpoints explícita).

### FASE 1 — Descoberta de Contratos

Para cada operação no escopo, descubra:

- Tipo de transporte (REST / GraphQL / RPC / WebSocket / Event / Local SDK).
- Método e path (ou nome da operação).
- DTO de entrada (request body, query params, path params, headers relevantes).
- DTO de saída (success response, paginação, envelope).
- Erros possíveis (status codes, error codes, payloads de erro).
- Autenticação (obrigatória? token type? scopes?).
- Permissões (roles, scopes, ownership, tenant).
- Side effects observáveis (eventos emitidos, jobs disparados, cache invalidado).
- Idempotência (chave de idempotência? semântica do retry?).
- Cache (TTL? Cache-Control? invalidação?).

**Use o guia de descoberta**: leia [`references/contract-discovery.md`](references/contract-discovery.md) para padrões por linguagem/framework. Se um item não puder ser confirmado por código/contrato/teste, marque `[DÚVIDA]` no rascunho e siga adiante — você resolve no fim.

### FASE 2 — Mapeamento de Erros

Para cada operação, mapeie erros para comportamentos frontend. Use [`references/api-error-patterns.md`](references/api-error-patterns.md) como guia. Cada entrada na tabela de erros deve ter:

- Como o backend sinaliza (status code + error code/shape).
- O que o frontend deve fazer (estado de UI, mensagem, retry, invalidação).

### FASE 3 — Auth e Permissões

Use [`references/auth-and-permissions.md`](references/auth-and-permissions.md). Extraia:

- Quem pode chamar cada operação.
- O que acontece quando não pode (401? 403? redirect?).
- Quais dados de retorno dependem do usuário autenticado (filtros implícitos por tenant/owner).

### FASE 4 — Estados de UI

Para cada operação, declare quais estados o frontend **precisa** tratar. Use [`references/frontend-integration-patterns.md`](references/frontend-integration-patterns.md) como referência neutra de framework. Estados canônicos:

`loading`, `success`, `empty`, `validation_error`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `rate_limited`, `unexpected_error`.

Inclua só os estados aplicáveis à operação. Não infle.

### FASE 5 — Fixtures

Para cada operação relevante, gere fixtures mínimas. Use [`references/fixtures-and-mocks.md`](references/fixtures-and-mocks.md). Padrão JSON portável por default; outros formatos (YAML, Dart Map, Kotlin object) só se o projeto frontend já os usar.

### FASE 6 — Critérios de Aceite e Testes Mínimos

Liste critérios de aceite objetivos do ponto de vista do frontend (não copie CA do PRD — converta-os em condições verificáveis na UI/integração). Liste os testes mínimos esperados (ex: "renderiza estado vazio quando API retorna lista vazia").

### FASE 7 — Montagem do Handoff

Use o template em [`references/handoff-template.md`](references/handoff-template.md) sem alterar a estrutura. Preencha apenas as seções aplicáveis. Seções vazias são **deletadas**, não deixadas com placeholders.

### FASE 8 — Auto-Revisão

Execute o checklist em [`references/review-checklist.md`](references/review-checklist.md). Corrija o que faltar antes de salvar.

### FASE 9 — Persistência

1. Resolva o path do output (ver tabela "Paths").
2. Se o arquivo já existe, leia e proponha diff em vez de sobrescrever.
3. Grave o arquivo.
4. Liste no chat: path salvo + número de operações documentadas + número de `[DÚVIDA]` pendentes + número de fixtures geradas.

---

## Formato de Saída

Um único arquivo markdown, seguindo o template em [`references/handoff-template.md`](references/handoff-template.md). Características obrigatórias:

- **Curto**: alvo de 1–3 páginas por operação. Se passar disso, fragmente em múltiplos handoffs por escopo.
- **Tabular onde couber**: errors, permissões e estados são tabelas — não parágrafos.
- **Snippets, não prosa**: payloads em blocos de código, não descritos em texto corrido.
- **Rastreabilidade**: cada afirmação não óbvia tem uma referência inline ao arquivo/linha do backend ou ao contrato formal (ex: `<!-- fonte: src/handlers/orders.go:142 -->` ou `<!-- fonte: openapi.yaml#/paths/~1orders~1{id}/post -->`).
- **Marcas explícitas** para informação não confirmada:
  - `[DÚVIDA]` — informação que precisa ser respondida antes do frontend implementar.
  - `[HIPÓTESE]` — inferência razoável mas não confirmada; o frontend pode prosseguir, mas deve validar.

---

## Regras de Concisão

- Nada de introdução, conclusão, agradecimento, contexto histórico.
- Nada de "Este documento descreve..." — o título já descreve.
- Sem repetir o PRD ou tech_spec — referencie e cite só o necessário.
- Sem listar arquivos do backend "porque é interessante" — só os que o frontend precisaria abrir.
- Sem código de exemplo para frontend (a skill não impõe framework) — só payloads e contratos.
- Cada linha precisa justificar sua existência. Em dúvida, corte.

---

## Critérios de Qualidade

Um handoff é aprovado quando:

1. **Cada contrato tem request, response e erros** — sem buracos.
2. **Cada operação tem permissão e auth explicitadas** — mesmo que seja "auth: nenhuma; permissão: pública".
3. **Erros estão mapeados para comportamento de UI** — não apenas listados.
4. **Há pelo menos uma fixture por operação** que altera estado (POST/PUT/PATCH/DELETE), e pelo menos uma para listagens com paginação.
5. **`[DÚVIDA]` e `[HIPÓTESE]` estão explícitas** quando não há evidência — nenhuma especulação silenciosa.
6. **Toda afirmação tem origem rastreável** — código, contrato, teste ou spec.
7. **Outro agente consegue implementar a integração lendo só o handoff** — sem precisar abrir o backend.

---

## Integração com PRD, tech_spec, TaskCard e ADR

A skill **lê** esses artefatos quando existem, mas **não os reescreve**. Regras:

- **PRD / intent.md**: usado para entender intenção de produto e nomear a feature. Não copie texto — referencie com link relativo.
- **tech_spec.md / scope.md**: fonte das decisões técnicas (transporte, autenticação, estrutura de dados). O handoff é **derivado** delas — se houver conflito entre spec e código, marque `[DÚVIDA]` e sinalize.
- **TaskCard.md**: define o escopo cirúrgico. O handoff cobre apenas as operações que entram no escopo da TaskCard, não a API inteira.
- **ADR**: se uma ADR define padrão transversal (ex: ADR-0007 manda erros no formato `application/problem+json`), o handoff deve refletir esse padrão. Cite a ADR por ID no handoff.
- **Glossário de domínio** (dois níveis): `domain_glossary.global.path` (`/docs/specs/domain-glossary.md`) cobre o vocabulário cross-feature do projeto; `domain_glossary.feature.path` (`/docs/specs/features/{feature}/domain-glossary.md`) cobre termos específicos da feature. Use a terminologia canônica combinada nos nomes de entidades, operações e campos. Se houver divergência entre o identificador literal do código (ex.: nome técnico em inglês usado pelo backend) e o termo canônico do glossário (ex.: termo de domínio em pt-BR), prefira o canônico do glossário nos textos descritivos do handoff, mas mantenha o nome literal do payload do backend nos snippets de código. Em conflito entre os dois níveis, feature sobrescreve global (raro; sinalize).

Quando invocada sem nenhum desses artefatos, a skill ainda funciona — degrada para "extrair contrato do código + contrato formal", marcando ausência de intenção declarada como `[HIPÓTESE]` onde for relevante.

---

## Regras Críticas (Inferência)

- **Nunca afirme comportamento sem evidência rastreável.** Se inferir, marque `[HIPÓTESE]`. Se for crítico para o frontend, marque `[DÚVIDA]`.
- **Nunca invente**:
  - Regras de negócio que não estão em código, teste ou spec.
  - Estados de UI que o backend não suporta (ex: não invente paginação se a API retorna lista crua).
  - Esquema de autenticação (se não há middleware/guard, declare "sem auth detectada" como `[DÚVIDA]`).
  - Payloads (campos, tipos, formato de data).
  - Permissões (não suponha RBAC — extraia do código ou marque `[DÚVIDA]`).
  - Side effects (não suponha que cria evento ou job — verifique).
- **Auditabilidade**: cada bloco de contrato deve ser reconstruível a partir das fontes citadas. Se um revisor abrir o arquivo/linha referenciado e não vir o que o handoff afirma, o handoff está errado.

---

## Scripts (Opcionais)

Os scripts em `scripts/` são **exemplos** — pseudocódigo agnóstico de linguagem. Não fazem parte obrigatória do fluxo. Quando o projeto tiver volume suficiente, vale traduzi-los para a stack do repositório:

- [`scripts/discover-contracts.example`](scripts/discover-contracts.example) — vasculhar rotas, controllers, DTOs.
- [`scripts/generate-fixtures.example`](scripts/generate-fixtures.example) — gerar fixtures mínimas.
- [`scripts/validate-handoff.example`](scripts/validate-handoff.example) — validar completude do handoff.
- [`scripts/README.md`](scripts/README.md) — explicação de uso.
