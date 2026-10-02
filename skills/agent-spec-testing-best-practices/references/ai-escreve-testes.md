# AI escreve testes — 7 gates obrigatórios

> Reference de `agent-spec-testing-best-practices`. Aplicado por `agent-spec-qa-test-generator` em CADA caso de teste, e por `agent-spec-qa-validator` ao revisar testes gerados.
>
> Agentes têm viés conhecido: mockar tudo para conseguir verde rápido, gerar testes sem invariante clara, omitir negative companion. Os gates abaixo bloqueiam esses vieses.

---

## Output estruturado antes do código

Antes de propor o caso de teste em si, o agente produz declarativamente:

```
INVARIANT: <propriedade que deve valer independente da implementação, em uma frase>
OWNING_LAYER: <unit | service-integration | route-integration | e2e>
EXISTING_SUITE: <caminho do arquivo de testes existente que cobre essa camada para esse módulo | NO_SUITE_FOUND>
```

No JSON do `agent-spec-qa-test-generator`, esses três campos vivem dentro de cada item de `casos_teste[]` (ver `agent-spec-qa-test-generator.md` para o schema atualizado).

Se `EXISTING_SUITE == NO_SUITE_FOUND`, o agente declara o literal no campo e **justifica em `observacoes`** a criação do arquivo novo (qual suíte existente NÃO cobre a invariante e por quê) — ele nunca pergunta nada (contrato: retorna só JSON); a confirmação é responsabilidade do orquestrador/usuário a jusante.

---

## Gate 1 — Invariant First

**Pergunta**: Qual é a invariante e em qual camada ela pertence?

**Reprova**: Caso de teste sem `INVARIANT` declarado ou com invariante vaga (`"o sistema funciona"`, `"o método retorna corretamente"`).

**Critério de boa invariante**:
- Frase declarativa única.
- Independente de implementação interna.
- Verificável por observação externa (output, side-effect visível).

**Exemplos**:

```
RUIM   INVARIANT: testa que o pedido é criado
BOM    INVARIANT: pedido com total < 0 nunca é persistido e retorna erro 422 com message "total inválido"

RUIM   INVARIANT: login funciona
BOM    INVARIANT: login com senha errada retorna 401 sem revelar se o email existe e incrementa contador de tentativa falha
```

---

## Gate 2 — Owning Layer

**Pergunta**: O teste estende uma suíte existente ou justifica criar arquivo novo?

**Reprova**: Criar arquivo novo de teste sem confirmar que nenhuma suíte existente cobre essa invariante.

**Protocolo**:
1. Liste suítes candidatas para o `OWNING_LAYER` escolhido.
2. Se houver suíte canônica para o módulo → **estender**.
3. Se nenhuma → declarar `EXISTING_SUITE: NO_SUITE_FOUND`, nomear o arquivo novo proposto em `observacoes`, justificando a unicidade da invariante (qual suíte existente NÃO cobre isso e por quê).
4. A confirmação da criação é do orquestrador/usuário a jusante — o agente não pergunta (retorna só JSON) nem cria arquivo.

---

## Gate 3 — Real Execution

**Pergunta**: Este teste atravessa uma fronteira de integração real?

**Reprova**: Suite inteira de testes para a feature **só com mocks** (zero teste atravessando DB/HTTP/filesystem reais).

**Protocolo**:
1. Para cada caso de teste, declarar `real_execution_boundary`:
   - `db` — atravessa DB efêmero/container real.
   - `http` — atravessa servidor HTTP real (in-process ou container).
   - `filesystem` — atravessa filesystem temporário real.
   - `clock`/`rng` — não conta como fronteira (são determinismo, não integração).
   - `none` — totalmente unitário.
2. Pelo menos **um caso de teste por feature** deve ter `real_execution_boundary != none`.
3. Se TODOS os casos têm `none`, o gerador acrescenta um caso de integração para a invariante de maior blast radius.

---

## Gate 4 — Failure means fix production

**Pergunta**: Quando o teste falha, a raiz é o teste ou o SUT?

**Reprova**: Editar a assertion para "passar" sem investigar o SUT.

**Failure Protocol** (aplicado quando teste falha em re-execução):

```
1. Ler trace completo + código do SUT envolvido.
2. Decidir:
   a) O teste asserta o contrato corretamente?
      → SIM: propor mudança no SUT.
      → NÃO: escrever 'SUT_IS_CORRECT_BECAUSE: <parágrafo>' justificando
        por que o teste estava errado.
3. Toda edição de teste exige (a) ou (b) acima documentado.
```

Sem essa justificativa, mudar o teste para "ficar verde" é violação de Iron Law #5.

---

## Gate 5 — No Snapshot Without Contract

**Pergunta**: O artefato sob snapshot é contrato de produto ou detalhe de implementação?

**Reprova**: Snapshot de texto UI, mensagem de erro humana, valor CSS, DOM renderizado, JSON interno do app.

**Classificação obrigatória**:

| Classe | Artefatos | Snapshot? |
|---|---|---|
| `PRODUCT_CONTRACT` | OpenAPI gerado, SDK público, schema GraphQL, response de endpoint público versionado | **Permitido** com revisão de diff linha-a-linha |
| `IMPLEMENTATION_DETAIL` | Texto UI, mensagens de erro, output de console, DOM, valores literais internos, config gerada | **PROIBIDO** — escreva assertions específicas |

**Padrão**: na dúvida, tratar como IMPLEMENTATION_DETAIL.

---

## Gate 6 — No Self-Set Mock Assertion

**Pergunta**: A assertion valida um valor que o próprio teste escreveu no mock?

**Reprova**: `mock.returnValue(X)` seguido de `expect(...).toBe(X)` sem transformação do SUT no meio.

### Mock Budget Rule

- Testes unitários podem mockar **apenas a fronteira do SUT** (rede, disco, clock).
- Testes que mockam **todos os colaboradores** DEVEM ter um companheiro de integração **sem mocks** para a mesma invariante.
- **Nenhuma assertion** em valor escrito pelo teste no mock, a menos que:
  - (a) o SUT transforme o valor (e a assertion seja sobre a transformação),
  - (b) a assertion seja sobre side-effect observável (DB, log, fila),
  - (c) o expected value venha de fonte externa verificável (contrato, constante do SUT).

### Checklist por assertion

Para cada `expect(...)`/assertion, marque a origem do expected value:
- (a) constante exportada pelo SUT.
- (b) contrato externo (schema, OpenAPI, ADR).
- (c) computação que o SUT realiza e o teste re-deriva.
- (d) **proibido**: literal escrito pelo teste e re-asserido.

Se você não consegue marcar (a), (b) ou (c) honestamente, o teste é mock-driven confidence (AP-10).

---

## Gate 7 — Negative Companion

**Pergunta**: Para cada caso positivo, existe caso negativo que rejeita input inválido ou modo de falha?

**Reprova**: Suite inteira só de happy-path; testes "should not throw" sem assertion específica.

**Protocolo**:
- Para cada `casos_teste[i]` com `categoria == "caminho_feliz"` ou `"interacao_usuario"`, registrar:
  ```json
  "negative_companion": {
    "presente": true|false,
    "ct_id": "CT-002",   // ID do caso negativo emparelhado
    "input_invalido": "ex: total negativo, email mal formatado",
    "assertion_esperada": "ex: 422 + erro 'total_invalido' no campo erros[]"
  }
  ```
- Se `presente: false`, o agente deve gerar o caso negativo emparelhado **na mesma resposta**, atualizar `ct_id`, e re-emitir.
- O teste negativo deve ter:
  - Input efetivamente diferente do positivo (não apenas mudar um caractere).
  - Assertion específica (tipo de erro, status code, message contains, evento NÃO emitido).
- **Sanidade**: deletar o teste negativo — a suíte ainda fica verde? Se sim, o teste negativo era oco (volta ao Gate 6).

---

## Resumo executivo (para uso do agent-spec-qa-test-generator)

Cada item de `casos_teste[]` no JSON do `agent-spec-qa-test-generator` ganha 6 campos derivados dos gates (schema canônico: `agent-spec-qa-test-generator.md`):

```json
{
  "id": "CT-001",
  "titulo": "...",
  "tipo": "...",
  "categoria": "...",
  "invariant": "...",                    // Gate 1
  "owning_layer": "unit|service-integration|route-integration|e2e",  // Gate 1
  "existing_suite": "<path>|NO_SUITE_FOUND",                          // Gate 2
  "real_execution_boundary": "db|http|filesystem|clock|rng|none",     // Gate 3
  "negative_companion": {                                              // Gate 7
    "presente": true,
    "ct_id": "CT-002",
    "input_invalido": "...",
    "assertion_esperada": "..."
  },
  "precondicao_privilegiada": {                                        // receita do seam (Iron Law #6)
    "presente": false,
    "descricao": "...",
    "caminho_legitimo": "como montar a precondição SEM tocar a produção",
    "teste_analogo": "<path do teste a imitar>|NENHUM"
  },
  "camada": "...",
  "pre_condicoes": [...],
  "dados_entrada": {...},
  "passos": [...],
  "resultado_esperado": "...",
  "criterios_aceitacao_validados": [...],
  "observacoes": ""
}
```

E o JSON ganha no nível raiz:

```json
"mock_budget_observado": true|false,        // Gate 6 + Mock Budget Rule
"gates_aplicados": ["invariant_first", "owning_layer", "real_execution", "failure_means_fix_production", "no_snapshot_without_contract", "no_self_set_mock_assertion", "negative_companion"]
```

(São **7 ids canônicos** — todos devem aparecer em geração normal; ids conforme o schema do agent.)

Os campos são **obrigatórios**. Em caso de teste onde algum gate não se aplica (ex.: teste de erro não tem `negative_companion` próprio porque ele já É um caso negativo), use:

```json
"negative_companion": { "presente": true, "ct_id": "self", "input_invalido": "este é o caso negativo", "assertion_esperada": "ver resultado_esperado" }
```

---

## Resumo executivo (para uso do agent-spec-qa-validator)

Ao revisar testes implementados, o `agent-spec-qa-validator` aplica os 7 gates como **checklist de detecção**:

| Gate violado | Vira item em `problemas.*` com campo `smell` (nome canônico) |
|---|---|
| 1 (sem invariante) | `vague_existence_assertion` (MÉDIO) |
| 2 (suíte duplicada sem motivo) | `duplicate_cross_layer` (MÉDIO) |
| 3 (sem real execution) | flag `real_execution_missing` em `red_flags_detectadas` + ALTO em problemas |
| 4 (teste enfraquecido) | `weakening_test_to_pass` (CRÍTICO) |
| 5 (snapshot de IMPLEMENTATION_DETAIL) | `snapshot_as_test` (CRÍTICO) |
| 6 (assertion em mock auto-set) | `mock_driven_confidence` (CRÍTICO) |
| 7 (sem negative companion) | `happy_path_only` (ALTO) |

Cada violação **simultaneamente** vai para `problemas.*` correspondente. Como todos os 7 gates listados aqui mapeiam para antipadrões CRÍTICOS ou ALTOS, qualquer violação **bloqueia** (`REJEITADO`) pela política débito-controlado do agent-spec-qa-validator. Apenas violações estilísticas BAIXAS listadas em `antipadroes.md` viram observações em vez de bloqueio (médios também bloqueiam → entram no loop de correção).
