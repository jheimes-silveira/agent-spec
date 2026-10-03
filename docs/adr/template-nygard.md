---
id: "template-nygard"
title: "Template Nygard"
sidebar_position: 3
---
# Template Nygard Enxuto

ADRs no framework seguem o **padrão Nygard enxuto**: 5 seções obrigatórias, frontmatter mínimo, sem inflação. O template canônico vive em [agent-spec-adr-create](/skills/adr/adr-create.html) e é referenciado por todas as outras skills ADR via `adr.template` no [framework-paths.md](/configuration/framework-paths.html).

---

## Estrutura completa

```markdown
---
id: NNNN
title: 
status: accepted
date: YYYY-MM-DD
tags: [<1-a-3-tags-canônicas>]
---
# ADR-NNNN: 
## Context
[1-3 parágrafos: o problema, a pressão, o trade-off em jogo]
## Decision
[A decisão tomada, em uma frase clara]
## Consequences
[Bullets com consequências positivas e negativas]
## Alternatives considered
[Bullets com alternativas e por que foram rejeitadas]
## Applied in
[Bullets de features/módulos que aplicam esta ADR — atualizado conforme aplicação]
```

---

## Frontmatter (campos obrigatórios)

| Campo | Descrição | Exemplo |
| --- | --- | --- |
| `id` | Sequencial 4 dígitos zero-padded | `0042` |
| `title` | kebab-case curto | `rate-limit-strategy` |
| `status` | Estado atual | `accepted`, `deprecated`, `superseded-by:0099` |
| `date` | Data da última mudança | `2026-04-28` |
| `tags` | 1 a 3 entradas da [lista canônica](/adr/overview.html#tags-canônicas-lista-fechada) | `[http, performance]` |

---

## Por que cada seção

### Context (`Context`)

Captura **o problema, a pressão, o trade-off**. Sem context, futuros leitores não entendem **por que** a decisão foi tomada.

✅ **Bom**: "Picos esporádicos de tráfego comprometem latência da API. Cliente B2B tem SLA de 200ms p99. Sem rate limit, um único cliente abusivo derruba performance dos outros."

❌ **Ruim**: "Precisávamos de rate limit." (não explica por quê).

### Decision (`Decision`)

**Uma frase clara** com a decisão. Sem hesitações, sem alternativas.

✅ **Bom**: "Adotar token bucket via Redis com escala 100 req/s por usuário."

❌ **Ruim**: "Decidir entre token bucket e sliding window." (isso vai em Alternatives).

### Consequences

Bullets com consequências **positivas e negativas**. Honestidade é importante — toda decisão tem trade-off.

✅ **Bom**:

```
+ Proteção contra abuso de cliente único
+ Compartilhamento de contadores entre instâncias
- Dependência adicional do Redis (já existente, então custo zero)
- Janela de 1s pode causar bursts no início de cada janela
```

### Alternatives considered

Lista de alternativas e **por que foram rejeitadas**. Mostra que houve trade-off real.

✅ **Bom**:

```
- Sliding window: rejeitado (custo de memória O(n) por usuário)
- Leaky bucket: rejeitado (latência irregular em picos)
- Sem rate limit: rejeitado (SLA do cliente B2B inviabiliza)
```

### Applied in

Lista de features/módulos que **aplicam esta ADR**. Atualizado conforme features são desenvolvidas.

✅ **Bom**:

```
- internal/api/middleware/ratelimit.go
- internal/users/handler.go (aplicado em /users/login)
- /docs/specs/features/rate-limit/v1/ (feature original)
```

---

## Tamanho alvo

| Seção | Linhas |
| --- | --- |
| Context | 5-15 |
| Decision | 1 frase |
| Consequences | 3-8 bullets |
| Alternatives considered | 2-5 bullets |
| Applied in | 0-N (cresce com adoção) |

**Total alvo**: 30-80 linhas. Se passar de 100 linhas, está virando Tech Spec — **divida em ADRs separadas** ou refine.

---

## Convenções

### Idioma

* **Títulos canônicos** das seções (`Context`, `Decision`, `Consequences`, `Alternatives considered`, `Applied in`) ficam em **inglês** por convenção Nygard.
* **Texto descritivo**: pt-BR com acentuação correta.
* **Nomes de código** (funções, classes, pacotes): inglês sem acento.

### Slug

* kebab-case minúsculo, sem acentos: `rate-limit-strategy`, `repository-service-pattern`.
* Curto e descritivo (3-5 palavras).

### ID

* 4 dígitos zero-padded: `0001`, `0042`, `0123`.
* Sequencial. [agent-spec-adr-create](/skills/adr/adr-create.html) descobre o próximo ID lendo `INDEX.md`.
* Nunca reusar ID, mesmo após deprecate/supersede.

---

## Localização do template canônico

* **Arquivo**: `.claude/skills/agent-spec-adr-create/assets/adr-template.md`
* **Referência via framework-paths.md**: `adr.template` → resolvido para o path acima.
* **Dono**: [agent-spec-adr-create](/skills/adr/adr-create.html).
* **Consumidores**: [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html), [agent-spec-adr-supersede](/skills/adr/adr-supersede.html) (no ramo NEW\_NOVA).

> Manter o template em **um único lugar** evita divergência entre skills. Skills que precisam do template **leem** este arquivo, não duplicam.

---

## Próximos passos

* [Lifecycle](/adr/lifecycle.html) — estados e transições.
* [agent-spec-adr-create](/skills/adr/adr-create.html) — usa este template para criar ADRs.
* [agent-spec-adr-bootstrap](/skills/adr/adr-bootstrap.html) — usa este template em lote.
* [agent-spec-adr-show](/skills/adr/adr-show.html) — exibir uma ADR seguindo este template.
