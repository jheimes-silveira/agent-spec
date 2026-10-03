---
id: "troubleshooting"
title: "Troubleshooting"
sidebar_position: 98
---
# Troubleshooting

Problemas comuns e como resolver.

---

## "Subagente não encontrado"

**Sintomas**: `/agent-spec-sdd-run-tasks` (ou similar) falha com mensagem sobre agente não encontrado.

**Causas**:

1. Arquivo `.claude/agents/<nome>.md` não existe.
2. Frontmatter `name:` não bate com o nome invocado.
3. Claude Code não recarregou após você criar o agente.

**Solução**:

1. Verifique `ls .claude/agents/`.
2. Leia o frontmatter do agente e confirme `name:`.
3. Reinicie o Claude Code.

---

## "Path resolvido para null/undefined"

**Sintomas**: Skill salva em path errado ou falha ao tentar salvar.

**Causas**:

1. `CLAUDE.md` ausente na raiz do projeto.
2. `{feature}` ou `{version}` não está sendo substituído corretamente.
3. A skill não consegue extrair `{feature}` do argumento passado.

**Solução**:

1. Verifique `test -f CLAUDE.md`.
2. Confirme que o argumento da skill segue o padrão (ex.: `docs/specs/features/<feature>/v1/intent.md` → extrai `<feature>` e `v1`).
3. Veja [Path Templates](/configuration/path-templates.html) para a convenção esperada.

---

## "Aborted: not a git repo"

**Sintomas**: `*-run-tasks` aborta logo de início.

**Causa**: Os orquestradores exigem repositório git inicializado para capturar `base_sha`.

**Solução**: `git init` no projeto, ou rode dentro de um repositório válido.

---

## "Gates em loop infinito"

**Sintomas**: `*-run-tasks` não termina, ciclo de correção não para.

**Causas**:

1. Contador de tentativas não está sendo respeitado (bug raro).
2. Memória lazy não está sendo atualizada entre tentativas.
3. Task legitimamente precisa de intervenção humana mas não escalou.

**Solução**:

1. Limite **3 tentativas TOTAIS compartilhadas** entre Gate 1 e Gate 2 — deve marcar como BLOQUEADA depois disso.
2. Verifique `docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` — `attempt_count` está sendo incrementado?
3. Interrompa manualmente (`Ctrl+C`) e marque a task como Bloqueada no `task_plan.md`.

Veja [Gates e Loops](/concepts/gates-loops.html).

---

## "MCP não carrega"

**Sintomas**: Funcionalidades dependentes de MCP não funcionam (serena, context7).

**Causas**:

1. `.mcp.json` não existe na raiz.
2. Command/args do MCP estão errados.
3. Problema de permissão no executável.

**Solução**:

1. `ls .mcp.json` — verifique existência e conteúdo.
2. Teste manualmente: `npx -y @upstash/context7-mcp` (para context7).
3. Adicione MCPs extras em `.claude/settings.local.json`, **não** em `.mcp.json` da raiz (este é a allowlist do framework). Veja [MCP Allowlist](/configuration/mcp-allowlist.html).

---

## "Task gerada com `model: haiku`"

**Sintomas**: Frontmatter de uma task tem `model: haiku`.

**Causa**: Bug na skill de geração. A heurística proíbe haiku em executor.

**Solução**:

1. Force `model: sonnet` ou `model: opus` manualmente editando o `.md`.
2. Reporte o caso — a skill precisa ser corrigida.

---

## "Tech Review reprova mas QA aprovou"

**Sintoma**: Pipeline entra em correção após aprovação do Gate 1.

**Diagnóstico**: Fluxo **esperado**. Gate 2 valida camadas não cobertas pelo Gate 1 (arquitetura, ADRs, segurança profunda).

**Solução**:

1. Leia o JSON do Tech Review em `docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md`.
2. Identifique problemas `critical` ou `high`.
3. A correção volta ao executor e re-valida **ambos** os gates na próxima rodada.

Veja [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html).

---

## "Executor toca arquivo fora do escopo"

**Sintoma**: Diff inclui arquivos não listados em §15.1/§15.2 da task.

**Diagnóstico**: Violação de guardrail.

**Solução**:

1. Gate 1 **deveria** rejeitar (problema crítico em completude).
2. Se não rejeitou, é bug do agent executor — refine a persona para reforçar escopo.
3. Reverta os arquivos fora do escopo: `git restore --staged <arquivo>; git checkout -- <arquivo>`.

---

## "qa\_context.md não é criado"

**Sintoma**: Feature SDD/miniSpec grande e não há `.qa_context.md` gerado.

**Causas**:

1. Tech spec ou intent/scope muito pequeno (`<4k tokens`) → caminho alternativo automático (fallback) pula a geração.
2. Passo 0 da skill geradora não está sendo executado.

**Solução**:

1. Verifique tamanho do tech\_spec/intent+scope.
2. Se são grandes e `.qa_context.md` não foi criado: examine o log da skill — o Passo 0 deveria aparecer.

Veja [qa\_context Pré-extraído](/advanced/qa-context.html).

---

## "Custo acima do esperado"

**Sintomas**: Feature SDD consumindo >1.5M tokens.

**Diagnóstico**: algumas otimizações podem não estar ativas.

**Checklist**:

1. Logs mostram `[T5] executor: ... | sumário capturado (4-6 linhas)`? → `base_sha` + sumário do executor passam inline aos gates (sem arquivo). Ver [Memória Proativa](/advanced/proactive-memory.html).
2. `.qa_context.md` existe na pasta da feature? → [qa\_context](/advanced/qa-context.html) ativo.
3. Log mostra agrupamento por camada? → [Consolidação QA](/advanced/qa-consolidation.html) ativa.
4. Tech Review reaproveita `files_reviewed[]` do QA? → reuso ativo.

---

## "Strategy Selector recomendou errado"

**Sintoma**: Discovery recomendou SDD para uma feature trivial, ou TaskCard para algo grande.

**Causas**:

1. Input ambíguo — skill inferiu mal.
2. Heurística muito conservadora/agressiva.

**Solução imediata**: ignore a recomendação e rode o framework correto. A instrumentação registra `source: overridden` no state.

**Médio prazo**: se alta taxa de override, ajuste a checklist em `.claude/skills/agent-spec-pre-refinement/SKILL.md` seção "Strategy Selection".

Veja [Strategy Selector](/discovery/strategy-selector.html).

---

## "ADR detectada mas eu não quero"

**Sintoma**: Skill SDD/miniSpec sugere criar ADR e você não concorda.

**Solução**:

1. Recuse na interação ("não, não precisa de ADR").
2. Registre a decisão explicitamente no tech\_spec/scope (para não cair de novo).
3. Se o padrão se repete, ajuste as heurísticas em `agent-spec-sdd-generate-tech-spec` ou `agent-spec-minispec-generate-scope`.

Veja [Integração com Frameworks](/adr/integration-frameworks.html).

---

## "Testes não rodam automaticamente"

**Sintoma**: Gate 1 retorna `executou_testes: false`.

**Causas**:

1. Projeto não tem engine de teste configurada.
2. Comando de teste falha com erro de setup.
3. QA não detectou o comando correto.

**Solução**:

1. Verifique que `go test ./...` / `npm test` / `pytest` funciona no terminal.
2. Leia o JSON do Gate 1 — `observacoes` explica por que não rodou.
3. Se o comando é não-standard, registre no `CLAUDE.md` do projeto ou no `.claude/rules/`.

Veja [agent-spec-qa-validator](/agents/qa-validator.html).

---

## "Framework está lento"

**Sintoma**: Geração de PRD leva 15+ minutos.

**Causas**:

1. MCPs não listados consumindo tokens de instrução.
2. Modelo default muito capaz (Opus em tudo).
3. `.qa_context.md` não sendo usado.

**Solução**:

1. `.mcp.json` estritamente em serena + context7. Veja [MCP Allowlist](/configuration/mcp-allowlist.html).
2. Confirme que o orquestrador respeita `model: sonnet` por default.
3. Veja [Contexto Mínimo](/concepts/minimum-context.html).

---

## "Estado quebrado"

**Sintoma**: `sdd_state.yaml` tem estado inconsistente (ex.: `current_step: execution` mas `steps.execution.status: pending`).

**Solução**:

1. Edite manualmente o YAML para refletir a realidade.
2. Ou: delete o state file e re-rode a skill apropriada (vai recriar).

Veja [State Files](/observability/state-files.html).

---

## Pedindo ajuda

Se nada aqui resolve:

1. Leia logs em `.claude/.logs/` (se configurados).
2. Inspecione `docs/specs/features/{feature}/{version}/tasks/.tmp/` ([guia de debug](/observability/temp-memory-debug.html)).
3. Examine `qa-observations.md` da feature.
4. Reporte o issue com: comando exato, `CLAUDE.md`, arquivo da feature, logs.
