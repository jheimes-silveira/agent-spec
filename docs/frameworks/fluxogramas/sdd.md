---
id: "fluxograma-sdd"
title: "Fluxograma — SDD"
---
# Fluxograma — SDD

`SDD`

Ecossistema completo do [SDD](/frameworks/sdd.html): discovery, especificação (PRD → Tech Spec → Task Plan), apoio transversal (ADRs, testing-stack), execução orquestrada com os dois gates e braços pós-execução.

::: tip 💡 Dica
\*\*Clique no diagrama para abrir em tela cheia.\*\* O caminho de \*\*reprovação\*\* está em \*\*vermelho\*\* — siga-o a partir de qualquer gate. Veja a [legenda completa](/frameworks/fluxogramas/).
:::
```mermaid
%%{init: {"flowchart": {"curve": "basis", "nodeSpacing": 60, "rankSpacing": 80}}}%%
flowchart TB
inicio(["💡 Ideia / Feature"])
subgraph disc["Fase 0 — Discovery (opcional)"]
direction TB
preref["/agent-spec-pre-refinement  
Brainstorm ToT de PRODUTO  
→ pre-refinement.md"]
complex{"Complexidade?"}
tcbr["TaskCard  
(outro braço)"]
msbr["miniSpec  
(outro braço)"]
preref -->|"recomenda framework"| complex
complex -.->|"baixa"| tcbr
complex -.->|"média"| msbr
end
inicio --> preref
complex ==>|"alta"| prd
subgraph spec["Especificação SDD"]
direction TB
prd["/agent-spec-sdd-generate-prd  
→ prd.md + sdd\_state.yaml"]
talign["/agent-spec-generate-tech-alignment  
(opcional) Arquiteto de Soluções  
→ tech-alignment.md"]
dsboot["/agent-spec-design-system-bootstrap  
(opcional, standalone)  
→ design-system.md global"]
design["/agent-spec-generate-design  
(opcional — só web/mobile)  
→ design.md"]
techspec["/agent-spec-sdd-generate-tech-spec  
variante web | mobile | backend  
→ tech\_spec.md"]
tg1["agent-spec-qa-test-generator  
Estratégia de Testes  
→ test-cases.json"]
challenge["/agent-spec-challenge-spec  
(opcional) stress-test vs código,  
ADRs e glossário · edita inline"]
gloss[("domain-glossary.md  
global + feature")]
taskplan["/agent-spec-sdd-generate-task-plan  
→ task\_plan.md + tasks/T(n).md  
(anti-fragmentação, fases, DAG,  
paralelismo DERIVADO)"]
tg2["agent-spec-qa-test-generator  
Seção 6 de cada task"]
prd ==> techspec
prd -.->|"opcional"| talign
talign -.-> techspec
dsboot -.->|"alimenta"| design
prd -.->|"frente web/mobile"| design
design -.->|"referenciado por"| techspec
techspec -.->|"delega testes"| tg1
techspec ==> taskplan
techspec -.->|"opcional"| challenge
challenge -.-> taskplan
challenge -.->|"canoniza termos"| gloss
taskplan -.->|"Seção 6"| tg2
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
challenge -.->|"sugere ADRs"| adr
taskplan ==> fase0
subgraph run["Execução — /agent-spec-sdd-run-tasks (orquestrador)"]
direction TB
fase0["Fase 0: carrega pre-refinement,  
reconcilia deps, monta lotes  
paralelos (MAX\_PARALLEL=4)"]
executor["Executor da stack  
(model: sonnet | opus se  
critical path / risk high)  
+ executor-discipline verbatim"]
gatesdec{"gates da task  
(declarado ou inferido)"}
gate1{{"Gate 1 — agent-spec-qa-validator  
critérios de aceitação +  
EXECUTA testes"}}
corrExec["Correção do executor  
(memória lazy tasks/.tmp/)  
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
blocked["Task Bloqueada  
3 tentativas esgotadas  
(run continua)"]
stage["git add determinístico  
(ordem por ID da task)  
Status: Concluído"]
qaobs[("qa-observations.md  
débitos médios/baixos +  
decisões de pipeline")]
rulec[("rule-candidates.md  
sinais de convenção")]
mais{"mais tasks?"}
fase0 ==> executor
executor ==> gatesdec
gatesdec ==>|"[qa] | [qa, tech\_review]"| gate1
gatesdec -.->|"none (docs/config)"| stage
gate1 ==>|"✅ aprovado"| gate2
gate1 -.->|"✅ aprovado + gates=[qa]"| stage
gate1 -->|"❌ REJEITADO  
(críticos/altos)"| corrExec
corrExec -->|"re-QA (tentativa N/3)"| gate1
corrExec -.->|"3 tentativas"| blocked
gate2 ==>|"✅ aprovado"| stage
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
stage ==> mais
mais -->|"sim"| executor
end
adr -.->|"conformidade validada  
pelo Gate 2"| gate2
tstack -.->|"pré-requisito do Gate 1"| gate1
concluido(["✅ Feature concluída  
/agent-spec-semantic-commit"])
mais ==>|"não"| concluido
subgraph pos["Braços pós-execução (opcionais)"]
direction TB
debtres["/agent-spec-debt-resolution  
lê qa-observations →  
v(N+1)-debits/ (intent+scope+tasks)  
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
linkStyle 25,26,27,29,30,31,32,33,34 stroke:#dc2626,stroke-width:2.5px
classDef phase fill:#6366f1,color:#fff,stroke:#4338ca
classDef opt fill:#e0e7ff,color:#312e81,stroke:#6366f1,stroke-dasharray:4 4
classDef dec fill:#e0e7ff,color:#312e81,stroke:#a5b4fc
classDef gate fill:#fbbf24,color:#000,stroke:#d97706
classDef reject fill:#ef4444,color:#fff,stroke:#b91c1c
classDef debt fill:#ec4899,color:#fff,stroke:#be185d
classDef done fill:#22c55e,color:#fff,stroke:#15803d
classDef start fill:#ede9fe,color:#312e81,stroke:#a78bfa
class inicio start
class prd,techspec,taskplan,fase0,executor,stage phase
class preref,tcbr,msbr,talign,dsboot,design,tg1,tg2,challenge,adr,tstack,mine,curate,handoff,pmortem,docssync opt
class complex,gloss dec
class gate1,gate2,gatesdec,reval,mais gate
class corrTR,corrQA,corrExec,blocked reject
class qaobs,rulec,debtres debt
class concluido done
```

## Fluxo principal (happy path)

1. **Discovery** (opcional): `/agent-spec-pre-refinement` recomenda SDD quando a complexidade é alta.
2. **PRD** → **Tech Spec** (variante web/mobile/backend, delega casos de teste ao `agent-spec-qa-test-generator`) → **Task Plan** (tasks com frontmatter `model`/`risk`/`gates` e paralelismo derivado).
3. **Execução**: para cada task, executor → Gate 1 (QA, único que executa testes) → Gate 2 (Tech Review) → `git add` determinístico.
4. **Conclusão**: todas as tasks aprovadas → `/agent-spec-semantic-commit` → braços pós-execução opcionais.

## Fluxos alternativos (caminho vermelho)

::: warning ⚠️ Armadilha comum
A reprovação do \*\*Gate 1\*\* sempre re-passa pelo QA. Já a reprovação do \*\*Gate 2\*\* passa pelo algoritmo `requires\_qa\_revalidation`: se todos os bloqueantes forem só de code-review (`code\_quality`, `project\_pattern`, `best\_practices`), a correção \*\*pula o QA\*\* e vai direto a um novo Tech Review.
:::

* **Gate 1 rejeita** (críticos/altos) → Correção do executor com memória lazy → re-QA (máx 3 tentativas totais).
* **Gate 2 rejeita** (`rejected`/`partial`) → `requires_qa_revalidation?` decide o retorno: re-QA completo ou direto a novo Tech Review.
* **3 tentativas esgotadas** → Task Bloqueada (dependentes bloqueadas; run continua nas demais).
* **Débito médio/baixo** → anotado em `qa-observations.md` → resolvido depois via `/agent-spec-debt-resolution`.

## 📚 Aprofundamento na Referência

* [SDD — Referência completa](/frameworks/sdd.html)
* [Pipeline — Visão Geral](/pipeline/overview.html)
* [Legenda dos fluxogramas](/frameworks/fluxogramas/)
