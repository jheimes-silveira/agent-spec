---
id: "model-selection"
title: "Model Selection"
sidebar_position: 1
---
# Model Selection — model / risk / gates

Define como cada task declara e consome modelos ao longo do fluxo de geração, execução e auto-escalação.

---

## Frontmatter da task

Toda task gerada por SDD/miniSpec/TaskCard tem 3 campos:

```markdown
## 1. Identificação
- ID: T5
- Nome: Service + Handler do módulo pings
- model: sonnet # sonnet (default) | opus (área crítica/complexa)
- risk: medium # low | medium | high
- gates: [qa, tech\_review] # default | [qa] | none
```

---

## Heurística de preenchimento (skills de geração)

```
model: opus se QUALQUER:
- task toca internal/auth/\*\*, internal/security/\*\*, internal/crypto/\*\*
- task toca internal/db/migrations/\*\* com lógica de dados
- task é refatoração cross-module (≥3 pacotes)
- task implementa padrão novo que vira ADR
- task tem ≥10 arquivos a criar OU diff estimado >500 linhas
model: sonnet (default) cobre o resto:
- CRUD, handlers, services, repositories rotineiros
- configs, middlewares, logger, envelope de erro
- Dockerfile, README, CI yaml, testes
model: haiku NUNCA para o executor.
Code review e pattern recognition exigem síntese.
```

**Paralelo para `risk`**:

```
risk: high auth/security/crypto/migrations
risk: medium refatoração cross-module ou novo padrão
risk: low caso contrário
```

---

## Resolução em runtime (orquestradores)

Os 3 `*-run-tasks` (SDD/miniSpec/TaskCard) parseiam o frontmatter e resolvem via ordem de precedência:

```
1. Task tem `model: X` no frontmatter? → usa X.
2. Heurística embutida (regras por path / risk / files\_count) casa? → aplica.
3. Fallback → sonnet.
```

Pseudocódigo:

```
para cada task:
task\_content = ler(task.path)
task\_model = parse\_frontmatter(task\_content).get("model")
task\_risk = parse\_frontmatter(task\_content).get("risk")
resolved\_model = task\_model
OR apply\_executor\_rules(task) # critical\_paths, files\_to\_create
OR "sonnet"
# Auto-escalação em retry
if resolved\_model == "sonnet":
if attempt\_count >= 2 OR last\_severity in ("high", "critical"):
resolved\_model = "opus"
log\_in\_qa\_observations(...)
invoke\_agent(
subagent\_type = agent\_name,
model = resolved\_model,
prompt = build\_prompt(task, gates)
)
```

---

## Sobrescrita manual

O usuário **pode** editar o `model:` no `.md` da task antes de executar:

```markdown
- model: opus # usuário forçou mesmo a heurística sugerindo sonnet
```

O orquestrador **sempre respeita** o que está no arquivo. Override manual é prerrogativa humana.

Veja [Override Models](/customization/override-models.html).

---

## Auto-escalação em retry

Se uma task declarada `sonnet` falha no Gate 1 ou Gate 2, o orquestrador aplica auto-escalação:

```
Tentativa 1: executor sonnet → Gate REJEITADO (severity=medium)
Tentativa 2: executor sonnet → Gate REJEITADO (severity=medium)
Tentativa 3: executor OPUS (escalado: attempt\_count >= 2)
→ Gate APROVADO → Task Concluída
```

Log em `qa-observations.md`:

```markdown
### T5 — escalação automática
- Tentativa 1-2: sonnet, rejeitado (testes de integração falhando)
- Tentativa 3: escalado para opus (rule: attempt\_count >= 2)
- Resultado: aprovado
```

Detalhes em [Auto-escalação](/advanced/auto-escalation.html).

---

## Compatibilidade retroativa

Tasks geradas **antes** desta convenção podem não ter `model:`, `risk:`, `gates:`. O orquestrador:

1. Não encontra o campo.
2. Aplica heurística embutida (critical\_paths, etc.).
3. Fallback `sonnet`.
4. Usa `gates: [qa, tech_review]` como default.

Migração é **gradual** — só tasks novas usam os campos. Sem backfill.

---

## Logs do orquestrador

Durante `/agent-spec-sdd-run-tasks` ou similar, o terminal mostra:

```
[T5] executor: sonnet (declarado) gates: [qa, tech\_review]
[T6] executor: opus (rule: critical\_path) gates: [qa, tech\_review]
[T7] executor: sonnet (fallback) gates: none (WARN: sem validação)
[T8] executor: opus (auto-escalated, attempt=2) gates: [qa, tech\_review]
```

Transparência total sobre qual modelo rodou e por quê.

---

## Próximos passos

* [Auto-escalação](/advanced/auto-escalation.html) — heurística completa em retry.
* [Critical Paths](/configuration/critical-paths.html) — globs que disparam escalação automática.
* [Override Models](/customization/override-models.html) — forçar modelo manualmente.
* [Fast-path Gates](/advanced/fast-path-gates.html) — pular gates quando a task é trivial.
* [Gates e Loops](/concepts/gates-loops.html) — onde o modelo é aplicado.
