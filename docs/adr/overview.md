---
id: "overview"
title: "ADR — Visão Geral"
sidebar_position: 1
---
# ADRs — Architecture Decision Records

Decisões arquiteturais **transversais e evergreen** versionadas em `docs/adr/`. Complementa SDD/miniSpec sem duplicar — artefatos de feature apenas **referenciam** ADRs.

> **Single source of truth**: ADR captura a decisão. PRD/Tech Spec/Scope **referenciam**. Nunca duplicam.

---

## Quando criar uma ADR

Uma decisão é candidata se **TODAS** as 3 heurísticas são verdadeiras:

| Critério | Pergunta | OK se |
| --- | --- | --- |
| `transversal` | A decisão se aplica a outras features ou ao projeto inteiro? | SIM |
| `tag_alvo` | Cai em uma das 14 tags canônicas? | SIM |
| `custo_reversao` | Reverter implicaria refactor significativo (≥ médio) em múltiplos lugares? | SIM |

Se **algum** for `NÃO` → não é ADR. A decisão deve viver no Tech Spec / Scope / código.

---

## Exemplos típicos

| Decisão | Tag | Por que ADR |
| --- | --- | --- |
| Repository + Service pattern | architecture | Transversal, aplica a todos os módulos |
| Sessão JWT em sessionStorage | auth | Transversal, reversão exige alterar múltiplos clientes |
| Zod como validador universal | validation | Transversal, todos os contratos usam |
| SQLC + MySQL para persistência | data | Transversal, todos os repositórios seguem |
| Wire para DI | architecture | Transversal, toda composição passa por aqui |

---

## Modelo Nygard enxuto

Cada ADR tem 5 seções:

| Seção | Conteúdo |
| --- | --- |
| **Context** | Situação e forças que levaram à decisão |
| **Decision** | O que foi decidido |
| **Consequences** | Positivas e negativas |
| **Alternatives considered** | Consideradas e rejeitadas, com justificativa |
| **Applied in** | Features que implementam (atualizado conforme aplicação) |

Detalhes em [Template Nygard](/adr/template-nygard.html).

---

## Status (ciclo de vida)

| Status | Significado | Pode ser referenciada? |
| --- | --- | --- |
| `accepted` | Decisão ativa (default ao criar) | Sim |
| `deprecated` | Não recomendar mais; sem substituta | Sim (com warning) |
| `superseded-by:NNNN` | Substituída pela ADR `NNNN` | Sim (com aviso para migrar) |

Detalhes em [Lifecycle](/adr/lifecycle.html).

---

## Tags canônicas (lista fechada)

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```
> **Lista fechada** com 14 entradas. Tag fora da lista é proibida. Se nenhuma cobre o tema, é caso de discutir adicionar uma nova ao framework — não criar ADR com tag inventada.

---

## Skills do framework ADR (9)

| Skill | Operação | Tipo |
| --- | --- | --- |
| [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) | Corpus inicial a partir de varredura do projeto | Generator |
| [agent-spec-adr-create](/skills/adr/adr-create.html) | Nova ADR (dona do template canônico) | Generator |
| [agent-spec-adr-show](/skills/adr/adr-show.html) | Exibir ADR específica | Maintenance |
| [agent-spec-adr-list](/skills/adr/adr-list.html) | Listar ADRs (filtro tag/status) | Maintenance |
| [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) | Substituir ADR por outra | Generator |
| [agent-spec-adr-deprecate](/skills/adr/adr-deprecate.html) | Marcar ADR como deprecated | Maintenance |
| [agent-spec-adr-review](/skills/adr/adr-review.html) | Auditoria (read-only) | Maintenance |
| [agent-spec-adr-reindex](/skills/adr/adr-reindex.html) | Regenerar `INDEX.md` (dona do script canônico) | Maintenance |

---

## Integração com SDD/miniSpec

[agent-spec-sdd-generate-tech-spec](/skills/sdd/sdd-generate-tech-spec.html) e [agent-spec-minispec-generate-scope](/skills/minispec/minispec-generate-scope.html) **detectam candidatos a ADR** durante a geração e propõem criar via [agent-spec-adr-create](/skills/adr/adr-create.html).

[agent-spec-staff-architecture-review](/agents/staff-architecture-review-agent.html) (Gate 2) **valida conformidade com ADRs** durante execução. Violação clara = `severity: critical`, `category: adr_compliance`.

Detalhes em [Integração com Frameworks](/adr/integration-frameworks.html).

---

## INDEX.md

`docs/adr/INDEX.md` é uma tabela resumida regenerada por [agent-spec-adr-reindex](/skills/adr/adr-reindex.html):

```markdown
| ID | Título | Status | Tags | Problema (1-linha) |
|-------|---------------------------------|------------|------------------|----------------------------|
| 0001 | repository-service-pattern | accepted | architecture | Padrão de acesso a dados |
| 0042 | rate-limit-strategy | accepted | http,performance | Picos comprometem latência |
```

**Por que separar INDEX**: skills leem `INDEX.md` (pequeno) para decidir **quais** ADRs consultar e só abrem as relevantes — evita carregar todas no contexto.

---

## Configuração via framework-paths.md

Paths sob `adr.*` no [framework-paths.md](/configuration/framework-paths.html):

| Chave | Default |
| --- | --- |
| `adr.dir` | `/docs/adr` |
| `adr.index_file` | `/docs/adr/INDEX.md` |
| `adr.file_pattern` | `{id}-{slug}.md` |
| `adr.template` | `/.claude/skills/agent-spec-adr-create/assets/adr-template.md` |
| `adr.reindex_script` | `/.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs` |

Veja [Path Templates](/configuration/path-templates.html).

---

## Próximos passos

* [Lifecycle](/adr/lifecycle.html) — estados e transições.
* [Template Nygard](/adr/template-nygard.html) — estrutura canônica.
* [Integração com Frameworks](/adr/integration-frameworks.html) — como SDD/miniSpec consomem ADRs.
* [agent-spec-adr-list](/skills/adr/adr-list.html) — listar corpus existente.
* [agent-spec-adr-create](/skills/adr/adr-create.html) — criar nova ADR.
* [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) — popular corpus inicial em projeto existente.
