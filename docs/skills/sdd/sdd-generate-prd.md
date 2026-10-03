---
id: "agent-spec-sdd-generate-prd"
title: "agent-spec-sdd-generate-prd"
sidebar_position: 1
---
# agent-spec-sdd-generate-prd

`SDD` `Generator`
> **Resumo**: Primeira etapa do framework SDD. Conduz processo interativo (uma pergunta por vez) para gerar `prd.md` — define **O QUE** e **POR QUÊ**, sem detalhes técnicos. Ponto de partida do pipeline SDD.

---

## Quando usar

* Iniciar uma feature grande (≥ 4 User Stories, multi-persona, greenfield, ADRs novas).
* Quando o [Strategy Selector](/discovery/strategy-selector.html) recomendou SDD no `pre-refinement.md`.
* Sempre antes de [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html).

## Quando NÃO usar

* Feature pequena (1-3 US, 1 persona, sem ADR nova) → use [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html).
* Task isolada (1-3 arquivos) → use [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html).
* Spike/aprendizado → [Conversa direta](/frameworks/conversa-direta.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `$ARGUMENTS` (descrição da feature em texto livre) | Usuário | Sim |
| `pre-refinement.md` | [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) | Não (recomendado) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim (carregado automaticamente) |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `prd.md` | `sdd.prd.path` → `/docs/prds/features/{feature}/{version}/prd.md` | [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html), [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) |
| `sdd_state.yaml` | `sdd.state.path` → `/docs/specs/features/{feature}/{version}/sdd_state.yaml` | [agent-spec-sdd-run-tasks](/skills/sdd/sdd-run-tasks.html) (estado do pipeline) |

---

## Fluxo de execução

### FASE 0 — Pré-verificação

Lê `pre-refinement.md` (se existir) e checa se a recomendação de framework é SDD. Se divergente, emite aviso não-bloqueante via `AskUserQuestion`. Registra `source` em `sdd_state.yaml`:

* `recommended` — usuário seguiu a recomendação
* `overridden` — usuário divergiu
* `no_discovery` — não havia agent-spec-pre-refinement

### FASE 0.3 — Glossário de Domínio (2 níveis)

Carrega ambos os glossários se existirem:

* `domain_glossary.global.path` — `/docs/specs/domain-glossary.md` (termos cross-feature, canônicos do projeto).
* `domain_glossary.feature.path` — `/docs/specs/features/{feature}/domain-glossary.md` (termos específicos da feature).

**Precedência**: feature sobrescreve global em conflito (raro; sinaliza ao usuário quando ocorre). Use a terminologia combinada nos textos do PRD (User Stories, CAs, descrições).

> Skill **lê e valida** — não escreve. Termos novos identificados durante a entrevista ficam para `/agent-spec-challenge-spec` canonizar com decisão de nível (global vs feature). Veja [Glossário de domínio (2 níveis)](/agent-spec-completo.html#18-glossário-de-domínio-2-níveis).

### FASE 1 — Construção interativa do PRD

**Uma pergunta por vez**. A skill **não pede aprovação seção a seção** — coleta as respostas e submete o PRD a **uma única validação no resumo final** (pedir "aprova?" a cada seção dobra os turns sem ganho).

Inclui apenas:

* Comportamento esperado (O QUE)
* Motivação (POR QUÊ)
* Personas (PARA QUEM)
* Regras de negócio de alto nível
* Escopo (incluído / excluído)
* Critérios de aceite comportamentais (DADO/QUANDO/ENTÃO)
* Métricas de sucesso
* Riscos e restrições

### FASE 2 — Salvamento

**Verificação mecânica pré-save (obrigatória)** — antes de salvar, a skill executa um cruzamento determinístico sobre a tabela de rastreabilidade (§12):

1. Lista US sem nenhum CA relacionado (US órfã).
2. Lista CA que não aparece em nenhuma linha da tabela (CA órfão).
3. Lista IDs pulados nas sequências US-XX e CA-XX.

Se **qualquer** lista for não-vazia, a skill volta ao usuário (completar a cobertura ou justificar a remoção) — **não salva com órfãos**.

Em seguida:

* Resolve path via `sdd.prd.path` e salva o arquivo físico.
* Cria `sdd_state.yaml` com `source` (recommended/overridden/no\_discovery), feature e o bloco `steps` completo.
* Estrutura do `sdd_state.yaml`:

```yaml
feature: ""
current\_step: prd
source: recommended # recommended | overridden | no\_discovery
source\_note: ""
steps:
prd:
status: completed
summary: " US,  CA. "
tech\_alignment:
status: pending
tech\_spec:
status: pending
design:
status: pending # só frentes web/mobile — atualizado por agent-spec-generate-design
validation:
status: pending # atualizado por agent-spec-challenge-spec (etapa opcional); se pulada, o task-plan marca skipped
task\_plan:
status: pending
execution:
status: pending
```

Se o arquivo já existir (revisão do PRD), atualiza apenas o bloco `prd` e reseta os steps posteriores para `pending`.

### FASE 6 — Tech Alignment (opcional, pós-aprovação)

Após aprovação do PRD, a skill pergunta se há **pontos de alinhamento técnico** que mereçam registro curto antes do tech\_spec (decisões de stack/biblioteca/integração já tomadas pelo time, restrições de runtime, ADRs aplicáveis pré-existentes).

* **Se sim** → orienta o usuário a invocar [`/agent-spec-generate-tech-alignment`](/skills/shared/generate-tech-alignment.html) passando `prd.md` + descrição técnica curta. Skill atual **não cria** o tech-alignment — apenas sinaliza.
* **Se não** → o próximo passo direto é `/agent-spec-sdd-generate-tech-spec`.

> Tech-alignment é **opcional**. Skills `agent-spec-sdd-generate-tech-spec` e `agent-spec-minispec-generate-scope` lidam com sua ausência sem problema. Quando presente, é apenas mais um input para a geração da spec.

---

## NUNCA inclui (foco no O QUÊ, não no COMO)

* Endpoints, rotas, URLs.
* Arquitetura, camadas, design patterns.
* Banco, tabelas, colunas, queries.
* Models, structs, interfaces, tipos.
* UI técnica (componentes, frameworks).
* Nomes de tecnologias (Firebase, Redis, Kafka, PostgreSQL, etc.).

> Se o usuário insistir em detalhe técnico, registra como Premissa/Restrição com tag `[DELEGAR_TECH_SPEC]` para o próximo passo.

---

## Gates invocados

Nenhum. Esta skill é puramente de **geração interativa**. Não executa testes nem valida arquitetura.

---

## Templates / assets usados

* `assets/prd_template.md` — estrutura canônica do PRD (User Stories, Critérios de Aceite, Personas, KPIs).

---

## Exemplo de uso

A skill aceita opcionalmente um **path para `pre-refinement.md`** junto com a descrição — quando passado, dispensa a inferência de `{feature}`/`{version}` para localizar o discovery.

```bash
# Texto livre (skill resolve o pre-refinement.md via template path)
/agent-spec-sdd-generate-prd "novo módulo de pagamentos com suporte a PIX, cartão e boleto"
# Texto + path explícito do agent-spec-pre-refinement (recomendado quando você já o tem)
/agent-spec-sdd-generate-prd "novo módulo de pagamentos" docs/specs/features/pagamentos/v1/pre-refinement.md
# Só o path — a ideia é extraída das seções 2-6 do próprio agent-spec-pre-refinement
/agent-spec-sdd-generate-prd docs/specs/features/pagamentos/v1/pre-refinement.md
```

A skill detecta `pre-refinement.md` (explícito ou inferido), valida recomendação SDD, e abre processo interativo:

```
Pergunta 1/N: Qual é o problema central que essa feature resolve?
> ...
Pergunta 2/N: Quais personas estão envolvidas?
> ...
[continua até PRD completo aprovado]
✅ PRD salvo em /docs/prds/features/pagamentos/v1/prd.md
✅ sdd\_state.yaml criado.
Próximo passo: /agent-spec-generate-tech-alignment  (opcional)
ou /agent-spec-sdd-generate-tech-spec 
```

---

## Skills relacionadas

* [agent-spec-pre-refinement](/skills/shared/pre-refinement.html) — entrada universal antes do PRD.
* [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html) — opcional, captura decisões técnicas curtas após o PRD.
* [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) — próxima etapa.
* [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html) — equivalente leve para feature pequena.

## Configuração via framework-paths.md

Paths usados: `pre_refinement.path`, `sdd.prd.path`, `tech_alignment.path`, `sdd.state.path`. Veja [Path Templates](/configuration/path-templates.html).
