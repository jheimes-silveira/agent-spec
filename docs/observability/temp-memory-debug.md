---
id: "temp-memory-debug"
title: "Inspeção de Memória Temporária"
sidebar_position: 3
---
# Inspeção de Memória Temporária

Memória lazy em `docs/specs/features/{feature}/{version}/tasks/.tmp/` é **descartável** mas pode ser útil para debug. Esta página é um guia operacional para inspecionar/depurar problemas de execução.

> Para a referência conceitual, veja [Memória Temporária](/configuration/temp-memory.html). Para histórico do antigo `execution-summary.md` (deprecado), veja [Memória Proativa](/advanced/proactive-memory.html).

---

## Diretório

```
docs/specs/features///tasks/.tmp/
├── T1.md # memória lazy (SÓ em rejeição)
├── T2.md
├── TC-001.md # TaskCard usa pattern diferente
└── ...
```
> **Mudança importante**: arquivos `T{N}-execution-summary.md` **não existem mais**. `base_sha` e o sumário do executor passam inline em `instrucoes` aos gates. Sem arquivo intermediário. Ver [Memória Proativa](/advanced/proactive-memory.html) para o histórico do corte.

---

## Durante a execução

Se um `*-run-tasks` está rodando E uma task foi rejeitada por algum gate, você pode inspecionar:

```bash
ls -lh docs/specs/features///tasks/.tmp/
cat docs/specs/features///tasks/.tmp/T5.md
```

Veja:

* **`attempt_count`**: quantas tentativas.
* **`last_severity`**: severidade do último problema.
* **JSON completo do gate que rejeitou** (Gate 1 ou Gate 2 ou ambos).
* **`git diff --stat`** dos arquivos tocados pela task.
* **Paths consolidados** (Criados/Modificados/Testes).

---

## Após aprovação

A memória lazy é **deletada automaticamente** quando:

* Gate 1 aprova **E** Gate 2 aprova (`approved`).
* OU task tem `gates: none` e executor concluiu.
* OU task tem `gates: [qa]` e Gate 1 aprovou.

Se você está investigando **post-mortem** uma task aprovada, o arquivo já não existe.

---

## Cleanup automático

No início de cada `*-run-tasks`:

```
[FASE 0] Cleanup memória stale (>24h):
- Removido: T7.md (mtime: 2026-04-26 14:00)
- Mantido: T9.md (mtime: 2026-04-28 09:00) — em uso
```

Protege contra órfãos por crashes ou interrupções.

---

## Cenários de debug

### "Não entendi por que essa task foi rejeitada"

Durante a execução, leia `T{N}.md`:

```bash
cat docs/specs/features///tasks/.tmp/T5.md
```

Você verá:

* `attempt_count`: quantas tentativas.
* `last_severity`: severidade do último problema.
* JSON completo do gate que rejeitou.
* `git diff --stat`.
* Paths tocados.

### "Task BLOQUEADA — quero entender o histórico"

```bash
cat docs/specs/features///tasks/.tmp/T12.md
```

Como a task foi bloqueada, o cleanup **não** rodou. O arquivo permanece com:

* `attempt_count: 3`
* JSONs dos 3 gates (último de cada tentativa).
* Diff stat.

Use isso para decidir se vai (a) ajustar a task e re-rodar, (b) ajustar o tech\_spec, ou (c) pular.

### "Custo está alto, parece que os gates estão relendo tudo"

`base_sha` e o sumário do executor (4-6 linhas) **devem** estar no `instrucoes` que o orquestrador passou ao Gate 1 e ao Gate 2. Não há mais arquivo para inspecionar — o sumário vive no prompt da sessão.

Se você suspeita que o sumário não está sendo passado: cheque os logs do orquestrador, deve aparecer `[T5] executor: ... | sumário capturado (4-6 linhas)`. Sem essa linha, é bug do orquestrador.

---

## `.gitignore`

Adicione sempre:

```
docs/specs/features/\*/\*/tasks/.tmp/
```

Memória lazy **não** deve ir para Git.

---

## Diferença vs `qa-observations.md`

| Aspecto | `tasks/.tmp/` | `qa-observations.md` |
| --- | --- | --- |
| Lifecycle | Descartável (cleanup automático; só nasce em rejeição) | Versionado (cresce indefinidamente) |
| Conteúdo | JSON completo dos gates, attempt\_count, diff | Sumário curto de eventos (escalações, bloqueios, log de `requires_qa_revalidation`, linha `[T{N}] base_sha=` por task) |
| Vai para Git? | Não | Sim |
| Útil para | Debug imediato de rejeições | Auditoria histórica |

---

## Próximos passos

* [Memória Temporária (referência)](/configuration/temp-memory.html) — paths e ciclo de vida.
* [Memória Proativa](/advanced/proactive-memory.html) — histórico do antigo execution-summary (deprecado; agora inline).
* [Gates e Loops](/concepts/gates-loops.html) — onde a memória lazy é criada/lida.
* [qa-observations.md](/observability/qa-observations.html) — log persistente.
