---
id: "auto-escalation"
title: "Auto-escalação em Retry"
sidebar_position: 3
---
# Auto-escalação em Retry

Evita "spiral of death" — tentativas repetidas do executor em Sonnet quando a task é mais complexa do que a heurística previu.

---

## O problema

Cenário observado: task gerada com `model: sonnet` falha no Gate 1. Executor corrige. Falha de novo. Corrige. Falha de novo.

**Por quê**: Sonnet não tem capacidade suficiente para entender a sutileza (ex.: serialização `data:null` vs `data:[]`, contrato JSON específico). Em vez de 3 tentativas infrutíferas, **a 3ª tentativa deveria usar Opus**.

---

## A solução

Os orquestradores `*-run-tasks` aplicam auto-escalação automática quando atingem certos triggers. A configuração vive **embutida** em cada orquestrador.

Padrão equivalente:

```
auto_escalate:
  enabled: true
  after_attempts: 2          # escala na 3ª tentativa
  severity_trigger: "high"   # ou se gate retornou severity=high
  target_model: "opus"
  log_to_observations: true
```

---

## Gatilhos

A escalação ocorre se `resolved_model == sonnet` e **QUALQUER**:

| Trigger | Condição |
| --- | --- |
| `attempt_count >= 2` | 3ª tentativa em diante (contando a partir de 1) |
| `last_severity` ∈ {`high`, `critical`} | Gate retornou severity alta (ou crítica) na última rodada |
| `diff_touches_critical_path` | Path em [critical_paths](../configuration/critical-paths.md) |
| `task_risk == "high"` | Frontmatter da task |
| `qa_security_flags` não vazio (Gate 2) | QA detectou problemas de segurança |
| `retry_attempt >= 1` (Gate 2) | Segundo olho criterioso após primeira rejeição |

---

## Fluxo

```
Tentativa 1: executor sonnet → Gate 1 REJEITADO (severity=medium)
             • memória lazy criada com JSON do gate
             • attempt_count = 1

Tentativa 2: executor sonnet (lê memória lazy + JSON anterior)
             corrige problemas listados
             → Gate 1 REJEITADO ainda (severity=medium)
             • attempt_count = 2

Tentativa 3: auto-escalation ativa (attempt_count >= 2)
             executor OPUS (lê memória lazy atualizada)
             → Gate 1 APROVADO
             → Gate 2 approved
             → git add | task Concluída
```

---

## Log em qa-observations.md

A escalação é registrada em `qa-observations.md` (`shared.qa_observations.path`):

```markdown
## 2026-04-28

### T5 — escalação automática
- Tentativa 1-2: sonnet, rejeitado (testes de integração falhando, severity=medium)
- Tentativa 3: escalado para opus (rule: attempt_count >= 2)
- Resultado: aprovado em ambos os gates
```

---

## Hard stop em 3 tentativas

Mesmo com auto-escalação, o framework para em **3 tentativas TOTAIS**:

```
Tentativa 1: sonnet → REJEITADO
Tentativa 2: sonnet → REJEITADO
Tentativa 3: opus (auto-escalado) → REJEITADO
             ↓
        BLOQUEADO. Framework para e escala ao usuário.
```

Não tenta uma 4ª tentativa. O usuário recebe relatório completo (JSONs dos gates, memória lazy, paths) e decide manualmente.

---

## Por que escalar para Opus

| Aspecto | Sonnet | Opus |
| --- | --- | --- |
| Pattern recognition | Sólido para casos comuns | Melhor para casos sutis |
| Síntese de critérios complexos | Bom | Excepcional |
| Evita repetir o mesmo erro | OK | Mais confiável |
| Custo por invocação | ~3-5× menor | ~3-5× maior |

> A escalação é **lazy**: o sistema só paga Opus quando Sonnet falhou. Se a task aprova na primeira tentativa em Sonnet, você nunca paga Opus.

---

## Compatibilidade com fast-paths

| Cenário | Comportamento |
| --- | --- |
| `gates: none` | Sem gate → sem retry → sem auto-escalação |
| `gates: [qa]` | Auto-escalação aplica em Gate 1 (mesmo critério) |
| `gates: [qa, tech_review]` | Auto-escalação aplica em ambos os gates |

---

## Próximos passos

* [Gates e Loops](../concepts/gates-loops.md) — fluxo de loop em rejeição.
* [Model Selection](model-selection.md) — frontmatter da task.
* [Critical Paths](../configuration/critical-paths.md) — outro vetor de escalação.
* [Override Models](../customization/override-models.md) — forçar modelo manualmente.
