---
id: "agent-spec-challenge-spec"
title: "agent-spec-challenge-spec"
sidebar_position: 6
---
# agent-spec-challenge-spec

`Compartilhada`
> **Resumo**: Stress-test interativo de uma spec técnica (`tech_spec.md` do SDD ou `scope.md` do miniSpec) contra o domínio, código e ADRs existentes. Conduz interrogatório estruturado (**uma pergunta por vez**), explora o codebase quando possível em vez de perguntar, atualiza o artefato **inline** conforme problemas são resolvidos, mantém os domain glossaries vivos e propõe ADRs novas apenas quando os 5 critérios canônicos batem.

**Persona**: Arquiteto de Software Sênior atuando como **devil's advocate**. Missão NÃO é validar — é encontrar furos. Presume que toda spec tem ambiguidades, decisões implícitas e conflitos com código existente. Direto, cético, curioso.

> Inspirada na skill `grill-with-docs` (Matt Pocock).

---

## Visão geral

Passo **opcional de validação pós-criação** que opera entre a geração da spec técnica e o início da decomposição em tasks. Preenche a lacuna entre "spec gerada" e "execução nos gates" — evita que furos cheguem ao QA/Tech Review quando o custo de correção é alto.

```
[SDD]      tech_spec.md gerado  →  /agent-spec-challenge-spec tech_spec.md  →  task_plan.md
[miniSpec] scope.md gerado      →  /agent-spec-challenge-spec scope.md      →  task_plan.md
```

Responde: **a spec sobrevive a um interrogatório agressivo contra código real, glossário de domínio e ADRs existentes?**

> **Por que NÃO opera sobre PRD/Intent**: são artefatos de produto (o quê / por quê). Não há código nem ADR técnico para confrontá-los — terminologia já é validada na geração via glossário. Rodar challenge neles é overhead sem retorno.

---

## Quando usar

* Specs com decisão técnica não-trivial.
* Terminologia nova ou potencial conflito com código existente.
* Feature crítica para produção antes da decomposição em tasks.
* Pós-geração quando a fonte (PRD/Intent) era genérica e a spec teve que inferir muito.

## Quando NÃO usar

| Cenário | Por que não |
| --- | --- |
| PRD, Intent, Task Plan, TaskCard | Fora de escopo. Skill recusa com mensagem clara. |
| Specs pequenas (1-2 endpoints, sem complexidade arquitetural) | Overhead sem ganho. |
| Specs já revisadas manualmente com profundidade | Custo > benefício. |
| Verificar implementação | Use os gates ([agent-spec-qa-validator](../../agents/qa-validator.md), [agent-spec-staff-architecture-review](../../agents/staff-architecture-review-agent.md)). |

---

## Inputs

| Input | Origem | Obrigatório? |
| --- | --- | --- |
| Caminho do `tech_spec.md` ou `scope.md` | Usuário (argumento) | Sim |
| Glossários de domínio (global + feature) | Lidos lazy | Não (criados se necessário) |
| `docs/adr/INDEX.md` | Lido lazy | Não |
| PRD (se SDD) ou INTENT (se miniSpec) | Lido lazy para checar coerência produto↔técnico | Não |
| Código backend (paths mencionados na spec) | Lido lazy | Não |

---

## Outputs

| Artefato | Mudança |
| --- | --- |
| `tech_spec.md` ou `scope.md` (input) | **Atualizado inline** conforme issues são resolvidos |
| `/docs/specs/domain-glossary.md` (global) | Criado/atualizado para termos cross-feature canonizados |
| `/docs/specs/features/{feature}/domain-glossary.md` (feature) | Criado/atualizado para termos específicos canonizados |
| `qa-observations.md` (feature) | Append: log da sessão challenge (auditoria) |
| ADRs novas | **NÃO** criadas diretamente — skill **sugere** invocar `/agent-spec-adr-create` |

---

## Fluxo de execução

### FASE 0 — Detecção e pré-carregamento

* Detecta tipo de artefato pelo nome: `tech_spec.md` → fluxo SDD; `scope.md` → fluxo miniSpec; qualquer outro → erro com mensagem clara.
* Valida que arquivo existe e não é só um marcador.
* Carrega artefato completo (input primário).
* Carrega contexto auxiliar:
  + **Glossários (2 níveis)**: `domain_glossary.global.path` + `domain_glossary.feature.path`. Lê ambos se existem; precedência feature sobre global em conflito (raro; sinaliza). Se nenhum existir, marca que será criado lazy quando termos forem canonizados.
  + `docs/adr/INDEX.md` (leitura única; ADRs individuais só se relevantes).
  + PRD (SDD) ou INTENT (miniSpec) para coerência produto↔técnico.
* Varre codebase para mapear: arquivos mencionados (verifica existência; se "A modificar", lê estado atual); padrões nas camadas tocadas; endpoints/entidades próximos (detecta colisões ou reuso ignorado).

### FASE 1 — Construção do plano de interrogatório

Monta **mentalmente** lista priorizada de questões (NÃO escreve no chat — é plano interno; pesca uma por vez):

| Prioridade | Categoria |
| --- | --- |
| **Alta** | Conflitos de terminologia vs glossário existente |
| **Alta** | Contradições com código real (ex.: spec diz "criar endpoint X" mas X já existe) |
| **Alta** | Violações de ADR existente (ex.: spec usa ORM mas ADR-0007 mandou SQL bruto) |
| **Média** | Decisões implícitas sem justificativa (ex.: escolha de DB sem trade-off) |
| **Média** | Edge cases técnicos não cobertos (timeout, concorrência, falha parcial) |
| **Média** | Reuso ignorado (utilitário/módulo existente não referenciado) |
| **Baixa** | Ambiguidade de escopo (ex.: "deve ser performático" sem métrica) |

### FASE 2 — Interrogatório (UMA pergunta por vez)

Para cada questão da lista priorizada:

1. **Se a questão pode ser respondida lendo código** → lê o código primeiro. Só pergunta ao usuário se inconclusivo ou se houver decisão de produto envolvida.
2. **UMA pergunta por vez** via `AskUserQuestion`, sempre com:

   * Contexto (1-2 linhas explicando o achado).
   * Pergunta direta.
   * **Sua recomendação** com justificativa (não pergunta aberta — pergunta com sugestão).

   Exemplo:

   
```
Achado: A spec define POST /orders/{id}/cancel, mas encontrei
POST /orders/{id}/void já implementado em handlers/orders.go:142,
com comportamento muito próximo (transição de estado + emissão de evento).

Pergunta: "Cancel" e "Void" são o mesmo conceito, ou são distintos?
Recomendação: Se forem o mesmo, renomeie a spec para usar /void
(preserva o existente e evita duplicação). Se forem distintos,
registre no glossário com a diferença.
```

3. **Aguarda a resposta** antes da próxima pergunta. NUNCA enfileira.
4. **Age sobre a resposta**:

   * Conflito de terminologia resolvido → atualiza artefato inline + atualiza/cria glossário com termo canônico + aliases.
   * Violação de ADR identificada → atualiza artefato com referência à ADR + ajusta decisão.
   * Decisão técnica canonizada → avalia se vira ADR (FASE 4).
   * Questão revelada inválida → registra motivo na seção Observações do artefato.
5. **Sem mais questões prioritárias** (ou usuário pede parar) → FASE 3.

> **Limite prático**: prioriza 5-10 questões de maior impacto. Se forem 30, o usuário desiste. Sessão profunda em pontos críticos > cobertura rasa de tudo.

### FASE 3 — Consolidação do(s) glossário(s)

Para cada termo canonizado durante a sessão, decide o **nível** (global vs feature) antes de gravar.

#### 3.1 Decisão de nível — Global vs Feature

| Vai pro **GLOBAL** se… | Fica no **FEATURE** se… |
| --- | --- |
| Entidade de negócio que aparece (ou vai aparecer) em ≥ 2 features | Conceito operacional restrito a essa feature |
| Existe relacionamento entre entidades de domínio | Regra/política específica da feature |
| Ex.: entidades centrais do produto (substantivos cross-feature) | Ex.: parâmetros/limites operacionais, estados de máquina internos, regras do fluxo |

**Default em dúvida**: GLOBAL (mais fácil descer do global pro feature do que descobrir features divergindo).

Pergunta ao usuário via `AskUserQuestion` para termos cuja classificação não é óbvia. Para termos claramente globais (entidades fundamentais) ou claramente feature (regras operacionais), anuncia decisão sem perguntar — só avisa onde foi registrado.

#### 3.2 Gravação

| Arquivo destino | Path | Comportamento |
| --- | --- | --- |
| Global | `/docs/specs/domain-glossary.md` | Cria se não existia E ≥ 1 termo vai pra ele; senão, adiciona/atualiza apenas termos resolvidos na sessão |
| Feature | `/docs/specs/features/{feature}/domain-glossary.md` | Cria se não existia E ≥ 1 termo vai pra ela; senão, adiciona/atualiza apenas termos resolvidos |

Cada termo registrado tem: definição em 1 frase (o que o termo É); lista de aliases a evitar; atualização das seções Relacionamentos e Ambiguidades resolvidas se relevante.

Confirma com o usuário: *"Atualizei o glossário GLOBAL com N termo(s): [lista] e o glossário FEATURE com M termo(s): [lista]. OK?"*.

### FASE 4 — Detecção e oferta de ADRs

Para cada **decisão técnica significativa** canonizada/justificada durante o interrogatório, aplica os **5 critérios canônicos** de ADR (definidos em `agent-spec-adr-workflow-rules.md`):

| # | Critério |
| --- | --- |
| C1 | `transversal` |
| C2 | `tag_alvo` (1 das 14 canônicas) |
| C3 | `custo_reversao_alto` |
| C4 | `surpreendente_sem_contexto` |
| C5 | `trade_off_real` |

| Quantos critérios batem | Ação |
| --- | --- |
| **Todos os 5** | Oferece ao usuário via `AskUserQuestion`. Se sim → orienta usuário a rodar `/agent-spec-adr-create` (skill **não cria ADR diretamente** — quem cria é a `agent-spec-adr-create`). Se não → registra "Candidato a ADR rejeitado pelo usuário" + razão na seção Observações |
| **2-4** | Registra "Candidato a ADR parcial" na seção Observações + lista critérios que falharam |
| **0-1** | Não menciona candidatura (decisão é local/trivial) |

### FASE 5 — Salvar e reportar

1. Re-salva o artefato modificado (`tech_spec.md`/`scope.md`) com atualizações inline.
2. Salva o(s) glossário(s) se foram criados/modificados.
3. Append em `qa-observations.md` (feature):

```markdown
## Challenge Session — YYYY-MM-DD HH:MM (artifact: {nome})

- Questões processadas: N
- Conflitos de terminologia resolvidos: N (lista)
- Decisões implícitas explicitadas: N (lista)
- Termos canonizados no glossário: N (lista)
- Candidatos a ADR sinalizados: N (lista)
- ADRs sugeridos para criação: N (lista)
```

4. Saída resumida ao usuário:

```
✅ Challenge concluído em {artefato}
- {N} ajustes inline aplicados
- Glossário: {criado|atualizado|sem mudança}
- ADRs sugeridos: {N} (rode /agent-spec-adr-create para cada)
- Próximo passo: {/sdd-generate-task-plan | /agent-spec-minispec-generate-tasks}
```

---

## Guardrails invioláveis

### DEVE

1. Operar **APENAS** sobre `tech_spec.md` (SDD) ou `scope.md` (miniSpec). Recusa outros artefatos.
2. **UMA pergunta por vez** via `AskUserQuestion`. NUNCA enfileira.
3. **Explorar código ANTES de perguntar** quando a questão pode ser respondida pela leitura.
4. Atualizar o artefato **inline** conforme issues são resolvidos (não acumular para o final).
5. Aplicar **5 critérios canônicos de ADR** antes de sugerir.
6. **NÃO criar ADR diretamente** — sempre orienta usuário a rodar `/agent-spec-adr-create` (revalida critérios).
7. Atualizar glossários **nos 2 níveis** (global cross-feature; feature específico). Decisão de nível segue FASE 3.1.
8. Registrar sessão em `qa-observations.md` para rastreabilidade.
9. Priorizar 5-10 questões de maior impacto. Sessão longa demais desengaja.

### NÃO DEVE

1. **NUNCA** operar sobre PRD, Intent, Task Plan ou TaskCard.
2. **NUNCA** modificar arquivos fora de: o próprio artefato, os 2 `domain-glossary.md`, e append em `qa-observations.md`.
3. **NUNCA** criar ADR diretamente — apenas sugerir.
4. **NUNCA** prosseguir sem aguardar resposta a cada `AskUserQuestion`.
5. **NUNCA** ignorar conflitos com ADRs existentes — sinaliza sempre (mesmo que usuário queira manter divergência → registra como exceção justificada).
6. **NUNCA** inventar termos para o glossário — só registra o que foi explicitamente confirmado pelo usuário na sessão.
7. **NUNCA** criar glossário se nenhum termo foi canonizado (não-vazio é regra).

---

## Comando

```bash
/agent-spec-challenge-spec <caminho para tech_spec.md ou scope.md>
```

### Exemplos

```bash
# SDD:
/agent-spec-challenge-spec docs/specs/features/pedidos/v1/tech_spec.md

# miniSpec:
/agent-spec-challenge-spec docs/specs/features/notificacoes/v1/scope.md
```

### Saída típica

Sessão interativa (5-10 perguntas com `AskUserQuestion`), seguida de:

* Artefato atualizado inline (decisões resolvidas, ambiguidades explicitadas, conflitos com ADRs sinalizados).
* Glossário(s) atualizados (termos canonizados com aliases).
* Sugestões de `/agent-spec-adr-create` para decisões que batem nos 5 critérios.
* Log no `qa-observations.md`.
* Mensagem final orientando o próximo passo (`/agent-spec-sdd-generate-task-plan` ou `/agent-spec-minispec-generate-tasks`).

---

## Diferença vs outras skills

| Skill | Quando | Diferença |
| --- | --- | --- |
| `agent-spec-challenge-spec` | **Pré-decomposição** (após geração da spec, antes do task_plan) | Stress-test interativo da spec contra código/ADR/glossário |
| `agent-spec-qa-validator` (Gate 1) | Pós-execução de cada task | Valida funcional + executa testes |
| `agent-spec-staff-architecture-review` (Gate 2) | Pós-Gate 1 de cada task | Valida arquitetura + ADRs + segurança profunda |
| `agent-spec-sdd-generate-tech-spec` / `agent-spec-minispec-generate-scope` | **Geração inicial** da spec | Cria o artefato; sinaliza candidatos a ADR mas não interroga em profundidade |

---

## Configuração via framework-paths.md

Paths resolvidos via:

* `sdd.tech_spec.path`, `minispec.scope.path` — artefatos de entrada.
* `domain_glossary.global.path`, `domain_glossary.feature.path` — glossários (2 níveis).
* `adr.index_file`, `adr.dir` — ADRs existentes.
* `shared.qa_observations.path` — log da sessão.

---

## Skills relacionadas

* [`agent-spec-sdd-generate-tech-spec`](../sdd/sdd-generate-tech-spec.md) — gera o tech_spec consumido por esta skill.
* [`agent-spec-minispec-generate-scope`](../minispec/minispec-generate-scope.md) — gera o scope consumido por esta skill.
* [`agent-spec-adr-create`](../adr/adr-create.md) — chamada após challenge sugerir ADR (revalida critérios).
* [`agent-spec-sdd-generate-task-plan`](../sdd/sdd-generate-task-plan.md), [`agent-spec-minispec-generate-tasks`](../minispec/minispec-generate-tasks.md) — próximo passo após challenge.

---

## Próximos passos

* [Os 5 critérios de ADR](../../agent-spec-completo.md#13-o-que-vira-adr--os-5-critérios)
* [Glossário de domínio (2 níveis)](../../agent-spec-completo.md#18-glossário-de-domínio-2-níveis)
* [Skills — Visão Geral](../overview.md)
