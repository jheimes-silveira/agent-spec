---
name: agent-spec-mine-rule-candidates
description: |
  Consolida sinais coletados em `shared.rule_candidates.path` ao longo dos
  últimos N runs do framework agent-spec e produz uma lista enxuta de
  candidatos a regra (com evidência de repetição em features distintas),
  pronta para entrega ao `agent-spec-curate-project-rules`. Use SEMPRE que o usuário
  pedir para "minerar regras", "ver o que tem virado pergunta repetida",
  "quais convenções precisam virar regra", "rodar a mineração", "olhar os
  rule_candidates", "consolidar candidatos a regra" ou variações — também
  antes de release / sprint review, quando quiser pagar débito de
  convenção implícita antes que apodreça. Acione também quando o usuário
  descrever "toda hora preciso explicar a mesma coisa pro executor" e
  pedir para descobrir o que é.
when_to_use: |
  - Depois de ≥3 features concluídas, para ver o que repetiu.
  - Antes de release, como parte do passe de "saúde do framework".
  - Quando rules existentes parecem incompletas (executor ainda pergunta muito).
  - Quando staff-review repete o mesmo `convention_drift` em features diferentes.
  - Quando o usuário suspeita de convenção implícita que ninguém escreveu.
do_not_invoke_for: |
  - Decidir o destino/forma de UMA regra específica → use `agent-spec-curate-project-rules`.
  - Coletar sinais em tempo real → quem coleta são os agentes, não esta skill.
  - Auditar rules existentes em busca de bloat/duplicação → use `agent-spec-curate-project-rules` (passe de auditoria).
  - Identificar bugs ou regressões → use Tech Review / agent-spec-qa-validator.
disable-model-invocation: true
---

# /agent-spec-mine-rule-candidates — mineração de candidatos a regra

> Consolida o que **já foi capturado** durante os runs. Esta skill **não decide** se algo vira regra; só agrupa, filtra por repetição e entrega para `agent-spec-curate-project-rules` (que aplica teste de fricção, escolhe escopo e forma).

A regra do framework é simples: **um sinal isolado não vira regra**. Se um padrão aparece numa única feature, pode ser idiossincrasia. Se aparece em **≥2 features distintas** com o mesmo sinal, é convenção implícita que vale a pena formalizar — ou, no mínimo, debater conscientemente.

---

## Fase 0 — Sanity check

Antes de minerar, garanta que o cenário faz sentido:

1. **Confirme o caminho canônico**: `shared.rule_candidates.path` em [`agent-spec-workflow-rules.md`](../../rules/agent-spec-workflow-rules.md). Não invente diretório.
2. **Descubra quais features têm o arquivo**:
   ```
   docs/specs/features/*/v*/_run/rule-candidates.md
   ```
   (use glob compatível com a stack — a estrutura é a do framework agent-spec)
3. **Se não houver nenhum arquivo**: pare e explique ao usuário que nenhum run ainda emitiu sinais. Possíveis causas: (a) instrumentação dos agentes ainda não rodou; (b) features recentes não acionaram `*-run-tasks`. **Não invente candidatos lendo PRDs/specs** — tech-spec é fonte fraca (ver doutrina em `agent-spec-curate-project-rules`).
4. **Pergunte o escopo da varredura via `AskUserQuestion`**:
   - Quantos runs recentes considerar (default = 5).
   - Se restringir por path da feature (ex.: só backend, só web).

---

## Fase 1 — Coleta

Lê todos os `_run/rule-candidates.md` no escopo definido. O formato canônico é **uma seção `##` por candidato** (`## [<signal>] <tema>` + `Regra que isto sugere` + `O que ela faria (simples)` + `Evidência` + linha de metadados — ver schema em `agent-spec-workflow-rules.md`). Parseie cada seção numa lista normalizada:

```
[
  {
    feature: "cardapio-digital",
    version: "v1",
    timestamp: "2026-05-29T14:30:00Z",
    source: "agent-spec-sdd-run-tasks",
    signal: "executor_askquestion",
    tema: "Status HTTP para recurso ausente",
    regra_sugerida: "padronizar o status de 'não encontrado' (404 vs 422) nos handlers",
    explicacao: "sem a regra o executor não sabe qual status usar e para para perguntar",
    evidence: "Devo retornar 404 ou 422 em pedido inexistente? — T03 / handler de pedido"
  },
  ...
]
```

**Validações ao parsear**:
- Seção com `signal` (no título `[...]`) fora do vocabulário canônico (ver `agent-spec-workflow-rules.md`) → loga como warning e ignora. Não tenta "inferir" o sinal.
- Seção sem `Evidência` → ignora silenciosamente (a doutrina exige evidência verificável; emissor descumpriu).
- Seção sem `tema`/`regra_sugerida`/`explicacao` → ainda parseia (usa o que houver), mas anota no relatório que o emissor produziu candidato pobre (sinal para auditar o gate emissor).
- **Back-compat**: arquivos no formato antigo de **tabela** (`| timestamp | source | signal | evidence | context |`, anteriores a esta convenção) continuam parseáveis — mapeie cada linha para o objeto acima com `tema`/`regra_sugerida`/`explicacao` vazios (a curate preenche depois). Não exija o formato novo de arquivos legados.
- Timestamps malformados → assume `null` (não bloqueia mineração).

---

## Fase 2 — Agrupamento por similaridade

Agrupa registros em **clusters de candidato**. Critério de pertencer ao mesmo cluster:

| Sinal | Critério de similaridade |
|---|---|
| `executor_askquestion` | Mesma pergunta após normalizar (lowercase, sem pontuação) **OU** mesmo tema declarado pelo modelo (ex.: "status HTTP para recurso ausente"). Julgue a similaridade **semanticamente** — duas perguntas que pedem a mesma decisão são o mesmo cluster, ainda que redigidas diferente. |
| `pre_refinement_decision` | Mesma decisão normalizada **OU** mesmo tema declarado. |
| `exemplar_file_read` | Mesmo arquivo exemplar **OU** mesmo padrão estrutural (ex.: "exemplar de handler", "exemplar de service"). |
| `repeated_fixture` | Mesmo path de fixture **OU** mesma forma estrutural da fixture (entidade base). |
| `repeated_assertion_shape` | Mesmo formato de assert normalizado (placeholder dos dados, mesma ordem de campos). |
| `convention_drift` | Mesma convenção divergente (categoria + path-padrão). |
| `scope_deviation` | Mesmo tipo de desvio (ex.: "tocou config global", "alterou shared lib"). |
| `speculative_complexity` | Mesma forma de over-engineering (ex.: "interface com 1 implementação", "config-flag preventivo"). |

**Não misture sinais diferentes no mesmo cluster** — `executor_askquestion` sobre status HTTP é candidato diferente de `convention_drift` sobre status HTTP, mesmo que tematicamente relacionados (a forma da regra é diferente).

---

## Fase 3 — Filtro de repetição (gatekeeper)

Um cluster só vira candidato se:

1. **Aparece em ≥2 features DISTINTAS**. Repetição no mesmo run **não conta** (pode ser sintoma de uma única task mal-estruturada, não de convenção ausente).
2. **Tem evidência citável**: pelo menos 1 linha do cluster com `path:linha` ou ID de task referenciável.
3. **Não está coberto por rule existente**: faça um grep rápido (`.claude/rules/`, `CLAUDE.md`, e — se o host usa outra convenção — os destinos equivalentes do discovery da Fase 0, mesmo procedimento da curate) procurando termo-chave do cluster. Se já há rule, marque o cluster como **`coverage_check_failed`** e descarte (com nota).

> **Por que descartar quando já há rule**: significa que a rule existe mas o agente que emitiu o sinal **não a aplicou**. Isso é problema de matcher (rule não está carregando no escopo certo) ou de fraseado (rule não está convincente). Esse é caso para `agent-spec-curate-project-rules` no modo auditoria, não para criar regra nova.

---

## Fase 4 — Candidate cards

Para cada cluster aprovado, monte um cartão — **um tópico por candidato**, com a regra sugerida e o que ela faria em linguagem simples no topo (é o que o usuário lê primeiro):

```markdown
### [<signal>] <tema curto>

**Regra que isto sugere:** <1 linha — consolidada dos `regra_sugerida` do cluster>

**O que a regra faria (simples):** <1-2 frases em linguagem de quem não viu os runs — o erro/atrito que se repetiu e o que a regra garantiria. Consolide os `explicacao` do cluster numa frase clara.>

- **Ocorrências**: N (em M features distintas)
- **Evidências**:
  - {feature-A}/v1 — T03 — "evidence literal"
  - {feature-B}/v2 — T07 — "evidence literal"
- **Escopo sugerido (palpite)**: global / por path (`globs sugeridos`) / inline em CLAUDE.md. Se a convenção guia **produção de código** (naming, idioma, arquitetura, contrato) → anote "carregar também na geração" (a `curate` decide o eixo geração/execução).
- **Próximo passo**: `agent-spec-curate-project-rules` aplica o teste de fricção e decide a forma.
```

**Exemplo preenchido** (cluster real de 2 features):

```markdown
### [executor_askquestion] Status HTTP para recurso ausente

**Regra que isto sugere:** padronizar o status de "recurso não encontrado" (404) nos handlers.

**O que a regra faria (simples):** hoje o executor para e pergunta qual status usar em recurso inexistente; com a regra, todo handler responde 404 igual, sem interromper o run.

- **Ocorrências**: 3 (em 2 features distintas)
- **Evidências**:
  - cardapio-digital/v1 — T03 — "Devo retornar 404 ou 422 em pedido inexistente?"
  - reservas-online/v2 — T07 — "recurso não achado: 404 ou 422?"
- **Escopo sugerido (palpite)**: por path (`**/handlers/**`)
- **Próximo passo**: `agent-spec-curate-project-rules` aplica o teste de fricção e decide a forma.
```

**Regras de redação do cartão**:
- **Título** = `[<signal>] <tema>` (3-6 palavras) — cabeçalho navegável.
- **`Regra que isto sugere`** em 1 linha (substantivo + decisão, não imperativo — quem decide imperativo é `agent-spec-curate-project-rules`).
- **`O que a regra faria (simples)`** é **obrigatório** — é o que torna o card compreensível. Se o cluster veio de arquivo legado (sem `explicacao`), **autore** a frase a partir das evidências; não deixe vazio.
- Evidências literais, sem parafrasear (o que o agente emitiu).
- Escopo é **palpite** baseado nos paths dos contextos — `agent-spec-curate-project-rules` pode mover. Sinais de convenção de produção (naming, idioma, arquitetura, contrato) → marque que pode precisar carregar na **geração** (não só no código), para a curate não derivar matcher só de `src/**`.

---

## Fase 5 — Handoff para `agent-spec-curate-project-rules`

Apresente os cartões ao usuário em ordem decrescente de ocorrências e colete a decisão via **`AskUserQuestion`** (pergunta única):

- Pergunta: "Encontrei {K} candidatos a regra. Como prefere selecionar?"
- Opções (4): `Todos` / `Selecionar individualmente` / `Só os top-N` / `Salvar a lista e decidir depois`.
- Se "Selecionar individualmente": perguntas seguintes com `multiSelect: true`, em blocos de até 4 cartões.

Para os candidatos selecionados, **NÃO invoque** a curate (ela é manual — `disable-model-invocation: true`, mesma convenção registrada na `agent-spec-rule-create`). Em vez disso:

1. Salve o relatório de mineração (seção "Saída sempre persistível" abaixo) com os cartões selecionados marcados.
2. Encerre recomendando ao usuário: *"Para aplicar o teste de fricção e definir colocação, rode `/agent-spec-curate-project-rules` passando o relatório: `/agent-spec-curate-project-rules /docs/specs/.rule-mining/{YYYY-MM-DD}-mining-report.md`"*. A pergunta-âncora para a curate já vai embutida em cada cartão: "Este candidato passa no teste de fricção? Se sim, qual escopo e forma?"

**Esta skill não escreve em rules e não invoca a curate.** Toda gravação é do `agent-spec-curate-project-rules`, rodada manualmente pelo usuário.

---

## Saída sempre persistível

Salve o relatório de mineração em:

```
/docs/specs/.rule-mining/{YYYY-MM-DD}-mining-report.md
```

(`.rule-mining/` listado em `.gitignore` é OK — relatórios são efêmeros; o que importa é o que vira regra, registrado em `.claude/rules/` ou `CLAUDE.md`.)

Conteúdo do relatório:
1. Escopo da varredura (features cobertas, janela temporal).
2. Estatísticas (total de sinais, por categoria, descartados por motivo).
3. Cartões finais.
4. Decisão do usuário por cartão (aceito / recusado / parking).

---

## Limites desta skill

- **Não substitui post-mortem**: mineração olha sinais agregados; post-mortem olha um run específico em profundidade. São complementares.
- **Não infere regras de código**: leitor preguiçoso que tenta extrair regra direto do diff erra (não há prova de repetição). Use a fila de sinais — quem instrumenta sabe o que é convenção implícita.
- **Não decide colocação**: escopo (global, matcher, inline) é responsabilidade do `agent-spec-curate-project-rules`. A skill só sugere palpite.
- **Não dispara automaticamente**: `disable-model-invocation: true`. Roda só quando o usuário a invoca por slash command.

---

## Sinais de uso saudável

- A mineração **produz poucos cartões** (≤5 numa janela de 5 runs) → instrumentação está calibrada; convenções estão escritas.
- A mineração **produz muitos cartões repetidos do mesmo cluster** ao longo do tempo → o cluster não está virando regra por algum motivo (escopo errado? fraseado fraco?). Disparar `agent-spec-curate-project-rules` em modo auditoria sobre as rules adjacentes.
- A mineração **não acha arquivos** apesar de runs recentes → instrumentação dos agentes não está rodando. Auditar `*-run-tasks`, `agent-spec-qa-validator`, `agent-spec-staff-architecture-review` para conferir emissão.

---

## Resumo executivo

> Coleta passiva (durante o run) + mineração offline (esta skill) + decisão de regra (`agent-spec-curate-project-rules`). Aqui só agrupamos sinais que **se repetiram em features distintas** e empacotamos para a skill que decide. Nunca escrevemos rule diretamente. Nunca inferimos regra que não tem sinal repetido.
