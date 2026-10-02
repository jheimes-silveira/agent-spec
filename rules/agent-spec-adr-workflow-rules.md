---
description: Paths canônicos e critérios de criação do workflow ADR (Architecture Decision Records). Carregada quando trabalhando com docs/adr, skills adr-* ou skills consumidoras (orquestradores de execução e geradores que detectam/registram ADRs — usam adr.index_file e os critérios canônicos).
paths:
  - "docs/adr/**"
  - ".claude/skills/agent-spec-adr-*/**"
  - ".claude/skills/agent-spec-*-run*/**"
  - ".claude/skills/agent-spec-sdd-generate-tech-spec/**"
  - ".claude/skills/agent-spec-minispec-generate-scope/**"
  - ".claude/skills/agent-spec-taskcard-generate/**"
  - ".claude/skills/agent-spec-challenge-spec/**"
---

# ADR — Paths do Workflow

> Paths **globais** + recursos canônicos. A skill `agent-spec-adr-reindex` é a **dona** do script
> canônico; a skill `agent-spec-adr-create` é a **dona** do template canônico. Demais skills do
> domínio ADR (`agent-spec-adr-bootstrap`, `agent-spec-adr-deprecate`, `agent-spec-adr-supersede`) referenciam esses
> recursos via `adr.reindex_script` e `adr.template` em vez de manter cópias internas.

---

- **adr.dir**: `/docs/adr`
- **adr.index_file**: `/docs/adr/INDEX.md`
- **adr.file_pattern**: `{id}-{slug}.md`
- **adr.reindex_script**: `/.claude/skills/agent-spec-adr-reindex/scripts/reindex.cjs`
- **adr.template**: `/.claude/skills/agent-spec-adr-create/assets/adr-template.md`

---

# ADR — Rastreabilidade ADR ↔ Feature (convenção canônica)

> Fonte única dos nomes de seção usados na rastreabilidade bidirecional. Skills que **escrevem** ou **auditam** referências usam exatamente estes nomes.

- **Feature → ADR**: artefatos de feature (tech_spec/scope/taskcard) registram as ADRs consultadas numa subseção chamada **"ADRs Aplicáveis nesta Feature"** (dentro da seção de Observações Técnicas/Observações), uma linha por ADR no formato `ADR-NNNN — descrição curta da decisão`. Quem escreve: `agent-spec-sdd-generate-tech-spec`, `agent-spec-minispec-generate-scope`, `agent-spec-taskcard-generate` (e `agent-spec-challenge-spec` ao atualizar o artefato).
- **ADR → Feature**: a seção `## Applied in` de cada ADR (formato `feature (vN) — path-para-artefato`) é de **manutenção manual best-effort** — nenhuma skill a atualiza automaticamente. A `/agent-spec-adr-review` (Validação 4) reporta divergências entre os dois lados como WARN para o usuário reconciliar.

---

# ADR — Critérios Canônicos de Criação (Fonte Única)

> Esta seção é a **fonte única de verdade** sobre quando criar uma ADR. Skills de detecção (`agent-spec-sdd-generate-tech-spec`, `agent-spec-minispec-generate-scope`) e a skill de criação (`agent-spec-adr-create`) **referenciam** estes critérios em vez de duplicá-los. Toda nova ADR DEVE satisfazer **TODOS os 5 critérios**.

## Os 5 Critérios (require_all)

| # | Critério | Pergunta-teste | OK se |
|---|----------|----------------|-------|
| C1 | `transversal` | A decisão se aplica a outras features ou ao projeto inteiro (não é feature-específica)? | SIM |
| C2 | `tag_alvo` | A decisão cai em uma das 14 tags canônicas (ver lista abaixo)? | SIM |
| C3 | `custo_reversao_alto` | Reverter implica refactor significativo (≥ médio) em múltiplos lugares? | SIM |
| C4 | `surpreendente_sem_contexto` | Um leitor futuro do código vai se perguntar "por que fizeram assim?" sem este registro? | SIM |
| C5 | `trade_off_real` | Havia ao menos UMA alternativa genuinamente considerada, rejeitada por razão específica (não "única opção viável")? | SIM |

**Se QUALQUER critério falhar → NÃO crie ADR.** Registre a decisão no artefato de feature (Tech Spec / Scope) na seção de Observações, com a justificativa de por que não virou ADR.

## Tags Canônicas (para C2)

A decisão deve se encaixar em **1 a 3** destas tags. Se nenhuma cobre o tema, é caso de atualizar a lista — **não** invente tag nova.

```
architecture, state-management, auth, security, data, http,
validation, testing, build, observability, performance, ui,
error-handling, cross-cutting
```

## Heurística de Aplicação

### Em skills de detecção (`agent-spec-sdd-generate-tech-spec`, `agent-spec-minispec-generate-scope`)

1. Ao identificar uma decisão técnica candidata, aplique os 5 critérios mentalmente.
2. Se **todos** baterem → registre na seção de Observações do artefato como **"Candidato a ADR confirmado"** + tag aplicável + 1 frase justificando cada critério.
3. Se **2-4** baterem → registre como **"Candidato a ADR parcial"** + lista de critérios que falharam (ajuda o usuário a decidir se promove ou refina).
4. Se **0-1** baterem → registre apenas como decisão técnica na seção apropriada — **não** mencione candidatura a ADR.
5. **NUNCA** crie ADR automaticamente — apenas sinalize. O usuário invoca `/agent-spec-adr-create` se desejar.

### Em `agent-spec-adr-create` (gate de criação)

A skill `agent-spec-adr-create` deve **revalidar os 5 critérios** com o usuário (via `AskUserQuestion`) antes de coletar dados. Se qualquer critério falhar, encerra orientando o usuário a documentar a decisão no Tech Spec / Scope apropriado.

## Por que 5 critérios (e não menos)

- **C1 (transversal)** evita poluir ADRs com decisões locais — ADR é registro **do projeto**, não da feature.
- **C2 (tag-alvo)** garante taxonomia consistente e descoberta via índice.
- **C3 (custo de reversão)** evita registrar decisões que vão mudar amanhã sem dor.
- **C4 (surpreendente sem contexto)** [importado do skill grill-with-docs] garante que cada ADR tenha **valor de leitura futura** — se a decisão é óbvia, registrar é ruído.
- **C5 (trade-off real)** [importado do skill grill-with-docs] força o autor a articular as alternativas. ADR sem alternativa real é apenas um README mal posicionado.

C1-C3 são os filtros estruturais (escopo, taxonomia, custo). C4-C5 são os filtros de **valor narrativo** — sem eles, ADRs viram cemitério de decisões triviais.
