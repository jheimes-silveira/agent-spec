---
id: "conditional-gates"
title: "Gates Condicionais (requires_qa_revalidation)"
sidebar_position: 8
---
# Gates Condicionais — `requires_qa_revalidation`

Mecanismo **dinâmico** de skip de gate aplicado pelos orquestradores `*-run-tasks` durante o **loop de correção** após uma rejeição do Tech Review (Gate 2). Decide automaticamente se a próxima rodada de validação precisa **re-rodar QA** ou pode pular direto pro Tech Review.

> **Diferente do [Fast-path Gates](/advanced/fast-path-gates.html)**: fast-path é declarativo e estático (autor da task escreve `gates: [qa]` no frontmatter, válido pra task inteira). `requires_qa_revalidation` é **calculado em runtime** a cada rodada de correção, baseado nas categorias dos problemas que o Tech Review apontou.

---

## Por que existe

Quando o Tech Review rejeita uma task, o executor corrige e o ciclo se repete. Sem essa otimização, **TODA** rodada de correção re-roda QA + Tech Review, mesmo quando o Tech Review pediu apenas:

* Renomear variável, extrair constante, simplificar expressão sem mudar comportamento (`code_quality`).
* Adequar uma convenção do projeto — naming, estrutura, idioma, organização (`project_pattern`).
* Clean code localizado — extrair função, melhorar coesão (`best_practices`).

Re-rodar QA nesses casos **não muda nada testável** — só queima tokens e tempo. A classificação determinística filtra essas situações.

---

## Quando o algoritmo se aplica

::: danger 🚫 Regra
\* \*\*Rejeição do QA (Gate 1)\*\* → a próxima rodada \*\*SEMPRE re-passa pelo QA\*\* (o gate que reprovou precisa re-aprovar a correção). O algoritmo abaixo \*\*não\*\* se aplica — o campo `categoria` do JSON do QA serve para classificação de débito e auditoria, nunca para skip.
\* \*\*Rejeição do Tech Review (Gate 2)\*\* (`partial`/`rejected`) → aplique o algoritmo sobre `problems[]` do JSON do Tech Review para decidir se o re-QA pode ser pulado.
:::

---

## Categorias do JSON do Tech Review

O `agent-spec-staff-architecture-review` retorna **`problems[]`** (lista única) onde cada item tem `severity` (`critical|high|medium|low`) e `category`. Vocabulário canônico do TR e classificação:

| Categoria (TR) | Comportamento | Justificativa |
| --- | --- | --- |
| `architecture` | **revalidation\_required** | Mudança estrutural altera fluxo, dependências e contratos — refazer testes. |
| `security` | **revalidation\_required** | Correção de vulnerabilidade afeta lógica de validação/autorização — re-QA mandatório. |
| `technical_requirement` | **revalidation\_required** | Implementar requisito técnico faltante muda comportamento. |
| `testability` | **revalidation\_required** | Implica mudar/criar testes — QA precisa re-executar a suíte. |
| `error_handling` | **revalidation\_required** | Mudança em tratamento de erro altera fluxo de exceções e respostas. |
| `performance` | **revalidation\_required** | Otimização que muda algoritmo/estrutura pode quebrar casos limite. |
| `adr_compliance` | **revalidation\_required** | Conformidade com ADR pode exigir mudança estrutural — conservador. |
| `scope_deviation` | **revalidation\_required** | Remover mudança fora de escopo altera surface area. |
| `speculative_complexity` | **revalidation\_required** | Remoção de abstração/feature especulativa altera surface area e pode quebrar usos inadvertidos — conservador. Materializa a Iron Rule #2 da [Disciplina do Executor](/configuration/executor-discipline.html). |
| `code_quality` | code\_review\_only | Refactor sem mudança de comportamento (naming, legibilidade, magic numbers, duplicação local). |
| `project_pattern` | code\_review\_only | Adequar convenção do projeto (naming, estrutura, idioma, organização) sem mudar comportamento. |
| `best_practices` | code\_review\_only | Clean code localizado (extrair função, coesão) sem mudança de comportamento — correções que mudem a forma do diff são capturadas pelos overrides abaixo. |

> **Default conservador**: categoria desconhecida ou ausente → `revalidation_required = true`. Nunca pula QA por dúvida.

::: info 📝 Nota
O QA (Gate 1) tem vocabulário \*\*próprio\*\*, distinto do Tech Review (`logic`, `tests`, `data\_handling`, `naming`, `style`…). Esse vocabulário serve para classificação de débito e auditoria — \*\*não alimenta este algoritmo\*\*: quando a rejeição vem do QA, a próxima rodada sempre re-passa pelo QA.
:::

---

## Algoritmo de classificação

```
problemas\_corrigir = [p for p in problems[] if p.severity in (critical, high)]
para cada p em problemas\_corrigir:
se p.category está em revalidation\_required → return requires\_qa\_revalidation = true
se p.category está ausente/desconhecida → return requires\_qa\_revalidation = true (default conservador)
# Chegou aqui: TODOS os problemas bloqueantes estão em code\_review\_only
return requires\_qa\_revalidation = false
```

Determinístico. Basta **um** problema bloqueante em categoria `revalidation_required` para forçar re-QA.

> Médios/baixos **não entram no cálculo**: pela política débito-controlado eles não disparam loop de correção — viram débito anotado.

---

## Sinais adicionais (override)

Mesmo que o algoritmo retorne `false`, sinais externos podem **forçar** revalidação:

| Sinal | Origem | Efeito |
| --- | --- | --- |
| `tocou_area_critica == true` | Path em categoria sensível ([critical paths](/configuration/critical-paths.html)) | força `requires_qa_revalidation = true` |
| `qa_security_flags_not_empty` | JSON do QA da rodada anterior tem flags de segurança | força `requires_qa_revalidation = true` |
| `task_risk == "high"` | Frontmatter da task | força `requires_qa_revalidation = true` |
| `diff_stat_changed` | O patch sugerido pelo Tech Review adiciona/remove arquivos ou muda a forma do diff (`git diff --stat` muda nº de arquivos vs. iteração anterior) | força `requires_qa_revalidation = true` |

Os sinais sempre vencem a classificação por categoria — nunca relaxam, só endurecem.

---

## Aplicação no loop de correção

Após receber JSON do Tech Review com `status: rejected` ou `partial`:

1. Calcular `requires_qa_revalidation` (algoritmo + overrides).
2. Persistir o resultado na **memória lazy** (`shared.temp_memory.dir/{task_id}.md`) sob `requires_qa_revalidation:` + log do motivo.
3. Aplicar correção do executor.
4. **Próxima rodada de validação**:
   * `requires_qa_revalidation == true` → volta ao **Gate 1 (QA)** → depois Gate 2.
   * `requires_qa_revalidation == false` → **PULA Gate 1**, vai direto Gate 2.
5. Logar em [qa-observations.md](/observability/qa-observations.html) o caminho tomado e a contagem por categoria.

---

## Exemplo de log no orquestrador

```
[T7] Tech Review: rejected
problems bloqueantes: 3 high
categorias: [code\_quality×2, project\_pattern×1]
→ requires\_qa\_revalidation = false (todas em code\_review\_only)
→ próxima rodada: PULA QA, direto Gate 2
[T7] Executor (correção #2): aplicado em 4 linhas
[T7] Gate 2 (Tech Review): approved
[T7] git add ... ✓
```

E o caso oposto:

```
[T9] Tech Review: rejected
problems bloqueantes: 1 critical (security); +2 medium (code\_quality — débito anotado)
→ requires\_qa\_revalidation = true (security em revalidation\_required)
→ próxima rodada: Gate 1 (QA) → Gate 2
[T9] Executor (correção #2): aplicado
[T9] Gate 1 (QA): APROVADO testes 18/18
[T9] Gate 2 (Tech Review): approved
```

---

## Linha em `qa-observations.md`

```markdown
## 2026-04-30
- T7 — gate2 rejeitado | categorias=[code\_quality×2,project\_pattern×1]
requires\_qa\_revalidation=false → skip Gate 1 na correção
- T9 — gate2 rejeitado | categorias=[security×1,code\_quality×2]
requires\_qa\_revalidation=true (security) → re-QA na correção
- T9 — gate2 rejeitado #2 | categorias=[code\_quality×1]
override: qa\_security\_flags\_not\_empty → re-QA forçado
```

### Log de bloco completo (obrigatório após o post-mortem `cadastro-pratos-franquia`)

Além da linha curta acima, o orquestrador deve persistir bloco markdown completo a cada cálculo:

```markdown
### T7 — retry classification
- attempt: 2
- problemas\_por\_categoria: { architecture: 0, code\_quality: 2, project\_pattern: 1, adr\_compliance: 0 }
- overrides\_ativos: [tocou\_area\_critica: false, task\_risk: low, qa\_security\_flags: [], diff\_stat\_changed: false]
- requires\_qa\_revalidation: false
- decisao: PULE QA (próxima rodada vai direto a Tech Review)
- justificativa: "todos os problemas bloqueantes em code\_review\_only (code\_quality + project\_pattern)"
```
> **Por que log obrigatório**: o post-mortem `cadastro-pratos-franquia` (T10) levantou suspeita de que um retry só de convenção foi re-QA indevidamente. Sem o log bloco, era impossível distinguir bug do algoritmo de execução correta. Com o log, o eval pode validar cada decisão.

---

## O que NÃO muda

* **Primeira passagem**: QA sempre roda primeiro (exceto fast-path `gates: none` ou `[]`). `requires_qa_revalidation` só atua a partir do **segundo** ciclo de validação.
* **Contador de tentativas (3 totais)**: continua compartilhado entre QA + Tech Review. Pular QA economiza tokens, **não** tentativas.
* **Hard stop**: ao atingir 3 tentativas, task vai para `Bloqueada`, independente do caminho.

---

## Por que economizar QA aqui é seguro

Correções estritamente de code-review (renomear, extrair função sem mudar comportamento, adequar convenção) **não alteram o comportamento testado pelo QA**. A suíte de testes do QA seguiria passando idêntica. Re-rodar é puro custo.

A classificação é **conservadora por construção**:

* Default `true` em qualquer dúvida.
* 9 categorias forçam re-QA, apenas 3 permitem skip.
* 4 sinais de override podem reverter um skip → re-QA.
* Rejeição do QA nunca entra no algoritmo — sempre re-QA.

Probabilidade de skip indevido é baixíssima; mesmo se ocorrer, o Tech Review subsequente captura.

---

## Próximos passos

* [Fast-path Gates](/advanced/fast-path-gates.html) — skip estático declarativo (campo `gates:`).
* [Gates e Loops](/concepts/gates-loops.html) — fluxo completo dos gates.
* [Auto-escalação](/advanced/auto-escalation.html) — escalação de modelo em retry.
* [QA Observations](/observability/qa-observations.html) — onde a decisão é auditada.
* [Memória Temporária](/configuration/temp-memory.html) — onde `requires_qa_revalidation` é persistido.
