---
id: "agent-spec-debt-resolution"
title: "agent-spec-debt-resolution"
sidebar_position: 4
---
# agent-spec-debt-resolution

`Cleanup`
> **Resumo**: Resolve débitos técnicos médios/baixos acumulados em `qa-observations.md` de uma feature. Classifica cada débito via agente especialista da stack (`recomendado_corrigir` vs `perfumaria`), pergunta interativamente quais incluir, e gera uma versão `v{N+1}-debits/` da feature com `intent.md` + `scope.md` + `task_plan.md` + tasks individuais prontas para execução via `/agent-spec-minispec-run-tasks`.

---

## Por que existe

A política débito-controlado do [agent-spec-qa-validator](../../agents/qa-validator.md) deixa passar problemas `MEDIO` e `BAIXO` (categorias `code_review_only`: `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`) como **débito anotado** em `qa-observations.md`. Sem essa skill, esse débito vira "cleanup futuro que nunca acontece" — exatamente o problema do post-mortem `cadastro-pratos-franquia` T8 (testes duplicados aprovados com nota 9 que ninguém limpou).

`agent-spec-debt-resolution` fecha o ciclo: lê os débitos acumulados, deixa o agente especialista classificar valor de correção, e deixa o usuário escolher conscientemente o que entra na fila de cleanup.

---

## Quando usar

* Acabou de rodar uma feature inteira via `/agent-spec-minispec-run-tasks` ou `/agent-spec-sdd-run-tasks` e `qa-observations.md` tem entradas `APROVADO_COM_OBSERVACOES` com débitos `MEDIO`/`BAIXO`.
* Você quer limpar dívida técnica antes de partir para uma `v2` funcional da feature.
* O time decidiu rodar um "sprint de cleanup" sobre features estáveis.

## Quando NÃO usar

* Feature ainda em execução (v{N} não foi concluída) — espere a feature terminar para coletar débitos reais.
* `qa-observations.md` não existe — não há débito anotado a resolver.
* Você quer adicionar funcionalidade nova — use `/agent-spec-minispec-generate-intent` (feature nova) ou `/agent-spec-minispec-generate-scope` (incremento), não esta skill.
* Há débitos `CRITICO` ou `ALTO` pendentes — esses não estão em `qa-observations.md` como débito (bloqueariam o pipeline). Se aparecerem, é bug do gate.

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho da feature (ex.: `docs/specs/features/cardapio/v1/`) | Usuário | Sim |
| Nome do agente executor da stack | Usuário | Opcional (descoberta interativa se ausente) |
| `qa-observations.md` da feature | Path da feature | Sim (skill aborta se ausente/vazio) |
| `CLAUDE.md` + `.claude/rules/*` | System-prompt | Sim |

## Outputs

| Artefato | Path resolvido | Consumido por |
| --- | --- | --- |
| `intent.md` (cleanup) | `docs/specs/features/{feature}/v{N+1}-debits/intent.md` | Usuário, próximas skills |
| `scope.md` (cleanup) | `docs/specs/features/{feature}/v{N+1}-debits/scope.md` | `/agent-spec-minispec-run-tasks` |
| `task_plan.md` | `docs/specs/features/{feature}/v{N+1}-debits/task_plan.md` | `/agent-spec-minispec-run-tasks` |
| `tasks/T{n}.md` (1 por débito) | `docs/specs/features/{feature}/v{N+1}-debits/tasks/` | Executor da stack via `/agent-spec-minispec-run-tasks` |
| `minispec_state.yaml` (com `source: agent-spec-debt-resolution`) | `docs/specs/features/{feature}/v{N+1}-debits/minispec_state.yaml` | Auditoria |
| Append em `qa-observations.md` da v{N} original | `docs/specs/features/{feature}/v{N}/qa-observations.md` | Auditoria — quem rodou cleanup, quando, quais débitos |

---

## Fluxo de execução

### FASE 0 — Inicialização

1. Resolve `feature_path` e `agent_name` (descoberta interativa se ausente — mesmo padrão de `/agent-spec-minispec-run-tasks`).
2. Calcula `v{N+1}-debits` (ex.: `v1` → `v2-debits`).
3. Aborta se `qa-observations.md` ausente ou se `<output_dir>` já existe sem permissão para sobrescrever.

### FASE 1 — Coleta de Débitos

Lê `qa-observations.md` e extrai entradas elegíveis (severidade `MEDIO`/`BAIXO`, categorias `code_review_only`). Procedimento detalhado em [debt-collection.md](https://github.com/) da skill.

Schema de cada débito:

```yaml
id: D-001
origem_task: T8
severidade: MEDIO
categoria: code_quality
arquivo: internal/.../x_test.go
linha: 271
titulo: "..."
descricao: "..."
correcao_sugerida: "..."
```

Se zero débitos elegíveis → aborta limpamente.

### FASE 2 — Análise via Especialista

Delega ao agente da stack (escolhido em FASE 0). Prompt completo em [specialist-prompt.md](https://github.com/) da skill.

Especialista retorna JSON com classificação binária + justificativa + custo estimado:

```json
{
  "classificacoes": [
    {
      "id": "D-001",
      "classificacao": "recomendado_corrigir",
      "justificativa": "Custo: 1min (delete). Risco: nenhum. Valor: legibilidade.",
      "custo_estimado_min": 1,
      "risco_regressao": "nenhum"
    }
  ]
}
```

### FASE 3 — Apresentação Interativa

Apresenta resumo no terminal + perguntas via `AskUserQuestion` (até 4 ondas):

1. **Atalho global**: "Incluir todos os recomendados?" / "Escolher um por um" / "Incluir tudo" / "Abortar".
2. **Recomendados** (blocos de 4): usuário marca quais incluir.
3. **Perfumaria** (blocos de 4): default desmarcado.
4. **Confirmação final** se ≥ 5 selecionados.

### FASE 4 — Geração da Versão de Débitos

Cria 4 artefatos em `docs/specs/features/{feature}/v{N+1}-debits/`:

* **intent.md** — "Limpar N débitos técnicos da v{N}".
* **scope.md** — débitos incluídos (§1) + débitos NÃO selecionados (§2, auditoria).
* **task_plan.md** — 1 task por débito. Tasks de débito são independentes por construção (cada uma toca seu próprio cenário), mas o flag `Pode Rodar em Paralelo?` é **derivado** (Regra 10d), nunca autorado `Sim` por padrão: o orquestrador re-verifica os guards (independência no DAG, disjunção de símbolo, paths disjuntos, sem arquivo de alta contenção compartilhado, lote ≤ `MAX_PARALLEL = 4`) e faz fallback automático para sequencial em qualquer colisão. Veja o [Invariante de Paralelismo](../../configuration/framework-paths.md).
* **tasks/T{n}.md** — frontmatter `gates: [qa]` (exceto critical_paths → `[qa, tech_review]`).
* **minispec_state.yaml** — `source: agent-spec-debt-resolution`, `parent_version: v{N}`.

E append em `qa-observations.md` da v{N} original com timestamp + débitos selecionados.

### FASE 5 — Saída

Resumo curto + comando sugerido. NÃO inicia `/agent-spec-minispec-run-tasks` automaticamente.

---

## Frontmatter das tasks de débito

```markdown
- model: sonnet
- risk: low
- gates: [qa]           # cleanup é code_review_only — Tech Review traz pouco valor
- source: agent-spec-debt-resolution
- debito_origem: D-XXX
- task_origem_parent: T{N} (SDD/miniSpec) ou TC-{NNN} (TaskCard)
```

**Exceção `gates`**: se o débito toca path em [critical_paths](../../configuration/critical-paths.md) (auth, security, crypto, migrations, secrets/config), força `gates: [qa, tech_review]`.

---

## Comando

```bash
/agent-spec-debt-resolution <caminho da feature> [agent_name]
```

### Exemplo

```bash
/agent-spec-debt-resolution docs/specs/features/cadastro-pratos-franquia/v1/ go-backend-implementer
```

Saída esperada:

```
Versão de débitos gerada ✅

Diretório: docs/specs/features/cadastro-pratos-franquia/v2-debits/
Arquivos:
- intent.md
- scope.md
- task_plan.md
- tasks/T1.md ... T5.md (5 tasks)
- minispec_state.yaml

Débitos selecionados: 5 de 7 coletados
- Recomendados pela LLM incluídos: 4/4
- Perfumaria incluída: 1/3
- Ignorados: 2 (registrados em scope.md §2 para auditoria)

Próximo passo:
  /agent-spec-minispec-run-tasks docs/specs/features/cadastro-pratos-franquia/v2-debits/task_plan.md

Tempo estimado total: ~12 minutos.
```

---

## Guardrails invioláveis

A skill jamais quebra (mesmo sob instrução em contrário):

| # | Guardrail |
| --- | --- |
| 1 | **NUNCA** alterar `qa-observations.md` da v{N} original além do append de log (FASE 4.6). Histórico preservado |
| 2 | **NUNCA** alterar artefatos da v{N} original (`intent.md`, `scope.md`, `task_plan.md`, `tasks/T*.md`). Só leitura |
| 3 | **NUNCA** inventar débitos — se `qa-observations.md` está vazio ou sem entradas elegíveis, abortar limpamente |
| 4 | **NUNCA** classificar débitos sozinha — sempre delegar ao especialista da stack (FASE 2) |
| 5 | **SEMPRE** preservar granularidade "1 task por débito" salvo se usuário pedir agrupamento explicitamente |
| 6 | **SEMPRE** usar `gates: [qa]` em cleanup (exceto critical paths → força `[qa, tech_review]`) |
| 7 | **SEMPRE** registrar débitos NÃO selecionados em `scope.md §2 — Fora do escopo` com motivo (rastreabilidade — usuário sabe que ignorou conscientemente) |
| 8 | **SEMPRE** logar a execução em `qa-observations.md` da v{N} (FASE 4.6) |
| 9 | **SEMPRE** apresentar resumo do plano antes da geração — se usuário "voltar" na Onda 4, re-roda FASE 3 sem regenerar classificação (cache da FASE 2) |
| 10 | **NUNCA** iniciar `/agent-spec-minispec-run-tasks` automaticamente após gerar — apenas mostra o comando sugerido |

---

## Diferença vs outras skills

| Aspecto | `/agent-spec-debt-resolution` | `/agent-spec-minispec-generate-intent` | `/agent-spec-minispec-generate-scope` |
| --- | --- | --- | --- |
| Tipo de saída | Versão de cleanup (`v{N+1}-debits/`) | Feature nova (`v1/`) | Scope para feature já intencionada |
| Funcionalidade adicionada | Zero | Toda | Detalhamento técnico |
| Frontmatter tasks default | `gates: [qa]` | inferido por tipo | inferido por tipo |
| Origem do conteúdo | `qa-observations.md` (débitos) | Conversa com usuário | INTENT + tech-alignment |
| Decisão de inclusão | Interativa (LLM recomenda, usuário decide) | Negociada com usuário | Definida pelo SCOPE |

---

## Configuração via framework-paths.md

Paths usados: `shared.qa_observations.path`, `minispec.intent.path`, `minispec.scope.path`, `minispec.task_plan.path`, `minispec.tasks.dir`, `minispec.state.path`. Todos resolvidos via [path templates](../../configuration/path-templates.md).

A skill **não** introduz path novo — reutiliza a estrutura de versão da miniSpec, apenas substituindo `v{N}` por `v{N+1}-debits` no resolvedor.

---

## Skills relacionadas

* [agent-spec-pre-refinement](pre-refinement.md) — entrada universal (não é pré-requisito desta skill; débitos vêm de execução, não discovery).
* [agent-spec-minispec-run-tasks](../minispec/minispec-run-tasks.md) — próxima etapa (executa as tasks geradas por esta skill).
* [agent-spec-qa-validator](../../agents/qa-validator.md) — gate que gera os débitos anotados que esta skill consome.

---

## Próximos passos

* [Gates e Loops](../../concepts/gates-loops.md) — onde os débitos `MEDIO`/`BAIXO` são gerados (política débito-controlado).
* [qa-observations.md](../../observability/qa-observations.md) — fonte primária dos débitos.
* [Fast-path Gates](../../advanced/fast-path-gates.md) — entender por que cleanup recebe `gates: [qa]` por default.
