# TECH_SPEC -- Especificação Técnica (Mobile)

## 1. Identificação
- **Feature/Projeto**:
- **Variante**: mobile
- **Plataformas Alvo**: iOS | Android | iOS+Android
- **Stack**: Flutter | React Native | Nativo iOS | Nativo Android | KMP
- **Autor**:
- **Data**:
- **Versão**:
- **Status**: Draft | Refinando | Aprovado
- **PRD Relacionado**:
- **Design Relacionado**: <!-- path do design.md (design.feature.path) se existir; "—" se a feature não passou pelo fluxo de design -->

---

## 2. Resumo Técnico da Solução

(Visão geral do COMO será implementado. Descreva em 3-5 linhas a abordagem técnica, decisões arquiteturais, integrações nativas relevantes e o resultado técnico esperado.)

---

## 3. Arquitetura da Solução

### 3.1 Visão Geral
(Diagrama ou descrição. Como UI, BLoC/ViewModel, Repository, DataSources e bridges nativas se conectam.)

### 3.2 Componentes / Telas

| Tela / Widget | Responsabilidade | Camada (UI / VM / Repo / DataSource / Native) |
|---------------|------------------|-----------------------------------------------|
|               |                  |                                               |

### 3.3 Camadas e Interações
(UI → ViewModel/BLoC → Use Case → Repository → DataSource (Remote/Local/Hardware). Descreva fluxos de dados.)

### 3.4 Visão em Árvore

<!-- LLM-ONLY: Gere uma árvore ASCII completa de TODOS os arquivos listados nas seções 3.5–3.7.
  Legenda obrigatória ao final: [N] = Novo  [M] = Modificado  [R] = Referência (somente leitura)
  Use os caracteres: ├── └── │ (não use + ou -)
  Agrupe por diretório. Inclua arquivos nativos (Info.plist, AndroidManifest.xml) quando relevante.

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

## 4. Fluxos de Interface

<!-- LLM-ONLY: Se "Design Relacionado" (secao 1) aponta para um design.md, o layout/composicao das telas
  ja esta especificado la — NAO redefina. Preencha 4.1 normalmente (rota/acesso sao decisao tecnica) com a
  coluna Descricao referenciando a secao do design.md (ex.: "ver design.md §4.1"). Em 4.2, especifique apenas
  o que e tecnico: solucao de navegacao, deep links e parametros. Sem design.md, preencha integralmente
  como fonte primaria. -->

### 4.1 Mapa de Telas / Rotas

| Rota | Tela | Acesso | Descrição |
|------|------|--------|-----------|
|      |      |        |           |

### 4.2 Navegação e Deep Links
(Solução de navegação: GoRouter, React Navigation, native. Lista de deep links suportados e parâmetros.)

---

## 5. Comportamento Visual e Estados da UI

<!-- LLM-ONLY: Se "Design Relacionado" (secao 1) aponta para um design.md, esta secao vira REFERENCIA:
  escreva 1 paragrafo-resumo + "Fonte de verdade dos estados visuais: design.md §5" e preencha a tabela 5.1
  apenas com o ponteiro por tela (ex.: "ver design.md §5 — TelaPedidos"). NAO duplique o conteudo — duplicar
  cria duas fontes que divergem. O QA valida estados visuais contra o design.md nesse caso.
  Sem design.md, preencha integralmente como fonte primaria (comportamento concreto por celula, incluindo Offline). -->

### 5.1 Estados por Tela / Componente

| Tela / Componente | Loading | Sucesso | Erro | Vazio | Offline |
|-------------------|---------|---------|------|-------|---------|
|                   |         |         |      |       |         |

### 5.2 Transições e Feedback Visual
(Animações nativas, gestos, haptic feedback, splash, skeleton loaders, snackbars.)

---

## 6. Gestão de Estado

### 6.1 Solução Escolhida
(BLoC, Riverpod, Provider, GetX, Redux, MobX, Recoil — justificar.)

### 6.2 Estrutura de Stores / BLoCs

| Store / BLoC | Estado Gerenciado | Eventos / Ações |
|--------------|-------------------|-----------------|
|              |                   |                 |

### 6.3 Persistência de Estado
(SharedPreferences, MMKV, Hive, secure storage. Chaves e estratégia de versionamento.)

---

## 7. Integração com APIs

### 7.1 Endpoints Consumidos

| Ação | Método | Rota | Payload Enviado | Resposta Esperada | Auth |
|------|--------|------|-----------------|-------------------|------|
|      |        |      |                 |                   |      |

### 7.2 Contratos / DTOs

| DTO | Campos principais | Origem (proto/openapi/manual) |
|-----|-------------------|-------------------------------|
|     |                   |                               |

### 7.3 Cliente HTTP
(Dio, Retrofit, Alamofire, URLSession, OkHttp. Interceptadores: auth, logging, retry.)

---

## 8. Sincronização de Dados (Offline-First)

### 8.1 Estratégia de Sincronização
(Pull-on-demand, periódica, push do servidor, fila de comandos. Critério de prioridade.)

### 8.2 Banco Local

| Tabela / Box / Collection | Campos | Tipo | Índices |
|---------------------------|--------|------|---------|
|                           |        |      |         |

(Solução: SQLite/Drift, Realm, Isar, Hive, CoreData, Room.)

### 8.3 Resolução de Conflitos
(Last-write-wins, vector clocks, server-wins, merge manual. Quando aplicar cada um.)

### 8.4 Versionamento de Schema Local
(Migrações locais, rollback, fallback ao reinstalar.)

---

## 9. Integração com Hardware

### 9.1 Capacidades Necessárias

| Recurso | Uso | Permissão | Fallback se negada |
|---------|-----|-----------|--------------------|
| Câmera  |     |           |                    |
| Bluetooth |   |           |                    |
| GPS / Localização | | |                    |
| Biometria |   |           |                    |
| NFC      |    |           |                    |
| Impressora |  |           |                    |

### 9.2 Plugins / SDKs

| Recurso | Plugin / SDK | Versão |
|---------|--------------|--------|
|         |              |        |

### 9.3 Configurações Específicas
(Info.plist, AndroidManifest, capabilities, entitlements. Mensagens exibidas ao usuário.)

---

## 10. Gerenciamento de Erros

| Tipo | Origem | Tratamento UI | Fallback |
|------|--------|---------------|----------|
| Rede / Timeout | | snackbar / banner | usar cache |
| Validação | | mensagem inline | — |
| Auth (401/403) | | redirect login | — |
| Servidor (5xx) | | retry com backoff | — |
| Hardware indisponível | | dialog | desabilitar feature |

(Estratégia geral: error tracking — Sentry/Crashlytics, captura global, contexto de usuário.)

---

## 11. Segurança

### 11.1 Storage Seguro
(Keychain iOS / Keystore Android, secure_storage. Tokens, credenciais, PII.)

### 11.2 Detecção de Ambiente Inseguro
(Jailbreak/root detection, emulador, debugger attached. Ações ao detectar.)

### 11.3 Comunicação
(Certificate pinning, TLS mínimo, validação de cadeia.)

### 11.4 Validação de Input
(Bibliotecas de validação. Confirmação biométrica para ações sensíveis.)

---

## 12. Performance

### 12.1 Métricas Alvo
- Cold start: 
- Frame budget: 60fps / 120fps
- Uso de memória teto: 
- Battery (impacto estimado): 

### 12.2 Estratégias
(Lazy loading de telas/imagens, cache de imagens — CachedNetworkImage/Glide, isolates/threads para trabalho pesado, code-splitting onde aplicável.)

### 12.3 Tamanho do App
(Limite alvo, App Bundle, ABI splits, ProGuard/R8, tree-shaking.)

---

## 13. Internacionalização (i18n)

### 13.1 Idiomas Suportados
- Default: 
- Adicionais: 

### 13.2 Solução
(intl + ARB, react-i18next, NSLocalizedString, strings.xml. Estrutura de arquivos.)

### 13.3 Considerações Regionais
(Formatação de data/hora/moeda, RTL, pluralização, tamanhos de string para layouts adaptativos.)

---

## 14. Acessibilidade (a11y)

### 14.1 Padrão Alvo
(WCAG 2.1 AA, mobile a11y — VoiceOver/TalkBack.)

### 14.2 Práticas Aplicadas
(Semantics labels, traversal order, contraste, escala dinâmica de fonte, hit area mínima 44pt/48dp.)

### 14.3 Auditoria
(Accessibility Inspector iOS, Accessibility Scanner Android, flutter_a11y, eslint a11y para RN.)

---

## 15. Feature Flags

### 15.1 Solução
(LaunchDarkly, Firebase Remote Config, Unleash, custom. Cache local, comportamento offline.)

### 15.2 Flags Envolvidas

| Flag | Propósito | Escopo | Default |
|------|-----------|--------|---------|
|      |           |        |         |

---

## 16. Mapeamento de User Stories para Definições Técnicas

| User Story (PRD) | Definição Técnica | Componentes / Telas Envolvidos |
|------------------|-------------------|--------------------------------|
| US-01            |                   |                                |
| US-02            |                   |                                |

<!-- LLM-ONLY: Cada user story do PRD deve ter pelo menos uma definicao tecnica correspondente. -->

---

## 17. Dependências Externas

| Tipo | Nome | Versão | Plataforma (iOS/Android/Cross) | Motivo |
|------|------|--------|-------------------------------|--------|
| Framework |  |        |                               |        |
| State    |   |        |                               |        |
| Navegação |  |        |                               |        |
| HTTP     |   |        |                               |        |
| DB Local |   |        |                               |        |
| Hardware SDK | |       |                               |        |

---

## 18. Estratégia de Testes

> **Resumo**: X casos de teste | Unitários: Y | Integração: Z | E2E: W
> **Padrão**: [framework de teste, padrão de mock, convenção de nomes]

### Rastreabilidade: Critérios de Aceite → Testes

| CA (PRD) | Descrição Resumida | Testes |
|----------|--------------------|--------|
| CA-01    | (descrição curta do CA no PRD) | CT-01, CT-10, CT-20, CT-30 |
| CA-02    | (descrição curta do CA no PRD) | CT-02, CT-22 |

<!-- LLM-ONLY: Cada CA-XX do PRD deve ter pelo menos um teste correspondente. -->

---

### 18.1 Testes Unitários

<!-- LLM-ONLY: Coluna "Objetivo": Descreva em 1 frase O QUE o teste valida e POR QUE importa. -->

#### BLoC / ViewModel: [Nome] (`arquivo_test.dart`)

Mock: [repositórios mockados]

<!-- LLM-ONLY: Coluna "Setup (caminho legitimo)" — receita anti-violacao da Iron Law #6: quando o teste depende de precondicao que a producao nao expoe (auth/contexto/relogio/identidade), preencher com o caminho legitimo de montagem (imitar teste analogo -> boundary real -> mecanismo teste-interno nativo da stack) vindo de `precondicao_privilegiada` do JSON do qa-test-generator. Usar `—` quando nao ha precondicao privilegiada. NUNCA exportar/criar simbolo de producao so para teste. -->

| CT | Teste | CA | Objetivo | Input (event) | Expected (state) | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|---------------|------------------|------|--------------------------|
| CT-01 | emits_loaded_on_fetch | CA-01 | Verificar transição loading→loaded | Fetch | [Loading, Loaded] | repo retorna lista | — |

#### Widget: [Nome] (`widget_test.dart`)

| CT | Teste | CA | Objetivo | Input | Expected | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|--------------------------|
| CT-02 | mostra_estado_vazio | CA-02 | Verificar UI de estado vazio | lista vazia | EmptyView visível | — |

### 18.2 Testes de Integração

#### [Tela X com repository real + DB local] (`integration_test/`)

Setup: [DB in-memory, fixtures, mock de hardware]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-20 | sincroniza_offline | CA-01 | Verificar que dados criados offline são sincronizados quando volta online | Create offline → toggle online → assert sync | dados no servidor | — |

### 18.3 Testes End-to-End (E2E)

#### Fluxo: [Nome do Fluxo Crítico] (CT-30)
- **Framework**: Patrol | Detox | Appium | XCUITest | Espresso
- **CA**: CA-01, CA-03
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida)
- **Pré-condições**: (estado do app, permissões concedidas, backend/mock)
- **Passos**:
  1. Usuário abre o app
  2. Concede permissão de [hardware]
  3. Realiza ação X
- **Validações**: (assertions sobre UI, navegação, dados persistidos)

### 18.4 Cenários de Erro

| Cenário | CA | Objetivo | Trigger | UI Esperada |
|---------|----|----------|---------|-------------|
| Permissão negada | CA-04 | Verificar que feature degrada graciosamente sem permissão | Negar câmera | Banner explicativo + CTA |
| Sem rede | CA-05 | Verificar fallback offline | Toggle airplane | dados de cache + sync queue |

---

## 19. Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
|       |               |         |           |

---

## 20. Observações Técnicas

(Decisões importantes, trade-offs, links externos, candidatos a ADR. Diferenças entre plataformas iOS/Android.)

---

## 21. Checklist Final

- [ ] Variante registrada (mobile) na seção 1
- [ ] Plataformas alvo definidas (iOS / Android / cross)
- [ ] TECH_SPEC cobre todo o PRD (todas as US-XX mapeadas em 16)
- [ ] Resumo técnico claro e objetivo (seção 2)
- [ ] Arquitetura, telas e camadas definidas (seções 3-4)
- [ ] Estados da UI por tela (seção 5)
- [ ] Solução de gestão de estado e estrutura de BLoCs/Stores (seção 6)
- [ ] APIs consumidas e cliente HTTP (seção 7)
- [ ] Estratégia offline-first com banco local e resolução de conflitos (seção 8)
- [ ] Integrações de hardware com permissões e fallbacks (seção 9)
- [ ] Gerenciamento de erros mapeado (seção 10)
- [ ] Segurança: storage seguro, jailbreak detection, pinning (seção 11)
- [ ] Performance: cold start, frame budget, memória, app size (seção 12)
- [ ] i18n: idiomas, solução, considerações regionais (seção 13)
- [ ] a11y: padrão e práticas (seção 14)
- [ ] Feature flags listadas (seção 15)
- [ ] Dependências externas com plataforma (seção 17)
- [ ] Estratégia de testes via `agent-spec-qa-test-generator` integrada (seção 18, com rastreabilidade CA→CT)
- [ ] Riscos técnicos identificados (seção 19)
- [ ] Observações técnicas registradas (seção 20)
- [ ] Arquivos envolvidos listados — árvore + criar/modificar/referência (seções 3.4-3.7)
- [ ] Pronto para geração das TASKS
