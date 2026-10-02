# TASKCARD - Execução Rápida (com Guardrails LLM)

## 1. Identificação
- **ID**: TC-XXX
- **Nome da Task**: [nome descritivo]
- **model**: sonnet            <!-- sonnet (default) | opus (área crítica/complexa). Ver agent-spec-taskcard-generate/SKILL.md → "FASE 3 — Heurística de model, risk e gates". NUNCA haiku. -->
- **risk**: low                 <!-- low | medium | high -->
- **gates**: [qa, tech_review]  <!-- [qa, tech_review] (default) | [qa] | none (task trivial: docs/config sem código executável) -->
- **Variante**: [web | mobile | backend]  <!-- frente da TaskCard (FASE 0.-1 da generate). Também enviada como parâmetro `frente` ao agent-spec-qa-test-generator e usada como fallback de variante pela /agent-spec-debt-resolution. -->
- **mode**: standard            <!-- standard | crud-fastpath (gerada pelo CRUD Fast-Path da FASE 6.5) -->
- **source**: [recommended | overridden | no_discovery]  <!-- aderência à recomendação do pre-refinement (FASE 0.4 da generate). Instrumentação minerável. -->
- **source_note**:              <!-- só quando source: overridden — recomendação original que o usuário divergiu. N/A caso contrário. -->
- **Responsável**: [quem executa]
- **Data**: [data de criação]
- **Status**: A Fazer | Em Progresso | Bloqueado | Concluído  <!-- gerado sempre como "A Fazer". Transições são do agent-spec-taskcard-run: Em Progresso (Passo 1.12), Concluído (Passo 5.5.5), Bloqueado (Passo 6.1 — 3 tentativas esgotadas). -->
- **Dependências**: (IDs de outras tasks, se houver)
- **Símbolos públicos criados**:        <!-- tipos/funções/interfaces/constantes que OUTRAS cards podem consumir (ex.: `service.EmailSender`, `dto.CartItem`). N/A se nenhum ou card única. Usado pela FASE 8 da generate para validar a ordem das cards (reordenação por direção de dependência de símbolos). A execução é 1 card por vez (agent-spec-taskcard-run) — a ordem de execução é responsabilidade do usuário. -->
- **Símbolos consumidos de outras tasks**: <!-- símbolo → card de origem (ex.: `service.EmailSender ← TC-005`). N/A se nenhum. Se consumir símbolo nascido em card posterior, REORDENE. -->
- **Relacionados**: (Issue, PR, Discussão, Link, Documento...)

---

## 2. Contexto
Explique em 2-4 linhas por que essa task existe e o que motivou a execução.

---

## 3. Objetivo da Task
Explique o que deve ser entregue ao final desta task (resultado técnico direto, sem "história de produto").

---

## 4. Escopo
### 4.1 Inclui
- [ ] Item incluído A
- [ ] Item incluído B

### 4.2 Fora do escopo
- [ ] Item fora A
- [ ] Item fora B

---

## 5. Arquivos Envolvidos

### 5.0 Visão em Árvore

<!-- LLM-ONLY: Gere uma árvore ASCII de TODOS os arquivos das seções 5.1–5.3 organizados por diretório.
  Marque cada arquivo com: [N] Novo  [M] Modificado  [R] Referência (somente leitura)
  Use os caracteres: ├── └── │ (não use + ou -)
  Exemplo (ilustrativo — a estrutura real depende da stack do projeto):

  internal/
  ├── user/
  │   ├── handler.go      [N]
  │   └── service.go      [M]
  └── db/
      └── 000002.up.sql   [N]
  go.mod                  [R]

  Legenda: [N] Novo  [M] Modificado  [R] Referência
-->

```
(treeview gerado pelo LLM aqui)
```

Legenda: `[N]` Novo &nbsp; `[M]` Modificado &nbsp; `[R]` Referência

---

### 5.1 Arquivos Existentes (leitura/referência)
Arquivos que o executor DEVE ler antes de começar. Evita scans desnecessários no codebase:
- `path/to/existing1` — [por que ler: padrão a seguir, interface a implementar, etc.]
- `path/to/existing2` — [por que ler]

<!-- LLM-ONLY: Se a TaskCard e de UI (web/mobile) e a feature tem design.md (design.feature.path em
  agent-spec-workflow-rules.md), inclua-o aqui com motivo "contrato visual — layout e estados das telas".
  O QA valida os estados visuais implementados contra ele (Camada 4). Sem design.md, omita. -->

### 5.2 Arquivos a Criar
- `path/to/new1` — [descrição do que será criado]

### 5.3 Arquivos a Modificar
- `path/to/modify1` — [o que será alterado]

---

## 6. Descrição de Execução (COMO fazer)
Explique como implementar:
- O que criar
- O que modificar
- Onde mexer
- Regras técnicas relevantes (curtas e objetivas)

### 6.1 Exemplo de Payload (OBRIGATÓRIO se a TaskCard expõe endpoint com payload parcial)

> Quando a TaskCard implementa um endpoint `PUT`/`PATCH` com atualização parcial (qualquer campo pode estar ausente, multipart parcial), registre aqui:
>
> 1. Exemplo de body/form **mínimo** (só com o campo mais comumente atualizado isoladamente).
> 2. Observação literal: "campos ausentes são ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request — apenas o ID na URL é obrigatório".
> 3. Diferenciar do verbo `POST` correspondente — no `POST` campos obrigatórios continuam obrigatórios; no `PUT`/`PATCH` parcial, **não**.
>
> Marque "N/A — sem payload parcial" se não aplicável.

---

## 7. Guardrails de Execução (LLM) - DEVE / NÃO DEVE
> Quebrar qualquer item aqui **invalida a task**.

### 7.1 DEVE
- Seguir padrões já existentes no projeto
- Alterar apenas arquivos listados em "Arquivos/Áreas Impactadas"
- Manter contratos públicos (APIs, assinaturas) inalterados

### 7.2 NÃO DEVE
- Não refatorar fora do escopo
- Não criar abstrações genéricas "por precaução"
- Não introduzir novas dependências sem justificar e registrar

---

## 8. Passos Sugeridos (checklist executável)
- [ ] Passo 1
- [ ] Passo 2
- [ ] Passo 3

---

## 9. Aceite Técnico (critérios objetivos)
A task estará concluída quando:
- [ ] Objetivo atingido conforme seção 3
- [ ] Guardrails respeitados (seção 7)
- [ ] Código compila / roda sem erros
- [ ] Nenhuma quebra nos fluxos existentes
- [ ] Padrões do projeto respeitados
- [ ] Revisão realizada (quando aplicável)

---

## 10. Testes

<!-- LLM-ONLY: Os nomes de arquivo, função e framework abaixo são SEMPRE na convenção da stack
  descoberta pelo agent-spec-qa-test-generator (campos `stack_discovery` e `existing_suite` do JSON).
  Não pressuponha Go/backend — os exemplos são ilustrativos e plurais (Go, TS/Jest, Python/pytest,
  Dart/flutter_test, Kotlin…). -->

### 10.1 Testes Existentes a Modificar
Testes que já existem e precisam ser atualizados por causa das mudanças desta task:
- `path/to/existing_test_file` — [o que precisa mudar: novos cenários, mocks atualizados, fixtures alteradas, etc.]

### 10.2 Testes a Criar
Novos testes que devem ser criados para cobrir as mudanças desta task:
- `path/to/new_test_file` — [descrição: o que testar, cenários de sucesso e erro]
  - **Setup (caminho legítimo)**: [quando o JSON do qa-test-generator traz `precondicao_privilegiada.presente: true` — `caminho_legitimo` + `teste_analogo`. Receita para montar precondições privilegiadas (auth/contexto/relógio) SEM criar/exportar símbolo de produção só para teste (Iron Law #6). Omitir o sub-bullet quando não aplicável.]

### 10.2.1 Detalhamento dos Casos de Teste

<!-- LLM-ONLY: destrinchamento lossless por CT — um card por caso de `casos_teste[]` do JSON do
  qa-test-generator (formato canônico na FASE 7 do SKILL.md). 10.1/10.2 são o INDICE; o card é o
  DETALHE que o revisor humano valida self-contained e o executor implementa. Após salvo, o card é
  canônico — edições humanas acontecem aqui e NUNCA são re-sincronizadas de _run/test-cases.json (fluxo
  forward-only). Campo vazio no JSON → omitir o bullet. "Precondição privilegiada" só aparece quando
  precondicao_privilegiada.presente == true. -->

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
- **Critérios validados**: [ACs da seção 9]

### 10.3 Cenários Obrigatórios
Lista de cenários que DEVEM ser cobertos pelos testes:
- [ ] Cenário de sucesso (caminho feliz)
- [ ] Cenário de erro (validação, not found, etc.)
- [ ] Cenários de borda (limites, valores nulos, etc.)

### 10.4 Padrões de Teste
Referência dos padrões de teste a seguir (identificados na DESCOBERTA DE STACK do agent / campo `stack_discovery` do JSON):
- **Framework**: [detectado — ex.: testify, jest, pytest, flutter_test]
- **Convenção de nomes**: [detectada — ex.: Test<Layer>_<Function>_<Scenario>, describe/it, test_<function>]
- **Fixture/Setup**: [detectado — ex.: banco in-memory, factory functions, fixtures]
- **Mocks**: [detectado — ex.: interfaces com mock, jest.mock, mocktail, mockito]

### 10.5 Cenários de Erro
Mapeamento de cenários de erro com detalhes técnicos:

| Cenário | Trigger | Expected | Código/Status |
|---------|---------|----------|---------------|
| [descrição do erro] | [o que causa] | [comportamento esperado] | [código gRPC, HTTP status, exceção] |

### 10.6 Rastreabilidade: Aceite Técnico → Testes
Mapeamento entre critérios de aceite (seção 9) e testes que os validam:

| # | Critério de Aceite (seção 9) | Teste(s) Correspondente(s) | Tipo |
|---|------------------------------|----------------------------|------|
| 1 | [critério] | [TestNome] | [Unitário/Integração/Componente/E2E/Segurança/Acessibilidade] |

---

## 11. Notas / Observações
Decisões rápidas, alertas, trade-offs ou qualquer detalhe que ajude o reviewer.

### ADRs Aplicáveis nesta Feature

<!-- LLM-ONLY: subseção canônica de rastreabilidade Feature→ADR (agent-spec-adr-workflow-rules.md).
  Uma linha por ADR consultada na FASE 1 da generate, formato: `ADR-NNNN — descrição curta da decisão`.
  A /agent-spec-adr-review audita pelo nome exato desta subseção. Se nenhuma ADR se aplica, escreva "Nenhuma". -->
- ADR-NNNN — [descrição curta da decisão]
