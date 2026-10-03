---
title: "agent-spec — versão consolidada"
description: "Visão consolidada do framework agent-spec — princípios, gates, débito técnico, ADRs e o porquê de cada decisão."
---
# agent-spec — versão consolidada

::: info 📖 Sobre esta página
Visão consolidada do framework numa página única — princípios, gates, débito técnico, ADRs e o porquê de cada decisão.
Use esta página quando quiser **ler corrido** ou usar **Ctrl+F** para buscar um termo. Para leitura segmentada com exercícios, vá pelo [Prefácio](prefacio.md) e siga os capítulos.
:::

## Sumário

| # | Parte | Conteúdo |
| --- | --- | --- |
| **I** | [Fundamentos](#parte-i-—-fundamentos) | Por que existe · princípios · 4 caminhos |
| **II** | [A Pipeline de Execução](#parte-ii-—-a-pipeline-de-execucao) | Anatomia · Gate 1 · Gate 2 · débito-controlado · loops · auto-escalação |
| **III** | [Os Frameworks em Profundidade](#parte-iii-—-os-frameworks-em-profundidade) | TaskCard · miniSpec · SDD · Conversa direta |
| **IV** | [Decisões Arquiteturais (ADRs)](#parte-iv-—-decisoes-arquiteturais-adrs) | 5 critérios · lifecycle · ADR Compliance Light |
| **V** | [Engenharia da Qualidade](#parte-v-—-engenharia-da-qualidade) | Testing best-practices · critical paths · glossário de domínio |
| **VI** | [Observabilidade e Memória](#parte-vi-—-observabilidade-e-memoria) | qa-observations · memória lazy/inline · state files |
| **VII** | [Manutenção e Cleanup](#parte-vii-—-manutencao-e-cleanup) | /agent-spec-debt-resolution · /agent-spec-challenge-spec |
| **A–D** | [Apêndices](#apendices) | Paths · categorias · convenções · mapa de skills |

---

## Parte I — Fundamentos

### 1. Por que este framework existe

LLMs codificam bem em **escopo pequeno e bem definido** e codificam mal sob ambiguidade. Quando você dá a um modelo a tarefa "implemente o cadastro de pratos da franquia", ele acaba:

* improvisando nomes que conflitam com o resto do código,
* escolhendo bibliotecas que o projeto já abandonou,
* esquecendo validações que estão implícitas no domínio,
* entregando 80% e declarando 100%.

O `agent-spec` parte de quatro convicções operacionais:

1. **Especificação antes de código** — quanto mais cedo a ambiguidade morrer, mais barato sai.
2. **Contexto mínimo por subagente** — cada agente recebe só o que precisa para sua etapa; o resto polui e empobrece o output.
3. **Modelo mínimo viável** — Sonnet por padrão; Opus só onde paga o custo.
4. **Débito técnico controlado, não zero** — bloquear no que é risco real (`crítico`/`alto`); anotar o que é débito de manutenibilidade (`médio`/`baixo`).

Cada uma dessas convicções gera um conjunto de mecanismos concretos. As próximas seções desmontam esses mecanismos peça por peça.

### 2. Os princípios cardeais

| Princípio | Mecanismo concreto |
| --- | --- |
| **Spec antes de código** | Skills `*-generate-*` produzem `prd.md`, `tech_spec.md`, `intent.md`, `scope.md`, `taskcard.md` versionados em `docs/specs/features/{feature}/{version}/` antes de qualquer linha de código. |
| **Contexto mínimo** | Skills geram `.qa_context.md` denso para os gates; gates recebem `base_sha` + sumário do executor inline (sem arquivos intermediários). |
| **Modelo mínimo** | Frontmatter declara `model: sonnet` por default; orquestradores escalam para Opus por heurística (`critical_paths`, `risk: high`, retry ≥ 2). |
| **Débito-controlado** | Veredito por severidade — críticos/altos rejeitam (loop), médios/baixos viram débito anotado em [`qa-observations.md`](observability/qa-observations.md) (cleanup via [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md)). |
| **Fonte única de verdade de paths** | `.claude/rules/framework-paths.md` é a fonte autoritativa. Skills resolvem chaves canônicas (`sdd.tech_spec.path`, `shared.qa_observations.path`); nunca fixos no código. |
| **Rastreabilidade total** | US → CA → CT → código. Cada problema do QA carrega `criterio_aceitacao_violado`. |

Esses princípios são **descritivos**, não aspiracionais — todo mecanismo abaixo é a expressão concreta de pelo menos um deles.

### 3. Os quatro caminhos

O framework reconhece que features têm tamanhos diferentes. Forçar todas pelo mesmo pipeline gera ou over-engineering — feature trivial recebendo o cerimonial completo do SDD — ou under-engineering — feature complexa entrando como TaskCard. A `/agent-spec-pre-refinement` aplica um **Strategy Selector** (uma checklist objetiva de 8 sinais S1-S8) para recomendar o caminho:

| Caminho | Artefato gerador | Quando |
| --- | --- | --- |
| **Conversa direta** | Nenhum — Claude conversa, edita, propõe | Spike, exploração, prototipagem. Sem gates. Sem versionamento. |
| **TaskCard** | `taskcard.md` (1 task única) | Mudança pontual e isolada (bug fix, ajuste de UI, refactor de 1 arquivo). |
| **miniSpec** | `intent.md` + `scope.md` + `tasks/T{n}.md` | Feature de 1-3 user stories, integração de baixo a médio risco. |
| **SDD** | `prd.md` + `tech_spec.md` + ADRs + `task_plan.md` + `tasks/T{n}.md` | Feature complexa, multi-US, alto custo de retrabalho. |

> **Erro caro mais frequente**: começar uma feature como TaskCard "porque parece simples" e descobrir 4 tasks depois que era miniSpec. **Custo de promoção** (refazer como miniSpec) é alto. **Custo de degradação** (rodar SDD em TaskCard simples) é apenas overhead temporal. Default conservador: **suba uma estrada** se há dúvida.

Veja [Os 4 Caminhos](concepts/four-paths.md) para a matriz comparativa completa e custos típicos em tokens.

---

## Parte II — A Pipeline de Execução

### 4. Anatomia da pipeline

Todo `*-run-tasks` segue a mesma anatomia, independente do framework gerador (SDD, miniSpec, TaskCard):

```
                    ┌──────────────────────────────────┐
                    │  Orquestrador (skill *-run-tasks) │
                    └──────────────┬───────────────────┘
                                   │
                ┌──────────────────▼──────────────────┐
                │ FASE 1: Grafo de dependências        │
                │ Identifica tasks prontas (sem deps   │
                │ pendentes) e lotes paralelizáveis    │
                └──────────────────┬──────────────────┘
                                   │
                ┌──────────────────▼──────────────────┐
                │ FASE 2: Executor (agent da stack)    │
                │ Implementa a task. Pode ser sonnet   │
                │ ou opus dependendo do frontmatter +  │
                │ heurísticas. Devolve sumário de 4-6  │
                │ linhas + paths tocados.              │
                └──────────────────┬──────────────────┘
                                   │
                  [orquestrador persiste base_sha + summary
                   inline em memória do orquestrador]
                                   │
                ┌──────────────────▼──────────────────┐
                │ FASE 3: Gate 1 (agent-spec-qa-validator)        │
                │ Sonnet → Opus em critical paths.     │
                │ Camadas 0-7 (escopo, corretude,      │
                │ robustez, segurança superfície,      │
                │ completude, testes, ADR light,       │
                │ EXECUÇÃO de suíte).                  │
                └─ APROVADO/COM_OBS ─┬─ REJEITADO ─────┘
                                    │       │
                                    │       └─→ Loop QA (até 3 tentativas)
                                    │
                ┌───────────────────▼──────────────────┐
                │ FASE 4: Gate 2 (Tech Review)         │
                │ Sonnet → Opus mais agressivo.        │
                │ Diff git por path + sumário mínimo   │
                │ do QA (7 campos). Arquitetura, ADRs, │
                │ segurança profunda.                  │
                └─ approved/with_obs ┬─ partial/rejected ┘
                                     │      │
                                     │      └─→ Loop TR (até 3 tentativas TOTAIS)
                                     │
                                     ▼
                          git add (stage, sem commit)
                                     │
                                     ▼
                              Task concluída
```

**Invariantes** que valem em todo *-run-tasks:

1. O contador de tentativas é **compartilhado** entre Gate 1 e Gate 2 (máximo 3, **não reseta** entre gates).
2. **Gate 1 é o único que executa testes**. Gate 2 só re-executa em três casos: (i) QA não executou; (ii) QA rodou parcial em área crítica; (iii) Tech Review detectou violação `critical` em `architecture`/`security`.
3. **Gate 2 não recebe o JSON completo do QA** — apenas 7 campos do sumário (veredito, nota_qualidade, security_flags, executou_testes, escopo_testes, tocou_area_critica, escopo_declarado). Economia de ~5k tokens por task.
4. **`git add` sem commit** — o orquestrador apenas faz stage. O commit fica a cargo do humano (ou de outro skill como `/agent-spec-semantic-commit`).

Detalhes operacionais em [Pipeline — Overview](pipeline/overview.md).

### 5. Gate 1 — agent-spec-qa-validator em profundidade

[Agente completo](agents/qa-validator.md). O Gate 1 é o **olho funcional** da pipeline. Tem 8 camadas, todas obrigatórias:

#### Camada 0 — Completude de Escopo Declarado (PRIMEIRA, bloqueante)

> Adicionada após descobrirmos que **CAs frouxos mascaravam entregas parciais**. Foi a brecha mais embaraçosa do framework.

Cruza a lista declarada na task (`§5.1 Arquivos a Criar` + `§5.2 Arquivos a Modificar` no SDD, `§3.1 + §3.2` no miniSpec) contra o working tree real:

* Arquivo **declarado a criar e ausente** → `CRÍTICO` com `categoria: "logic"`.
* Arquivo **declarado a modificar e nunca tocado** → `CRÍTICO`.
* Subtask sem CA correspondente **e** sem evidência no diff → `ALTO`.

Task sem seção de "Arquivos Impactados" (caso de alguns TaskCards triviais) recebe `escopo_declarado.fonte: "ausente"` em `observacoes` — graceful, não rejeita por si só, mas Gate 2 fará o cruzamento manualmente.

**Por que não está nos CAs**: CAs validam comportamento; `escopo_declarado` valida presença estrutural. Um arquivo pode satisfazer todos os CAs e ainda assim faltar outro arquivo declarado que nenhum CA cobre.

#### Camada 1 — Corretude

Cada CA da task vira um item em `criterios_aceitacao[]` com status `PASSOU | FALHOU | PARCIAL`. `PARCIAL` é **considerado falha** — não existe "implementou 80%, vamos seguir".

#### Camada 2 — Robustez

Trata `null`/vazio/negativo/array vazio? Caminhos de erro cobertos? Promises/coroutines/goroutines tratadas? UI: loading/error/empty/success states? Race de UI (double-click, submit duplo)?

#### Camada 3 — Segurança de superfície

| Stack | O que vigia |
| --- | --- |
| Backend | Injeção SQL/command, validação em rotas expostas |
| Frontend | XSS óbvio (`innerHTML`, `dangerouslySetInnerHTML`, `v-html` sem sanitização), dados sensíveis em `localStorage` |
| Mobile | Logs com PII, deep links sem validação |
| Todas | Segredos fixos no código (hardcoded) |

Segurança **profunda** (IDOR, escalação de privilégios, fluxos completos de token, CSP, certificate pinning) é do Gate 2.

#### Camada 4 — Completude

Todos os cenários cobertos? Validações faltando? Mensagens amigáveis? Estados visuais presentes?

#### Camada 5 — Qualidade dos Testes (29 antipadrões)

O `agent-spec-qa-validator` **invoca a skill [`agent-spec-testing-best-practices`](concepts/testing-best-practices.md) antes de produzir o JSON**. A skill traz 29 antipadrões nomeados, organizados em 5 famílias, com severidade pré-mapeada. Cada smell detectado vira **simultaneamente** dois itens no JSON:

* `testing_smells.antipadroes_detectados[]` (com nome canônico em snake_case)
* `problemas.*[]` (com `problema_relacionado` apontando ao ID do smell)

**Os 5 antipadrões críticos** (rejeitam sempre):

| Nome | Sintoma | Por que crítico |
| --- | --- | --- |
| `mock_driven_confidence` (AP-10) | Asserção em valor que o próprio teste plantou no mock | Teste validando ele mesmo, não o sistema |
| `retry_as_fix` (AP-22) | Configuração de retry mascarando flakiness sem telemetria | Esconde bug intermitente |
| `snapshot_as_test` (AP-04) sem `PRODUCT_CONTRACT` | Snapshot de texto UI, mensagem, DOM, JSON interno | Snapshot só vale para contrato externo estável |
| `weakening_test_to_pass` (AP-24) | Asserção enfraquecida no mesmo commit do fix | Reescrita do contrato em vez de fix |
| `mock_repository_layer` (AP-27) | Service mocka o próprio Repository em vez de query layer | Esconde bugs de ordenação/filtragem |

Para a lista completa (críticos, altos, médios, baixos) veja [Testing Best Practices](concepts/testing-best-practices.md).

#### Camada 6 — ADR Compliance Light

Sweep **grep-detectável** de ADRs ativas em `docs/adr/`. Não é análise profunda — é grep + comparação. Análise estrutural fica no Gate 2.

Procedimento canônico:

1. Lê `docs/adr/INDEX.md` e filtra ADRs `Accepted` (ignora `Deprecated`/`Superseded`).
2. Para cada ADR, identifica se a regra é grep-detectável no diff (ex.: ADR exige tags `json:` em inglês → grepa tags pt-BR nos arquivos tocados).
3. Violações grep-detectáveis viram `problemas.*` com `categoria: "adr_compliance"` + item em `adr_compliance.violacoes_grep_detectaveis[]`.

**Motivação**: o post-mortem `cadastro-pratos-franquia` mostrou que violações triviais de ADR (idioma de identificador, naming de método para soft-delete) cascateavam por 3+ tasks quando descobertas só no Gate 2. Pegar grep no Gate 1 evita rodadas de correção em tasks subsequentes.

#### Camada 7 — Testes Automatizados (bloqueante)

* **Existência**: testes exigidos pela spec/task **devem existir**. Ausência → CRÍTICO.
* **Execução**: o `agent-spec-qa-validator` é o **único gate que roda a suíte**.
  + **Suíte completa** quando a task toca shared/core/utils/auth/DI/rotas/schemas globais ou altera contrato consumido por outras features.
  + **Parcial** (feature + dependentes diretos + smoke) quando a task é isolada.
* Qualquer teste falhando (inclusive regressão em outras áreas) → `REJEITADO`.

O campo `testes_executados.tocou_area_critica` é o **sinal que orienta o Gate 2** a re-executar ou não a suíte.

#### A política de veredito: débito-controlado

A escolha que mais distingue este framework de pipelines típicos de IA: **médios e baixos não rejeitam**.

| Condição | Veredito |
| --- | --- |
| `criticos == [] && altos == [] && medios == [] && baixos == []` | `APROVADO` |
| Só há `medios` e/ou `baixos` (sem críticos nem altos) | `APROVADO_COM_OBSERVACOES` |
| Há `criticos` ou `altos` | `REJEITADO` |

**Filosofia (pensa como dev sênior)**:

* Bloqueia o que é **risco real** — bug funcional, vulnerabilidade, teste flaky, antipadrão que mascara regressão.
* Anota o que é **débito de manutenibilidade** — magic string, naming subótimo, duplicação leve, padrão de teste discutível.

**Por que não zero-débito**: política zero-débito força loops de correção de 5-8 minutos por problema BAIXO trivial (ex.: extrair constante de uma magic string num teste que já passa). Custo de tokens e tempo não compensa o ganho marginal. Débito-controlado mantém a barra alta no que importa e permite progresso no que é estilístico.

**`APROVADO_COM_OBSERVACOES` ≠ "ignorar"**: cada `medio`/`baixo` continua em `problemas.*` com `correcao_sugerida`. O orquestrador propaga para `qa-observations.md` e a skill [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md) recolhe o débito acumulado para gerar uma `v{N+1}-debits/` da feature com tasks de cleanup, fechando o ciclo.

### 6. Gate 2 — agent-spec-staff-architecture-review em profundidade

[Agente completo](agents/staff-architecture-review-agent.md). O Gate 2 é o **olho arquitetural**. Sua invocação pressupõe que o QA já aprovou funcionalmente. Trabalha sobre **diff git** + sumário mínimo do QA.

#### O que valida

| Categoria | Exemplo |
| --- | --- |
| **Arquitetura** | Separação de camadas, dependências corretas, padrão Repository/Service respeitado |
| **Boas práticas** | Clean code, acoplamento, coesão, DRY, complexidade ciclomática |
| **Qualidade de código** | Nomenclatura, magic numbers, duplicação estrutural, gambiarras |
| **Conformidade com ADRs** | Leitura profunda das ADRs relevantes; violação clara é CRÍTICO |
| **Segurança profunda** | IDOR, escalação, fluxos completos de token, CSP, certificate pinning, open redirect |
| **Qualidade profunda dos testes** | Determinismo, asserções significativas, antipatrões estruturais |

#### O que NÃO valida (é Gate 1)

* Corretude funcional contra CAs (confia no JSON do QA).
* Robustez funcional óbvia.
* Segurança **de superfície** (input validation óbvio, XSS óbvio).

#### Verificação cruzada de escopo (rápida)

Antes da análise arquitetural, o Gate 2 lê `escopo_declarado` do sumário do QA. Se o QA já flagou entregáveis faltantes, devolve `status: "skipped_qa_rejected"` — não deveria nem ter sido chamado. Se o sumário vier sem o campo (QA legado) ou com `fonte: "ausente"`, faz a checagem ele mesmo confrontando §5/§3 da task contra `git diff --name-only`. **Única exceção** em que o Gate 2 toca em "completude" — limitada a presença estrutural, não comportamento.

#### Re-execução de testes — quase nunca

Gate 2 re-executa a suíte completa apenas se:

* QA reportou `executou_testes: false` ou `escopo_testes: "NAO_EXECUTADO"`.
* QA reportou `escopo_testes: "PARCIAL"` E `tocou_area_critica: true`.
* Detecta violação `critical` em `architecture` ou `security` que pode causar regressão sistêmica.

Quando re-executa, qualquer falha entra em `problems[]` com `severity: "critical"` e `category: "testability"`/`architecture`/`security`.

#### Status (política débito-controlado)

| Condição | Status |
| --- | --- |
| `problems: []` | `approved` |
| Há `medium` e/ou `low` (sem `critical` nem `high`) | `approved_with_observations` |
| Há `high` (sem `critical`) | `partial` |
| Há `critical` | `rejected` |
| QA retornou `REJEITADO` (sumário) | `skipped_qa_rejected` |

`partial` e `rejected` disparam loop. `approved_with_observations` não — vai como débito anotado em `qa-observations.md` igual ao Gate 1.

#### Auto-escalação Sonnet → Opus

O Gate 2 é mais agressivo na escalação que o Gate 1. Sobe para Opus quando:

| Trigger | Quando |
| --- | --- |
| `diff_touches_critical_path` | Diff toca categoria sensível (auth/security/crypto/db_migrations/secrets/api_contracts/payments) |
| `task_risk: high` (frontmatter) | Declarado pelo task generator |
| `qa_security_flags` não vazio | QA sinalizou superfície duvidosa; Tech Review precisa olhar fundo |
| `retry_attempt >= 1` | Segundo olho criterioso após uma rejeição prévia |

### 7. A política débito-controlado em profundidade

Esta é a decisão arquitetural mais importante e menos óbvia do framework. Vale explorar com calma.

#### O problema com zero-débito

Pipelines de IA com policy zero-débito rejeitam **qualquer** problema, em qualquer severidade. Isso gera um padrão observável:

* Tarefa A: 0 problemas. Aprovada na primeira.
* Tarefa B: 1 problema BAIXO (uma magic string num teste). Rejeitada.
* Loop de correção dispara.
* Modelo gera correção mínima.
* Re-roda QA + Tech Review (5-8 min).
* Tarefa B aprovada.

**Custo total** para corrigir uma magic string: ~6 min de tempo real + ~30-50k tokens. O delta de valor entregue ao usuário: zero — o teste já passava. Era débito de manutenibilidade, não risco.

Pior: a forma típica de o modelo "corrigir" um BAIXO é introduzir um pequeno desvio (renomear uma variável de teste) que cria sua própria pequena divergência com convenção do projeto. Você troca um débito BAIXO por outro.

#### A reformulação

Em vez de "todo problema rejeita", o framework adota o critério que **devs sênior usam mentalmente em code review**:

* Bloqueia **risco real**: bug funcional, vulnerabilidade, teste flaky, antipadrão que mascara regressão.
* Anota **débito de manutenibilidade**: magic string, naming subótimo, duplicação leve, padrão discutível.

Operacionalmente, isso vira a tabela de vereditos das seções 5 e 6.

#### O fechamento do ciclo

A objeção natural: "se não rejeitar médios/baixos, eles ficam acumulando para sempre". Falso — eles são **anotados** com `correcao_sugerida` em `qa-observations.md` da feature. A skill [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md) é o fechamento:

```bash
# Após uma feature inteira ser concluída:
/agent-spec-debt-resolution docs/specs/features/<feature>/v1/

# A skill:
# 1. Lê qa-observations.md e extrai débitos elegíveis.
# 2. Consulta especialista da stack (Go/Flutter/JS/etc.) via descoberta interativa.
# 3. Especialista classifica cada débito como "recomendado_corrigir" ou "perfumaria".
# 4. Usuário escolhe interativamente quais incluir.
# 5. Gera v{N+1}-debits/ com tasks de cleanup (gates: [qa]).

# Execute o cleanup:
/agent-spec-minispec-run-tasks docs/specs/features/<feature>/v2-debits/task_plan.md <especialista>
```

O resultado é que o débito sai como um **batch coordenado** após cada feature, em vez de virar 50 micro-loops de 5 min durante a execução. Operacionalmente, é mais barato em tokens e mais limpo em commits.

#### Categorias: revalidation_required vs code_review_only

Quando o Gate 2 rejeita e o orquestrador entra em loop, ele precisa decidir se a próxima rodada **passa pelo QA novamente** ou **vai direto a um novo Tech Review**. Essa decisão depende da categoria do problema:

| Categoria | Tipo | Por que |
| --- | --- | --- |
| `architecture` | **revalidation_required** | Mudança estrutural altera fluxo, dependências, contratos |
| `security` | **revalidation_required** | Correção de vulnerabilidade afeta lógica de validação |
| `tests` | **revalidation_required** | Implica mudar/criar testes — QA precisa re-executar |
| `logic` | **revalidation_required** | Bug de lógica corrigido muda comportamento |
| `data_handling` | **revalidation_required** | Parsing/validação/serialização afeta entrada/saída |
| `error_handling` | **revalidation_required** | Tratamento de erro altera fluxo de exceções |
| `performance` | **revalidation_required** | Otimização que muda algoritmo pode quebrar casos limite |
| `concurrency` | **revalidation_required** | Comportamento sob carga muda |
| `adr_compliance` | **revalidation_required** | Conformidade com ADR pode exigir mudança estrutural |
| `code_quality` | code_review_only | Refactor sem mudança de comportamento |
| `naming` | code_review_only | Renomear sem mudar API |
| `style` | code_review_only | Formatação, espaçamento |
| `documentation` | code_review_only | Comentários, docstrings |
| `dead_code` | code_review_only | Remoção de código nunca executado |
| `imports` | code_review_only | Reorganização/limpeza |

**Algoritmo**: se TODOS os problemas estão em `code_review_only` → pula QA na próxima rodada. Qualquer categoria desconhecida ou em `revalidation_required` → re-QA. **Default conservador**: na dúvida, re-QA. Pular indevidamente é mais caro do que rodar QA num naming fix.

**Sinais de override que sempre forçam re-QA**:

* `tocou_area_critica == true` no QA original.
* `qa_security_flags` não vazio.
* `task_risk == "high"` no frontmatter.
* O patch sugerido pelo Tech Review adiciona/remove arquivos (`git diff --stat` mudou).

### 8. Loops de correção e auto-escalação

#### Estrutura do loop

Em rejeição (Gate 1 ou Gate 2), o orquestrador executa:

```
1. Cria/atualiza memória lazy em:
   /docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md
   ├─ attempt_count (incrementado)
   ├─ last_severity (maior do gate que rejeitou)
   ├─ JSON completo do gate que rejeitou
   ├─ requires_qa_revalidation (calculado se Gate 2 rejeitou)
   ├─ git diff --stat
   └─ paths tocados

2. Aplica auto-escalação se trigger atingido.

3. Monta prompt de correção:
   • Lista TODOS os problemas (sem filtro de severidade)
   • CAs não atendidos
   • Detalhes de testes que falharam
   • Instrução: "Corrija APENAS os problemas listados. Não expanda escopo."

4. Delega ao executor com modelo escalado (se aplicável).

5. Re-valida (bifurca conforme classificação):
   • Gate 1 rejeitou → re-roda APENAS Gate 1.
   • Gate 2 rejeitou + requires_qa_revalidation=true → Gate 1 + Gate 2.
   • Gate 2 rejeitou + requires_qa_revalidation=false → SÓ Gate 2.

6. Atualiza attempt_count e last_severity.

7. Loga em qa-observations.md (auditoria obrigatória).

8. Saída:
   • Aprovado → avança / conclui (apaga memória lazy)
   • Rejeitado novamente → volta ao passo 2
   • attempt_count >= 3 → marca BLOQUEADO, escala ao usuário
```

#### Tabela de auto-escalação Sonnet → Opus

| Trigger | Quem escala | Quando |
| --- | --- | --- |
| Path toca `critical_paths` | Executor / QA / Tech Review | Antes de invocar |
| `task_risk: high` (frontmatter) | Executor / QA / Tech Review | Antes de invocar |
| `files_to_create_count >= 10` | Executor (heurística de tamanho) | Antes de invocar |
| `attempt_count >= 2` | Executor (auto-escalação em retry) | Em rejeição |
| `last_severity == high` | Executor | Em rejeição |
| `qa_security_flags` não vazio | Tech Review | Antes de invocar Gate 2 |
| `retry_attempt >= 1` | Tech Review (segundo olho) | Em retry |

#### Hard stop em 3 tentativas

```
Tentativa 1: sonnet (default)        → REJEITADO
Tentativa 2: sonnet (ainda)          → REJEITADO
Tentativa 3: opus (auto-escalado)    → REJEITADO
             ↓
        BLOQUEADO. Framework para e pergunta ao usuário.
```

O framework **não tenta loop infinito**. O usuário recebe relatório completo (JSONs dos gates, memória lazy, paths tocados) e decide próximos passos manualmente. Quando isso acontece, geralmente significa que a task estava mal-formulada — não que o modelo é incapaz.

#### Execução paralela de tasks (fase de paralelismo declarado)

Tasks que no `task_plan.md` declaram `Pode Rodar em Paralelo? = Sim` na mesma fase podem rodar concorrentemente **se** os guards passam:

1. **Mesma fase** no task_plan.
2. `Pode Rodar em Paralelo? = Sim` em todas.
3. **Paths disjuntos** — união de `§Arquivos a Criar` + `§Arquivos a Modificar` não intersecciona entre tasks do lote.
4. **Sem dependência transitiva textual** — se T1 cria símbolo público que T2 referencia, T2 sai do lote.
5. **Limite `MAX_PARALLEL = 4`** — lotes maiores quebram em ondas.

Quando qualquer guard falha → **fallback automático (volta para execução sequencial)** com log do motivo em `qa-observations.md`.

**Mecânica**:

1. `base_sha` capturado UMA vez antes do lote.
2. Despacho concorrente: todos os `Agent()` do executor numa única mensagem do orquestrador.
3. Aguarda todos retornarem.
4. Gates por task **em paralelo** (cada `ti` tem seu pipeline `QA → Tech Review` isolado).
5. **Stage determinístico**: após todos os Tech Reviews aprovarem, `git add` em ordem `T1 → T2 → ... → Tn`.
6. **Falha isolada**: uma task em retry não trava as outras.

---

## Parte III — Os Frameworks em Profundidade

### 9. TaskCard — quando 1 task basta

**Quando usar**: mudança pontual e isolada, sem decomposição. Bug fix, ajuste de UI, refactor de 1 arquivo, atualização de config.

**Quando NÃO usar**: qualquer coisa que envolva ≥ 2 user stories ou ≥ 2 tasks. Promova para miniSpec.

#### Anatomia

Um único arquivo `task-{nn}-{slug}.md` em `/docs/specs/features/{feature}/{version}/tasks/`. Contém todo o necessário: ID, objetivo, arquivos impactados, CAs, testes.

#### Pipeline

```
/agent-spec-taskcard-generate  →  taskcard.md
                                     │
                                     ▼
                            /agent-spec-taskcard-run
                                     │
                            (mesmo pipeline da Parte II)
                                     │
                                     ▼
                               Task concluída
```

Loop e gates idênticos ao miniSpec/SDD. Diferença é apenas o **gerador** (taskcard único em vez de PRD+TechSpec ou Intent+Scope).

#### Fast-path opcional

TaskCards seguindo pattern existente (CRUD trivial) podem declarar `gates: [qa]` no frontmatter para pular Tech Review. Veja [Fast-path Gates](advanced/fast-path-gates.md).

### 10. miniSpec — quando 1-3 user stories

**Quando usar**: feature pequena a média. 1-3 US, complexidade técnica moderada, sem decisões arquiteturais novas relevantes.

**Quando NÃO usar**:

* Promova para SDD: ≥ 4 US, decisões com ADR, refactor cross-módulo.
* Degrade para TaskCard: 1 US trivial, sem dependência interna.

#### Anatomia

```
/docs/specs/features/<feature>/<version>/
├── pre-refinement.md         (opcional, mas recomendado)
├── intent.md                 (O QUE + POR QUÊ)
├── tech-alignment.md         (opcional)
├── scope.md                  (componentes, paths, padrões)
├── task_plan.md              (decomposição + ordem + paralelismo)
├── tasks/
│   ├── T1.md
│   ├── T2.md
│   └── T3.md
├── qa-observations.md        (gerado durante execução)
├── minispec_state.yaml       (rastreabilidade)
└── tasks/.tmp/               (memória lazy, .gitignore)
```

#### Pipeline completo

```
/agent-spec-pre-refinement                  (opcional, discovery)
        │
        ▼
/agent-spec-minispec-generate-intent        (FASE 0: detecta variante web/mobile/backend)
        │
        ▼
/agent-spec-generate-tech-alignment         (opcional — decisões curtas)
        │
        ▼
/agent-spec-minispec-generate-scope         (FASE 0.0: confirma variante via AskUserQuestion)
        │
        ▼
/agent-spec-challenge-spec                  (opcional — stress-test do scope)
        │
        ▼
/agent-spec-minispec-generate-tasks         (decompõe em T1..Tn + invoca agent-spec-qa-test-generator)
        │
        ▼
/agent-spec-minispec-run-tasks              (executor → gates → stage)
```

#### Variantes (web / mobile / backend)

Cada variante muda **template e checklist** do `scope.md` e dos templates de task, **não** o path. A variante é gravada em `minispec_state.yaml` (`variant: web | mobile | backend`) e na §1 do `scope.md`. O arquivo continua sendo `scope.md`, sem sufixo.

A `FASE 0.0` da skill `agent-spec-minispec-generate-scope` faz pergunta **obrigatória via AskUserQuestion** mesmo quando há `tech-alignment.md` presente — o alignment pré-sugere, não substitui confirmação.

### 11. SDD — quando feature é complexa

**Quando usar**: feature com ≥ 4 US, decisões arquiteturais relevantes (candidatas a ADR), refactor cross-módulo, custo alto de retrabalho.

**Quando NÃO usar**: features menores. SDD tem custo de ~1.5M tokens em discovery + geração. Para 1-3 US, miniSpec entrega o mesmo valor por ~500-800k.

#### Anatomia

```
/docs/specs/features/<feature>/<version>/
├── pre-refinement.md         (opcional)
├── prd.md                    (US + CAs + personas + KPIs)
├── tech-alignment.md         (opcional)
├── tech_spec.md              (arquitetura + ADRs referenciadas + a Estratégia de Testes CTs)
├── task_plan.md              (decomposição + fases + paralelismo)
├── tasks/
│   ├── T1.md (§1-§8 com §4 Aceite Técnico, §5 Arquivos Impactados)
│   ├── T2.md
│   └── ...
├── .qa_context.md            (resumo denso para os gates)
├── qa-observations.md
├── sdd_state.yaml
└── tasks/.tmp/
```

#### Pipeline

```
/agent-spec-pre-refinement                 (opcional)
        │
        ▼
/agent-spec-sdd-generate-prd               (US + CA + personas + KPIs)
        │
        ▼
/agent-spec-generate-tech-alignment        (opcional)
        │
        ▼
/agent-spec-sdd-generate-tech-spec         (FASE 0: detecta variante; detecta candidatos a ADR)
        │
        ▼
/agent-spec-challenge-spec                 (opcional)
        │
        ▼
/agent-spec-sdd-generate-task-plan         (9 regras anti-fragmentação + agent-spec-qa-test-generator)
        │
        ▼
/agent-spec-sdd-run-tasks                  (executor → gates → stage)
```

#### O `.qa_context.md` — resumo denso

Gerado pela skill `agent-spec-sdd-generate-task-plan` (e equivalente miniSpec), é um resumo do `tech_spec.md` otimizado para gates. Contém: convenções do projeto, decisões arquiteturais, padrões obrigatórios, paths críticos.

**Por que**: os gates rodam **uma vez por task**. Sem `qa_context.md`, cada invocação leria o `tech_spec.md` inteiro. Com ele, o gate consome ~5-10x menos tokens em discovery e ainda mantém a fonte canônica disponível para detalhe (lazy).

### 12. Conversa direta — spike consciente (experimento descartável)

**Quando usar**: exploração, aprendizado, prototipagem. Tudo que **vai ser jogado fora** ou **incorporado depois via TaskCard/miniSpec/SDD**.

**Quando NÃO usar**: qualquer coisa que vai pra main. Sem gates, sem rastreabilidade.

A "estrada" da conversa direta é deliberada — reconhecer que **nem toda interação com IA precisa de spec**. Forçar um spike (experimento curto e descartável) de 30 min a passar por TaskCard é desperdício.

Quando você sabe que vai incorporar o spike ao código de produção, faça o ciclo: experimente → descarte o código → escreva spec → execute com gates.

---

## Parte IV — Decisões Arquiteturais (ADRs)

### 13. O que vira ADR — os 5 critérios

ADR é registro **do projeto**, não da feature. Para uma decisão virar ADR, **TODOS os 5 critérios precisam ser verdadeiros** (`require_all`):

| # | Critério | Pergunta diagnóstica |
| --- | --- | --- |
| C1 | `transversal` | A decisão se aplica a outras features ou ao projeto inteiro (não é feature-específica)? |
| C2 | `tag_alvo` | A decisão cai em uma das 14 tags canônicas? |
| C3 | `custo_reversao_alto` | Reverter implica refactor significativo (≥ médio) em múltiplos lugares? |
| C4 | `surpreendente_sem_contexto` | Um leitor futuro do código vai se perguntar "por que fizeram assim?" sem este registro? |
| C5 | `trade_off_real` | Havia ao menos UMA alternativa genuinamente considerada, rejeitada por razão específica (não "única opção viável")? |

**Por que cada um existe**:

* **C1** evita poluir ADRs com decisões locais. ADR é registro do projeto, não da feature.
* **C2** garante que ADRs sejam buscáveis e filtráveis por área.
* **C3** evita registrar decisão fácil de mudar — o custo da ADR (escrita + supersede futuro) precisa ser justificado pela rigidez do que ela protege.
* **C4** garante que cada ADR tenha **valor de leitura futura**. Se a decisão é óbvia, registrar é ruído.
* **C5** força a explicitar trade-offs (escolhas com prós e contras). ADR sem alternativa rejeitada é documentação, não decisão.

#### As 14 tags canônicas (C2)

`architecture`, `auth`, `security`, `data`, `http`, `validation`, `testing`, `build`, `observability`, `performance`, `ui`, `error-handling`, `cross-cutting`, `state-management`.

Tags fora dessa lista são rejeitadas pela skill `/agent-spec-adr-create`. A restrição existe para forçar consistência cross-projeto.

#### Quem detecta candidatas

* **Skills `agent-spec-sdd-generate-tech-spec` e `agent-spec-minispec-generate-scope`**: durante a geração da spec, detectam decisões que batem nos 5 critérios e sinalizam ao usuário.
* **Skill `/agent-spec-challenge-spec`**: ao stress-testar uma spec, pode descobrir decisões implícitas que merecem ADR.
* **Manualmente**: dev pode invocar `/agent-spec-adr-create` quando reconhecer uma decisão arquitetural no meio do desenvolvimento.

### 14. Lifecycle de uma ADR

```
[detecção]      → /agent-spec-adr-create
    │
    ▼
[status: Accepted]   ← estado normal de uma ADR ativa
    │
    ├──→ /agent-spec-adr-deprecate   → [status: Deprecated]
    │                       (decisão não mais aplicável; não substituída por outra)
    │
    └──→ /agent-spec-adr-supersede X → [status: Superseded]
                            (substituída por ADR Y, que aponta para X em "Replaces")
```

**Regra de leitura**: skills consumidoras (gates, generators) leem APENAS ADRs `Accepted`. `Deprecated`/`Superseded` são histórico — visíveis no índice mas não aplicáveis.

#### Estrutura — modelo Nygard enxuto

```markdown
# ADR-NNNN: <título descritivo>

- **Status**: Accepted | Deprecated | Superseded
- **Date**: YYYY-MM-DD
- **Tags**: <tag1>, <tag2>
- **Replaces**: (opcional, se Superseded)
- **Superseded by**: (opcional)

## Context
<por que esta decisão precisou ser tomada>

## Decision
<a decisão em si, em 1-3 parágrafos>

## Consequences
<o que muda no projeto a partir desta decisão>

## Alternatives Considered
<C5: ao menos uma alternativa, rejeitada por razão específica>

## Applied in
<features/módulos que aplicam esta ADR>
```

#### O INDEX.md

`docs/adr/INDEX.md` é gerado/regenerado por `/agent-spec-adr-reindex` (mandatório após cada `/agent-spec-adr-create` ou mudança de status). É a tabela leve consumida pelo Gate 2 e pela Camada 6 do Gate 1.

### 15. ADR Compliance Light no Gate 1

Já mencionado na seção 5, mas vale aprofundar: a Camada 6 do `agent-spec-qa-validator` faz um **sweep grep-detectável** das ADRs ativas. Não é análise profunda.

**Exemplos de ADRs grep-detectáveis**:

* ADR de idioma de identificadores (Go/JSON/form tags em inglês) → grepa tags em pt-BR.
* ADR de naming para soft delete (`Delete()` em vez de `SoftDelete()`) → grepa `SoftDelete(`.
* ADR proibindo injeção direta de pool de DB → grepa `db.NewDB(`, `db.NewDBTx(` fora do startup.
* ADR de provider singleton para SDK → grepa `aws.NewAWS(`, `<sdk>.New<X>(` fora do provider Wire.

**Exemplos NÃO grep-detectáveis** (ficam para Gate 2):

* ADR sobre estrutura de camadas (Repository/Service/Handler) — exige análise estrutural.
* ADR sobre composição de erros — exige entender fluxo.
* ADR sobre estilo de testes — exige semântica.

**Motivação**: o post-mortem `cadastro-pratos-franquia` mostrou que violações grep-detectáveis de ADR cascateavam por 3+ tasks quando descobertas só no Gate 2 (ADR-0010 atingiu T5/T6/T7 simultaneamente). Pegar no Gate 1 evita rodadas de correção em tasks posteriores.

---

## Parte V — Engenharia da Qualidade

### 16. Testing best-practices em profundidade

A skill [`agent-spec-testing-best-practices`](concepts/testing-best-practices.md) é **doutrina de testes agnóstica de stack** (backend/frontend/mobile). É lida obrigatoriamente pelo `agent-spec-qa-validator` (Camada 5) e pelo `agent-spec-qa-test-generator` (durante geração de CTs).

#### Iron Laws (regras invioláveis)

1. **Determinismo**: teste roda igual 100x. Sem `Date.now()`, `Math.random()`, locale sem injeção.
2. **Independência**: ordem de execução não importa. `.only` ou ordem alternada não muda resultado.
3. **Foco**: 1 teste valida 1 comportamento. Não 1 teste para "todo o módulo".
4. **Asserção significativa**: `expect(true).toBe(true)`, `.toBeTruthy()`, `.toBeDefined()` sem valor específico são proibidos.
5. **Mock budget**: se um teste mocka todos os colaboradores, **deve ter** companheiro de integração. Mockar tudo sozinho é teste sobre mock, não sobre sistema.

#### As 5 famílias de antipadrões

| Família | O que captura | Exemplos |
| --- | --- | --- |
| **Brittleness** | Testes que quebram à toa | `brittle_selector`, `vague_existence_assertion`, `snapshot_as_test`, `testing_internal_structure`, `testing_private_method`, `action_without_assertion` |
| **Flakiness** | Testes intermitentes | `fixed_sleep_wait`, `test_order_dependency`, `non_deterministic_input`, `retry_as_fix` |
| **Mock misuse** | Mocks que mentem | `mock_driven_confidence`, `mock_drift`, `over_mock`, `incomplete_mock`, `mock_at_wrong_level`, `mock_repository_layer` |
| **Process** | Padrões organizacionais ruins | `happy_path_only`, `coverage_as_vanity`, `quarantine_as_cemetery`, `eternal_beforeAll`, `cleanup_in_afterEach`, `magic_strings`, `duplicate_cross_layer`, `weakening_test_to_pass` |
| **AI-specific** | Padrões introduzidos por IA | `ai_zero_edge_cases`, `semantically_duplicated_test`, `fail_fast_untestable` |

#### Os 7 gates que cada teste deve atravessar

Cada teste novo passa por 7 checagens antes de ser commitado:

1. **Determinismo confirmado** — roda 5x local sem mudança.
2. **Failure mode entendido** — sei exatamente que mudança no código quebra este teste.
3. **Asserção específica** — valor exato (não `.toBeDefined()`).
4. **Mock budget respeitado** — não mocka tudo em isolamento.
5. **Cenário negativo presente** — caminho de sucesso (happy path) tem teste companheiro de erro.
6. **Sem duplicata semântica** — não existe outro teste com mesma combinação `(target, input, expected)`.
7. **Edge cases** — null, vazio, limites.

O `agent-spec-qa-test-generator` é treinado nesses 7 gates. O `agent-spec-qa-validator` audita usando-os como checklist.

### 17. Critical paths e auto-escalação Opus

#### As 7 categorias canônicas

Heurística agnóstica de stack — categorização por **semântica do path**, não por layout específico:

| Categoria | Match (qualquer linguagem/stack) |
| --- | --- |
| `auth` | `**/auth/**`, `**/authentication/**`, `**/login/**`, `**/sessions/**`, `**/oauth/**` |
| `security` | `**/security/**`, `**/permissions/**`, `**/authorization/**`, `**/access-control/**`, `**/rbac/**` |
| `crypto` | `**/crypto/**`, `**/encryption/**`, `**/hashing/**`, `**/jwt/**`, `**/tokens/**`, `**/keys/**` |
| `db_migrations` | `**/migrations/**`, `**/migrate/**`, `**/db/migrations/**`, `**/schema/migrations/**`, `*.sql` em pastas de migração |
| `secrets/config` | `**/secrets/**`, `**/credentials/**`, `.env*`, `secrets.*` |
| `api_contracts` | `**/openapi*`, `**/swagger*`, `**/proto/**`, `**/graphql/schema*`, `**/contracts/**` |
| `payments` | `**/payment/**`, `**/billing/**`, `**/checkout/**`, `**/transaction/**` |

#### Como o framework aplica

Em runtime, o orquestrador (`*-run-tasks`) faz match dos paths declarados em `§Arquivos Impactados` e do `git diff --name-only` contra as categorias. Se QUALQUER path bate → `diff_touches_critical_path = true`. Esse flag escala:

* **Executor**: sonnet → opus (regra `match: path em categoria 'auth' → opus`).
* **Gate 1**: sonnet → opus.
* **Gate 2**: sonnet → opus (mais agressivo).

#### Inferência de gates por tipo (Fast-Path Gates)

O orquestrador também usa o tipo da task para inferir `gates` quando o frontmatter não declara explicitamente:

| Tipo inferido | Gates default | Justificativa |
| --- | --- | --- |
| `docs`, `config_isolada`, `constantes_isoladas` | `none` | Sem código executável de domínio |
| `wiring/registry` (Wire/DI providers, rotas, barrel exports) | `[qa]` | Apenas conecta; pattern conhecido |
| `crud_handler` sobre pattern existente | `[qa]` | Segue padrão; TR jamais reprovaria |
| `service_simples` (0-1 sentinela, sem efeito colateral externo) | `[qa]` | Sem regra complexa nova |
| Path em `auth/security/crypto/secrets/config/db_migrations` | `[qa, tech_review]` | Área sensível |
| `padrao_novo` ou `candidato_adr` | `[qa, tech_review]` | Decisão arquitetural |
| `refactor_cross_module` (≥ 3 módulos) | `[qa, tech_review]` | Impacto sistêmico |
| `service_complexo` (≥ 2 sentinelas, efeito colateral externo) | `[qa, tech_review]` | Risco real |
| `task_risk == "high"` | `[qa, tech_review]` | Sinal explícito |
| Default (qualquer outro caso) | `[qa, tech_review]` | Default conservador |

> **Motivação**: o post-mortem `cadastro-pratos-franquia` mostrou que rodar Tech Review por default em **todas** as 10 tasks gastou ~30-50 min em wiring/config triviais que o TR jamais reprovaria. Inferir `gates` por tipo elimina esse overhead sem perder a barra em área crítica.

### 18. Glossário de domínio (2 níveis)

Domínio é vocabulário. Sem disciplina, cada feature redefine os mesmos termos divergindo silenciosamente entre si.

#### Estrutura

| Nível | Path | Escopo |
| --- | --- | --- |
| **Global** | `/docs/specs/domain-glossary.md` | Entidades de negócio que aparecem em ≥ 2 features |
| **Feature** | `/docs/specs/features/{feature}/domain-glossary.md` | Conceitos operacionais restritos a uma feature |

**Por que dois níveis**: entidades centrais do produto (substantivos do mundo real do negócio) tendem a aparecer em múltiplas features. O global garante uma única fonte canônica para o vocabulário do projeto. Já regras operacionais e conceitos transitórios poluiriam o global — ficam no feature.

**Por que sem `/{version}/`**: glossário é fonte canônica de **terminologia**, com vida útil maior que uma versão específica. v1/v2/v3 da feature compartilham o mesmo glossário-feature.

#### Precedência de leitura

Skills consumidoras leem nesta ordem:

1. `domain-glossary.md` global — termos canônicos.
2. `domain-glossary.md` da feature — termos específicos.
3. **Conflito** (mesmo termo nos dois): o **feature sobrescreve**. Raro e intencional — só faz sentido quando a feature redefine deliberadamente um termo do domínio. A skill consumidora deve sinalizar a sobrescrita ao usuário.

#### Quem escreve

* **Skills `*-generate-*` (PRD, Intent, Tech Spec, Scope)**: leem ambos os níveis e validam terminologia. **Não escrevem** — apenas sinalizam termos novos.
* **Skill `/agent-spec-challenge-spec`**: dona da criação/atualização. Durante o stress-test, ao canonizar um termo, decide com o usuário se ele vai pro global ou feature.

---

## Parte VI — Observabilidade e Memória

### 19. qa-observations.md — auditoria + débito

Path: `/docs/specs/features/{feature}/{version}/qa-observations.md`. Arquivo **versionado** (entra no Git), appendado incrementalmente pelos 3 orquestradores.

#### Eventos registrados

| Evento | Quando | Severidade |
| --- | --- | --- |
| Auto-escalação executor | Task com `model: sonnet` que escala para `opus` em retry | Info |
| Auto-escalação Gate 2 | Tech Review escalado por security_flags ou retry | Info |
| Critical path detected | Task tocou path em critical_paths | Info |
| `gates: none` | Task pulou todos os gates por declaração explícita | Aviso |
| Task BLOQUEADA | 3 tentativas sem aprovação dos dois gates | Erro |
| **Débito anotado** | Task aprovada como `APROVADO_COM_OBSERVACOES` ou `approved_with_observations` | Info |
| **Retry classification** | Decisão `requires_qa_revalidation` em loop de correção | Info |

#### O log de retry classification (auditoria obrigatória)

Após cada cálculo de `requires_qa_revalidation`, o orquestrador persiste:

```markdown
### T{N} — retry classification
- attempt: 2
- problemas_por_categoria: { architecture: 0, code_quality: 2, naming: 1 }
- overrides_ativos: [tocou_area_critica: false, task_risk: low, qa_security_flags: [], diff_stat_changed: false]
- requires_qa_revalidation: false
- decisao: PULE QA (próxima rodada vai direto a Tech Review)
- justificativa: "todos os problemas em code_review_only (code_quality + naming)"
```

**Por que obrigatório**: o post-mortem `cadastro-pratos-franquia` levantou suspeita de que T10 (`naming/style`) foi re-QA indevidamente. Sem log auditável, impossível distinguir bug do algoritmo de execução correta. Com o log, eval pode validar cada decisão.

#### Resolução de débito acumulado

`qa-observations.md` é a fonte primária da skill [`/agent-spec-debt-resolution`](skills/shared/debt-resolution.md). Workflow:

```bash
# 1. Feature foi executada via /agent-spec-minispec-run-tasks ou /agent-spec-sdd-run-tasks.
#    qa-observations.md tem entradas APROVADO_COM_OBSERVACOES com débitos MEDIO/BAIXO.

# 2. Antes de partir para v2 funcional, limpe os débitos:
/agent-spec-debt-resolution docs/specs/features/<feature>/v1/

# 3. Execute o cleanup:
/agent-spec-minispec-run-tasks docs/specs/features/<feature>/v2-debits/task_plan.md <especialista>
```

Após a execução, a skill appenda no próprio `qa-observations.md` da v1 um log marcando quais débitos foram resolvidos — fechando o ciclo.

### 20. Memória lazy e memória inline

O framework tem **duas formas** de memória entre subagentes. Conhecer a diferença evita criar arquivos parasitas.

#### Memória lazy — `T{N}.md` na pasta `.tmp/`

| Atributo | Valor |
| --- | --- |
| Path | `/docs/specs/features/{feature}/{version}/tasks/.tmp/T{N}.md` |
| Criada por | Orquestrador, **apenas** em rejeição de gate |
| Lida por | Executor (em retry), Gate 1 / Gate 2 (contexto de retry) |
| Conteúdo | `attempt_count`, `last_severity`, JSON completo do(s) gate(s) que rejeitaram, paths tocados |
| Apagada quando | Ambos os gates aprovam |
| Versionada | NÃO (`.gitignore`) |

**Por que dentro da feature**: o diretório `.claude/.tmp/` exigia autorização explícita a cada gravação (Claude Code trata `.claude/` como área protegida). Movendo para `tasks/.tmp/` (writable como qualquer arquivo da feature) eliminou o prompt de permissão e co-localizou a memória com as tasks.

**Por que lazy**: cria custo só quando há rejeição. Aprovação na primeira tentativa não cria arquivo nenhum.

#### Memória inline — `base_sha` + sumário do executor

| Atributo | Valor |
| --- | --- |
| Persistida em | Variáveis em memória do orquestrador (não em disco) |
| Lida por | Gate 1 e Gate 2, **inline em `instrucoes`** do prompt |
| Conteúdo | `base_sha` (SHA git pré-task) + sumário do executor (4-6 linhas — arquivos criados/modificados, testes N/M, pendências) |

**Por que inline (não arquivo)**: a versão anterior do framework gravava `T{N}-execution-summary.md` com `git diff --stat`, hashes SHA-256 pré/pós e paths consolidados. Esses campos eram redundantes (Tech Review GERA diff sozinho via `git diff <base_sha> -- <path>`) ou nunca consultados (sha256-skip nunca foi implementado no agent). Cortado em prol de fluxo mais simples — ~300-800 tokens × 2 gates × N tasks economizados por run.

### 21. State files

Cada framework persistente tem um `state.yaml` na raiz da versão:

| Arquivo | Framework |
| --- | --- |
| `prd_state.yaml` | SDD (raro; obsoleto, fundiu em sdd_state) |
| `sdd_state.yaml` | SDD |
| `minispec_state.yaml` | miniSpec |
| (não há) | TaskCard — task única, sem state |

#### Campos canônicos

```yaml
feature: cardapio-digital
version: v1
variant: backend        # web | mobile | backend (NÃO entra no path)
source: recommended     # recommended | overridden | no_discovery
created_at: 2026-04-12
steps:
  prd:
    status: approved
    variant: backend
    completed_at: 2026-04-12T14:23:00Z
  tech_spec:
    status: approved
    variant: backend
    completed_at: 2026-04-13T09:11:00Z
  task_plan:
    status: approved
  execution:
    status: in_progress  # not_started | in_progress | complete | blocked
    tasks_total: 7
    tasks_completed: 4
    tasks_blocked: 0
```

**Campo `source`**:

* `recommended` — Strategy Selector recomendou este caminho e foi seguido.
* `overridden` — Strategy Selector recomendou outro caminho; usuário forçou este.
* `no_discovery` — pulou `/agent-spec-pre-refinement`.

Esse campo é puramente observacional — permite auditar quanto o time confia no Strategy Selector ao longo do tempo.

---

## Parte VII — Manutenção e Cleanup

### 22. /agent-spec-debt-resolution — fechando o ciclo do débito

Skill compartilhada que opera sobre `qa-observations.md` de uma feature e gera uma `v{N+1}-debits/` com tasks de cleanup. É o **fechamento operacional** da política débito-controlado — sem ela, débitos seriam anotados e esquecidos.

> [Página da skill](skills/shared/debt-resolution.md) | SKILL real em `.claude/skills/agent-spec-debt-resolution/SKILL.md`.

#### Por que existe

A política débito-controlado (Parte II, seção 7) só funciona se houver fechamento. Anotar débito em `qa-observations.md` sem rotina de coleta vira **dump perpétuo** — o pior dos mundos: você sabe que tem dívida, mas não tem fluxo para pagá-la.

`/agent-spec-debt-resolution` resolve isso oferecendo um fluxo de trabalho opinativo:

1. **Lê** os débitos anotados pela política débito-controlado durante a execução da feature.
2. **Classifica** via agente especialista da stack (Go, Flutter, JS, Python, etc.) — quem entende o custo real do fix.
3. **Apresenta** ao usuário em formato interativo para decisão consciente.
4. **Gera** uma versão paralela `v{N+1}-debits/` com tasks de cleanup prontas para `/agent-spec-minispec-run-tasks`.
5. **Loga** o batch no `qa-observations.md` da v{N} original — auditabilidade do que foi resolvido e quando.

#### Invocação

```bash
/agent-spec-debt-resolution docs/specs/features/<feature>/v{N}/
```

Opcionalmente com nome do executor: `/agent-spec-debt-resolution docs/specs/features/X/v1/ go-task-developer`. Se omitido, descoberta interativa pergunta qual especialista.

#### As 5 FASES da skill (passo a passo)

##### FASE 0 — Inicialização e descoberta interativa

* Valida que `<feature_path>` existe e contém `qa-observations.md`.
* Detecta variante (`backend`/`web`/`mobile`) lendo o `scope.md` da v{N}.
* Calcula `v{N+1}-debits/` (sufixo `-debits` indica versão técnica, **não** afeta rastreabilidade funcional).
* Descobre especialista via `AskUserQuestion` se não foi passado como argumento.

##### FASE 1 — Coleta de débitos

Lê `qa-observations.md` e extrai entradas elegíveis (filtros estritos):

* Severidade: `MEDIO` ou `BAIXO`.
* Categoria: `code_review_only` (`code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`).
* Estado: registrados como `APROVADO_COM_OBSERVACOES` ou `approved_with_observations`.

**Fallback** se `qa-observations.md` estiver enxuto: varre `tasks/T*.md` procurando seção "## Notas / Observações" com débitos pendentes.

Cada débito vira estrutura padronizada:

```yaml
id: D-001
origem_task: T8
severidade: MEDIO
categoria: code_quality
arquivo: internal/.../x.go
linha: 271
titulo: "Duplicata entre CT-014 e TestX_ListaVaziaNuncaNull"
descricao: "Table-driven CT-014 já cobre o cenário..."
correcao_sugerida: "Remover o teste autônomo TestX_ListaVaziaNuncaNull"
```

**Zero débitos coletados → aborta limpamente** sem criar `v{N+1}-debits/`. Não há débito, não há cleanup.

##### FASE 2 — Análise via especialista

Delega classificação ao agente da stack descoberto em FASE 0. O especialista é quem tem informação de domínio — sabe o custo real do fix em Go vs Flutter vs Python e o risco de regressão específico.

Retorna JSON estruturado:

```json
{
  "classificacoes": [
    {
      "id": "D-001",
      "classificacao": "recomendado_corrigir",
      "justificativa": "Custo de fix é 1 delete; impacto: legibilidade da suíte + sinal de qualidade.",
      "custo_estimado_min": 1,
      "risco_regressao": "nenhum"
    },
    {
      "id": "D-002",
      "classificacao": "perfumaria",
      "justificativa": "Magic string num teste isolado — refactor demanda extrair builder + reescrever 3 testes; benefício marginal.",
      "custo_estimado_min": 15,
      "risco_regressao": "baixo"
    }
  ]
}
```

**2 níveis apenas** (`recomendado_corrigir` / `perfumaria`). Mais níveis confundiriam sem trazer ganho.

**Validação obrigatória**: cada débito da FASE 1 precisa ter classificação. Se algum faltou → re-pergunta ao especialista (1 retry); se ainda faltar → default conservador `perfumaria` com justificativa "agente não classificou".

##### FASE 3 — Apresentação interativa (4 ondas)

Mostra resumo no terminal antes das perguntas:

```
Débitos coletados de docs/specs/features/<feature>/v1/qa-observations.md:

📦 Recomendado corrigir (LLM): N débitos
   ├─ D-001: Duplicata CT-014 (custo: 1min, risco: nenhum)
   ├─ D-003: Naming de variável em handler (custo: 2min, risco: nenhum)
   └─ ...

🎨 Perfumaria (LLM não recomenda): M débitos
   ├─ D-002: Magic string em teste (custo: 15min, risco: baixo)
   ├─ D-004: Comentário desatualizado (custo: 3min, risco: nenhum)
   └─ ...

Total: N + M débitos.
```

Em seguida, **4 ondas** de `AskUserQuestion` (limites para evitar fricção):

| Onda | Pergunta | Quando se aplica |
| --- | --- | --- |
| **1 — Atalho global** | "Incluir TODOS os recomendados (Recomendado) / Escolher um por um / Incluir TODOS (recomendados + perfumaria) / Pular tudo" | Sempre |
| **2 — Recomendados** | "Quais dos débitos RECOMENDADOS pela LLM incluir?" (`multiSelect: true`, blocos de até 4) | Se onda 1 = "Escolher um por um" |
| **3 — Perfumaria** | "Quais dos débitos de PERFUMARIA incluir mesmo assim?" (default: nenhum marcado) | Se onda 1 = "Escolher um por um" |
| **4 — Confirmação final** | "Vai gerar N tasks de cleanup. Confirma?" → Sim / Voltar | Se ≥ 5 débitos selecionados |

> **Por que blocos de 4**: `AskUserQuestion` limita a 4 opções por pergunta. Se houver mais de 4 débitos numa classificação, divide em sub-perguntas com prefixo ("Recomendados (1/3): D-001..D-004"). Bombardear o usuário com 20 perguntas seria pior que valor zero.

##### FASE 4 — Geração da versão `v{N+1}-debits/`

Cria estrutura paralela à feature original:

```
docs/specs/features/<feature>/v{N+1}-debits/
├── intent.md                 ("Limpar N débitos técnicos acumulados em v{N}")
├── scope.md                  (variante herdada; débitos selecionados + ignorados)
├── task_plan.md              (1 task por débito; todas paralelizáveis)
├── tasks/
│   ├── T1.md
│   ├── T2.md
│   └── ...
└── minispec_state.yaml       (source: agent-spec-debt-resolution; parent_version: v{N})
```

**Regras de decomposição**:

* **1 task por débito** — auditável e cancelável individualmente. Se um cleanup vira regressão, é fácil reverter sem afetar outros.
* **`gates: [qa]` default** — Tech Review acharia pouca coisa em renomear variável ou deletar duplicata; rodá-lo seria desperdício de tokens.
* **Exceção**: débito que toca `critical_paths` (auth, security, crypto, migrations) força `gates: [qa, tech_review]`.
* **Todas paralelizáveis** (`Pode Rodar em Paralelo? = Sim`) — débitos são por definição independentes (cada um toca seu próprio arquivo/cenário). O orquestrador `/agent-spec-minispec-run-tasks` honra com seus guards de paths disjuntos.
* **Sem `agent-spec-qa-test-generator`** — débitos são cleanup, não nova feature. Tasks declaram: "N/A — task é cleanup; suíte existente deve continuar passando".
* **Guardrail forte na task**: "NÃO refatorar fora do escopo do débito específico. Cleanup pontual."

**Sub-fase 4.6 — log no `qa-observations.md` da v{N} original**:

```markdown
## agent-spec-debt-resolution — <data> <hora>

- Débitos coletados: <total>
- Recomendados pela LLM: <N>
- Perfumaria: <M>
- Selecionados pelo usuário: <K>
- Output: docs/specs/features/{feature}/v{N+1}-debits/
- Comando para executar: /agent-spec-minispec-run-tasks docs/specs/features/{feature}/v{N+1}-debits/task_plan.md
```

##### FASE 5 — Saída ao usuário

```
Versão de débitos gerada ✅

Diretório: docs/specs/features/<feature>/v2-debits/
Arquivos:
- intent.md
- scope.md
- task_plan.md
- tasks/T1.md ... T{K}.md ({K} tasks)
- minispec_state.yaml

Débitos selecionados: {K} de {total} coletados
- Recomendados pela LLM incluídos: {x}/{N}
- Perfumaria incluída: {y}/{M}
- Ignorados: {Z} (registrados em scope.md §2 para auditoria)

Próximo passo:
  /agent-spec-minispec-run-tasks docs/specs/features/<feature>/v2-debits/task_plan.md

Tempo estimado total: ~{soma dos custos} minutos.
```

**Não inicia `/agent-spec-minispec-run-tasks` automaticamente** — apenas mostra o comando. Cleanup é decisão consciente.

#### Guardrails invioláveis

Os 10 guardrails que a skill jamais quebra (mesmo sob instrução em contrário):

1. **NUNCA** alterar `qa-observations.md` da v{N} original além do append de log (FASE 4.6). Histórico preservado.
2. **NUNCA** alterar artefatos da v{N} original (`intent.md`, `scope.md`, `task_plan.md`, `tasks/T*.md`). Só leitura.
3. **NUNCA** inventar débitos — se `qa-observations.md` está vazio ou sem entradas elegíveis, abortar limpamente.
4. **NUNCA** classificar débitos sozinha — sempre delegar ao especialista da stack.
5. **SEMPRE** preservar granularidade "1 task por débito".
6. **SEMPRE** usar `gates: [qa]` em cleanup (exceto critical paths).
7. **SEMPRE** registrar débitos NÃO selecionados em `scope.md §2 — Fora do escopo` com motivo (rastreabilidade — usuário sabe que ignorou conscientemente).
8. **SEMPRE** logar a execução em `qa-observations.md` da v{N}.
9. **SEMPRE** apresentar resumo do plano antes da geração — se usuário "voltar" na Onda 4, re-roda FASE 3 sem regenerar classificação (cache da FASE 2).
10. **NUNCA** iniciar `/agent-spec-minispec-run-tasks` automaticamente após gerar.

#### Por que cada decisão de design

| Decisão | Motivo |
| --- | --- |
| **Output em `v{N+1}-debits/` (não feature separada)** | Preserva proximidade e cross-reference. `qa-observations.md` da v1 aponta para onde o cleanup foi feito; `scope.md` da v2-debits aponta para os débitos da v1. |
| **Especialista classifica, usuário decide** | LLM tem informação de domínio (custo de fix, risco de regressão) que humanos demoram para avaliar. Mas decisão final é do usuário — "perfumaria" pode importar para uma pessoa e não para outra. |
| **2 níveis (recomendado / perfumaria)** | Mais níveis confundem sem trazer ganho. Binário é claro. |
| **1 task por débito** | Auditável e cancelável individualmente. Regressão é fácil de reverter sem afetar outros débitos. |
| **`gates: [qa]` default** | Cleanup é categoria `code_review_only`. Tech Review traria zero valor em renomear variável ou deletar duplicata. |
| **Tasks paralelizáveis** | Débitos são independentes por construção (cada um toca seu arquivo). Cleanup acumulado roda em paralelo, fechamento rápido. |
| **Append-only no `qa-observations.md`** | Histórico jamais perdido. Auditor pode rastrear quando cada débito foi anotado e quando foi resolvido. |

#### Quando NÃO usar `/agent-spec-debt-resolution`

| Cenário | Por que não |
| --- | --- |
| Feature ainda em execução (v{N} não foi concluída) | Aguarde a feature terminar para coletar débitos reais. Débitos parciais geram cleanup parcial. |
| `qa-observations.md` não existe | Não há débito anotado a resolver. |
| Débitos `critical`/`high` pendentes | Eles **não** vão para `qa-observations.md` como débito anotado — bloqueiam o pipeline na rejeição. Resolva via re-execução da v{N} normalmente. |
| Adicionar funcionalidade nova | Use `/agent-spec-minispec-generate-intent` (feature nova) ou `/agent-spec-minispec-generate-scope` (incremento), não esta skill. |

#### O ciclo completo (visualização)

```
┌────────────────────────────────────────────────────────────────┐
│ v1: feature original                                            │
│ • /agent-spec-minispec-generate-intent → scope → tasks                     │
│ • /agent-spec-minispec-run-tasks                                           │
│   ├─ T1..Tn aprovadas (algumas como APROVADO_COM_OBSERVACOES)  │
│   └─ qa-observations.md acumula débitos MEDIO/BAIXO             │
└────────────────────────────────────────────────────────────────┘
                             │
                             │  (decisão consciente do dev:
                             │   "antes de v2 funcional, limpo débito")
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ /agent-spec-debt-resolution docs/specs/features/<feature>/v1/              │
│ • Lê qa-observations.md                                         │
│ • Especialista classifica                                       │
│ • Usuário escolhe interativamente                               │
│ • Gera v2-debits/ com tasks (1 por débito, gates: [qa])         │
│ • Loga batch no qa-observations.md da v1                        │
└────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ /agent-spec-minispec-run-tasks v2-debits/task_plan.md                      │
│ • Tasks paralelizáveis rodam em lote                            │
│ • Cada uma com gates: [qa] (suíte deve continuar passando)      │
│ • Stage real ao aprovar                                         │
└────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  v3 (próxima feature funcional)
                  ← código limpo, débito zerado da v1.
```

#### Resumo prático

**O que a skill resolve**: o paradoxo do débito anotado — sem ela, política débito-controlado vira "documentar problema e esquecer".

**Quando rodar**: antes de partir para a próxima versão funcional da feature, ou antes de release crítico.

**O que ela NÃO faz**: gerar feature nova, resolver críticos/altos (esses bloqueiam na execução original), executar o cleanup automaticamente.

**Quanto custa**: ~50-150k tokens dependendo do volume de débitos. Baratíssimo comparado ao custo de carregar débito pra eternidade.

### 23. /agent-spec-challenge-spec — stress-test pré-execução

Skill opcional entre `scope.md`/`tech_spec.md` e `task_plan.md`. Stress-testa a spec contra:

* Código existente (busca contradições).
* ADRs ativas (busca conflitos).
* Glossário de domínio (busca terminologia inconsistente).
* Trade-offs implícitos não verbalizados.

#### Quando usar

* Scopes/tech_specs com decisão técnica não-trivial.
* Terminologia nova ou conflito potencial com código existente.
* Antes de feature crítica para produção.

#### Quando pular

* Scopes pequenos (1-2 endpoints, sem complexidade arquitetural).
* Specs já revisadas manualmente com profundidade.

#### Efeitos

Pode modificar inline o `scope.md`/`tech_spec.md`, criar/atualizar o `domain-glossary.md` (global ou feature), e sugerir ADRs novas (que o usuário cria via `/agent-spec-adr-create`).

> Custo típico: 30-100k tokens. Ganho: evitar 1-2 rodadas de correção em tasks posteriores em features grandes.

---

## Apêndices

### A. Tabela de paths canônicos

Resolvidos via `.claude/rules/framework-paths.md`. Use **chaves canônicas**, não paths fixos no código.

#### Compartilhados

| Chave | Path |
| --- | --- |
| `pre_refinement.path` | `/docs/specs/features/{feature}/{version}/pre-refinement.md` |
| `tech_alignment.path` | `/docs/specs/features/{feature}/{version}/tech-alignment.md` |
| `shared.qa_observations.path` | `/docs/specs/features/{feature}/{version}/qa-observations.md` |
| `shared.temp_memory.dir` | `/docs/specs/features/{feature}/{version}/tasks/.tmp/` |
| `shared.specs_root` | `/docs/specs` |
| `domain_glossary.global.path` | `/docs/specs/domain-glossary.md` |
| `domain_glossary.feature.path` | `/docs/specs/features/{feature}/domain-glossary.md` |

#### SDD

| Chave | Path |
| --- | --- |
| `sdd.prd.path` | `/docs/prds/features/{feature}/{version}/prd.md` |
| `sdd.tech_spec.path` | `/docs/specs/features/{feature}/{version}/tech_spec.md` |
| `sdd.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` |
| `sdd.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` |
| `sdd.tasks.pattern` | `T{n}.md` |
| `sdd.state.path` | `/docs/specs/features/{feature}/{version}/sdd_state.yaml` |
| `sdd.qa_context.path` | `/docs/specs/features/{feature}/{version}/.qa_context.md` |

#### miniSpec

| Chave | Path |
| --- | --- |
| `minispec.intent.path` | `/docs/specs/features/{feature}/{version}/intent.md` |
| `minispec.scope.path` | `/docs/specs/features/{feature}/{version}/scope.md` |
| `minispec.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` |
| `minispec.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` |
| `minispec.state.path` | `/docs/specs/features/{feature}/{version}/minispec_state.yaml` |

#### TaskCard

| Chave | Path |
| --- | --- |
| `taskcard.tasks.dir` | `/docs/specs/features/{feature}/{version}/tasks/` |
| `taskcard.tasks.pattern` | `task-{nn}-{slug}.md` |
| `taskcard.task_plan.path` | `/docs/specs/features/{feature}/{version}/task_plan.md` |

#### ADR

| Chave | Path |
| --- | --- |
| `adr.dir` | `/docs/adr/` |
| `adr.index.path` | `/docs/adr/INDEX.md` |
| `adr.pattern` | `NNNN-<slug>.md` |

### B. Categorias canônicas — revalidation_required vs code_review_only

| Categoria | Tipo | Justificativa |
| --- | --- | --- |
| `architecture` | **revalidation_required** | Estrutura altera fluxo/dependências |
| `security` | **revalidation_required** | Correção de vulnerabilidade afeta lógica |
| `tests` | **revalidation_required** | Implica mudar/criar testes |
| `logic` | **revalidation_required** | Bug de lógica muda comportamento |
| `data_handling` | **revalidation_required** | Parsing/validação afeta entrada/saída |
| `error_handling` | **revalidation_required** | Fluxo de exceção muda |
| `performance` | **revalidation_required** | Pode quebrar casos limite |
| `concurrency` | **revalidation_required** | Comportamento sob carga muda |
| `adr_compliance` | **revalidation_required** | Pode exigir mudança estrutural |
| `code_quality` | code_review_only | Refactor sem mudança de comportamento |
| `naming` | code_review_only | Renomear sem mudar API |
| `style` | code_review_only | Formatação |
| `documentation` | code_review_only | Comentários, docstrings |
| `dead_code` | code_review_only | Remoção de código não executado |
| `imports` | code_review_only | Reorganização |

### C. Convenções

| Elemento | Convenção | Exemplo |
| --- | --- | --- |
| Nome da feature (`{feature}`) | kebab-case, minúsculas, sem acentos | `autenticacao-oauth2`, `cardapio-digital` |
| Versão (`{version}`) | `v1`, `v2`, ... (incremental); `v{N}-debits` para cleanup | `v1`, `v2-debits` |
| Variante (`{variant}`) | `web`, `mobile`, `backend` — gravada em `state.yaml` e §1 da spec; **NÃO entra no path** | `variant: backend` |
| Commits | Conventional Commits em pt-BR, sem rodapé de autoria de IA | `feat(auth): adiciona validação 2FA` |
| Identificadores em código | Em inglês (functions, variables, structs, packages) | `getUserByEmail`, não `obterUsuarioPorEmail` |

### D. Quick reference — quem chama quem

```
Discovery
└─ /agent-spec-pre-refinement
    └─ usa Strategy Selector → recomenda framework

Geração (SDD)
├─ /agent-spec-sdd-generate-prd
├─ /agent-spec-generate-tech-alignment (opcional)
├─ /agent-spec-sdd-generate-tech-spec
│   └─ invoca agent-spec-qa-test-generator (CTs da Estratégia de Testes)
├─ /agent-spec-challenge-spec (opcional)
└─ /agent-spec-sdd-generate-task-plan
    └─ invoca agent-spec-qa-test-generator (CTs por task)

Geração (miniSpec)
├─ /agent-spec-minispec-generate-intent
├─ /agent-spec-generate-tech-alignment (opcional)
├─ /agent-spec-minispec-generate-scope
├─ /agent-spec-challenge-spec (opcional)
└─ /agent-spec-minispec-generate-tasks
    └─ invoca agent-spec-qa-test-generator

Geração (TaskCard)
└─ /agent-spec-taskcard-generate

Execução
├─ /agent-spec-sdd-run-tasks
├─ /agent-spec-minispec-run-tasks
└─ /agent-spec-taskcard-run
    Todos seguem o mesmo pipeline:
    Executor → Gate 1 (agent-spec-qa-validator) → Gate 2 (agent-spec-staff-architecture-review) → git add

ADRs
├─ /agent-spec-adr-bootstrap (retroativo, projeto existente)
├─ /agent-spec-adr-create
├─ /agent-spec-adr-supersede
├─ /agent-spec-adr-deprecate
├─ /agent-spec-adr-list
├─ /agent-spec-adr-show
├─ /agent-spec-adr-review
└─ /agent-spec-adr-reindex (regenera INDEX.md)

Manutenção
└─ /agent-spec-debt-resolution (recolhe débitos médios/baixos de qa-observations.md
                     e gera v{N+1}-debits/)
```

---

### Encerramento

Este documento descreve o estado atual do `agent-spec`. Cada decisão aqui é um **trade-off explicitado** — e cada trade-off tem rastreabilidade nos post-mortems (especialmente `cadastro-pratos-franquia`, que motivou a Camada 0, o ADR Compliance Light, a inferência de gates por tipo, o paralelismo declarado e o `requires_qa_revalidation`).

Quando você usar o framework e ele falhar de uma forma sistêmica, a expectativa é: faça o post-mortem, identifique o trade-off implícito, e proponha mudança. A pipeline melhora por **evolução incremental** ancorada em casos reais — não por reescrita de princípios.

Quando você precisar consultar um mecanismo específico:

* **Conceitual**: [Visão Geral](concepts/overview.md), [Spec-Driven](concepts/spec-driven.md), [Gates e Loops](concepts/gates-loops.md).
* **Operacional**: [Pipeline — Overview](pipeline/overview.md), [Pipeline — agent-spec-sdd-run-tasks](pipeline/sdd-run-tasks.md), [Pipeline — agent-spec-minispec-run-tasks](pipeline/minispec-run-tasks.md), [Pipeline — agent-spec-taskcard-run](pipeline/taskcard-run.md).
* **Agentes**: [agent-spec-qa-validator](agents/qa-validator.md), [agent-spec-staff-architecture-review](agents/staff-architecture-review-agent.md), [agent-spec-qa-test-generator](agents/qa-test-generator.md).
* **Configuração**: [framework-paths.md](configuration/framework-paths.md), [Path Templates](configuration/path-templates.md), [Critical Paths](configuration/critical-paths.md), [Temp Memory](configuration/temp-memory.md).
* **Avançado**: [Auto-escalação](advanced/auto-escalation.md), [Gates Condicionais](advanced/conditional-gates.md), [Fast-path Gates](advanced/fast-path-gates.md), [Model Selection](advanced/model-selection.md).
* **Skills**: [Skills — Overview](skills/overview.md), [agent-spec-debt-resolution](skills/shared/debt-resolution.md).
* **ADR**: [ADR — Visão Geral](adr/overview.md).

Bom uso.
