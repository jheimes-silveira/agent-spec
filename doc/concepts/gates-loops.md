---
id: "gates-loops"
title: "Gates e Loops"
sidebar_position: 5
---
# Gates e Loops

Toda task implementada pelo framework passa por **2 gates sequenciais** antes de ser considerada concluída. Esta página é a referência central — todas as skills orquestradoras (`*-run-tasks`) linkam para cá.

> **TL;DR**: Executor → persiste `base_sha` + sumário enxuto em memória → **Gate 1 (QA)** → **Gate 2 (Tech Review)** (ambos recebem `base_sha` + sumário INLINE no prompt) → `git add`. Em rejeição, loop de correção até 3 tentativas, com auto-escalação sonnet→opus. **Política débito-controlado**: críticos/altos bloqueiam, médios/baixos passam como débito anotado (cleanup futuro via [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md)).

---

## Pipeline canônico

```
        Executor (agent_name da stack)
               │
               ▼
    [base_sha + executor_summary persistidos em memória do orquestrador]
               │
               ▼
┌──────── Gate 1 ─ agent-spec-qa-validator (Sonnet → Opus em crítico) ────────┐
│  • Camada 0: Completude de escopo declarado (entregáveis §5/§3)    │
│  • Critérios de aceitação                                          │
│  • Robustez (null, vazio, async, race)                             │
│  • Segurança de superfície                                         │
│  • Qualidade de testes + ADR Compliance Light                      │
│  • EXECUTA suíte de testes (único gate que roda)                   │
│  • Débito-controlado: críticos/altos rejeitam; médios/baixos anotam│
└── APROVADO / APROVADO_COM_OBSERVACOES ── REJEITADO (loop) ────────┘
                              │              │
                              │              └─→ loop de correção
                              ▼
┌──────── Gate 2 ─ agent-spec-staff-architecture-review (Sonnet → Opus) ┐
│  • Arquitetura e camadas                                          │
│  • Boas práticas (clean code, DRY, coesão)                        │
│  • Conformidade com ADRs                                          │
│  • Segurança profunda (IDOR, escalação, fluxos de token)          │
│  • Qualidade dos testes                                           │
│  • Recebe diff git + sumário mínimo do QA (não JSON completo)     │
└─────── approved ────────────┬──────── partial / rejected ─────────┘
                              │              │
                              │              └─→ loop de correção
                              ▼
                  git add -- <paths> (stage, sem commit)
                              │
                              ▼
                       Task Concluída
```

---

## Gate 1 — agent-spec-qa-validator

[Ver agente completo](../agents/qa-validator.md).

### Propósito

Validação **funcional + execução de testes** após o executor concluir.

### Escopo

| Valida | NÃO valida (é Gate 2) |
| --- | --- |
| **Camada 0** — Completude de escopo declarado (arquivos a criar/modificar declarados na task estão entregues) | Arquitetura e camadas |
| Corretude vs critérios de aceitação | Conformidade com ADRs (análise profunda — só Camada 6 light) |
| Robustez (null, vazio, async, race) | Segurança profunda estrutural |
| Segurança de superfície (input validation, XSS óbvio, secrets fixos no código) | Segurança profunda (IDOR, escalação, CSP, fluxos de token) |
| Completude (mensagens, estados visuais) | Qualidade estrutural (acoplamento sistêmico) |
| **Qualidade dos testes** — antipadrões (mock-driven confidence, snapshot-as-test, sleep fixo, etc.) via skill [`agent-spec-testing-best-practices`](testing-best-practices.md) | — |
| Existência dos testes exigidos | — |
| **Execução da suíte de testes** | — |

### Modelo

* Default: **Sonnet**
* Escala para **Opus** quando:
  + `diff_touches_critical_path` (toca path em [critical paths](../configuration/critical-paths.md))
  + `task_risk: high` no frontmatter

### Política débito-controlado (regra de veredito)

O veredito é **determinado pela contagem por severidade**, não por julgamento subjetivo:

| Condição | Veredito |
| --- | --- |
| `criticos == [] && altos == [] && medios == [] && baixos == []` | `APROVADO` |
| Só há `medios` e/ou `baixos` (sem críticos nem altos) | `APROVADO_COM_OBSERVACOES` |
| Há `criticos` ou `altos` | `REJEITADO` |

> **Filosofia**: bloqueia o que é **risco real** — bug funcional, vulnerabilidade, teste flaky, antipadrão que mascara regressão (`criticos` e `altos`). Anota o que é **débito de manutenibilidade** — magic string, naming subótimo, duplicação leve, padrão de teste discutível (`medios` e `baixos`). Cada `medio`/`baixo` continua registrado em `problemas.*` com `correcao_sugerida` — o orquestrador propaga para [`qa-observations.md`](../observability/qa-observations.md) e a skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) recolhe esse débito acumulado para gerar uma `v{N+1}-debits/` da feature com tasks de cleanup.
>
> **Por que não zero-débito**: política zero-débito força loops de correção de 5-8 min por problema BAIXO trivial (ex.: extrair constante de uma magic string num teste que já passa). Custo de tokens e tempo não compensa o ganho marginal. Débito-controlado mantém a barra alta no que importa (críticos/altos NUNCA passam) e permite progresso no que é estilístico.

### JSON de saída (essencial)

```json
{
  "resumo": {
    "veredito": "APROVADO | APROVADO_COM_OBSERVACOES | REJEITADO",
    "nota_qualidade": 0
  },
  "criterios_aceitacao": [
    { "id": "CA-01", "descricao": "...", "status": "PASSOU | FALHOU | PARCIAL" }
  ],
  "escopo_declarado": {
    "fonte": "task_secao_arquivos | ausente",
    "arquivos_a_criar_declarados": [],
    "arquivos_a_criar_entregues": [],
    "arquivos_a_criar_faltantes": [],
    "arquivos_a_modificar_declarados": [],
    "arquivos_a_modificar_tocados": [],
    "arquivos_a_modificar_faltantes": [],
    "subtasks_sem_evidencia": []
  },
  "problemas": {
    "criticos": [{ "id": "CRIT-001", "categoria": "logic", "titulo": "...", "passos_reproducao": "...", "correcao_sugerida": "..." }],
    "altos": [], "medios": [], "baixos": []
  },
  "adr_compliance": {
    "adrs_consultadas": [],
    "violacoes_grep_detectaveis": []
  },
  "testes_executados": {
    "executou_testes": true,
    "escopo": "SUITE_COMPLETA | PARCIAL | NAO_EXECUTADO",
    "tocou_area_critica": false,
    "detalhes_falhas": []
  },
  "testing_smells": {
    "antipadroes_detectados": [
      { "id": "TS-001", "nome": "mock_driven_confidence", "familia": "mock_misuse", "severidade": "CRITICO", "problema_relacionado": "CRIT-001" }
    ],
    "red_flags_detectadas": [],
    "mock_budget_violado": false,
    "determinismo_observado": "ok"
  },
  "security_flags": [],
  "files_reviewed": [
    { "path": "...", "sha256": "...", "summary": "..." }
  ]
}
```

**Campos críticos**:

* `escopo_declarado`: apuração da Camada 0 — entregáveis declarados na task (`§5.1/§5.2` no SDD ou `§3.1/§3.2` no miniSpec) vs efetivamente entregues. Faltante → CRÍTICO `categoria: "logic"`.
* `tocou_area_critica`: orienta o Gate 2 a re-executar testes ou não.
* `security_flags[]`: se não vazio, **escala Gate 2 para Opus**.
* `files_reviewed[]`: lista que o Gate 2 confia para evitar reler arquivos.
* `adr_compliance`: Camada 6 — sweep grep-detectável de ADRs ativas; violações entram em `problemas.*` com `categoria: "adr_compliance"`.
* `testing_smells.antipadroes_detectados[]`: cada smell detectado pela skill [`agent-spec-testing-best-practices`](testing-best-practices.md) referencia o ID do problema em `problemas.*` via `problema_relacionado`.
* `problemas.*[].categoria`: campo obrigatório (vocabulário canônico em [`agent-spec-workflow-rules.md`](../configuration/path-templates.md)). Orquestrador usa para decidir `requires_qa_revalidation` no loop de correção.

---

## Gate 2 — agent-spec-staff-architecture-review

[Ver agente completo](../agents/staff-architecture-review-agent.md).

### Propósito

Revisão **arquitetural + ADRs + segurança profunda** após o QA aprovar.

### Escopo

| Valida | NÃO valida (é Gate 1) |
| --- | --- |
| Separação de camadas e dependências | Corretude funcional |
| Boas práticas (clean code, DRY, coesão, complexidade) | Robustez funcional óbvia |
| Qualidade de código (nomenclatura, magic numbers, duplicação) | Segurança de superfície (input validation óbvio) |
| Conformidade com `.claude/rules/*` e convenções do projeto | — |
| **Conformidade com ADRs** (`docs/adr/*`) | — |
| Segurança profunda (IDOR, escalação, fluxos de token, CSP, certificate pinning) | — |
| Qualidade profunda dos testes (determinismo, asserções, antipatrões) | — |

### Re-executa testes? Quase nunca.

Apenas se:

* QA reportou `executou_testes: false` ou `escopo: NAO_EXECUTADO`.
* QA reportou `escopo: PARCIAL` E `tocou_area_critica: true`.
* Detecta violação `critical` em `architecture` ou `security` que pode causar regressão.

### Modelo

* Default: **Sonnet**
* Escala para **Opus** (mais agressivo que Gate 1) quando:
  + `diff_touches_critical_path`
  + `task_risk: high`
  + `qa_security_flags` não vazio
  + `retry_attempt >= 1` (segundo olho criterioso após uma rejeição prévia)

### Input

O Gate 2 **NÃO recebe o JSON completo do QA**. Recebe apenas:

| Campo | Origem | Uso |
| --- | --- | --- |
| `base_sha` | Orquestrador (inline em `instrucoes`) | Para gerar `git diff <base_sha> -- <path>` |
| Sumário do executor (4-6 linhas) | Orquestrador (inline em `instrucoes`) | Tech Review usa para entender intenção do executor |
| Lista de arquivos categorizada (NOVOS vs MODIFICADOS) | Orquestrador | Decide reler ou confiar no diff |
| Sumário mínimo do QA: `veredito`, `nota_qualidade`, `security_flags`, `executou_testes`, `escopo_testes`, `tocou_area_critica`, `escopo_declarado` | QA Validator | Decide se re-executa testes; escala modelo; verifica que entregáveis declarados foram entregues |

### JSON de saída (essencial)

```json
{
  "status": "approved | approved_with_observations | partial | rejected | skipped_qa_rejected",
  "problems": [
    {
      "id": "P1",
      "severity": "critical | high | medium | low",
      "category": "architecture | project_pattern | code_quality | best_practices | testability | security | adr_compliance | ...",
      "description": "...",
      "expected": "...",
      "impact": "...",
      "suggested_fix": "...",
      "adr_referenciada": "ADR-0004"
    }
  ],
  "adrs_consultadas": [
    { "id": "ADR-0001", "arquivo": "docs/adr/0001-repository-service.md", "relevancia": "alta | media | baixa" }
  ]
}
```

### Política débito-controlado (regra de status)

| Condição | Status |
| --- | --- |
| `problems: []` (nenhum problema de qualquer severidade) | `approved` |
| Há `medium` e/ou `low` (sem `critical` nem `high`) | `approved_with_observations` |
| Há `high` (sem `critical`) | `partial` |
| Há `critical` | `rejected` |
| QA retornou `REJEITADO` (sumário) | `skipped_qa_rejected` |

> **Filosofia**: bloqueia o que é **risco arquitetural real** — violação de ADR clara, vulnerabilidade estrutural, acoplamento sistêmico (`critical` e `high`). Anota o que é **débito de qualidade** — naming subótimo, duplicação leve, sugestão de legibilidade, ADR desatualizada (`medium` e `low`). Cada `medium`/`low` continua em `problems[]` com `suggested_fix` — vai para [`qa-observations.md`](../observability/qa-observations.md) e é recolhido pela skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md).

---

## Loop de correção

Em rejeição (Gate 1 ou Gate 2), o orquestrador entra em loop até **3 tentativas TOTAIS compartilhadas** entre os dois gates. O contador **não reseta** entre gates.

> **Importante**: `APROVADO_COM_OBSERVACOES` (Gate 1) e `approved_with_observations` (Gate 2) **não disparam loop**. São aprovações com débito anotado. O loop só dispara em `REJEITADO` / `rejected` / `partial` (Gate 2).

### Fluxo de uma rejeição

```
1. Orquestrador cria/atualiza memória lazy:
   <feature>/<v>/tasks/.tmp/T{N}.md
   ├─ attempt_count (incrementado)
   ├─ last_severity (maior do gate que rejeitou)
   ├─ JSON completo do gate que rejeitou
   ├─ requires_qa_revalidation (calculado se Gate 2 rejeitou)
   ├─ git diff --stat
   └─ paths tocados

2. Aplica auto-escalação se trigger atingido (ver tabela abaixo)

3. Calcula requires_qa_revalidation (apenas se Gate 2 rejeitou):
   • Categorias do JSON em {architecture, security, tests, logic,
     data_handling, error_handling, performance, concurrency,
     adr_compliance} → true (re-QA)
   • Categorias em {code_quality, naming, style, documentation,
     dead_code, imports} → false (skip QA, só Gate 2)
   • Override por sinais externos (security_flags, !executou_testes,
     diff_touches_critical_path) sempre força true

4. Monta prompt de correção:
   • Lista TODOS os problemas (qualquer severidade) sem filtro
   • Critérios de aceite não atendidos
   • Detalhes de testes que falharam
   • Instrução: "Corrija APENAS os problemas listados.
                  Não expanda escopo."

5. Delega ao executor com modelo escalado (se aplicável)

6. Re-valida (bifurca conforme classificação):
   • Gate 1 rejeitou → re-roda APENAS Gate 1
   • Gate 2 rejeitou + requires_qa_revalidation=true  → Gate 1 + Gate 2
   • Gate 2 rejeitou + requires_qa_revalidation=false → SÓ Gate 2

7. Atualiza attempt_count e last_severity na memória lazy

8. Loga em qa-observations.md (auditoria obrigatória):
   ### T{N} — retry classification
   - attempt: {N}
   - problemas_por_categoria: { ... }
   - overrides_ativos: [...]
   - requires_qa_revalidation: <bool>
   - decisao: <PULE QA | RE-RODE QA + Tech Review>
   - justificativa: "..."

9. Saída:
   • Aprovado → avança / conclui
   • Rejeitado novamente → volta ao passo 2
   • attempt_count >= 3 → marca BLOQUEADO, escala ao usuário
```

> **Log obrigatório** (auditoria): após calcular `requires_qa_revalidation`, o orquestrador deve persistir o bloco markdown acima em `qa-observations.md`. Permite distinguir bug do algoritmo de execução correta — exigência adicionada após o post-mortem `cadastro-pratos-franquia` (T10 levantou suspeita de re-QA indevido em `naming/style`).
>
> O campo `categoria` é **obrigatório em cada `problemas.*[]`** do JSON do `agent-spec-qa-validator` e do `agent-spec-staff-architecture-review`. Vocabulário canônico definido na rule [`agent-spec-workflow-rules.md`](../configuration/path-templates.md).
>
> Detalhes da classificação em [Gates Condicionais](../advanced/conditional-gates.md).

### Tabela de auto-escalação sonnet→opus

| Trigger | Quem escala | Quando |
| --- | --- | --- |
| `path` toca `critical_paths` | Executor / QA / Tech Review | Antes de invocar |
| `task_risk: high` (frontmatter) | Executor / QA / Tech Review | Antes de invocar |
| `files_to_create_count >= 10` | Executor (heurística de tamanho) | Antes de invocar |
| `attempt_count >= 2` | Executor (auto-escalação em retry) | Em rejeição |
| `last_severity == high` | Executor (auto-escalação em retry) | Em rejeição |
| `qa_security_flags` não vazio | Tech Review | Antes de invocar Gate 2 |
| `retry_attempt >= 1` | Tech Review (segundo olho) | Em retry |

> O orquestrador **registra** em `qa-observations.md` toda escalação aplicada para auditoria.

### Hard stop em 3 tentativas

```
Tentativa 1: sonnet (default)              → REJEITADO
Tentativa 2: sonnet (ainda)                → REJEITADO
Tentativa 3: opus (auto-escalado)          → REJEITADO
             ↓
        BLOQUEADO. Framework para e pergunta ao usuário.
```

O framework **não tenta loop infinito**. O usuário recebe relatório completo (todos os JSONs dos gates, memória lazy, paths tocados) e decide próximos passos manualmente.

---

## Memória temporária — uma forma (lazy) + inline no prompt

### `T{N}.md` — lazy

Vive em `/docs/specs/features/{feature}/{version}/tasks/.tmp/` (volátil, fora do versionamento via `.gitignore`).

* **Criada por**: orquestrador, **apenas** em rejeição de gate.
* **Lida por**: executor (no retry), Gate 1 / Gate 2 (contexto de retry).
* **Conteúdo**: `attempt_count`, `last_severity`, JSON completo do(s) gate(s) que rejeitaram, paths tocados.
* **Apagada quando**: ambos os gates aprovam.

> **Por quê?** Permite ao executor ver histórico de tentativas e o que cada gate rejeitou, sem expandir o contexto do orquestrador.

### `base_sha` + sumário do executor — inline (não em arquivo)

* **Persistidos por**: orquestrador, **sempre** após executor concluir, em variáveis em memória da sessão.
* **Lidos por**: Gate 1 e Gate 2, inline em `instrucoes` no prompt.
* **Conteúdo**: 2 campos — `base_sha` (SHA usado pelo Tech Review para `git diff`) + output enxuto do executor (4-6 linhas, intenção).

> A versão anterior do framework gravava um arquivo `T{N}-execution-summary.md` com `git diff --stat`, hashes SHA-256 pré/pós e paths consolidados. Esses campos eram redundantes (Tech Review GERA diff sozinho via `git diff <base_sha> -- <path>`) ou nunca consultados (sha256-skip nunca foi implementado no agent). Cortado em prol de fluxo mais simples — ~300-800 tokens × 2 gates × N tasks economizados por run. Ver [Memória Proativa](../advanced/proactive-memory.md) para histórico.

Veja [Memória Temporária](../configuration/temp-memory.md) para detalhes do path e ciclo de vida.

---

## Fast-paths — pulando gates

Tasks declaram fast-path no frontmatter:

```markdown
- model: sonnet
- risk: low
- gates: none | [qa] | [qa, tech_review]
```

| Declaração | Fluxo | Caso de uso |
| --- | --- | --- |
| `gates: none` | Apenas executor → `git add` | Docs/configs puros (README, .gitignore, Makefile). Sem código executável. Zero impacto em ADRs. |
| `gates: [qa]` | Executor → Gate 1 → `git add` | Refactor isolado, schema puro, mudança trivial em arquivo único |
| `gates: [qa, tech_review]` (default) | Fluxo completo | Default — toda task com lógica nova |
| `gates:` ausente | Default `[qa, tech_review]` | Compatibilidade retroativa |

> Em `gates: none`, o orquestrador appende em `qa-observations.md`: "T[N] executada sem gates por declaração explícita".

Detalhes e critérios em [Fast-path Gates](../advanced/fast-path-gates.md).

---

## Por que essa arquitetura

| Decisão | Motivo |
| --- | --- |
| **2 gates sequenciais** (não paralelos) | Gate 2 confia no JSON do Gate 1; rodar em paralelo desperdiça e pode aprovar código que o QA reprovaria |
| **Gate 1 executa testes; Gate 2 não** | Evita re-execução cara; QA é o "olho funcional", Tech Review é o "olho arquitetural" |
| **Sumário mínimo, não JSON completo** | Tech Review lê 6 campos em vez de 50; economia de ~5k tokens por task |
| **Política débito-controlado** | Críticos/altos sempre bloqueiam. Médios/baixos viram débito anotado em [`qa-observations.md`](../observability/qa-observations.md). A skill [`/agent-spec-debt-resolution`](../skills/shared/debt-resolution.md) recolhe esse débito acumulado e gera uma `v{N+1}-debits/` da feature com tasks de cleanup, fechando o ciclo |
| **3 tentativas com hard stop** | Loop infinito é pior que escalar — preserva o tempo do usuário |
| **Auto-escalação sonnet→opus em retry** | Sonnet errou 2× — provavelmente o problema exige modelo mais capaz |
| **Memória lazy** | Cria custo só quando há rejeição; aprovação na primeira tentativa não cria nada |

---

## Próximos passos

* [agent-spec-qa-validator (Gate 1)](../agents/qa-validator.md) — agente completo, JSON, regras críticas.
* [agent-spec-staff-architecture-review (Gate 2)](../agents/staff-architecture-review-agent.md) — agente completo, fluxo de diff, validação ADR.
* [Auto-escalação](../advanced/auto-escalation.md) — detalhes da heurística sonnet→opus.
* [Fast-path Gates](../advanced/fast-path-gates.md) — skip estático via `gates: none / [qa]`.
* [Gates Condicionais](../advanced/conditional-gates.md) — skip dinâmico em retry (`requires_qa_revalidation`).
* [Memória Proativa](../advanced/proactive-memory.md) — histórico do antigo `execution-summary.md` (deprecado; agora inline).
* [Pipeline de Execução](../pipeline/overview.md) — visão dos 3 orquestradores que disparam tudo isso.
* [agent-spec-debt-resolution](../skills/shared/debt-resolution.md) — resolve débitos `MEDIO`/`BAIXO` acumulados em `qa-observations.md`, fechando o ciclo do débito-controlado.
