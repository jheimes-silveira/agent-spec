---
id: "agent-spec-adr-supersede"
title: "agent-spec-adr-supersede"
sidebar_position: 5
---
# agent-spec-adr-supersede

`ADR` `Generator`
> **Resumo**: Substitui uma ADR existente por uma nova. Marca a antiga com `status: superseded-by:NNNN`, registra a substituição em `Consequences`, **preserva** o histórico de `Applied in`, regenera o INDEX.md e gera relatório de features que ainda referenciam a antiga.

---

## Quando usar

* Decisão arquitetural anterior **foi substituída** por outra (não apenas depreciada).
* Você quer **rastreabilidade explícita** entre a decisão antiga e a nova.

## Quando NÃO usar

* ADR não tem substituta direta → use [agent-spec-adr-deprecate](adr-deprecate.md).
* Apenas atualizar conteúdo de ADR existente → edite manualmente (raro; ADR deve ser estável).

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| `<old-id>` | Usuário (argumento) | Sim |
| `[new-id-ou-titulo]` | Usuário (argumento) | Não — se ausente, sub-fluxo de criação dispara |

### Dois ramos do fluxo

| Ramo | Trigger | Comportamento |
| --- | --- | --- |
| **NEW_EXISTS** | `[new-id]` é um ID de ADR existente | Liga a antiga à nova, atualiza ambas |
| **NEW_NOVA** | `[new-titulo]` é um título sugerido OU 2º argumento ausente | Sub-fluxo de criação **auto-contido** (não delega para `/agent-spec-adr-create`), depois liga |

### Heurística de decisão de ramo

| Cenário | Ramo |
| --- | --- |
| 2º argumento é numérico (ex.: `0042`) E arquivo `{adr.dir}/0042-*.md` existe | **NEW_EXISTS** |
| 2º argumento é numérico E arquivo NÃO existe | Erro: ADR-NNNN não existe; rode `/agent-spec-adr-list` para conferir |
| 2º argumento é alfanumérico (slug/título) | **NEW_NOVA** |
| 2º argumento ausente | **NEW_NOVA** com sub-fluxo coletando título via `AskUserQuestion` |

### Idempotência

Se a OLD já tem `status: superseded-by:NNNN`, a skill **encerra com aviso** — não duplica marca em `Consequences` nem reabre o ciclo. Para criar nova substituta sobre ADR já superseded, edite manualmente primeiro.

---

## Outputs

| Artefato | O que muda |
| --- | --- |
| ADR antiga (`{old-id}-{slug}.md`) | `status: superseded-by:NNNN`; nota em `Consequences` |
| ADR nova (`{new-id}-{slug}.md`) | Criada (NEW_NOVA) ou atualizada com referência reversa em `Context` (NEW_EXISTS) |
| `INDEX.md` | Regenerado |
| **Relatório** de features que ainda referenciam a OLD | Impresso ao usuário (não modifica artefatos) |

---

## Princípios invioláveis

1. **Não apague história** — `Applied in` da ADR antiga e o conteúdo original **permanecem**. Supersede **acrescenta** marca; não remove conteúdo.
2. **Migração de features é manual** — `Applied in` da OLD **NUNCA** é migrado automaticamente para a NEW. Cada feature decide se adota a substituta atualizando a própria subseção "ADRs Aplicáveis nesta Feature".
3. **Recursos canônicos** — usa template canônico de [agent-spec-adr-create](adr-create.md) (no ramo NEW_NOVA) e script canônico de [agent-spec-adr-reindex](adr-reindex.md).
4. **Token-efficient** — abre apenas o arquivo da OLD + (NEW_EXISTS) o arquivo da NEW + varredura focada de `docs/specs/**/*.md` para o relatório final.
5. **Decisão com confirmação humana** — toda info da NEW (no ramo NEW_NOVA) vem do usuário via `AskUserQuestion`.

---

## Convenção de status

| Estado | Significado | Pode ser referenciada? |
| --- | --- | --- |
| `accepted` | Decisão ativa | Sim |
| `deprecated` | Decisão **não recomendada**, sem substituta direta | Sim (com warning) |
| `superseded-by:NNNN` | Substituída pela ADR `NNNN` | Sim (com aviso para migrar) |

> Esta skill opera **exclusivamente** na transição `accepted | deprecated → superseded-by:NEW`. Para depreciar sem substituta, use [agent-spec-adr-deprecate](adr-deprecate.md).

---

## Fluxo de execução

### Ramo NEW_EXISTS (nova ADR já existe)

1. Lê ADR antiga → atualiza `status: superseded-by:{new-id}`.
2. Adiciona nota em `Consequences` da OLD: `"Substituída pela ADR-{new-id} em YYYY-MM-DD"`.
3. Lê ADR nova → adiciona referência reversa em `Context`: `"Substitui ADR-{old-id}"`.
4. Executa `node {adr.reindex_script}`.
5. Varre `docs/specs/**/*.md` em busca de referências à OLD → imprime relatório.

### Ramo NEW_NOVA (nova ADR não existe)

> **Auto-contenção**: o sub-fluxo é **executado DENTRO desta skill** — não delega para `/agent-spec-adr-create` como chamada separada. Replica o template canônico e a coleta via `AskUserQuestion`, mas sob controle de `/agent-spec-adr-supersede` para garantir o link bidirecional atômico.

1. Coleta Context/Decision/Consequences/Alternatives/Tags via `AskUserQuestion` (replica o fluxo de `agent-spec-adr-create`).
2. Calcula próximo ID disponível (`{adr.dir}/NNNN-*.md`).
3. Cria a nova ADR `{new-id}-{slug}.md` a partir do `adr.template`.
4. **NÃO copia o `Applied in` da OLD** — a nova ADR começa com `Applied in: []` (migração de features é manual, ver Princípio Inviolável #2).
5. Aplica passos do ramo NEW_EXISTS (atualiza OLD, regenera INDEX, gera relatório).

---

## Gates invocados

Nenhum.

---

## Templates / assets usados

* `adr.template` (de [agent-spec-adr-create](adr-create.md)) — apenas no ramo NEW_NOVA.
* `adr.reindex_script` (de [agent-spec-adr-reindex](adr-reindex.md)) — sempre.

---

## Exemplo de uso

```bash
# Ramo NEW_EXISTS:
/agent-spec-adr-supersede 0017 0042

# Ramo NEW_NOVA:
/agent-spec-adr-supersede 0017 "rotacao-tokens-com-refresh"
```

```
[Lê 0017-jwt-token-rotation.md]
[Sub-fluxo NEW_NOVA: coleta Context, Decision, ...]
[Cria 0042-rotacao-tokens-com-refresh.md]
[Atualiza 0017: status: superseded-by:0042]
[node reindex.cjs]

[Relatório: features que referenciam ADR-0017]
- /docs/specs/features/auth-revisao/v1/scope.md
- /docs/specs/features/login-social/v1/tech_spec.md (subseção "ADRs Aplicáveis nesta Feature")

✅ ADR-0017 substituída por ADR-0042. Migre features acima manualmente.
```

---

## Skills relacionadas

* [agent-spec-adr-create](adr-create.md) — sub-fluxo no ramo NEW_NOVA.
* [agent-spec-adr-deprecate](adr-deprecate.md) — alternativa quando não há substituta.
* [agent-spec-adr-show](adr-show.md) — verificar a nova ADR após supersede.
* [agent-spec-adr-reindex](adr-reindex.md) — script canônico que esta skill invoca.

## Configuração via framework-paths.md

Paths usados: `adr.dir`, `adr.index_file`, `adr.template`, `adr.reindex_script`, `shared.specs_glob`. Veja [Path Templates](../../configuration/path-templates.md).
