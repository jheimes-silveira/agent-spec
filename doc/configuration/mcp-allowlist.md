---
id: "mcp-allowlist"
title: "MCP Allowlist"
sidebar_position: 4
---
# MCP Allowlist

Controla quais MCP servers são carregados no system-prompt de subagentes (geração, execução, gates).

---

## Por que existe

O Claude Code carrega instruções de **todos** os MCPs configurados em `.mcp.json` no system-prompt de **todos** os subagentes. Em um projeto típico, isso pode somar ~6k tokens apenas de instruções de Figma, Gmail, Notion, Playwright, Obsidian, Pipeboard — **mesmo quando o subagente está gerando um PRD** (onde nada disso é usado).

Multiplicado por N subagentes (executor + Gate 1 + Gate 2 + agent-spec-qa-test-generator…), o custo cumulativo é expressivo.

---

## `.mcp.json` (raiz do projeto)

Habilita **apenas** os MCPs essenciais para geração/execução:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

> **Princípio**: o `.mcp.json` é a allowlist. Apenas MCPs listados aqui são carregados nos subagentes do framework.

---

## Quais MCPs são candidatos naturais à allowlist

* **serena** — análise semântica de código. Indispensável para skills `*-run-tasks`.
* **context7** — docs de libs em tempo real. Útil em geração e execução.
* **github** — se tiver comando de criação de PR/issues.

## Quais **NÃO** colocar na allowlist do framework

* **Figma** — frontend-específico, opt-in.
* **Gmail / Notion / Google Calendar** — não são ferramentas de dev direto.
* **Playwright** — só útil em testes E2E ad-hoc, opt-in.
* **Obsidian / Pipeboard** — integrações pessoais.

> Esses MCPs ainda podem ser usados em **conversa direta** — só não devem entrar no contexto de subagentes do framework.

---

## Opt-in de MCPs extras (sem afetar subagentes)

Para adicionar Figma/Gmail/Notion **sem** pagar o custo em todos os subagentes, use `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp"]
    },
    "gmail": {
      "command": "...",
      "args": ["..."]
    }
  }
}
```

Esses MCPs ficam disponíveis **no contexto do orquestrador** (conversa direta), mas não são carregados em subagentes geradores/executores/gates.

---

## Economia estimada

Medida real antes/depois em features médias:

| Cenário | Tokens MCP por subagente | × N subagentes |
| --- | --- | --- |
| Sem allowlist (todos os MCPs configurados) | ~6k | ~36k em 6 invocações |
| Com allowlist (serena + context7) | ~1.5k | ~9k em 6 invocações |

Para uma feature SDD de 8 tasks com 3 subagentes cada (executor + Gate 1 + Gate 2), a economia cumulativa é de **~100-200k tokens**.

---

## Verificando o que está carregado

```bash
# Lista MCPs configurados:
cat .mcp.json | jq '.mcpServers | keys'

# Lista MCPs locais (apenas para conversa direta):
cat .claude/settings.local.json | jq '.mcpServers | keys'
```

---

## Próximos passos

* [Rules de paths — Fonte Autoritativa](framework-paths.md) — outros itens de configuração.
* [Memória Temporária](temp-memory.md) — economia adicional via memória proativa.
* [Contexto Mínimo](../concepts/minimum-context.md) — princípio geral de economia de tokens.
