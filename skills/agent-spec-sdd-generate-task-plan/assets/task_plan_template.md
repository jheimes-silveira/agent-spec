# TASK PLAN – Plano de Execução das Tasks

## 1. Identificação
- **Feature/Projeto**:
- **Responsável (Tech Lead)**:
- **Data**:
- **Status**: Rascunho | Em Execução | Concluído  <!-- enum canônico do plano. Por task (tabela da seção 4): A Fazer | Em Progresso | Bloqueado | Concluído. -->
- **TECH_SPEC**: `docs/specs/features/<nome-feature>/<versao>/tech_spec.md` (path real vem de `sdd.tech_spec.path` no config)
- **PRD**: `docs/<nome-feature>/prd.md`

---

## 2. Objetivo do Task Plan
Breve resumo do objetivo geral da feature e o que será entregue ao final das tasks.

---

## 3. Macro-Fases (alto nível)
- **Fase 1 – Preparação / Fundamentos**
  - Objetivo:
  - Tasks: T1, T2
- **Fase 2 – Implementação Principal**
  - Objetivo:
  - Tasks: T3, T4, T5
- **Fase 3 – Integrações / Ajustes**
  - Objetivo:
  - Tasks: T6, T7
- **Fase 4 – Testes / Validação**
  - Objetivo:
  - Tasks: T8, T9
- **Fase 5 – Finalização / Entrega**
  - Objetivo:
  - Tasks: T10

---

## 4. Lista de Tasks (visão macro)

<!-- LLM-ONLY: A coluna "Pode Rodar em Paralelo?" é DERIVADA, nunca autorada por intuição. Calcule-a a partir do grafo de Dependências + Símbolos criados/consumidos de cada TN.md, aplicando o "Invariante de Paralelismo" de .claude/rules/agent-spec-workflow-rules.md (Regra 10d). Default na incerteza: Não. A fonte única das dependências é a seção 1 de cada tasks/TN.md. -->

| ID  | Nome da Task | Arquivo           | Fase | Dependências | Pode Rodar em Paralelo? (derivado) | Status  |
| --- | ------------ | ----------------- | ---- | ------------ | ---------------------------------- | ------- |
| T1  |              | [T1](tasks/T1.md) |      |              | Sim/Não                            | A Fazer |
| T2  |              | [T2](tasks/T2.md) |      |              | Sim/Não                            | A Fazer |

### 4.1 Ordem de Execução (grafo)

<!-- LLM-ONLY: Grafo ASCII da ordem topológica derivada da coluna "Dependências" acima. Registra APENAS a
  topologia — o flag "Pode Rodar em Paralelo?" é o da tabela da seção 4 (fonte única); não o repita aqui. -->

```
T1 -> T2 -> T3
T1 -> T4
```

---

## 5. Rastreabilidade: User Stories → Tasks

| User Story (PRD) | Definição Técnica (SPEC) | Tasks Relacionadas | Status |
| ---------------- | ------------------------ | ------------------ | ------ |
| US-01            |                          | T1, T2             |        |
| US-02            |                          | T3, T4             |        |

<!-- LLM-ONLY: Esta tabela garante que TODAS as user stories do PRD tem tasks correspondentes para implementacao. -->

---

## 6. Dependências Gerais
Liste dependências entre tasks, externas, bloqueios e pré-requisitos do time.

---

## 7. Critérios de Conclusão da Feature
A feature será considerada concluída quando:
- [ ] Todas as tasks estiverem completas
- [ ] Testes validados
- [ ] Critérios técnicos do SPEC atendidos
- [ ] Nenhum comportamento divergente do PRD
- [ ] Todas as User Stories cobertas (tabela seção 5)
- [ ] Deploy aprovado

---

## 8. Riscos & Mitigações
- Risco 1 → Mitigação
- Risco 2 → Mitigação

---

## 9. Checklist Final
- [ ] Task Plan completo
- [ ] Tasks mapeadas
- [ ] Dependências validadas
- [ ] Rastreabilidade User Stories → Tasks preenchida
- [ ] Pronto para execução paralela
