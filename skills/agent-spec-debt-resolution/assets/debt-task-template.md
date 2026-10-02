# T{{n}} — Resolver D-{{id_debito}}: {{titulo}}

<!-- Numeração de seções espelha o template canônico do miniSpec
     (agent-spec-minispec-generate-tasks/assets/task_template.md):
     Arquivos Impactados em §3.1/§3.2 (Camada 0 do QA), Testes em §5,
     Checklist Final em §7. NÃO renumere. -->

## 1. Identificação

- **ID**: T{{n}}
- **Nome da Task**: Resolver D-{{id_debito}} — {{titulo}}
- **model**: sonnet
- **risk**: {{risk}}
- **gates**: {{gates}}
- **Status**: A Fazer
- **Fase**: 1
- **Dependências**: Nenhuma
- **Símbolos públicos criados**: N/A   <!-- cleanup não cria símbolos novos — verdade por construção -->
- **Símbolos consumidos de outras tasks**: N/A
- **Critério de Conclusão**: Correção do débito aplicada sem expansão de escopo; suíte existente passa sem regressão; Gate 1 (QA) aprova.
- **Feature**: {{feature}}
- **Versão**: {{version}}
- **Parent task**: T{{origem_task_parent}} (de {{parent_version}})
- **Débito origem**: D-{{id_debito}} ({{categoria}}, {{severidade}})
- **Source**: agent-spec-debt-resolution

---

## 2. Objetivo da Task

Resolver o débito técnico D-{{id_debito}} aplicando a correção exata sugerida pelo gate original, **sem expandir escopo** e **sem regressão** na suíte de testes.

---

## 3. Arquivos Impactados

### 3.1 Arquivos a Criar

_Nenhum._

### 3.2 Arquivos a Modificar

| Arquivo | Descrição |
|---------|-----------|
| `{{arquivo}}` | {{correcao_sugerida_curta}}{{#if linha}} (foco na linha {{linha}}){{/if}} |

### 3.3 Arquivos de Referência

- `docs/specs/features/{{feature}}/{{parent_version}}/_run/run-report.md` — débito original.
- `docs/specs/features/{{feature}}/{{parent_version}}/tasks/T{{origem_task_parent}}.md` — task que gerou o débito.

---

## 4. Detalhes de Implementação

### 4.1 Contexto do Débito

**Origem**: task `T{{origem_task_parent}}` da `{{parent_version}}` — registrado em `docs/specs/features/{{feature}}/{{parent_version}}/_run/run-report.md` (linha {{origem_linha}}).

**Descrição original**: {{descricao}}

**Categoria**: `{{categoria}}` ({{severidade}})

**Classificação do especialista**: `{{classificacao_llm}}`
**Justificativa**: {{justificativa_llm}}
**Custo estimado**: ~{{custo_estimado_min}}min
**Risco de regressão**: `{{risco_regressao}}`

### 4.2 Correção

- [ ] {{correcao_sugerida}}

> Não há subtarefas adicionais. Cleanup é cirúrgico.

### 4.3 Guardrails de Execução

**DEVE**:

- Ler `docs/specs/features/{{feature}}/{{parent_version}}/_run/run-report.md` ao redor da linha {{origem_linha}} para entender o contexto original do débito.
- Aplicar a `correcao_sugerida` literalmente.
- Rodar a suíte completa de testes da feature antes de retornar a task como concluída.
- Reportar regressão imediatamente — NÃO tente "consertar a regressão também", isso vira refactor não autorizado.

**NÃO DEVE**:

- NÃO expandir escopo para "outros débitos parecidos no mesmo arquivo".
- NÃO refatorar funções/módulos não mencionados no débito.
- NÃO adicionar testes novos (suíte existente é o oráculo).
- NÃO alterar comportamento observável — se o cleanup mudar resposta de API/output de função, a correção está errada.

---

## 5. Testes

**N/A — task é cleanup técnico**. Não cria testes novos.

O Gate 1 (QA) DEVE executar a **suíte completa** da feature após a modificação. Comportamento esperado:

- ✅ Todos os testes existentes continuam passando.
- ❌ Qualquer teste regredindo → task rejeitada (sinal de que o débito carregava lógica relevante e não pode ser corrigido isoladamente).

Comando de teste: o canônico da stack, resolvido pela precedência de descoberta (rule `.claude/rules/testing-stack.md` → CLAUDE.md/rules → manifesto do projeto).

---

## 6. Notas / Observações

_Vazio. Tasks de débito não geram débito novo (seria meta-débito sem fim)._

> Se durante execução você identificar OUTROS débitos relacionados não listados, **NÃO os resolva** — registre em `docs/specs/features/{{feature}}/{{parent_version}}/_run/workflow-report.md` como nota e siga adiante. Eles entrarão numa eventual `v{{N+2}}-debits/`.

---

## 7. Checklist Final

- [ ] Correção aplicada exatamente como descrita em §4.2 — sem expansão de escopo
- [ ] Diff afeta APENAS o arquivo listado em §3.2
- [ ] Suíte completa passa sem regressão
- [ ] Gate 1 (QA) aprovou
- [ ] Staged para commit (git add pelo orquestrador)
