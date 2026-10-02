<!--
Template de Architecture Decision Record (ADR) — Nygard enxuto.

Este arquivo vive dentro da skill `agent-spec-adr-create` para portabilidade:
copiar `.claude/skills/agent-spec-adr-create/` leva o template junto. Resolvido
internamente pela skill (sem depender do CLAUDE.md).

NÃO edite este arquivo diretamente a menos que esteja atualizando o molde.
Para criar uma ADR a skill preenche este template.

Diretrizes de preenchimento (remover TODOS os comentários `<!-- ... -->`
antes de salvar a ADR real):

- Seja direto. Se a ADR passar de 60 linhas, provavelmente esta virando
  tech_spec — mova detalhes para o Tech Alignment (tech-alignment.md) / Tech Spec.
- Uma decisão por ADR. Decisões aninhadas viram ADRs separadas
  referenciando uma a outra.
- `Applied in` é a lista de features que adotaram a decisão. Manutenção
  MANUAL best-effort: nenhuma skill a atualiza automaticamente; a
  `/agent-spec-adr-review` reporta divergências para você reconciliar.
- Status: `accepted` (padrão), `deprecated`, `superseded-by:NNNN`.
- Tags: escolher da lista canônica de tags definida na SKILL.md da
  `agent-spec-adr-create` (seção "Tags Canônicas"). Máximo 3 tags.
-->
---
id: NNNN
title: Título curto em uma frase
status: accepted
date: YYYY-MM-DD
tags: [tag-canônica]
---

# NNNN - Título curto em uma frase

## Context

<!--
Problema concreto que motivou a decisão. Qual dor, qual restrição, o que
estava em disputa. 3-5 linhas. NÃO reproduza contexto de produto — foque
na questão técnica.
-->

## Decision

<!--
O que foi decidido. 1-2 frases diretas, sem rodeios. Evite "vamos considerar",
"provavelmente" — escreva a decisão no indicativo.
-->

## Consequences

<!--
Efeitos da decisão, bons e ruins. Bullets curtos.
-->

**Pros:**
- ...

**Cons:**
- ...

**Neutros:**
- ...

## Alternatives considered

<!--
Opções descartadas com o motivo sucinto. Pelo menos 1 alternativa.
-->

- **Alt A** — breve descrição. Motivo da rejeição: ...
- **Alt B** — breve descrição. Motivo da rejeição: ...

## Applied in

<!--
Lista de features/contextos que adotaram esta decisão. Manutenção
MANUAL best-effort (nenhuma skill atualiza automaticamente; a
`/agent-spec-adr-review` reporta divergências). Formato:
`feature (vN) — path-para-artefato`.

Manter a lista curta (aponta, não duplica). Se uma feature ficar
superseded, manter o registro histórico.
-->

- ...
