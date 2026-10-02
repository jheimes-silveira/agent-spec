# TASK – Detalhamento da Task

## 1. Identificação
- **ID**:
- **Nome da Task**:
- **model**: sonnet            <!-- sonnet (default) | opus (área crítica/alta complexidade). Ver agent-spec-minispec-generate-tasks/SKILL.md → "FASE 3 — Heurística de modelo, risk e gates". NUNCA haiku. -->
- **risk**: low                 <!-- low | medium | high -->
- **gates**: [qa, tech_review]  <!-- [qa, tech_review] (default) | [qa] | none (task trivial) -->
- **Status**: A Fazer | Em Progresso | Bloqueado | Concluído  <!-- enum canônico. Em Progresso: setado pelo orquestrador na pré-execução. Bloqueado: 3 tentativas esgotadas OU dependência bloqueada. -->
- **Fase**:
- **Dependências**:
- **Símbolos públicos criados**:        <!-- tipos/funções/interfaces/constantes que OUTRAS tasks podem consumir (ex.: `service.EmailSender`, `dto.CartItem`). N/A se nenhum. Alimenta a derivação do flag de paralelismo e o guard de disjunção de símbolo do executor (ver agent-spec-workflow-rules.md → "Invariante de Paralelismo"). -->
- **Símbolos consumidos de outras tasks**: <!-- símbolo → task de origem (ex.: `service.EmailSender ← T5`). N/A se nenhum. Se consumir símbolo nascido em task posterior, REORDENE (Regra 10a). -->
- **Critério de Conclusão**: Como saber que está pronta

---

## 2. Objetivo da Task
O que esta task entrega (resultado técnico direto).

---

## 3. Arquivos Impactados

### 3.1 Arquivos a Criar
| Arquivo | Descrição |
|---------|-----------|
|         |           |

### 3.2 Arquivos a Modificar
| Arquivo | Modificação |
|---------|------------|
|         |            |

### 3.3 Arquivos de Referência
| Arquivo | Motivo da Consulta |
|---------|-------------------|
|         |                   |

---

## 4. Detalhes de Implementação
- [ ] Subtask 1
- [ ] Subtask 2

### 4.1 Exemplo de Payload (preencher se a task expõe endpoint com payload parcial)

<!-- LLM-ONLY: Quando a task implementa um endpoint PUT/PATCH com atualização parcial (qualquer campo
  pode estar ausente, multipart parcial), registre: (1) body/form MÍNIMO com só o campo mais comumente
  atualizado isolado; (2) observação literal "campos ausentes são ignorados; sem `binding:"required"` /
  sem `@NotNull` / sem `validates_presence_of` no Request — apenas o ID na URL é obrigatório"; (3) diferença
  para o POST correspondente (no POST os obrigatórios continuam obrigatórios; no PUT/PATCH parcial, não).
  Escreva "N/A — sem payload parcial" se não aplicável. -->

N/A — sem payload parcial

---

## 5. Testes

<!-- LLM-ONLY: Coluna "Objetivo": Descreva em 1 frase O QUE o teste valida e POR QUE importa. Use o padrão: Verbo + comportamento específico + condição. Exemplo: "Verificar que apenas categorias com ativo=1 são retornadas, ordenadas pelo campo 'ordem'". NÃO repita o nome do teste. -->

<!-- LLM-ONLY: Os nomes de arquivo, função e framework são SEMPRE na convenção da stack descoberta pelo
  agent-spec-qa-test-generator (campos `stack_discovery` e `existing_suite` do JSON). Não pressuponha
  Go/backend — os placeholders (`<arquivo de teste>`, `<NomeDoTeste_Cenario>`) materializam-se conforme a
  stack (Go: `foo_test.go`/`TestFoo_Caso`; TS/Jest: `foo.spec.ts`/describe-it; pytest: `test_foo.py`;
  Dart: `foo_test.dart`). -->

### 5.0 Padrões de Teste (detectados)
- **Framework**: [detectado via `stack_discovery` — ex.: testify, jest, pytest, flutter_test]
- **Convenção de nomes**: [detectada — ex.: Test<Layer>_<Function>_<Scenario>, describe/it, test_<function>]
- **Fixture/Setup**: [detectado — ex.: banco in-memory, factory functions, fixtures]
- **Mocks**: [detectado — ex.: interfaces com mock, jest.mock, mocktail, mockito]

### 5.1 Testes Unitários

#### [Camada]: [NomeComponente] (`<arquivo de teste na convenção da stack>`)

Mock: [interfaces/dependências mockadas]

<!-- LLM-ONLY: Coluna "Setup (caminho legitimo)" — receita anti-violacao da Iron Law #6: quando o teste depende de precondicao que a producao nao expoe (auth/contexto/relogio/identidade), preencher com o caminho legitimo de montagem vindo de `precondicao_privilegiada` do JSON do qa-test-generator. Usar `—` quando nao ha precondicao privilegiada. NUNCA exportar/criar simbolo de producao so para teste. -->

| CT | Teste | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----------|-------|----------|------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | Verificar que [comportamento] quando [condição] | dados entrada | resultado esperado | dependências mockadas | — |

### 5.2 Testes de Integração

#### [CamadaA + CamadaB] (`<arquivo de teste na convenção da stack>`)

Setup: [banco in-memory, migrações, fixtures]

| CT | Teste | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----------|-------|-----------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | Verificar que [comportamento] quando [condição] | Passos do fluxo | Assertions esperadas | — |

### 5.3 Testes E2E

#### Fluxo: [Nome do Fluxo] (CT-XX)
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida de ponta a ponta)
- **Pré-condições**: (estado inicial do sistema)
- **Passos**:
  1. Passo 1
  2. Passo 2
- **Validações**: (assertions sobre dados e estado final)

### 5.4 Cenários de Erro

| Cenário | Objetivo | Trigger | Código/Status | Log Esperado |
|---------|----------|---------|---------------|-------------|
| Descrição do cenário | Verificar que [constraint] impede [operação] | Ação trigger | Código erro | Mensagem log |

### 5.5 Rastreabilidade: Critério de Conclusão → Testes

<!-- LLM-ONLY: Cada critério de conclusão/aceite desta task deve ter ≥1 teste que o valida. Esta tabela
  é a prova de cobertura — se um critério não tem teste correspondente, falta caso de teste OU o critério
  não é verificável (reescreva-o). -->

| # | Critério (seção 1 / aceite) | Teste(s) Correspondente(s) | Tipo |
|---|-----------------------------|----------------------------|------|
| 1 | [critério de conclusão] | [CT-XX / NomeDoTeste] | [Unitário/Integração/E2E] |

### 5.6 Detalhamento dos Casos de Teste

<!-- LLM-ONLY: destrinchamento lossless por CT — um card por caso de `casos_teste[]` do JSON do
  qa-test-generator (formato canônico no SKILL.md, Passo 4, subseção 5.6). As tabelas 5.1-5.4 são o
  INDICE (cobertura num relance); o card é o DETALHE que o revisor humano valida e o executor
  implementa. Após salvo na task, o card é canônico — edições humanas acontecem aqui e NUNCA são
  re-sincronizadas de _run/test-cases.json (fluxo forward-only). Campo vazio no JSON → omitir o bullet.
  "Precondição privilegiada" só aparece quando precondicao_privilegiada.presente == true. -->

#### CT-XX — [título do caso]

- **Tipo**: [tipo] | **Categoria**: [categoria]
- **Arquivo**: `[existing_suite]` ([criar|modificar])
- **Invariant**: [invariant]
- **Owning layer**: `[owning_layer]` | **Real execution boundary**: `[real_execution_boundary]`
- **Pré-condições**: [pre_condicoes — um sub-bullet por item]
- **Dados de entrada**: [dados_entrada]
- **Passos**: [passos — lista numerada]
- **Resultado esperado**: [resultado_esperado — valor exato, sentinela ou status code; nunca termo vago]
- **Negative companion**: [→ CT-YY: input_invalido — assertion_esperada | "este é o caso negativo (`ct_id: self`)"]
- **Precondição privilegiada**: [caminho_legitimo. Análogo: `teste_analogo`]
- **Critérios validados**: [critérios de conclusão/aceite cobertos]

### Testes Existentes a Modificar

| Arquivo | Motivo da Modificação |
|---------|----------------------|
|         |                      |

<!-- LLM-ONLY: Se nenhum teste existente precisa ser modificado, escreva: "Nenhum teste existente impactado." -->

---

## 6. Notas / Observações
Anotações técnicas, decisões, pontos relevantes.

### ADRs Aplicáveis nesta Task

<!-- LLM-ONLY: propagado pelo gerador a partir da subseção "ADRs Aplicáveis nesta Feature" do scope (etapa 0.2.0 — já confrontadas literalmente lá).
  Liste APENAS as ADRs que governam os arquivos desta task (subconjunto da lista do scope; intersecção entre as áreas da ADR e §3.1/§3.2).
  Uma linha por ADR, formato: `ADR-NNNN — decisão concreta que esta task deve obedecer (path/lib/padrão) — docs/adr/NNNN-slug.md`.
  É injetada VERBATIM no prompt do executor pelo run (bloco "ADRs aplicáveis — REGRA ABSOLUTA"). Se nenhuma ADR governa esta task, escreva "Nenhuma". -->
- ADR-NNNN — [decisão concreta a obedecer] — [path do arquivo da ADR]

---

## 7. Checklist Final
- [ ] Implementada conforme Scope
- [ ] Testes unitários criados/atualizados
- [ ] Testes de integração criados/atualizados
- [ ] Critério de conclusão atendido
- [ ] Rastreabilidade Critério → Testes preenchida (seção 5.5)
- [ ] Detalhamento dos Casos de Teste preenchido (seção 5.6 — 1 card por CT)
- [ ] Revisada
