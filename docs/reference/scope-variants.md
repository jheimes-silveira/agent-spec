---
id: "scope-variants"
title: "Variantes do Scope (miniSpec)"
sidebar_position: 2
---
# Variantes do Scope (miniSpec)

`miniSpec`

A skill [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) suporta **3 variantes de template**, cada uma otimizada para a frente de desenvolvimento correspondente. A variante é escolhida automaticamente (ou confirmada com o usuário) na **FASE 0.0** da skill.

---

## Como a variante é detectada

**Pré-detecção automática** — a skill lê o `tech-alignment.md` (se existir) buscando sinais inequívocos antes de qualquer pergunta:

| Sinal buscado | Exemplos |
| --- | --- |
| Campos explícitos | `Frente:`, `Variante:`, `Stack:` |
| Termos mobile | `Flutter`, `React Native`, `iOS`, `Android`, `SwiftUI`, `Jetpack Compose` |
| Termos frontend | `React`, `Vue`, `Angular`, `Svelte`, `Next.js`, `Nuxt` |
| Termos backend | `Go`, `Node.js`, `Python`, `Java`, `.NET`, `Rust`, `gRPC`, `REST API` |

**Fluxo de decisão:**

1. Alta confiança → confirma: *"Detectei que este SCOPE é **Mobile** (Flutter). Confirma?"*
2. Sem confiança → pergunta direta: *"Qual é a frente deste SCOPE? `Web` | `Mobile` | `Backend`"*

**Persistência:** A variante é gravada em:

* `minispec_state.yaml` (raiz + `steps.scope.variant`)
* Cabeçalho (campo `Variante`) do `scope.md`

---

## Diferença entre SCOPE e TECH SPEC

O SCOPE é o equivalente miniSpec do TECH SPEC do SDD, mas **deliberadamente mais conciso**:

| Aspecto | SCOPE (miniSpec) | TECH SPEC (SDD) |
| --- | --- | --- |
| Objetivo | Delimitar DENTRO / FORA e dar concretude técnica rápida | Especificação técnica densa e detalhada |
| Extensão típica | ~50-80k tokens | ~200-300k tokens |
| Seções | ~10-12 por variante | 21-23 por variante |
| Estratégia de Testes | Delegada ao `agent-spec-minispec-generate-tasks` (§5 consolidado) | Delegada ao `agent-spec-qa-test-generator` inline (§17-22) |
| Candidatos a ADR | Sinaliza na §5 (Observações) | Propõe criar ADR antes de finalizar |

---

## Comparativo das 3 variantes

| Aspecto | Web | Mobile | Backend |
| --- | --- | --- | --- |
| **Template** | `scope_template_web.md` | `scope_template_mobile.md` | `scope_template_backend.md` |
| **Foco principal** | Componentes, estado, i18n | Telas, hardware, offline | Endpoints, banco, serviços |
| **Seções adicionais** | i18n / a11y, feature flags | Hardware, offline-first | Integrações externas, observabilidade, versionamento de API |
| **Dependências** | Pacotes npm + versão | Pacotes + coluna Plataforma (iOS/Android/Cross) | Pacotes + coluna Escopo (dev/prod) |
| **Árvore de arquivos** | §3.7 | §3.9 | §3.9 |
| **Arquivos Envolvidos** | §3.8 | §3.10 | §3.10 |

---

## Variante Web — scope\_template\_web.md

Focada em **componentes, estado, APIs e acessibilidade**.

| Seção | O que documenta |
| --- | --- |
| **1 — O que está incluído** | Lista concisa do que será implementado (funcionalidades, telas, endpoints consumidos) |
| **2 — O que está fora do escopo** | O que explicitamente NÃO será feito nesta iteração |
| **3.1 — Páginas / Componentes** | Campo **"Design de referência"** (path do `design.md` via `design.feature.path`, ou `—` se a feature não passou pelo fluxo de design) + tabela: rota, componente, tipo (page/layout/component/hook), status (novo/modificado). Com design.md presente, a coluna Descrição referencia a seção do design (ex.: "ver design.md §4.1") em vez de redescrever layout/estados |
| **3.2 — Estado / Store** | Solução (Redux Toolkit / Zustand / Context API / Signals / Jotai), stores/slices afetados, persistência |
| **3.3 — Integração com APIs** | Endpoints consumidos (método, path, autenticação, status codes esperados) |
| **3.4 — i18n / a11y** | Idiomas alvo, biblioteca, padrão WCAG, componentes críticos de acessibilidade |
| **3.5 — Feature Flags** | Flags necessárias, solução, avaliação build-time vs. runtime |
| **3.6 — Dependências de Pacotes** | Pacotes novos (nome, versão, propósito) |
| **3.7 — Visão em Árvore** | Árvore ASCII do diretório afetado (gerada pelo LLM com base nos arquivos identificados) |
| **3.8 — Arquivos Envolvidos** | Tabela com ação [N]Novo [M]Modificado [R]Referência + caminho relativo |
| **4 — Critérios de Aceite** | Técnicos e mensuráveis (não repetir os funcionais da INTENT) |
| **5 — Observações** | Candidatos a ADR detectados, riscos, decisões a confirmar com o time |

---

## Variante Mobile — scope\_template\_mobile.md

Focada em **telas, estado, hardware e offline-first**.

| Seção | Diferenças vs. Web |
| --- | --- |
| **1 — O que está incluído** | Igual |
| **2 — O que está fora do escopo** | Igual |
| **3.1 — Telas / Componentes** | Campo **"Design de referência"** (idêntico ao Web); tipo inclui `page` / `widget` / `sheet` / `dialog` / `overlay`; adiciona coluna `Plataforma` |
| **3.2 — Estado / Store** | BLoC / Riverpod / Provider / GetX / Redux / MobX em vez de Redux/Zustand/Context |
| **3.3 — Integração com APIs** | Adiciona: cliente HTTP (Dio/Retrofit/URLSession/OkHttp), interceptadores de auth |
| **3.4 — Integração com Hardware** | *Exclusiva Mobile*: câmera, Bluetooth, GPS, biometria, NFC — permissão, plugin/SDK, fallback se não disponível |
| **3.5 — Sincronização (Offline-first)** | *Exclusiva Mobile*: banco local (SQLite/Drift/Realm/Isar/Hive), estratégia de sync, resolução de conflitos, versionamento de schema |
| **3.6 — i18n / a11y** | Adiciona VoiceOver (iOS) / TalkBack (Android) |
| **3.7 — Feature Flags** | Igual + Firebase Remote Config como opção |
| **3.8 — Dependências de Pacotes** | Coluna extra: Plataforma (iOS / Android / Cross) |
| **3.9 — Visão em Árvore** | Inclui `lib/` (Flutter) ou `src/` (React Native), `ios/`, `android/` quando relevante |
| **3.10 — Arquivos Envolvidos** | Inclui `Info.plist`, `AndroidManifest.xml` quando necessário |
| **4 — Critérios de Aceite** | Igual + aceites de offline (ex.: "funciona sem conexão por 24h") |
| **5 — Observações** | Igual |

---

## Variante Backend — scope\_template\_backend.md

Focada em **endpoints, persistência, serviços e integrações**.

| Seção | O que documenta |
| --- | --- |
| **1 — O que está incluído** | Igual |
| **2 — O que está fora do escopo** | Igual |
| **3.1 — Endpoints / Rotas** | Tabela: método HTTP, path, autenticação requerida, status codes, breve descrição |
| **3.2 — Banco de Dados** | Tabelas afetadas (colunas + tipos + constraints + índices); migrações necessárias (up/down) |
| **3.3 — Services / Regras de Negócio** | Services novos ou modificados + regras de domínio críticas |
| **3.4 — Integrações Externas** | REST/gRPC/Fila/SDK — direção (entrada/saída), autenticação, timeout, retry |
| **3.5 — Logs / Observabilidade** | Logs estruturados (campos obrigatórios), métricas, tracing (spans relevantes), alertas |
| **3.6 — Feature Flags** | Igual |
| **3.7 — Versionamento de API** | Estratégia (URL path `/v1/` / header `Accept-Version` / content-type), política de breaking changes |
| **3.8 — Dependências de Pacotes** | Igual |
| **3.9 — Visão em Árvore** | Estrutura de diretórios do módulo backend afetado |
| **3.10 — Arquivos Envolvidos** | Inclui arquivos de migração SQL e configuração |
| **4 — Critérios de Aceite** | Técnicos e mensuráveis (ex.: "endpoint responde em < 200ms p95") |
| **5 — Observações** | Candidatos a ADR, riscos de performance/segurança, decisões de consistência |

---

## Links relacionados

* [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) — skill que usa estes templates
* [miniSpec — Framework](/frameworks/minispec.html) — visão geral do pipeline miniSpec
* [agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) — próxima etapa, delega §5 ao agent-spec-qa-test-generator
* [Variantes do Tech Spec (SDD)](/reference/tech-spec-variants.html) — equivalente para SDD
