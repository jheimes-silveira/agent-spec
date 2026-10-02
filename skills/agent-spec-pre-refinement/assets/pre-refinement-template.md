# Pré-Refinamento — Brainstorm de Produto

> Artefato **intermediário** (anterior ao PRD / INTENT / TaskCard), produto de um brainstorm em **Tree of Thought**: divergir os rumos possíveis, podar com o usuário e convergir.
>
> **Legenda:**
> - Linhas sem marcação = **FATO** (afirmado pelo usuário).
> - `[HIPÓTESE]` = inferência da skill que precisa ser validada.
> - `[DÚVIDA]` = ponto em aberto, detalhado na seção 13.
> - `[fora do escopo do projeto]` = rumo que extrapola o que este projeto se propõe a ser.

---

## 1. Metadados

- **Nome da Ideia / Feature**:
- **Fonte da ideia**: (texto livre | path do arquivo lido)
- **Autor**:
- **Data**:
- **Versão**: v1
- **Status**: Draft | Refinado | Pronto para próxima etapa
- **Relacionados**: (PRDs/specs existentes, notas, tickets)

---

## 2. Ideia Resumida (uma frase)

<!-- LLM-ONLY: Reescreva a ideia do usuário em UMA frase clara, sem ambiguidade. Remova este comentário no arquivo gerado. -->

---

## 3. Esqueleto do Tema (Fase 1 — ramos da árvore)

> Os 3-5 rumos de alto nível que enquadram a feature do ponto de vista de produto. Cada ramo é uma dimensão a explorar, não um requisito fechado. Marque o status definido com o usuário na Fase 1.

| # | Ramo | Status (Fase 1) |
|---|------|-----------------|
| A | <1 linha> | explorar / adicionado / despriorizado |
| B | <1 linha> | explorar / adicionado / despriorizado |
| C | <1 linha> | explorar / adicionado / despriorizado |
| D | <1 linha (opcional)> | explorar / adicionado / despriorizado |

---

## 4. Árvore de Rumos (Fase 2 — Tree of Thought)

> Para cada ramo aprovado: as direções candidatas exploradas (com exemplo concreto e viabilidade), a direção escolhida e as podadas/adiadas. Esta é a memória do brainstorm — mostra o caminho percorrido, não só o destino.

### Ramo A — <título>

**Direções candidatas:**

- **A1 — <direção>**: <descrição em 1 frase>.
  - _Exemplo:_ <exemplo concreto>
  - _Viabilidade:_ <reusa X já existente / requer Y novo / `[fora do escopo do projeto]`>
- **A2 — <direção>**: ...
  - _Exemplo:_ ...
  - _Viabilidade:_ ...
- **A3 — <direção>**: ...

**Direção escolhida**: <A2> — <motivo, decidido com o usuário>
**Podadas / adiadas**: <A1 (motivo)>, <A3 (adiado p/ v2 — motivo)>

### Ramo B — <título>

_(mesma estrutura)_

### Ramo C — <título>

_(mesma estrutura)_

<!-- LLM-ONLY: Repita o bloco por ramo aprovado na Fase 1. Toda direção candidata DEVE ter exemplo concreto. Marque rumos fora do escopo do projeto. Remova este comentário no arquivo gerado. -->

---

## 5. Problema

- **Qual é a dor real hoje?**
- **Como o problema aparece no dia a dia?** (exemplos concretos)
- **Quem sente o impacto?** (quem perde tempo, dinheiro, confiança)
- **Por que resolver agora?**

---

## 6. Objetivo Principal

- **Qual é o resultado esperado ao final?**
- **Qual mudança de comportamento/estado deve acontecer?**

<!-- LLM-ONLY: Apenas O QUE deve ser alcançado, NÃO como implementar. -->

---

## 7. Público / Usuário Envolvido

- **Persona primária**: quem usa/recebe o valor?
- **Persona secundária** (se houver):
- **Contexto de uso**: onde, quando, em qual dispositivo/ambiente?

---

## 8. Escopo Inicial (resultado da convergência)

Direções escolhidas na árvore de rumos que entram na primeira versão:

- [ ] <da direção escolhida do Ramo A>
- [ ] <da direção escolhida do Ramo B>
- [ ]

> Ponto de partida para o PRD/INTENT/TaskCard — não é definitivo.

---

## 9. Fora do Escopo (podado / adiado)

Direções **explicitamente** fora desta primeira versão (com motivo):

- <direção podada> — _motivo_
- <direção adiada p/ v2> — _motivo_
- <rumo `[fora do escopo do projeto]`> — _motivo_

---

## 10. Ancoramento no Projeto (guarda de escopo)

> O que foi consultado no projeto para manter o brainstorm dentro do escopo e reaproveitar o existente.

- **O que o projeto É** (CLAUDE.md / README): <propósito/domínio relevante>
- **PRDs / specs existentes consultados** (`/docs/specs/**/*.md` + `/docs/prds/**/*.md`):
  - `<feature/versão>` — <relação: cobre parte / adjacente / conflita / nada a ver>
- **Capacidades reutilizáveis** (apenas para viabilidade):
  - **Persistência**:
  - **Autenticação / autorização**:
  - **Outros módulos internos**:
- **Conflitos / sobreposições detectados**: <ou "nenhum">

<!-- LLM-ONLY: Cite nomes concretos. Se um rumo duplica/conflita com PRD existente, registre aqui e sinalize ao usuário. Remova este comentário no arquivo gerado. -->

---

## 11. Premissas e Decisões já tomadas

**Premissas** — suposições assumidas para que a ideia faça sentido:

- [HIPÓTESE]
- [HIPÓTESE]

**Decisões já tomadas (fora de negociação)** — restrições travadas pelo usuário que limitam os rumos viáveis (prazo, integração obrigatória, tecnologia imposta, política/compliance):

- <ou "nenhuma declarada">

<!-- LLM-ONLY: liste UMA decisão por linha, no texto literal do usuário. O rule-mining (pre_refinement_decision) lê este bloco. Remova este comentário no arquivo gerado. -->


---

## 12. Riscos e Pontos de Atenção

- **Risco de produto / aceitação**: (ex.: usuário usa 1× e não volta) → mitigação:
- **Risco de escopo** (pode explodir?): → mitigação:
- **Risco técnico ou operacional**: → mitigação:
- **Risco de privacidade / segurança / compliance**: → mitigação:

---

## 13. Dúvidas em Aberto

Perguntas objetivas a responder antes da próxima etapa:

1. [DÚVIDA]
2. [DÚVIDA]

---

## 14. Síntese do Brainstorm

> Fecho da Tree of Thought: o que sobreviveu, o que caiu, o que ficou para depois.

- **Absorvido no escopo inicial (seção 8)**: <listar direções escolhidas>
- **Descartado com justificativa**: <listar + por que não entra>
- **Adiado para v2/v3**: <listar>
- **Provocações que mudaram o rumo** (se houve): <listar>

---

## 15. Recomendação de Framework

> Preenchida automaticamente pela skill com base na complexidade que emergiu do brainstorm (ver `SKILL.md` → "Recomendação de Framework"). **Sugestão informada, não bloqueante.**

### 15.1 Complexidade Observada

| Dimensão | Valor detectado | Confirmação |
|---|---|---|
| Amplitude — # rumos/US que sobreviveram | _(0 / 1 / 2-3 / 4+)_ | inferido / confirmado |
| Personas | _(só dev / dev+1 / múltiplas personas)_ | inferido / confirmado |
| Novidade | _(ajuste / incremento / greenfield)_ | inferido / confirmado |
| Decisão arquitetural transversal nova? | _(sim / não — sinal de apoio)_ | inferido |

### 15.2 Framework Recomendado

**Escolhido**: `<SDD | miniSpec | TaskCard | TaskCard CRUD Fast-Path | Conversa direta>`

**Justificativa** (2-3 frases citando 2 dimensões decisivas):

_(LLM preenche — ex.: "Amplitude=4+ rumos + múltiplas personas → SDD. A formalização PRD+TechSpec se justifica pela presença de personas B2B e pela decisão arquitetural nova que vira ADR.")_

### 15.3 Alternativas Consideradas

**Por que NÃO <vizinho mais próximo>** (obrigatório):

_(LLM preenche — ex.: "miniSpec seria insuficiente: não captura contrato formal para a integração mobile nem comporta ADR.")_

**Por que NÃO <vizinho mais distante>** (se aplicável):

_(LLM preenche — ex.: "TaskCard é sub-dimensionado: escopo atravessa múltiplos módulos; perde rastreabilidade US→task.")_

### 15.4 Próximo Passo

```bash
<comando-exato>
# Se houver decisão arquitetural transversal nova, registre-a ANTES:
# /agent-spec-adr-create "<titulo-da-decisao>"
# ex.: /agent-spec-sdd-generate-prd "sistema de trocas entre colecionadores"
```

### 15.5 Quando Reconsiderar a Recomendação

- **Upgrade** se durante a execução emergirem: _(2-3 gatilhos — ex.: ">4 rumos novos", "decisão arquitetural não prevista", "persona nova")_
- **Downgrade** se: _(1-2 gatilhos — ex.: "escopo se fecha a 1 módulo", "zero integrações novas")_

---

## 16. Checklist Final

- [ ] Ideia resumida em uma frase clara
- [ ] **Esqueleto (seção 3)** com 3-5 ramos, validado com o usuário na Fase 1
- [ ] **Árvore de rumos (seção 4)**: cada ramo com direções candidatas + exemplo concreto + viabilidade + direção escolhida/podada
- [ ] Rumos fora do escopo do projeto marcados como `[fora do escopo do projeto]`
- [ ] Problema, público, escopo inicial e fora de escopo delimitados
- [ ] **Ancoramento (seção 10)** preenchido com PRDs/capacidades concretos
- [ ] Toda inferência marcada `[HIPÓTESE]`; dúvidas listadas como perguntas objetivas
- [ ] **Síntese (seção 14)** registra absorvido / descartado / adiado
- [ ] **Complexidade (15.1)** preenchida
- [ ] **Framework recomendado (15.2)** justificado com 2 dimensões decisivas
- [ ] **Alternativas (15.3)** explicam por que NÃO o vizinho mais próximo
- [ ] **Comando exato (15.4)** escrito
- [ ] **Gatilhos (15.5)** de reclassificação listados
- [ ] Pronto para alimentar PRD / INTENT / TaskCard
