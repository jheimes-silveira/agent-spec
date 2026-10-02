# TASK PLAN – MiniStack

## 1. Identificação
- **Feature**:
- **Intent**: `[caminho-feature]/intent.md`
- **Scope**: `[caminho-feature]/scope.md`
- **Responsável**:
- **Data**:
- **Status**: Rascunho | Em Andamento | Concluído

---

## 2. Objetivo Técnico
O que será entregue tecnicamente ao final de todas as tasks.

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

---

## 4. Lista de Tasks (visão macro)

<!-- LLM-ONLY: A coluna "Pode Rodar em Paralelo?" é DERIVADA, nunca autorada por intuição, e esta é a sua
  ÚNICA fonte no documento. Calcule-a a partir do grafo de Dependências + Símbolos criados/consumidos de
  cada TN.md, aplicando o "Invariante de Paralelismo" de .claude/rules/agent-spec-workflow-rules.md (Regra
  10d). Default na incerteza: Não. A fonte única das dependências é a seção 1 de cada tasks/TN.md. -->

| ID | Nome da Task | Arquivo | Fase | Dependências | Pode Rodar em Paralelo? (derivado) | Status |
|----|-------------|---------|------|-------------|------------------------------------|--------|
| T1 |             | [T1](tasks/T1.md) | | — | Sim | A Fazer |
| T2 |             | [T2](tasks/T2.md) | | T1 | Não | A Fazer |

---

## 5. Ordem de Execução

```
T1 -> T2 -> T3
      -> T4 (paralelo)
```

### Grafo de Dependências
<!-- LLM-ONLY: Este grafo registra APENAS a topologia (Task → Depende de). O flag "Pode Rodar em Paralelo?"
  NÃO é repetido aqui — sua fonte única é a seção 4 (evita duas cópias derivadas divergirem). Em caso de
  divergência entre este grafo e a seção 1 do TN.md, o executor reconcilia pela UNIÃO das dependências
  (mais conservador). -->
| Task | Depende de | Status |
|------|------------|--------|
| T1 | — | A Fazer |
| T2 | T1 | A Fazer |

---

## 6. Arquivos / Áreas Impactadas (visão consolidada)

| Área | Arquivos | Ação |
|------|----------|------|
| `[camada]/...` | [arquivo] | criar |
| `[camada]/...` | [arquivo] | modificar |

> **Legenda de Ações:** `criar` | `modificar` | `remover`

---

## 7. Critérios de Conclusão Geral
- [ ] Todas as tasks concluídas
- [ ] Objetivo técnico atingido
- [ ] Código compila sem erros
- [ ] Testes unitários passando
- [ ] Testes de integração passando (se aplicável)
- [ ] Testes e2e passando (se aplicável)

---

## 8. Notas para a LLM Executora
- Instruções especiais de implementação
- Padrões a seguir
- Convenções do projeto
