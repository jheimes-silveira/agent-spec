---
name: agent-spec-docs-sync
description: >-
  Faz um pente fino na documentação do site (docs/site/docs) comparando com o
  estado real do código em .claude/skills/, .claude/agents/ e .claude/rules/.
  Reporta divergências (skill/agent/rule sem doc, doc com flag inexistente,
  capítulos da espinha narrativa pendentes de migração, links internos quebrados, ausência
  de callouts ou diagramas em capítulos da espinha narrativa) e propõe atualizações com
  diff revisável — nunca aplica sozinha. Use sempre que terminar uma alteração
  em .claude/skills, .claude/agents ou .claude/rules; antes de cada release;
  ou periodicamente para evitar acúmulo de débito documental. Acione também
  quando o usuário disser "auditar docs", "pente fino na documentação",
  "checar se a doc reflete o código", "/agent-spec-docs-sync", "sincronizar docs" ou
  pedir uma revisão geral do site.
---

# /agent-spec-docs-sync — auditoria contínua da documentação

Skill de **pente fino + atualização** da documentação. Roda em duas fases:

1. **Auditoria** — varre artefatos do framework e produz um relatório de divergências.
2. **Aplicação** — para cada divergência aprovada pelo usuário, gera o diff e aplica.

A skill **NUNCA aplica sozinha**. Toda alteração passa por confirmação explícita do usuário (via `AskUserQuestion`).

---

## Onde mora cada fonte

| Fonte de verdade | Tipo | O que documenta |
|---|---|---|
| `.claude/skills/<slug>/SKILL.md` | Skill | Capacidade/comando disponível ao Claude |
| `.claude/agents/<slug>.md` | Agent | Subagente especializado (gates, executores, geradores) |
| `.claude/rules/*.md` | Rule | Regras carregadas no system-prompt |
| `docs/site/docs/agent-spec-completo.md` | Espelho | **Fonte canônica da espinha narrativa** para esta auditoria (versão consolidada para fatiamento). O PDF original (`book_agent_spec/dist/agent-spec.pdf`) não é versionado neste repo — não dependa dele |

**Saída da auditoria mapeia para:**

| Camada da documentação | Esperado | Caminho |
|---|---|---|
| 📖 Espinha narrativa | Capítulos fatiados do PDF | `docs/site/docs/{prefacio,capitulo-0,partes/parte-N/*,apendices/*}.md` |
| 🔧 Referência — Skills | 1 página por skill | `docs/site/docs/skills/<grupo>/<slug>.md` |
| 🔧 Referência — Agents | 1 página por agent | `docs/site/docs/agents/<slug>.md` |
| 🔧 Referência — Configuração | Reflexo das rules | `docs/site/docs/configuration/*.md` + `docs/site/docs/concepts/framework-paths.md` |
| 🔧 Referência — Pipeline/Advanced/Customization/Observability | Detalhamento técnico | `docs/site/docs/{pipeline,advanced,customization,observability}/*.md` |

---

## Fluxo de trabalho

### FASE 0 — Calibração

Pergunte ao usuário **o escopo da auditoria** via `AskUserQuestion`:

| Opção | O que faz |
|---|---|
| **Completa** (recomendada antes de release) | Audita todas as 5 dimensões abaixo |
| **Só código → docs** | Detecta skills/agents/rules novos ou modificados sem reflexo nas docs |
| **Só espinha narrativa** | Detecta capítulos do PDF ainda não migrados ou desatualizados |
| **Só links** | Apenas valida links internos (`npm run build` falha em quebrados) |

A partir daqui, execute apenas as dimensões selecionadas.

### FASE 1 — Coleta

Levante o inventário factual de cada fonte. **Não interprete** ainda.

```bash
# Skills locais (excluir symlinks de outros repos)
find .claude/skills -maxdepth 2 -name SKILL.md -not -path '*/node_modules/*' | sort

# Agents
find .claude/agents -maxdepth 1 -name '*.md' | sort

# Rules
ls -1 .claude/rules/*.md

# Páginas de doc
find docs/site/docs -name '*.md' -not -path '*/.vitepress/*' | sort

# Conteúdo do PDF (extraído como texto para casamento)
# Use o PDF como referência conceitual; não o re-extraia se já houver versão recente.
```

Persista um inventário tabular em memória para a Fase 2 (não em disco).

### FASE 2 — Análise por dimensão

#### Dimensão 1 — Skills/Agents/Rules sem doc

Para cada `SKILL.md`/agent/rule, verifique existência da página correspondente em `docs/site/docs/skills/<grupo>/<slug_doc>.md` (ou equivalente).

**Mapeamento slug da pasta → slug da doc**: as pastas das skills usam o prefixo de distribuição `agent-spec-` (ex.: `agent-spec-sdd-generate-prd`); as páginas do site **não** usam o prefixo (ex.: `skills/sdd/sdd-generate-prd.md`). Derive `slug_doc = slug_pasta` **sem** o prefixo `agent-spec-`.

**Convenção de grupo da skill** (inferida pelo slug da pasta):
- `agent-spec-sdd-*` → `skills/sdd/`
- `agent-spec-minispec-*` → `skills/minispec/`
- `agent-spec-taskcard-*` → `skills/taskcard/`
- `agent-spec-adr-*` → `skills/adr/`
- Demais (`agent-spec-<resto>`) → `skills/shared/`

**Agents**: mesma regra de strip do prefixo (`agent-spec-qa-validator.md` → `docs/site/docs/agents/qa-validator.md`), com uma exceção mapeada: `agent-spec-staff-architecture-review.md` → `agents/staff-architecture-review-agent.md`.

Produza item:

```yaml
- tipo: skill_sem_doc
  severidade: alta
  artefato: .claude/skills/agent-spec-foo-bar/SKILL.md
  esperado: docs/site/docs/skills/<grupo>/foo-bar.md
  acao_sugerida: criar página da skill seguindo o gabarito da Referência
```

#### Dimensão 2 — Drift de conteúdo

Para cada par `(SKILL.md|agent|rule, página de doc)` existente, comparar com `grep` semântico:

- Comandos/flags mencionados no `SKILL.md` que **não aparecem** na doc → divergência (severidade `media`).
- Comandos/flags mencionados na doc que **não existem** no SKILL atual → divergência (severidade `alta` — pode confundir).
- Frontmatter `description` divergente do "Visão Geral" da página em > 30% das palavras-chave → divergência (severidade `media`).

Cuidado: use **heurísticas simples** (presença/ausência de tokens), não embedding. A skill é determinística.

#### Dimensão 3 — Capítulos da espinha narrativa pendentes

**Derive o inventário do espelho** `docs/site/docs/agent-spec-completo.md` (fonte canônica): extraia os headings de capítulo/apêndice (`grep "^# \|^## "` no espelho) e compare com o estado em `docs/site/docs/` usando a convenção de paths:

| Elemento do espelho | Path esperado no site |
|---|---|
| Prefácio | `docs/site/docs/prefacio.md` |
| Capítulo 0 | `docs/site/docs/capitulo-0.md` |
| Capítulo N (dentro da Parte M) | `docs/site/docs/partes/parte-M/capitulo-N.md` (+ exercícios quando o espelho os tiver) |
| Apêndice X | `docs/site/docs/apendices/X-*.md` |

> **NÃO hardcode o inventário** (contagens de capítulos/apêndices fossilizam — o espelho é quem dita o que existe). Se um capítulo existe no site mas não no espelho, reporte como `espelho_desatualizado` (severidade media) em vez de pendência do site.

Para cada capítulo do espelho **ausente** no site, gere item `capitulo_pendente` com o trecho-fonte correspondente no espelho.

#### Dimensão 4 — Conformidade de gabarito (só capítulos da espinha narrativa)

Para cada arquivo em `docs/site/docs/{prefacio,capitulo-0,partes/**,apendices/**}.md`, valide os 7 critérios do guia de estilo:

1. Frontmatter com `title` (aspas se `:`) + `description`.
2. Pergunta-guia + analogia âncora (só no `index.md` da Parte).
3. ≥ 1 callout se há decisão de design ou armadilha.
4. ≥ 1 diagrama Mermaid ou componente Vue se há fluxo/escala/enumeração.
5. Seção `## 📚 Aprofundamento na Referência` com 1–3 links.
6. Links internos válidos (verificável via `npm run build`).
7. Exercícios da Parte com gabarito no Apêndice F.

Cada critério falho gera item de severidade `baixa` (cosmético) ou `media` (perda de padrão).

#### Dimensão 5 — Links internos quebrados

Rode `npm run build` em `docs/site/`. Falha aponta link quebrado. Cada link inválido vira item severidade `alta`.

```bash
cd docs/site && npm run build 2>&1 | grep -E "(broken|missing|404|cannot find)" || echo "build ok"
```

### FASE 3 — Apresentação do relatório

Mostre tabela consolidada **antes de propor mudanças**:

```text
Pente fino da documentação — relatório

📊 Resumo
   • Skills sem doc: 0
   • Drift de conteúdo: 2 (medio)
   • Capítulos pendentes: 6 (de 25)
   • Gabarito incompleto: 3 (baixo)
   • Links quebrados: 0
   ────────────────────────
   Total: 11 divergências

🔴 ALTA — 0
🟡 MEDIA — 2
🟢 BAIXA — 3
🔵 INFO (pendência sem ação imediata) — 6

[Tabela detalhada por dimensão]
```

Em seguida, **`AskUserQuestion` em 4 ondas** (mesmo padrão de `/agent-spec-debt-resolution`):

| Onda | Pergunta | Quando |
|---|---|---|
| 1 — Atalho global | "Aplicar TODAS as recomendadas / Escolher uma por uma / Só altas / Cancelar" | Sempre |
| 2 — Altas | "Aplicar as N altas? (multiSelect, blocos de 4)" | Se onda 1 = "Escolher um por um" |
| 3 — Médias | "Aplicar as N médias?" | Se onda 1 = "Escolher um por um" |
| 4 — Baixas | "Aplicar as N baixas?" | Se onda 1 = "Escolher um por um" + ≥ 5 baixas |

**Não pergunte sobre INFO** — esses são pendências de planejamento (ex.: capítulo da espinha narrativa pendente). Apresente como sugestão de próximos passos.

### FASE 4 — Aplicação com diff revisável

Para cada item aprovado:

1. **Gere o conteúdo** seguindo o gabarito apropriado:
   - Skill nova → use `docs/site/docs/skills/<grupo>/<existing>.md` como template.
   - Capítulo da espinha narrativa → use o gabarito do guia de estilo (`docs/site/docs/contributing/docs-style-guide.md`).
2. **Mostre o diff** (`git diff --no-index` contra `/dev/null` para arquivo novo, ou contra a versão atual).
3. **Aguarde confirmação** antes de gravar.
4. **Use `Write` ou `Edit`** para aplicar.

::: danger 🚫 Guardrails invioláveis
- **NUNCA** sobrescrever conteúdo conceitual existente sem confirmar.
- **NUNCA** apagar página da Referência (URL pode estar bookmarked).
- **NUNCA** rodar `npm run build` em modo silencioso — sempre mostrar o resultado.
- **SEMPRE** seguir as 7 regras do guia de estilo ao criar capítulo da espinha narrativa.
- **SEMPRE** preservar URLs existentes; movimentação só com redirect ou link cruzado.
- **SEMPRE** validar com `npm run build` ao final.
:::

### FASE 5 — Validação e fechamento

```bash
cd docs/site && npm run build
```

Se build passar, mostre resumo final:

```text
Sincronização concluída ✅

Aplicadas: X de Y divergências
Páginas criadas: A
Páginas atualizadas: B
Build: OK (Z páginas geradas)

Pendências de planejamento (INFO):
- Migrar Parte III (5 capítulos) → docs/site/docs/partes/parte-3/
- Migrar Parte IV (5 capítulos) → docs/site/docs/partes/parte-4/
- ...

Próximo passo sugerido:
  Migre uma Parte pendente seguindo o gabarito em /contributing/docs-style-guide.
```

Se build falhar, **reverta as últimas mudanças** e reporte o erro ao usuário.

---

## Quando NÃO usar

| Cenário | Por quê |
|---|---|
| Documentação ainda em rascunho local (sem commit) | A skill audita o working tree — use após estabilizar |
| `.claude/` em sincronização ativa (várias mudanças em curso) | Espere terminar para evitar relatório inconsistente |
| Você quer migrar UMA Parte específica da espinha narrativa | Use diretamente o gabarito em `/contributing/docs-style-guide` — a skill é para auditoria, não para escrita criativa |
| `docs/site/node_modules` ausente | Rode `npm install` antes — a skill depende de `npm run build` |

---

## Saída esperada

A skill produz:

1. **Relatório textual** no terminal (Fase 3).
2. **Diffs aplicados** com confirmação por item (Fase 4).
3. **Resumo final** com build status (Fase 5).

**Não produz arquivo intermediário** — toda persistência é direta no working tree.

## 📚 Referências internas

- Guia de estilo: `docs/site/docs/contributing/docs-style-guide.md`
- Diretrizes em CLAUDE.md: seção "Diretrizes de documentação"
- Inventário de migração: tabela "Inventário de migração" no guia de estilo
