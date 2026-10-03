---
id: "glossary"
title: "Glossário"
sidebar_position: 100
---
# Glossário

Termos usados ao longo da documentação.

| Termo | Significado |
| --- | --- |
| **ADR** | Architecture Decision Record — decisão arquitetural transversal versionada em `docs/adr/`. Modelo Nygard enxuto (Context/Decision/Consequences/Alternatives/Applied in). Veja [ADR — Visão Geral](/adr/overview.html). |
| **Agent** | Subagente invocado via tool `Agent` do Claude Code. Inclui executores (registrados pelo usuário em `.claude/agents/`) e gates pré-incluídos ([agent-spec-qa-validator](/agents/qa-validator.html), [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html), [agent-spec-qa-test-generator](/agents/qa-test-generator.html)). |
| **agent-spec-generate-design** | Skill compartilhada SDD/miniSpec (opcional, só web/mobile) que gera o `design.md` da feature (COMO VISUAL) e mantém o `design-system.md` global. Veja [skill](/skills/shared/generate-design.html). |
| **agent-spec-generate-tech-alignment** | Skill compartilhada SDD/miniSpec que gera Tech Alignment (15-30 linhas, decisões curtas). Veja [skill](/skills/shared/generate-tech-alignment.html). |
| **Auto-escalação** | Mecanismo que sobe executor de Sonnet para Opus automaticamente após N tentativas falhas ou em critical paths. Veja [Auto-escalação](/advanced/auto-escalation.html). |
| **Brainstorm** | Etapa opcional do discovery que diverge antes de convergir, explorando variações do produto. Veja [Brainstorm](/discovery/brainstorm.html). |
| **base\_sha** | SHA git capturado pelo orquestrador antes de invocar o executor. Usado pelo Gate 2 para gerar diffs (`git diff <base_sha> -- <path>`). |
| **CA** | Critério de Aceitação — regra objetiva que uma User Story deve satisfazer. Numerado como CA-01, CA-02, ... |
| **CLAUDE.md** | Arquivo na raiz do projeto que carrega **configurações específicas do projeto** no system-prompt. Importa `.claude/rules/framework-paths.md`, onde vivem os paths canônicos do framework. |
| **framework-paths.md** | Rule global em `.claude/rules/framework-paths.md` com os paths canônicos dos frameworks (SDD, miniSpec, TaskCard, ADR) e convenções de nomenclatura. **Fonte autoritativa de paths**, carregada automaticamente no system-prompt. Veja [framework-paths.md](/configuration/framework-paths.html). |
| **Conversa direta** | Caminho mais leve — sem artefato, sem gates. Spike, aprendizado, exploração. Veja [Conversa direta](/frameworks/conversa-direta.html). |
| **Critical paths** | Lista de globs (auth, security, crypto, migrations) que recebem tratamento especial (Opus, gates escalados). Veja [Critical Paths](/configuration/critical-paths.html). |
| **CT** | Caso de Teste — entrada na Estratégia de Testes do tech\_spec (SDD) ou seção Testes da task. Mapeado para CA via rastreabilidade. |
| **agent-spec-debt-resolution** | Skill compartilhada (`/agent-spec-debt-resolution`) que consome débitos `MEDIO`/`BAIXO` anotados em `qa-observations.md`, classifica via especialista da stack (`recomendado_corrigir` / `perfumaria`), pergunta interativamente quais incluir, e gera `v{N+1}-debits/` da feature com tasks de cleanup. Veja [skill](/skills/shared/debt-resolution.html). |
| **Débito anotado** | Problema `MEDIO` ou `BAIXO` em categoria `code_review_only` (`code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`) que passou pelos gates pela política débito-controlado e ficou registrado em `qa-observations.md` para cleanup futuro via `/agent-spec-debt-resolution`. |
| **Discovery** | Etapa de pré-refinamento (`/agent-spec-pre-refinement`) com brainstorm + Strategy Selector. Ponto de entrada do pipeline. Veja [Discovery — Overview](/discovery/overview.html). |
| **execution-summary.md** | **Deprecado**. Antigo arquivo `T{N}-execution-summary.md` criado após executor. Hoje `base_sha` + sumário do executor passam inline no prompt dos gates. Ver [Memória Proativa](/advanced/proactive-memory.html) para histórico. |
| **Fast-path gates** | Permite pular gates via campo `gates: none / [qa] / [qa, tech_review]` no frontmatter. Veja [Fast-path Gates](/advanced/fast-path-gates.html). |
| **files\_reviewed** | Campo no JSON do Gate 1 com arquivos lidos + hash + summary. Gate 2 confia sem reler. |
| **Frontmatter** | Bloco de metadados no topo da task (model, risk, gates, ID, nome) na seção 1 Identificação. |
| **Gate 1** | [agent-spec-qa-validator](/agents/qa-validator.html). Validação funcional + execução de testes. Único gate que executa suíte. |
| **Gate 2** | [agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html). Validação arquitetural + ADRs + segurança profunda. |
| **INTENT** | Artefato miniSpec com **O QUE** e **POR QUÊ** de uma feature. Equivalente light do PRD. Veja [agent-spec-minispec-generate-intent](/skills/minispec/minispec-generate-intent.html). |
| **Memória lazy** | Arquivo `docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` criado **em rejeição**. Contém JSON do gate + attempt\_count + last\_severity + diff. Deletado ao aprovar. |
| **Memória proativa** | **Deprecada**. Substituída por `base_sha` + sumário do executor passados inline no prompt dos gates. Veja [Memória Proativa](/advanced/proactive-memory.html) para histórico do corte. |
| **MCP allowlist** | Controla quais MCP servers carregam no system-prompt dos subagentes. Veja [MCP Allowlist](/configuration/mcp-allowlist.html). |
| **miniSpec** | Caminho intermediário. INTENT + SCOPE + tasks. Para features com 1-3 US. Veja [miniSpec](/frameworks/minispec.html). |
| **`model:` (frontmatter)** | Campo da task (`sonnet` ou `opus`) que diz qual modelo executar. **Nunca** `haiku` para executor. |
| **Pipeline** | Fluxo orquestrado pelos `*-run-tasks`: executor → persiste `base_sha` + sumário enxuto em memória → Gate 1 (inline em `instrucoes`) → Gate 2 (inline em `instrucoes`) → `git add`. Veja [Pipeline — Overview](/pipeline/overview.html). |
| **Política débito-controlado** | Veredito por severidade: críticos/altos sempre rejeitam (loop de correção); médios/baixos passam como `APROVADO_COM_OBSERVACOES` (Gate 1) / `approved_with_observations` (Gate 2), com débito anotado em [`qa-observations.md`](/observability/qa-observations.html) e recolhido pela skill [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html). Veja [Gates e Loops](/concepts/gates-loops.html). |
| **PRD** | Product Requirement Document. Artefato SDD com US + CA + personas + KPIs. Veja [agent-spec-sdd-generate-prd](/skills/sdd/sdd-generate-prd.html). |
| **pre-refinement.md** | Artefato gerado por [agent-spec-pre-refinement](/skills/shared/pre-refinement.html). 16 seções com Fato/Hipótese/Dúvida + Brainstorm + Strategy Selector. |
| **agent-spec-qa-test-generator** | [Agent gerador](/agents/qa-test-generator.html) de casos de teste de alto valor. Invocado pelas skills `*-generate-*` (não é gate). |
| **`.qa_context.md`** | Resumo denso extraído do tech\_spec/intent+scope para evitar releitura por N subagentes. Veja [qa\_context](/advanced/qa-context.html). |
| **`qa-observations.md`** | Log persistente de auto-escalações, fast-paths e tasks bloqueadas. Veja [qa-observations](/observability/qa-observations.html). |
| **Retry attempt** | Contador compartilhado entre Gate 1 e Gate 2. Máximo 3 tentativas TOTAIS. |
| **`risk:` (frontmatter)** | Campo da task (`low` / `medium` / `high`) que sinaliza criticidade. Dispara escalação de gates. |
| **Rubric** | Conjunto de regras objetivas. [Strategy Selector](/discovery/strategy-selector.html) usa checklist de 8 sinais. |
| **SCOPE** | Artefato miniSpec que aterra a INTENT em decisões técnicas. Componentes, paths, padrões. Veja [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html). |
| **SDD** | Software Design Document. Caminho mais formal. PRD + Tech Spec + ADRs + task\_plan. Veja [SDD](/frameworks/sdd.html). |
| **security\_flags** | Campo do JSON do Gate 1 com flags detectadas (`hardcoded_secret`, `sql_injection_potential`). Escala Gate 2 para Opus. |
| **Skill** | Especialista em uma etapa do pipeline. Vive em `.claude/skills/<nome>/SKILL.md`. 28 skills no framework. Veja [Skills — Visão Geral](/skills/overview.html). |
| **`source` (state)** | Campo no `<framework>_state.yaml` que rastreia aderência ao Strategy Selector: `recommended` / `overridden` / `no_discovery`. |
| **Strategy Selector** | Rubric que recomenda o framework certo via 8 sinais (S1-S8). Aplicada no fim do discovery. Veja [Strategy Selector](/discovery/strategy-selector.html). |
| **Task** | Unidade atômica de implementação. 1 task = 1-N arquivos que implementam X CAs. |
| **TaskCard** | Caminho leve — 1 `.md` por task. Para tasks pontuais com escopo fechado. Veja [TaskCard](/frameworks/taskcard.html). |
| **TaskPlan** | `task_plan.md`. Índice + dependências + rastreabilidade US→Task. **Não** contém o corpo das tasks. |
| **Tech Alignment** | Documento curto (15-30 linhas) com decisões técnicas de alto nível. Compartilhado SDD/miniSpec via `tech_alignment.path`. Veja [agent-spec-generate-tech-alignment](/skills/shared/generate-tech-alignment.html). |
| **design.md** | Artefato opcional (só web/mobile) com o COMO VISUAL da feature: telas, layout, estados visuais concretos, responsividade, motion, a11y visual. Resolvido via `design.feature.path`. As seções de UI da TECH\_SPEC/SCOPE o referenciam em vez de redefinir. Veja [agent-spec-generate-design](/skills/shared/generate-design.html). |
| **design-system.md** | Nível global do fluxo de design: tokens, biblioteca de componentes e padrões visuais canônicos do produto (sem `{version}`, criação lazy). Resolvido via `design_system.global.path`. Veja [agent-spec-generate-design](/skills/shared/generate-design.html). |
| **Tech Spec** | Artefato SDD com **COMO** implementar. Componentes, fluxos, schemas, Estratégia de Testes. Veja [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html). |
| **temp\_memory** | Memória descartável em `docs/specs/features/{feature}/{version}/tasks/.tmp/` (lazy + proativa). Veja [Memória Temporária](/configuration/temp-memory.html). |
| **US** | User Story — unidade de valor do PRD. Numerada US-01, US-02, ... |
| **v{N+1}-debits** | Padrão de versionamento da skill `/agent-spec-debt-resolution`. Ex.: `cardapio/v1/` (feature funcional) → `cardapio/v2-debits/` (cleanup técnico). Versão de débitos coexiste com `v{N+1}/` funcional sem conflito; usa pipeline miniSpec mesmo vindo de SDD (cleanup é trivial e não precisa de PRD/TechSpec). |
