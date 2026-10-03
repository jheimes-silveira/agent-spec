---
id: "fluxograma-taskcard"
title: "Fluxograma — TaskCard"
---
# Fluxograma — TaskCard

`TaskCard`

Ecossistema completo do [TaskCard](/frameworks/taskcard.html): discovery, geração (standard e CRUD Fast-Path), apoio transversal (ADRs, testing-stack), execução de **um card por vez** com os dois gates e braços pós-execução.

::: tip 💡 Dica
\*\*Clique no diagrama para abrir em tela cheia.\*\* O caminho de \*\*reprovação\*\* está em \*\*vermelho\*\* — siga-o a partir de qualquer gate. Veja a [legenda completa](/frameworks/fluxogramas/).
:::
```mermaid
%%{init: {"flowchart": {"curve": "basis", "nodeSpacing": 60, "rankSpacing": 80}}}%%
flowchart TB
inicio(["💡 Entrega atômica /  
escopo técnico já definido"])
subgraph disc["Fase 0 — Discovery (opcional)"]
direction TB
preref["/agent-spec-pre-refinement  
Brainstorm ToT de PRODUTO  
→ pre-refinement.md"]
complex{"Complexidade?"}
msbr["miniSpec  
(outro braço)"]
sddbr["SDD  
(outro braço)"]
preref -->|"recomenda framework"| complex
complex -.->|"média"| msbr
complex -.->|"alta"| sddbr
end
inicio --> preref
complex ==>|"baixa"| gen
subgraph spec["Geração — /agent-spec-taskcard-generate"]
direction TB
gen["FASE 0.-1: pergunta a frente  
(web | mobile | backend)"]
modo{"FASE 0.0: modo?"}
std["Standard  
perguntas 1 por vez +  
Gate Anti-Agregação  
(≥3 contratos + handler →  
quebrar em 2+ cards)"]
crud["CRUD Fast-Path  
template enxuto · 2 perguntas  
(entidade + endpoints)  
gates: [qa]"]
analise["FASE 1: inventário de ADRs  
aplicáveis (§11) + exploração  
de codebase e padrões"]
heur["FASE 3-5: heurística  
model / risk / gates +  
versionamento inteligente  
→ task-(nn)-(slug).md (§1-9, §11)"]
tg["agent-spec-qa-test-generator  
standard: 1 agente/card ·  
batch: 1 agente/domínio ·  
CRUD: 1 agente p/ feature  
→ test-cases.json"]
secao10["FASE 7: formata §10 lossless  
(10.2.1: 1 card por CT — invariant,  
owning\_layer, negative\_companion,  
seam) · 10.6 rastreabilidade §9→testes"]
multi{"≥ 2 TaskCards?"}
tplan["FASE 8: task\_plan.md  
(Ordem/ID/Deps/Status +  
DAG de símbolos)"]
gen ==> modo
modo ==>|"standard"| std
modo -.->|"--mode=crud-fastpath"| crud
std ==> analise
crud -.-> analise
analise ==> heur
heur ==>|"delega testes"| tg
tg ==> secao10
secao10 ==> multi
multi -.->|"sim"| tplan
end
subgraph apoio["Apoio transversal"]
direction TB
adr["Framework ADR  
/adr-bootstrap · create · review  
supersede · deprecate · list · show"]
tstack["/agent-spec-testing-stack-bootstrap  
prepara infra de testes  
+ doutrina testing-best-practices"]
end
analise -.->|"consulta ADRs ativas ·  
guardrails referenciam ADRs (§6)"| adr
multi ==>|"não"| prep
tplan -.-> prep
subgraph run["Execução — /agent-spec-taskcard-run (1 card por vez — NUNCA paraleliza)"]
direction TB
prep["Passo 1: git check · base\_sha ·  
cleanup >24h · resume pós-interrupção ·  
valida deps (dep Bloqueado →  
usuário decide) · Status: Em Progresso"]
executor["Passo 2: Executor da stack  
(model: sonnet | opus se  
critical path / risk high)  
+ executor-discipline verbatim"]
aceite{"Passo 3: §9 Aceite  
Técnico coberto?"}
gatesdec{"gates do frontmatter  
(declarado ou inferido)"}
gate1{{"Gate 1 — agent-spec-qa-validator  
critérios de aceitação +  
EXECUTA testes da §10"}}
corrExec["Correção do executor  
(memória lazy tasks/.tmp/TC-id.md)  
sempre re-QA"]
gate2{{"Gate 2 — agent-spec-staff-  
architecture-review  
arquitetura, ADRs,  
segurança (recebe DIFF)"}}
reval{"requires\_qa\_revalidation?"}
corrTR["Correção  
(só code-review)  
→ direto novo Tech Review"]
corrQA["Correção  
(lógica mudou)  
→ volta ao QA"]
blocked["Card Bloqueado  
3 tentativas esgotadas  
(AskUserQuestion: como proceder?)"]
fecha["FECHAMENTO POR GATES APLICÁVEIS  
git add real · Status: Concluído ·  
atualiza task\_plan · NÃO commita"]
qaobs[("qa-observations.md  
débitos médios/baixos +  
decisões de pipeline")]
rulec[("rule-candidates.md  
sinais de convenção")]
prep ==> executor
executor ==> aceite
aceite -->|"falta CA — relança"| executor
aceite ==>|"ok (git add -N)"| gatesdec
gatesdec ==>|"[qa] | [qa, tech\_review]"| gate1
gatesdec -.->|"none (docs/config)"| fecha
gate1 ==>|"✅ aprovado"| gate2
gate1 -.->|"✅ aprovado + gates=[qa]"| fecha
gate1 -->|"❌ REJEITADO  
(críticos/altos)"| corrExec
corrExec -->|"re-QA (tentativa N/3)"| gate1
corrExec -.->|"3 tentativas"| blocked
gate2 ==>|"✅ aprovado"| fecha
gate2 -->|"❌ REJECTED / PARTIAL  
(critical/high)"| reval
reval -->|"false — só code-review"| corrTR
reval -->|"true — lógica mudou"| corrQA
corrTR -->|"novo Tech Review"| gate2
corrQA -->|"re-QA completo"| gate1
reval -.->|"3 tentativas"| blocked
gate1 -.->|"débito + sinais"| qaobs
gate2 -.->|"débito + sinais"| qaobs
gate1 -.-> rulec
gate2 -.-> rulec
end
adr -.->|"conformidade validada  
pelo Gate 2"| gate2
tstack -.->|"pré-requisito do Gate 1"| gate1
concluido(["✅ Card concluído  
(relatório final do run)  
/agent-spec-semantic-commit"])
fecha ==> concluido
subgraph pos["Braços pós-execução (opcionais)"]
direction TB
debtres["/agent-spec-debt-resolution  
lê qa-observations →  
v(N+1)-debits/  
→ executa via minispec-run-tasks"]
mine["/agent-spec-mine-rule-candidates  
consolida sinais cross-run"]
curate["/agent-spec-curate-project-rules  
teste de fricção + colocação  
→ /agent-spec-rule-create"]
handoff["/agent-spec-backend-contract-handoff  
→ handoff-frontend.md  
(backend → frontend)"]
pmortem["/post-mortem + /run-context  
diagnóstico do run"]
docssync["/agent-spec-docs-sync  
auditoria código ↔ docs do site"]
mine --> curate
end
concluido -.->|"débitos anotados"| debtres
concluido -.->|"sinais do run"| mine
concluido -.->|"variante backend"| handoff
concluido -.->|"diagnóstico"| pmortem
concluido -.->|"pós-release"| docssync
linkStyle 26,27,28,30,31,32,33,34,35 stroke:#dc2626,stroke-width:2.5px
classDef phase fill:#6366f1,color:#fff,stroke:#4338ca
classDef opt fill:#e0e7ff,color:#312e81,stroke:#6366f1,stroke-dasharray:4 4
classDef dec fill:#e0e7ff,color:#312e81,stroke:#a5b4fc
classDef gate fill:#fbbf24,color:#000,stroke:#d97706
classDef reject fill:#ef4444,color:#fff,stroke:#b91c1c
classDef debt fill:#ec4899,color:#fff,stroke:#be185d
classDef done fill:#22c55e,color:#fff,stroke:#15803d
classDef start fill:#ede9fe,color:#312e81,stroke:#a78bfa
class inicio start
class gen,std,crud,analise,heur,secao10,tplan,prep,executor,fecha phase
class preref,msbr,sddbr,tg,adr,tstack,mine,curate,handoff,pmortem,docssync opt
class complex dec
class gate1,gate2,modo,multi,aceite,gatesdec,reval gate
class corrTR,corrQA,corrExec,blocked reject
class qaobs,rulec,debtres debt
class concluido done
```

## Fluxo principal (happy path)

1. **Discovery** (opcional): `/agent-spec-pre-refinement` recomenda TaskCard quando a complexidade é baixa.
2. **Geração**: pergunta a frente → modo (standard ou **CRUD Fast-Path**) → inventário de ADRs → heurística `model`/`risk`/`gates` → card salvo → `agent-spec-qa-test-generator` (standard, batch ou CRUD) → §10 formatada lossless → `task_plan.md` se ≥2 cards.
3. **Execução** (1 card por vez): preparação → executor → validação do Aceite Técnico (§9) → Gate 1 (QA) → Gate 2 (Tech Review) → **fechamento por gates aplicáveis**.
4. **Conclusão**: `git add` real, `Status: Concluído`, **não commita** → `/agent-spec-semantic-commit`.

## Fluxos alternativos (caminho vermelho)

* **Aceite Técnico incompleto** (§9) → executor relançado com apontamento antes mesmo dos gates.
* **Gate 1 rejeita** (críticos/altos) → Correção com memória lazy `TC-{id}.md` → re-QA (máx 3 tentativas).
* **Gate 2 rejeita** → `requires_qa_revalidation?` decide: re-QA completo ou direto a novo Tech Review.
* **3 tentativas esgotadas** → Card Bloqueado + `AskUserQuestion` para o usuário decidir.
* **Débito médio/baixo** → `qa-observations.md` → `/agent-spec-debt-resolution`.

::: danger 🚫 Regra
\*\*Fechamento por gates aplicáveis\*\*: o card só fecha quando \*\*todos os gates declarados no frontmatter\*\* aprovam — `gates: none` fecha após o executor, `gates: [qa]` fecha após o QA, `gates: [qa, tech\_review]` exige os dois. O TaskCard \*\*nunca paraleliza\*\* — é por definição 1 card por vez.
:::

## 📚 Aprofundamento na Referência

* [TaskCard — Referência completa](/frameworks/taskcard.html)
* [Pipeline — Visão Geral](/pipeline/overview.html)
* [Legenda dos fluxogramas](/frameworks/fluxogramas/)
