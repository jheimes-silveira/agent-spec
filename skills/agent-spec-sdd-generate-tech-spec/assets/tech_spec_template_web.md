# TECH_SPEC -- Especificação Técnica (Web)

## 1. Identificação
- **Feature/Projeto**:
- **Variante**: web
- **Stack**: <!-- React | Vue | Svelte | Angular | Outro — incluir estratégia SSR/CSR (coletado na FASE 3.2.A) -->
- **Autor**:
- **Data**:
- **Versão**:
- **Status**: Draft | Refinando | Aprovado
- **PRD Relacionado**:
- **Design Relacionado**: <!-- path do design.md (design.feature.path) se existir; "—" se a feature não passou pelo fluxo de design -->

---

## 2. Resumo Técnico da Solução

(Visão geral do COMO será implementado. Descreva em 3-5 linhas a abordagem técnica escolhida, as principais decisões arquiteturais e o resultado técnico esperado.)

---

## 3. Arquitetura da Solução

### 3.1 Visão Geral
(Diagrama ou descrição da arquitetura geral. Como páginas, componentes e serviços se conectam.)

### 3.2 Componentes / Páginas

| Componente / Página | Responsabilidade | Camada (UI / Container / Service / API Client) |
|---------------------|------------------|------------------------------------------------|
|                     |                  |                                                |

### 3.3 Camadas e Interações
(UI → Container/Hooks → State Store → API Client → Backend. Descreva o fluxo de dados entre camadas.)

### 3.4 Visão em Árvore

<!-- LLM-ONLY: Gere uma árvore ASCII completa de TODOS os arquivos listados nas seções 3.5–3.7.
  Legenda obrigatória ao final: [N] = Novo  [M] = Modificado  [R] = Referência (somente leitura)
  Use os caracteres: ├── └── │ (não use + ou -)
  Agrupe por diretório. Exemplo:

  src/
  ├── pages/
  │   ├── Dashboard.tsx        [N]
  │   └── Dashboard.test.tsx   [N]
  ├── components/
  │   └── Card.tsx             [M]
  └── store/
      └── dashboardSlice.ts    [N]
  package.json                 [M]

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

<!-- LLM-ONLY: Esta secao economiza tokens e scans durante a implementacao, pois lista exatamente quais arquivos serao impactados. -->

---

## 4. Fluxos de Interface

<!-- LLM-ONLY: Se "Design Relacionado" (secao 1) aponta para um design.md, o layout/composicao das telas
  ja esta especificado la — NAO redefina. Preencha 4.1 normalmente (rota/acesso sao decisao tecnica) com a
  coluna Descricao referenciando a secao do design.md (ex.: "ver design.md §4.1"). Em 4.2, especifique apenas
  o que e tecnico: redirecionamentos, deep links, query params, guards de rota. Sem design.md, preencha
  integralmente como fonte primaria. -->

### 4.1 Mapa de Telas / Rotas

| Rota | Tela / Página | Acesso | Descrição |
|------|---------------|--------|-----------|
|      |               |        |           |

### 4.2 Jornadas e Navegação
(Fluxo do usuário entre telas. Inclua estados de redirecionamento, deep links, query params relevantes.)

---

## 5. Comportamento Visual e Estados da UI

<!-- LLM-ONLY: Se "Design Relacionado" (secao 1) aponta para um design.md, esta secao vira REFERENCIA:
  escreva 1 paragrafo-resumo + "Fonte de verdade dos estados visuais: design.md §5" e preencha a tabela 5.1
  apenas com o ponteiro por tela (ex.: "ver design.md §5 — ListaPedidos"). NAO duplique o conteudo — duplicar
  cria duas fontes que divergem. O QA valida estados visuais contra o design.md nesse caso.
  Sem design.md, preencha integralmente como fonte primaria (comportamento concreto por celula). -->

### 5.1 Estados por Tela / Componente

| Componente / Tela | Loading | Sucesso | Erro | Vazio |
|-------------------|---------|---------|------|-------|
|                   |         |         |      |       |

### 5.2 Transições e Feedback Visual
(Animações, skeleton loaders, toasts, modais, transições de rota.)

---

## 6. Gestão de Estado

### 6.1 Solução Escolhida
(Redux Toolkit, Zustand, Context API, Signals, Jotai, Recoil — justificar escolha.)

### 6.2 Estrutura de Stores / Slices

| Store / Slice | Estado Gerenciado | Ações Principais |
|---------------|-------------------|------------------|
|               |                   |                  |

### 6.3 Persistência de Estado
(LocalStorage, SessionStorage, IndexedDB, cookies. Cite chave e estratégia de versionamento.)

---

## 7. Integração com APIs

### 7.1 Endpoints Consumidos

| Ação | Método | Rota | Payload Enviado | Resposta Esperada | Auth |
|------|--------|------|-----------------|-------------------|------|
|      |        |      |                 |                   |      |

### 7.2 Contratos / DTOs de Resposta

| DTO | Campos principais | Origem (proto/openapi/manual) |
|-----|-------------------|-------------------------------|
|     |                   |                               |

### 7.3 Mapping para Models de Domínio
(Como respostas de API são convertidas em models internos. Camada de adaptação/anti-corruption.)

---

## 8. Sincronização de Dados

### 8.1 Estratégia de Cache HTTP
(SWR, React Query, RTK Query, fetch nativo + cache manual. TTL, stale-while-revalidate.)

### 8.2 Tempo Real
(WebSockets, Server-Sent Events, polling. Cite eventos consumidos e canal.)

---

## 9. Gerenciamento de Erros

| Tipo de Erro | Origem | Tratamento UI | Fallback |
|--------------|--------|---------------|----------|
| Rede / Timeout |      | Toast / banner |          |
| Validação    |        |               |          |
| Auth (401/403) |      |               |          |
| Servidor (5xx) |      |               |          |

(Estratégia geral: error boundaries, captura global, logging cliente.)

---

## 10. Segurança

### 10.1 Storage de Tokens
(LocalStorage vs HttpOnly Cookie. Justificar escolha e mitigações XSS.)

### 10.2 XSS / CSRF / Headers
(CSP, sanitização de HTML, anti-CSRF tokens, headers de segurança esperados do backend.)

### 10.3 Validação de Input
(Bibliotecas: Zod, Yup, Valibot. Validação no cliente vs servidor — duplicada.)

---

## 11. Performance

### 11.1 Métricas Alvo (Core Web Vitals)
- LCP: 
- INP: 
- CLS: 

### 11.2 Estratégias
(Code-splitting, lazy loading de rotas, prefetch, memoization, virtualização de listas, otimização de imagens.)

### 11.3 Bundle Size
(Limite alvo, ferramenta de análise — bundle-analyzer, source-map-explorer.)

---

## 12. Internacionalização (i18n)

### 12.1 Idiomas Suportados
- Default: 
- Adicionais: 

### 12.2 Solução
(i18next, lingui, react-intl, formatjs. Estrutura de namespaces e arquivos de tradução.)

### 12.3 Considerações Regionais
(Formatação de data/hora/moeda, RTL, pluralização.)

---

## 13. Acessibilidade (a11y)

### 13.1 Padrão Alvo
(WCAG 2.1 AA / AAA — citar nível mínimo aceito.)

### 13.2 Práticas Aplicadas
(ARIA labels, navegação por teclado, contraste de cores, foco visível, leitores de tela testados.)

### 13.3 Auditoria
(Ferramentas: axe-core, Lighthouse, eslint-plugin-jsx-a11y.)

---

## 14. Feature Flags

### 14.1 Solução
(LaunchDarkly, Unleash, GrowthBook, custom backend. Onde flags são lidas — build-time vs runtime.)

### 14.2 Flags Envolvidas

| Flag | Propósito | Escopo (global/usuário/segmento) | Default |
|------|-----------|-----------------------------------|---------|
|      |           |                                   |         |

---

## 15. Mapeamento de User Stories para Definições Técnicas

| User Story (PRD) | Definição Técnica | Componentes / Páginas Envolvidos |
|------------------|-------------------|----------------------------------|
| US-01            |                   |                                  |
| US-02            |                   |                                  |

<!-- LLM-ONLY: Cada user story do PRD deve ter pelo menos uma definicao tecnica correspondente. Isso garante rastreabilidade completa entre o PRD e a especificacao tecnica. -->

---

## 16. Dependências Externas

| Tipo | Nome | Versão | Motivo |
|------|------|--------|--------|
| Framework |  |        |        |
| Lib UI    |  |        |        |
| State     |  |        |        |
| Validação |  |        |        |
| i18n      |  |        |        |

---

## 17. Estratégia de Testes

> **Resumo**: X casos de teste | Unitários: Y | Integração: Z | E2E: W
> **Padrão**: [framework de teste, padrão de mock, convenção de nomes]

### Rastreabilidade: Critérios de Aceite → Testes

| CA (PRD) | Descrição Resumida | Testes |
|----------|--------------------|--------|
| CA-01    | (descrição curta do CA no PRD) | CT-01, CT-10, CT-20, CT-30 |
| CA-02    | (descrição curta do CA no PRD) | CT-02, CT-22 |

<!-- LLM-ONLY: Cada CA-XX do PRD deve ter pelo menos um teste correspondente. Esta tabela deve ser preenchida PRIMEIRO — guia toda a estrategia. -->

---

### 17.1 Testes Unitários

<!-- LLM-ONLY: Coluna "Objetivo": Descreva em 1 frase O QUE o teste valida e POR QUE importa. Use o padrao: Verbo + comportamento especifico + condicao. NAO repita o nome do teste — o objetivo deve dar contexto que o nome sozinho nao da. -->

#### Componente: [NomeComponente] (`arquivo.test.tsx`)

Mock: [hooks/serviços mockados]

<!-- LLM-ONLY: Coluna "Setup (caminho legitimo)" — receita anti-violacao da Iron Law #6: quando o teste depende de precondicao que a producao nao expoe (auth/contexto/relogio/identidade), preencher com o caminho legitimo de montagem (imitar teste analogo -> boundary real -> mecanismo teste-interno nativo da stack) vindo de `precondicao_privilegiada` do JSON do qa-test-generator. Usar `—` quando nao ha precondicao privilegiada. NUNCA exportar/criar simbolo de producao so para teste. -->

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-01 | renders_default_state | CA-01 | Verificar que componente renderiza com props padrão | props válidas | DOM esperado | — | — |

#### Hook: [useNomeHook] (`useNomeHook.test.ts`)

| CT | Teste | CA | Objetivo | Input | Expected | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|--------------------------|
| CT-02 | returns_loading_initial | CA-02 | Verificar estado inicial de loading | renderHook | { loading: true } | — |

### 17.2 Testes de Integração

#### [Tela X com store + API mockada] (`arquivo.test.tsx`)

Setup: [MSW, react-query client, fixtures]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-20 | tela_carrega_dados | CA-01 | Verificar fluxo completo de carregar dados via API mockada | Render → fetch → display | dados renderizados | — |

### 17.3 Testes End-to-End (E2E)

#### Fluxo: [Nome do Fluxo Crítico] (CT-30)
- **Framework**: Playwright | Cypress
- **CA**: CA-01, CA-03
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida de ponta a ponta)
- **Pré-condições**: (estado do backend, usuário autenticado etc.)
- **Passos**:
  1. Usuário acessa /rota
  2. Preenche formulário
  3. Submete
- **Validações**: (assertions sobre URL, conteúdo da página, network requests)

### 17.4 Cenários de Erro

| Cenário | CA | Objetivo | Trigger | UI Esperada |
|---------|----|----------|---------|-------------|
| API offline | CA-02 | Verificar fallback de UI quando API falha | mock 500 | toast erro + retry |

---

## 18. Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
|       |               |         |           |

---

## 19. Observações Técnicas

(Decisões importantes, trade-offs, links externos, candidatos a ADR.)

---

## 20. Checklist Final

- [ ] Variante registrada (web) na seção 1
- [ ] TECH_SPEC cobre todo o PRD (todas as US-XX mapeadas em 15)
- [ ] Resumo técnico claro e objetivo (seção 2)
- [ ] Arquitetura definida com componentes, páginas e camadas (seção 3)
- [ ] Mapa de telas/rotas e jornadas descrito (seção 4)
- [ ] Estados da UI por componente (seção 5)
- [ ] Solução de gestão de estado e estrutura de stores (seção 6)
- [ ] APIs consumidas, DTOs e mapping (seção 7)
- [ ] Estratégia de cache/tempo real (seção 8)
- [ ] Gerenciamento de erros mapeado (seção 9)
- [ ] Segurança: tokens, XSS/CSRF, validação (seção 10)
- [ ] Performance: métricas alvo e estratégias (seção 11)
- [ ] i18n: idiomas, solução, considerações regionais (seção 12)
- [ ] a11y: padrão WCAG e práticas (seção 13)
- [ ] Feature flags listadas (seção 14)
- [ ] Dependências externas listadas (seção 16)
- [ ] Estratégia de testes via `agent-spec-qa-test-generator` integrada (seção 17, com rastreabilidade CA→CT)
- [ ] Riscos técnicos identificados (seção 18)
- [ ] Observações técnicas registradas (seção 19)
- [ ] Arquivos envolvidos listados — árvore + criar/modificar/referência (seções 3.4-3.7)
- [ ] Pronto para geração das TASKS
