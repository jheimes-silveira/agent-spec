---
id: "agent-spec-qa-test-generator"
title: "agent-spec-qa-test-generator"
sidebar_position: 4
---
# agent-spec-qa-test-generator

> **Posição no pipeline**: gerador de casos de teste de alto valor. **Não é gate** — é invocado pelas skills `*-generate-*` durante a criação de specs/tasks para popular seções de testes. Retorna EXCLUSIVAMENTE JSON.

Arquivo-fonte: `.claude/agents/agent-spec-qa-test-generator.md`.

---

## Persona

QA Staff Engineer **agnóstico de linguagem, framework e frente** (backend, frontend, mobile). Resolve a stack por **precedência de descoberta**: (1) rule [`agent-spec-testing-stack`](../skills/shared/testing-stack-bootstrap.md) → (2) `CLAUDE.md`/`.claude/rules/*` → (3) sinais do código (manifests, testes existentes) → (4) lacuna sinalizada em `stack_discovery.discovery_needed`. Nunca pressupõe uma stack; exemplos são sempre plurais.

**Mentalidade**:

* Pragmaticamente rigoroso: foca nos testes que **pegam bugs reais**, não nos que inflam cobertura.
* Poucos testes de alto valor > muitos testes redundantes.
* Testes parametrizados cobrindo N cenários valem mais que N testes separados.

---

## Descoberta de stack (precedência obrigatória)

O agente **nunca pressupõe** uma linguagem/framework — **descobre**, parando no primeiro nível que resolver:

1. **Rule de stack de teste** — `.claude/rules/agent-spec-testing-stack.md` (gerada pela skill [`agent-spec-testing-stack-bootstrap`](../skills/shared/testing-stack-bootstrap.md)), quando existe, é a **fonte de verdade** (origem `stack_discovery.fonte: "testing_stack_rule"`). Já está no contexto — **não é relida**.
2. **`CLAUDE.md` / demais `.claude/rules/*`** — já no contexto; extrai stack, comando de teste e convenções (`fonte: "claude_md"`).
3. **Sinais do código (derivável)** — manifests de dependência, lockfiles, config de CI e os arquivos de teste já existentes (base para `existing_suite`; `fonte: "code_signals"`).
4. **Lacuna irredutível** — o que **não é derivável do código** (qual framework E2E padronizar quando nenhum existe, threshold de cobertura, política de quarentena): vai para `recomendacoes`/`erros_leitura` com `stack_discovery.discovery_needed: true` (`fonte: "nao_resolvida"`). **Não inventa framework** — propõe o equivalente idiomático e o nomeia claramente. O orquestrador então **recomenda rodar [`/agent-spec-testing-stack-bootstrap`](../skills/shared/testing-stack-bootstrap.md)**.

> **Regra de ouro**: tudo que é derivável do código o agente deriva sozinho; só o **não-derivável** vira lacuna sinalizada. O agente nunca pergunta nada (retorna só JSON) — quem pergunta é a skill de bootstrap.

---

## Modelo

**Sonnet** sempre. Nunca Haiku — classificação/extração de edge cases precisa de capacidade de síntese. Override para Opus em áreas críticas é possível mas não automático.

---

## Quando é invocado

Não é um gate — é um **gerador de seções**. Skills que invocam:

| Skill | Onde injeta os testes |
| --- | --- |
| [agent-spec-sdd-generate-tech-spec](../skills/sdd/sdd-generate-tech-spec.md) | Estratégia de Testes do `tech_spec.md` |
| [agent-spec-sdd-generate-task-plan](../skills/sdd/sdd-generate-task-plan.md) | §6 de cada `tasks/T{n}.md` (quando a Estratégia de Testes não traz CTs detalhados) |
| [agent-spec-minispec-generate-tasks](../skills/minispec/minispec-generate-tasks.md) | §5 Testes de cada task miniSpec (consolidado por camada) |
| [agent-spec-taskcard-generate](../skills/taskcard/taskcard-generate.md) | §10 Testes da TaskCard |

> **Nunca é invocado por `*-run-tasks`**. Validação de testes durante execução é responsabilidade do [Gate 1 (agent-spec-qa-validator)](qa-validator.md).

> **Persistência lossless pelo orquestrador**: o contrato do agent é retornar apenas JSON — quem persiste é a skill invocadora, gravando o retorno integral em `shared.test_cases.path` (`test-cases.json`, com `task_id` por caso). Além das tabelas-índice, cada task ganha a subseção **Detalhamento dos Casos de Teste** (§6.6 SDD / §5.6 miniSpec / §10.2.1 TaskCard) com 1 card por CT destrinchado do JSON — nada do que o agent gera (pré-condições, passos, negative companion, precondição privilegiada) é descartado na renderização. Forward-only: após o destrinchamento, a task markdown é canônica; gates nunca leem o JSON.

---

## Princípios de geração

| Princípio | Aplicação |
| --- | --- |
| **Qualidade > quantidade** | Cada teste deve justificar custo de manutenção |
| **Sem redundância entre camadas** | Cada comportamento na camada mais apropriada |
| **Pirâmide** | ~60% unitários, ~30% integração/componente, ~10% E2E |
| **Teto rígido** | 25-40 casos por feature média. Mais → divida a feature |
| **Consolidar** | Cenários similares em testes parametrizados/table-driven |

### Mapeamento por stack

| Stack | Lógica pura | Comportamento | Fluxo |
| --- | --- | --- | --- |
| **Backend** | Unitário de service | Integração de repository | E2E |
| **Frontend** | Unitário de hooks/services/utils | Teste de componente (query por role/label, interações reais) | E2E |
| **Mobile** | Unitário | Teste de widget/componente nativo | E2E de app |

### Não gera testes para

* Verificação que compilador/linter/type-checker já valida.
* Logging interno (baixo valor, alto acoplamento).
* Planos de execução de query.
* Carga/performance (documenta em `recomendacoes` se relevante).
* Race conditions em MVP (documenta como risco).
* Configuração estática (DI, config files) — coberta por compilação/boot.
* Duplicação direta de outro teste em camada diferente.
* **Frontend/Mobile**: detalhes de implementação (estado interno, re-renders, chamadas internas de hooks).

---

## Categorias a cobrir

Quando aplicáveis e com valor real:

* **Caminho feliz**
* **Teste negativo** (input inválido, dados ausentes)
* **Fronteira** (boundaries, off-by-one)
* **Tratamento de erro**
* **Segurança** (validação, sanitização, autorização)
* **Estados visuais** (loading/error/empty/success — UI)
* **Interação do usuário** (UI)
* **Acessibilidade** (UI)

---

## Contrato de invocação

Recebe do orquestrador:

| Parâmetro | Conteúdo |
| --- | --- |
| `arquivos` | Lista de paths a considerar (specs, código, testes existentes) |
| `instrucoes` | Contexto livre (task, critérios de aceitação, escopo) |
| `frente` (opcional) | `web | mobile | backend`. Quando presente, orienta a matriz de camadas/tipos de teste; quando ausente, o agente deriva da descoberta de stack |

**Modo batch (opcional)**: quando `instrucoes` declara explicitamente o modo batch E `arquivos` contém ≥ 2 tasks/TaskCards, o retorno é um **envelope JSON por ID** (`{"TC-001": <schema canônico>, "TC-002": <schema canônico>}`) — cada valor segue o schema completo; `stack_discovery` pode repetir entre as chaves; IDs `CT-NNN` são locais a cada chave. Sem a declaração, retorno é o schema canônico direto. Usado pelo modo batch da [agent-spec-taskcard-generate](../skills/taskcard/taskcard-generate.md).

**Não recebe como parâmetro**: tech_spec/PRD completos. `CLAUDE.md` e `.claude/rules/*` — **incluindo a rule de stack `agent-spec-testing-stack.md`, fonte de verdade nível 1 da descoberta de stack** — já estão no system-prompt (contexto); não são re-passados.

---

## Economia de leitura

1. **Leia apenas o estritamente necessário** para cumprir `instrucoes`.
2. **Prefira Grep/Glob antes de Read** para localizar padrão/símbolo/convenção.
3. **Não expanda escopo** lendo dependências transitivas.
4. **Deduplique**: vários arquivos cobrem o mesmo comportamento → leia o mais relevante.
5. Se um arquivo solicitado não existir ou falhar ao ser lido, registre em `erros_leitura`.

---

## Skill obrigatória: `agent-spec-testing-best-practices`

Antes de gerar qualquer caso de teste, este agente **carrega a doutrina [`agent-spec-testing-best-practices`](../concepts/testing-best-practices.md) via Read** (subagentes NÃO invocam skills — leem os arquivos diretamente): lê o `SKILL.md` (Iron Laws, padrões positivos, red flags), `references/ai-escreve-testes.md` (os 7 gates + Mock Budget Rule) e `references/fundamentos.md` (para decidir `owning_layer`). Em seguida aplica os **7 gates**:

1. **Invariant First** — cada CT declara `invariant`, `owning_layer`, `existing_suite`.
2. **Owning Layer** — estender suíte existente sempre que possível.
3. **Real Execution** — pelo menos um CT por feature com `real_execution_boundary != "none"`.
4. **Failure → Fix Production** — se um teste falha em re-execução, investigar o SUT primeiro.
5. **No Snapshot Without Contract** — snapshot só com classificação `PRODUCT_CONTRACT`.
6. **No Self-Set Mock Assertion** — Mock Budget Rule + nada de assertion em mock auto-setado.
7. **Negative Companion** — cada caso positivo tem caso negativo emparelhado.

Detalhe completo em `.claude/skills/agent-spec-testing-best-practices/references/ai-escreve-testes.md` (no repositório) e na [página de conceitos](../concepts/testing-best-practices.md).

---

## JSON de saída

```json
{
  "data": "YYYY-MM-DD",
  "stack_discovery": {
    "fonte": "testing_stack_rule|claude_md|code_signals|nao_resolvida",
    "stack": "", "framework_teste": "", "comando_teste": "",
    "discovery_needed": false, "lacunas": []
  },
  "erros_leitura": [],
  "resumo": {
    "total_casos_teste": 0,
    "por_tipo": {
      "unitario": 0, "integracao": 0, "componente": 0,
      "e2e": 0, "seguranca": 0, "acessibilidade": 0
    }
  },
  "casos_teste": [
    {
      "id": "CT-001",
      "titulo": "",
      "tipo": "UNITARIO | INTEGRACAO | COMPONENTE | E2E | SEGURANCA | ACESSIBILIDADE",
      "categoria": "caminho_feliz | teste_negativo | fronteira | caso_extremo | seguranca | tratamento_erro | integracao | integridade_dados | estado_visual | interacao_usuario | acessibilidade",
      "invariant": "",
      "owning_layer": "unit | service-integration | route-integration | e2e",
      "existing_suite": "",
      "real_execution_boundary": "db | http | filesystem | clock | rng | none",
      "negative_companion": {
        "presente": false,
        "ct_id": "",
        "input_invalido": "",
        "assertion_esperada": ""
      },
      "precondicao_privilegiada": {
        "presente": false,
        "descricao": "",
        "caminho_legitimo": "",
        "teste_analogo": ""
      },
      "camada": "",
      "pre_condicoes": [],
      "dados_entrada": { "descricao": "", "valores": {} },
      "passos": [],
      "resultado_esperado": "",
      "criterios_aceitacao_validados": [],
      "observacoes": ""
    }
  ],
  "cenarios_nao_cobertos": [{ "descricao": "", "motivo": "" }],
  "recomendacoes": [],
  "mock_budget_observado": true,
  "gates_aplicados": [
    "invariant_first", "owning_layer", "real_execution",
    "failure_means_fix_production", "no_snapshot_without_contract",
    "no_self_set_mock_assertion", "negative_companion"
  ]
}
```

> Os campos `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion`, `mock_budget_observado` e `gates_aplicados` são **obrigatórios** — refletem os 7 gates da skill `agent-spec-testing-best-practices`. O campo `precondicao_privilegiada` é obrigatório **quando** o caso depende de estado que a produção não expõe publicamente (ver abaixo).

### Precondição privilegiada — a receita do seam

Quando um caso de teste depende de uma precondição que a produção **não expõe publicamente** (contexto autenticado, estado interno, relógio/tempo, identidade/`sub`, sessão), o agente preenche `precondicao_privilegiada` com **como montá-la sem tocar a produção** — não só com a asserção final. Dar o objetivo sem a receita é o que leva o executor a alargar a superfície de produção (criar/exportar símbolo só para teste), violando a Iron Law #6 ([Lei do seam](../configuration/executor-discipline.md)).

| Campo | Conteúdo |
| --- | --- |
| `presente` | `true` se o caso exige tal precondição |
| `descricao` | o que precisa estar montado antes do ato (ex.: "contexto carregando um `sub` autenticado") |
| `caminho_legitimo` | como montá-la, em ordem: (a) imitar teste análogo → (b) boundary/API real → (c) mecanismo de teste-interno nativo da stack. **Nunca** exportar símbolo de produção |
| `teste_analogo` | path/identificador do teste existente a imitar (ou `NENHUM` — então `caminho_legitimo` carrega a receita completa) |

> Agnóstico de stack: o `caminho_legitimo` descreve o padrão, não nomeia mecanismo de uma linguagem específica salvo se a stack já estiver descoberta.

---

## Otimizações ligadas a este agent

| Otimização | O que faz | Skill |
| --- | --- | --- |
| **qa_context pré-extraído** | Skill cria `.qa_context.md` denso (1.5k tokens) consumido por N invocações em vez de cada uma reler tech_spec inteiro (~10k) | [agent-spec-sdd-generate-task-plan](../skills/sdd/sdd-generate-task-plan.md) |
| **Consolidação por camada** | Agrupa tasks por camada (infra/domínio/integração/e2e+packaging) e dispara 1 invocação por camada com chave por task ID | [agent-spec-minispec-generate-tasks](../skills/minispec/minispec-generate-tasks.md), [agent-spec-sdd-generate-task-plan](../skills/sdd/sdd-generate-task-plan.md) |
| **Skip QA quando a Estratégia de Testes completa** | Se a Estratégia de Testes do tech_spec já tem ≥10 CTs detalhados, redistribui via heurística (match componente↔task) sem invocar este agent | [agent-spec-sdd-generate-task-plan](../skills/sdd/sdd-generate-task-plan.md) |

Detalhes em [qa_context pré-extraído](../advanced/qa-context.md), [QA Consolidation](../advanced/qa-consolidation.md), [Skip QA seção 14](../advanced/skip-qa-section14.md).

---

## Regras críticas

1. Siga `instrucoes` fielmente.
2. Aplique **Economia de Leitura**.
3. **Leia (Read) a doutrina `agent-spec-testing-best-practices` ANTES de gerar** (`SKILL.md` + `references/ai-escreve-testes.md` + `references/fundamentos.md` — subagentes NÃO invocam skills) — aplique os 7 gates.
4. Teto de 40 casos. Sem duplicar entre camadas. Consolide em parametrizados.
5. Não gere testes de verificação estática, logging interno, performance/carga.
6. UI: comportamento do usuário, não implementação.
7. Cada CT DEVE ter `invariant`, `owning_layer`, `existing_suite`, `real_execution_boundary`, `negative_companion`. Pelo menos 1 CT por feature com `real_execution_boundary != "none"`.
8. **Mock Budget Rule**: nenhuma assertion em valor que o próprio teste plantou no mock.
9. **Precondição privilegiada exige receita**: todo caso que dependa de estado não exposto publicamente (auth/contexto/relógio/identidade) preenche `precondicao_privilegiada` com o `caminho_legitimo` (imitar teste análogo → boundary real → mecanismo de teste-interno nativo) — nunca descreva o seam como exportar símbolo de produção.
10. SEMPRE retorne JSON válido.

---

## Próximos passos

* [agent-spec-qa-validator (Gate 1)](qa-validator.md) — quem **valida** se os testes gerados aqui foram implementados.
* [qa_context pré-extraído](../advanced/qa-context.md) — economia de tokens.
* [QA Consolidation](../advanced/qa-consolidation.md) — agrupar tasks por camada.
* [Skip QA quando a Estratégia de Testes completa](../advanced/skip-qa-section14.md) — eliminar invocações redundantes.
