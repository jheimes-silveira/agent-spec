# SCOPE — Cleanup de Débitos Técnicos · {{feature}} · {{version}}

> **Variante**: {{variant}} (herdada de {{parent_version}})
> **Versão**: {{version}}
> **Padrão**: 1 task por débito, `gates: [qa]` (cleanup é categoria `code_review_only`)

---

## 1. O que está incluído

Os {{count_selecionados}} débitos abaixo serão resolvidos nesta versão. Cada um vira 1 task em `tasks/T{n}.md`.

{{#each debitos_selecionados}}
- [x] **D-{{id}} ({{categoria}}, {{severidade}})** — {{titulo}}
  - **Arquivo**: `{{arquivo}}`{{#if linha}}:{{linha}}{{/if}}
  - **Origem**: task `{{origem_task}}` de `{{parent_version}}`
  - **Correção**: {{correcao_sugerida}}
  - **Custo estimado**: ~{{custo_estimado_min}}min
  - **Classificação LLM**: {{classificacao_llm}} — {{justificativa_llm}}
{{/each}}

---

## 2. O que está fora do escopo (débitos NÃO selecionados nesta rodada)

Os débitos abaixo foram coletados mas **não** entram nesta versão. Ficam registrados para auditoria — podem ser revisitados em `v{{N+2}}-debits/` futura.

{{#each debitos_ignorados}}
- [ ] **D-{{id}} ({{categoria}}, {{severidade}})** — {{titulo}}
  - **Arquivo**: `{{arquivo}}`{{#if linha}}:{{linha}}{{/if}}
  - **Classificação LLM**: {{classificacao_llm}} — {{justificativa_llm}}
  - **Motivo da exclusão**: não selecionado pelo usuário nesta rodada.
{{/each}}

{{#unless debitos_ignorados}}
_Nenhum débito ignorado — todos os coletados foram selecionados para cleanup._
{{/unless}}

---

## 3. Definições Técnicas

### 3.1 Arquivos Impactados (consolidado)

| Arquivo | Débitos que tocam | Ação esperada |
|---------|-------------------|---------------|
{{#each arquivos_consolidados}}
| `{{arquivo}}` | {{lista_debitos}} | {{acao_consolidada}} |
{{/each}}

### 3.2 Frontmatter padrão de cada task

```markdown
- model: sonnet
- risk: low
- gates: [qa]      # cleanup é categoria code_review_only — Tech Review traz pouco valor
- source: agent-spec-debt-resolution
```

> **Exceção**: se um débito específico toca path em qualquer categoria de Critical Paths da rule `agent-spec-workflow-rules.md` (a rule é a fonte única — não enumere subconjuntos aqui), a task correspondente força `gates: [qa, tech_review]`.

### 3.3 Estratégia de testes

- Tasks de débito **NÃO criam testes novos**.
- A suíte existente da feature **DEVE continuar passando** sem alteração.
- O Gate 1 (QA) executa a suíte completa após cada task.
- Se algum teste regredir após cleanup, é sinal de que o débito carregava lógica relevante — **task rejeitada**, débito investigado individualmente.

### 3.4 Paralelização

Tasks de débito são **independentes por construção** (cada uma toca seu próprio cenário). No `task_plan.md`, o flag `Pode Rodar em Paralelo?` é **derivado** (Regra 10d) — não autore `Sim` por padrão. O orquestrador `/agent-spec-minispec-run-tasks` **re-verifica** os guards (independência no DAG, disjunção de símbolo, paths disjuntos, sem arquivo de alta contenção compartilhado, lote ≤ MAX_PARALLEL=4) — se houver colisão de paths/símbolo/arquivo de registro entre 2 tasks de débito, faz fallback automático para sequencial.

---

## 4. Critérios de Aceite

- [ ] {{count_selecionados}} tasks `Concluído` no `task_plan.md` desta versão.
- [ ] Suíte de testes da feature inteira passa após cada task (Gate 1 valida).
- [ ] Nenhum diff em arquivos fora dos listados em §3.1.
- [ ] §2 do `_run/run-report.md` da `{{parent_version}}` marca os débitos em cleanup; `_run/workflow-report.md` registra a execução (via FASE 4.6 da skill `/agent-spec-debt-resolution`).

---

## 5. Observações

- **Origem**: gerada pela skill `/agent-spec-debt-resolution` em {{data}}.
- **Agente especialista usado**: `{{agent_name}}`.
- **Decisão do usuário**: {{count_selecionados}} de {{count_coletado}} débitos coletados foram aprovados para cleanup nesta rodada.
- **Não é candidato a ADR**: cleanup técnico não dispara ADR. Se durante execução algum débito revelar padrão arquitetural a registrar, sinalize ao usuário criar `/agent-spec-adr-create` separadamente — NÃO inclua nesta versão.
