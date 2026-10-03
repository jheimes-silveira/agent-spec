---
id: "agent-spec-design-system-bootstrap"
title: "agent-spec-design-system-bootstrap"
sidebar_position: 13
---
# agent-spec-design-system-bootstrap

`Compartilhada`
> **Resumo**: Consolida o **design system GLOBAL** do produto (`design-system.md` em `design_system.global.path`) a partir de três fontes: o design **real implementado no codebase** (tema, tokens, componentes), **definições soltas** que o time já tem (docs, wikis, arquivos avulsos) e **referências de Figma** (MCP, API REST com token, ou export/descrição manual — nunca pré-requisito). Deriva tudo que é detectável e **só pergunta o que NÃO é derivável**. Agnóstica de stack de UI.

> Resolve a dor de "ter definições de design espalhadas mas não conseguir estruturar o arquivo": a skill estrutura **o que existe** — não inventa identidade visual nova.

---

## Quando usar

* O time tem definições de design **espalhadas** (código, Figma, docs soltos) e quer estruturá-las num `design-system.md` canônico — **sem precisar de uma feature como gatilho**.
* **Antes de adotar** o fluxo de design por feature ([`agent-spec-generate-design`](generate-design.md)), para que as features nasçam ancoradas num global já consolidado.
* O `design-system.md` já existe mas está **incompleto ou defasado** (modo enriquecimento).
* Importar tokens/estilos de um arquivo **Figma** para o formato canônico do framework.

## Quando NÃO usar

| Cenário | Use |
| --- | --- |
| Especificar o design de **uma feature** (`design.md`) | [`agent-spec-generate-design`](generate-design.md) |
| Criar identidade visual **do zero** (sem código nem referências) | Trabalho de design humano — a skill estrutura o que existe |
| Feature backend | Não tem design — a skill recusa com orientação |

---

## Comando

```bash
/agent-spec-design-system-bootstrap [links de Figma | paths de docs existentes | descrição livre]
```

O argumento é **opcional** — sem ele, a skill trabalha só com o codebase.

---

## Fronteira com a `generate-design`

|  | `agent-spec-generate-design` | `agent-spec-design-system-bootstrap` |
| --- | --- | --- |
| **Dona de** | `design.md` da **feature** | consolidação standalone do **GLOBAL** |
| **Gatilho** | um `prd.md`/`intent.md` | nenhum — roda a qualquer momento |
| **Toca o global?** | updates **cirúrgicos** (promoção confirmada, crescimento lazy) | bootstrap/enriquecimento completo |
| **Cria design de feature?** | sim | **nunca** — redireciona |

---

## Chain of Tree (consolidação em árvore)

Mesmo protocolo do [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md):

* **Nível 1 — Decomposição (5 eixos)**: fundações (tokens) · biblioteca de componentes · layout (breakpoints/classes de tamanho) · tema (dark mode/theming) · padrões de feedback canônicos.
* **Nível 2 — Ramificação (3 alternativas/nó)**: nó `[derivado]` (código/Figma responde) → não pergunta; nó `[a decidir]` → questionário com recomendação.

**Regra de ouro**: nunca pergunta o que `tailwind.config`, `ThemeData`, variáveis CSS ou os componentes existentes já respondem. Só o não-derivável (padrão canônico quando o código diverge, política de dark mode sem sinal, escala de espaçamento ad-hoc) vira pergunta.

**Precedência entre fontes**: implementado no codebase > Figma/mockup > descrição do usuário. Divergência relevante **não se resolve silenciosamente** — vira nó de decisão (o Figma pode ser a meta e o código, o débito).

---

## Leitura de Figma (nunca bloqueante)

| Rota | Quando | Como |
| --- | --- | --- |
| **MCP de Figma** | disponível na sessão | importa estilos/variáveis/frames |
| **API REST** | usuário tem token (`FIGMA_TOKEN` ou colado) | `GET /v1/files/{key}/styles` + `/variables/local` |
| **Manual** | sem MCP e sem token | pede export/descrição/screenshots; o link fica registrado como referência mesmo sem ser lido |

---

## Dois modos

| Modo | Quando | Comportamento |
| --- | --- | --- |
| **Bootstrap** | `design-system.md` ausente | discovery completo → questionário → gera o arquivo |
| **Enriquecimento** | arquivo presente | diff fontes × arquivo (`vazio`/`stale`/`novo sinal`/`coerente`) → enriquece **só os deltas**. Seções promovidas pela `generate-design` são hand-authored — intocáveis sem confirmação |

Nada é gravado sem aprovação humana, em ambos os modos.

---

## O que gera

O `design-system.md` (template próprio da skill) com: identificação (frentes, stack de UI, fontes) · fundações/tokens (cores, tipografia, espaçamento, raios, iconografia — cada linha com coluna **Origem**: `[derivado]` path / `[figma]` / `[usuário]`) · layout · tema · biblioteca de componentes reutilizáveis com **referência de import canônica** (contrato de reuso: é por ela que executores importam o componente existente em vez de criar outro) · padrões de feedback canônicos **concretos** · acessibilidade visual · governança · tabela **"Decisões (árvore)"** (auditável).

Consumidores: [`agent-spec-generate-design`](generate-design.md) (âncora principal), tech-spec, scope, geradores de tasks e [`agent-spec-qa-validator`](../../agents/qa-validator.md) (Camada 4 — estados visuais). Veja [Design — Dois Níveis](../../configuration/framework-paths.md).

---

## Skills relacionadas

* [`agent-spec-generate-design`](generate-design.md) — design por feature; promove novidades ao global cirurgicamente.
* [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md) — mesmo padrão de bootstrap (derive antes de perguntar, Chain of Tree, enriquecimento).
* [`agent-spec-adr-create`](../adr/adr-create.md) — decisões transversais de design (tag `ui`) detectadas no questionário viram recomendação de ADR.
