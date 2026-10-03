# AgentSpec Framework — Documentação Oficial Cloned

> Cloned from [https://agentspec.academiadasias.com.br/](https://agentspec.academiadasias.com.br/)
> Total: **145 arquivos** de documentação técnica e conceitual com diagramas Mermaid, callouts e guias operacionais.

## 🧭 Índice Geral da Documentação

### Fundamentos & Introdução

- [O que esse framework resolve](index.md)
- [Introdução](intro.md)
- [Prefácio — Como navegar esta documentação](prefacio.md)
- [Capítulo 0 — O framework em 5 minutos](capitulo-0.md)
- [FAQ](faq.md)
- [Glossário](glossary.md)
- [Troubleshooting](troubleshooting.md)
- [agent-spec — versão consolidada](agent-spec-completo.md)

### Parte I — Por que especificar antes de codar

- [Parte I — Por que especificar antes de codar](partes/parte-1/index.md)
- [Capítulo 1 — A dor: por que LLMs falham sob ambiguidade](partes/parte-1/capitulo-1.md)
- [Capítulo 2 — As quatro convicções e os princípios cardeais](partes/parte-1/capitulo-2.md)
- [Capítulo 3 — Rastreabilidade: US → CA → CT → código](partes/parte-1/capitulo-3.md)
- [Exercícios — Parte I](partes/parte-1/exercicios.md)

### Parte II — Seu primeiro fluxo

- [Parte II — Seu primeiro fluxo, do início ao fim](partes/parte-2/index.md)
- [Capítulo 4 — Demonstração passo a passo — uma feature pequena de ponta a ponta](partes/parte-2/capitulo-4.md)
- [Exercícios — Parte II](partes/parte-2/exercicios.md)

### Parte III — Escolhendo o caminho certo

- [Parte III — Escolhendo o caminho: os quatro frameworks](partes/parte-3/index.md)
- [Capítulo 5 — Como escolher o caminho](partes/parte-3/capitulo-5.md)
- [Capítulo 6 — TaskCard: quando 1 task basta](partes/parte-3/capitulo-6.md)
- [Capítulo 7 — miniSpec: quando são 1-3 user stories](partes/parte-3/capitulo-7.md)
- [Capítulo 8 — SDD: quando a feature é complexa](partes/parte-3/capitulo-8.md)
- [Capítulo 9 — Conversa direta: o spike consciente](partes/parte-3/capitulo-9.md)
- [Exercícios — Parte III](partes/parte-3/exercicios.md)

### Parte IV — A pipeline e os dois gates

- [Parte IV — A pipeline e os dois gates](partes/parte-4/index.md)
- [Capítulo 10 — Anatomia da pipeline de execução](partes/parte-4/capitulo-10.md)
- [Capítulo 11 — Gate 1: o QA Validator](partes/parte-4/capitulo-11.md)
- [Capítulo 12 — Gate 2: o Tech Review](partes/parte-4/capitulo-12.md)
- [Capítulo 13 — Loops de correção](partes/parte-4/capitulo-13.md)
- [Capítulo 14 — Auto-escalação de modelo](partes/parte-4/capitulo-14.md)
- [Exercícios — Parte IV](partes/parte-4/exercicios.md)

### Parte V — A política débito-controlado

- [Parte V — A política débito-controlado](partes/parte-5/index.md)
- [Capítulo 15 — A política débito-controlado](partes/parte-5/capitulo-15.md)
- [Capítulo 16 — Categorias e o débito anotado](partes/parte-5/capitulo-16.md)
- [Capítulo 17 — Fechando o ciclo: /agent-spec-debt-resolution](partes/parte-5/capitulo-17.md)
- [Exercícios — Parte V](partes/parte-5/exercicios.md)

### Parte VI — Qualidade de testes

- [Parte VI — Qualidade de testes](partes/parte-6/index.md)
- [Capítulo 18 — Iron Laws e antipadrões](partes/parte-6/capitulo-18.md)
- [Capítulo 19 — Os 7 gates que cada teste atravessa](partes/parte-6/capitulo-19.md)
- [Exercícios — Parte VI](partes/parte-6/exercicios.md)

### Parte VII — ADRs: a memória das decisões

- [Parte VII — ADRs: a memória das decisões](partes/parte-7/index.md)
- [Capítulo 20 — O que vira ADR](partes/parte-7/capitulo-20.md)
- [Capítulo 21 — O lifecycle de uma ADR](partes/parte-7/capitulo-21.md)
- [Capítulo 22 — ADR Compliance Light no Gate 1](partes/parte-7/capitulo-22.md)
- [Exercícios — Parte VII](partes/parte-7/exercicios.md)

### Parte VIII — Observabilidade, memória e estado

- [Parte VIII — Observabilidade, memória e estado](partes/parte-8/index.md)
- [Capítulo 23 — A trilha de auditoria: qa-observations.md](partes/parte-8/capitulo-23.md)
- [Capítulo 24 — Memória lazy e memória inline](partes/parte-8/capitulo-24.md)
- [Capítulo 25 — State files](partes/parte-8/capitulo-25.md)
- [Exercícios — Parte VIII](partes/parte-8/exercicios.md)

### Frameworks & Fluxogramas

- [Frameworks — Visão Geral](frameworks/overview.md)
- [Conversa Direta](frameworks/conversa-direta.md)
- [TaskCard](frameworks/taskcard.md)
- [miniSpec](frameworks/minispec.md)
- [SDD](frameworks/sdd.md)
- [Fluxogramas — Visão Geral](frameworks/fluxogramas/index.md)
- [Fluxograma — TaskCard](frameworks/fluxogramas/taskcard.md)
- [Fluxograma — miniSpec](frameworks/fluxogramas/minispec.md)
- [Fluxograma — SDD](frameworks/fluxogramas/sdd.md)

### Skills

- [Skills — Visão Geral](skills/overview.md)
- [agent-spec-sdd-generate-prd](skills/sdd/sdd-generate-prd.md)
- [agent-spec-sdd-generate-tech-spec](skills/sdd/sdd-generate-tech-spec.md)
- [agent-spec-sdd-generate-task-plan](skills/sdd/sdd-generate-task-plan.md)
- [agent-spec-sdd-run-tasks](skills/sdd/sdd-run-tasks.md)
- [agent-spec-minispec-generate-intent](skills/minispec/minispec-generate-intent.md)
- [agent-spec-minispec-generate-scope](skills/minispec/minispec-generate-scope.md)
- [agent-spec-minispec-generate-tasks](skills/minispec/minispec-generate-tasks.md)
- [agent-spec-minispec-run-tasks](skills/minispec/minispec-run-tasks.md)
- [agent-spec-taskcard-generate](skills/taskcard/taskcard-generate.md)
- [agent-spec-taskcard-run](skills/taskcard/taskcard-run.md)
- [agent-spec-adr-bootstrap](skills/adr/adr-bootstrap.md)
- [agent-spec-adr-create](skills/adr/adr-create.md)
- [agent-spec-adr-show](skills/adr/adr-show.md)
- [agent-spec-adr-list](skills/adr/adr-list.md)
- [agent-spec-adr-review](skills/adr/adr-review.md)
- [agent-spec-adr-supersede](skills/adr/adr-supersede.md)
- [agent-spec-adr-deprecate](skills/adr/adr-deprecate.md)
- [agent-spec-adr-reindex](skills/adr/adr-reindex.md)
- [agent-spec-pre-refinement](skills/shared/pre-refinement.md)
- [agent-spec-challenge-spec](skills/shared/challenge-spec.md)
- [agent-spec-debt-resolution](skills/shared/debt-resolution.md)
- [agent-spec-generate-tech-alignment](skills/shared/generate-tech-alignment.md)
- [agent-spec-generate-design](skills/shared/generate-design.md)
- [agent-spec-design-system-bootstrap](skills/shared/design-system-bootstrap.md)
- [agent-spec-backend-contract-handoff](skills/shared/backend-contract-handoff.md)
- [agent-spec-curate-project-rules](skills/shared/curate-project-rules.md)
- [agent-spec-mine-rule-candidates](skills/shared/mine-rule-candidates.md)
- [agent-spec-rule-create](skills/shared/rule-create.md)
- [agent-spec-docs-sync](skills/shared/docs-sync.md)
- [agent-spec-semantic-commit](skills/shared/semantic-commit.md)
- [agent-spec-testing-stack-bootstrap](skills/shared/testing-stack-bootstrap.md)
- [agent-spec-testing-best-practices](skills/shared/testing-best-practices.md)

### Agentes

- [Agents — Visão Geral](agents/overview.md)
- [agent-spec-qa-validator (Gate 1)](agents/qa-validator.md)
- [agent-spec-qa-test-generator](agents/qa-test-generator.md)
- [agent-spec-staff-architecture-review (Gate 2)](agents/staff-architecture-review-agent.md)

### Pipeline

- [Pipeline — Visão Geral](pipeline/overview.md)
- [Pipeline — agent-spec-taskcard-run](pipeline/taskcard-run.md)
- [Pipeline — agent-spec-minispec-run-tasks](pipeline/minispec-run-tasks.md)
- [Pipeline — agent-spec-sdd-run-tasks](pipeline/sdd-run-tasks.md)

### Conceitos & Referência

- [Visão Geral](concepts/overview.md)
- [Spec-Driven Development](concepts/spec-driven.md)
- [Os 4 Caminhos](concepts/four-paths.md)
- [Gates e Loops](concepts/gates-loops.md)
- [Princípio do Contexto Mínimo](concepts/minimum-context.md)
- [O papel das rules agent-spec-*](concepts/framework-paths.md)
- [Testing Best Practices (skill)](concepts/testing-best-practices.md)
- [Variantes do Scope (miniSpec)](reference/scope-variants.md)
- [Variantes do Tech Spec (SDD)](reference/tech-spec-variants.md)

### Discovery

- [Discovery — Overview](discovery/overview.md)
- [Strategy Selector](discovery/strategy-selector.md)
- [Pre-Refinement](discovery/pre-refinement.md)
- [Brainstorm (Tree of Thought)](discovery/brainstorm.md)

### ADR & Arquitetura

- [ADR — Visão Geral](adr/overview.md)
- [ADR — Ciclo de Vida](adr/lifecycle.md)
- [Template Nygard](adr/template-nygard.md)
- [Integração com Frameworks](adr/integration-frameworks.md)

### Configuração

- [Rules de paths — Fonte Autoritativa](configuration/framework-paths.md)
- [Critical Paths](configuration/critical-paths.md)
- [Path Templates](configuration/path-templates.md)
- [MCP Allowlist](configuration/mcp-allowlist.md)
- [Memória Temporária](configuration/temp-memory.md)
- [Disciplina do Executor (Iron Rules)](configuration/executor-discipline.md)

### Tópicos Avançados

- [Gates Condicionais (requires_qa_revalidation)](advanced/conditional-gates.md)
- [Fast-path Gates](advanced/fast-path-gates.md)
- [Auto-escalação em Retry](advanced/auto-escalation.md)
- [Skip QA quando a Estratégia de Testes está completa](advanced/skip-qa-section14.md)
- [Model Selection](advanced/model-selection.md)
- [qa_context Pré-extraído](advanced/qa-context.md)
- [Consolidação QA por Camada](advanced/qa-consolidation.md)
- [Memória Proativa (deprecada — passou a ser inline)](advanced/proactive-memory.md)

### Customização & Observabilidade

- [Criar Agent Executor Custom](customization/custom-executor.md)
- [Criar Skill Nova](customization/new-skill.md)
- [Override de Modelos](customization/override-models.md)
- [Arquivos de Estado](observability/state-files.md)
- [Inspeção de Memória Temporária](observability/temp-memory-debug.md)
- [qa-observations.md](observability/qa-observations.md)
- [Instalação](getting-started/installation.md)
- [Quick Start (5 min)](getting-started/quick-start.md)
- [Primeira feature (miniSpec completo)](getting-started/first-feature.md)
- [Guia de estilo da documentação](contributing/docs-style-guide.md)

### Apêndices

- [Apêndice B — Categorias canônicas](apendices/B-categorias.md)
- [Apêndice C — Convenções](apendices/C-convencoes.md)
- [Apêndice D — Quem chama quem (mapa de skills)](apendices/D-mapa-skills.md)
- [Apêndice E — Glossário](apendices/E-glossario.md)
- [Apêndice F — Gabarito dos exercícios](apendices/F-gabarito.md)
