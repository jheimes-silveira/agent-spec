---
id: "proactive-memory"
title: "Memória Proativa (deprecada — passou a ser inline)"
sidebar_position: 5
---
# Memória Proativa — DEPRECADA

> **Mudança importante**: a "memória proativa" como arquivo (`{task_id}-execution-summary.md`) foi **removida**. `base_sha` e o sumário do executor passam agora **inline em `instrucoes`** do QA e do Tech Review. Este arquivo permanece para fins históricos.

---

## Por que foi removida

A versão anterior gravava 6 campos no `{task_id}-execution-summary.md`:

1. `base_sha`
2. Sumário do executor (4-6 linhas)
3. `git diff --stat`
4. Hashes SHA-256 pré/pós
5. Paths consolidados (Criados/Modificados/Deletados)
6. Cabeçalho com metadados

Auditoria honesta do que cada campo gerava:

| Campo | Valor real | Decisão |
| --- | --- | --- |
| `base_sha` | ✅ Alto — Tech Review precisa para `git diff <base_sha> -- <path>` | **mantido**, agora passa inline no prompt |
| Sumário do executor | ✅ Médio — Tech Review usa para entender intenção | **mantido**, agora passa inline no prompt |
| `git diff --stat` | ❌ Tech Review GERA diff sozinho via `git diff <base_sha> -- <path>` por arquivo. `--stat` no summary nunca era consultado | **cortado** |
| Hashes SHA-256 pré/pós | ❌ A justificativa era "Tech Review pula releitura se hash igual" — esse comportamento **nunca foi implementado** no contrato do agent. Operação cara (`sha256sum × N arquivos`) sem benefício | **cortado** |
| Paths consolidados | ❌ Já estão nas seções 5.1/5.2 da task individual | **cortado** |
| Existência como arquivo em disco | ❌ Para 2 informações úteis, write/read/cleanup é overhead | **cortado** |

### Economia estimada após o corte

* ~300-800 tokens por gate × 2 gates × N tasks por feature.
* ~1-3s wall-clock por task (sem `sha256sum × N`, sem write/read/cleanup de arquivo).
* Remove 6-10 arquivos órfãos potenciais em `.tmp/` durante um run.
* Simplifica o fluxo de retry (memória lazy `T{N}.md` é a única fonte de verdade em rejeição).

---

## Como funciona hoje (inline)

Após o executor concluir, o orquestrador persiste em **variáveis em memória** (não em disco):

```
base\_sha = "a1b2c3d" # capturado no Passo X.1
executor\_summary = """
✅ T5 — handler REST /pings / Arquivos: 4 criados, 2 modificados /
Testes: 12/12 implementados (go test) / Pendências: nenhuma
"""
```

Esses 2 campos são **passados inline em `instrucoes`** ao QA e ao Tech Review:

```
arquivos:
- 
- 
- 
instrucoes:
## Contexto da execução
- base\_sha: a1b2c3d
- Sumário do executor:
✅ T5 — handler REST /pings / Arquivos: 4 criados, 2 modificados /
Testes: 12/12 implementados (go test) / Pendências: nenhuma
## Critérios de aceite
...
## Testes exigidos (rastreabilidade BLOQUEANTE)
...
```

Não há mais arquivo `.tmp/{task_id}-execution-summary.md` criado, lido ou apagado.

---

## Diferença vs memória lazy

| Aspecto | Memória lazy `{task_id}.md` | Inline no prompt (substitui memória proativa) |
| --- | --- | --- |
| **Quando nasce** | Só em rejeição de gate | Sempre (mas em memória, não em disco) |
| **Conteúdo** | JSON completo do gate + attempt\_count + last\_severity + diff | `base_sha` + 4-6 linhas do executor |
| **Forma** | Arquivo em `.tmp/{task_id}.md` | Variáveis em memória, passadas inline no prompt |
| **Consumido por** | Executor na correção | Gate 1 e Gate 2 na validação |
| **Lifecycle** | Deletada ao aprovar os gates **aplicáveis** (só QA quando `gates: [qa]`) | Vive na sessão do orquestrador; nada a deletar |

A memória lazy continua existindo — é fluxo diferente (retry), com tracking explícito de `attempt_count`/`last_severity` e payload pesado (JSON completo do gate que rejeitou). Esse caso de uso ainda justifica arquivo em disco.

---

## Próximos passos

* [Memória Temporária](/configuration/temp-memory.html) — referência do que ainda existe em disco (memória lazy).
* [Gates e Loops](/concepts/gates-loops.html) — onde `base_sha` + sumário do executor são consumidos inline.
* [qa\_context Pré-extraído](/advanced/qa-context.html) — economia análoga durante geração de tasks.
* [Observabilidade — Memória Temporária](/observability/temp-memory-debug.html) — debug.
