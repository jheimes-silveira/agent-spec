---
title: "Apêndice E — Glossário"
description: "Termos canônicos do agent-spec."
---
# Apêndice E — Glossário

| Termo | Definição |
| --- | --- |
| **ADR** | Architecture Decision Record. Registro permanente de uma decisão arquitetural do projeto. Ver Parte VII. |
| **APROVADO\_COM\_OBSERVACOES** | Veredito do Gate 1 quando há só médios/baixos: aprova e anota dívida, sem disparar loop. |
| **`base_sha`** | SHA do Git capturado antes de a task começar; permite ao Gate 2 gerar o diff via `git diff <base_sha>`. |
| **CA** | Critério de Aceitação. Condição objetiva e verificável que torna uma US "pronta". |
| **critical path** | Path cuja semântica indica área sensível (auth, security, crypto, migrations, secrets, api\_contracts, payments). Dispara escalação para Opus. |
| **CT** | Caso de Teste. Teste que prova um CA. |
| **`code_review_only`** | Categoria de problema que não muda comportamento; no loop, permite pular o re-QA. |
| **débito-controlado** | Política central: crítico/alto reprova; médio/baixo vira dívida anotada. Ver Parte V. |
| **executor** | Agente da stack que implementa uma task na FASE 2 da pipeline. |
| **fast-path** | Inferência/declaração de gates reduzidos (ex.: `[qa]`) para tasks de baixo risco. |
| **Gate 1** | `agent-spec-qa-validator`. Olho funcional; 8 camadas; único que executa a suíte de testes. |
| **Gate 2** | `agent-spec-staff-architecture-review`. Olho arquitetural; opera sobre o diff git. |
| **Iron Laws** | As 6 leis invioláveis de testes da doutrina `agent-spec-testing-best-practices` (expor defeitos, uma razão de falha, camada mais baixa, fronteira real, corrija o SUT, nenhum código test-only em produção — a #6 é a Lei do seam). Não confundir com as 6 **Iron Rules** da Disciplina do Executor. |
| **memória inline** | `base_sha` + sumário do executor, passados no prompt dos gates; não persistem em disco. |
| **memória lazy** | `tasks/.tmp/T{N}.md`, criada só em rejeição; apagada quando os gates aplicáveis aprovam. |
| **miniSpec** | Caminho para features de 1–3 user stories. |
| **mock budget** | Iron Law: mockar todos os colaboradores exige um teste de integração companheiro. |
| **caminho de sucesso (happy path)** | Cenário em que tudo dá certo — sem erros, sem dados ruins. Em testes, o oposto do cenário negativo. |
| **divergência (drift)** | Cópias do mesmo conhecimento que evoluem em separado e param de concordar (ex.: skill que duplicou um template e foi modificada sem atualizar o original). |
| **efeito colateral** | Mudança de estado externo ao retorno da função: gravar em disco, escrever no banco, publicar evento, alterar variável global. |
| **fast-path (atalho)** | Inferência/declaração de gates reduzidos (ex.: `[qa]`) para tasks de baixo risco. |
| **fallback** | Caminho alternativo automático que entra quando o caminho preferido falha (ex.: paralelismo cai para sequencial se algum guard falhar). |
| **fixo no código (hardcoded)** | Valor escrito direto no código-fonte em vez de vir de config/parâmetro. Antônimo de "configurável". |
| **fonte única de verdade (single source of truth)** | Um único lugar canônico de onde a informação vem; cópias são derivadas dela, nunca paralelas. |
| **spike** | Experimento curto e descartável, geralmente para aprender uma tecnologia ou explorar uma abordagem. Não vai para produção sem reescrita. |
| **tempo real (wall clock)** | Tempo cronológico percorrido — em oposição a tempo de CPU. Inclui esperas, I/O e bloqueios. |
| **trade-off** | Escolha entre opções com prós e contras diferentes; ganhar em uma dimensão custa em outra. |
| **fluxo de trabalho (workflow)** | Sequência ordenada de etapas que produz um resultado — neste framework, refere-se ao caminho desde a ideia até o `git add`. |
| **marcador (placeholder)** | Texto que indica que algo será preenchido depois; geralmente em templates onde o autor humano decide o conteúdo final. |
| **onboarding** | Capacitação inicial de uma pessoa nova no time/projeto/framework. |
| **subconjunto (subset)** | Parte selecionada de um conjunto maior — ex.: filtrar ADRs por tag. |
| **`qa-observations.md`** | Diário de bordo versionado da execução; fonte do `/agent-spec-debt-resolution`. |
| **`.qa_context.md`** | Resumo denso do tech spec para os gates; reduz tokens de descoberta em 5–10x. |
| **`revalidation_required`** | Categoria de problema que muda comportamento; no loop, força re-QA. |
| **SDD** | Spec-Driven Development. Caminho mais completo, para features complexas (≥ 4 US). |
| **Strategy Selector** | Rubric de 8 sinais da `/agent-spec-pre-refinement` que recomenda o caminho. |
| **TaskCard** | Caminho para uma mudança pontual e isolada (1 task). |
| **US** | User Story. A necessidade na voz de quem precisa. |
| **variant** | `web` / `mobile` / `backend`. Muda templates/checklists, **não** o path. |
