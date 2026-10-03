---
id: "framework-paths"
title: "O papel das rules agent-spec-*"
sidebar_position: 6
---
# O papel das rules `agent-spec-*`

> **TL;DR**: as rules globais em `.claude/rules/agent-spec-*.md` são onde vivem os paths canônicos dos frameworks (SDD, miniSpec, TaskCard, ADR), as regras transversais de workflow (critical paths, classificação Tech Review) e as convenções de nomenclatura. Todas são carregadas automaticamente no system-prompt da sessão do Claude Code, ficando visíveis para todas as skills sem que precisem abrir nenhum arquivo.

Esta página é **conceitual**. Para a referência prática (chaves, paths, edição), veja [Rules de paths — Fonte Autoritativa](/configuration/framework-paths.html) e [Path Templates](/configuration/path-templates.html).

---

## Carregamento implícito

Pela [documentação de rules](https://code.claude.com/docs/en/memory.md#set-up-rules), uma rule sem `paths` no frontmatter é carregada no system-prompt na inicialização da sessão. As rules `agent-spec-*` são exatamente isso: rules globais, sem filtro, sempre presentes.

Isso significa:

* **Toda skill já tem o conteúdo das rules no contexto** sem precisar abrir nenhum arquivo.
* **Custo zero por invocação**: o conteúdo já está pago no system-prompt da sessão.
* **Independência de localização**: a skill não precisa saber onde a rule vive — só sabe que vai encontrá-la no contexto.
* **Sem parser, sem schema, sem build step**: paths são templates markdown legíveis por humano e por modelo.

---

## Por que 6 rules e não 1?

A separação por workflow facilita manutenção e evolução:

| Rule | Escopo |
| --- | --- |
| `agent-spec-shared.md` | Regras transversais (acentuação pt-BR, etc.) |
| `agent-spec-workflow-rules.md` | Cross-workflow: critical paths, `requires_qa_revalidation`, paths compartilhados, convenções |
| `agent-spec-sdd-workflow-rules.md` | Específico SDD |
| `agent-spec-minispec-workflow-rules.md` | Específico miniSpec |
| `agent-spec-taskcard-workflow-rules.md` | Específico TaskCard |
| `agent-spec-adr-workflow-rules.md` | Específico ADR |

Cada rule é pequena e focada. Editar paths do SDD não exige abrir um arquivo gigante com paths de tudo. E novos workflows podem entrar sem inflar uma rule monolítica.

---

## Single source of truth, de verdade

Quando uma skill resolve um path, ela usa **a chave canônica da rule** — nunca um path fixo no código.

```
Skill quer salvar PRD
↓
Lê chave: sdd.prd.path (de agent-spec-sdd-workflow-rules.md)
↓
Template: /docs/specs/features/{feature}/{version}/prd.md
↓
Substitui {feature}=cardapio-digital, {version}=v1
↓
Path resolvido: /docs/specs/features/cardapio-digital/v1/prd.md
```

Mover artefatos no projeto vira uma **edição em um único lugar**: a rule do workflow. Todas as skills se adaptam automaticamente porque resolvem o template a cada invocação.

---

## O que NÃO está nas rules

Para evitar confusão, vale explicitar o que fica fora:

| Fora das rules | Onde fica |
| --- | --- |
| Lógica dos gates (agent-spec-qa-validator, tech-review) | Embutida em cada [skill orquestradora](/skills/sdd/sdd-run-tasks.html) e nos [agents](/agents/qa-validator.html) |
| Regras de escalação sonnet→opus em retry | Embutidas em cada `*-run-tasks` |
| MCP allowlist do projeto | Em `.mcp.json` do projeto |
| Configuração do executor (qual agente usar) | Argumento `<agent_name>` passado no comando `*-run-tasks` |
| Templates de PRD, Tech Spec, Intent, etc. | Em `assets/` da skill geradora correspondente |
| Lista canônica de tags ADR | Embutida em [agent-spec-adr-create](/skills/adr/adr-create.html) |
| Configurações específicas do projeto (env vars, site, customizações locais) | `CLAUDE.md` da raiz |

> **Princípio de design**: paths são **dados** (lugar onde algo vive); regras de comportamento são **código da skill**. Cada um vive onde pertence. As rules `agent-spec-*` ficam no meio: paths + heurísticas transversais que valem para todos os workflows (critical paths, classificação Tech Review).

---

## Vantagem prática: skills auto-contidas

Como toda skill já tem as rules `agent-spec-*` no contexto, ela é auto-contida — não precisa de **nenhum** arquivo de configuração externo para funcionar. Isso permite:

* **Portabilidade**: copiar `.claude/skills/` para outro projeto e funcionar imediatamente, desde que `.claude/rules/agent-spec-*.md` estejam presentes com as convenções.
* **Sem build step**: não há geração de configuração, não há parser, não há schema validation.
* **Token economy**: paths já estão pagos no system-prompt da sessão; skills não gastam tokens lendo configuração antes de fazer o trabalho real.

---

## Convenções que as rules impõem

| Convenção | Por quê |
| --- | --- |
| `{feature}` em **kebab-case sem acento** | Compatibilidade com filesystems case-sensitive e ferramentas que tratam acento mal |
| `{version}` em **`v1`, `v2`, ...** | Permite manter múltiplas versões da mesma feature lado a lado (refactor → `v2/`) |
| `{variant}` em **`web` / `mobile` / `backend`** | Identifica a frente da feature; gravada no state e no cabeçalho do tech\_spec/scope, **não** entra no path |
| Diretório raiz `/docs/specs/features/` | Convenção do framework — agrupa todas as features em um lugar previsível |
| Memória temporária em `/docs/specs/features/{feature}/{version}/tasks/.tmp/` | Co-localizada com a feature, escapa do gate de proteção do `.claude/`, gitignored |
| ADRs em `/docs/adr/` | Convenção comunitária; `INDEX.md` é regenerado automaticamente |

> Você pode mudar qualquer uma dessas convenções editando a rule correspondente. As skills se adaptam.

---

## Próximos passos

* [Rules de paths — Fonte Autoritativa](/configuration/framework-paths.html) — referência prática.
* [Path Templates](/configuration/path-templates.html) — todas as chaves disponíveis.
* [Critical Paths](/configuration/critical-paths.html) — heurística agnóstica que vive em `agent-spec-workflow-rules.md`.
* [Gates Condicionais](/advanced/conditional-gates.html) — `requires_qa_revalidation`, também em `agent-spec-workflow-rules.md`.
* [Spec-Driven Development](/concepts/spec-driven.html) — princípio que motiva a separação spec/execução.
