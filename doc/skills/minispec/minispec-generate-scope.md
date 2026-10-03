---
id: "agent-spec-minispec-generate-scope"
title: "agent-spec-minispec-generate-scope"
sidebar_position: 3
---
# agent-spec-minispec-generate-scope

`miniSpec` `Generator`
> **Resumo**: Segunda etapa do framework miniSpec. Recebe uma INTENT aprovada e gera `scope.md` — define **COMO** a feature será implementada, com limites claros do que está dentro e fora do escopo. Conecta INTENT (O QUE) às TASKS (execução).

---

## Quando usar

* Após `intent.md` aprovado.
* Antes de [agent-spec-minispec-generate-tasks](minispec-generate-tasks.md).

## Quando NÃO usar

* INTENT em rascunho/não aprovada.
* Pipeline SDD → use [agent-spec-sdd-generate-tech-spec](../sdd/sdd-generate-tech-spec.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `intent.md` | Usuário (argumento) | Sim |
| `tech-alignment.md` | [agent-spec-generate-tech-alignment](../shared/generate-tech-alignment.md) | Não (recomendado) |
| `docs/adr/INDEX.md` | Existente no projeto | Não |
| Codebase | Pesquisa obrigatória | Sim |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `scope.md` | `minispec.scope.path` → `/docs/specs/features/{feature}/{version}/scope.md` | [agent-spec-minispec-generate-tasks](minispec-generate-tasks.md) |

---

## Princípio fundamental

O SCOPE transforma a INTENT em **definições técnicas concretas**. Responde **COMO** a feature será implementada.

### Regras obrigatórias

* Basear-se **exclusivamente** na INTENT fornecida.
* **NÃO** adicionar funcionalidades não mencionadas na INTENT.
* Ser **específico** sobre o que está DENTRO e FORA do escopo.

---

## Fluxo de execução

### FASE 1 — Leitura e pesquisa

1. Lê INTENT completa.
2. Lê `tech-alignment.md` (se existir).
3. Lê `docs/adr/INDEX.md` (se existir) para reaproveitar padrões transversais.
4. **Carrega glossários de domínio (2 níveis)**: `domain_glossary.global.path` (`/docs/specs/domain-glossary.md`, cross-feature) + `domain_glossary.feature.path` (`/docs/specs/features/{feature}/domain-glossary.md`, específico). Precedência: feature sobrescreve global em conflito (raro; sinaliza). Use terminologia combinada nos nomes de componentes, contratos e fluxos do scope. Skill **lê e valida** — não escreve. Termos novos identificados ficam para `/agent-spec-challenge-spec` canonizar. Veja [Glossário de domínio (2 níveis)](../../agent-spec-completo.md#18-glossário-de-domínio-2-níveis).
5. Pesquisa codebase: camadas, padrões, código reutilizável.

### FASE 0.2.0 — Inventário de ADRs Aplicáveis (OBRIGATÓRIO se `docs/adr/` existe) ⚡

Antes de redigir definições técnicas (FASE 2), a skill DEVE produzir inventário declarativo a ser inserido em uma sub-seção de §5 (Observações) do SCOPE com título "ADRs Aplicáveis nesta Feature":

1. Listar todas as ADRs em `docs/adr/INDEX.md` com status `Accepted`.
2. Para cada ADR: classificar como **APLICÁVEL** / **PARCIAL** / **N/A**, citando o ponto do scope que será afetado.
3. Para cada ADR `APLICÁVEL`/`PARCIAL`, adicionar **bullet em §3 do SCOPE** mostrando como a feature obedece. Exemplo: "ADR-0010 — todas as tags `form:`/`json:` dos Requests/Responses em §3.3 usam identificadores em inglês."

> **Motivação (post-mortem `cadastro-pratos-franquia`)**: ADR-0010 (idioma de identificadores) só foi detectada no Tech Review de T7, cascateando correções para T5/T6. Inventário explícito no SCOPE evita que o gerador de tasks omita a regra.

Quando `docs/adr/` não existe: marca `Sem ADRs ativas no projeto`.

### FASE 0.0 — Detecção da Variante (Web | Mobile | Backend) — SEMPRE PERGUNTAR

**Primeira ação da skill, antes de qualquer leitura/pesquisa.** A variante determina qual template carregar (FASE 3) e quais definições técnicas priorizar.

**Regra dura**: a pergunta é **OBRIGATÓRIA** e **SEMPRE** disparada via `AskUserQuestion`. Tech-alignment, quando presente, apenas pré-preenche a sugestão — **não** substitui a confirmação explícita.

**Procedimento**:

1. **Pré-leitura opcional do tech-alignment** (só para sugerir default):
   * Se `tech-alignment.md` existir, busca referência inequívoca a uma frente (Flutter, React, iOS, Angular, Node, Go, etc.).
   * Alta confiança → reserva essa variante como **opção destacada** ("Recomendado pelo tech-alignment") na pergunta.
2. **Pergunta obrigatória** (sempre via `AskUserQuestion`):
   > "Qual é a frente deste SCOPE? `Web` | `Mobile` | `Backend`"
   >
   > Mantém as 3 opções disponíveis, mesmo com pré-detecção.

**Persistência:**

* Carrega o template correspondente na FASE 3.
* Grava `variant: web|mobile|backend` no `minispec_state.yaml` (raiz e `steps.scope`).
* Preenche o campo `Variante` no cabeçalho do SCOPE.

> **Por que SEMPRE perguntar**: tech-alignment é opcional, frequentemente ausente ou impreciso. Inferência silenciosa já levou a templates errados em features mistas. Pergunta explícita custa 1 turn e elimina ambiguidade.

### FASE 0.1.5 — Verificar Design (opcional — só variantes web/mobile)

1. Variante `backend` (FASE 0.0) → **pula o passo** — backend não tem design.
2. Resolve os dois paths da seção "Design — Dois Níveis" de `agent-spec-workflow-rules.md`: `design_system.global.path` (`/docs/specs/design-system.md`) e `design.feature.path` (`/docs/specs/features/{feature}/{version}/design.md`).
3. **Se o `design.md` da feature existir**, ele é a fonte de verdade do COMO VISUAL: a skill preenche o campo **"Design de referência"** no §3.1 do SCOPE com o path, e a coluna Descrição da tabela de Páginas/Telas **referencia** a seção correspondente do design (ex.: "ver design.md §4.1") em vez de redescrever layout/estados — duplicar cria duas fontes que divergem. Conflito entre design.md e codebase → levanta via `AskUserQuestion` antes de prosseguir.
4. **Se não existir** → fluxo normal; ausência **não é erro** (é o default de features sem fluxo de design). "Design de referência" fica `—`.

Quem cria o `design.md` é a skill [agent-spec-generate-design](../shared/generate-design.md) — esta skill apenas lê e referencia.

---

### FASE 2 — Construção do SCOPE

* Componentes envolvidos (handlers, services, repositories, etc.).
* Fluxos técnicos.
* Schemas/contratos relevantes.
* Limites explícitos (DENTRO / FORA do escopo).
* Referência a ADRs aplicáveis (resultado da FASE 0.2.0).

#### Subseção 3.1.1 — Exemplo de Payload por Endpoint (`PUT`/`PATCH` parcial)

Para cada endpoint que aceita **atualização parcial** (`PUT`/`PATCH` cujo CA diga "campos opcionais", "multipart parcial"), o template backend (seção 3.1.1) exige:

1. Exemplo de body/form **mínimo** (só com 1 campo).
2. Observação literal: "campos ausentes são ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request — apenas o ID na URL é obrigatório".
3. Diferenciar do `POST` correspondente.

> **Motivação**: T9 do post-mortem gastou rodada extra porque o executor copiou `binding:"required"` do `POST` para o `PUT`. Payload-exemplo explícito elimina a ambiguidade.

### FASE 4 — Salvamento e aprovação

Resolve `minispec.scope.path` e salva o `scope.md`. **Pede aprovação ao usuário ANTES de tocar o estado** ("Esse escopo está fechado e aprovado? sim/não"). Ordem inviolável: aprovação → estado.

### FASE 5 — Estado do Pipeline (após o "sim")

Só após o "sim" atualiza `minispec_state.yaml` para `scope: completed` — se "não", **não** atualiza o estado, coleta ajustes e revisa o scope. Atualiza também o bloco `tech_alignment`: `completed` quando o `tech-alignment.md` existe e foi usado (FASE 0.1), ou `skipped` quando ausente — sem isso o step ficaria `pending` para sempre, já que a skill compartilhada de tech-alignment não escreve no `minispec_state.yaml`.

---

## Gates invocados

Nenhum gate de validação. Pode invocar [agent-spec-adr-create](../adr/adr-create.md) se detectar candidato a ADR (heurísticas: transversal + tag canônica + custo de reversão).

---

## Templates / assets usados

A skill seleciona o template conforme a **variante** (`web | mobile | backend`) decidida em FASE 0.0:

| Variante | Template | Seções-chave |
| --- | --- | --- |
| **Web** | `scope_template_web.md` | Páginas/Componentes, Estado (Redux/Zustand/Context/Signals), Integração com APIs, i18n/a11y, Feature Flags, Arquivos Envolvidos |
| **Mobile** | `scope_template_mobile.md` | Telas/Componentes, Estado (BLoC/Riverpod/Provider), Integração com Hardware (câmera/GPS/biometria/NFC), Offline-first (banco local + resolução de conflitos) |
| **Backend** | `scope_template_backend.md` | Endpoints/Rotas (método + auth + status), Banco de Dados (tabelas + migrações), Services/Regras de Negócio, Integrações Externas, Observabilidade |

A variante escolhida é gravada em `minispec_state.yaml` (raiz e em `steps.scope`) e no cabeçalho do SCOPE.

> Veja também: [Variantes do Scope — referência completa](../../reference/scope-variants.md)

---

## Exemplo de uso

```bash
/agent-spec-minispec-generate-scope docs/specs/features/catalogo-filtros/v1/intent.md
```

```
[Lê intent.md, tech-alignment se existir, ADR index, codebase]
[Constroi SCOPE com limites claros]

✅ scope.md salvo em /docs/specs/features/catalogo-filtros/v1/scope.md
Próximo passo: /agent-spec-minispec-generate-tasks <intent.md> <scope.md>
```

---

## Skills relacionadas

* [agent-spec-minispec-generate-intent](minispec-generate-intent.md) — etapa anterior.
* [agent-spec-generate-tech-alignment](../shared/generate-tech-alignment.md) — entrada opcional.
* [agent-spec-minispec-generate-tasks](minispec-generate-tasks.md) — próxima etapa.
* [agent-spec-sdd-generate-tech-spec](../sdd/sdd-generate-tech-spec.md) — equivalente formal SDD.

## Configuração via framework-paths.md

Paths usados: `minispec.intent.path`, `minispec.scope.path`, `tech_alignment.path`, `minispec.state.path`, `adr.index_file`. Veja [Path Templates](../../configuration/path-templates.md).
