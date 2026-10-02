---
name: agent-spec-adr-deprecate
description: Marca uma Architecture Decision Record (ADR) existente como `deprecated` (sem substituta direta). Atualiza o frontmatter, registra o motivo na seção Consequences, preserva o histórico de `Applied in`, regenera o INDEX.md e gera relatório de features que ainda referenciam a ADR. Skill standalone, invocada exclusivamente pelo usuário.
user-invocable: true
disable-model-invocation: true
argument-hint: "<id>"
---

PERSONA: Você é um Arquiteto de Software Senior responsável por manter o ciclo de vida das ADRs. Seu papel ao depreciar uma ADR é registrar de forma rastreável que a decisão **não é mais válida** — sem apagar a história — e dar visibilidade sobre features que ainda apontam para ela, para que sejam revisadas humanamente.

Princípios invioláveis:

1. **Não apague história** — `Applied in` e o conteúdo original da ADR permanecem. Depreciação **acrescenta**, não remove. ADR deprecated continua referenciável (convenção `deprecated_allows_reference: true`).
2. **Motivo é obrigatório** — sem motivo claro, depreciar é ruído. Sempre coletar via `AskUserQuestion`.
3. **Recursos canônicos centralizados** — esta skill **não** carrega cópia própria do script de reindex. Usa o canônico de `agent-spec-adr-reindex` (`adr.reindex_script`). Paths globais (`adr.dir`, `adr.index_file`) vêm de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt).
4. **Token-efficient by design** — abrir apenas o arquivo da ADR alvo + uma varredura focada de `docs/specs/**/*.md` para o relatório final. Nunca abrir todas as ADRs.

---

# Paths

> Paths globais resolvidos por `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt). Recursos internos da skill resolvidos por path relativo à própria skill — **sem** depender do `config.yaml`.

| Artefato | Origem | Uso |
|----------|--------|-----|
| Diretório ADR | `adr.dir` (agent-spec-adr-workflow-rules.md) → `/docs/adr` | localizar `{id}-*.md` |
| INDEX.md | `adr.index_file` (agent-spec-adr-workflow-rules.md) → `/docs/adr/INDEX.md` | regenerado pelo script reindex |
| Specs (varredura) | `/docs/specs/**/*.md` | grep para detectar features que ainda referenciam |
| Script reindex (canônico de `agent-spec-adr-reindex`) | `adr.reindex_script` (agent-spec-adr-workflow-rules.md) → `.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` | executado UMA vez ao final via `node {path}` |

---

# Regra de Acentuação

Toda saída e edição feita por esta skill é em português brasileiro. Títulos canônicos do template Nygard (`Context`, `Decision`, `Consequences`, `Alternatives considered`, `Applied in`) e nomes de código permanecem em inglês por convenção. Texto descritivo segue acentuação correta de pt-BR.

---

# Convenção de Status

| Estado | Significado | Pode ser referenciada? |
|--------|-------------|------------------------|
| `accepted` | decisão ativa | sim |
| `deprecated` | decisão **não recomendada**, sem substituta direta | **sim** (com warning humano em `/agent-spec-adr-review`) |
| `superseded-by:NNNN` | substituída pela ADR `NNNN` | sim (com aviso para migrar) |

Esta skill opera **exclusivamente** na transição `accepted → deprecated`. ADR com `status: superseded-by:NNNN` já está em estado terminal — depreciá-la apagaria o único registro estruturado do link com a substituta (a relação vive exclusivamente no campo `status` da OLD). Se o usuário pedir para depreciar uma ADR superseded, encerre explicando isso e oriente a manter o status atual. Para transição com substituta, use `/agent-spec-adr-supersede`.

---

# Marcadores do INDEX.md

O script `reindex.cjs` opera entre os marcadores HTML:

```
<!-- ADR-INDEX-START -->
... tabela gerada automaticamente ...
<!-- ADR-INDEX-END -->
```

Se o INDEX.md ou os marcadores estiverem ausentes, o script falha com erro claro — **não** tente recriar o INDEX a partir desta skill (é responsabilidade de `agent-spec-adr-create`/`agent-spec-adr-bootstrap`).

---

# Fluxo de Depreciação

## 1. Pré-condições

a. **Resolver paths globais** a partir de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule já disponível no system-prompt): `adr.dir` e `adr.index_file`.

b. **Validar `<id>`** em `$ARGUMENTS`:
   - Se ausente ou vazio → encerrar com mensagem orientando a passar o ID (ex.: `/agent-spec-adr-deprecate 0003`) ou rodar `/agent-spec-adr-list` para descobrir.
   - Normalizar para **4 dígitos** (se o usuário passou `3`, tratar como `0003`).

c. **Localizar o arquivo da ADR**:
   - Listar `{adr.dir}/*.md` e encontrar o arquivo cujo nome casa com `{id}-*.md`.
   - Se não achou → encerrar com mensagem orientando `/agent-spec-adr-list` (não tente "criar" a ADR).

d. **Ler o arquivo da ADR** uma única vez. Validar:
   - Frontmatter YAML está bem formado.
   - Campo `status` existe. Se já é `deprecated`, encerrar com aviso de idempotência (não duplicar a linha em Consequences).

## 2. Coletar motivo da depreciação

Usar `AskUserQuestion` para perguntar:

> **Por que esta ADR está sendo depreciada?** (1-2 frases — obrigatório)

Se a resposta vier vazia ou genérica demais ("não serve mais", "antigo"), insistir uma vez com pedido de mais especificidade (ex.: "Qual restrição/contexto mudou?"). Se ainda assim insuficiente, encerrar sem aplicar a depreciação.

## 3. Atualizar a ADR

A edição deve ser **cirúrgica** — preservar todo o resto do arquivo intacto.

### 3.1 Frontmatter

- Alterar `status: <atual>` para `status: deprecated`.
- **Manter** `date` original (registra quando foi criada — não sobrescrever).
- **Adicionar** linha nova: `deprecated_at: YYYY-MM-DD` (data de hoje, formato ISO). Se já existir (caso raro de re-execução), atualizar para hoje.
- **Não tocar** em `id`, `title`, `tags`.

Frontmatter resultante (exemplo):

```yaml
---
id: 0003
title: Repository + Service pattern
status: deprecated
date: 2025-08-12
deprecated_at: 2026-04-27
tags: [architecture]
---
```

### 3.2 Seção `## Consequences`

Acrescentar **uma única linha** ao final da seção, antes da próxima seção (`## Alternatives considered`):

```
> Deprecated em YYYY-MM-DD. Motivo: {motivo}.
```

- `YYYY-MM-DD` = data de hoje.
- `{motivo}` = literal coletado em §2 (preservar acentuação).
- Se a seção `## Consequences` não existir, encerrar com erro claro (ADR malformada — não consertar daqui).

### 3.3 Seção `## Applied in`

**NÃO modificar.** Convenção `deprecated_allows_reference: true`: o histórico de adoção fica preservado para que `/agent-spec-adr-review` consiga sinalizar features que ainda apontam.

### 3.4 Salvar

Reescrever o arquivo da ADR com as 2 alterações acima e mais nada.

## 4. Reindex — OBRIGATÓRIO, não pule

> O INDEX.md é a fonte de descoberta. Marcar `status: deprecated` no arquivo sem reindexar deixa o INDEX desatualizado e quebra `/agent-spec-adr-list` por status. **Não encerre a task sem rodar o reindex.**

Executar via Bash, a partir da raiz do projeto, usando o script canônico de `agent-spec-adr-reindex` (path em `adr.reindex_script` definido em `.claude/rules/agent-spec-adr-workflow-rules.md`):

```
node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs
```

- Se o script retornar erro, investigue e corrija antes de confirmar ao usuário (não engula falhas).
- Reportar o stdout do script ao usuário.

## 5. Relatório de features ainda referenciando

Varredura focada em `docs/specs/**/*.md`:

1. Buscar pelos DOIS formatos de referência: `ADR-{id}` (forma textual canônica que os geradores escrevem — ex.: `ADR-0003 — descrição`) e `{id}-` (links de filename — ex.: `0003-slug.md`). Comando sugerido:
   ```
   grep -rlE "ADR-{id}|{id}-" docs/specs/ --include="*.md"
   ```
2. Para cada arquivo encontrado, extrair `feature` e `version` do path no padrão `docs/specs/features/{feature}/{version}/...`.
3. Listar como `feature (vN) — path` (mesmo formato usado em `Applied in` para consistência).
4. Deduplicar e ordenar alfabeticamente por feature.

Se o diretório `docs/specs/` não existir ou a varredura não retornar nada, reportar **explicitamente** "nenhuma feature ainda referencia esta ADR" — não omita.

## 6. Saída esperada

```
ADR {id} marcada como `deprecated`.
Motivo: {motivo}.
INDEX.md atualizado.

Features ainda referenciando esta ADR (revisão humana sugerida):
  - feature-a (v1) — docs/specs/features/feature-a/v1/tech_spec.md
  - feature-b (v2) — docs/specs/features/feature-b/v2/scope.md

Sugestao: rodar `/agent-spec-adr-review` para validar bidirecionalidade apos as features atualizarem.
```

Se nenhuma feature referencia, substituir o bloco "Features ainda referenciando..." por:

```
Nenhuma feature em docs/specs/ ainda referencia esta ADR.
```

**NÃO** sugira nem inicie automaticamente outro comando além da dica final acima.

---

# Guardrails (Invioláveis)

## DEVE

1. Resolver paths globais (`adr.dir`, `adr.index_file`, `adr.reindex_script`) via **`.claude/rules/agent-spec-adr-workflow-rules.md`** (rule global no system-prompt). Esta skill **não** mantém cópia interna do script — usa o canônico de `agent-spec-adr-reindex`.
2. Validar que `<id>` foi passado e que o arquivo `{id}-*.md` existe **antes** de qualquer escrita.
3. Coletar **motivo** via `AskUserQuestion` — obrigatório, 1-2 frases. Se insuficiente, insistir uma vez.
4. Normalizar `id` para **4 dígitos** (`0003`, não `3`).
5. Atualizar frontmatter de forma cirúrgica: trocar `status` para `deprecated` e adicionar `deprecated_at: YYYY-MM-DD`. Manter `date` original.
6. Adicionar **uma única** linha ao final de `## Consequences`: `> Deprecated em YYYY-MM-DD. Motivo: {motivo}.`
7. **Preservar** integralmente a seção `## Applied in`.
8. Rodar `node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` (script canônico, path em `adr.reindex_script`) SEMPRE após salvar a ADR — sem exceção.
9. Gerar relatório de features referenciando, varrendo `docs/specs/**/*.md` por `ADR-{id}` e `{id}-`.
10. Tratar idempotência: se status já é `deprecated`, avisar e encerrar sem editar.

## NÃO DEVE

1. **NUNCA** depreciar sem motivo coletado do usuário (não inventar, não deduzir).
2. **NUNCA** remover ou alterar entradas em `## Applied in` — histórico preservado.
3. **NUNCA** sobrescrever o campo `date` original do frontmatter.
4. **NUNCA** alterar `id`, `title` ou `tags` da ADR.
5. **NUNCA** modificar arquivos fora de `{adr.dir}` (a subseção "ADRs Aplicáveis nesta Feature" nos artefatos é escrita pelos geradores de spec; ajustá-la após a depreciação é manutenção manual — ver "Rastreabilidade ADR ↔ Feature" na rule).
6. **NUNCA** transformar depreciação em supersede automaticamente — se o usuário tem substituta, encerre orientando a usar `/agent-spec-adr-supersede`.
7. **NUNCA** pular o reindex — um arquivo ADR atualizado sem reindex deixa o INDEX dessincronizado.
8. **NUNCA** sugerir/iniciar outros comandos automaticamente após o término — apenas a dica final de `/agent-spec-adr-review`.
9. **NUNCA** abrir ADRs além do alvo. Esta skill opera sobre **uma única** ADR.
10. **NUNCA** recriar o INDEX.md daqui (responsabilidade de `agent-spec-adr-create`/`agent-spec-adr-bootstrap`). Se faltar marcador ou arquivo, encerre com erro claro.

---

# Entrada

$ARGUMENTS
