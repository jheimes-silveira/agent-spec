# Prompt do Gate 2 — agent-spec-staff-architecture-review (FASE 4)

> **⚠️ ANTIDRIFT — seção espelhada entre frameworks**: o conteúdo de gates/loops deste arquivo é ESPELHO do equivalente em `agent-spec-sdd-run-tasks/SKILL.md` (Gate 2/Passos 6-10) e `agent-spec-taskcard-run/SKILL.md` (Passo 5 + Passo 6) — difere apenas em paths e numeração de seções. **Toda alteração DEVE ser replicada nos espelhos no mesmo PR.** Histórico: a divergência entre os 3 frameworks já produziu políticas contraditórias (zero-débito vs débito-controlado) — auditoria de jun/2026.

> Referência consumida por `SKILL.md` da skill `agent-spec-minispec-run-tasks`.
> Leia este arquivo **antes de invocar o Gate 2** (FASE 4.2).
> Contém o prompt completo do `agent-spec-staff-architecture-review` e os passos de preparação (4.1, 4.2, 4.3, 4.4, 4.5, 4.6).
> Use exatamente o texto da seção "Disparar o Tech Review" como `prompt` no `Agent({...})`.
>
> **Pré-requisito de leitura**: [`config.md`](config.md) — necessário para resolver `tech_model` (regras de escalação `agent-spec-staff-architecture-review`) e os campos de `qa_summary_fields` (sumário mínimo do QA). Leia `config.md` **antes** deste arquivo se ainda não o fez.

---

## FASE 4 — Gate 2 — Tech Review (agent-spec-staff-architecture-review)

> **Pré-verificação**: se `gates: [qa]` → PULE este gate; marque concluída após QA aprovar.
>
> O Tech Review **NÃO re-executa testes** salvo se: `executou_testes: false` OU `escopo_testes: "NAO_EXECUTADO"`, OU (`escopo_testes: "PARCIAL"` E `tocou_area_critica: true`), OU se detectar violação `CRITICO` em `architecture`/`security`.

### 4.1 Preparar contexto para o Tech Review

O agente staff **gera os diffs por conta própria** via Bash (`git diff <base_sha> -- <path>` por arquivo). O orquestrador NÃO mais executa `git diff` para captura — apenas prepara setup de estado.

#### 4.1.1 Visibilidade git dos paths NOVOS

1. Use `base_sha` da variável em memória (capturado em 2.1).
2. Colete `task_paths`: arquivos criados + modificados + arquivos de teste da task.
3. **Intent-to-add para untracked**: o `git add -N -- <task_paths>` **JÁ rodou na FASE 2.4** (pós-executor, pré-QA — é o que torna NOVOS visíveis no `git diff` desde o Gate 1). Confirme idempotentemente (re-rodar é inofensivo; ignore erros de paths já adicionados). Nenhuma outra operação git do orquestrador no Gate 2.

#### 4.1.2 Sumário mínimo do QA

Extraia do JSON completo do QA (preservado em 3.3) **APENAS os campos** de `qa_summary_fields`:

```json
{
  "veredito": "APROVADO|APROVADO_COM_OBSERVACOES",
  "security_flags": [...],
  "executou_testes": true|false,
  "escopo_testes": "SUITE_COMPLETA|PARCIAL|NAO_EXECUTADO",
  "tocou_area_critica": true|false,
  "escopo_declarado": {
    "fonte": "task_secao_arquivos|ausente",
    "arquivos_a_criar_faltantes": [],
    "arquivos_a_modificar_faltantes": [],
    "subtasks_sem_evidencia": []
  }
}
```

> O campo `escopo_declarado` vem da Camada 0 do QA (Completude de Escopo Declarado). Tech Review usa para confirmar que entregáveis estruturais não ficaram faltando. Se QA aprovou mas `escopo_declarado.fonte == "ausente"`, Tech Review precisa fazer a checagem de presença ele mesmo (ver agente).

> NÃO envie `problemas[]`, `criterios_falhos[]` nem o restante do JSON do QA no prompt do staff. O agente gera o diff por conta própria; o sumário cobre a metadata.

#### 4.1.3 Categorizar paths (NOVOS vs MODIFICADOS)

Use a estrutura da task como fonte autoritativa:
- **NOVOS** = arquivos declarados como criados na task + arquivos de teste novos.
- **MODIFICADOS** = arquivos declarados como alterados + arquivos de teste pré-existentes alterados.

Identifique adicionalmente **paths em área crítica**: cruze `task_paths` com os globs de `critical_paths` (ver `references/config.md`) e liste à parte para sinalizar releitura recomendada ao staff.

NÃO execute `git diff` para categorizar — a categorização vem da task.

### 4.2 Disparar o Tech Review

Resolva `tech_model` (ver `references/config.md` §4 da Lógica de Seleção de Modelo).

```
Agent(
  subagent_type = "agent-spec-staff-architecture-review",
  model         = tech_model,            # sonnet | opus
  description   = "Tech Review task TN",
  prompt        = <prompt abaixo>
)
```

Prompt:

```
Realize a revisão técnica da task [ID] - [Nome da Task].

## Sumário do QA Validator (input metadata)
```json
[colar sumário mínimo extraído em 4.1.2 — APENAS os campos de qa_summary_fields]
```

## base_sha
[SHA capturado pelo orquestrador em 2.1]

## Sumário do executor (intenção)
[output enxuto de 4-6 linhas retornado pelo executor em 2.3]

## Como gerar os diffs (você mesmo executa via Bash)
Para cada path em "Arquivos NOVOS" + "Arquivos MODIFICADOS", rode em paralelo:
```bash
git diff <base_sha> -- <path>
```
- NOVOS: o diff retorna o conteúdo completo do arquivo — NÃO releia via Read.
- MODIFICADOS: o diff retorna apenas hunks alterados — Read sob demanda se contexto adjacente não bastar.
- NÃO use `--stat`, `..HEAD`, ou pipes para `head/tail`. Veja a seção FLUXO DE DIFF no seu contrato.

## Contexto da Task
- **Objetivo**: [conteúdo da task]
- **Critérios de Conclusão**: [critérios]

## Arquivos NOVOS (criados nesta task — `git diff` retorna conteúdo completo, NÃO releia via Read)
[lista de paths criados]

## Arquivos MODIFICADOS (alterados nesta task — diff retorna hunks parciais, Read sob demanda)
[lista de paths alterados]

## Arquivos em área crítica (releitura recomendada pelo staff)
[lista de paths em `critical_paths` que aparecem na task — pode estar vazia]

## Arquivos de Referência (para comparação de padrões — leia sob demanda)
[lista de arquivos de referência, se aplicável]

## Documentos de Referência (consultar sob demanda)
- Task completa: [path resolvido via minispec.tasks.dir + minispec.tasks.pattern]
- SCOPE: [path resolvido via minispec.scope.path]
- INTENT: [path resolvido via minispec.intent.path]

## ADRs
Consulte [path resolvido via adr.index_file] e leia ADRs específicas relacionadas aos paths tocados.

## Memória de retry (APENAS quando attempt_count >= 1 — omita o bloco na 1ª tentativa)
Leia [path resolvido via shared.temp_memory.dir + shared.temp_memory.pattern] — contém o histórico de rejeições/correções desta task. Compare o diff atual contra os problemas anteriores: correção que apenas contorna o gate (teste enfraquecido/removido, flag invertida) → CRITICO/testability.

Valide (sobre o que mudou nos diffs que você gerar):
1. Conformidade arquitetural (camadas, fluxo de dependência, separação de responsabilidades)
2. Boas práticas de desenvolvimento (clean code, coesão, acoplamento, complexidade)
3. Qualidade de código (nomenclatura, legibilidade, duplicação, gambiarras)
4. Aderência aos padrões do projeto (convenções, nomenclatura, estrutura, `.claude/rules/*`)
5. Conformidade com ADRs relevantes (violação clara = CRITICO; desvio sem justificativa = ALTO)
6. Segurança profunda (IDOR, escalação, fluxos de token, exposição estrutural)
7. Testes: padrões de projeto e anti-gaming via diff (remoção/enfraquecimento de teste, violação de seam) — qualidade fina (asserções/determinismo/antipadrões) é do QA, não re-audite
8. Riscos técnicos

NÃO re-execute a suíte de testes salvo nas 3 condições do seu contrato: (1) `executou_testes: false` OU `escopo_testes: "NAO_EXECUTADO"`; (2) `escopo_testes: "PARCIAL"` E `tocou_area_critica: true`; (3) violação `CRITICO` em `architecture`/`security` com risco de regressão sistêmica.
```

### 4.3 Interpretar o resultado do Tech Review

| Status | Significado | Ação |
|---|---|---|
| `APROVADO` | 0 problemas | Avançar para **4.5 (stage)** → marcar `Concluído` na task e no `task_plan.md` |
| `APROVADO_COM_OBSERVACOES` | Só `BAIXO` | Avançar para **4.5 (stage)** → marcar `Concluído`; **acumular os baixos** para a **§2 do snapshot `_run/run-report.md`** (um bloco `### D{n} · {severity} · {category} · T[N] · Tech Review` com `Onde`=`[arquivo]:[linha]`, `Problema`=`title`, `Impacto`=`description`, `O que fazer`=`suggested_fix` — formato em `agent-spec-workflow-rules.md`) |
| `PARCIAL` | ≥ 1 `ALTO` e/ou `MEDIO` (sem `CRITICO`) | Enviar críticos+altos+médios ao executor (4.4); baixos viram débito anotado |
| `REJEITADO` | ≥ 1 `CRITICO` | Enviar críticos+altos+médios ao executor (4.4); baixos viram débito anotado |
| `PULADO_QA_REJEITOU` | TR invocado com QA reprovado | Erro de orquestração: logue em `shared.workflow_report.path` e volte ao loop de correção do QA (3.5) |

> **Débito-controlado**: críticos/altos/médios bloqueiam; só os baixos são anotados (na §2 do `_run/run-report.md`) e não impedem a conclusão da task.
>
> **Auditoria de ADRs**: registre `adrs_consultadas[]` do JSON do TR em `shared.workflow_report.path` (`T[N] — TR consultou: ADR-0001, ADR-0004` ou `nenhuma`). Sem esse log, ADR ignorada é indetectável.

### 4.4 Loop de correção Tech Review (memória lazy)

Se Tech Review reprovou:

1. **Atualize a memória lazy** (crie se ainda não existe do 3.5):
   ```markdown
   ## JSON Tech Review
   ```json
   [JSON completo de 4.2]
   ```
   ```

2. **Extraia os problemas — política débito-controlado**:
   - `problems[]`: `id`, `severity`, `category`, `title`, `description`, `expected`, `impact`, `suggested_fix`, `adr_referenciada`
   - **Bloqueantes**: `severity` `CRITICO`, `ALTO` ou `MEDIO`. **Débito anotado**: `BAIXO` — entram no prompt como "Observações".
   - **Acumule AGORA os baixos para a §2 do snapshot `_run/run-report.md`** (um bloco `### D{n} · {severity} · {category} · T[N] · Tech Review` por problema, com `Onde`=`[arquivo]:[linha]`, `Problema`=`title`, `Impacto`=`description`, `O que fazer`=`suggested_fix`; `arquivo`/`linha`/`suggested_fix` vêm do próprio item em `problems[]` — não os descarte: são o que permite à `/agent-spec-debt-resolution` gerar tasks de cleanup sem reinferir paths) — o prompt de correção afirma que eles "já estão anotados"; este é o passo que garante isso. O snapshot é reescrito ao fechar a task (FASE 5).

3. **Monte o prompt de correção**:

   ```
   A task [ID] foi REPROVADA pela Revisão Técnica. Leia a memória lazy em [path do arquivo].

   ## Problemas Bloqueantes (DEVEM ser corrigidos — política débito-controlado)
   [Para cada problema com severity == CRITICO, ALTO OU MEDIO:]
   - **[P1] ([severity]) [category]**: [title]
     - Descrição: [description]
     - Esperado: [expected]
     - Impacto: [impact]
     - Correção sugerida: [suggested_fix]
     - ADR referenciada: [adr_referenciada se aplicável]

   ## Observações (baixos — débito anotado, opcional corrigir agora)
   [Para cada problema com severity == BAIXO:]
   - **[P_]** ([severity]) [category]: [title] — [suggested_fix]

   Corrija OBRIGATORIAMENTE os críticos, altos e médios da seção "Bloqueantes". Os baixos da seção "Observações" são débito anotado: corrija se for trivial no mesmo escopo; caso contrário, deixa para cleanup futuro (já anotados na §2 do _run/run-report.md pelo orquestrador). Mantenha a conformidade com a arquitetura e padrões do projeto. Não expanda escopo.

   Para CADA problema bloqueante, antes de editar escreva uma linha `CAUSA-RAIZ: <por que o código violava o padrão/arquitetura>`. Correção que apenas faz o gate passar sem atacar a causa — renomear superficialmente, mover código sem resolver o acoplamento, suprimir o sintoma — será RE-REPROVADA. Se algum problema já havia sido reprovado na tentativa anterior, a correção anterior foi insuficiente — ataque a origem, não o sintoma.

   Arquivos a corrigir:
   [lista de arquivos dos problemas]
   ```

4. **Classifique `requires_qa_revalidation`** aplicando a regra "Tech Review Correction — Classificação `requires_qa_revalidation`" de `.claude/rules/agent-spec-workflow-rules.md`:
   - Olhe `category` de cada item **bloqueante** (`severity` `CRITICO`/`ALTO`) em `problems[]`.
   - Se TODOS estão em categorias `code_review_only` (`code_quality`, `project_pattern`, `best_practices`) → `requires_qa_revalidation = false`.
   - Se QUALQUER item está em `revalidation_required` (`architecture`, `security`, `technical_requirement`, `testability`, `error_handling`, `performance`, `adr_compliance`, `scope_deviation`, `speculative_complexity`) ou categoria desconhecida/ausente → `requires_qa_revalidation = true`.
   - Aplique overrides (`tocou_area_critica`, `qa_security_flags_not_empty`, `task_risk == high`, mudança no `git diff --stat`) — qualquer um força `true`.
   - Persista `requires_qa_revalidation: <bool>` na memória lazy junto com a justificativa (categorias encontradas + overrides ativos).
5. **Dispare o executor** com prompt de correção (escale modelo se aplicável).
6. **Re-valide conforme `requires_qa_revalidation`**:
   - **`true`** → primeiro Gate 1 — QA (3.3) → se QA aprovar, Gate 2 — Tech Review (4.2).
   - **`false`** → **PULE QA**, vá direto a Gate 2 — Tech Review (4.2). Logue em `shared.workflow_report.path`: `T[N] retry — QA pulado (categorias code_review_only: <lista>)`.
7. **Limite máximo: 3 tentativas TOTAIS** por task (compartilhado entre QA e Tech Review).
8. **Ao aprovar final**: delete a memória lazy `T{N}.md`.

### 4.5 Stage da task aprovada (`git add`)

**Apenas quando Tech Review retornou `status: "APROVADO"`**:

1. **Coletar a mesma `task_paths`** usada no diff de 4.1.
2. **Stage real**: `git add -- <task_paths>` (substitui o `git add -N` por adição definitiva).
3. **NÃO commitar** — o usuário decide quando agrupar tasks num commit.
4. **Logar** em `shared.workflow_report.path`: `T[N] — staged: [lista de paths]`.

> Por que stage real ao final: o stage marca o trabalho aprovado para o commit do usuário — ele **NÃO move o HEAD nem reseta baseline** (só commit faz isso). O isolamento entre tasks vem do **filtro por paths** no `git diff <base_sha> -- <paths>`. Overlap real de paths entre tasks é raro (geralmente erro de planejamento) — nesse caso o usuário precisará commitar entre as tasks para resetar a baseline.
>
> Tasks `gates: [qa]` ou `gates: none` **não passam por este passo** (Gate 2 pulado) — o stage delas acontece no fechamento da task (FASE 5, passo 0, da SKILL.md).

**Erro no `git add`** (path inválido, etc.): NÃO falhe a task — registre em `shared.workflow_report.path` como observação não-bloqueante.

### 4.6 Escalar ao usuário (após 3 tentativas)

Se após 3 tentativas totais o QA ou Tech Review ainda reprovar:

1. **NÃO marque a task como concluída.**
2. **Marque como `Bloqueado`** no arquivo da task e no `task_plan.md`.
   - **Propague o bloqueio**: toda task dependente (direta ou transitiva) da bloqueada vira `Bloqueado (dependência T{N})` e sai da fila de prontas — nunca execute task cuja dependência falhou.
3. **Informe ao usuário** com o relatório completo:
   - Qual task está bloqueada
   - Quantas tentativas foram feitas
   - Quais problemas persistem (extrair do último JSON do QA e/ou Tech Review)
   - Qual gate está bloqueando (QA, Tech Review ou ambos)
   - Sugestão de ação
4. **Pergunte ao usuário** como proceder antes de continuar.
