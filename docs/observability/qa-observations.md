---
id: "qa-observations"
title: "qa-observations.md"
sidebar_position: 2
---
# qa-observations.md

Agregador de **eventos não-corriqueiros** do pipeline de execução. Inclui:

* **Auto-escalações** (sonnet→opus em retry, critical\_paths, security\_flags).
* **Tasks executadas com `gates: none`** (audit trail explícito).
* **Tasks bloqueadas** após 3 tentativas.
* **`base_sha` por task** — linha `[T{N}] base_sha=<sha>` gravada na pré-execução (FASE 2.1); é o fallback que permite ao resume reconstruir o diff da task quando a memória lazy ainda não existe.

> **Importante**: na **política débito-controlado** atual, `APROVADO_COM_OBSERVACOES` (Gate 1) e `approved_with_observations` (Gate 2) são vereditos válidos para tasks com apenas `medio`/`baixo` em categorias `code_review_only` (code\_quality, naming, style, documentation, dead\_code, imports). Esses problemas viram **débito anotado** aqui em `qa-observations.md` com `correcao_sugerida` por item. A skill [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html) recolhe o débito acumulado entre as tasks de uma feature e gera uma `v{N+1}-debits/` com tasks de cleanup, fechando o ciclo. Tasks com débito anotado **não disparam loop** — só `REJEITADO` / `rejected` / `partial` disparam.

---

## Path

Resolvido via `shared.qa_observations.path` no [framework-paths.md](/configuration/framework-paths.html):

```
/docs/specs/features/{feature}/{version}/qa-observations.md
```

Um arquivo por feature, **appendado** incrementalmente.

---

## Estrutura

```markdown
# Observações de QA — backend-figurinhas-copa v1
> Log de auto-escalações, fast-paths e tasks bloqueadas.
## 2026-04-28
### T5 — base\_sha (pré-execução)
- [T5] base\_sha=abc1234ef
- (persistida na pré-execução de cada task; usada pelo resume pós-interrupção como fallback quando a memória lazy ainda não existe)
### T5 — auto-escalação automática
- Tentativa 1: sonnet → REJEITADO (severity=medium, CRIT-001)
- Tentativa 2: sonnet → REJEITADO (severity=medium, CRIT-001 ainda presente)
- Tentativa 3: escalado para opus (rule: attempt\_count >= 2)
- Resultado: APROVADO em ambos os gates.
### T7 — escalação Gate 2 por security\_flags
- Gate 1: APROVADO com `security\_flags: ["hardcoded\_secret"]`
- Gate 2: escalado para opus (rule: qa\_security\_flags não vazio)
- Resultado: approved.
### T9 — executada sem gates (gates: none)
- Task: Atualizar README com instruções de setup
- model: sonnet | risk: low | gates: none
- Sem validação automática. Review manual recomendado.
### T12 — BLOQUEADA após 3 tentativas
- Tentativa 1: sonnet → REJEITADO (CRIT-002)
- Tentativa 2: sonnet → REJEITADO (CRIT-002 persistente)
- Tentativa 3: opus → REJEITADO (CRIT-002 persistente)
- Status: Bloqueada
- Próximo passo: revisar manualmente, ajustar task ou tech\_spec, re-rodar.
- JSON dos gates preservado em `docs/specs/features/{feature}/{version}/tasks/.tmp/T12.md` (até cleanup).
```

---

## Tipos de eventos registrados

| Evento | Quando | Severidade |
| --- | --- | --- |
| **Auto-escalação executor** | Task com `model: sonnet` que escala para `opus` em retry | Info |
| **Auto-escalação Gate 2** | Tech Review escalado por security\_flags ou retry | Info |
| **Critical path detected** | Task tocou path em [critical\_paths](/configuration/critical-paths.html) | Info |
| **`gates: none`** | Task pulou todos os gates por declaração explícita | Aviso |
| **Task BLOQUEADA** | 3 tentativas sem aprovação dos dois gates | Erro |

---

## Quem grava

Os 3 orquestradores (`agent-spec-sdd-run-tasks`, `agent-spec-minispec-run-tasks`, `agent-spec-taskcard-run`) **appendam** entradas durante a execução. **Não há remoção automática**.

---

## Quando consultar

* **Pós-execução**: revisar todas as auto-escalações para entender se a heurística inicial estava errada.
* **Tasks bloqueadas**: ver o que falhou.
* **Audit trail**: features em produção podem precisar prova de que validação foi aplicada.
* **Antes de iniciar v{N+1}**: revisar débitos `MEDIO`/`BAIXO` anotados (categorias `code_review_only` — `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`). Esses débitos passaram pelos gates pela política débito-controlado e ficaram para "cleanup futuro".

---

## Resolvendo débitos acumulados

`qa-observations.md` é a **fonte primária** consumida pela skill [`/agent-spec-debt-resolution`](/skills/shared/debt-resolution.html). Workflow recomendado:

```bash
# 1. Feature foi executada via /agent-spec-minispec-run-tasks ou /agent-spec-sdd-run-tasks.
# qa-observations.md tem entradas APROVADO\_COM\_OBSERVACOES com débitos MEDIO/BAIXO.
# 2. Antes de partir para v2 funcional, limpe os débitos:
/agent-spec-debt-resolution docs/specs/features//v1/
# A skill:
# a) Lê qa-observations.md e extrai débitos elegíveis.
# b) Pergunta o especialista da stack (Go/Flutter/JS/etc.) via descoberta interativa.
# c) Especialista classifica cada débito como recomendado\_corrigir ou perfumaria.
# d) Usuário escolhe interativamente quais incluir.
# e) Gera v2-debits/ com tasks de cleanup (gates: [qa]).
# 3. Execute o cleanup:
/agent-spec-minispec-run-tasks docs/specs/features//v2-debits/task\_plan.md 
```

Após a execução, a skill appenda no próprio `qa-observations.md` da v1 um log marcando quais débitos foram resolvidos — fechando o ciclo do débito anotado pela política débito-controlado.

---

## Não confundir com

| Arquivo | Propósito |
| --- | --- |
| **`qa-observations.md`** (esta) | Log de eventos de execução (versionado) |
| **`tasks/.tmp/T{N}.md`** ([memória lazy](/configuration/temp-memory.html)) | Memória de retry, descartável (só nasce em rejeição) |
| `base_sha` + sumário do executor | Persistidos em memória do orquestrador e passados inline no prompt dos gates (sem arquivo). Ver [Memória Proativa](/advanced/proactive-memory.html). |

A `qa-observations.md` **é versionada** (entra no Git). Memórias temporárias **não**.

---

## Próximos passos

* [Auto-escalação](/advanced/auto-escalation.html) — heurística que gera as entradas.
* [Fast-path Gates](/advanced/fast-path-gates.html) — `gates: none` que aparece aqui.
* [State Files](/observability/state-files.html) — outro tipo de arquivo de observabilidade.
* [agent-spec-debt-resolution (skill)](/skills/shared/debt-resolution.html) — consome débitos `MEDIO`/`BAIXO` deste arquivo e gera `v{N+1}-debits/` para cleanup.
* [Memória Temporária Debug](/observability/temp-memory-debug.html) — `docs/specs/features/{feature}/{version}/tasks/.tmp/`.
