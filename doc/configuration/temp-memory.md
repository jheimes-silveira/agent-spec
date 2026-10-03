---
id: "temp-memory"
title: "Memória Temporária"
sidebar_position: 5
---
# Memória Temporária

Memória descartável por task, vive em `tasks/.tmp/` dentro da feature (paths em `shared.temp_memory.*` em [`agent-spec-workflow-rules.md`](path-templates.md)). **Hoje só existe um tipo: memória lazy de retry**.

---

## Configuração na rule global

```markdown
### Memória Temporária (lazy — só nasce em rejeição de gate)
- **shared.temp_memory.dir**: `/docs/specs/features/{feature}/{version}/tasks/.tmp/`
- **shared.temp_memory.pattern**: `{task_id}.md`
```

> Comportamento (lifecycle, cleanup, escalações) está embutido nas skills `*-run-tasks` — paths são apenas declarações.

---

## Memória lazy — `{task_id}.md`

Criada **apenas quando a task é reprovada** por Gate 1 ou Gate 2.

```markdown
# Memória temporária — T5
> Criada em 2026-04-28T14:30:00Z. Deletada ao aprovar; expira em 24h.

## attempt_count: 1
## last_severity: critical

## Sumário do executor (retornado na implementação)
[output enxuto de 4-6 linhas que o executor produziu]

## JSON QA Validator
\`\`\`json
{ "resumo": { "veredito": "REJEITADO", ... }, ... }
\`\`\`

## JSON Tech Review (se reprovou aqui também)
\`\`\`json
{ "status": "rejected", ... }
\`\`\`

## Arquivos tocados (git diff --stat)
internal/pings/handler.go       | 85 ++++
internal/pings/service.go       | 42 ++

## Paths
- Criados: [...]
- Modificados: [...]
- Testes: [...]
```

Consumida pelo executor na **próxima tentativa** — ele lê **antes** de corrigir, evitando investigar do zero.

> **`base_sha` e resume**: além de viver na memória lazy (que só nasce em rejeição), o `base_sha` é gravado na pré-execução de cada task como linha `[T{N}] base_sha=<sha>` em `qa-observations.md`. É esse log que permite ao resume pós-interrupção (FASE 0, item 6.1) reconstruir o diff quando a sessão caiu antes de qualquer rejeição e a memória lazy ainda não existe.

---

## E o execution-summary?

> A "memória proativa" (`{task_id}-execution-summary.md`) — criada sempre após o executor concluir — foi **removida**. `base_sha` e o sumário do executor (4-6 linhas) passam agora **inline em `instrucoes`** ao Gate 1 e Gate 2. Sem arquivo intermediário.
>
> Os outros campos do antigo execution-summary (`git diff --stat`, hashes SHA-256, paths consolidados) foram cortados porque QA/Tech Review nunca os consultavam (Tech Review GERA diff sozinho via `git diff <base_sha> -- <path>`). Ver [Memória Proativa](../advanced/proactive-memory.md) para histórico da mudança.

---

## Lifecycle

### Cleanup on approval

Ao aprovar a task (Gate 2 approved), a memória lazy `{task_id}.md` é deletada imediatamente pelo orquestrador — se existir (só nasce em rejeição).

### Cleanup stale (>24h)

No início de cada `*-run-tasks`, o orquestrador faz cleanup **idempotente**: deleta qualquer arquivo em `shared.temp_memory.dir` com mtime >24h.

Protege contra órfãos por crashes ou interrupções.

---

## `.gitignore`

Adicione sempre:

```
docs/specs/features/*/*/tasks/.tmp/
```

Memória lazy **não** deve ir para Git — é volátil e específica da execução.

---

## TaskCard usa pattern diferente

[agent-spec-taskcard-run](../skills/taskcard/taskcard-run.md) usa o ID do frontmatter (ex.: `TC-001`) em vez de `T1`, `T2`:

| Pattern | Frameworks que usam |
| --- | --- |
| `T{N}.md` | SDD, miniSpec |
| `TC-{NN}.md` | TaskCard |

---

## Não confundir com memória persistente do Claude

| Tipo | Onde vive | Lifecycle |
| --- | --- | --- |
| **Memória lazy do framework** | `tasks/.tmp/` dentro da feature | Descartável por task (só nasce em rejeição) |
| **Memória persistente do Claude Code** | `~/.claude/projects/.../memory/` | Persistente entre sessões |

São mecanismos **diferentes**. A memória do framework é específica para o pipeline de execução.

---

## Economia gerada pela memória lazy

A memória lazy **não é economia direta** — é **correção focada**. O executor não investiga do zero na próxima tentativa; recebe JSON completo do gate + contexto da rejeição. Sem ela, o loop de correção custaria 2-3× mais tokens.

> Economia adicional (~300-800 tokens × 2 gates × N tasks por run) veio do **corte da memória proativa**. Ver [Memória Proativa](../advanced/proactive-memory.md).

---

## Próximos passos

* [Memória Proativa](../advanced/proactive-memory.md) — histórico da memória proativa (deprecada).
* [Gates e Loops](../concepts/gates-loops.md) — onde a memória lazy é usada no loop de correção.
* [Observabilidade — Memória Temporária](../observability/temp-memory-debug.md) — debug de problemas.
* [Path Templates](path-templates.md) — chaves da rule global.
