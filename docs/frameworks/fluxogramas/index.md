---
id: "fluxogramas"
title: "Fluxogramas — Visão Geral"
---
# Fluxogramas dos Frameworks

Diagramas completos do ecossistema de cada framework de execução — do discovery ao pós-execução, incluindo os fluxos alternativos (reprovações nos gates, loops de correção, bloqueio por tentativas e débito técnico).

::: tip 💡 Dica
\*\*Clique em qualquer diagrama para abrir em tela cheia\*\* (lightbox com zoom). Pressione `Esc` ou clique fora para fechar. Use o scroll para navegar pelo diagrama ampliado.
:::

| Framework | Fluxograma | Quando usar |
| --- | --- | --- |
| **SDD** | [Ver fluxograma](/frameworks/fluxogramas/sdd.html) | Feature grande (4+ US, múltiplas personas, decisão arquitetural nova) |
| **miniSpec** | [Ver fluxograma](/frameworks/fluxogramas/minispec.html) | Feature média (1-3 US, módulo existente) |
| **TaskCard** | [Ver fluxograma](/frameworks/fluxogramas/taskcard.html) | Entrega atômica com escopo técnico já definido (ou CRUD Fast-Path) |

## Como ler os diagramas

Todos os fluxogramas seguem a mesma convenção visual:

| Elemento | Significado |
| --- | --- |
| 🟪 **Retângulo índigo sólido** | Skill/fase do pipeline principal |
| ◽ **Retângulo lavanda tracejado** | Skill **opcional** ou subagente delegado |
| 🟨 **Hexágono amarelo** | Gate de validação (Gate 1 — QA Validator, Gate 2 — Tech Review) |
| 🔶 **Losango amarelo** | Decisão do orquestrador (gates da task, `requires_qa_revalidation`, mais tasks?) |
| 🟥 **Retângulo vermelho** | Loop de correção ou task bloqueada |
| 🔴 **Arestas vermelhas** | Caminho de **reprovação** (`❌ REJEITADO` / `❌ REJECTED / PARTIAL`) |
| 🌸 **Cilindro rosa** | Artefato de run (`qa-observations.md`, `rule-candidates.md`) |
| 🟩 **Cápsula verde** | Conclusão (✅ + `/agent-spec-semantic-commit`) |
| ➡️ **Arestas grossas** | Espinha do fluxo principal (happy path) |
| ⤍ **Arestas pontilhadas** | Caminhos opcionais ou anotações de débito/sinais |

## Estrutura comum (camadas, de cima para baixo)

1. **Discovery (opcional)** — `/agent-spec-pre-refinement` recomenda o framework pela complexidade.
2. **Especificação/Geração** — artefatos de spec do framework + delegação ao `agent-spec-qa-test-generator`.
3. **Apoio transversal** — Framework ADR (conformidade validada no Gate 2) e `/agent-spec-testing-stack-bootstrap` (pré-requisito do Gate 1).
4. **Execução** — orquestrador, executor da stack, Gate 1 (QA), Gate 2 (Tech Review), loops de correção com limite de 3 tentativas.
5. **Braços pós-execução (opcionais)** — `debt-resolution`, `mine-rule-candidates` → `curate-project-rules`, `backend-contract-handoff`, `/post-mortem` e `docs-sync`.

::: info 📝 Nota
O \*\*pipeline de qualidade é idêntico nos três frameworks\*\* — mesmos gates, mesma política débito-controlado (críticos/altos bloqueiam; médios/baixos viram débito anotado), mesmo algoritmo `requires\_qa\_revalidation` e mesmo limite de 3 tentativas. O que muda é a camada de especificação (quanta cerimônia antes das tasks) e o modo de execução (lotes paralelos no SDD/miniSpec vs. 1 card por vez no TaskCard).
:::

## 📚 Aprofundamento na Referência

* [Frameworks — Visão Geral](/frameworks/overview.html)
* [Pipeline — Visão Geral](/pipeline/overview.html)
* [SDD](/frameworks/sdd.html) · [miniSpec](/frameworks/minispec.html) · [TaskCard](/frameworks/taskcard.html)
