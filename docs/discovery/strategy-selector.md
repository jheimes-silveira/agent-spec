---
id: "strategy-selector"
title: "Strategy Selector"
sidebar_position: 3
---
# Strategy Selector

O **Strategy Selector** recomenda qual dos caminhos usar com base na **complexidade que emergiu do brainstorm**. Aplicado automaticamente em `/agent-spec-pre-refinement` (Etapa 4 — após a convergência da árvore de rumos), preenche a **seção 15** do `pre-refinement.md`.

> **Sugestão informada, não bloqueante**. Você sempre pode rodar outro framework.

---

## As 3 dimensões de complexidade

| Dimensão | Pergunta | Faixa |
| --- | --- | --- |
| **Amplitude** | Quantos rumos / user stories sobreviveram à convergência? | `0` / `1` / `2-3` / `4+` |
| **Personas** | Quem é afetado além do dev? | `só dev` / `dev+1` / `múltiplas personas` |
| **Novidade** | Ajuste pontual, incremento a módulo, ou módulo/produto novo? | `ajuste` / `incremento` / `greenfield` |

**Sinal de apoio** (inferido silenciosamente): **decisão arquitetural transversal nova?** — se `sim`, tende a virar ADR e puxa para SDD.

> A skill **infere** as dimensões a partir do brainstorm e só pergunta (máx. 2 perguntas) quando não inferiu com confiança.

---

## Tabela de decisão

Favoreça sempre o framework **mais leve** que atende:

| Framework | Quando |
| --- | --- |
| **Conversa direta** | `0` rumos reais + exploração/spike + `<1h` (ex.: "como funciona X?") |
| **TaskCard** | `0-1` rumo, `só dev`, ajuste pontual, sem decisão arquitetural. Se for CRUD repetindo pattern já estabelecido → sugira `--mode=crud-fastpath` |
| **miniSpec** | `2-3` rumos, `só dev`/`dev+1`, incremento, sem decisão arquitetural transversal nova |
| **SDD** | `4+` rumos **OU** múltiplas personas **OU** decisão arquitetural nova **OU** greenfield |

### Desempate (zona cinza)

1. Qualquer sinal SDD (`múltiplas personas`, decisão arquitetural nova, `greenfield`) → **SDD vence**.
2. Senão, `2+` rumos → **miniSpec**.
3. Senão → **TaskCard**.

---

## TaskCard CRUD Fast-Path ⚡

Quando o rumo é um **CRUD que repete um pattern já estabelecido no projeto** (handler/service/repository do mesmo formato de outro recurso, sem decisão arquitetural nova), o comando 15.4 sugerido é:

```
/agent-spec-taskcard-generate --mode=crud-fastpath ""
```

Efeitos: 1 TaskCard atômica, template enxuto, `gates: [qa]` (pula Tech Review), QA test-gen batched. Tempo alvo 30-45min vs ~2h no fluxo Standard.

> **Motivação**: o post-mortem `cadastro-pratos-franquia` (CRUD de 4 campos) levou ~4h por overhead estrutural (10 tasks, Tech Review por default em wiring trivial). O Fast-Path ataca esse overhead onde a complexidade real é baixa.

---

## Princípios anti-viés

1. **Não recomende SDD por default** — SDD só quando personas/novidade/arquitetura justificam.
2. **Favoreça o framework mais leve que atende** — em empate, desça (SDD → miniSpec → TaskCard → Conversa).
3. **Sempre preencha a seção 15.3** (por que NÃO o vizinho mais próximo) — obriga raciocínio inverso; é a salvaguarda mais importante contra viés.
4. **Respeite overrides explícitos** — se o usuário disse "quero SDD", registre como override.
5. **Decisão arquitetural transversal nova** → recomende `/agent-spec-adr-create` **antes** do comando do framework.

---

## Formato da seção 15 no pre-refinement.md

```markdown
## 15. Recomendação de Framework
### 15.1 Complexidade Observada
| Dimensão | Valor detectado | Confirmação |
|---|---|---|
| Amplitude — # rumos/US | 2-3 | inferido |
| Personas | dev + 1 | confirmado |
| Novidade | incremento | inferido |
| Decisão arquitetural transversal nova? | não | inferido |
### 15.2 Framework Recomendado
\*\*Escolhido\*\*: miniSpec
\*\*Justificativa\*\*: amplitude 2-3 rumos + dev+1 + sem decisão arquitetural → incremento
em módulo existente não justifica formalização PRD.
### 15.3 Alternativas Consideradas
\*\*Por que NÃO SDD\*\*: sem decisão arquitetural nem múltiplas personas.
\*\*Por que NÃO TaskCard\*\*: 3 rumos distintos não cabem em 1 task única.
### 15.4 Próximo Passo
/agent-spec-minispec-generate-intent "sistema de filtros e ordenação no catálogo"
### 15.5 Quando Reconsiderar
- \*\*Upgrade para SDD\*\* se: >4 rumos emergirem, decisão arquitetural nova, persona nova.
- \*\*Downgrade para TaskCard\*\* se: escopo se fechar a 1 módulo, zero integrações novas.
```

---

## Exemplos concretos

| Input | Amplitude | Personas | Novidade | → Recomendação |
| --- | --- | --- | --- | --- |
| "Como usar `context.WithTimeout` em Go?" | 0 | só dev | spike | **Conversa direta** |
| "Validar CPF no /users/register" | 0-1 | só dev | ajuste | **TaskCard** |
| "CRUD de pratos de franquia (repete pattern existente)" | 1 | só dev | incremento | **TaskCard CRUD Fast-Path** ⚡ |
| "Filtros e ordenação no catálogo" | 2-3 | dev+1 | incremento | **miniSpec** |
| "Backend de figurinhas da Copa do zero" | 4+ | múltiplas | greenfield | **SDD** |

---

## Aviso downstream e instrumentação

Quando invocar [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html), [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) ou [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html): a skill verifica se existe `pre-refinement.md` e, se a recomendação foi **diferente**, emite aviso **não-bloqueante**. O state registra `source`: `recommended` / `overridden` / `no_discovery` — permite medir aderência ao longo do tempo.

---

## Próximos passos

* [agent-spec-pre-refinement](/discovery/pre-refinement.html) — fluxo que aplica o Strategy Selector.
* [Brainstorm (Tree of Thought)](/discovery/brainstorm.html) — etapa anterior (divergir antes de convergir).
* [Frameworks — Overview](/frameworks/overview.html) — comparativo dos caminhos.
