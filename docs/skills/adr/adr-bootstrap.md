---
id: "agent-spec-adr-bootstrap"
title: "agent-spec-adr-bootstrap"
sidebar_position: 1
---
# agent-spec-adr-bootstrap

`ADR` `Generator`
> **Resumo**: Analisa um projeto existente e propõe **corpus inicial** de ADRs a partir de decisões já tomadas (em `CLAUDE.md`, `.claude/rules/`, configs, código, specs). Apresenta candidatos um a um para aprovação humana e gera as ADRs com reindex final do INDEX.md.

---

## Quando usar

* **Onboarding de ADR em projeto existente** que ainda não tem corpus de decisões documentadas.
* Após adotar o framework em um codebase que já tem padrões implícitos.

## Quando NÃO usar

* Projeto greenfield sem decisões transversais ainda — comece com [agent-spec-adr-create](/skills/adr/adr-create.html) por demanda.
* Adicionar uma única decisão nova → use [agent-spec-adr-create](/skills/adr/adr-create.html).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Codebase do projeto | Varredura focada | Sim |
| `CLAUDE.md` + `.claude/rules/*` + configs | Lidos para detectar decisões | Sim |
| Diretório `src/`, `internal/`, `lib/` | Análise de padrões | Sim |
| Diretório `docs/specs/` | Detecção de decisões transversais usadas em features | Sim |

## Outputs

| Artefato | Path resolvido | Quantidade |
| --- | --- | --- |
| ADRs novas | `adr.dir/{id}-{slug}.md` | N (uma por decisão aprovada) |
| `INDEX.md` regenerado | `adr.index_file` | 1 |

---

## Princípios invioláveis

1. **Decisão com confirmação humana** — NUNCA cria ADR sem aprovação explícita. Toda detecção é proposta.
2. **Token-efficient** — leituras mínimas e focadas (não varre arquivos inteiros sem necessidade).
3. **Single source of truth** — ADR captura decisão transversal; nunca duplica PRD/Tech Spec.
4. **Recursos canônicos** — usa template canônico de [agent-spec-adr-create](/skills/adr/adr-create.html) (`adr.template`) e script canônico de [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) (`adr.reindex_script`).

---

## Tags canônicas (controladas)

Toda ADR criada usa **1 a 3 tags** desta lista de 14:

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```
> Tag fora da lista é **proibida**. Se nenhuma cobre o tema, sinaliza ao usuário que é caso de atualizar a lista primeiro (e não cria a ADR).

---

## Critérios de existência (TODOS verdadeiros)

Antes de propor uma ADR, valida:

| Critério | Pergunta | OK se |
| --- | --- | --- |
| `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? | SIM |
| `tag_alvo` | Cai em uma das 14 tags canônicas? | SIM |
| `custo_reversao` | Reverter implicaria refactor significativo (≥ médio) em múltiplos lugares? | SIM |

---

## Fluxo de execução

1. **Varredura focada** do projeto (CLAUDE.md, rules, configs, src/, specs).
2. **Detecta candidatos** aplicando heurísticas.
3. **Apresenta candidato 1** ao usuário com Context/Decision/Consequences pré-preenchidos.
4. Usuário aprova/rejeita/ajusta.
5. Se aprovado: cria `{id}-{slug}.md` no `adr.dir`.
6. Repete para próximo candidato.
7. Ao final: executa `node {adr.reindex_script}` para regenerar `INDEX.md`.

---

## Gates invocados

Nenhum.

---

## Templates / assets usados

* `adr.template` (de [agent-spec-adr-create](/skills/adr/adr-create.html)) — template Nygard enxuto.
* `adr.reindex_script` (de [agent-spec-adr-reindex](/skills/adr/adr-reindex.html)) — regenera INDEX.

---

## Exemplo de uso

```bash
/agent-spec-adr-bootstrap
```
```
[Varredura: detectou 5 candidatos]
Candidato 1/5:
Tipo: Repository + Service Pattern
Tag: architecture
Detectado em: internal/users, internal/produtos, internal/pedidos
Aceita propor como ADR? (s/N)
> s
[Cria 0001-repository-service-pattern.md]
[Próximos candidatos...]
✅ 4 ADRs criadas (1 rejeitada).
✅ INDEX.md regenerado.
```

---

## Skills relacionadas

* [agent-spec-adr-create](/skills/adr/adr-create.html) — criar ADR individual (alternativa à varredura).
* [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) — script canônico que esta skill invoca.
* [agent-spec-adr-list](/skills/adr/adr-list.html) — listar ADRs após bootstrap.
* [agent-spec-adr-show](/skills/adr/adr-show.html) — exibir ADR específica.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `adr.template`, `adr.reindex_script`. Veja [Path Templates](/configuration/path-templates.html).
