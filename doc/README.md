# AgentSpec Framework — Documentação Oficial

O **AgentSpec** é um framework de engenharia de software para desenvolvimento orientado a especificações (*Spec-Driven Development* — SDD) com Inteligência Artificial. Ele transforma requisitos ambíguos em software confiável por meio de artefatos estruturados antes da codificação, revisão automática em duas camadas (*Quality Gates*) e gestão controlada da dívida técnica.

---

## 🧭 Mapa de Navegação da Documentação

### Fundamentos & Introdução
* [O que o framework resolve](index.md) — Visão geral da dor e o valor de especificar antes de codar.
* [Introdução](intro.md) — Filosofia e contexto do desenvolvimento com agentes.
* [Prefácio — Como navegar esta documentação](prefacio.md) — Para quem é, trilhas de estudo e convenções.
* [Capítulo 0 — O framework em 5 minutos](capitulo-0.md) — Mapa executivo das peças principais.
* [FAQ](faq.md) — Perguntas frequentes operacionais e conceituais.
* [Glossário](glossary.md) — Termos e acrônimos canônicos (US, CA, CT, ADR, PRD, SUT, etc.).
* [Troubleshooting](troubleshooting.md) — Diagnóstico de problemas comuns e falhas de pipeline.
* [agent-spec — Versão Consolidada](agent-spec-completo.md) — Documentação técnica compilada em página única.

---

### Trilha de Capacitação (Partes I a VIII)

#### [Parte I — Por que especificar antes de codar](partes/parte-1/index.md)
* [Capítulo 1 — A dor: por que LLMs falham sob ambiguidade](partes/parte-1/capitulo-1.md)
* [Capítulo 2 — As quatro convicções e os princípios cardeais](partes/parte-1/capitulo-2.md)
* [Capítulo 3 — Rastreabilidade: US → CA → CT → código](partes/parte-1/capitulo-3.md)
* [Exercícios — Parte I](partes/parte-1/exercicios.md)

#### [Parte II — Seu primeiro fluxo](partes/parte-2/index.md)
* [Capítulo 4 — Demonstração passo a passo (feature ponta a ponta)](partes/parte-2/capitulo-4.md)
* [Exercícios — Parte II](partes/parte-2/exercicios.md)

#### [Parte III — Escolhendo o caminho certo](partes/parte-3/index.md)
* [Capítulo 5 — Como escolher o caminho](partes/parte-3/capitulo-5.md)
* [Capítulo 6 — TaskCard: quando 1 task basta](partes/parte-3/capitulo-6.md)
* [Capítulo 7 — miniSpec: quando são 1–3 user stories](partes/parte-3/capitulo-7.md)
* [Capítulo 8 — SDD: quando a feature é complexa](partes/parte-3/capitulo-8.md)
* [Capítulo 9 — Conversa direta: o spike consciente](partes/parte-3/capitulo-9.md)
* [Exercícios — Parte III](partes/parte-3/exercicios.md)

#### [Parte IV — A pipeline e os dois gates](partes/parte-4/index.md)
* [Capítulo 10 — Anatomia da pipeline de execução](partes/parte-4/capitulo-10.md)
* [Capítulo 11 — Gate 1: o QA Validator](partes/parte-4/capitulo-11.md)
* [Capítulo 12 — Gate 2: o Tech Review](partes/parte-4/capitulo-12.md)
* [Capítulo 13 — Loops de correção](partes/parte-4/capitulo-13.md)
* [Capítulo 14 — Auto-escalação de modelo](partes/parte-4/capitulo-14.md)
* [Exercícios — Parte IV](partes/parte-4/exercicios.md)

#### [Parte V — A política débito-controlado](partes/parte-5/index.md)
* [Capítulo 15 — A política débito-controlado](partes/parte-5/capitulo-15.md)
* [Capítulo 16 — Categorias e o débito anotado](partes/parte-5/capitulo-16.md)
* [Capítulo 17 — Fechando o ciclo com /agent-spec-debt-resolution](partes/parte-5/capitulo-17.md)
* [Exercícios — Parte V](partes/parte-5/exercicios.md)

#### [Parte VI — Qualidade de testes](partes/parte-6/index.md)
* [Capítulo 18 — A pirâmide invertida de testes com IA](partes/parte-6/capitulo-18.md)
* [Capítulo 19 — O seam: protegendo o código contra testes frágeis](partes/parte-6/capitulo-19.md)
* [Exercícios — Parte VI](partes/parte-6/exercicios.md)

#### [Parte VII — ADRs: a memória das decisões](partes/parte-7/index.md)
* [Capítulo 20 — Por que decisões arquiteturais precisam de registro](partes/parte-7/capitulo-20.md)
* [Capítulo 21 — Ciclo de vida de uma ADR](partes/parte-7/capitulo-21.md)
* [Capítulo 22 — O guardião: como o Tech Review usa ADRs](partes/parte-7/capitulo-22.md)
* [Exercícios — Parte VII](partes/parte-7/exercicios.md)

#### [Parte VIII — Observabilidade, memória e estado](partes/parte-8/index.md)
* [Capítulo 23 — Memória efêmera e checkpoints de estado](partes/parte-8/capitulo-23.md)
* [Capítulo 24 — Diagnóstico e observabilidade de execução](partes/parte-8/capitulo-24.md)
* [Capítulo 25 — Governança e regras do projeto](partes/parte-8/capitulo-25.md)
* [Exercícios — Parte VIII](partes/parte-8/exercicios.md)

---

### Frameworks & Fluxogramas
* [Visão Geral dos Frameworks](frameworks/overview.md)
* [Conversa Direta (Spike)](frameworks/conversa-direta.md)
* [TaskCard (1 Task)](frameworks/taskcard.md)
* [miniSpec (1–3 User Stories)](frameworks/minispec.md)
* [SDD — Spec-Driven Development Completo](frameworks/sdd.md)
* [Índice de Fluxogramas](frameworks/fluxogramas/index.md)
  * [Fluxograma — SDD](frameworks/fluxogramas/sdd.md)
  * [Fluxograma — miniSpec](frameworks/fluxogramas/minispec.md)
  * [Fluxograma — TaskCard](frameworks/fluxogramas/taskcard.md)

---

### Catálogo de Skills

* [Visão Geral das Skills](skills/overview.md)

#### SDD
* [`/agent-spec-sdd-generate-prd`](skills/sdd/sdd-generate-prd.md)
* [`/agent-spec-sdd-generate-tech-spec`](skills/sdd/sdd-generate-tech-spec.md)
* [`/agent-spec-sdd-generate-task-plan`](skills/sdd/sdd-generate-task-plan.md)
* [`/agent-spec-sdd-run-tasks`](skills/sdd/sdd-run-tasks.md)

#### miniSpec
* [`/agent-spec-minispec-generate-intent`](skills/minispec/minispec-generate-intent.md)
* [`/agent-spec-minispec-generate-scope`](skills/minispec/minispec-generate-scope.md)
* [`/agent-spec-minispec-generate-tasks`](skills/minispec/minispec-generate-tasks.md)
* [`/agent-spec-minispec-run-tasks`](skills/minispec/minispec-run-tasks.md)

#### TaskCard
* [`/agent-spec-taskcard-generate`](skills/taskcard/taskcard-generate.md)
* [`/agent-spec-taskcard-run`](skills/taskcard/taskcard-run.md)

#### Architecture Decision Records (ADRs)
* [`/agent-spec-adr-bootstrap`](skills/adr/adr-bootstrap.md)
* [`/agent-spec-adr-create`](skills/adr/adr-create.md)
* [`/agent-spec-adr-show`](skills/adr/adr-show.md)
* [`/agent-spec-adr-list`](skills/adr/adr-list.md)
* [`/agent-spec-adr-review`](skills/adr/adr-review.md)
* [`/agent-spec-adr-supersede`](skills/adr/adr-supersede.md)
* [`/agent-spec-adr-deprecate`](skills/adr/adr-deprecate.md)
* [`/agent-spec-adr-reindex`](skills/adr/adr-reindex.md)

#### Skills Compartilhadas & Apoio
* [`/agent-spec-pre-refinement`](skills/shared/pre-refinement.md)
* [`/agent-spec-challenge-spec`](skills/shared/challenge-spec.md)
* [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md)
* [`/agent-spec-generate-tech-alignment`](skills/shared/generate-tech-alignment.md)
* [`/agent-spec-generate-design`](skills/shared/generate-design.md)
* [`/agent-spec-design-system-bootstrap`](skills/shared/design-system-bootstrap.md)
* [`/agent-spec-backend-contract-handoff`](skills/shared/backend-contract-handoff.md)
* [`/agent-spec-curate-project-rules`](skills/shared/curate-project-rules.md)
* [`/agent-spec-mine-rule-candidates`](skills/shared/mine-rule-candidates.md)
* [`/agent-spec-rule-create`](skills/shared/rule-create.md)
* [`/agent-spec-docs-sync`](skills/shared/docs-sync.md)
* [`/agent-spec-semantic-commit`](skills/shared/semantic-commit.md)
* [`/agent-spec-testing-stack-bootstrap`](skills/shared/testing-stack-bootstrap.md)
* [`/agent-spec-testing-best-practices`](skills/shared/testing-best-practices.md)

---

### Agentes Especializados
* [Visão Geral dos Agentes](agents/overview.md)
* [QA Validator](agents/qa-validator.md) — Gate 1: Validação funcional, comportamental e casos de teste.
* [QA Test Generator](agents/qa-test-generator.md) — Geração de suítes de teste alinhadas aos critérios de aceitação.
* [Staff Architecture Review Agent](agents/staff-architecture-review-agent.md) — Gate 2: Revisão arquitetural, conformidade com ADRs e regras globais.

---

### Pipeline de Execução
* [Visão Geral da Pipeline](pipeline/overview.md)
* [Execução TaskCard](pipeline/taskcard-run.md)
* [Execução miniSpec](pipeline/minispec-run-tasks.md)
* [Execução SDD](pipeline/sdd-run-tasks.md)

---

### Arquitetura, ADRs e Conceitos
* [Conceitos — Visão Geral](concepts/overview.md)
* [Filosofia Spec-Driven](concepts/spec-driven.md)
* [Os Quatro Caminhos](concepts/four-paths.md)
* [Gates e Loops](concepts/gates-loops.md)
* [Princípio do Contexto Mínimo](concepts/minimum-context.md)
* [Paths do Framework](concepts/framework-paths.md)
* [Boas Práticas de Testes](concepts/testing-best-practices.md)
* [ADR — Visão Geral](adr/overview.md)
* [ADR — Ciclo de Vida](adr/lifecycle.md)
* [ADR — Template Nygard](adr/template-nygard.md)
* [ADR — Integração com Frameworks](adr/integration-frameworks.md)

---

### Discovery, Configuração e Operação Avançada
* [Discovery — Visão Geral](discovery/overview.md)
* [Seletor de Estratégia](discovery/strategy-selector.md)
* [Pré-Refinamento](discovery/pre-refinement.md)
* [Brainstorming de Produto](discovery/brainstorm.md)
* [Configuração de Paths Canônicos](configuration/framework-paths.md)
* [Paths Críticos](configuration/critical-paths.md)
* [Templates de Caminhos](configuration/path-templates.md)
* [Allowlist de MCP](configuration/mcp-allowlist.md)
* [Memória Temporária de Execução](configuration/temp-memory.md)
* [Disciplina do Executor](configuration/executor-discipline.md)
* [Gates Condicionais](advanced/conditional-gates.md)
* [Fast-Path Gates](advanced/fast-path-gates.md)
* [Auto-Escalação de Modelos](advanced/auto-escalation.md)
* [Skip QA Section 14](advanced/skip-qa-section14.md)
* [Seleção de Modelos por Tarefa](advanced/model-selection.md)
* [Contexto de QA](advanced/qa-context.md)
* [Consolidação de QA](advanced/qa-consolidation.md)
* [Memória Proativa](advanced/proactive-memory.md)
* [Executor Customizado](customization/custom-executor.md)
* [Criação de Novas Skills](customization/new-skill.md)
* [Sobrescrita de Modelos](customization/override-models.md)
* [Observabilidade de Estado](observability/state-files.md)
* [Debug de Memória Temporária](observability/temp-memory-debug.md)
* [Observações de QA](observability/qa-observations.md)
* [Guia de Estilo da Documentação](contributing/docs-style-guide.md)

---

### Apêndices
* [Apêndice B — Categorias Canônicas](apendices/B-categorias.md)
* [Apêndice C — Convenções do Framework](apendices/C-convencoes.md)
* [Apêndice D — Mapa de Skills (Quem Chama Quem)](apendices/D-mapa-skills.md)
* [Apêndice E — Glossário Canônico](apendices/E-glossario.md)
* [Apêndice F — Gabarito dos Exercícios](apendices/F-gabarito.md)
