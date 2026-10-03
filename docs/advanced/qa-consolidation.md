---
id: "qa-consolidation"
title: "Consolidação QA por Camada"
sidebar_position: 6
---
# Consolidação QA por Camada

Em vez de **N tasks → N invocações de agent-spec-qa-test-generator**, agrupa por **camada arquitetural** e dispara 1 subagente por camada.

---

## Problema

Sem consolidação, cada task invocava 1 [agent-spec-qa-test-generator](/agents/qa-test-generator.html) independente. Cada subagente pagava **~3k de system-prompt + ~6k de MCP overhead = ~9k fixos**.

Em 8 tasks: **72k de overhead fixo** repetido desnecessariamente. Tasks relacionadas da mesma camada (todas no mesmo módulo) não compartilhavam contexto.

---

## Solução

### SDD

[agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) agrupa tasks por camada:

| Camada | Tipos de tasks agrupadas |
| --- | --- |
| **infra** | setup de projeto, config, docker, migrations schema, logger, envelope de erro |
| **dominio** | domain models, services de negócio, repositories, validadores |
| **integracao** | handlers REST/gRPC, wiring DI, middlewares |
| **e2e + packaging** | testes E2E, smoke, CI, README, Dockerfile final |

Para cada camada com ≥ 1 task, dispara **1 subagente agent-spec-qa-test-generator** com:

**Instruções**:

```
Você está gerando testes para um GRUPO de tasks relacionadas.
Retorne JSON com chave por task ID:
{
"T1": { "casos\_teste": [...] },
"T2": { "casos\_teste": [...] }
}
Cada task mantém seu próprio array de casos de teste.
```

**Arquivos**:

* `.qa_context.md`
* Todas as tasks do grupo (concatenadas)
* Arquivos relevantes compartilhados pelo grupo

### miniSpec

[agent-spec-minispec-generate-tasks](/skills/minispec/minispec-generate-tasks.html) aplica a mesma lógica.

### TaskCard (batch mode)

Quando **≥3 TaskCards** são geradas em sequência compartilhando domínio, [agent-spec-taskcard-generate](/skills/taskcard/taskcard-generate.html) agrupa por path mais comum e dispara 1 subagente por domínio.

---

## Economia estimada

### SDD com 8 tasks em 4 camadas

| Cenário | Subagentes | Tokens overhead |
| --- | --- | --- |
| Antes (1 por task) | 8 | 8 × 9k = **72k** |
| Depois (1 por camada) | 4 | 4 × 9k = **36k** |
| **Economia** | — | **~36k tokens** |

### miniSpec com 4 tasks em 3 camadas

| Cenário | Subagentes | Tokens overhead |
| --- | --- | --- |
| Antes | 4 | 36k |
| Depois | 3 | 27k |
| **Economia** | — | ~9k tokens |

---

## Combinação com outras otimizações

A consolidação por camada **complementa** outras otimizações:

| Otimização | Quando se aplica |
| --- | --- |
| [qa\_context pré-extraído](/advanced/qa-context.html) | Antes da consolidação — reduz tokens de leitura por subagente |
| [Skip QA quando a Estratégia de Testes completa](/advanced/skip-qa-section14.html) | Antes da consolidação — pode eliminar 70-90% das invocações |
| **Consolidação por camada** | Aplica nas invocações restantes |

> Em features SDD bem-especificadas com a Estratégia de Testes completa, a consolidação **nem precisa rodar** — o Skip QA já elimina a maioria das invocações.

---

## Logs

```
[generate-task-plan] Camada `infra` (3 tasks): T1, T2, T3
[generate-task-plan] Camada `dominio` (2 tasks): T4, T5
[generate-task-plan] Camada `integracao` (2 tasks): T6, T7
[generate-task-plan] Camada `e2e+packaging` (1 task): T8
[generate-task-plan] → 4 subagentes agent-spec-qa-test-generator (vs. 8 sem consolidação)
```

---

## Próximos passos

* [qa\_context Pré-extraído](/advanced/qa-context.html) — combinar com este.
* [Skip QA quando a Estratégia de Testes completa](/advanced/skip-qa-section14.html) — eliminar invocações redundantes.
* [Contexto Mínimo](/concepts/minimum-context.html) — princípio geral.
* [agent-spec-qa-test-generator](/agents/qa-test-generator.html) — agent invocado por estas otimizações.
