---
id: "tech-spec-variants"
title: "Variantes do Tech Spec (SDD)"
sidebar_position: 1
---
# Variantes do Tech Spec (SDD)

`SDD`

A skill [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) suporta **3 variantes de template**, cada uma otimizada para a frente de desenvolvimento correspondente. A variante é escolhida automaticamente (ou confirmada com o usuário) na **FASE 0** da skill.

---

## Como a variante é detectada

**Pré-detecção automática** — antes de qualquer pergunta técnica, a skill lê o `tech-alignment.md` (se existir) buscando sinais inequívocos:

| Sinal buscado | Exemplos |
| --- | --- |
| Campos explícitos | `Frente:`, `Variante:`, `Stack:` |
| Termos de frente | `Flutter`, `React Native`, `iOS`, `Android`, `SwiftUI`, `Jetpack Compose` |
| Termos frontend | `React`, `Vue`, `Angular`, `Svelte`, `Next.js`, `Nuxt` |
| Termos backend | `Go`, `Node.js`, `Python`, `Java`, `.NET`, `Rust`, `gRPC`, `REST API` |

**Fluxo de decisão:**

1. Alta confiança → confirma: *"Detectei pelo tech-alignment que esta TECH SPEC é **Web**. Confirma?"*
2. Sem confiança → pergunta direta: *"Qual é a frente desta TECH SPEC? `Web` | `Mobile` | `Backend`"*

**Persistência:** A variante é gravada em:

* `sdd_state.yaml` (raiz + `steps.tech_spec.variant`)
* Seção 1 (Identificação) do `tech_spec.md`
* Parâmetro `frente` enviado ao [agent-spec-qa-test-generator](../agents/qa-test-generator.md) na FASE 4

---

## Comparativo das 3 variantes

| Aspecto | Web | Mobile | Backend |
| --- | --- | --- | --- |
| **Template** | `tech_spec_template_web.md` | `tech_spec_template_mobile.md` | `tech_spec_template_backend.md` |
| **Seções** | 21 | 22 | 23 |
| **Gestão de estado** | Redux / Zustand / Context / Signals | BLoC / Riverpod / Provider / GetX | N/A |
| **Sincronização** | Cache HTTP / WebSockets | Offline-first (SQLite/Drift/Realm) | Eventos/Filas (Kafka/SQS/RabbitMQ) |
| **Segurança** | XSS/CSRF, tokens no storage | Keychain/Keystore, jailbreak/root detection | JWT/OAuth2, RBAC/ABAC, rate limiting |
| **Performance** | Core Web Vitals, bundle size | Cold start, frame budget (60fps), battery | Latência p95/p99, índices, circuit breaker |
| **Acessibilidade** | WCAG 2.1 AA/AAA | VoiceOver (iOS) / TalkBack (Android) | N/A |
| **Observabilidade** | N/A | N/A | Logs estruturados, métricas, tracing, alertas |
| **Contratos** | REST/GraphQL, DTOs | REST/Dio/Retrofit | REST/gRPC, OpenAPI/proto, eventos pub/sub |

---

## Variante Web — 21 seções

Focada em **componentes, páginas, estado do cliente, i18n e Core Web Vitals**.

| # | Seção | O que documenta |
| --- | --- | --- |
| 1 | Identificação | Feature, variante `web`, autor, status |
| 2 | Resumo Técnico | Decisões de alto nível consolidadas do tech-alignment |
| 3 | Arquitetura | Visão geral, componentes/páginas, camadas e interações |
| 4 | Fluxos de Interface | Mapa de rotas (ex.: `/produtos/:id`), jornadas e navegação. Com [design.md](../skills/shared/generate-design.md), o layout vem dele — a spec mantém rotas/redirects/query params |
| 5 | Comportamento Visual e Estados da UI | Loading, error, empty state, disabled, skeleton screens. Com [design.md](../skills/shared/generate-design.md), vira referência (resumo + ponteiro) — o design é a fonte de verdade |
| 6 | Gestão de Estado | Solução (Redux/Zustand/Context/Signals), stores/slices, persistência local |
| 7 | Integração com APIs | Endpoints consumidos, DTOs, cliente HTTP, mapping request/response |
| 8 | Sincronização de Dados | Cache HTTP (stale-while-revalidate, SWR/TanStack Query), tempo real (WebSocket/SSE) |
| 9 | Gerenciamento de Erros | Estratégia por tipo (rede, validação, servidor), feedback ao usuário |
| 10 | Segurança | Storage de tokens (httpOnly cookie vs. localStorage), XSS/CSRF/headers, validação de input |
| 11 | Performance | Core Web Vitals (LCP/CLS/INP), estratégias (lazy load, code split), bundle size |
| 12 | Internacionalização / i18n | Idiomas alvo, solução (i18next/lingui/formatjs), formatos de data/moeda |
| 13 | Acessibilidade / a11y | Padrão WCAG 2.1 AA ou AAA, componentes críticos, ferramentas de auditoria |
| 14 | Feature Flags | Solução (LaunchDarkly/GrowthBook/custom), avaliação build-time/runtime |
| 15 | Mapeamento de User Stories | US → definições técnicas (tabela de rastreabilidade) |
| 16 | Dependências Externas | Pacotes, versões, propósito |
| 17 | Estratégia de Testes | Delegada ao [agent-spec-qa-test-generator](../agents/qa-test-generator.md) com `frente: web` |
| 18 | Critérios de Aceite Técnicos | Não-funcionais mensuráveis (ex.: LCP < 2.5s) |
| 19 | Riscos Técnicos | Probabilidade × impacto × mitigação |
| 20 | Arquivos Envolvidos | Árvore ASCII + tabela [N]Novo [M]Modificado [R]Referência |
| 21 | Checklist Final | Verificações antes de avançar para task-plan |

---

## Variante Mobile — 22 seções

Focada em **telas, estado persistido localmente, hardware e offline-first**.

| # | Seção | Diferenças vs. Web |
| --- | --- | --- |
| 1 | Identificação | Adiciona: plataforma (`iOS` / `Android` / `iOS+Android`) e stack (`Flutter` / `React Native` / `Nativo`) |
| 2 | Resumo Técnico | Igual |
| 3 | Arquitetura | Adiciona bridges nativas e camadas específicas de mobile (UI, BLoC/ViewModel, Repository, DataSources) |
| 4 | Fluxos de Interface | Inclui deep links e push notifications. Com [design.md](../skills/shared/generate-design.md), o layout vem dele |
| 5 | Comportamento Visual | Adiciona estado `Offline` obrigatório. Com [design.md](../skills/shared/generate-design.md), vira referência — o design é a fonte de verdade |
| 6 | Gestão de Estado | BLoC / Riverpod / Provider / GetX / Redux / MobX em vez de Redux/Zustand |
| 7 | Integração com APIs | Dio / Retrofit / URLSession / OkHttp + interceptadores |
| 8 | **Sincronização Offline-First** | Banco local (SQLite/Drift/Realm/Isar/Hive), estratégia de sync (pull/push/bidirecional), resolução de conflitos, versionamento de schema |
| 9 | **Integração com Hardware** | Câmera, Bluetooth, GPS, biometria, NFC, impressora — permissão, plugin/SDK, fallback |
| 10 | Gerenciamento de Erros | Igual + erros offline |
| 11 | Segurança | Keychain/Keystore, detecção jailbreak/root, certificate pinning |
| 12 | Performance | Cold start < Xs, frame budget 60fps, limite de memória, battery impact |
| 13 | Internacionalização | Igual + RTL |
| 14 | Acessibilidade | VoiceOver (iOS) / TalkBack (Android) |
| 15 | Feature Flags | Firebase Remote Config incluído como opção |
| 16 | Mapeamento de User Stories | Igual |
| 17 | Dependências Externas | Coluna extra: Plataforma (iOS / Android / Cross) |
| 18 | Estratégia de Testes | Delegada ao agent-spec-qa-test-generator com `frente: mobile` |
| 19 | Critérios de Aceite Técnicos | Igual |
| 20 | Riscos Técnicos | Igual |
| 21 | Arquivos Envolvidos | Inclui `Info.plist`, `AndroidManifest.xml` na árvore |
| 22 | Checklist Final | Igual |

---

## Variante Backend — 23 seções

Focada em **endpoints, persistência, eventos/filas, segurança e observabilidade**.

| # | Seção | O que documenta |
| --- | --- | --- |
| 1 | Identificação | Feature, variante `backend`, stack (Go/Node/Python/Java/.NET/Rust), estilo arquitetural |
| 2 | Resumo Técnico | Decisões consolidadas |
| 3 | Arquitetura | Handlers, services, repositories, jobs, mensageria |
| 4 | **Contratos de API** | Endpoints expostos (método, path, auth, status), schemas/DTOs (OpenAPI/proto), eventos pub/sub |
| 5 | **Fluxos de Negócio** | Fluxo principal, alternativos, tratamento de erros, mapeamento US → fluxo |
| 6 | **Regras de Processamento** | Validações, transformações, regras de domínio, casos de borda |
| 7 | **Persistência de Dados** | Tabelas (colunas/tipos/constraints/índices), migrações, transações, consistência, retenção de dados |
| 8 | **Integração com APIs Externas** | Endpoints, timeouts, retry com backoff exponencial, circuit breaker |
| 9 | **Sincronização de Dados** | Eventos/filas, idempotência (chave + TTL), outbox/saga pattern |
| 10 | Gerenciamento de Erros | Mapeamento erro → HTTP status, erros internos vs. expostos |
| 11 | Segurança | Autenticação (JWT/OAuth2/mTLS), autorização (RBAC/ABAC), criptografia, input sanitization |
| 12 | **Rate Limiting e Quotas** | Algoritmo (token bucket/sliding window), granularidade, resposta HTTP 429 |
| 13 | **Observabilidade** | Logs estruturados (campos + nível), métricas (counters/histograms/gauges), tracing (spans), alertas, health checks |
| 14 | Performance | Latência p95/p99, índices de banco, cache (Redis/Memcached), bulk operations |
| 15 | Versionamento de API | Estratégia (URL path/header/content-type), política de breaking changes |
| 16 | Mapeamento de User Stories | Igual |
| 17 | Feature Flags | Igual |
| 18 | Internacionalização | Apenas se o backend lida com locale (formatação, mensagens de erro localizadas) |
| 19 | Acessibilidade | N/A (omitida ou marcada como não aplicável) |
| 20 | Riscos Técnicos | Igual |
| 21 | Dependências Externas | Igual |
| 22 | Estratégia de Testes | Delegada ao agent-spec-qa-test-generator com `frente: backend` |
| 23 | Checklist Final | Igual |

---

## Perguntas técnicas por variante (FASE 3.2)

A skill faz **uma pergunta por vez**. Decisões já definidas no `tech-alignment.md` são puladas automaticamente.

### Variante Web

1. Stack frontend (React/Vue/Svelte/Angular) + modo de render (SSR/CSR/SSG)
2. Gestão de estado (Redux Toolkit/Zustand/Context API/Signals/Jotai)
3. APIs consumidas + cliente HTTP (fetch/Axios/TanStack Query/SWR)
4. i18n — idiomas alvo + solução (i18next/lingui/react-intl/formatjs)
5. a11y — padrão WCAG 2.1 AA ou AAA + ferramentas de auditoria
6. Feature flags — solução (LaunchDarkly/Unleash/GrowthBook/custom) + avaliação build-time vs. runtime

### Variante Mobile

1. Plataforma (iOS/Android/iOS+Android) + Stack (Flutter/React Native/Nativo) + arquitetura
2. Gestão de estado (BLoC/Riverpod/Provider/GetX/Redux/MobX)
3. Integração com hardware — quais (câmera/Bluetooth/GPS/biometria/NFC) + plugins/SDKs
4. Sincronização offline-first — banco local (SQLite/Drift/Realm/Isar/Hive) + estratégia + resolução de conflitos
5. APIs consumidas + cliente HTTP (Dio/Retrofit/URLSession/OkHttp) + interceptadores
6. i18n / a11y / feature flags (pergunta consolidada)

### Variante Backend

1. Linguagem/Framework + estilo arquitetural (Clean/Hexagonal/Layered/DDD)
2. Banco de dados — tipo (relacional/documental/chave-valor) + tecnologia + ORM/query builder
3. Autenticação/Autorização — mecanismo (JWT/OAuth2/mTLS) + modelo de permissões (RBAC/ABAC)
4. Contratos de API — estilo (REST/gRPC/GraphQL) + proto/openapi existente
5. Eventos/Mensageria — tecnologia (Kafka/RabbitMQ/SQS) + padrão (pub-sub/outbox/saga)
6. Observabilidade — stack de logs, métricas, tracing, alertas

---

## Links relacionados

* [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) — skill que usa estes templates
* [SDD — Framework](../frameworks/sdd.md) — visão geral do pipeline SDD
* [agent-spec-qa-test-generator](../agents/qa-test-generator.md) — gera a Estratégia de Testes por variante
* [Variantes do Scope (miniSpec)](scope-variants.md) — equivalente para miniSpec
