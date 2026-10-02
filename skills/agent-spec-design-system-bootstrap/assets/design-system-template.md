# Design System — {Produto}

> Gerado por `agent-spec-design-system-bootstrap` em {DATA}. Atualize via a mesma skill (enriquecimento) ou via promoções da `agent-spec-generate-design`.
> Fonte canônica da identidade visual do produto — consumida por `agent-spec-generate-design`, tech-spec, scope, geradores de tasks e `agent-spec-qa-validator` (Camada 4).

## 1. Identificação

- **Produto**:
- **Frente(s)**: web | mobile | ambas
- **Stack de UI**: <!-- LLM-ONLY: detectada na Fase 1 — ex.: React 18 + Tailwind, Flutter 3.x Material 3. Não invente. -->
- **Biblioteca de UI base**: <!-- ex.: shadcn/ui, MUI, Material 3, Cupertino, nenhuma (componentes próprios) -->
- **Fontes desta consolidação**: <!-- codebase (paths-chave), Figma (links), docs do time (paths), questionário -->

---

## 2. Fundações (tokens)

<!-- LLM-ONLY: toda linha tem coluna Origem com a procedência: [derivado] path | [figma] link/frame | [usuário].
  Referencie valores como o projeto os declara (var CSS, chave do theme, token Figma) — não duplique valores
  que o código já centraliza; aponte para eles. -->

### 2.1 Cores

| Token | Valor | Uso | Origem |
|---|---|---|---|
|   |   |   |   |

### 2.2 Tipografia

| Estilo | Fonte / Peso / Tamanho | Uso | Origem |
|---|---|---|---|
|   |   |   |   |

### 2.3 Espaçamento

- **Escala**: <!-- ex.: 4pt (4/8/12/16/24/32), 8pt, ou valores formalizados do código -->

| Token | Valor | Origem |
|---|---|---|
|   |   |   |

### 2.4 Raios e sombras

| Token | Valor | Uso | Origem |
|---|---|---|---|
|   |   |   |   |

### 2.5 Iconografia

- **Biblioteca / origem dos ícones**:
- **Tamanhos canônicos**:

---

## 3. Layout

<!-- LLM-ONLY: seção condicional por frente — preencha 3.1 para web, 3.2 para mobile; a que não se aplica vira "N/A — frente não coberta". -->

### 3.1 Breakpoints e grid (web)

| Breakpoint | Valor | Comportamento esperado |
|---|---|---|
|   |   |   |

### 3.2 Classes de tamanho e adaptação (mobile)

- **Orientações suportadas**:
- **Adaptação tablet / telas grandes**:
- **Diferenças iOS / Android**:

### 3.3 Densidade

- **Densidade default**: <!-- ex.: confortável; alta densidade só em tabelas administrativas -->

---

## 4. Tema

- **Modos suportados**: claro | escuro | ambos | segue o SO
- **Estratégia de theming**: <!-- ex.: tokens semânticos (surface/on-surface) sobre paleta literal; ThemeData central; CSS vars por classe -->
- **Tokens semânticos**: <!-- tabela ou "N/A — projeto usa tokens literais (decisão registrada no eixo 4)" -->

---

## 5. Biblioteca de Componentes

<!-- LLM-ONLY: só componentes REUTILIZÁVEIS entre features (regra GLOBAL vs FEATURE da rule comum).
  A coluna Referência é CONTRATO DE REUSO, não metadado: é a referência de import REAL que o código usa
  — ex.: `@/components/ui/input`, `import { Input } from '@acme/ui'`, `lib/shared/widgets/app_input.dart`,
  barrel export. Para componente próprio ela é OBRIGATÓRIA e verificável (o path existe no repo);
  componente sem referência verificável não entra na tabela. Variantes = as que existem, não as desejadas. -->

| Componente | Referência (import / path) | Variantes | Uso canônico |
|---|---|---|---|
|   |   |   |   |

> **Contrato de reuso**: o `design.md` de cada feature e os executores referenciam os componentes **por esta tabela** — criar um input/botão/modal novo em vez de usar a referência canônica é desvio (a `agent-spec-generate-design` exige justificativa + candidatura ao global para componente novo).

---

## 6. Padrões de Feedback Canônicos

<!-- LLM-ONLY: comportamento CONCRETO e verificável (o quê/onde/com qual ação), nunca "mostrar loading" genérico.
  Estes padrões são o default que o design.md de cada feature herda — variação local é sobrescrita sinalizada. -->

| Estado | Padrão canônico | Componente | Origem |
|---|---|---|---|
| Loading |   |   |   |
| Erro |   |   |   |
| Vazio |   |   |   |
| Sucesso / confirmação |   |   |   |
| Ação destrutiva |   |   |   |

---

## 7. Acessibilidade Visual

- **Contraste mínimo**: <!-- ex.: WCAG AA (4.5:1 texto normal) -->
- **Foco visível**:
- **Touch targets (mobile)**: <!-- ex.: mínimo 44×44pt -->
- **Reduced motion**:

---

## 8. Governança

- **Promover token/componente novo ao global**: via `/agent-spec-generate-design` (FASE 3 — promoção confirmada) ou via enriquecimento desta skill. Update sempre cirúrgico.
- **Decisões transversais com trade-off real**: candidatas a ADR (tag `ui`) — registre via `/agent-spec-adr-create`.
- **Divergências código × design system aceitas como débito**: <!-- lista ou "nenhuma" -->

---

## 9. Decisões (árvore — auditável)

> Registro compacto da árvore Chain of Tree que gerou este arquivo. Uma linha por eixo: opção escolhida + alternativas consideradas.

| Eixo | Escolha | Alternativas consideradas | Origem |
|---|---|---|---|
| 1 · Fundações (tokens) | {opção} | {B}, {C} | `[derivado]` / `[figma]` / `[usuário]` |
| 2 · Biblioteca de componentes | {opção} | {B}, {C} | {...} |
| 3 · Layout | {opção} | {B}, {C} | {...} |
| 4 · Tema | {opção} | {B}, {C} | {...} |
| 5 · Padrões de feedback | {opção} | {B}, {C} | {...} |
