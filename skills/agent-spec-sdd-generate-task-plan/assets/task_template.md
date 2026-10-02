# TASK – Detalhamento da Task

## 1. Identificação
- **ID**:
- **Nome da Task**:
- **model**: sonnet            <!-- sonnet (default) | opus (área crítica/alta complexidade). Ver agent-spec-sdd-generate-task-plan/SKILL.md → "Heurística de modelo e risk". NUNCA haiku aqui. -->
- **risk**: low                 <!-- low | medium | high. Ver SKILL.md → mesma seção. -->
- **gates**: [qa, tech_review]  <!-- [qa, tech_review] (default) | [qa] (pula Tech Review) | none (task trivial, só docs/config). Ver SKILL.md → "Fast-path gates". -->
- **Responsável**:
- **Status**: A Fazer | Em Progresso | Bloqueado | Concluído  <!-- enum canônico. Em Progresso: setado pelo orquestrador na pré-execução. Bloqueado: 3 tentativas esgotadas OU dependência bloqueada. -->
- **Fase**:
- **Dependências**:
- **Símbolos públicos criados**:        <!-- tipos/funções/interfaces/constantes que OUTRAS tasks podem consumir (ex.: `service.EmailSender`, `dto.CartItem`). N/A se nenhum. Alimenta a derivação do flag de paralelismo e o guard de disjunção de símbolo do executor (ver agent-spec-workflow-rules.md → "Invariante de Paralelismo"). -->
- **Símbolos consumidos de outras tasks**: <!-- símbolo → task de origem (ex.: `service.EmailSender ← T5`). N/A se nenhum. Se consumir um símbolo nascido em task posterior, REORDENE (Regra 10a). -->
- **User Stories Relacionadas**: (US-XX do PRD)

---

## 2. Objetivo da Task
Explique o que deve ser entregue ao final desta task (resultado técnico direto, não comportamento do usuário).

---

## 3. Descrição Detalhada
Explique COMO implementar, baseado no TECH_SPEC:
- O que deve ser criado
- O que deve ser modificado
- Fluxo técnico envolvido
- Regras de implementação específicas
- Decisões técnicas já tomadas

<!-- LLM-ONLY: A descrição deve ser objetiva, clara e de engenharia. -->

### 3.1 Exemplo de Payload (preencher se a task expõe endpoint com payload parcial)

<!-- LLM-ONLY: Quando a task implementa um endpoint PUT/PATCH com atualização parcial (qualquer campo pode
  estar ausente, multipart parcial), registre: (1) body/form MÍNIMO com só o campo mais comumente atualizado
  isolado; (2) observação literal "campos ausentes são ignorados; sem `binding:"required"` / sem `@NotNull` /
  sem `validates_presence_of` no Request — apenas o ID na URL é obrigatório"; (3) diferença para o POST
  correspondente (no POST os obrigatórios continuam obrigatórios; no PUT/PATCH parcial, não). Espelha a
  doutrina anti-required da seção Estratégia de Testes do Tech Spec. Escreva "N/A — sem payload parcial" se não aplicável. -->

N/A — sem payload parcial

---

## 4. Aceite Técnico (critérios objetivos)
A task estará concluída quando:
- [ ] Estrutura implementada conforme SPEC
- [ ] Fluxo técnico funcional
- [ ] Erros corretamente tratados
- [ ] Testes da task criados (quando aplicável)
- [ ] Código revisado e aprovado
- [ ] Nenhuma quebra nos fluxos existentes

---

## 5. Arquivos Impactados

### 5.1 Arquivos a Criar
| Arquivo | Descrição |
|---------|-----------|
|         |           |

### 5.2 Arquivos a Modificar
| Arquivo | Modificação |
|---------|------------|
|         |            |

### 5.3 Arquivos de Referência

<!-- LLM-ONLY: Se o Tech Spec tem "Design Relacionado" preenchido (web/mobile) E esta task cria/modifica
  componente de camada UI, inclua o design.md aqui com motivo "contrato visual — layout e estados das telas".
  Tasks sem camada UI não o referenciam (minimum-context). -->

| Arquivo | Motivo da Consulta |
|---------|-------------------|
|         |                   |

---

## 6. Testes

<!-- LLM-ONLY: Coluna "Objetivo": Descreva em 1 frase O QUE o teste valida e POR QUE importa. Use o padrão: Verbo + comportamento específico + condição. Exemplo: "Verificar que apenas categorias com ativo=1 são retornadas, ordenadas pelo campo 'ordem'". NÃO repita o nome do teste — o objetivo deve dar contexto que o nome sozinho não dá. -->

<!-- LLM-ONLY: Os nomes de arquivo, função e framework são SEMPRE na convenção da stack descoberta pelo
  agent-spec-qa-test-generator (campos `stack_discovery` e `existing_suite` do JSON). Não pressuponha
  Go/backend — os placeholders (`<arquivo de teste>`, `<NomeDoTeste_Cenario>`) materializam-se conforme a
  stack (Go: `foo_test.go`/`TestFoo_Caso`; TS/Jest: `foo.spec.ts`/describe-it; pytest: `test_foo.py`;
  Dart: `foo_test.dart`). Mantém a coerência com a seção Estratégia de Testes do Tech Spec. -->

### 6.0 Padrões de Teste (detectados)
- **Framework**: [detectado via `stack_discovery` — ex.: testify, jest, pytest, flutter_test]
- **Convenção de nomes**: [detectada — ex.: Test<Layer>_<Function>_<Scenario>, describe/it, test_<function>]
- **Fixture/Setup**: [detectado — ex.: banco in-memory, factory functions, fixtures]
- **Mocks**: [detectado — ex.: interfaces com mock, jest.mock, mocktail, mockito]

### 6.1 Testes Unitários

#### [Camada]: [NomeComponente] (`<arquivo de teste na convenção da stack>`)

Mock: [interfaces/dependências mockadas]

<!-- LLM-ONLY: Coluna "Setup (caminho legitimo)" — receita anti-violacao da Iron Law #6: quando o teste depende de precondicao que a producao nao expoe (auth/contexto/relogio/identidade), preencher com o caminho legitimo de montagem (imitar teste analogo -> boundary real -> mecanismo teste-interno nativo da stack) vindo de `precondicao_privilegiada` do JSON do qa-test-generator. Usar `—` quando nao ha precondicao privilegiada. NUNCA exportar/criar simbolo de producao so para teste. -->

| CT | Teste | CA | Objetivo | Input | Expected | Mock | Setup (caminho legítimo) |
|----|-------|----|----------|-------|----------|------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | CA-XX | Verificar que [comportamento esperado] quando [condição] | dados de entrada | resultado esperado | dependências mockadas | — |

### 6.2 Testes de Integração

#### [CamadaA + CamadaB] (`<arquivo de teste na convenção da stack>`)

Setup: [banco in-memory, migrações, fixtures]

| CT | Teste | CA | Objetivo | Fluxo | Validação | Setup (caminho legítimo) |
|----|-------|----|----------|-------|-----------|--------------------------|
| CT-XX | <NomeDoTeste_Cenario> | CA-XX | Verificar que [comportamento] quando [condição] | Passos do fluxo | Assertions esperadas | — |

### 6.3 Testes E2E

#### Fluxo: [Nome do Fluxo] (CT-XX)
- **CA**: CA-XX, CA-YY
- **Objetivo**: (1 frase descrevendo o que este fluxo E2E valida de ponta a ponta)
- **Pré-condições**: (estado inicial do sistema)
- **Passos**:
  1. Passo 1
  2. Passo 2
- **Validações**: (assertions sobre dados e estado final)

### 6.4 Cenários de Erro

| Cenário | CA | Objetivo | Trigger | Código/Status | Log Esperado |
|---------|----|----------|---------|---------------|-------------|
| Descrição do cenário | CA-XX | Verificar que [constraint] impede [operação] e retorna erro adequado | Ação que dispara o erro | Código de erro esperado | Mensagem de log esperada |

### 6.5 Rastreabilidade: Aceite Técnico → Testes

<!-- LLM-ONLY: Prova de cobertura reversa — cada critério da seção 4 (Aceite Técnico) e cada CA-XX coberto
  por esta task DEVE ter ≥1 teste correspondente. Espelha a "Rastreabilidade: Critérios de Aceite → Testes"
  da seção Estratégia de Testes do Tech Spec, mas no escopo desta task. Critério/CA sem teste = falta de caso (gere) OU critério
  não-verificável (reescreva). -->

| # | Critério de Aceite (§4) / CA | Teste(s) Correspondente(s) | Tipo |
|---|------------------------------|----------------------------|------|
| 1 | [critério §4 ou CA-XX] | [CT-XX / NomeDoTeste] | [Unitário/Integração/E2E] |

### 6.6 Detalhamento dos Casos de Teste

<!-- LLM-ONLY: destrinchamento lossless por CT — um card por caso de `casos_teste[]` do JSON do
  qa-test-generator (formato canônico em qa-delegation-tasks.md, Passo 4, subseção 6.6). As tabelas
  6.1-6.4 são o INDICE (cobertura num relance); o card é o DETALHE que o revisor humano valida e o
  executor implementa. Após salvo na task, o card é canônico — edições humanas acontecem aqui e NUNCA
  são re-sincronizadas de _run/test-cases.json (fluxo forward-only). Campo vazio no JSON → omitir o bullet.
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
- **Critérios validados**: [criterios_aceitacao_validados]

---

## 7. Notas / Observações
Anotações técnicas, decisões, pontos relevantes.

### ADRs Aplicáveis nesta Task

<!-- LLM-ONLY: propagado pelo gerador a partir da subseção "ADRs Aplicáveis nesta Feature" do tech_spec (FASE 4A — já confrontadas literalmente lá).
  Liste APENAS as ADRs que governam os arquivos desta task (subconjunto da lista do tech_spec; intersecção entre as áreas da ADR e §5.1/§5.2).
  Uma linha por ADR, formato: `ADR-NNNN — decisão concreta que esta task deve obedecer (path/lib/padrão) — docs/adr/NNNN-slug.md`.
  É injetada VERBATIM no prompt do executor pelo run (bloco "ADRs aplicáveis — REGRA ABSOLUTA"). Se nenhuma ADR governa esta task, escreva "Nenhuma". -->
- ADR-NNNN — [decisão concreta a obedecer] — [path do arquivo da ADR]

---

## 8. Checklist Final
- [ ] Implementada conforme SPEC
- [ ] Testes unitários criados/atualizados
- [ ] Testes de integração criados/atualizados
- [ ] Aceite técnico atendido
- [ ] Rastreabilidade Aceite → Testes preenchida (seção 6.5)
- [ ] Detalhamento dos Casos de Teste preenchido (seção 6.6 — 1 card por CT)
- [ ] Revisada
- [ ] Staged para commit (`git add` feito pelo orquestrador — o pipeline NUNCA commita)
