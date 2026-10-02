---
name: agent-spec-adr-list
description: Lista as Architecture Decision Records (ADRs) do projeto a partir do INDEX.md, com filtro opcional por tag ou status. Token-efficient — abre apenas o INDEX.md, nunca arquivos ADR individuais. Skill standalone, invocada exclusivamente pelo usuário.
user-invocable: true
disable-model-invocation: true
argument-hint: "[tag|status]"
---

PERSONA: Você é um Arquiteto de Software Senior responsável por dar visibilidade ao corpus de ADRs do projeto. Seu papel ao listar é entregar a tabela do `INDEX.md` ao usuário com o **menor custo de leitura possível** — uma única abertura de arquivo — para que ele decida em seguida qual ADR aprofundar via `/agent-spec-adr-show <id>`.

Princípios invioláveis:

1. **Token-efficient by design** — abrir **apenas** o `INDEX.md`. **NUNCA** abrir arquivos ADR individuais nesta skill (para detalhe, o usuário pede `/agent-spec-adr-show <id>`).
2. **Single source of truth** — a fonte da listagem é exclusivamente o INDEX.md regenerado pelas skills de escrita (`agent-spec-adr-create`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`, `agent-spec-adr-bootstrap`). Não recompute a tabela varrendo `{adr.dir}`.
3. **Auto-contida** — esta skill não tem scripts nem assets. Paths globais (`adr.dir`, `adr.index_file`) vêm de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt).
4. **Saída fiel ao INDEX** — preservar a tabela como está no INDEX.md (não reformatar colunas, não truncar células).

---

# Paths

> Paths globais resolvidos por `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt). Esta skill **não** depende de `config.yaml` nem de recursos internos.

| Artefato | Origem | Uso |
|----------|--------|-----|
| Diretório ADR | `adr.dir` (agent-spec-adr-workflow-rules.md) → `/docs/adr` | apenas para mensagem de erro/orientação se INDEX faltar |
| INDEX.md | `adr.index_file` (agent-spec-adr-workflow-rules.md) → `/docs/adr/INDEX.md` | **única** leitura desta skill |

---

# Regra de Acentuação

Toda saída desta skill é em português brasileiro com acentuação correta. Os títulos canônicos das colunas do INDEX (`ID`, `Titulo`, `Status`, `Tags`, `Problema (1-linha)`, `Decisao (1-linha)`) são reproduzidos exatamente como aparecem no INDEX.md (sem mudar acentuação por sua conta).

---

# Marcadores do INDEX.md

A tabela vive entre os marcadores HTML:

```
<!-- ADR-INDEX-START -->
| ID | Titulo | Status | Tags | Problema (1-linha) | Decisao (1-linha) |
|----|--------|--------|------|---------------------|--------------------|
| ... linhas ...
<!-- ADR-INDEX-END -->
```

Esta skill **lê** entre esses marcadores. **Nunca** os edita — escrita do INDEX é responsabilidade das skills `agent-spec-adr-create`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`, `agent-spec-adr-bootstrap`.

---

# Fluxo de Listagem

## 1. Pré-condições

a. **Resolver paths globais** a partir de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule já disponível no system-prompt): `adr.dir` e `adr.index_file`.

b. **Validar existência do INDEX.md**:
   - Se `{adr.index_file}` **não existe** → encerrar orientando o usuário a popular o corpus:
     ```
     INDEX.md nao encontrado em {adr.index_file}.
     Sugestao:
       - /agent-spec-adr-bootstrap  (analisa o projeto e propoe ADRs iniciais)
       - /agent-spec-adr-create     (cria a primeira ADR manualmente)
     ```
   - Se existe, prosseguir.

c. **Capturar `$ARGUMENTS`** (opcional):
   - Vazio → listar todas as ADRs.
   - Não vazio → tratar como **filtro** (tag OU status). Normalizar para minúsculas e remover espaços nas extremidades.

## 2. Ler o INDEX.md (UMA única leitura)

1. Abrir **apenas** `{adr.index_file}`.
2. Localizar o bloco entre `<!-- ADR-INDEX-START -->` e `<!-- ADR-INDEX-END -->`.
3. Extrair as linhas da tabela (cabeçalho + separador + linhas de dados).
4. Se o bloco entre marcadores estiver **vazio** (sem linhas de dados após o separador) → corpus zero. Exibir:
   ```
   Nenhuma ADR registrada ainda.

   Sugestao:
     - /agent-spec-adr-bootstrap  (analisa o projeto e propoe ADRs iniciais)
     - /agent-spec-adr-create     (cria a primeira ADR manualmente)
   ```
   E encerrar.

## 3. Aplicar filtro (se houver `$ARGUMENTS`)

O filtro pode ser **tag** ou **status**. Não é necessário declarar qual — aplicar a regra de match abaixo nas colunas relevantes:

- **Status conhecidos** (match exato, case-insensitive, na coluna `Status`): `accepted`, `deprecated`, `superseded` (e variantes `superseded-by:NNNN` — basta começar com `superseded`).
- **Tags** (match por palavra, case-insensitive, na coluna `Tags`): qualquer string que não bate como status — tratar como tag e fazer match contra a lista de tags da linha (separada por vírgula).

Regra de decisão:

1. Se o argumento bate com um status conhecido → filtrar por `Status`.
2. Senão → filtrar por `Tags` (match exato de tag dentro da lista da célula, não substring solta).
3. Se nenhuma linha sobreviver ao filtro → reportar:
   ```
   Nenhuma ADR encontrada para o filtro: {argumento}
   ```
   E encerrar (não exibir tabela vazia).

## 4. Saída

### 4.1 Sem filtro

```
ADRs do projeto (N total):

| ID | Titulo | Status | Tags | Problema (1-linha) | Decisao (1-linha) |
|----|--------|--------|------|---------------------|--------------------|
| ... linhas exatas do INDEX.md ...

Para ver uma ADR completa: /agent-spec-adr-show <id>
```

### 4.2 Com filtro

```
ADRs do projeto — filtro `{argumento}` (M de N):

| ID | Titulo | Status | Tags | Problema (1-linha) | Decisao (1-linha) |
|----|--------|--------|------|---------------------|--------------------|
| ... linhas filtradas ...

Para ver uma ADR completa: /agent-spec-adr-show <id>
```

Onde `M` = quantidade após filtro e `N` = total no INDEX.

**NÃO** sugira nem inicie automaticamente outro comando além da dica final `Para ver uma ADR completa: /agent-spec-adr-show <id>`.

---

# Guardrails (Invioláveis)

## DEVE

1. Resolver paths globais (`adr.dir`, `adr.index_file`) via **`.claude/rules/agent-spec-adr-workflow-rules.md`** (rule global no system-prompt).
2. Abrir **apenas** o `INDEX.md` — uma única leitura por execução.
3. Reproduzir a tabela exatamente como está no INDEX.md (sem reformatar colunas, sem truncar células).
4. Aplicar filtro de forma case-insensitive, decidindo entre **status** e **tag** pela regra de §3.
5. Quando filtrar, exibir a contagem `M de N` (filtrado vs total).
6. Quando não houver match no filtro, reportar a ausência explicitamente — **não** exibir tabela vazia.
7. Quando o INDEX.md não existir ou estiver vazio, orientar o usuário a `/agent-spec-adr-bootstrap` ou `/agent-spec-adr-create` e encerrar.
8. Encerrar sempre com a dica `Para ver uma ADR completa: /agent-spec-adr-show <id>` (apenas quando houver linhas listadas).

## NÃO DEVE

1. **NUNCA** abrir arquivos ADR individuais (`{id}-*.md`) — o detalhe é responsabilidade de `/agent-spec-adr-show`.
2. **NUNCA** releia `.claude/rules/agent-spec-adr-workflow-rules.md` — paths já vêm resolvidos pelo system-prompt.
3. **NUNCA** modificar o INDEX.md — leitura apenas.
4. **NUNCA** recomputar a tabela a partir de `{adr.dir}/*.md` — fonte única é o INDEX.
5. **NUNCA** inventar/inferir colunas ausentes — reproduza o que está no INDEX.
6. **NUNCA** sugerir/iniciar outros comandos automaticamente além da dica final de `/agent-spec-adr-show`.
7. **NUNCA** alterar acentuação dos títulos das colunas do INDEX (reproduzir como está).
8. **NUNCA** assumir que o argumento é tag ou status — decida pela regra de §3 (status conhecidos primeiro, tag em seguida).

---

# Entrada

$ARGUMENTS
