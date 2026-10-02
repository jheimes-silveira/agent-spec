# Configuração Embutida + Lógica de Seleção de Modelo

> Referência consumida por `SKILL.md` da skill `agent-spec-minispec-run-tasks`.
> Leia este arquivo:
> - **Antes da FASE 0** para inicializar valores default (modelos, thresholds).
> - **Antes de invocar o executor** (FASE 2.3) para resolver `effective_model`.
> - **Antes de invocar QA / Tech Review** (FASE 3.3 / 4.2) para resolver `qa_model` / `tech_model`.

---

## Configuração Embutida

### Subagentes dos Gates

| Papel | subagent_type | Modelo default |
|---|---|---|
| Gate 1 — QA | `agent-spec-qa-validator` | `sonnet` |
| Gate 2 — Tech Review | `agent-spec-staff-architecture-review` | `sonnet` |

### Critical Paths (heurística — definida em `agent-spec-workflow-rules.md`)

> As categorias canônicas e exemplos de match estão em `.claude/rules/agent-spec-workflow-rules.md`, seção **"Critical Paths — Heurística de Áreas Sensíveis"**. O conteúdo abaixo é um espelho local para referência rápida — a fonte de verdade é `agent-spec-workflow-rules.md`.

Detecte áreas sensíveis pelo **propósito do código**, não pelo layout. Para cada task, resolva os paths reais do projeto observando manifests, convenções e nomes de diretórios/arquivos. Categorias canônicas:

| Categoria | Exemplos de match (qualquer linguagem) |
|---|---|
| **auth** | `**/auth/**`, `**/authentication/**`, `**/login/**`, `**/sessions/**`, `**/oauth/**` |
| **security** | `**/security/**`, `**/permissions/**`, `**/authorization/**`, `**/access-control/**`, `**/rbac/**` |
| **crypto** | `**/crypto/**`, `**/encryption/**`, `**/hashing/**`, `**/jwt/**`, `**/tokens/**`, `**/keys/**` |
| **db_migrations** | `**/migrations/**`, `**/migrate/**`, `**/db/migrations/**`, `**/schema/migrations/**`, arquivos `*.sql` em pastas de migração |
| **secrets/config** | `**/secrets/**`, `**/credentials/**`, arquivos como `.env*`, `secrets.*` |
| **api_contracts** | `**/openapi*`, `**/swagger*`, `**/proto/**`, `**/graphql/schema*`, `**/contracts/**` |
| **payments** | `**/payment/**`, `**/billing/**`, `**/checkout/**`, `**/transaction/**` |

Como aplicar:
1. Para a task em execução, examine `arquivos:` declarados na seção 4 e o `git diff --name-only`.
2. Faça match de cada path contra as categorias acima (case-insensitive, semântico).
3. Se QUALQUER path bater com QUALQUER categoria → `diff_touches_critical_path = true`.
4. Use o resultado para escalar modelo (gates, executor) conforme regras abaixo.

> **Importante**: nunca assuma layout específico (Go `internal/`, Java `src/main/`, JS `src/`, Python `app/`). A categorização é por **semântica do path** — funciona para qualquer stack.

### Regras de Modelo do Executor (`executor_model_rules`)

Aplicadas APENAS se o frontmatter da task NÃO declarar `model:`. Avaliação em ordem (primeira que casar vence):

```
- match: path em categoria "auth"                  → opus
- match: path em categoria "security"              → opus
- match: path em categoria "crypto"                → opus
- match: path em categoria "db_migrations"         → opus
- match: path em categoria "secrets/config"        → opus
- match: task_risk == "ALTO"                       → opus
- match: files_to_create_count >= 10               → opus
- default                                          → sonnet
```

> As categorias acima são as **mesmas** definidas em "Critical Paths" — agnósticas de linguagem. A skill resolve os paths concretos em runtime, independente da stack do projeto.

### Auto-Escalate (executor em retry)

```
enabled: true
after_attempts: 2              # se attempt_count >= 2 → escalar
severity_trigger: "ALTO"       # OU se last_severity in {ALTO, CRITICO} → escalar (CRITICO é ≥ ALTO)
target_model: "opus[xhigh]"    # Opus com effort xhigh (raciocínio estendido)
log_to_observations: true      # appende o bloco de escalonamento em _run/workflow-report.md
```

> **Por que `opus[xhigh]` em vez de `opus`**: a 3ª tentativa do executor é o último recurso antes de escalar para o usuário. Tasks que falharam 2x já demonstraram complexidade não-trivial — vale o custo extra de raciocínio xhigh para maximizar a chance de aprovação no próximo gate. O shorthand `opus[xhigh]` segue o padrão `opus[1m]` do Claude Code para indicar variantes parametrizadas do modelo Opus (sem pinar versão — usa a vigente).

#### Semântica de tentativas (canônica — elimina ambiguidade)

| Evento | `attempt_count` na memória lazy | Modelo do executor |
|---|---|---|
| Execução inicial (= tentativa 1) | memória ainda não existe | `effective_model` normal |
| 1ª rejeição → correção (= tentativa 2) | grava `attempt_count: 1` | `effective_model` normal (ou escalado se `last_severity` ∈ {`ALTO`, `CRITICO`}) |
| 2ª rejeição → correção (= tentativa 3, última) | atualiza para `attempt_count: 2` | `opus[xhigh]` (auto-escalate: `attempt_count >= 2`) |
| 3ª rejeição | atualiza para `attempt_count: 3` | → escalar ao usuário (Bloqueado) |

> "3 tentativas TOTAIS" = execução inicial + 2 correções. `attempt_count` conta **rejeições**, não execuções.

### Escalação dos Gates (sonnet → opus)

**`agent-spec-qa-validator`** escala para `opus` se QUALQUER:
- `diff_touches_critical_path` (path tocado bate com critical_paths)
- `task_risk == "ALTO"` (frontmatter da task)

**`agent-spec-staff-architecture-review`** escala para `opus` se QUALQUER:
- `diff_touches_critical_path`
- `task_risk == "ALTO"`
- `qa_security_flags_not_empty` (JSON do QA traz `security_flags: [...]` não vazia)
- `retry_attempt >= 1` (≥ 2ª tentativa de Tech Review na mesma task)

### Diff Strategy

```
enabled: true
git_required: true       # aborta se não estiver em repositório git

qa_summary_fields:
  - veredito
  - security_flags
  - executou_testes
  - escopo_testes
  - tocou_area_critica
  - escopo_declarado    # Camada 0 do QA — checagem de presença dos entregáveis declarados na task
```

> Os `qa_summary_fields` são os ÚNICOS campos do JSON do QA enviados ao Tech Review (sumário mínimo). O JSON completo do QA é preservado pelo orquestrador para retry/observações, mas NÃO entra no prompt do Tech Review.

### Limpeza de Memória Temporária

```
cleanup_on_approval: true       # deleta T{N}.md ao aprovar AMBOS os gates
cleanup_stale_hours: 24         # cleanup idempotente no início do run
```

---

## Lógica de Seleção de Modelo (inline)

### 1. Parsing do frontmatter da task (seção 1 — Identificação)

O frontmatter usa **lista bullet markdown** (não YAML puro). Para cada linha `- **<chave>**: <valor>`:
1. Localize a seção `## 1. Identificação` (ou variação).
2. Extraia `{chave → valor}` removendo comentários `<!-- ... -->`, espaços e aspas.
3. Valide:
   - `model`: deve estar em `{opus, sonnet}` — **rejeita `haiku` com erro claro** (executor nunca em Haiku).
   - `risk`: deve estar em `{low, medium, high}`.
   - `gates`: deve ser `none`, `[qa]`, ou `[qa, tech_review]`.
4. Ausente/inválido → fallback (regras abaixo).

### 2. Resolução do modelo do executor (precedência)

```
resolved_model =
    1. task.frontmatter.model                              # declaração da task (default)
 OR 2. apply(executor_model_rules, task)                   # heurística embutida
 OR 3. "sonnet"                                            # fallback seguro
```

### 3. Auto-escalonamento em retry (executor)

Antes de invocar o executor, leia da memória lazy `T{N}.md` (se existir):
- `attempt_count` (quantas vezes já tentou — incrementa a cada retry)
- `last_severity` (último severity reportado por QA/Tech Review)

Se `resolved_model == "sonnet"` E (`attempt_count >= 2` OU `last_severity in {"ALTO", "CRITICO"}`):
- `effective_model = "opus[xhigh]"` (Opus com effort xhigh — raciocínio estendido)
- Appende em `shared.workflow_report.path`:
  ```markdown
  ### T[N] — escalonamento automático
  - Tentativa 1-2: sonnet, rejeitado (motivo: [resumo do último JSON QA/Tech Review])
  - Tentativa 3: escalado para opus[xhigh] (rule: attempt_count >= 2 OR severity == ALTO)
  ```
- Caso contrário: `effective_model = resolved_model`

### 4. Resolução de modelo dos gates

```
qa_model   = "sonnet"
tech_model = "sonnet"

# Aplicar escalation rules dos gates (ver "Configuração Embutida")
se diff_touches_critical_path OR task_risk == "ALTO"
   → qa_model   = "opus"
se diff_touches_critical_path OR task_risk == "ALTO"
   OR qa_security_flags_not_empty OR retry_attempt >= 1
   → tech_model = "opus"
```

### 5. Fast-path de gates

```
gates: none           → executor roda; SEM QA, SEM Tech Review
                        marcar concluída após executor
                        appende em _run/workflow-report.md: "T[N] executada sem gates"

gates: [qa]           → executor + QA apenas; PULA Tech Review

gates: [qa, tech_review]   → fluxo completo (default)
gates: ausente             → fluxo completo (compatibilidade retroativa)
```

### 6. Logs obrigatórios

Antes de invocar executor/gates, logue no terminal:

```
[T5] executor: sonnet (declarado)               gates: [qa, tech_review]
[T6] executor: opus (rule: critical_path)       gates: [qa, tech_review]
[T7] executor: sonnet (fallback)                gates: none (WARN: sem validação)
[T8] executor: opus (auto-escalated, attempt=2) gates: [qa, tech_review]
```
