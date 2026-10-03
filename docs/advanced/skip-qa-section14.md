---
id: "skip-qa-section14"
title: "Skip QA quando a Estratégia de Testes está completa"
sidebar_position: 7
---
# Skip QA quando a Estratégia de Testes do tech\_spec está completa

A **otimização mais agressiva** do pipeline de geração SDD. Elimina 70-90% das invocações [agent-spec-qa-test-generator](/agents/qa-test-generator.html) em features SDD bem-especificadas.

---

## Contexto

[agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) é incentivado a gerar **Estratégia de Testes** com todos os CTs detalhados:

* Tabela `CT-XX | tipo | componente | input | expected | mock | CA-XX`.
* Rastreabilidade completa CA → CT.

Quando isso acontece, os CTs **já existem**. Invocar `agent-spec-qa-test-generator` de novo para cada task **reformata** o mesmo conteúdo — trabalho de baixo valor agregado.

---

## Solução: redistribuição heurística

[agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) pré-verifica:

```
SE tech\_spec.md tem a Estratégia de Testes com >=10 CTs detalhados E cada CT tem mapeamento para CA:
→ REDISTRIBUIÇÃO HEURÍSTICA
→ NÃO invocar agent-spec-qa-test-generator para essas tasks
→ Invocar apenas em fallback (CTs sem match claro)
SENÃO:
→ Fluxo tradicional (invoca agent-spec-qa-test-generator)
```

---

## Algoritmo de redistribuição

1. **Parse da Estratégia de Testes**: extrai tabela com `CT, componente, tipo, input, expected, mock, CA`.
2. **Mapear componente → task**: para cada task, lê a seção Arquivos (§5.1/§5.2) e extrai paths. Match via grep:

   * CT-XX menciona `internal/pings/handler/` → task que tem `internal/pings/handler/ping_handler.go` em §5.1 → CT-XX pertence à task.
3. **Para CTs sem match**: agrupa e apresenta ao usuário via `AskUserQuestion`.
4. **Mostra distribuição proposta**:

   ```
   Distribuição proposta (extraída da Estratégia de Testes do tech\_spec):
   T1: CT-01, CT-02, CT-03 (3 CTs)
   T2: CT-04, CT-05 (2 CTs)
   T3: CT-06 (1 CT)
   T4: CT-07, CT-08 (2 CTs)
   T5: CT-09 (1 CT)
   T6: CT-10, CT-11, CT-12 (3 CTs)
   T7: CT-13, CT-14 (2 CTs)
   T8: CT-15 (1 CT)
   Total: 15/15 CTs distribuídos; 0 em fallback.
   Aprovar? [s/N]
   ```
5. **Se aprovado**: salva cada task com seus CTs na seção 6 (sem invocar agent-spec-qa-test-generator).
6. **Se rejeitado**: cai para fluxo tradicional ([agent-spec-qa-test-generator](/agents/qa-test-generator.html) invocado normalmente).

---

## Economia estimada

Em features onde [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) já produz a Estratégia de Testes completa (comportamento recomendado):

| Cenário | Invocações de `agent-spec-qa-test-generator` | Tokens economizados |
| --- | --- | --- |
| Sem redistribuição (8 tasks) | 8 invocações | — |
| Com redistribuição + 0 fallback | 0 invocações | ~8 × 9k = **~72k** |
| Com redistribuição + 2 fallback | 1-2 invocações consolidadas | ~50-60k |

Em features mal-especificadas (a Estratégia de Testes vazia ou incompleta), a redistribuição **não dispara** e a economia é zero.

---

## Quando funciona melhor

| Condição | Efeito |
| --- | --- |
| `agent-spec-sdd-generate-tech-spec` foi rodado com `agent-spec-qa-test-generator` invocado na Estratégia de Testes | Estratégia de Testes completa → redistribuição funciona |
| Estratégia de Testes manual mas com tabela bem formatada | Funciona |
| Estratégia de Testes incompleta (apenas 3-4 CTs) | Não dispara — cai para tradicional |
| Estratégia de Testes sem mapeamento CA-XX | Não dispara — falha o critério |

---

## Trade-offs

* **+** Economia massiva em features SDD bem-especificadas.
* **+** Garante consistência: CTs gerados uma vez no tech\_spec valem para todas as tasks.
* **−** Exige a Estratégia de Testes completa upstream. Se o tech\_spec for raso, a otimização não aplica.
* **−** Requer aprovação do usuário (1 confirmação) para evitar redistribuição errada.

---

## Combinação com outras otimizações

| Otimização | Quando |
| --- | --- |
| [qa\_context pré-extraído](/advanced/qa-context.html) | Sempre (antes desta) |
| **Skip QA da Estratégia de Testes (esta)** | Se a Estratégia de Testes completa → economia máxima |
| [Consolidação por camada](/advanced/qa-consolidation.html) | Aplica nos fallbacks que não foram redistribuídos |

---

## Próximos passos

* [qa\_context Pré-extraído](/advanced/qa-context.html).
* [QA Consolidation](/advanced/qa-consolidation.html) — para os fallbacks.
* [agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) — onde a Estratégia de Testes é gerada.
* [agent-spec-sdd-generate-task-plan](/skills/sdd/sdd-generate-task-plan.html) — onde a redistribuição roda.
