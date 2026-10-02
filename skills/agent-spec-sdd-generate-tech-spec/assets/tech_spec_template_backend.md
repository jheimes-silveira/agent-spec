# TECH_SPEC -- Especificação Técnica (Backend)

## 1. Identificação
- **Feature/Projeto**:
- **Variante**: backend
- **Stack**: Go | Node | Python | Java | .NET | Rust | Outro
- **Autor**:
- **Data**:
- **Versão**:
- **Status**: Draft | Refinando | Aprovado
- **PRD Relacionado**:

---

## 2. Resumo Técnico da Solução

(Visão geral do COMO será implementado. Descreva em 3-5 linhas a abordagem técnica, decisões arquiteturais, integrações relevantes e o resultado técnico esperado.)

---

## 3. Arquitetura da Solução

### 3.1 Visão Geral
(Diagrama ou descrição da arquitetura: handlers, services, repositories, jobs, workers, mensageria. Como componentes se conectam.)

### 3.2 Componentes / Módulos

| Componente | Responsabilidade | Camada |
|------------|------------------|--------|
|            |                  |        |

### 3.3 Camadas e Fronteiras
(Estilo arquitetural: Clean / Hexagonal / Layered / DDD. Direção das dependências, fronteiras de domínio.)

### 3.4 Visão em Árvore

<!-- LLM-ONLY: Gere uma árvore ASCII completa de TODOS os arquivos listados nas seções 3.5–3.7.
  Legenda obrigatória ao final: [N] = Novo  [M] = Modificado  [R] = Referência (somente leitura)
  Use os caracteres: ├── └── │ (não use + ou -)
  Agrupe por diretório.

  Legenda: [N] Novo  [M] Modificado  [R] Referência
-->

```
(treeview gerado pelo LLM aqui)
```

Legenda: `[N]` Novo &nbsp; `[M]` Modificado &nbsp; `[R]` Referência

### 3.5 Arquivos a Criar

| Arquivo | Descrição | Camada |
|---------|-----------|--------|
|         |           |        |

### 3.6 Arquivos a Modificar

| Arquivo | Modificação | Motivo |
|---------|-------------|--------|
|         |             |        |

### 3.7 Arquivos de Referência (somente leitura)

| Arquivo | Motivo da Consulta |
|---------|--------------------|
|         |                    |

<!-- LLM-ONLY: Esta secao economiza tokens e scans durante a implementacao. -->

---

## 4. Contratos de API

### 4.1 Endpoints Expostos

| Ação | Método | Rota | Payload | Resposta | Status Codes | Auth |
|------|--------|------|---------|----------|--------------|------|
|      |        |      |         |          |              |      |

### 4.1.1 Exemplo de Payload por Endpoint (OBRIGATÓRIO para verbos com payload parcial)

> Para cada endpoint que aceita **atualização parcial** (`PUT`/`PATCH` cujo critério de aceite diga "campos opcionais", "qualquer campo pode estar ausente", "multipart parcial"), você DEVE registrar:
>
> 1. Exemplo de body/form **mínimo** (só com o campo mais comumente atualizado isoladamente).
> 2. Observação literal: "campos ausentes são ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request struct — apenas o ID na URL é obrigatório".
> 3. Diferenciar do verbo `POST` correspondente — no `POST` os campos continuam obrigatórios; no `PUT`/`PATCH` parcial, **não**.

Exemplo (preencher com payload real):

```
PUT /<recurso>/v1/:id  (multipart parcial)

Caso A — atualiza só o nome:
  Content-Type: multipart/form-data
  nome=Novo Nome

Caso B — substitui só o anexo:
  Content-Type: multipart/form-data
  anexo=@arquivo.pdf

Regra: campos não enviados permanecem inalterados. Request struct: SEM binding/required.
```

> **Por que obrigatório**: o post-mortem `cadastro-pratos-franquia` (T9) gastou rodada extra porque o executor copiou `binding:"required"` do `POST` para o `PUT` e o QA não pegou (CT-010 dizia "só com nome" mas enviava 2 campos). Payload-exemplo explícito + observação anti-required no Request elimina a ambiguidade.

### 4.2 Schemas / DTOs

| Schema | Origem (proto/openapi/jsonschema) | Campos principais | Versão |
|--------|-----------------------------------|-------------------|--------|
|        |                                   |                   |        |

### 4.3 Eventos Publicados / Consumidos (se aplicável)

| Evento | Tipo (pub/sub) | Tópico / Fila | Payload | Schema |
|--------|----------------|---------------|---------|--------|
|        |                |               |         |        |

---

## 5. Fluxos de Negócio

### 5.1 Fluxo Principal

(Sequência de chamadas, processamento e respostas. Descreva camada por camada: handler → service → repository → response.)

### 5.2 Fluxos Alternativos

(Variações: dados opcionais, caminhos condicionais, side-effects condicionais.)

### 5.3 Mapeamento de User Stories → Fluxos

<!-- LLM-ONLY: Semantica DISTINTA da secao 17: aqui cada US aponta para o FLUXO/ENDPOINT que a realiza (visao dinamica). A secao 17 consolida US -> definicao tecnica completa (componentes, modelos, banco). Preencher AMBAS — nao consolidar. -->

| User Story (PRD) | Fluxo / Endpoint | Componentes Envolvidos |
|------------------|------------------|------------------------|
| US-01            |                  |                        |
| US-02            |                  |                        |

<!-- LLM-ONLY: Cada user story do PRD deve ter pelo menos uma definicao tecnica correspondente. -->

---

## 6. Regras de Processamento

### 6.1 Validações de Input

| Regra | Onde Aplica | Comportamento em Falha |
|-------|-------------|------------------------|
|       |             |                        |

### 6.2 Transformações de Dados

(Normalizações, mappings entre DTO ↔ entidade, enriquecimento.)

### 6.3 Regras de Domínio

<!-- LLM-ONLY: A coluna "RN do PRD" rastreia a origem (secao 6 do PRD, numeracao RN-XX). Regras tecnicas sem origem no PRD usam "—". -->

| Regra | RN do PRD | Descrição | Erro de Domínio Associado |
|-------|-----------|-----------|---------------------------|
| RN-01 | RN-01     |           |                           |

---

## 7. Persistência de Dados

### 7.1 Banco de Dados Principal
(Tipo: relacional / documento / chave-valor / time-series. Tecnologia escolhida.)

### 7.2 Tabelas / Coleções

| Nome | Colunas / Campos | Tipos | Constraints | Índices |
|------|------------------|-------|-------------|---------|
|      |                  |       |             |         |

### 7.3 Migrações

| Versão | Arquivo | Operação |
|--------|---------|----------|
|        |         | up/down  |

### 7.4 Estratégia de Transação e Consistência
(ACID, isolation level, optimistic vs pessimistic locking, idempotência.)

### 7.5 Política de Retenção / Archival
(TTL, soft delete, particionamento, snapshots.)

---

## 8. Integração com APIs Externas

| Serviço Externo | Tipo (REST/gRPC/SDK) | Auth | Timeouts | Retry |
|-----------------|----------------------|------|----------|-------|
|                 |                      |      |          |       |

(Cliente HTTP usado, circuit breaker, fallback quando indisponível.)

---

## 9. Sincronização de Dados

### 9.1 Eventos / Filas

| Tópico / Fila | Produtor | Consumidor | Garantia (at-least/exactly/at-most-once) |
|---------------|----------|------------|------------------------------------------|
|               |          |            |                                          |

### 9.2 Idempotência
(Chaves de idempotência, dedupe, replay de eventos.)

### 9.3 Outbox / Saga (se aplicável)
(Padrão de consistência distribuída adotado.)

---

## 10. Gerenciamento de Erros

### 10.1 Mapeamento Erro de Negócio → HTTP Status

| Erro | Código | Mensagem | Camada de Origem |
|------|--------|----------|------------------|
|      |        |          |                  |

### 10.2 Resiliência
(Retry com backoff, timeout, circuit breaker, bulkhead, graceful degradation.)

### 10.3 Estratégia de Logging de Erros
(Onde logar, nível, dados sensíveis omitidos.)

---

## 11. Segurança

### 11.1 Autenticação
(JWT, OAuth2, mTLS, sessions. Onde valida — middleware/guard.)

### 11.2 Autorização
(RBAC, ABAC, policies. Onde aplica — handler/service.)

### 11.3 Criptografia
(TLS, dados em repouso, KMS, hashing de senhas.)

### 11.4 Sanitização e Validação
(SQL injection, command injection, prevenção de SSRF, validação de schema.)

### 11.5 Rate Limiting / Anti-abuse
(Por IP, por usuário, por endpoint. Solução adotada.)

### 11.6 Secrets Management
(Onde armazenar, como ler em runtime.)

---

## 12. Performance

### 12.1 Metas
- Latência p95: 
- Latência p99: 
- Throughput esperado: 

### 12.2 Estratégias
(Índices, paginação, cache (Redis/Memcached), connection pooling, query optimization, batch processing.)

### 12.3 Limites Conhecidos
(Gargalos esperados, capacidade do banco, limites de SLA externos.)

---

## 13. Logs e Observabilidade

### 13.1 Logs Estruturados

| Evento | Nível | Campos Chave | Sensibilidade |
|--------|-------|--------------|---------------|
|        | info/warn/error | requestId, userId, ... | mascarar PII |

(Padrão JSON, formato, biblioteca utilizada.)

### 13.2 Métricas

| Métrica | Tipo (counter/gauge/histogram) | Labels | SLO Alvo |
|---------|--------------------------------|--------|----------|
|         |                                |        |          |

(Solução: Prometheus, OTel, Datadog.)

### 13.3 Tracing

(Distributed tracing, propagação de contexto, spans relevantes.)

### 13.4 Alertas

| Alerta | Condição | Severidade | Destino |
|--------|----------|------------|---------|
|        |          |            |         |

---

## 14. Feature Flags

### 14.1 Solução
(LaunchDarkly, Unleash, GrowthBook, custom.)

### 14.2 Flags Envolvidas

| Flag | Propósito | Escopo (global / tenant / usuário) | Default |
|------|-----------|------------------------------------|---------|
|      |           |                                    |         |

---

## 15. Versionamento de API

### 15.1 Estratégia
(URL path, header, accept content-type, query param. Justificativa.)

### 15.2 Compatibilidade
(Política de breaking changes, janela de descontinuação, suporte a versões antigas.)

### 15.3 Schemas / Contratos
(Versionamento de proto/openapi/avro. Registry, validação CI.)

---

## 16. Deploy e Infraestrutura

### 16.1 Pipeline
(CI/CD, etapas, gates de aprovação, ambiente de staging.)

### 16.2 Empacotamento
(Container, runtime, base image, dependências.)

### 16.3 Infraestrutura como Código
(Terraform, Pulumi, Helm. Recursos provisionados.)

### 16.4 Estratégia de Rollout
(Blue-green, canary, rolling, feature flag gating.)

### 16.5 Escalabilidade
(Horizontal vs vertical, autoscaling, limites.)

### 16.6 Rollback
(Estratégia de rollback automático, condição de trigger.)

---

## 17. Mapeamento de User Stories para Definições Técnicas

| User Story (PRD) | Definição Técnica | Componentes Envolvidos |
|------------------|-------------------|------------------------|
| US-01            |                   |                        |
| US-02            |                   |                        |

<!-- LLM-ONLY: Semantica DISTINTA da secao 5.3: aqui cada US aponta para a DEFINICAO TECNICA consolidada (componentes, modelos, regras, banco — visao estrutural). A 5.3 mapeia US -> fluxo/endpoint. Preencher AMBAS — nao consolidar; manter referencia cruzada. -->

---

## 18. Dependências Externas

| Tipo | Nome | Versão | Motivo |
|------|------|--------|--------|
| Framework |  |        |        |
| ORM      |   |        |        |
| Cliente HTTP | |       |        |
| Mensageria | |        |         |
| Observabilidade | |   |          |

---

## 19. Estratégia de Testes

> **Resumo**: X casos de teste | Unitários: Y | Integração: Z | E2E: W
> **Padrão**: [framework de teste, padrão de mock, convenção de nomes]

### Rastreabilidade: Critérios de Aceite → Testes

| CA (PRD) | Descrição Resumida | Testes |
|----------|--------------------|--------|
| CA-01    | (descrição curta do CA no PRD) | CT-01, CT-10, CT-20, CT-30 |
| CA-02    | (descrição curta do CA no PRD) | CT-02, CT-22 |

<!-- LLM-ONLY: Cada CA-XX do PRD deve ter pelo menos um teste correspondente. Esta tabela deve ser preenchida PRIMEIRO — guia toda a estrategia. -->

---

### 19.1 Testes Unitários

<!-- LLM-ONLY: Coluna "Objetivo": Descreva em 1 frase O QUE o teste valida e POR QUE importa. -->

#### Service: [NomeService] (`arquivo_test.go`)

Mock: [interfaces mockadas]

<!-- LLM-ONLY: Coluna "Setup (caminho legitimo)" — receita anti-violacao da Iron Law #6: quando o teste depende de precondicao que a producao nao expoe (auth/contexto/relogio/identidade), preencher com o caminho legitimo de montagem (imitar teste analogo -> boundary real -> mecanismo teste-interno nativo da stack) vindo de `precondicao_privilegiada` do JSON do qa-test-generator. Usar `—` quando nao ha precondicao privilegiada. NUNCA exportar/criar simbolo de producao so para teste. -->

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-01 | TestMetodo_Sucesso | CA-01 | Verificar que [comportamento esperado] quando [condição] | dados válidos | resultado esperado | repo retorna dados | — |
| CT-02 | TestMetodo_ErroValidacao | CA-03 | Verificar que [erro específico] é retornado quando [condição inválida] | dados inválidos | ErrEspecifico | — | — |

#### Apresentação: [NomeHandler] (`arquivo_test.go`)

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-10 | TestHandler_Sucesso | CA-01 | Verificar que handler converte [domínio] para [response] corretamente | request válido | response | service ok | — |

### 19.2 Testes de Integração

#### [Handler + Service + DB] (`arquivo_test.go`)

Setup: [banco in-memory ou test container, migrações, fixtures]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-20 | TestIntegracao_CRUD | CA-01 | Verificar que dados persistidos são recuperados via API | POST → GET | response consistente | — |
| CT-22 | TestIntegracao_Unique | CA-02 | Verificar que constraint unique impede duplicação | Insert duplicado | erro 409 | — |

### 19.3 Testes End-to-End (E2E)

#### Fluxo: [Nome do Fluxo Crítico] (CT-30)
- **Framework**: HTTP black-box, RestAssured, supertest, custom client
- **CA**: CA-01, CA-03, CA-06
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida)
- **Pré-condições**: (estado inicial do sistema, fixtures, autenticação)
- **Passos**:
  1. Cliente envia request X
  2. Sistema processa e retorna Y
  3. Verificar estado do banco e logs
- **Validações**: (assertions sobre dados, estado, eventos publicados)

### 19.4 Cenários de Erro

| Cenário | CA | Objetivo | Trigger | Status / Log Esperado |
|---------|----|----------|---------|------------------------|
| Dados duplicados | CA-02 | Verificar que constraint impede operação | Insert duplicado | 409 + log conflito |
| Recurso inexistente | CA-05 | Verificar 404 sem expor internos | ID inválido | 404 + log not found |
| Timeout dependência | CA-06 | Verificar fallback / circuit breaker | mock latência | 503 + log degradação |

---

## 20. Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
|       |               |         |           |

---

## 21. Observações Técnicas

(Decisões importantes, trade-offs, links externos, candidatos a ADR.)

---

## 22. Checklist Final

- [ ] Variante registrada (backend) na seção 1
- [ ] Stack identificada
- [ ] TECH_SPEC cobre todo o PRD (todas as US-XX mapeadas em 17)
- [ ] Resumo técnico claro e objetivo (seção 2)
- [ ] Arquitetura definida com componentes e camadas (seção 3)
- [ ] Contratos de API definidos com payloads, status codes e schemas (seção 4)
- [ ] Fluxos de negócio descritos (seção 5)
- [ ] Regras de processamento e validações (seção 6)
- [ ] Persistência: tabelas, índices, migrações, transação (seção 7)
- [ ] Integrações externas mapeadas (seção 8)
- [ ] Sincronização: eventos, idempotência (seção 9)
- [ ] Gerenciamento de erros e resiliência (seção 10)
- [ ] Segurança: auth, autorização, criptografia, sanitização (seção 11)
- [ ] Performance: metas, estratégias, limites (seção 12)
- [ ] Logs, métricas, tracing e alertas (seção 13)
- [ ] Feature flags listadas (seção 14)
- [ ] Versionamento de API definido (seção 15)
- [ ] Deploy e infraestrutura: pipeline, empacotamento, IaC, rollout (seção 16)
- [ ] Dependências externas listadas (seção 18)
- [ ] Estratégia de testes via `agent-spec-qa-test-generator` integrada (seção 19, com rastreabilidade CA→CT)
- [ ] Riscos técnicos identificados (seção 20)
- [ ] Observações técnicas registradas (seção 21)
- [ ] Arquivos envolvidos listados — árvore + criar/modificar/referência (seções 3.4-3.7)
- [ ] Pronto para geração das TASKS
