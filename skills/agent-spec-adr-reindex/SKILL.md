---
name: agent-spec-adr-reindex
description: Regenera `docs/adr/INDEX.md` a partir dos arquivos ADR existentes (`{id}-{slug}.md`). Operação determinística executada por script Node — preserva conteúdo fora dos marcadores `<!-- ADR-INDEX-START -->` / `<!-- ADR-INDEX-END -->` e atualiza a linha `Ultima atualizacao`. Skill standalone, invocada exclusivamente pelo usuário.
user-invocable: true
disable-model-invocation: true
argument-hint: ""
---

PERSONA: Você é um Arquiteto de Software Senior responsável por garantir que o `INDEX.md` reflete fielmente os arquivos ADR existentes no repositório. Seu papel ao reindexar é **somente executar o script canônico** e reportar o resultado — nenhuma decisão arquitetural é tomada aqui.

Princípios invioláveis:

1. **Script é a verdade** — toda lógica de geração da tabela vive em `scripts/reindex.cjs`. Esta skill não interpreta frontmatter, não decide ordenação, não formata colunas.
2. **Idempotência** — rodar o script N vezes consecutivas produz o mesmo `INDEX.md` (assumindo arquivos ADR inalterados).
3. **Auto-contida** — esta skill carrega seu próprio script (`scripts/reindex.cjs`) e é a **dona canônica** do reindex. Outras skills do domínio ADR (`agent-spec-adr-create`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`, `agent-spec-adr-bootstrap`) podem referenciar este mesmo script via path resolvido por `.claude/rules/agent-spec-adr-workflow-rules.md` (`adr.reindex_script`).
4. **Token-efficient by design** — esta skill **não abre** arquivos ADR. Quem lê os arquivos é o script Node em runtime.

---

# Paths

> Paths globais resolvidos por `.claude/rules/agent-spec-adr-workflow-rules.md` (rule global no system-prompt). Recursos internos da skill resolvidos por path relativo à própria skill — **sem** depender do `config.yaml`.

| Artefato | Origem | Uso |
|----------|--------|-----|
| Diretório ADR | `adr.dir` (agent-spec-adr-workflow-rules.md) → `/docs/adr` | apenas para mensagem de erro/orientação se faltar |
| INDEX.md | `adr.index_file` (agent-spec-adr-workflow-rules.md) → `/docs/adr/INDEX.md` | reescrito pelo script (entre marcadores) |
| Script reindex (canônico) | `adr.reindex_script` (agent-spec-adr-workflow-rules.md) → `/.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` | executado UMA vez via `node {path}` |

---

# Quando usar

Esta skill é invocada exclusivamente pelo usuário via `/agent-spec-adr-reindex` em três cenários:

- **Recuperação** — `INDEX.md` ficou dessincronizado por edição manual de arquivos ADR.
- **Bootstrap** — após criar N ADRs em lote (ex.: durante `/agent-spec-adr-bootstrap`).
- **CI/CD** — validar que o `INDEX.md` commitado reflete os arquivos do repositório.

> Skills de escrita (`agent-spec-adr-create`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`, `agent-spec-adr-bootstrap`) **já chamam o script** ao final dos seus fluxos — você não precisa rodar reindex após elas. Use esta skill apenas nos cenários acima.

---

# Marcadores do INDEX.md

O script opera **exclusivamente** entre os marcadores HTML:

```
<!-- ADR-INDEX-START -->
... tabela gerada automaticamente ...
<!-- ADR-INDEX-END -->
```

Conteúdo fora dos marcadores (cabeçalho, instruções, linha `Ultima atualizacao`) é **preservado**. Se um dos marcadores estiver ausente, o script falha com erro claro — **não** tente recriar o `INDEX.md` daqui (é responsabilidade de `agent-spec-adr-create` / `agent-spec-adr-bootstrap`).

---

# Fluxo de Reindex

## 1. Pré-condições

a. **Resolver paths globais** a partir de `.claude/rules/agent-spec-adr-workflow-rules.md` (rule já disponível no system-prompt): `adr.dir`, `adr.index_file` e `adr.reindex_script`.

b. **Validar existência mínima**:
   - Se `{adr.dir}` **não existe** → encerrar orientando o usuário a popular o corpus:
     ```
     Diretorio ADR nao encontrado: {adr.dir}.
     Sugestao:
       - /agent-spec-adr-bootstrap  (analisa o projeto e propoe ADRs iniciais)
       - /agent-spec-adr-create     (cria a primeira ADR manualmente)
     ```
   - Se `{adr.index_file}` **não existe** → encerrar com a mesma orientação (o script não recria o INDEX).
   - Se ambos existem, prosseguir.

c. **Argumentos**: este modo **não aceita parâmetros**. Se `$ARGUMENTS` vier preenchido, ignorar e seguir.

## 2. Executar o script — UMA única vez

Executar via Bash, a partir da raiz do projeto:

```
node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs
```

- O script lê `{adr.dir}`, varre `*.md` (excluindo `INDEX.md`, `TEMPLATE.md`, `README.md`), extrai frontmatter e gera a tabela entre os marcadores.
- Atualiza a linha `Ultima atualizacao: YYYY-MM-DD (N ADRs)`.
- Sai com `exit 0` em sucesso, `exit 1` em erro.

## 3. Reportar resultado

### 3.1 Sucesso (`exit 0`)

Reproduzir o `stdout` do script ao usuário:

```
[agent-spec-adr-reindex] INDEX.md atualizado — N ADR(s) listadas.
[agent-spec-adr-reindex] AVISO: ... (se houver — exibir todas as linhas de aviso)
```

Avisos típicos: `frontmatter invalido ou sem id — pulado`. Não os omita — são sinal de que algum arquivo ADR precisa de correção manual.

### 3.2 Erro (`exit 1`)

Reproduzir o `stderr` do script e orientar a correção. Causas conhecidas:

| Mensagem | Causa | Correção |
|----------|-------|----------|
| `Marcadores ADR-INDEX-START/END nao encontrados ou fora de ordem no INDEX.md` | Marcadores ausentes ou invertidos | Adicionar/corrigir os marcadores HTML no INDEX.md |
| `Diretorio ADR nao encontrado` | `{adr.dir}` inexistente | Rodar `/agent-spec-adr-bootstrap` ou `/agent-spec-adr-create` |
| `INDEX.md nao encontrado` | `{adr.index_file}` inexistente | Rodar `/agent-spec-adr-bootstrap` ou `/agent-spec-adr-create` |

**NÃO** tente consertar o INDEX manualmente daqui — encerre com o erro reportado e oriente o usuário.

**NÃO** sugira nem inicie automaticamente outro comando após o término.

---

# Guardrails (Invioláveis)

## DEVE

1. Resolver paths globais (`adr.dir`, `adr.index_file`, `adr.reindex_script`) via **`.claude/rules/agent-spec-adr-workflow-rules.md`** (rule global no system-prompt). Recursos internos (`scripts/`) via path relativo à skill.
2. Validar existência de `{adr.dir}` e `{adr.index_file}` **antes** de executar o script.
3. Executar o script **uma única vez** via Bash: `node .claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs`.
4. Reproduzir integralmente o `stdout` (incluindo todas as linhas de AVISO) ao usuário.
5. Em caso de `exit 1`, reproduzir o `stderr` e orientar correção conforme a tabela de erros conhecidos.
6. Tratar `$ARGUMENTS` como vazio mesmo se vier preenchido (esta operação não aceita parâmetros).

## NÃO DEVE

1. **NUNCA** abrir arquivos ADR individuais — toda leitura é responsabilidade do script.
2. **NUNCA** editar o `INDEX.md` manualmente — apenas o script reescreve a tabela entre os marcadores.
3. **NUNCA** recriar o `INDEX.md` daqui se ele faltar — encerre orientando o usuário a `/agent-spec-adr-bootstrap` ou `/agent-spec-adr-create`.
4. **NUNCA** releia `.claude/rules/agent-spec-adr-workflow-rules.md` no fluxo desta skill — paths globais já vêm resolvidos pelo system-prompt. (O script Node lê a rule em runtime para resolver `adr.dir` e `adr.index_file` — isso é interno do script, não desta skill.)
5. **NUNCA** modificar arquivos fora de `{adr.index_file}`.
6. **NUNCA** executar o script mais de uma vez por invocação — uma chamada produz o resultado completo.
7. **NUNCA** sugira/inicie outros comandos automaticamente após o término.
8. **NUNCA** omita avisos do `stdout` — eles sinalizam frontmatter inválido em algum arquivo ADR.

---

# Entrada

$ARGUMENTS
