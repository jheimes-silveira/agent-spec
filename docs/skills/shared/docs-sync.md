---
id: "agent-spec-docs-sync"
title: "agent-spec-docs-sync"
sidebar_position: 11
---
# agent-spec-docs-sync

`Maintenance`
> **Resumo**: Pente fino contínuo da documentação do site (`docs/site/docs`) contra o estado real do código em `.claude/skills/`, `.claude/agents/` e `.claude/rules/`. Roda em duas fases — **Auditoria** (varre artefatos e produz um relatório de divergências) e **Aplicação** (gera o diff de cada item aprovado e aplica). **NUNCA aplica sozinha**: toda alteração passa por confirmação explícita via `AskUserQuestion`.

---

## Por que existe

Código e documentação derivam com o tempo: uma skill nova nasce sem página, uma flag muda no `SKILL.md` mas não na doc, um capítulo da espinha narrativa fica pendente de migração, um link interno quebra. Sem uma auditoria sistemática, esse débito documental se acumula silenciosamente — e a Referência deixa de ser confiável como fonte de consulta.

`agent-spec-docs-sync` fecha esse ciclo: compara as duas camadas da documentação (espinha narrativa + Referência técnica) com as fontes de verdade, reporta as divergências por severidade e propõe correções — sempre com diff revisável, nunca aplicando direto.

---

## Quando usar

* Depois de mexer em `.claude/skills/`, `.claude/agents/` ou `.claude/rules/` — para garantir que a Referência reflete a mudança (regra de PR-companion do `CLAUDE.md`).
* Antes de cada release — para auditar divergências acumuladas.
* Após adicionar/renomear/remover uma skill — para gerar/atualizar a página da Referência.
* Periodicamente, para evitar acúmulo de débito documental.

## Quando NÃO usar

| Cenário | Por quê |
| --- | --- |
| Documentação ainda em rascunho local (sem commit) | A skill audita o working tree — use após estabilizar |
| `.claude/` em sincronização ativa (várias mudanças em curso) | Espere terminar para evitar relatório inconsistente |
| Você quer migrar UMA Parte específica da espinha narrativa | Use o gabarito em [`/contributing/docs-style-guide`](/contributing/docs-style-guide.html) — a skill é para auditoria, não escrita criativa |
| `docs/site/node_modules` ausente | Rode `npm install` antes — a skill depende de `npm run build` |

---

## Fontes de verdade

| Fonte | Tipo | O que documenta |
| --- | --- | --- |
| `.claude/skills/<slug>/SKILL.md` | Skill | Capacidade/comando disponível ao Claude |
| `.claude/agents/<slug>.md` | Agent | Subagente especializado (gates, executores, geradores) |
| `.claude/rules/*.md` | Rule | Regras carregadas no system-prompt |
| `book_agent_spec/dist/agent-spec.pdf` | PDF | Fonte da espinha narrativa |
| `docs/site/docs/agent-spec-completo.md` | Espelho | Versão consolidada para fatiamento |

**Convenção de grupo da skill** (inferida pelo slug): `sdd-*` → `skills/sdd/` · `minispec-*` → `skills/minispec/` · `taskcard-*` → `skills/taskcard/` · `adr-*` → `skills/adr/` · demais → `skills/shared/`.

---

## As 5 dimensões da auditoria

| # | Dimensão | O que detecta | Severidade típica |
| --- | --- | --- | --- |
| 1 | **Skills/agents/rules sem doc** | Artefato em `.claude/` sem página correspondente na Referência | alta |
| 2 | **Drift de conteúdo** | Comando/flag no `SKILL.md` ausente na doc (média); flag na doc inexistente na fonte (alta); `description` divergente do "Visão Geral" | média/alta |
| 3 | **Capítulos da espinha narrativa pendentes** | Capítulos do PDF (0–25) + Apêndices (A–G) ainda não migrados ou desatualizados | INFO |
| 4 | **Conformidade de gabarito** | Os 7 critérios do guia de estilo (frontmatter, pergunta-guia, callout, diagrama, `## 📚 Aprofundamento na Referência`, links válidos, exercícios com gabarito) | baixa/média |
| 5 | **Links internos quebrados** | `npm run build` falha em links inválidos | alta |

A Dimensão 2 usa **heurísticas simples** (presença/ausência de tokens), não embedding — a skill é determinística.

---

## Fluxo de execução

### FASE 0 — Calibração

Pergunta o **escopo** via `AskUserQuestion`: **Completa** (5 dimensões), **Só código → docs**, **Só espinha narrativa** ou **Só links**.

### FASE 1 — Coleta

Levanta o inventário factual de cada fonte (skills locais, agents, rules, páginas de doc, sumário do PDF). Não interpreta ainda.

### FASE 2 — Análise por dimensão

Executa apenas as dimensões selecionadas, produzindo um item estruturado por divergência (`tipo`, `severidade`, `artefato`, `esperado`, `acao_sugerida`).

### FASE 3 — Apresentação do relatório

Mostra tabela consolidada **antes** de propor mudanças, depois `AskUserQuestion` em **4 ondas** (mesmo padrão de [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html)):

1. **Atalho global** — "Aplicar TODAS / Escolher uma por uma / Só altas / Cancelar".
2. **Altas** (multiSelect, blocos de 4) — se onda 1 = "Escolher um por um".
3. **Médias** — idem.
4. **Baixas** — idem, se ≥ 5 baixas.

Itens **INFO** (pendência de planejamento, ex.: capítulo da espinha narrativa não migrado) não entram em pergunta — viram sugestão de próximos passos.

### FASE 4 — Aplicação com diff revisável

Para cada item aprovado: gera o conteúdo (template da skill ou do guia de estilo), **mostra o diff**, aguarda confirmação e aplica via `Write`/`Edit`.

### FASE 5 — Validação e fechamento

Roda `npm run build` em `docs/site/`. Se passar, mostra resumo (aplicadas, páginas criadas/atualizadas, build OK + pendências INFO). Se falhar, **reverte** as últimas mudanças e reporta o erro.

---

## Comando

```bash
/agent-spec-docs-sync
```

---

## Guardrails invioláveis

| # | Guardrail |
| --- | --- |
| 1 | **NUNCA** sobrescrever conteúdo conceitual existente sem confirmar |
| 2 | **NUNCA** apagar página da Referência (URL pode estar bookmarked) |
| 3 | **NUNCA** rodar `npm run build` em modo silencioso — sempre mostrar o resultado |
| 4 | **SEMPRE** seguir as 7 regras do guia de estilo ao criar capítulo da espinha narrativa |
| 5 | **SEMPRE** preservar URLs existentes; movimentação só com redirect ou link cruzado |
| 6 | **SEMPRE** validar com `npm run build` ao final |
| 7 | **NUNCA** aplica sozinha — toda alteração passa por `AskUserQuestion` |

---

## Skills relacionadas

* [agent-spec-curate-project-rules](/skills/shared/curate-project-rules.html) — avalia se uma convenção vira regra; docs-sync audita se a regra já existente está refletida na doc.
* [agent-spec-semantic-commit](/skills/shared/semantic-commit.html) — registra no git as mudanças de doc que docs-sync aplicar.

---

## Próximos passos

* [Guia de estilo da documentação](/contributing/docs-style-guide.html) — os 7 critérios de gabarito e o inventário de migração.
* [Skills — visão geral](/skills/overview.html) — mapa de todas as skills auditadas.
* [Agents — visão geral](/agents/overview.html) — os agents auditados pela Dimensão 1.
