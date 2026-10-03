---
id: "faq"
title: "FAQ"
sidebar_position: 99
---
# FAQ

## Geral

### Posso usar o framework em um projeto existente?

Sim. Copie `.claude/` e `.mcp.json` para a raiz do projeto. Crie/atualize o `CLAUDE.md` na raiz. Adapte critical paths se sua stack tem layout diferente. Rode [agent-spec-adr-bootstrap](skills/adr/adr-bootstrap.md) para capturar decisões arquiteturais já tomadas como ADRs retroativas.

### O framework é específico de alguma linguagem?

Não. É **agnóstico de stack**. O framework não inclui executor pronto — você [registra um especialista da sua stack](customization/custom-executor.md) em `.claude/agents/`. Os gates ([agent-spec-qa-validator](agents/qa-validator.md), [agent-spec-staff-architecture-review](agents/staff-architecture-review-agent.md)) e as skills geradoras (PRD, Intent, Tech Spec, Scope, etc.) são agnósticos e funcionam para qualquer stack.

### Preciso rodar todos os comandos SDD em ordem?

Sim — cada etapa consome a anterior. Mas [agent-spec-generate-tech-alignment](skills/shared/generate-tech-alignment.md) é **opcional** — pode pular.

### Posso pular o discovery?

Sim. Invoque a skill geradora diretamente ([agent-spec-sdd-generate-prd](skills/sdd/sdd-generate-prd.md), [agent-spec-minispec-generate-intent](skills/minispec/minispec-generate-intent.md), [agent-spec-taskcard-generate](skills/taskcard/taskcard-generate.md)). A instrumentação registrará `source: no_discovery` no state.

### Como faço rollback de uma task aprovada?

`git revert`. O framework não rastreia reverts — é Git puro.

### Posso usar modelos que não sejam Claude?

Não. O framework depende de features específicas do Claude Code (subagents com `model:`, skills, system-prompt do CLAUDE.md). Portar para outro modelo exige reescrever a infra.

---

## Custo

### Custo aproximado de cada caminho?

| Caminho | Custo típico | Com otimizações |
| --- | --- | --- |
| [Conversa direta](frameworks/conversa-direta.md) | ~10-30k tokens | — |
| [TaskCard](frameworks/taskcard.md) | ~80-150k tokens | — |
| [miniSpec](frameworks/minispec.md) | ~400-600k | ~250-400k |
| [SDD](frameworks/sdd.md) | ~1.5M | ~500-800k |

### Posso baratear ainda mais?

* Verifique que `.mcp.json` tem só serena + context7 (não Figma/Gmail/etc.). Veja [MCP Allowlist](configuration/mcp-allowlist.md).
* Garanta que `.qa_context.md` é gerado (Passo 0 do generate-task-plan/tasks).
* Use `gates: none` em tasks triviais (docs, configs). Veja [Fast-path Gates](advanced/fast-path-gates.md).
* Modelo default `sonnet` em tudo (é o default — não mude para opus sem razão).

### Quanto custa 1 retry em Opus?

~$0.50 para uma task média. Muito menor que 3 retries em Sonnet + 15-30min de intervenção humana.

### Quando Opus vale a pena?

Áreas críticas (auth, crypto, migrations). Configure via [Critical Paths](configuration/critical-paths.md). O framework escala automaticamente. Veja [Auto-escalação](advanced/auto-escalation.md).

---

## Execução

### Posso rodar várias tasks em paralelo?

Não. Os orquestradores `*-run-tasks` rodam **sequencialmente** respeitando o grafo de dependências. Tasks marcadas como paralelizáveis no `task_plan.md` são informacionais — a execução ainda é sequencial.

### O que acontece se eu interromper um `run-tasks`?

Nada grave. Tasks com status `Concluído` ficam persistidas (com `git add` aplicado). Ao re-executar, o orquestrador pula as já concluídas. Memória lazy órfã >24h é limpa automaticamente.

### Como funciona o contador de tentativas?

**3 tentativas TOTAIS compartilhadas** entre Gate 1 e Gate 2. Se Gate 1 reprova 1× e Gate 2 reprova 1×, restam 1 tentativa. Na 3ª falha, marca como BLOQUEADA. Veja [Gates e Loops](concepts/gates-loops.md).

### E se eu quiser mais tentativas?

Edite a configuração embutida em `.claude/skills/*-run-tasks/`. O limite de 3 é fixo no código por segurança (evita loop infinito).

---

## ADRs

### ADR é obrigatório?

Não. ADRs são opcionais, mas as skills [agent-spec-sdd-generate-tech-spec](skills/sdd/sdd-generate-tech-spec.md) e [agent-spec-minispec-generate-scope](skills/minispec/minispec-generate-scope.md) detectam candidatos automaticamente e propõem criar.

### Quando uma decisão vira ADR?

Quando **todos os 5 critérios** são verdadeiros (`require_all`):

* **C1 — transversal**: aplica a outras features ou ao projeto inteiro (não é feature-específica).
* **C2 — tag_alvo**: cai em uma das 14 tags canônicas.
* **C3 — custo_reversao_alto**: reverter implica refactor significativo (≥ médio) em múltiplos lugares.
* **C4 — surpreendente_sem_contexto**: um leitor futuro do código vai se perguntar "por que fizeram assim?" sem este registro.
* **C5 — trade_off_real**: havia ao menos UMA alternativa genuinamente considerada, rejeitada por razão específica (não "única opção viável").

Os 5 critérios são definidos em [`agent-spec-adr-workflow-rules.md`](configuration/path-templates.md). Veja [ADR — Visão Geral](adr/overview.md).

### E se duas features tomarem decisões conflitantes?

[agent-spec-adr-review](skills/adr/adr-review.md) detecta e emite observação no relatório. A solução: uma das features refatora para seguir a ADR existente, ou [agent-spec-adr-supersede](skills/adr/adr-supersede.md) cria uma ADR substituta.

### ADR deve ser escrita antes ou depois de usar?

**Antes**, idealmente. O fluxo é:

1. Detectar candidata durante geração ([agent-spec-sdd-generate-tech-spec](skills/sdd/sdd-generate-tech-spec.md)).
2. Criar ADR via [agent-spec-adr-create](skills/adr/adr-create.md) se aceita.
3. Continuar a feature referenciando a ADR.

Para projeto existente, [agent-spec-adr-bootstrap](skills/adr/adr-bootstrap.md) cria retroativamente.

---

## Configuração

### Onde ficam os paths canônicos do framework?

Em `.claude/rules/framework-paths.md` (rule global) e configs específicas do projeto em [framework-paths.md](configuration/framework-paths.md) na raiz — ambos carregados automaticamente no system-prompt. Veja [Path Templates](configuration/path-templates.md).

### Onde fica a lista de tags ADR?

Embutida em [agent-spec-adr-create](skills/adr/adr-create.md). Lista fechada de 14 entradas. Para adicionar uma tag, edite a skill.

### Onde ficam as critical paths?

Embutidas diretamente em cada orquestrador (`.claude/skills/agent-spec-sdd-run-tasks/SKILL.md`, `.claude/skills/agent-spec-taskcard-run/SKILL.md`) ou em `.claude/skills/agent-spec-minispec-run-tasks/references/config.md`. Cada orquestrador tem a lista. Edite conforme sua stack. Veja [Critical Paths](configuration/critical-paths.md).

---

## Discovery

### O brainstorm é obrigatório?

Não. É **opcional**, acionado quando clareza é baixa/média ou quando a skill detecta espaço para compor melhor o produto.

### Posso pular o brainstorm?

Sim — se a sua ideia é fechada (ex.: "atualizar lib X"), a skill não acionará brainstorm.

### O que é Strategy Selector?

Rubric de 8 sinais que recomenda 1 dos 4 caminhos. Aplicada automaticamente no fim do `/agent-spec-pre-refinement`. Veja [Strategy Selector](discovery/strategy-selector.md).

---

## Modelos

### Por que nunca Haiku em executor/gates?

Haiku ainda não tem pattern recognition suficiente para executor, QA ou Tech Review. Detectar SQL injection, consolidar cenários, entender contratos sutis exige síntese que Haiku não atinge com segurança.

### Quando usar Opus?

* Áreas críticas (auth, crypto, migrations) — auto-escalado por critical paths.
* Tasks com `risk: high`.
* Retry após 2+ falhas em Sonnet (auto-escalação).
* `security_flags` não vazias no QA (escala Gate 2).

Veja [Auto-escalação](advanced/auto-escalation.md).

---

## Skills

### Como acionar uma skill?

Slash command (preferido): `/agent-spec-sdd-generate-prd`, `/agent-spec-minispec-run-tasks`, etc.

Ou mencione "use a skill X" diretamente no chat. Veja [Skills — Visão Geral](skills/overview.md).

### Posso criar minha própria skill?

Sim. Veja [Nova Skill](customization/new-skill.md).

### Skills são portáveis?

Sim. Copie `.claude/skills/<nome>/` para outro projeto. Desde que o destino tenha `.claude/rules/framework-paths.md` com as convenções de paths, a skill funciona.

---

## Observabilidade

### Como sei se as otimizações estão ativas?

* Procure por `.qa_context.md` na pasta da feature → [qa_context](advanced/qa-context.md) ativo.
* Confira nos logs do orquestrador a linha `[T5] executor: ... | sumário capturado (4-6 linhas)` — confirma que `base_sha` + sumário do executor passaram inline aos gates (não mais como arquivo). Ver [Memória Proativa](advanced/proactive-memory.md).
* Logs do orquestrador mostram agrupamento por camada → [QA Consolidation](advanced/qa-consolidation.md) ativa.

### Como medir aderência ao Strategy Selector?

Campo `source` no state file ([sdd_state.yaml](observability/state-files.md), `minispec_state.yaml`):

* `recommended` — seguiu.
* `overridden` — divergiu.
* `no_discovery` — rodou sem discovery.

Meta: `overridden ≤ 20%`. Acima disso, calibre a checklist do [Strategy Selector](discovery/strategy-selector.md).

---

## Erros comuns

### "O framework está sobreprescrevendo SDD"

Princípio **anti-viés**: SDD só deve ser recomendado quando S2=múltiplas, S6=sim, ou S3=greenfield. Se está indicando SDD "por segurança" em casos menores, a skill [agent-spec-pre-refinement](skills/shared/pre-refinement.md) tem bug de viés — reforce o princípio na persona.

### "Cada task virou Opus sem necessidade"

Verifique a heurística embutida em `.claude/skills/*-run-tasks/references/config.md`. Regras muito abrangentes (ex.: `files_to_create_count_gte: 3`) podem disparar Opus em tasks simples. Ajuste para `gte: 10` (default conservador).

### "Gates demoram muito para retornar"

* Gate 1 executa a suíte de testes — se os testes são lentos, gate é lento.
* Gate 2 lê arquivos em `critical_paths` — se lista grande, lê muito.
* Otimize os testes primeiro.
* Reduza critical paths se excessivo.

Veja [Troubleshooting](troubleshooting.md) para mais cenários.
