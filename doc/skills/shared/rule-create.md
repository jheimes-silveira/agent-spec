---
id: "agent-spec-rule-create"
title: "agent-spec-rule-create"
sidebar_position: 10
---
# agent-spec-rule-create

`Compartilhada`
> **Resumo**: Facilitador de autoria de **rules de projeto** a partir de um **tema arquitetural** (acesso a banco, injeção de dependência, gerenciador de estado, tratamento de erro…). Tira o usuário da página em branco: decompõe o tema em eixos (**Chain of Tree**), oferece **3 alternativas por escolha** com recomendação, funciona em **greenfield** (propõe de best-practice + intenção) ou **brownfield** (deriva do código), e entrega uma **rule semente enxuta** + **material de ADR**. Agnóstico de stack.

> Construir uma rule nunca é fácil — e muitas vezes você precisa dela **antes** de iniciar a feature, ao montar a arquitetura. Esta skill é a peça que faltava no **início** da jornada.

---

## Quando usar

* **Início de arquitetura**: estabelecer convenções de um tema **antes** de codar a primeira feature (DB, DI, estado, erro, logging, validação, feature flags…).
* Você quer uma rule de um tema específico e não sabe por onde começar.
* Já existe uma rule do tema, mas está incompleta/defasada (modo **enriquecimento**).

## Quando NÃO usar

| Cenário | Use |
| --- | --- |
| Julgar se um item **pronto** vira rule + definir escopo/matcher | [`agent-spec-curate-project-rules`](curate-project-rules.md) |
| Registrar uma **decisão única** (Nygard) | [`agent-spec-adr-create`](../adr/adr-create.md) |
| Gerar a rule específica de **stack de teste** | [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md) |
| Escrever PRD/spec/tech-spec/taskcard (conteúdo de feature) | Skills `*-generate-*` |

---

## Modos de operação

**Origem da verdade** (auto-detectada pela pegada do tema no código):

| Modo | Quando | Fonte | Saída |
| --- | --- | --- | --- |
| **Brownfield** | tema já tem código | deriva padrões existentes | rule que **codifica o que existe** + aponta inconsistências |
| **Greenfield** | sem/pouco código | best-practice + **sua intenção** | rule **provisória (seed)** + material de ADR |

**Existência da rule**: ausente → **bootstrap** (fluxo completo); presente → **enriquecimento** (árvore só nos deltas).

---

## Chain of Tree

* **Nível 1 — Decomposição**: 3 a 5 eixos **inferidos do tema** (a "superfície de decisão"), apresentados como mapa antes de detalhar.
* **Nível 2 — Ramificação**: cada nó recebe **3 alternativas (A/B/C)** com trade-off + recomendação. Em greenfield a escolha é real (via questionário); em brownfield, a opção A é o padrão detectado.

Exemplos de decomposição (ilustrativos, multi-stack):

| Tema | Eixos inferidos |
| --- | --- |
| Acesso a banco | camada de acesso · migrations · fronteira de transação · mapeamento dados↔domínio · teste |
| Injeção de dependência | mecanismo · lifetime/escopo · composition root · substituição em teste · fronteira injetável |
| Gerenciador de estado | biblioteca/abordagem · granularidade · side-effects/async · persistência · teste |
| Tratamento de erro HTTP | taxonomia · tradução erro→status · formato do corpo · observabilidade · borda de captura |

---

## Anti-bloat: rule enxuta, racional no ADR

A rule **carrega no contexto** → fica **enxuta**: só convenções operacionais (1 linha cada) + "porquê" dos itens críticos + links. As **alternativas consideradas e o racional completo** vão para o **material de ADR** (em `docs/adr/`, fora do contexto). Você ganha o trade-off auditável **sem** inflar o contexto.

A skill aplica as **4 perguntas do teste de fricção** como doutrina interna (anti-bloat) — sem invocar a `curate`.

---

## O que emite

1. **Rule semente enxuta** — em `.claude/rules/{nome}.md` (ou na convenção de rules do host). Marcada **provisória** em greenfield.
2. **Material de ADR** — bloco pronto (Context / Decision / Consequences / Alternatives) para rodar manualmente em `agent-spec-adr-create`.

**Não faz**: scaffold de código · execução de `curate`/`adr-create` · edição de fonte · refactor do `testing-stack`.

---

## Decisão de artefato (sempre editável)

Antes de gravar, a skill **propõe e confirma**:

* **Nome** do arquivo (derivado do tema, ex.: `dependency-injection.md`) — editável.
* **Path match** derivado do host, com 3 alternativas (paths do tema · módulo específico · tipo de arquivo). Matcher **estreito** — nunca `**`.
* **Status**: `provisória` (greenfield) até a 1ª feature backfillar o exemplo real.

---

## Fluxo (passos manuais recomendados)

A skill é **standalone e manual** (`disable-model-invocation: true`). Ao final, o relatório recomenda — sem executar:

* *"Rode `/agent-spec-curate-project-rules` para avaliar escopo/matcher/bloat."*
* *"Se quiser registrar a decisão, rode `/agent-spec-adr-create` — material pronto."*

---

## Skills relacionadas

* [`agent-spec-curate-project-rules`](curate-project-rules.md) — **juíza**: avalia o que esta skill produziu (manual).
* [`agent-spec-adr-create`](../adr/adr-create.md) — **registra** a decisão a partir do material de ADR emitido.
* [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md) — caso especializado (tema "stack de teste").
