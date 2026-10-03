---
id: "agent-spec-taskcard-run"
title: "agent-spec-taskcard-run"
sidebar_position: 2
---
# agent-spec-taskcard-run

`TaskCard` `Orchestrator`
> **Resumo**: Executa uma TaskCard com gates QA + Tech Review. Coordenador de subagentes — orquestra, **não** implementa diretamente. Difere dos `*-run-tasks` SDD/miniSpec porque processa **uma única TaskCard** por invocação (não um task_plan).

Detalhes operacionais em [Pipeline — agent-spec-taskcard-run](../../pipeline/taskcard-run.md).

---

## Quando usar

* Após `task-{nn}-{slug}.md` gerado em [agent-spec-taskcard-generate](taskcard-generate.md).
* Para executar uma única task pontual com gates ativos.

## Quando NÃO usar

* Múltiplas tasks com dependências → use [agent-spec-minispec-run-tasks](../minispec/minispec-run-tasks.md) ou [agent-spec-sdd-run-tasks](../sdd/sdd-run-tasks.md).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho da TaskCard (`task-{nn}-{slug}.md`) | Usuário (argumento) | Sim |
| `agent_name` (executor da stack) | Usuário (argumento) | Não — se ausente, descoberta interativa via `AskUserQuestion` |
| Repositório git inicializado | Pré-requisito | Sim |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path | Quando |
| --- | --- | --- |
| Código implementado (stage real via `git add`) | Repositório | Fechamento (Passo 5.5) — quando os gates **aplicáveis** aprovaram (`approved`/`approved_with_observations`; só QA para `[qa]`; pós-executor para `none`) |
| `Status` na seção 1 da TaskCard (e linha do `task_plan.md`, se existir) | `taskcard.tasks.*` / `taskcard.task_plan.path` | `Em Progresso` (Passo 1.12) → `Concluído` (Passo 5.5.5) ou `Bloqueado` (Passo 6.1) |
| `qa-observations.md` | `shared.qa_observations.path` | Auto-escalações e tasks bloqueadas |
| `base_sha` + sumário do executor | em memória do orquestrador (inline no prompt dos gates) | Após executor concluir; sem arquivo em disco |
| `TC-{nn}.md` (memória lazy) | `shared.temp_memory.dir` | Apenas em rejeição |

> O `{task_id}` para TaskCard usa o ID do frontmatter (ex.: `TC-001`). Logo: `docs/specs/features/<feature>/<v>/tasks/.tmp/TC-001.md` (lazy, só em rejeição).

---

## Diferenças vs agent-spec-sdd-run-tasks / agent-spec-minispec-run-tasks

| Aspecto | `agent-spec-taskcard-run` | `*-run-tasks` (SDD/miniSpec) |
| --- | --- | --- |
| Input | Uma única TaskCard | task_plan.md inteiro |
| Iteração | Uma task | Loop sequencial respeitando dependências |
| Estado | Não atualiza state.yaml grande (TaskCard pode ser stand-alone) | Atualiza minispec_state.yaml / sdd_state.yaml |
| `agent_name` | **Opcional** (descoberta interativa se ausente) | Opcional (descoberta interativa) |
| Memória temporária | Usa ID do frontmatter (TC-001) | Usa T1, T2, ... do task_plan |

---

## Fluxo de execução

Análogo aos outros orquestradores, mas para uma única TaskCard:

1. **Inicialização**: valida git, cleanup memória stale, captura `base_sha`, **carrega o bloco "Disciplina do Executor (Iron Rules)"** da referência [`executor-discipline.md`](../../configuration/executor-discipline.md) (arquivo sob demanda em `references/` — symlink para o canônico do miniSpec; **não é rule**) para injeção no prompt do executor (passo 4). **Resume pós-interrupção** (Passo 5.0.1) — 4 sinais: memória lazy recente (`< 24h`); `Status: Em Progresso` na seção 1 (setado no Passo 1.12 e nunca fechado); diff não-staged nos paths declarados; **arquivo da §8.2 já existente como untracked**. Qualquer um aciona `AskUserQuestion` — retomar nos gates (usa `base_sha` da memória lazy; se ausente, recupera via grep da linha `[TC-[id]] base_sha=` persistida em `qa-observations.md`) / reexecutar do zero (`git checkout` nos modificados + deleção explícita de arquivos a criar que existam como untracked) / resolver manual. A persistência do `base_sha` em `qa-observations.md` acontece **após** o check de resume (Passo 5.0.2 — evita linha duplicada ambígua em re-run). **Valida dependências** (Passo 1.11): lê o `Status` das cards listadas em `Dependências`; se alguma ≠ `Concluído`, pergunta prosseguir/abortar. **Marca `Status: Em Progresso`** (Passo 1.12). **Instrumenta [rule mining](../shared/mine-rule-candidates.md)** (não-bloqueante): emite `pre_refinement_decision` para cada item da seção 11 do `pre-refinement.md` se existir; prepara consumo de `rule_candidates_emitidos[]` dos gates (passos 6 e 7); registra `executor_askquestion` e `exemplar_file_read` durante o passo 4. Arquivo `rule_candidates.md` é lazy; falhas de append são não-bloqueantes.
2. **Parse frontmatter**: `model`, `risk`, `gates`.
3. **Resolve modelo do executor** (declarado → heurística → default `sonnet`). Se `agent_name` ausente → **descoberta interativa** via `AskUserQuestion` (lista executores em `.claude/agents/`, exclui os 3 agents de gate, oferece "Default" = sentinel `__default__` → Agent sem `subagent_type`).
4. **Invoca executor** (sempre via `Agent` — a variante "execução direta" foi removida). **O prompt do executor inclui sempre o bloco verbatim da Disciplina do Executor (6 Iron Rules, incluindo a Regra 6 — Lei do seam)** — o sub-agente roda em contexto isolado e não herda a referência. Violações da Regra 2 viram problemas `speculative_complexity` no Gate 2. O reforço de testes manda ler a doutrina completa (`SKILL.md` + `antipadroes.md` + `ai-escreve-testes.md` — os 7 gates).
5. **Pós-executor (Passo 3.5)**: roda `git add -N -- <task_paths>` (torna arquivos novos/untracked visíveis no `git diff --name-only <base_sha>` desde o Gate 1); **detecta arquivos criados FORA do escopo declarado** (Passo 3.5.1.1 — `git status --porcelain` × §8.2/§8.3: extras entram no diff, na lista do QA e num bloco "Arquivos tocados NÃO declarados" do prompt do TR, avaliados como `scope_deviation`); persiste `base_sha` + sumário do executor (4-6 linhas) em variáveis do orquestrador, passados **inline em `instrucoes`** aos gates — sem arquivo intermediário.
6. **Gate 1** (agent-spec-qa-validator) → loop em rejeição. O QA recebe a **lista real de arquivos tocados** (`git diff --name-only <base_sha>` rodado pelo orquestrador — o QA é proibido de git; mantém a Camada 0 não-circular), com **filtro de resíduo**: paths staged por TaskCards anteriores não commitadas são subtraídos da lista (exceto overlap declarado). Os arquivos da seção 8.1 (De Referência) **não** entram em `arquivos[]` (só paths em `instrucoes`), com **uma exceção**: se a §8.1 referencia um `design.md` (TaskCard de UI), ele **entra** em `arquivos[]` — contrato visual da Camada 4 (Completude), com instrução literal de cobrança nos `instrucoes`.
7. **Gate 2** (agent-spec-staff-architecture-review) → 5 status (`approved`, `approved_with_observations`, `partial`, `rejected`, `skipped_qa_rejected`); loop em rejeição. Re-validação conforme `requires_qa_revalidation` (rejeição do QA sempre re-QA; TR com bloqueantes só de code-review pula o QA). O prompt do TR referencia a TaskCard completa como documento sob demanda (Guardrails §6) e replica as 3 condições literais de re-execução de testes do contrato do agente.
8. **Fechamento (Passo 5.5)** — para TODA TaskCard aprovada pelos gates **aplicáveis**: `git add -- <paths>` (stage real) + `Status: Concluído` na seção 1 (e no `task_plan.md`, se existir). Vale para `approved` E `approved_with_observations`; para `gates: [qa]`, após o QA aprovar; para `gates: none`, após o executor. O `git add -N` já rodou no Passo 3.5 (pré-Gate 1).
9. **Relatório final** com seção "Débito técnico anotado" (contagem por severidade + ponteiro `/agent-spec-debt-resolution`, sem auto-executar) e cleanup de memória lazy (ao aprovar os gates **aplicáveis** — não exige "ambos" quando só o QA roda). Após 3 tentativas falhas: `Status: Bloqueado` na card + escalação ao usuário.

---

## Gates invocados

| Gate | Agent | Quando |
| --- | --- | --- |
| **Gate 1** | [agent-spec-qa-validator](../../agents/qa-validator.md) | Após executor concluir |
| **Gate 2** | [agent-spec-staff-architecture-review](../../agents/staff-architecture-review-agent.md) | Após Gate 1 aprovar |

---

## Loops e correção

* **Limite**: 3 tentativas TOTAIS compartilhadas.
* **Memória lazy**: `/docs/specs/features/{feature}/{version}/tasks/.tmp/TC-{NN}.md` (criada apenas em rejeição; co-localizada com as taskcards).
* **Auto-escala** sonnet→opus em retry/severity/critical_path/security_flags.
* **Política débito-controlado**: críticos/altos rejeitam (loop); médios/baixos viram débito anotado em `qa-observations.md`.

> Detalhes em [Gates e Loops](../../concepts/gates-loops.md).

---

## Fast-paths

```markdown
- gates: none              # apenas executor
- gates: [qa]              # só Gate 1
- gates: [qa, tech_review] # default
```

Veja [Fast-path Gates](../../advanced/fast-path-gates.md).

---

## Lógica de seleção de modelo (6 passos)

Para a TaskCard recebida, o orquestrador executa em ordem:

| Passo | O que faz |
| --- | --- |
| **1. Parse frontmatter** | Lê `model`, `risk`, `gates` da seção 1 da TaskCard |
| **2. Resolução do modelo** | Se `model` declarado → usa. Senão: aplica [Executor model rules](../../concepts/framework-paths.md) (critical paths → opus, `risk: high` → opus, default → sonnet) |
| **3. Auto-escalação em retry** | Se `attempt_count >= 2` OR `last_severity` ∈ {`high`, `critical`} → força opus na próxima tentativa |
| **4. Resolução de gates** | Se `gates` declarado → usa. Senão: aplica [Gates inference rules](../../concepts/framework-paths.md) por tipo |
| **5. Fast-path** | `gates: none` → executor apenas + fechamento. `gates: [qa]` → pula Tech Review (fechamento após QA). `gates: [qa, tech_review]` → fluxo completo |
| **6. Log obrigatório** | Loga executor e gates **com fonte** (`declarado` | `inferido: tipo=...` | `default-ausente`) antes de invocar |

---

## Configuração embutida (escalações automáticas)

A configuração é **inline no SKILL.md** (seção "Configuração Embutida") — o único arquivo em `references/` é o `executor-discipline.md` (symlink para o canônico do miniSpec). Blocos:

| Bloco | Conteúdo |
| --- | --- |
| **Subagentes dos gates** | Default `agent-spec-qa-validator` (Gate 1), `agent-spec-staff-architecture-review` (Gate 2) |
| **Critical paths** | Categorias semânticas agnósticas (auth, security, crypto, db_migrations, secrets/config, api_contracts, payments) |
| **Executor model rules** | Tabela de match categoria → modelo |
| **Auto-Escalate sonnet→`opus[xhigh]`** | Triggers em retry: `attempt_count >= 2` (conta rejeições), `last_severity` ∈ {`high`, `critical`}, `qa_security_flags` não vazio, `retry_attempt >= 1` (Gate 2) |
| **`qa_summary_fields`** | 6 campos enviados ao Tech Review (veredito, security_flags, executou_testes, escopo_testes, tocou_area_critica, escopo_declarado) — chaves planas com mapeamento documentado a partir do JSON aninhado do QA (`escopo_testes` ← `testes_executados.escopo`) |

---

## Resolução do executor — descoberta interativa

Se `agent_name` é **omitido** no comando, a skill executa descoberta interativa:

1. Lista agentes em `.claude/agents/` (exclui `agent-spec-qa-validator`, `agent-spec-staff-architecture-review`, `agent-spec-qa-test-generator` — agentes reservados do framework).
2. Apresenta via `AskUserQuestion` com opção `Default (orquestrador genérico)` inclusa.
3. Persiste a escolha em `qa-observations.md` para auditoria.

Casos de uso:

* **Com `agent_name`**: usuário tem executor especializado para a stack (Go, Flutter, JS, etc.).
* **Sem `agent_name`** (`__default__`): o executor é invocado via `Agent` sem `subagent_type` (agente genérico do Claude Code). Útil quando não há especialista de stack disponível, ou para TaskCards pontuais (bug fix, ajuste de doc). Não há mais "execução direta pelo orquestrador" — sempre delega a um `Agent`.

---

## Economia de contexto (inline vs arquivo)

`base_sha` + sumário do executor (4-6 linhas) viajam **INLINE em `instrucoes`** dos gates — sem arquivo intermediário.

**Economia**: ~300-800 tokens × 2 gates por TaskCard.

---

## Templates / assets usados

* `references/executor-discipline.md` — **único** arquivo em `references/` (symlink para o canônico em `agent-spec-minispec-run-tasks/references/`); bloco das 6 Iron Laws injetado no prompt do executor.
* Configuração dos gates, prompts (Gate 1/Gate 2), guardrails e lógica de modelo vivem **inline no SKILL.md**, não em `references/`.

> ⚠️ **Antidrift**: os blocos de Gate 1/Gate 2 deste SKILL são espelho dos equivalentes em `agent-spec-sdd-run-tasks/SKILL.md` e `agent-spec-minispec-run-tasks/references/`.

---

## Exemplo de uso

```bash
# Com agente especialista da stack:
/agent-spec-taskcard-run docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf-cadastro.md <seu-executor>

# Sem agente (descoberta interativa — escolha "Default" para o agente genérico):
/agent-spec-taskcard-run docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf-cadastro.md
```

```
[Inicialização] git ok | base_sha capturado
[Parse] model: sonnet | risk: low | gates: [qa, tech_review]
[Executor: <seu-executor> (sonnet)] → implementou em handler
[base_sha + sumário do executor persistidos (inline no prompt dos gates)]

[Gate 1 (sonnet)] APROVADO
[Gate 2 (sonnet)] approved
[git add -- internal/users/handler.go internal/users/handler_test.go]

[Cleanup memória]
✅ TaskCard concluída.
```

---

## Skills relacionadas

* [agent-spec-taskcard-generate](taskcard-generate.md) — etapa anterior.
* [agent-spec-sdd-run-tasks](../sdd/sdd-run-tasks.md) — equivalente SDD para múltiplas tasks.
* [agent-spec-minispec-run-tasks](../minispec/minispec-run-tasks.md) — equivalente miniSpec.

## Agents relacionados

* [agent-spec-qa-validator (Gate 1)](../../agents/qa-validator.md)
* [agent-spec-staff-architecture-review (Gate 2)](../../agents/staff-architecture-review-agent.md)

## Configuração via framework-paths.md

Paths usados: `taskcard.tasks.dir`, `taskcard.tasks.pattern`, `taskcard.task_plan.path` (opcional), `shared.qa_observations.path`, `shared.temp_memory.*`, `adr.index_file`. Veja [Path Templates](../../configuration/path-templates.md).
