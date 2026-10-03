---
id: "minimum-context"
title: "Princípio do Contexto Mínimo"
sidebar_position: 4
---
# Princípio do Contexto Mínimo

> Cada subagente recebe **apenas o mínimo necessário** para cumprir sua função. Specs completas nunca trafegam upstream quando um resumo denso resolve.

Este princípio atravessa todo o framework. É a principal razão pela qual features SDD caem de ~1.5M para ~500-800k tokens com as otimizações aplicadas.

---

## Padrões concretos

### 1. TaskCard como referência mínima

A TaskCard passa **apenas o próprio `.md`** ao subagente executor. Nada de PRD, nada de tech_spec — não existem nesse caminho. Este é o padrão ideal que SDD/miniSpec **refatoraram para aproximar**.

### 2. qa_context.md pré-extraído

Antes de disparar N invocações de [agent-spec-qa-test-generator](../agents/qa-test-generator.md), o orquestrador gera **uma única vez** um resumo denso do tech_spec:

```
tech_spec.md  (~10.5k tokens, muitas seções)
    │
    │  Passo 0 — agent-spec-sdd-generate-task-plan extrai
    ▼
qa_context.md  (~1.5k tokens, denso)
    │
    │  passado como input para N subagentes
    ▼
[QA-gen 1, QA-gen 2, ..., QA-gen N]  — cada um lê ~1.5k em vez de ~10.5k
```

**Economia**: `8k × N` tokens por feature. Em 8 tasks ≈ ~60-80k tokens economizados.

Detalhes em [qa_context pré-extraído](../advanced/qa-context.md).

### 3. `base_sha` + sumário do executor inline (não em arquivo)

Após o executor concluir, o orquestrador persiste em **memória da sessão** (não em disco):

* `base_sha` — usado pelo Tech Review para gerar `git diff <base_sha> -- <path>`.
* Sumário do executor (4-6 linhas) — usado pelo Tech Review para entender intenção.

Esses 2 campos são passados **inline em `instrucoes`** ao Gate 1 e ao Gate 2.

```
Executor implementa
    │
    │  Orquestrador captura em memória: base_sha + sumário 4-6 linhas
    ▼
Gate 1 (QA) recebe inline (base_sha + sumário) + paths tocados em arquivos[]
    │
    ▼
Gate 2 (Tech Review) recebe inline (base_sha + sumário) + sumário mínimo do QA
        (não relê arquivos que o QA cobriu, salvo critical_paths)
```

**Economia**: ~300-800 tokens × 2 gates × N tasks vs versão anterior que gravava arquivo `T{N}-execution-summary.md`. Ver [Memória Proativa](../advanced/proactive-memory.md) para histórico do corte.

### 4. Tech Review confia em `files_reviewed[]` do QA

O JSON do Gate 1 emite `files_reviewed[]`:

```json
{
  "files_reviewed": [
    {
      "path": "internal/pings/handler.go",
      "sha256": "abc123...",
      "summary": "Handler REST /pings com validação de input; implementa CA-01 e CA-03"
    }
  ]
}
```

O Gate 2 **confia no summary** e só relê quando:

* Path bate com [critical_paths](../configuration/critical-paths.md).
* Hash difere (raro).
* Detecta violação `critical` em `architecture` ou `security`.

### 5. Sumário mínimo do QA → Tech Review

O Gate 2 recebe **6 campos** do JSON do Gate 1, não o JSON completo:

```
veredito, nota_qualidade, security_flags,
executou_testes, escopo_testes, tocou_area_critica
```

Economia: ~5k tokens por task. O JSON completo do QA fica com o orquestrador para auditoria/retry.

Veja [Gates e Loops](gates-loops.md) para o fluxo completo.

### 6. MCP allowlist enxuta

MCPs não listados no `.mcp.json` da feature **não carregam suas instruções** no system-prompt dos subagentes. Apenas os MCPs estritamente necessários permanecem.

**Por quê**: cada MCP extra adiciona ~0.5-1k tokens ao system prompt × todos os subagentes invocados. Economia cumulativa expressiva em features grandes.

Veja [MCP Allowlist](../configuration/mcp-allowlist.md).

### 7. Redistribuição heurística de CTs

Em SDD, a Estratégia de Testes do `tech_spec.md` já vem com CTs. O `agent-spec-sdd-generate-task-plan` **redistribui esses CTs por task** via match componente↔task (grep por paths da seção Arquivos da task) em vez de invocar `agent-spec-qa-test-generator` de novo. Elimina 70-90% das invocações QA em features bem-especificadas.

Veja [Skip QA quando a Estratégia de Testes completa](../advanced/skip-qa-section14.md).

### 8. Consolidação por camada

Quando `agent-spec-qa-test-generator` precisa ser invocado para gerar testes, o orquestrador **agrupa tasks por camada** (infra/domínio/integração/e2e+packaging) e dispara **1 subagente por camada**, retornando JSON com chave por task ID. Reduz de N invocações para ~4.

Veja [QA Consolidation](../advanced/qa-consolidation.md).

---

## Consequências práticas

* **Subagentes mais rápidos**: system-prompt menor → latência menor.
* **Custo linear com trabalho real**: overhead fixo não escala com número de tasks.
* **Melhor cache hit**: prompt estável aproveita cache da API por mais tempo.
* **Modelos menores funcionam melhor**: Sonnet rende mais quando tem contexto enxuto e relevante.

---

## Onde olhar se suspeita de regressão de custo

Se uma feature ficou cara além do esperado:

1. **Sumário do executor está passando inline**? Cheque os logs do orquestrador — deve aparecer `[T5] executor: ... | sumário capturado (4-6 linhas)`. Sem essa linha, gates recebem prompt incompleto.
2. **`qa_context.md` existe** na pasta da feature? Se não, Passo 0 do `agent-spec-sdd-generate-task-plan` foi pulado.
3. **Tokens reportados pelos subagentes**: se Gate 1 está lendo >5k só do tech_spec, `qa_context.md` está sendo ignorado.
4. **Gate 2 está relendo** arquivos listados em `files_reviewed[]` do Gate 1 sem justificativa? Se sim, o reuso não está ativo (ver hash bate, path fora de `critical_paths`).

Veja [Observabilidade — State Files](../observability/state-files.md).

---

## Próximos passos

* [Gates e Loops](gates-loops.md) — onde a maioria das otimizações de contexto vive.
* [qa_context pré-extraído](../advanced/qa-context.md).
* [Memória Proativa](../advanced/proactive-memory.md).
* [Skip QA quando a Estratégia de Testes completa](../advanced/skip-qa-section14.md).
* [QA Consolidation](../advanced/qa-consolidation.md).
