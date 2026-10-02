# Guardrails Invioláveis + Checklist Final

> Referência consumida por `SKILL.md` da skill `agent-spec-minispec-run-tasks`.
> Leia este arquivo:
> - **No início da execução** (após FASE 0) para internalizar os DEVE / NÃO DEVE.
> - **Antes de encerrar** (após FASE 5) para validar o checklist final.

---

## Guardrails Invioláveis

### DEVE

1. **SEMPRE delegar** ao subagente `agent_name` — coordenador NUNCA implementa diretamente.
2. **Executar sequencialmente por default** — paralelo APENAS via lote derivado com TODOS os guards da rule "Execução Paralela de Tasks" provados (DAG independente, símbolos e paths disjuntos, sem alta contenção, MAX_PARALLEL=4).
3. **SEMPRE validar com QA** após cada task (exceto `gates: none`) — nenhuma task avança sem aprovação do QA.
4. **SEMPRE validar com Tech Review** após QA (exceto `gates: none` ou `[qa]`) — nenhuma task concluída sem aprovação do Tech Review.
5. **Resolver `model`/`risk`/`gates`** do frontmatter da task antes de invocar executor.
6. **Aplicar auto-escalonamento** em retry (sonnet→opus[xhigh] após 2 tentativas ou severity=ALTO).
7. **Capturar `base_sha`** por task antes do executor (2.1).
8. **Passar `base_sha` + sumário do executor INLINE** no prompt do QA e do Tech Review (2.4 — sem arquivo intermediário).
9. **Preservar JSON completo do QA** para retry e sumário do Tech Review.
10. **Stage real (`git add`)** apenas após os **gates aplicáveis** aprovarem — Tech Review quando declarado (4.5); apenas QA para `gates: [qa]`; nenhum gate para `gates: none` (fechamento da task, FASE 5). Sem isso, tasks fast-path terminariam unstaged.
11. **Cleanup de memória** ao aprovar AMBOS os gates.
12. **Cleanup idempotente** (>24h) no início da execução.
13. **Logar resolução de modelo/gates** no terminal antes de invocar executor/gates.
14. **Injetar o bloco "Disciplina do Executor (Iron Rules)"** verbatim no prompt de TODO executor invocado — fonte: `references/executor-discipline.md` (entre os marcadores `<<<EXECUTOR_DISCIPLINE` … `EXECUTOR_DISCIPLINE>>>`). O sub-agente NÃO herda essa referência via system-prompt (ela vive sob demanda em `references/`, não em `.claude/rules/`); sem o bloco no prompt, as 7 Iron Rules (Pense antes de codar / Qualidade de sênior / Cirúrgico / Goal-driven / Testes honestos / Lei do seam / Conformidade com ADRs) não chegam ao executor.
15. **Injetar o bloco "ADRs aplicáveis" (REGRA ABSOLUTA)** no prompt de TODO executor (bloco [2.1], logo após a Disciplina) — fonte: subseção "ADRs Aplicáveis nesta Task" da task (fallback: "ADRs Aplicáveis nesta Feature" do scope). É o dado que ativa a Iron Rule #7. Se não houver ADR, injetar "Nenhuma ADR aplicável a esta task". **Logar** por task em `shared.workflow_report.path`: `[T{N}] ADRs injetadas no executor: ADR-XXXX, ... (fonte: task §6 | scope | nenhuma)`.

### NÃO DEVE

1. **NUNCA implementar** uma task diretamente — sempre delegue.
2. **Tasks em paralelo são permitidas APENAS** quando passam nos guards da rule `agent-spec-workflow-rules.md` → "Execução Paralela de Tasks" (independência no DAG + disjunção de símbolo + paths disjuntos + sem arquivo de alta contenção compartilhado + lote ≤ MAX_PARALLEL=4). Qualquer guard sem prova de independência → fallback determinístico para sequencial. O flag derivado é **re-verificado** — nunca confie cego na coluna.
3. **NUNCA lance QA e Tech Review da MESMA task em paralelo**. Entre tasks de um lote paralelo, pipelines isolados PODEM rodar em paralelo (cada um QA→TR sequencial internamente).
4. **NUNCA usar Haiku no executor** — rejeite com erro claro se frontmatter declarar.
5. **Política débito-controlado em retry**: envie ao executor como bloqueantes os problemas com `severity` `CRITICO`, `ALTO` ou `MEDIO`; apenas problemas `BAIXO` vão como "Observações" opcionais no mesmo prompt (não exigem correção no ciclo). Esses baixos ficam anotados na §2 do `_run/run-report.md` para cleanup futuro.
6. **NUNCA usar paths hardcoded** — sempre resolva via templates de `.claude/rules/agent-spec-minispec-workflow-rules.md` e `.claude/rules/agent-spec-workflow-rules.md`.
7. **NUNCA alterar INTENT, SCOPE ou criar novas tasks** sem o usuário pedir.
8. **NUNCA continuar após 3 tentativas falhas** — escale ao usuário.
9. **NUNCA commitar** ao final do Tech Review aprovar — apenas `git add`. O usuário commita.
10. **NUNCA enviar JSON completo do QA ao Tech Review** — apenas o sumário mínimo (`qa_summary_fields`).

---

## Checklist Final (orquestrador, antes de encerrar)

- [ ] Repositório git verificado no início
- [ ] Cleanup idempotente de memória stale executado
- [ ] `_run/minispec_state.yaml` atualizado para `execution: in_progress` no início
- [ ] Cada task processada respeitando o algoritmo de "Execução Paralela de Tasks" (lote paralelo com guards OU sequencial); gates dentro de cada task continuam SEQUENCIAIS (QA → TR)
- [ ] Bloco "Disciplina do Executor (Iron Rules)" carregado de `references/executor-discipline.md` no início e injetado no prompt de cada executor
- [ ] Bloco "ADRs aplicáveis" (REGRA ABSOLUTA, [2.1]) injetado no prompt de cada executor e logado em `_run/workflow-report.md`
- [ ] `_run/run-report.md` regenerado (snapshot: §1 tabela, §2 débitos, §3 bloqueios, §4 notas) a cada task terminal e ao final
- [ ] `model`/`risk`/`gates` resolvidos por task com logs no terminal
- [ ] `base_sha` capturado por task
- [ ] `base_sha` + `executor_summary` persistidos em memória após cada executor (sem arquivo intermediário)
- [ ] Sumário mínimo do QA enviado ao Tech Review (não JSON completo)
- [ ] Memória lazy criada apenas em rejeição
- [ ] Stage (`git add`) feito apenas após os gates aplicáveis aprovarem (TR quando declarado; QA para `[qa]`; nenhum para `none`)
- [ ] Memória lazy `T{N}.md` deletada ao aprovar (se foi criada por rejeição)
- [ ] Tasks bloqueadas escaladas ao usuário (após 3 tentativas)
- [ ] `task_plan.md` (tabela + grafo + critérios gerais) atualizado ao final
- [ ] `_run/minispec_state.yaml` atualizado para `execution: completed` ao final
- [ ] Relatório Final apresentado ao usuário
