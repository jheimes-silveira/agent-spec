# Prompt do Gate 1 — agent-spec-qa-validator (FASE 3.3)

> **⚠️ ANTIDRIFT — seção espelhada entre frameworks**: o conteúdo de gates/loops deste arquivo é ESPELHO do equivalente em `agent-spec-sdd-run-tasks/SKILL.md` (Gate 1/Passos 1-5) e `agent-spec-taskcard-run/SKILL.md` (Passo 4 + Passo 6) — difere apenas em paths e numeração de seções. **Toda alteração DEVE ser replicada nos espelhos no mesmo PR.** Histórico: a divergência entre os 3 frameworks já produziu políticas contraditórias (zero-débito vs débito-controlado) — auditoria de jun/2026.

> Referência consumida por `SKILL.md` da skill `agent-spec-minispec-run-tasks`.
> Leia este arquivo **antes de invocar o Gate 1** (FASE 3.3).
> Contém o prompt completo do `agent-spec-qa-validator` e os passos de preparação (3.1, 3.2, 3.3, 3.4, 3.5).
> Use exatamente o texto da seção "Disparar o QA" como `prompt` no `Agent({...})`.
>
> **Pré-requisito de leitura**: [`config.md`](config.md) — necessário para resolver `qa_model` (regras de escalação `agent-spec-qa-validator`) e os campos de `qa_summary_fields`. Leia `config.md` **antes** deste arquivo se ainda não o fez.

---

## FASE 3 — Gate 1 — QA (agent-spec-qa-validator)

> **Único gate que executa testes.**
>
> **Pré-verificação**: se `gates: none` → não invoque QA. Se `gates: [qa]` ou `[qa, tech_review]` → siga.

### 3.1 Preparar arquivos para o QA (lista enxuta)

Inclua:
- **Task implementada** (path via `minispec.tasks.dir` + `minispec.tasks.pattern`)
- **Arquivos REALMENTE tocados** pelo executor: rode VOCÊ (orquestrador) `git diff --name-only <base_sha>` e use essa lista como autoritativa — o QA é proibido de rodar git. NÃO monte a lista apenas das seções declaradas da task (isso tornaria a Camada 0 circular). Em `instrucoes`, declare: "A lista `arquivos` reflete o `git diff --name-only` real da task — use-a como fonte de 'tocados' na Camada 0."
  - **Filtro de resíduo de tasks anteriores**: o stage das tasks aprovadas NÃO move o HEAD — se uma task anterior foi staged sem commit do usuário, os arquivos dela aparecem no diff desta. **Subtraia da lista** os paths staged por tasks anteriores no mesmo run (registrados nos logs de stage), EXCETO os que esta task também declara nas suas seções de arquivos (overlap legítimo). Sem o filtro, a lista "tocados pela task" mente para a Camada 0 e o QA gasta leitura em arquivos de outra task.
  - **Pré-requisito (FASE 2.4)**: o `git add -N -- <task_paths>` JÁ deve ter rodado após o executor. Sem ele, arquivos **novos** (untracked) não aparecem no `git diff --name-only` e a Camada 0 reportaria `arquivos_a_criar_faltantes` falsamente. Se a lista vier sem nenhum dos arquivos declarados em "a Criar", suspeite de `git add -N` faltante ANTES de despachar o QA — rode-o e refaça o diff.
- **Arquivos de teste** criados/modificados (padrão da stack)
- **`design.md` da feature** (via `design.feature.path`) — **apenas** se a task é de camada UI e o referencia como arquivo de referência: é o contrato visual que o QA usa na Camada 4 (Completude) para validar os estados visuais implementados. Junto com o `design.md`, inclua também o `design-system.md` global (via `design_system.global.path`) **se existir** — padrões canônicos do produto que o design da feature pode referenciar sem repetir (precedência de leitura: global → feature).

> `base_sha` e `executor_summary` viajam **inline em `instrucoes`** (3.2), não em `arquivos[]`.

**NÃO inclua** (evita duplicar contexto e tokens):
- `CLAUDE.md` e `.claude/rules/*.md` (já no contexto do subagente)
- SCOPE e INTENT completos — passe apenas os **paths** em `instrucoes` como referência opcional (o QA consulta sob demanda se precisar)

### 3.2 Preparar `instrucoes` para o QA

1. **ID e nome** da task (contexto)
2. **Contexto da execução** (inline — substitui o execution-summary):
   ```
   - base_sha: <SHA capturado em 2.1>
   - Sumário do executor:
     <output enxuto de 4-6 linhas retornado pelo executor>
   ```
3. **Critérios de conclusão** da task — o QA valida CADA critério
4. **Testes definidos** na task — o QA executa e verifica
5. **Rastreabilidade de testes (BLOQUEANTE)**: lista de IDs (CT-01, CT-02, ...) da seção de Testes. Instrução literal:
   > "Cada CT DEVE ter teste correspondente implementado no código. Testes ausentes/vazios/skip/todo para CTs exigidos = REJEITADO na camada COMPLETUDE."
6. **Comando de teste**: o QA resolve pela precedência de descoberta de stack — (1) rule `.claude/rules/testing-stack.md` se existir; (2) CLAUDE.md/rules; (3) manifest do projeto (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `pubspec.yaml`, `pom.xml`, `build.gradle`, etc.), scripts e CI — e executa o canônico.
7. **Caminhos de referência opcionais**: `minispec.scope.path` e `minispec.intent.path` — consulta sob demanda. Se a task referencia o `design.md`, instrua: "Estados visuais (loading/erro/vazio/sucesso) devem corresponder ao especificado no design.md — divergência é problema de COMPLETUDE."
8. **Economia de Leitura**: "Não leia arquivos desnecessários ao escopo desta task."

### 3.3 Disparar o QA

Resolva `qa_model` (ver `references/config.md` §4 da Lógica de Seleção de Modelo):

```
Agent(
  subagent_type = "agent-spec-qa-validator",
  model         = qa_model,             # sonnet | opus
  description   = "QA validar task TN",
  prompt        = <prompt abaixo>
)
```

Prompt:

```
Você foi invocado com os seguintes parâmetros:

1. **arquivos**: [lista de caminhos preparada em 3.1]
2. **instrucoes**: [conteúdo preparado em 3.2]

OBRIGATÓRIO: Antes de produzir o JSON final:

1. Leia (Read) a doutrina de testes — `.claude/skills/agent-spec-testing-best-practices/SKILL.md` e `.claude/skills/agent-spec-testing-best-practices/references/antipadroes.md` — e aplique a Camada 5 (Qualidade dos Testes) usando o checklist de antipadrões. Cada antipadrão detectado em arquivos de teste tocados pela task vira um item em `problemas.*` com o campo `smell` preenchido (nome canônico). Severidade do antipadrão determina veredito conforme política débito-controlado (críticos/altos/médios bloqueiam; só baixos viram observações). Popule também `testing_smells.red_flags_detectadas[]`, `mock_budget_violado` e `determinismo_observado`.

2. **Aplique a Camada 6 (ADR Compliance Light)** — leia [path resolvido via `adr.index_file` — default `docs/adr/INDEX.md`] (ou liste o diretório `adr.dir`), identifique ADRs ativas grep-detectáveis e cruze com os arquivos tocados pela task. Violações claras viram `problemas.*` com `categoria: "adr_compliance"`. Popule `adr_compliance.violacoes_grep_detectaveis[]`.

3. **Detecte duplicatas semânticas (AP-26)** — para cada par de testes nos arquivos tocados, compare tupla `(test_name_normalizado, alvo_chamado, parametros_chave, resultado_esperado)`. Coincidência em ≥ 3 dos 4 campos sem justificativa → reporte como `MÉDIO` em `problemas.medios[]` com `categoria: "code_quality"`. Não confundir com table-driven (UM teste parametrizado é OK).

4. **Categoria obrigatória** em cada item de `problemas.*` — usar valores canônicos da rule `.claude/rules/agent-spec-workflow-rules.md` (`architecture`, `security`, `tests`, `logic`, `data_handling`, `error_handling`, `performance`, `concurrency`, `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`, `adr_compliance`). Default conservador → `revalidation_required` quando incerto.
```

**IMPORTANTE**: preserve o JSON completo retornado pelo QA. Será usado:
- Sumário mínimo → input do Tech Review (4.2)
- Em rejeição → memória lazy (3.5)

### 3.4 Interpretar o resultado do QA

> **Política débito-controlado**: bloqueia o que é risco real ou débito que merece correção (críticos, altos e médios); anota apenas o débito trivial de manutenibilidade (baixos). O loop de correção dispara quando há crítico, alto ou médio. Só os baixos viajam adiante anotados na §2 do `_run/run-report.md` para cleanup futuro.

| Veredito | Críticos+Altos+Médios | Baixos | Ação |
|---|---|---|---|
| `APROVADO` | 0 | 0 | QA aprovado → avançar para Gate 2 |
| `APROVADO_COM_OBSERVACOES` | 0 | ≥ 1 | QA aprovado com débito anotado → avançar para Gate 2; **acumular os baixos** para a **§2 do snapshot `_run/run-report.md`** (um bloco `### D{n} · {severidade} · {categoria} · T[N] · QA` com `Onde`=`[arquivo]:[linha]`, `Problema`=`titulo`, `Impacto`=`descricao`, `O que fazer`=`correcao_sugerida` — formato em `agent-spec-workflow-rules.md`) |
| `REJEITADO` | ≥ 1 | qualquer | Enviar críticos+altos+médios como bloqueantes ao executor (3.5); baixos como observações opcionais |

> **Sinal `stack_discovery.discovery_needed: true`** (não afeta veredito): o QA não resolveu um detalhe **não-derivável do código** (ex.: framework E2E não padronizado, política de cobertura). Recomende ao usuário rodar **`/agent-spec-testing-stack-bootstrap`** — ele descobre a stack do código, pergunta só o não-derivável e gera `.claude/rules/testing-stack.md`. A partir daí o QA resolve a stack automaticamente. Não bloqueie o pipeline por esse sinal.

### 3.5 Loop de correção QA (memória lazy)

Se rejeitado:

1. **Monte/atualize a memória lazy** no path via `shared.temp_memory.dir` + `shared.temp_memory.pattern` (ex.: `docs/specs/features/{feature}/{version}/_run/tmp/T1.md`):

   ```markdown
   # Memória temporária — T[N]
   > Criada em [timestamp]. Deletada ao aprovar; expira em 24h.

   ## attempt_count
   [N — número de rejeições até agora; 1ª rejeição grava 1. Ver "Semântica de tentativas" em config.md]

   ## base_sha
   [SHA capturado em 2.1 — permite retomar gates após interrupção sem recapturar HEAD]

   ## last_severity
   [BAIXO|MEDIO|ALTO|CRITICO — do último JSON. Normalização do array do QA: criticos→CRITICO, altos→ALTO, medios→MEDIO, baixos→BAIXO]

   ## Sumário do executor
   [output enxuto de 4-6 linhas que o executor produziu]

   ## JSON QA Validator
   ```json
   [JSON completo do 3.3]
   ```

   ## Arquivos tocados (`git diff --stat`)
   [saída de `git diff <base_sha> --stat`]

   ## Paths
   - Criados: [lista]
   - Modificados: [lista]
   - Testes: [lista]
   ```

2. **Extraia os problemas do JSON do QA — política débito-controlado**:
   - **Bloqueantes**: `problemas.criticos[]` + `problemas.altos[]` + `problemas.medios[]` (titulo, descricao, arquivo, linha, correcao_sugerida)
   - **Débito anotado**: `problemas.baixos[]` — entram no prompt como "Observações" (corrigir é opcional); os que não forem corrigidos DEVEM ser acumulados para a §2 do snapshot `_run/run-report.md` ao fechar o loop
   - `observacoes[]`
   - `testes_executados.detalhes_falhas[]`
   - `criterios_falhos[]` (CAs com `status` `FALHOU` ou `PARCIAL`)

   > **Débito-controlado** (mesma política da interpretação do veredito): críticos/altos/médios bloqueiam e DEVEM ser corrigidos; só os baixos são débito anotado — não impedem a aprovação.

3. **Aplique auto-escalonamento de modelo** (ver `references/config.md` §3 da Lógica de Seleção). Logue se escalou.

4. **Monte o prompt de correção** para o executor:

   ```
   A task [ID] foi REJEITADA pelo QA. Leia a memória lazy em [path do arquivo] antes de corrigir.

   ## Problemas Bloqueantes (DEVEM ser corrigidos — política débito-controlado)
   [Para cada problema de problemas.criticos[], problemas.altos[] e problemas.medios[]:]
   - **[Pn]** ([critico|alto|medio]): [titulo]
     - Arquivo: [arquivo]:[linha]
     - Descrição: [descricao]
     - Correção sugerida: [correcao_sugerida]

   ## Testes que Falharam
   [lista de detalhes_falhas]

   ## Critérios de Aceite não Atendidos
   [lista com status FALHOU ou PARCIAL]

   ## Observações (baixos — débito anotado, opcional corrigir agora)
   [Para cada problema de problemas.baixos[] — listagem compacta:]
   - **[Pn]** (baixo): [titulo] — [correcao_sugerida]

   Corrija OBRIGATORIAMENTE os bloqueantes (críticos, altos e médios), os testes que falharam e os critérios não atendidos. Os baixos da seção "Observações" são débito anotado: corrija se for trivial no mesmo escopo; caso contrário, deixe para cleanup futuro (serão anotados na §2 do _run/run-report.md). Não expanda escopo.

   Para CADA problema bloqueante, antes de editar escreva uma linha `CAUSA-RAIZ: <por que o teste ou o código estava errado>`. Correção que apenas faz o gate passar sem atacar a causa — inverter uma flag, enfraquecer a asserção, renomear — será RE-REPROVADA. Se o problema é asserção fraca, mock-driven ou teste oco: reescreva a asserção para validar o comportamento observável real (não ajuste o valor do mock nem inverta booleanos). Se algum problema já havia sido reprovado na tentativa anterior, a correção anterior foi insuficiente — ataque a origem, não o sintoma.

   Após corrigir, execute os testes para garantir que passam.

   Arquivos a corrigir:
   [lista de arquivos dos problemas]
   ```

5. **Dispare o executor** com `effective_model` (escalado se aplicável).
6. **Re-valide com o QA** (volte ao 3.3). Atualize `attempt_count` e `last_severity` na memória lazy. **Em retry, anexe às `instrucoes` do QA**: (a) o path da memória lazy (`shared.temp_memory.dir` + `pattern`); (b) resumo da tentativa anterior — testes que falharam + asserções/smells citados nos problemas. Instrução literal ao QA: "Compare contra a tentativa anterior: teste que existia e sumiu, ou asserção que ficou mais frouxa sem justificativa `SUT_IS_CORRECT_BECAUSE:`, é AP-24 (weakening test to pass) → CRÍTICO."
7. **Limite máximo: 3 tentativas TOTAIS** por task (compartilhado com Tech Review — 4.4).

**Ao fechar o loop com aprovação**: acumule para a §2 do snapshot `_run/run-report.md` os baixos remanescentes do último JSON do QA que NÃO foram corrigidos (um bloco `### D{n} · {severidade} · {categoria} · T[N] · QA` por problema, com `Onde`=`[arquivo]:[linha]`, `Problema`=`titulo`, `Impacto`=`descricao`, `O que fazer`=`correcao_sugerida`; `arquivo`/`linha`/`correcao_sugerida` vêm do próprio problema no JSON — não os descarte: alimentam as tasks de cleanup da `/agent-spec-debt-resolution`) — o caminho "REJEITADO → corrigido → aprovado" não passa pelo registro automático do veredito `APROVADO_COM_OBSERVACOES`. (Médios já não chegam aqui como débito: foram corrigidos no loop.)

**Ao aprovar os gates APLICÁVEIS** (só QA quando `gates: [qa]`): delete a memória lazy `T{N}.md` (se foi criada por rejeição) — `cleanup_on_approval: true`. **Não há mais execution-summary em disco** (substituído por inline no prompt — ver 2.4 da SKILL.md).
