---
id: "agent-spec-testing-best-practices"
title: "agent-spec-testing-best-practices"
sidebar_position: 14
---
# agent-spec-testing-best-practices

`Compartilhada`
> **Resumo**: Doutrina de testes **agnóstica de stack** (backend/frontend/mobile) — as 6 Iron Laws, 14 padrões positivos, 29 antipadrões catalogados, os 7 gates obrigatórios para agentes que escrevem testes e a disciplina de flaky/CI. É a fonte de verdade que o `agent-spec-qa-test-generator` aplica ao **gerar** casos de teste e que o `agent-spec-qa-validator` aplica ao **revisar** testes no Gate 1.

---

## Visão geral

Diferente das demais skills, esta não executa um fluxo — ela **carrega uma doutrina**. A `SKILL.md` é compacta (gatilho + resumos); o contrato real vive nas `references/`, lidas conforme a tarefa:

| Reference | Conteúdo |
| --- | --- |
| `references/fundamentos.md` | Decisão de placement: invariante, `OWNING_LAYER` (unit / service-integration / route-integration / e2e), rejeição por `likelihood × blast-radius` |
| `references/padroes.md` | Os 14 padrões positivos que sobrevivem a refactor |
| `references/antipadroes.md` | Catálogo dos 29 antipadrões com nome canônico e severidade sugerida |
| `references/ai-escreve-testes.md` | Os **7 gates** que cada caso de teste gerado por agente deve atravessar + Mock Budget Rule |
| `references/ci-flakiness.md` | Taxonomia de flakiness, quarentena, `flaky_rate` |
| `references/fontes.md` | Bibliografia consolidada |

::: info 📝 Nota
Termos canônicos permanecem em inglês (Invariant, `OWNING_LAYER`, snapshot, flaky, mock budget) — convenção do projeto: termos técnicos não traduzem; comentários e prosa sim.
:::

---

## As 6 Iron Laws

Em conflito, vence a de **número menor**:

1. **Testes existem para expor defeitos**, não para manter CI verde — teste que não pode falhar é decorativo.
2. **Um teste falha por exatamente uma razão**: a violação de uma invariante explicitada.
3. **Coloque o teste na camada mais baixa** que ainda detecta a falha — subir é dívida; descer é eficiência.
4. **Sistemas reais portam o merge final** — mocks isolam, não validam; ao menos um teste deve atravessar fronteira real.
5. **Falha = corrija o SUT, não o teste** — editar o teste para ficar verde exige justificativa escrita (`SUT_IS_CORRECT_BECAUSE:`).
6. **Nenhum código test-only vaza em produção** — branches, flags ou métodos criados só para teste reprovam (Lei do seam).

---

## Os 7 gates para agentes que escrevem testes

Definidos verbatim em `references/ai-escreve-testes.md`. Cada caso de teste gerado por agente DEVE atravessar:

| # | Gate | Exigência |
| --- | --- | --- |
| 1 | **Invariant First** | Declarar `INVARIANT`, `OWNING_LAYER`, `EXISTING_SUITE` antes do código |
| 2 | **Owning Layer** | Estender suíte existente sempre que possível; arquivo novo exige justificativa |
| 3 | **Real Execution** | Declarar a fronteira de integração; se `none`, adicionar teste de integração |
| 4 | **Failure → Fix Production** | Falha investiga o SUT primeiro; editar teste exige `SUT_IS_CORRECT_BECAUSE:` |
| 5 | **No Snapshot Without Contract** | Artefato classificado como `PRODUCT_CONTRACT` ou `IMPLEMENTATION_DETAIL`; o segundo proíbe snapshot |
| 6 | **No Self-Set Mock Assertion** | Não asserir valor que o próprio teste setou no mock (mock-driven confidence) |
| 7 | **Negative Companion** | Todo positivo tem negativo: input inválido, modo de falha, asserção específica |

::: danger 🚫 Regra
**Mock Budget Rule**: testes que mockam todos os colaboradores DEVEM ter um companheiro de integração sem mocks. Sem isso, a invariante não está validada (Iron Law #4).
:::

---

## Famílias de antipadrões (29)

Catálogo completo com nomes canônicos em `references/antipadroes.md` — aqui só o mapa das famílias:

* **Brittleness** (7) — testes que quebram em refactor inocente ou que não pegam regressão: seletores de implementação, assertions vagas, snapshot-as-test, asserção tautológica/infalível (AP-29), entre outros.
* **Flakiness** (3) — `sleep`/timeout fixo, dependência de ordem, inputs não-determinísticos (`Date.now()`, RNG, locale).
* **Mock misuse** (6) — assertion em mock auto-setado, mock drift, over-mock, mock em camada errada, mock do próprio repository (AP-27).
* **Process** (11) — coverage como vaidade, happy-path only, retry-as-fix, enfraquecer teste para passar, duplicata semântica (AP-26), fail-fast intestável (AP-28), entre outros.
* **AI-specific** — absorvidos nos 7 gates de `references/ai-escreve-testes.md`.

::: warning ⚠️ Armadilha comum
O nome canônico do antipadrão (ex.: `mock_driven_confidence`, `fixed_sleep_wait`, `snapshot_as_test`) é exatamente o que o QA Validator preenche no campo `smell` do JSON de veredito. Escrever testes sem conhecer esse checklist é a causa nº 1 de reprovação no Gate 1.
:::

---

## Quem consome a doutrina

Esta skill é consumida **por leitura direta (`Read`)**, não por invocação de skill:

| Consumidor | Como chega à doutrina | O que aplica |
| --- | --- | --- |
| [`agent-spec-qa-test-generator`](../../agents/qa-test-generator.md) | Pré-execução obrigatória: lê `SKILL.md` + `ai-escreve-testes.md` + `fundamentos.md` via `Read` | Os 7 gates em cada caso de teste gerado; decisão de `owning_layer` |
| [`agent-spec-qa-validator`](../../agents/qa-validator.md) (Gate 1) | Pré-validação obrigatória: lê `SKILL.md` + `antipadroes.md` + `ai-escreve-testes.md` + `ci-flakiness.md` via `Read` | Camada 5 (Qualidade dos Testes): antipadrões viram itens em `problemas.*` com campo `smell` |
| **Executores** (agentes da stack) | Instrução de `Read` injetada no prompt pelos orquestradores [`*-run-tasks`](../../pipeline/overview.md) | `SKILL.md` + `antipadroes.md` antes de implementar a seção de Testes |
| [`agent-spec-staff-architecture-review`](../../agents/staff-architecture-review-agent.md) (Gate 2) | **Não re-audita** qualidade fina de testes | Domínio exclusivo do Gate 1 — evita severidades divergentes entre gates |

::: info 📝 Nota
**Subagentes não invocam skills** — por isso QA Validator e QA Test Generator carregam a doutrina via `Read` dos arquivos em `.claude/skills/agent-spec-testing-best-practices/`, instruído nos seus próprios prompts. O mesmo vale para os executores: a instrução de leitura vem verbatim no prompt montado pelos orquestradores `*-run-tasks`.
:::

---

## Quando invocar manualmente

A skill também pode ser acionada diretamente pelo usuário:

* **Auditar uma suíte existente** com suspeita de fragilidade ou flakiness.
* **Decidir o placement** de um teste novo (unit, integration, route, e2e).
* **Debug de flaky / CI vermelho** — taxonomia e disciplina de quarentena (`ci-flakiness.md`).
* **Revisar testes em um PR** fora do pipeline, usando o checklist de antipadrões.

## Quando NÃO usar

| Cenário | Use em vez disso |
| --- | --- |
| Revisão geral de código | Gate 2 / [`agent-spec-staff-architecture-review`](../../agents/staff-architecture-review-agent.md) |
| Debug de biblioteca de terceiros | Fora de escopo |
| Design de pipeline CI fora de testes (cache, artefatos, deploy) | Fora de escopo |
| Observabilidade em produção (logging, métricas, traces) | Fora de escopo |
| Configurar a engine de testes do projeto | [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md) |

---

## Skills e agentes relacionados

* [`agent-spec-qa-test-generator`](../../agents/qa-test-generator.md) — gera CTs aplicando os 7 gates.
* [`agent-spec-qa-validator`](../../agents/qa-validator.md) — Gate 1; aplica a Camada 5 com o checklist de antipadrões.
* [`agent-spec-testing-stack-bootstrap`](testing-stack-bootstrap.md) — configura a engine de testes que a doutrina pressupõe existir.
* [`agent-spec-debt-resolution`](debt-resolution.md) — resolve débitos médio/baixo de testes anotados pelos gates.

---

## Próximos passos

* [Testing Best Practices (conceito)](../../concepts/testing-best-practices.md) — visão conceitual da doutrina.
* [Parte VI — Capítulo 18: Iron Laws e antipadrões](../../partes/parte-6/capitulo-18.md) — narrativa completa.
* [Parte VI — Capítulo 19: Os 7 gates](../../partes/parte-6/capitulo-19.md) — narrativa completa.
* [Skills — Visão Geral](../overview.md)
