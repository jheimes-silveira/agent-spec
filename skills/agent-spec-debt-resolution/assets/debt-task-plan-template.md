# TASK PLAN — Cleanup de Débitos · {{feature}} · {{version}}

## 1. Identificação

- **Feature**: {{feature}}
- **Versão**: {{version}}
- **Versão pai**: {{parent_version}}
- **Variante**: {{variant}}
- **Intent**: `docs/specs/features/{{feature}}/{{version}}/intent.md`
- **Scope**: `docs/specs/features/{{feature}}/{{version}}/scope.md`
- **Origem**: gerado por `/agent-spec-debt-resolution` em {{data}}
- **Agente especialista (classificação)**: `{{agent_name}}`
- **Status**: A Fazer

---

## 2. Objetivo Técnico

Resolver {{count_selecionados}} débitos técnicos atômicos via tasks `gates: [qa]` (cleanup é `code_review_only`). Cada task toca exatamente 1 débito; suíte existente é o oráculo de regressão.

---

## 3. Macro-Fases

- **Fase 1 — Cleanup**
  - Objetivo: aplicar correção pontual de cada débito.
  - Tasks: T1 .. T{{count_selecionados}} (flag de paralelismo derivado por task — Regra 10d; guards do orquestrador decidem se vão em lote ou sequencial).

> Por que 1 fase só: débitos são independentes. Não há ordem técnica obrigatória.

---

## 4. Lista de Tasks

| ID  | Nome | Arquivo da task | Débito original | Custo (min) | model | risk | gates | Paralelo? | Status |
|-----|------|-----------------|-----------------|-------------|-------|------|-------|-----------|--------|
{{#each tasks}}
| T{{n}} | {{nome_curto}} | [T{{n}}](tasks/T{{n}}.md) | D-{{id_debito}} ({{categoria}}) | ~{{custo_min}} | sonnet | {{risk}} | {{gates}} | {{paralelo_derivado}} | A Fazer |
{{/each}}

<!-- LLM-ONLY: a coluna Paralelo? é DERIVADA (Regra 10d) — `Sim` apenas se o arquivo
     do débito é disjunto dos arquivos das demais tasks da fase E não é arquivo de alta
     contenção; débitos no mesmo arquivo → `Não` (ou mesma task). NUNCA autore `Sim` fixo. -->

---

## 5. Ordem de Execução

```
Fase 1 (paralelo, respeitando guards do orquestrador):
  T1 ─┐
  T2 ─┤
  T3 ─┤  → orquestrador detecta lote paralelizável até MAX_PARALLEL=4
  T4 ─┤    com guards de independência no DAG, disjunção de símbolo,
  ... ┘    paths disjuntos e arquivos de alta contenção.
           Falha em guard → fallback sequencial automático.
```

### Grafo de Dependências

Nenhuma dependência entre tasks (são independentes por construção).

| Task | Depende de | Pode Rodar em Paralelo? |
|------|------------|-------------------------|
{{#each tasks}}
| T{{n}} | — | {{paralelo_derivado}} |
{{/each}}

---

## 6. Arquivos / Áreas Impactadas (consolidado)

| Arquivo | Tasks que tocam | Categorias |
|---------|-----------------|------------|
{{#each arquivos_consolidados}}
| `{{arquivo}}` | {{lista_tasks}} | {{categorias}} |
{{/each}}

> **Atenção do orquestrador**: se 2+ tasks na mesma onda paralela tocam o mesmo arquivo, o guard "paths disjuntos" da rule `Execução Paralela de Tasks` força fallback para sequencial para evitar colisão de `git add`.

---

## 7. Critérios de Conclusão Geral

- [ ] Todas as {{count_selecionados}} tasks com Status `Concluído`.
- [ ] Suíte de testes da feature passa sem regressão (Gate 1 valida em cada task).
- [ ] Nenhum diff em arquivos fora da seção 6 acima.
- [ ] §2 do `_run/run-report.md` da `{{parent_version}}` marca os débitos em cleanup; `_run/workflow-report.md` registra a execução.
- [ ] `_run/minispec_state.yaml` desta versão marca `execution: completed`.

---

## 8. Notas para a LLM Executora

### Convenções desta versão

- **NÃO** criar testes novos. Tasks são cleanup.
- **NÃO** refatorar fora do escopo do débito específico.
- **NÃO** "aproveitar a oportunidade" para corrigir débitos não listados.
- **SIM**: aplicar exatamente a `correcao_sugerida` da task — escopo cirúrgico.
- **SIM**: executar o comando de teste canônico da stack (precedência de descoberta: rule `.claude/rules/testing-stack.md` → CLAUDE.md/rules → manifesto do projeto) após cada modificação para confirmar zero regressão antes de retornar a task.

### Frontmatter de cada task

```markdown
- model: sonnet
- risk: low
- gates: [qa]
- source: agent-spec-debt-resolution
- debito_origem: D-XXX
- task_origem_parent: T{{N}}
```

### Saída esperada do executor

Formato padrão de output enxuto:

```
✅ T{N} — Resolver D-XXX: <título curto> /
  Arquivos: 1 modificado /
  Testes: <regrediu? 0 sim, todos passando> /
  Pendências: nenhuma
```
