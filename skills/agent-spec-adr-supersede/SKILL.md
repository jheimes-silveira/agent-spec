---
name: agent-spec-adr-supersede
description: Substitui uma Architecture Decision Record (ADR) existente por uma nova. Marca a ADR antiga com `status: superseded-by:NNNN`, registra a substituição na seção Consequences, preserva o histórico de `Applied in`, regenera o INDEX.md e gera relatório de features que ainda referenciam a ADR antiga. Quando a nova ADR não existe ou foi passado um título, executa antes o sub-fluxo de criação. Skill standalone, invocada exclusivamente pelo usuário.
user-invocable: true
disable-model-invocation: true
argument-hint: "<old-id> [new-id-ou-titulo]"
---

PERSONA: Você é um Arquiteto de Software Senior responsável pelo ciclo de vida das ADRs. Seu papel ao superseder uma ADR é registrar de forma rastreável que a decisão **foi substituída por outra** — sem apagar a história — e dar visibilidade sobre features que ainda apontam para a ADR antiga, para que sejam migradas humanamente, por feature, conforme o caso.

Princípios invioláveis:

1. **Não apague história** — `Applied in` da ADR antiga e o conteúdo original permanecem (`superseded_keeps_applied_in: true`). Supersede **acrescenta** marca; não remove conteúdo. A rastreabilidade vem justamente desse `Applied in` preservado.
2. **Migração de features é manual** — `Applied in` da OLD **NUNCA** é migrado automaticamente para a NEW. Cada feature decide se adota a substituta atualizando a própria subseção "ADRs Aplicáveis nesta Feature".
3. **Recursos canônicos centralizados** — esta skill **não** carrega cópias próprias. Usa o template canônico de `agent-spec-adr-create` (`adr.template`) e o script canônico de `agent-spec-adr-reindex` (`adr.reindex_script`). Paths globais (`adr.dir`, `adr.index_file`) vêm de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt).
4. **Token-efficient by design** — abrir apenas o arquivo da OLD + (no ramo NEW_EXISTS) o arquivo da NEW + uma varredura focada de `docs/specs/**/*.md` para o relatório final. Nunca abrir todas as ADRs.
5. **Decisão com confirmação humana** — toda informação coletada para a NEW (no ramo NEW_NOVA) vem do usuário via `AskUserQuestion`. NUNCA invente, deduza ou assuma.

---

# Paths

> Paths globais resolvidos por `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt). Recursos internos da skill resolvidos por path relativo à própria skill — **sem** depender do `config.yaml`.

| Artefato | Origem | Uso |
|----------|--------|-----|
| Diretório ADR | `adr.dir` (agent-spec-adr-workflow-rules.md) → `/docs/adr` | localizar `{old-id}-*.md` e `{new-id}-*.md`; salvar nova ADR no ramo NEW_NOVA |
| INDEX.md | `adr.index_file` (agent-spec-adr-workflow-rules.md) → `/docs/adr/INDEX.md` | regenerado pelo script reindex |
| Specs (varredura) | `/docs/specs/**/*.md` | grep para detectar features que ainda referenciam a OLD |
| Template ADR (canônico de `agent-spec-adr-create`) | `adr.template` (agent-spec-adr-workflow-rules.md) → `.claude/skills/agent-spec-adr-create/assets/adr-template.md` | leitura para preencher a NEW (apenas no ramo NEW_NOVA) |
| Script reindex (canônico de `agent-spec-adr-reindex`) | `adr.reindex_script` (agent-spec-adr-workflow-rules.md) → `.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` | executado UMA vez ao final via `node {path}` |

---

# Regra de Acentuação

Toda saída e edição feita por esta skill é em português brasileiro. Títulos canônicos do template Nygard (`Context`, `Decision`, `Consequences`, `Alternatives considered`, `Applied in`) e nomes de código permanecem em inglês por convenção. Texto descritivo segue acentuação correta de pt-BR.

---

# Convenção de Status

| Estado | Significado | Pode ser referenciada? |
|--------|-------------|------------------------|
| `accepted` | decisão ativa | sim |
| `deprecated` | decisão **não recomendada**, sem substituta direta | sim (com warning) |
| `superseded-by:NNNN` | substituída pela ADR `NNNN` | sim (com aviso para migrar) |

Esta skill opera **exclusivamente** na transição `accepted | deprecated → superseded-by:NEW`. Para depreciação sem substituta, use `/agent-spec-adr-deprecate`.

**Bidirecionalidade**: a relação fica registrada **apenas no frontmatter da OLD** (`status: superseded-by:NEW`). A NEW **não** ganha campo recíproco no frontmatter — a relação é descoberta varrendo o INDEX.md por entradas com esse status. Esse é o comportamento canônico do framework — não o altere aqui.

---

# Marcadores do INDEX.md

O script `reindex.cjs` opera entre os marcadores HTML:

```
<!-- ADR-INDEX-START -->
... tabela gerada automaticamente ...
<!-- ADR-INDEX-END -->
```

Se o INDEX.md ou os marcadores estiverem ausentes, o script falha com erro claro — **não** tente recriar o INDEX a partir desta skill (responsabilidade de `agent-spec-adr-create`/`agent-spec-adr-bootstrap`).

---

# Tags Canônicas (controladas)

Usadas **somente no ramo NEW_NOVA** ao criar a ADR substituta. A `tags` deve ter **1 a 3 entradas** desta lista. **Nunca** invente tag fora da lista — se nenhuma cobre o tema, sinalize ao usuário que é caso de atualizar a lista primeiro (e não crie a NEW).

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```

---

# Critérios de Existência da NEW (ramo NEW_NOVA)

Antes de criar a ADR substituta, confirme com o usuário que a decisão satisfaz **todos os 5 critérios canônicos** (C1-C5 — fonte única: seção "Critérios Canônicos de Criação" da rule `agent-spec-adr-workflow-rules.md`), numa única `AskUserQuestion` que reúna os cinco:

| # | Critério | Pergunta | OK se |
|---|----------|----------|-------|
| C1 | `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? | SIM |
| C2 | `tag_alvo` | Cai em uma das 14 tags canônicas? | SIM |
| C3 | `custo_reversao_alto` | Reverter implicaria refactor significativo (≥ médio) em múltiplos lugares? | SIM |
| C4 | `surpreendente_sem_contexto` | Um leitor futuro do código vai se perguntar "por que fizeram assim?" sem este registro? | SIM |
| C5 | `trade_off_real` | Havia ao menos UMA alternativa genuinamente considerada, rejeitada por razão específica? | SIM |

Se qualquer critério falhar, **NÃO crie a NEW** — encerre e oriente o usuário a colocar a decisão no artefato de feature apropriado (Tech Spec / Scope / Tech Alignment). A OLD permanece intacta nesse caso.

---

# Status default da NEW (ramo NEW_NOVA)

ADRs criadas dentro deste fluxo nascem com `status: accepted`.

---

# Regra de Tamanho da NEW

Se a ADR criada passa de ~60 linhas, algo está errado — provavelmente virou tech_spec. Mova detalhes para o artefato de feature e deixe a ADR com **apenas a decisão** + justificativa.

---

# Fluxo de Supersede

## 1. Pré-condições

a. **Resolver paths globais** a partir de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule já disponível no system-prompt): `adr.dir` e `adr.index_file`.

b. **Validar `<old-id>`** (1º argumento, obrigatório):
   - Se ausente ou vazio → encerrar com mensagem orientando a passar o ID (ex.: `/agent-spec-adr-supersede 0003 0012` ou `/agent-spec-adr-supersede 0003`) ou rodar `/agent-spec-adr-list` para descobrir.
   - Normalizar para **4 dígitos** (`3` → `0003`).

c. **Localizar o arquivo da OLD** em `{adr.dir}`:
   - Listar `{adr.dir}/*.md` e encontrar `{old-id}-*.md`.
   - Se não achou → encerrar com mensagem orientando `/agent-spec-adr-list` (não tente "criar" a OLD).

d. **Ler o arquivo da OLD** uma única vez. Validar:
   - Frontmatter YAML está bem formado.
   - Campo `status` existe e é **`accepted`** ou **`deprecated`**.
   - **Idempotência**: se `status` já é `superseded-by:*`, encerrar com aviso (não duplicar marca em Consequences nem reabrir o ciclo).
   - Capturar `title` da OLD e o conteúdo da seção `## Context` (pode ser sugerido ao usuário no ramo NEW_NOVA — sem nunca herdar automaticamente).

## 2. Decidir o ramo

Examinar o **2º argumento** (`<new-id-ou-titulo>`):

| Caso | Ramo |
|------|------|
| Ausente / vazio | **NEW_NOVA** (sem título sugerido) |
| Numérico (ex.: `12`, `0012`) e arquivo `{new-id}-*.md` existe | **NEW_EXISTS** |
| Numérico mas arquivo `{new-id}-*.md` **não existe** | **NEW_NOVA** (sem título sugerido — alertar que o ID será reatribuído pelo próximo livre) |
| Texto não-numérico | **NEW_NOVA** (com título sugerido = literal do argumento) |

## 3a. Ramo NEW_EXISTS — só marcar a OLD

1. Validar que o arquivo `{new-id}-*.md` existe e tem frontmatter bem formado.
2. **Guards de integridade da cadeia** (qualquer falha → encerrar sem editar nada, explicando o motivo):
   - `new-id != old-id` — auto-supersede é proibido.
   - `status` da NEW é `accepted` — apontar para substituta `deprecated` cria cadeia sem decisão ativa; apontar para uma NEW `superseded-by:{old-id}` fecharia ciclo A→B→A (impossível saber qual decisão vale).
3. Capturar `title` da NEW (necessário para a linha em `Consequences` da OLD).
4. **Não** alterar a NEW. Pular direto para o passo 4.

## 3b. Ramo NEW_NOVA — criar a substituta antes de marcar a OLD

> Sub-fluxo de criação **auto-contido** dentro desta skill — não delega para `agent-spec-adr-create`. Auto-contenção é deliberada (ver Princípios §3).

### 3b.1 Garantir diretório e INDEX

- Se `{adr.dir}` não existe, criar.
- Se `{adr.index_file}` não existe, criar com este esqueleto mínimo:
  ```markdown
  # Architecture Decision Records — INDEX

  > Ultima atualizacao: YYYY-MM-DD (0 ADRs)

  <!-- ADR-INDEX-START -->
  <!-- ADR-INDEX-END -->
  ```

### 3b.2 Validar critérios de existência

Confirmar com o usuário (via `AskUserQuestion`) que a decisão satisfaz **os 5 critérios canônicos C1-C5** (`transversal`, `tag_alvo`, `custo_reversao_alto`, `surpreendente_sem_contexto`, `trade_off_real` — ver tabela "Critérios de Existência" acima). Se qualquer critério falhar, encerrar **sem** alterar OLD nem criar NEW — orientar a documentar a decisão no artefato de feature.

### 3b.3 Determinar próximo ID da NEW

1. Listar `{adr.dir}/*.md` excluindo `INDEX.md`, `TEMPLATE.md`, `README.md`.
2. Extrair o maior `id` do **nome dos arquivos** listados (`adr.file_pattern` = `{id}-{slug}.md` — um `ls` resolve, sem abrir arquivo nem depender de INDEX possivelmente stale) e somar 1.
3. Formatar em **4 dígitos** (`0001`, `0002`...). Se diretório vazio (caso raro aqui — a OLD já existe), começar em `0001`.

### 3b.4 Coletar campos via AskUserQuestion (UMA pergunta por vez)

Coletar nesta ordem, **sempre uma pergunta por vez**:

1. **Título** — se não veio como 2º argumento (ramo NEW_NOVA com título sugerido). Curto, uma frase.
2. **Context** — problema concreto + restrições (3-5 linhas). Pode-se **mostrar** o Context da OLD ao usuário como referência, mas **nunca** copiá-lo sem confirmação explícita.
3. **Decision** — o que foi decidido (1-2 frases no indicativo, sem rodeios).
4. **Consequences** — Pros / Cons / Neutros em bullets curtos.
5. **Alternatives considered** — **pelo menos 1 alternativa** com motivo da rejeição. Se o usuário disser "não havia alternativa", insista — geralmente é falta de reflexão.
6. **Tags** — 1 a 3 da lista canônica. Se nenhuma cobre o tema, encerrar orientando atualizar a lista primeiro.
7. **Applied in** (opcional) — features que **já adotam** a NEW, formato `feature (vN) — path-para-artefato`. Pode ficar vazio. **NÃO** copie do `Applied in` da OLD.

**NUNCA** deduza, invente ou assuma. Na dúvida, **PERGUNTE**.

### 3b.5 Gerar slug da NEW

Slug em **kebab-case** do título: minúsculas, sem acentos, ≤ 60 chars.

### 3b.6 Preencher template e salvar

1. **Ler template** de `{adr.template}` (`.claude/skills/agent-spec-adr-create/assets/adr-template.md` — canônico, mantido por `agent-spec-adr-create`).
2. **Preencher**:
   - Frontmatter: `id` (4 dígitos), `title`, `status: accepted`, `date` (hoje, `YYYY-MM-DD`), `tags`.
   - `## Context`: 3-5 linhas com o problema.
   - `## Decision`: 1-2 frases diretas no indicativo.
   - `## Consequences`: bullets em **Pros / Cons / Neutros**.
   - `## Alternatives considered`: pelo menos 1 alternativa com motivo da rejeição.
   - `## Applied in`: lista de features no formato `feature (vN) — path`. Pode ficar vazio.
3. **Remover TODOS os comentários `<!-- ... -->`** do template antes de salvar.
4. **Salvar** em `{adr.dir}/{new-id}-{slug}.md`.

> **Atenção**: nesta etapa NÃO rode reindex ainda — vamos rodar **uma única vez** ao final, depois de marcar a OLD (passo 5). Reindex prematuro é desperdício de I/O e gera INDEX intermediário inconsistente com a transição.

## 4. Atualizar a OLD (cirúrgica)

A edição deve ser **cirúrgica** — preservar todo o resto do arquivo intacto.

### 4.1 Frontmatter

- Alterar `status: <atual>` para `status: superseded-by:{new-id}` (4 dígitos).
- **Manter** `date` original (registra quando foi criada — não sobrescrever).
- **Não tocar** em `id`, `title`, `tags`.
- **Não adicionar** campos `supersedes`/`superseded_at`/etc. — convenção do framework é manter a marca apenas em `status`.

Frontmatter resultante (exemplo):

```yaml
---
id: 0003
title: Repository + Service pattern
status: superseded-by:0012
date: 2025-08-12
tags: [architecture]
---
```

### 4.2 Seção `## Consequences`

Acrescentar **uma única linha** ao final da seção, antes da próxima seção (`## Alternatives considered`):

```
> Superseded by {new-id} - {titulo-new} em YYYY-MM-DD.
```

- `{new-id}` em 4 dígitos.
- `{titulo-new}` = `title` exato do frontmatter da NEW (ramo NEW_EXISTS) ou o título coletado em 3b.4 (ramo NEW_NOVA).
- `YYYY-MM-DD` = data de hoje.
- Se a seção `## Consequences` não existir, encerrar com erro claro (ADR malformada — não consertar daqui).

### 4.3 Seção `## Applied in` da OLD

**NÃO modificar.** Convenção `superseded_keeps_applied_in: true`: o histórico de adoção fica preservado para que `/agent-spec-adr-review` consiga sinalizar features que ainda apontam para a OLD. **Migração para a NEW é manual e por feature.**

### 4.4 Salvar

Reescrever o arquivo da OLD com as 2 alterações acima e mais nada.

## 5. Reindex — OBRIGATÓRIO, não pule

> O INDEX.md é a fonte de descoberta. Marcar `superseded-by` no frontmatter sem reindexar deixa o INDEX desatualizado e quebra `/agent-spec-adr-list` por status. **Não encerre a task sem rodar o reindex.**

Executar via Bash, a partir da raiz do projeto, usando o script canônico de `agent-spec-adr-reindex` (path em `adr.reindex_script` definido em `.claude/rules/agent-spec-adr-workflow-rules.md`):

```
node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs
```

- Rodar **uma única vez** (cobre tanto a NEW recém-criada quanto a marca em status da OLD).
- Se o script retornar erro, investigue e corrija antes de confirmar ao usuário (não engula falhas).
- Reportar o stdout do script ao usuário.

## 6. Relatório de features ainda apontando para a OLD

Varredura focada em `docs/specs/**/*.md`:

1. Buscar pelos DOIS formatos de referência: `ADR-{old-id}` (forma textual canônica que os geradores escrevem — ex.: `ADR-0003 — descrição`) e `{old-id}-` (links de filename — ex.: `0003-slug.md`). Comando sugerido:
   ```
   grep -rlE "ADR-{old-id}|{old-id}-" docs/specs/ --include="*.md"
   ```
2. Para cada arquivo encontrado, extrair `feature` e `version` do path no padrão `docs/specs/features/{feature}/{version}/...`.
3. Listar como `feature (vN) — path` (mesmo formato usado em `Applied in` para consistência).
4. Deduplicar e ordenar alfabeticamente por feature.

Se o diretório `docs/specs/` não existir ou a varredura não retornar nada, reportar **explicitamente** "nenhuma feature ainda referencia a ADR antiga" — não omita.

## 7. Saída esperada

### Ramo NEW_EXISTS

```
ADR {old-id} marcada como `superseded-by:{new-id}`.
INDEX.md atualizado.

Features ainda apontando para {old-id} (precisam revisar manualmente):
  - feature-a (v1) — docs/specs/features/feature-a/v1/tech_spec.md
  - feature-b (v2) — docs/specs/features/feature-b/v2/scope.md

Sugestao: rodar `/agent-spec-adr-review` apos atualizar os artefatos.
```

### Ramo NEW_NOVA

```
ADR criada: docs/adr/{new-id}-{slug}.md
Status: accepted | Tags: [lista] | Applied in: N feature(s)

ADR {old-id} marcada como `superseded-by:{new-id}`.
INDEX.md atualizado.

Features ainda apontando para {old-id} (precisam revisar manualmente):
  - feature-a (v1) — docs/specs/features/feature-a/v1/tech_spec.md
  - feature-b (v2) — docs/specs/features/feature-b/v2/scope.md

Sugestao: rodar `/agent-spec-adr-review` apos atualizar os artefatos.
```

Se nenhuma feature referencia a OLD, substituir o bloco "Features ainda apontando..." por:

```
Nenhuma feature em docs/specs/ ainda referencia a ADR antiga.
```

**NÃO** sugira nem inicie automaticamente outro comando além da dica final acima.

---

# Guardrails (Invioláveis)

## DEVE

1. Resolver paths globais (`adr.dir`, `adr.index_file`, `adr.template`, `adr.reindex_script`) via **`.claude/rules/agent-spec-adr-workflow-rules.md`** (rule global no system-prompt). Esta skill **não** mantém cópias internas — usa o template canônico de `agent-spec-adr-create` e o script canônico de `agent-spec-adr-reindex`.
2. Validar `<old-id>` e que `{old-id}-*.md` existe **antes** de qualquer escrita.
3. Aceitar transição apenas a partir de `accepted` ou `deprecated`. Se já é `superseded-by:*`, tratar idempotência: avisar e encerrar sem editar.
4. Normalizar IDs (`old-id`, `new-id`) para **4 dígitos** (`0003`, não `3`).
5. Decidir ramo (NEW_EXISTS vs NEW_NOVA) com base na presença/forma do 2º argumento e na existência do arquivo `{new-id}-*.md`.
6. No ramo NEW_NOVA: validar os **5 critérios canônicos de existência (C1-C5)** antes de coletar campos; usar `AskUserQuestion` para **cada campo** — uma pergunta por vez; tags restritas à lista canônica; **remover TODOS os comentários `<!-- ... -->`** do template antes de salvar.
7. Atualizar a OLD de forma cirúrgica: trocar `status` para `superseded-by:{new-id}` (4 dígitos) e adicionar **uma única** linha ao final de `## Consequences`: `> Superseded by {new-id} - {titulo-new} em YYYY-MM-DD.`
8. **Preservar** integralmente a seção `## Applied in` da OLD.
9. Manter `date` original do frontmatter da OLD.
10. Rodar `node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` (script canônico, path em `adr.reindex_script`) SEMPRE ao final, **uma única vez**, depois de salvar OLD (e NEW, no ramo NEW_NOVA).
11. Gerar relatório de features apontando para a OLD, varrendo `docs/specs/**/*.md` por `{old-id}-`.
12. `Applied in` da NEW (no ramo NEW_NOVA) deve ter formato uniforme: `feature (vN) — path-para-artefato`.

## NÃO DEVE

1. **NUNCA** alterar a transição: aceite só `accepted | deprecated → superseded-by:NEW`. Se a OLD já é `superseded-by:*`, encerre.
2. **NUNCA** migrar `Applied in` da OLD para a NEW automaticamente — migração é manual e por feature.
3. **NUNCA** copiar `Context`/`Decision`/`Consequences` da OLD para a NEW sem confirmação humana explícita pergunta-a-pergunta. Mostrar como referência é OK; copiar silenciosamente é proibido.
4. **NUNCA** alterar o frontmatter da NEW para incluir campos recíprocos (`supersedes: OLD` etc.) — bidirecionalidade vive apenas em `status: superseded-by:NEW` da OLD, conforme convenção do framework.
5. **NUNCA** modificar `id`, `title`, `tags` ou `date` da OLD.
6. **NUNCA** modificar arquivos fora de `{adr.dir}` (a subseção "ADRs Aplicáveis nesta Feature" nos artefatos é escrita pelos geradores de spec; migrá-la para a NEW é manutenção manual — ver "Rastreabilidade ADR ↔ Feature" na rule).
7. **NUNCA** crie a NEW se algum dos 5 critérios canônicos (C1-C5) falhar — encerre sem tocar a OLD e oriente a documentar a decisão no artefato de feature.
8. **NUNCA** crie tag fora da lista canônica — sinalize que é caso de atualizar a lista primeiro e encerre.
9. **NUNCA** aceite a NEW sem **pelo menos 1 alternativa considerada** — "não havia alternativa" geralmente é falta de reflexão.
10. **NUNCA** deduza ou invente informações da NEW — na dúvida, **PERGUNTE**.
11. **NUNCA** rode reindex mais de uma vez — UMA execução ao final cobre OLD + NEW.
12. **NUNCA** pule o reindex — uma OLD com `superseded-by:*` no frontmatter sem reindex deixa o INDEX dessincronizado.
13. **NUNCA** sugerir/iniciar outros comandos automaticamente após o término — apenas a dica final de `/agent-spec-adr-review`.
14. **NUNCA** abrir ADRs além de OLD (sempre) e NEW (apenas no ramo NEW_EXISTS). Esta skill **não** varre todas as ADRs.
15. **NUNCA** recriar o INDEX.md daqui no ramo NEW_EXISTS (responsabilidade de `agent-spec-adr-create`/`agent-spec-adr-bootstrap`). No ramo NEW_NOVA, criar **apenas** o esqueleto mínimo se o INDEX não existir.

---

# Entrada

$ARGUMENTS
