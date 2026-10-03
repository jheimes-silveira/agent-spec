---
id: "agent-spec-taskcard-run"
title: "Pipeline — agent-spec-taskcard-run"
sidebar_position: 4
---
# Pipeline — agent-spec-taskcard-run

Foco operacional do orquestrador TaskCard. Para o contrato da skill, veja [skills/taskcard/taskcard-run](/skills/taskcard/taskcard-run.html).

> **Diferença chave**: processa **uma única TaskCard** por invocação (não um task\_plan inteiro). Sem grafo de dependências.

---

## Comando

```bash
/agent-spec-taskcard-run  [agent\_name]
```

| Argumento | Obrigatório | Exemplo |
| --- | --- | --- |
| `taskcard_path` | Sim | `docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf.md` |
| `agent_name` | Não | nome de um executor da stack registrado em `.claude/agents/` (ausente → descoberta interativa) |

> Quando `agent_name` é omitido, o orquestrador faz **descoberta interativa**: lista os executores em `.claude/agents/` (exceto os 3 agents de gate), pergunta via `AskUserQuestion` e oferece a opção "Default" — que invoca o executor via `Agent` **sem `subagent_type`** (agente genérico). Não há "execução direta pelo orquestrador".

---

## Pré-requisitos

```bash
# 1. Repositório git
git status
# 2. TaskCard gerada
test -f docs/specs/features///tasks/.md
# 3. CLAUDE.md presente
test -f CLAUDE.md
```

---

## Fluxo executado

Idêntico ao [pipeline/overview](/pipeline/overview.html), mas **sem FASE 1 (grafo)** — uma única task:

```
FASE 0 git ok | cleanup memória stale
+ carregar bloco "Disciplina do Executor (Iron Rules)"
FASE 2 Parse frontmatter + executor + persiste base\_sha/sumário inline
FASE 3 Gate 1 (agent-spec-qa-validator)
FASE 3.5 Loop QA em rejeição
```
> **`design.md` no Gate 1**: arquivos da seção 8.1 (De Referência) não entram em `arquivos[]` do QA — exceto um `design.md` referenciado por TaskCard de UI, que entra como **contrato visual** da Camada 4 (Completude): estados visuais (loading/erro/vazio/sucesso) implementados devem corresponder ao especificado nele.

```
FASE 4 Gate 2 (agent-spec-staff-architecture-review) — 5 status
FASE 4.4 Loop Tech Review em rejeição (requires\_qa\_revalidation)
FASE 4.5 Fechamento (Passo 5.5): git add (stage real) + Status: Concluído
na seção 1 — para TODA TaskCard aprovada pelos gates APLICÁVEIS
(`approved` OU `approved\_with\_observations`; só QA quando
gates: [qa]; pós-executor quando gates: none). O `git add -N`
pós-executor tornou arquivos novos visíveis ao diff do QA na FASE 3.
FASE 5 Relatório final (com "Débito técnico anotado") + cleanup
(3 tentativas esgotadas → Status: Bloqueado + escalação)
```
> **Resume pós-interrupção** (início do fluxo) — 4 sinais: memória lazy recente, `Status: Em Progresso` órfão na seção 1, diff não-staged nos paths declarados, ou arquivo da §8.2 já existente como untracked → `AskUserQuestion` (retomar nos gates / reexecutar do zero / resolver manual). O `Status` da card é gerido pelo run (`Em Progresso` → `Concluído`/`Bloqueado`), inclusive na linha do `task_plan.md` quando ele existe.

---

## Disciplina do Executor (Iron Rules) 🛡️

Mesmo numa TaskCard isolada, o orquestrador injeta **verbatim** o bloco entre `<<<EXECUTOR_DISCIPLINE … EXECUTOR_DISCIPLINE>>>` da referência [`executor-discipline.md`](/configuration/executor-discipline.html) (arquivo sob demanda em `references/`, symlink para o canônico do miniSpec — **não é rule**) no prompt do executor. O sub-agente roda em contexto isolado e não herda essa referência pelo system-prompt. São as **6 Iron Rules** (a Regra 6 é a Lei do seam); violações da Regra 2 (simplicidade) são detectadas no Gate 2 pela categoria [`speculative_complexity`](/advanced/conditional-gates.html).

---

## Memória temporária — diferença

| Aspecto | TaskCard | SDD/miniSpec |
| --- | --- | --- |
| Pattern de memória (lazy, só em rejeição) | `TC-{NN}.md` | `T{N}.md` |
| Origem do `{NN}` | ID do frontmatter da TaskCard (ex.: `TC-001`) | Ordem do `task_plan.md` (T1, T2, ...) |

Exemplo:

* `docs/specs/features/<feature>/<v>/tasks/.tmp/TC-001.md` — memória lazy (só nasce em rejeição)
* `base_sha` e sumário do executor passam **inline em `instrucoes`** aos gates (sem arquivo intermediário); o `base_sha` é adicionalmente registrado como linha `[TC-[id]] base_sha=` em `qa-observations.md` para o resume pós-interrupção recuperá-lo

---

## Exemplo de execução

### Com agent\_name

```bash
$ /agent-spec-taskcard-run docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf.md 
[FASE 0] ✓ git ok | cleanup OK
[FASE 2] TC-01 | parse: model=sonnet, risk=low, gates=[qa, tech\_review]
base\_sha = a1b2c3d
executor:  (sonnet)
✓ implementou em internal/users/handler.go (12 linhas + 1 arquivo de teste)
✓ base\_sha + sumário do executor persistidos em memória (inline no prompt dos gates)
[FASE 3] Gate 1 (sonnet): APROVADO
CA-01 PASSOU; CA-02 PASSOU; testes 5/5
[FASE 4] Gate 2 (sonnet): approved
adrs\_consultadas: [ADR-0001 baixa]
[FASE 4.5] git add -- internal/users/handler.go internal/users/handler\_test.go
[FASE 5] Relatório final (débito anotado: nenhum)
Cleanup: nada a remover (sem rejeição, sem memória lazy criada)
✅ TaskCard concluída.
```

### Sem agent\_name (descoberta interativa)

```bash
$ /agent-spec-taskcard-run docs/specs/features/cadastro-cpf/v1/tasks/task-01-validar-cpf.md
[Sem agent\_name → descoberta interativa: AskUserQuestion lista executores;
usuário escolhe "Default" → Agent sem subagent\_type]
[FASE 0..5 idênticas]
✅ TaskCard concluída.
```

---

## Quando usar TaskCard run vs SDD/miniSpec run

| Cenário | Use |
| --- | --- |
| Executar **uma** task isolada | `agent-spec-taskcard-run` |
| Executar **N tasks com dependências** | `agent-spec-sdd-run-tasks` ou `agent-spec-minispec-run-tasks` |
| TaskCard ad-hoc sem feature folder | `agent-spec-taskcard-run` |
| Bug fix pontual em código existente | `agent-spec-taskcard-run` |

---

## Logs e troubleshooting

Mesmos cenários do [agent-spec-sdd-run-tasks](/pipeline/sdd-run-tasks.html). Note que:

| Sintoma | Particularidade TaskCard |
| --- | --- |
| Memória `TC-{NN}.md` não criada | Confira ID no frontmatter da TaskCard (deve seguir formato `TC-NN`) |
| `task_plan.md` não atualizado | Esperado se a TaskCard é stand-alone (sem `task_plan.md` da feature) |

---

## Próximos passos

* [agent-spec-taskcard-run (skill)](/skills/taskcard/taskcard-run.html) — contrato detalhado.
* [Gates e Loops](/concepts/gates-loops.html) — referência conceitual.
* [Pipeline — Overview](/pipeline/overview.html) — comparativo dos 3 orquestradores.
* [Pipeline — agent-spec-sdd-run-tasks](/pipeline/sdd-run-tasks.html) — para múltiplas tasks SDD.
* [Pipeline — agent-spec-minispec-run-tasks](/pipeline/minispec-run-tasks.html) — para múltiplas tasks miniSpec.
