<p align="center">
  <img src="doc/img/logo.svg" alt="AgentSpec Logo" width="120" />
</p>

<h1 align="center">AgentSpec Framework</h1>

<p align="center">
  <strong>Engenharia de Software Orientada a Especificações (Spec-Driven Development — SDD) com Inteligência Artificial</strong>
</p>

<p align="center">
  <em>Transforme requisitos ambíguos em software confiável por meio de artefatos estruturados antes da codificação, revisão automática em duas camadas (Quality Gates) e gestão controlada da dívida técnica.</em>
</p>

<p align="center">
  <a href="https://github.com/jheimes-silveira/agent-spec"><img src="https://img.shields.io/badge/GitHub-jheimes--silveira%2Fagent--spec-181717?logo=github" alt="Repo GitHub" /></a>
  <a href="doc/concepts/spec-driven.md"><img src="https://img.shields.io/badge/Metodologia-Spec--Driven%20Development-6366f1" alt="Spec-Driven Development" /></a>
  <a href="doc/concepts/gates-loops.md"><img src="https://img.shields.io/badge/Quality%20Gates-QA%20%2B%20Staff%20Review-10b981" alt="Quality Gates" /></a>
  <a href="https://docs.claude.com/claude-code"><img src="https://img.shields.io/badge/Claude%20Code-Compatível-d97706" alt="Claude Code" /></a>
  <a href="doc/prefacio.md"><img src="https://img.shields.io/badge/Docs-Oficial-0284c7" alt="Docs" /></a>
</p>

---

## 📌 Sumário Executivo

- [Sobre o AgentSpec](#-sobre-o-agentspec)
- [O que o Framework Resolve](#-o-que-o-framework-resolve)
- [Princípios Cardeais](#-princípios-cardeais)
- [Os Quatro Caminhos de Execução](#-os-quatro-caminhos-de-execução)
- [As Duas Camadas de Quality Gates](#-as-duas-camadas-de-quality-gates)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Instalar e Usar no Seu Projeto](#-como-instalar-e-usar-no-seu-projeto)
- [🧭 Mapa de Navegação da Documentação Oficial](#-mapa-de-navegação-da-documentação-oficial)

---

## 💡 Sobre o AgentSpec

O **AgentSpec** é um conjunto de **skills**, **agentes especializados** e **regras de governança** projetado para guiar o desenvolvimento assistido por modelos de linguagem (LLMs / agentes autônomos como Claude Code, Gemini CLI, Cursor e similares).

Diferente de abordagens ad-hoc onde o desenvolvedor pede código direto e gasta horas corrigindo alucinações e regressões, o AgentSpec impõe uma disciplina de engenharia rigorosa e pragmática:

1. **Especificar antes de codar:** a ambiguidade é eliminada na fase de especificação, que é infinitamente mais barata de iterar do que código pronto.
2. **Quality Gates automáticos:** cada tarefa de código é auditada por um validador funcional (QA) e por um revisor arquitetural (Staff Reviewer).
3. **Débito técnico sob controle:** falhas críticas bloqueiam e forçam loops de auto-correção; débitos toleráveis são catalogados e rastreados sem interromper a entrega.

```
                      ┌───────────────────────────────────────────────┐
                      │              Requisito Ambíguo                │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                                 /agent-spec-pre-refinement
                                (Strategy Selector Checklist)
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
                 [TaskCard]               [miniSpec]                [SDD]
                 (1 Task)            (1–3 User Stories)      (Features Complexas)
                      │                       │                       │
                      └───────────────────────┼───────────────────────┘
                                              │
                                              ▼
                                    Executor da Stack
                               (Implementação por Subagente)
                                              │
                                              ▼
                                   Gate 1: QA Validator
                             (Critérios de Aceitação + Testes)
                                              │
                                              ▼
                              Gate 2: Staff Architecture Review
                                (Conformidade com ADRs + Rules)
                                              │
                                              ▼
                                Código Confiável em Main
```

---

## 🎯 O que o Framework Resolve

| Desafio no Desenvolvimento com IA | Como o AgentSpec Resolve |
| :--- | :--- |
| **Escolha da ferramenta ou processo errado** | O `/agent-spec-pre-refinement` aplica o **Strategy Selector**, orientando se você precisa de Conversa Direta, TaskCard, miniSpec ou SDD. |
| **Perda de contexto entre sessões de chat** | Artefatos canônicos versionados em Markdown (`prd.md`, `intent.md`, `taskcard.md`) salvos no repositório em `docs/specs/features/`. |
| **Qualidade inconsistente e regressões** | Gates automáticos em duas camadas (**QA Validator** + **Staff Architecture Review**) executam em cada tarefa com loops automáticos de correção. |
| **Custo elevado e exaustão de tokens** | Heurística de **Contexto Mínimo** e auto-escalação de modelos: modelos rápidos e econômicos (ex.: Sonnet) por padrão; modelos avançados (ex.: Opus) apenas em caminhos críticos (`auth`, `security`, `payments`). |
| **Dívida técnica invisível** | Classificação explícita de achados: riscos críticos/altos bloqueiam merge; manutenibilidade média/baixa gera débito anotado rastreável via `/agent-spec-debt-resolution`. |

---

## ⚖️ Princípios Cardeais

1. **Spec antes de código:** Quanto mais cedo a incerteza é eliminada, menor é o retrabalho.
2. **Contexto mínimo por subagente:** Cada agente recebe estritamente as interfaces, contratos e regras pertinentes à sua função.
3. **Modelo mínimo viável:** Modelos eficientes e econômicos por padrão; auto-escalação para modelos de raciocínio profundo somente quando a criticidade do caminho exige.
4. **Débito técnico controlado:** Tolerância zero para bugs funcionais e falhas de segurança; registro formal para débitos de manutenibilidade e refatoração.

---

## 🔀 Os Quatro Caminhos de Execução

O framework adapta o peso do processo ao tamanho e à complexidade da demanda:

| Caminho | Escopo Típico | Artefato Gerado | Quando Usar |
| :--- | :--- | :--- | :--- |
| **1. Conversa Direta** | 0 tasks | Nenhum artefato | Prototipação rápida, spikes exploratórios, dúvidas conceituais. |
| **2. TaskCard** | 1 task | `taskcard.md` | Correções cirúrgicas de bugs, bumps de versão, alterações cosméticas ou pequenas melhorias. |
| **3. miniSpec** | 1 a 3 User Stories | `intent.md`, `scope.md`, `tasks.md` | Features médias bem delimitadas sem impacto arquitetural profundo. |
| **4. SDD (Spec-Driven Development)** | Features complexas | `prd.md`, `tech-spec.md`, `task-plan.md`, ADRs | Módulos novos, refatorações amplas, mudanças críticas em banco de dados ou integrações de terceiros. |

---

## 🛡️ As Duas Camadas de Quality Gates

Toda execução que gera código passa obrigatoriamente por dois filtros antes de ser considerada concluída:

1. **Gate 1 — QA Validator:**
   - Valida se os **Critérios de Aceitação (CA)** e **Casos de Teste (CT)** foram rigorosamente atendidos.
   - Executa a suíte de testes real do projeto (Jest, Pytest, Go test, Flutter test, etc.).
   - Rejeita testes frágeis (anti-padrões de mock indiscriminado sem seam).
2. **Gate 2 — Staff Architecture Review:**
   - Audita a conformidade com as regras globais do projeto (`rules/`).
   - Verifica conformidade com as **Decisões Arquiteturais Registradas (ADRs)**.
   - Detecta vazamentos de responsabilidade, acoplamento indevido ou alterações em caminhos protegidos.

---

## 📂 Estrutura do Repositório

```text
agent-spec/
├── agents/             # Definições de subagentes especialistas (QA Validator, Staff Reviewer, QA Test Generator)
├── rules/              # Regras globais de workflow, ADRs, miniSpec, SDD e TaskCard
├── skills/             # 36+ skills executáveis (/agent-spec-*)
└── doc/                # 📚 Documentação Oficial Completa (trilhas, capítulos, ADRs, manuais)
    ├── capitulo-0.md   # Visão executiva em 5 minutos
    ├── prefacio.md     # Guia de navegação e trilhas de estudo
    ├── getting-started/# Manuais de instalação e primeiro uso
    ├── partes/         # Trilha completa de capacitação (Partes I a VIII)
    ├── frameworks/     # Detalhamento de SDD, miniSpec, TaskCard e Fluxogramas
    ├── skills/         # Catálogo e especificação técnica de cada skill
    ├── agents/         # Especificação operacional de cada agente
    ├── pipeline/       # Anatomia e mecânica de execução
    ├── concepts/       # Fundamentos conceituais e arquitetura
    ├── adr/            # Governança de ADRs (Architecture Decision Records)
    └── apendices/      # Convenções, categorias canônicas e mapa de skills
```

---

## 🚀 Como Instalar e Usar no Seu Projeto

### 1. Copie o framework para o seu repositório

Para utilizar o AgentSpec com o Claude Code ou ferramentas compatíveis, copie as pastas de agentes, regras e skills para a pasta de configuração do seu projeto (geralmente `.claude/`):

```bash
# Na raiz do seu projeto de destino:
mkdir -p .claude

# Copie os componentes do agent-spec:
cp -r /caminho/para/agent-spec/agents .claude/
cp -r /caminho/para/agent-spec/rules  .claude/
cp -r /caminho/para/agent-spec/skills .claude/
```

### 2. Configure o seu Executor de Stack

O AgentSpec é agnóstico a linguagens. Registre um subagente executor com a especialidade da sua stack (Node/TypeScript, Python, Go, Java, Flutter, etc.) em `.claude/agents/<sua-stack>-developer.md`.

Consulte o [Guia de Custom Executor](doc/customization/custom-executor.md) para o template de configuração.

### 3. Dispare a primeira feature

No seu terminal com o agente de IA iniciado:

```bash
/agent-spec-pre-refinement "Quero implementar autenticação com JWT e refresh token"
```

O framework conduzirá o refinamento, recomendará a melhor estratégia e orquestrará a execução com os Quality Gates.

---

## 🧭 Mapa de Navegação da Documentação Oficial

Toda a documentação detalhada está organizada dentro da pasta [`doc/`](doc/README.md). Utilize os atalhos abaixo para navegar:

### 🎓 Fundamentos & Primeiros Passos
* 📘 [Prefácio — Como Navegar a Documentação](doc/prefacio.md) — Para quem é, trilhas de estudo e convenções.
* ⚡ [Capítulo 0 — O Framework em 5 Minutos](doc/capitulo-0.md) — Resumo executivo de ponta a ponta.
* 🛠️ [Guia de Instalação](doc/getting-started/installation.md) — Passo a passo de setup no seu projeto.
* 🚀 [Quick Start](doc/getting-started/quick-start.md) — Da instalação à primeira feature em minutos.
* 🎯 [Primeira Feature Completa](doc/getting-started/first-feature.md) — Exemplo prático de ponta a ponta.
* 💡 [O que o Framework Resolve](doc/index.md) — Visão geral da proposta de valor.
* 📖 [Introdução Conceitual](doc/intro.md) — Filosofia e contexto do desenvolvimento com agentes.
* ❓ [FAQ Oficial](doc/faq.md) — Dúvidas frequentes conceituais e operacionais.
* 📚 [Glossário Canônico](doc/glossary.md) — US, CA, CT, ADR, PRD, SUT e outros termos.
* 🔧 [Troubleshooting](doc/troubleshooting.md) — Diagnóstico de problemas e falhas em pipelines.
* 📄 [Documentação Consolidada (Single Page)](doc/agent-spec-completo.md) — Manual completo compilado em um único arquivo.

---

### 📚 Trilha de Capacitação Completa (Partes I a VIII)

#### [Parte I — Por que especificar antes de codar](doc/partes/parte-1/index.md)
* [Capítulo 1 — A dor: por que LLMs falham sob ambiguidade](doc/partes/parte-1/capitulo-1.md)
* [Capítulo 2 — As quatro convicções e os princípios cardeais](doc/partes/parte-1/capitulo-2.md)
* [Capítulo 3 — Rastreabilidade: US → CA → CT → código](doc/partes/parte-1/capitulo-3.md)
* [Exercícios — Parte I](doc/partes/parte-1/exercicios.md)

#### [Parte II — Seu primeiro fluxo](doc/partes/parte-2/index.md)
* [Capítulo 4 — Demonstração passo a passo (feature ponta a ponta)](doc/partes/parte-2/capitulo-4.md)
* [Exercícios — Parte II](doc/partes/parte-2/exercicios.md)

#### [Parte III — Escolhendo o caminho certo](doc/partes/parte-3/index.md)
* [Capítulo 5 — Como escolher o caminho](doc/partes/parte-3/capitulo-5.md)
* [Capítulo 6 — TaskCard: quando 1 task basta](doc/partes/parte-3/capitulo-6.md)
* [Capítulo 7 — miniSpec: quando são 1–3 user stories](doc/partes/parte-3/capitulo-7.md)
* [Capítulo 8 — SDD: quando a feature é complexa](doc/partes/parte-3/capitulo-8.md)
* [Capítulo 9 — Conversa direta: o spike consciente](doc/partes/parte-3/capitulo-9.md)
* [Exercícios — Parte III](doc/partes/parte-3/exercicios.md)

#### [Parte IV — A pipeline e os dois gates](doc/partes/parte-4/index.md)
* [Capítulo 10 — Anatomia da pipeline de execução](doc/partes/parte-4/capitulo-10.md)
* [Capítulo 11 — Gate 1: o QA Validator](doc/partes/parte-4/capitulo-11.md)
* [Capítulo 12 — Gate 2: o Tech Review](doc/partes/parte-4/capitulo-12.md)
* [Capítulo 13 — Loops de correção](doc/partes/parte-4/capitulo-13.md)
* [Capítulo 14 — Auto-escalação de modelo](doc/partes/parte-4/capitulo-14.md)
* [Exercícios — Parte IV](doc/partes/parte-4/exercicios.md)

#### [Parte V — A política débito-controlado](doc/partes/parte-5/index.md)
* [Capítulo 15 — A política débito-controlado](doc/partes/parte-5/capitulo-15.md)
* [Capítulo 16 — Categorias e o débito anotado](doc/partes/parte-5/capitulo-16.md)
* [Capítulo 17 — Fechando o ciclo com /agent-spec-debt-resolution](doc/partes/parte-5/capitulo-17.md)
* [Exercícios — Parte V](doc/partes/parte-5/exercicios.md)

#### [Parte VI — Qualidade de testes](doc/partes/parte-6/index.md)
* [Capítulo 18 — A pirâmide invertida de testes com IA](doc/partes/parte-6/capitulo-18.md)
* [Capítulo 19 — O seam: protegendo o código contra testes frágeis](doc/partes/parte-6/capitulo-19.md)
* [Exercícios — Parte VI](doc/partes/parte-6/exercicios.md)

#### [Parte VII — ADRs: a memória das decisões](doc/partes/parte-7/index.md)
* [Capítulo 20 — Por que decisões arquiteturais precisam de registro](doc/partes/parte-7/capitulo-20.md)
* [Capítulo 21 — Ciclo de vida de uma ADR](doc/partes/parte-7/capitulo-21.md)
* [Capítulo 22 — O guardião: como o Tech Review usa ADRs](doc/partes/parte-7/capitulo-22.md)
* [Exercícios — Parte VII](doc/partes/parte-7/exercicios.md)

#### [Parte VIII — Observabilidade, memória e estado](doc/partes/parte-8/index.md)
* [Capítulo 23 — Memória efêmera e checkpoints de estado](doc/partes/parte-8/capitulo-23.md)
* [Capítulo 24 — Diagnóstico e observabilidade de execução](doc/partes/parte-8/capitulo-24.md)
* [Capítulo 25 — Governança e regras do projeto](doc/partes/parte-8/capitulo-25.md)
* [Exercícios — Parte VIII](doc/partes/parte-8/exercicios.md)

---

### 🏗️ Frameworks & Fluxogramas
* [Visão Geral dos Frameworks](doc/frameworks/overview.md)
* [Conversa Direta (Spike)](doc/frameworks/conversa-direta.md)
* [TaskCard (1 Task)](doc/frameworks/taskcard.md)
* [miniSpec (1–3 User Stories)](doc/frameworks/minispec.md)
* [SDD — Spec-Driven Development Completo](doc/frameworks/sdd.md)
* [Índice de Fluxogramas](doc/frameworks/fluxogramas/index.md)
  * [Fluxograma — SDD](doc/frameworks/fluxogramas/sdd.md)
  * [Fluxograma — miniSpec](doc/frameworks/fluxogramas/minispec.md)
  * [Fluxograma — TaskCard](doc/frameworks/fluxogramas/taskcard.md)

---

### ⚙️ Catálogo de Skills Principais

* [Visão Geral das Skills](doc/skills/overview.md)

#### SDD
* [`/agent-spec-sdd-generate-prd`](doc/skills/sdd/sdd-generate-prd.md)
* [`/agent-spec-sdd-generate-tech-spec`](doc/skills/sdd/sdd-generate-tech-spec.md)
* [`/agent-spec-sdd-generate-task-plan`](doc/skills/sdd/sdd-generate-task-plan.md)
* [`/agent-spec-sdd-run-tasks`](doc/skills/sdd/sdd-run-tasks.md)

#### miniSpec
* [`/agent-spec-minispec-generate-intent`](doc/skills/minispec/minispec-generate-intent.md)
* [`/agent-spec-minispec-generate-scope`](doc/skills/minispec/minispec-generate-scope.md)
* [`/agent-spec-minispec-generate-tasks`](doc/skills/minispec/minispec-generate-tasks.md)
* [`/agent-spec-minispec-run-tasks`](doc/skills/minispec/minispec-run-tasks.md)

#### TaskCard
* [`/agent-spec-taskcard-generate`](doc/skills/taskcard/taskcard-generate.md)
* [`/agent-spec-taskcard-run`](doc/skills/taskcard/taskcard-run.md)

#### Architecture Decision Records (ADRs)
* [`/agent-spec-adr-bootstrap`](doc/skills/adr/adr-bootstrap.md)
* [`/agent-spec-adr-create`](doc/skills/adr/adr-create.md)
* [`/agent-spec-adr-show`](doc/skills/adr/adr-show.md)
* [`/agent-spec-adr-list`](doc/skills/adr/adr-list.md)
* [`/agent-spec-adr-review`](doc/skills/adr/adr-review.md)
* [`/agent-spec-adr-supersede`](doc/skills/adr/adr-supersede.md)
* [`/agent-spec-adr-deprecate`](doc/skills/adr/adr-deprecate.md)
* [`/agent-spec-adr-reindex`](doc/skills/adr/adr-reindex.md)

#### Skills Compartilhadas & Apoio
* [`/agent-spec-pre-refinement`](doc/skills/shared/pre-refinement.md)
* [`/agent-spec-challenge-spec`](doc/skills/shared/challenge-spec.md)
* [`/agent-spec-debt-resolution`](doc/skills/shared/debt-resolution.md)
* [`/agent-spec-generate-tech-alignment`](doc/skills/shared/generate-tech-alignment.md)
* [`/agent-spec-generate-design`](doc/skills/shared/generate-design.md)
* [`/agent-spec-design-system-bootstrap`](doc/skills/shared/design-system-bootstrap.md)
* [`/agent-spec-backend-contract-handoff`](doc/skills/shared/backend-contract-handoff.md)
* [`/agent-spec-curate-project-rules`](doc/skills/shared/curate-project-rules.md)
* [`/agent-spec-mine-rule-candidates`](doc/skills/shared/mine-rule-candidates.md)
* [`/agent-spec-rule-create`](doc/skills/shared/rule-create.md)
* [`/agent-spec-docs-sync`](doc/skills/shared/docs-sync.md)
* [`/agent-spec-semantic-commit`](doc/skills/shared/semantic-commit.md)
* [`/agent-spec-testing-stack-bootstrap`](doc/skills/shared/testing-stack-bootstrap.md)
* [`/agent-spec-testing-best-practices`](doc/skills/shared/testing-best-practices.md)

---

### 🤖 Agentes Especializados
* [Visão Geral dos Agentes](doc/agents/overview.md)
* [QA Validator](doc/agents/qa-validator.md) — Gate 1: Validação funcional, comportamental e casos de teste.
* [QA Test Generator](doc/agents/qa-test-generator.md) — Geração de suítes de teste alinhadas aos critérios de aceitação.
* [Staff Architecture Review Agent](doc/agents/staff-architecture-review-agent.md) — Gate 2: Revisão arquitetural, conformidade com ADRs e regras globais.

---

### 🔄 Pipeline de Execução
* [Visão Geral da Pipeline](doc/pipeline/overview.md)
* [Execução TaskCard](doc/pipeline/taskcard-run.md)
* [Execução miniSpec](doc/pipeline/minispec-run-tasks.md)
* [Execução SDD](doc/pipeline/sdd-run-tasks.md)

---

### 🏛️ Arquitetura, ADRs e Conceitos
* [Conceitos — Visão Geral](doc/concepts/overview.md)
* [Filosofia Spec-Driven](doc/concepts/spec-driven.md)
* [Os Quatro Caminhos](doc/concepts/four-paths.md)
* [Gates e Loops](doc/concepts/gates-loops.md)
* [Princípio do Contexto Mínimo](doc/concepts/minimum-context.md)
* [Paths do Framework](doc/concepts/framework-paths.md)
* [Boas Práticas de Testes](doc/concepts/testing-best-practices.md)
* [ADR — Visão Geral](doc/adr/overview.md)
* [ADR — Ciclo de Vida](doc/adr/lifecycle.md)
* [ADR — Template Nygard](doc/adr/template-nygard.md)
* [ADR — Integração com Frameworks](doc/adr/integration-frameworks.md)

---

### 🔬 Discovery, Configuração e Operação Avançada
* [Discovery — Visão Geral](doc/discovery/overview.md)
* [Seletor de Estratégia](doc/discovery/strategy-selector.md)
* [Pré-Refinamento](doc/discovery/pre-refinement.md)
* [Brainstorming de Produto](doc/discovery/brainstorm.md)
* [Configuração de Paths Canônicos](doc/configuration/framework-paths.md)
* [Paths Críticos](doc/configuration/critical-paths.md)
* [Templates de Caminhos](doc/configuration/path-templates.md)
* [Allowlist de MCP](doc/configuration/mcp-allowlist.md)
* [Memória Temporária de Execução](doc/configuration/temp-memory.md)
* [Disciplina do Executor](doc/configuration/executor-discipline.md)
* [Gates Condicionais](doc/advanced/conditional-gates.md)
* [Fast-Path Gates](doc/advanced/fast-path-gates.md)
* [Auto-Escalação de Modelos](doc/advanced/auto-escalation.md)
* [Skip QA Section 14](doc/advanced/skip-qa-section14.md)
* [Seleção de Modelos por Tarefa](doc/advanced/model-selection.md)
* [Contexto de QA](doc/advanced/qa-context.md)
* [Consolidação de QA](doc/advanced/qa-consolidation.md)
* [Memória Proativa](doc/advanced/proactive-memory.md)
* [Executor Customizado](doc/customization/custom-executor.md)
* [Criação de Novas Skills](doc/customization/new-skill.md)
* [Sobrescrita de Modelos](doc/customization/override-models.md)
* [Observabilidade de Estado](doc/observability/state-files.md)
* [Debug de Memória Temporária](doc/observability/temp-memory-debug.md)
* [Observações de QA](doc/observability/qa-observations.md)
* [Guia de Estilo da Documentação](doc/contributing/docs-style-guide.md)

---

### 📎 Apêndices
* [Apêndice B — Categorias Canônicas](doc/apendices/B-categorias.md)
* [Apêndice C — Convenções do Framework](doc/apendices/C-convencoes.md)
* [Apêndice D — Mapa de Skills (Quem Chama Quem)](doc/apendices/D-mapa-skills.md)
* [Apêndice E — Glossário Canônico](doc/apendices/E-glossario.md)
* [Apêndice F — Gabarito dos Exercícios](doc/apendices/F-gabarito.md)

---

<p align="center">
  Desenvolvido com foco em engenharia de software confiável com IA.
</p>
