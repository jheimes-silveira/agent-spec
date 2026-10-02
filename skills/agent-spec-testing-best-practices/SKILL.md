---
name: agent-spec-testing-best-practices
description: |
  Doutrina de testes agnóstica de stack (backend/frontend/mobile) — Iron Laws,
  padrões positivos, antipadrões, gates obrigatórios para agentes que escrevem
  testes, disciplina de flaky/CI. Use SEMPRE que for gerar casos de teste
  (agent-spec-qa-test-generator) ou revisar/executar testes (agent-spec-qa-validator).
when_to_use: |
  - Gerar casos de teste para a Estratégia de Testes do TECH_SPEC, T{N}.md §6, TaskCard §10
    (agent-spec-qa-test-generator).
  - Validar implementação de testes em Gate 1 do pipeline (agent-spec-qa-validator).
  - Auditar suíte existente com suspeita de fragilidade ou flakiness.
  - Decidir placement de um teste novo (unit, integration, route, e2e).
do_not_invoke_for: |
  - Revisão geral de código (use agent-spec-staff-architecture-review / Gate 2).
  - Debug de biblioteca de terceiros.
  - Design de pipeline CI fora de testes.
  - Observabilidade em produção.
---

# agent-spec-testing-best-practices

> Doutrina compacta. Conteúdo profundo está em `references/` — consulte conforme a tarefa.
>
> **Termos canônicos em inglês** (Invariant, OWNING_LAYER, snapshot, flaky, mock budget, etc.) — convenção do projeto: termos técnicos não traduzem, comentários e prosa sim.

---

## Iron Laws

Seis leis. Em conflito, vence a de **número menor**.

1. **Testes existem para expor defeitos**, não para manter CI verde. Teste que não pode falhar é decorativo.
2. **Um teste falha por exatamente uma razão**: a violação de uma invariante explicitada. Falha vaga = teste mal escrito.
3. **Coloque o teste na camada mais baixa** que ainda detecta a falha. Subir é dívida; descer é eficiência.
4. **Sistemas reais portam o merge final**. Mocks isolam; não validam. Sem ao menos um teste atravessando fronteira real, a invariante não está validada.
5. **Falha = corrija o SUT, não o teste**. Editar o teste para ficar verde exige justificativa escrita (`SUT_IS_CORRECT_BECAUSE:`).
6. **Nenhum código test-only vaza em produção**: branches, flags ou métodos criados só para teste reprovam.

---

## Roteador de Leitura Obrigatória

Antes de produzir output, leia o reference apropriado.

| Tarefa | Reference obrigatório |
|---|---|
| Decidir placement (unit/integration/e2e) | [references/fundamentos.md](references/fundamentos.md) |
| Escrever um teste novo | [references/padroes.md](references/padroes.md) + [references/ai-escreve-testes.md](references/ai-escreve-testes.md) |
| Revisar testes existentes | [references/antipadroes.md](references/antipadroes.md) |
| Gerar casos de teste para spec/task | [references/ai-escreve-testes.md](references/ai-escreve-testes.md) |
| Debug de flaky / CI vermelho | [references/ci-flakiness.md](references/ci-flakiness.md) |
| Atribuição/bibliografia | [references/fontes.md](references/fontes.md) |

A documentação inline desta SKILL.md é apenas gatilho. O contrato real está nas references.

---

## Decida antes da primeira linha

Antes de abrir o arquivo de teste:

1. **Nomeie a invariante** em uma frase. "Quando X, o sistema deve garantir Y."
2. **Escolha o OWNING_LAYER**: a camada mais baixa que falharia se a invariante quebrasse.
   - `unit` — função pura, lógica de negócio sem I/O.
   - `service-integration` — orquestração de colaboradores reais (DB efêmero, fila in-memory).
   - `route-integration` — handler HTTP atravessando middleware + DB real.
   - `e2e` — fluxo completo do usuário através da UI ou cliente externo.
3. **Rejeite o teste** se `likelihood × blast-radius` for baixo. Cobertura não é objetivo; detecção é.

Detalhe completo em [references/fundamentos.md](references/fundamentos.md).

---

## Catálogo de padrões (14)

Padrões que sobrevivem a refactor. Aplicação em [references/padroes.md](references/padroes.md).

1. **Query by role / semantic locator** — selecione por papel/aria, nunca por classe CSS, índice ou xpath.
2. **Selector hierarchy** — `getByRole > getByLabel > getByText > getByTestId`. Falhe explicitamente, não silenciosamente.
3. **Wait on observable state** — espere mudança visível (texto, atributo, network), nunca `sleep` ou timeout fixo.
4. **Test independence** — qualquer teste roda sozinho, em qualquer ordem, sem estado herdado.
5. **One behavior per test** — uma única invariante por teste; várias assertions são ok desde que validem a mesma invariante.
6. **Table-driven / parametrized** — N cenários em 1 teste parametrizado > N testes separados.
7. **Builders / object mothers** — fixtures via builder, não hardcode espalhado.
8. **Mocks at boundaries** — mocke I/O externo (rede, disco, clock). Nunca mocke colaborador interno do SUT.
9. **Real systems on the critical path** — pelo menos 1 teste por feature atravessa fronteira real.
10. **Contract tests** — provider e consumer compartilham contrato versionado (OpenAPI, Pact, protobuf).
11. **Mutation score** — meça quão bem os testes detectam mutações; cobertura sozinha mente.
12. **Page Object Model collapsado** — POM é ferramenta, não religião. Inline simples > POM complexo quando reuso é baixo.
13. **Repository sobre query layer** — nunca mocke o próprio Repository para testar Repository. Extraia interface mínima sobre a query layer gerada (SQLC/Prisma/jOOQ) no próprio repository; teste mocka a interface, SUT é o Repository real.
14. **Fail-fast testável** — extraia validação de boot como função pura que retorna erro/resultado (ex.: `validateConfig(cfg) -> error`); o caller decide abortar (log + exit não-zero). Nunca aborte o processo inline dentro do construtor (`log.Fatal`/`os.Exit`/`exit()`/`throw` não-capturável no boot) — torna o caminho intestável sem fork de subprocesso. Vale em qualquer stack (Go, Node, Python, Dart, JVM).

---

## Famílias de antipadrões (29)

Catálogo completo em [references/antipadroes.md](references/antipadroes.md). Resumo das famílias:

- **Brittleness** (7) — testes que quebram em refactor inocente OU que não pegam regressão: seletores de implementação, assertions vagas, action sem assertion, snapshot-as-test, testar estrutura interna, testar método privado, **asserção tautológica/infalível (AP-29)**.
- **Flakiness** (3) — `sleep`/timeout fixo, dependência de ordem, inputs não-determinísticos (`Date.now()`, RNG, locale).
- **Mock misuse** (6) — **assertion em mock auto-setado** (mock-driven confidence), mock drift, over-mock de filhos, mock incompleto, mock em camada errada, **mock do próprio repository (AP-27)**.
- **Process** (12) — coverage como vaidade, happy-path only, beforeAll eterno, cleanup em afterEach, magic strings, testar third-party, quarentena-cemitério, **retry-as-fix**, duplicação cross-layer, enfraquecer teste para passar, **duplicata semântica (AP-26)**, **fail-fast intestável (AP-28)**.
- **AI-specific** — absorvidos nos 7 gates de `references/ai-escreve-testes.md`.

---

## Gates obrigatórios para agentes (7)

Conteúdo verbatim em [references/ai-escreve-testes.md](references/ai-escreve-testes.md). Cada caso de teste gerado por agente DEVE atravessar:

1. **Invariant First** — declarar `INVARIANT`, `OWNING_LAYER`, `EXISTING_SUITE` antes do código.
2. **Owning Layer** — estender suíte existente sempre que possível; novo arquivo exige justificativa.
3. **Real Execution** — declarar fronteira de integração; se `none`, adicionar teste de integração.
4. **Failure → Fix Production** — falha do teste investiga SUT primeiro; editar teste exige `SUT_IS_CORRECT_BECAUSE:`.
5. **No Snapshot Without Contract** — classificar artefato como `PRODUCT_CONTRACT` ou `IMPLEMENTATION_DETAIL`; o segundo PROÍBE snapshot.
6. **No Self-Set Mock Assertion** — não asserir valor que o próprio teste setou no mock (mock-driven confidence).
7. **Negative Companion** — todo positivo tem negativo: input inválido, modo de falha, asserção específica.

**Mock Budget Rule**: testes que mockam todos os colaboradores DEVEM ter um companheiro de integração sem mocks. Resumo em `ai-escreve-testes.md`.

---

## Disciplina de CI e flakiness

Detalhe em [references/ci-flakiness.md](references/ci-flakiness.md).

- **Quarentena em < 1 hora** após primeira flake, com owner nomeado em 24h e deadline para fix.
- **Track `flaky_rate`** — < 1-2% no main; acima disso, suíte perde confiança.
- **Real systems no gate final** — antes do merge, ao menos 1 layer atravessa DB/HTTP/filesystem reais.
- **Retry sem telemetria é dívida** — auto-retry escondendo bug real é antipattern crítico.

---

## Red Flags transversais (15)

Sinais que devem disparar "pause and think" durante revisão:

1. Setup de mock maior que a lógica do teste.
2. Teste quebra ao renomear método interno (testa implementação, não comportamento).
3. Remover uma assertion deixa o teste verde (assertion oca).
4. Teste falha quando rodado isoladamente com `.only`.
5. `sleep`, `Thread.sleep`, `cy.wait(<number>)` com valor fixo.
6. Seletor com CSS class, índice posicional ou xpath.
7. Assertion contra site/serviço third-party (não controlado).
8. Diff de snapshot aceito sem leitura humana.
9. `%` de cobertura como única métrica de qualidade.
10. Teste falhando auto-retried até passar.
11. Teste pulado/quarentenado sem owner e sem deadline.
12. Dependência de `new Date()`, `Math.random()`, locale do sistema.
13. Limpeza em `afterEach` (mover para `beforeEach` reduz acoplamento entre testes).
14. Teste AI-gerado com 6+ assertions e zero edge cases.
15. Frase mental ou em comentário: "vou mockar isso por segurança".

---

## Quando NÃO usar esta skill

- Revisão geral de código (Gate 2 / agent-spec-staff-architecture-review).
- Debug de biblioteca de terceiros.
- Design de CI fora de testes (cache, artefatos, deploy).
- Observabilidade em produção (logging, métricas, traces).
- Typo fixes em testes existentes (overkill).

---

## Bottom line

Testes que não podem falhar são decoração. Testes que falham pela razão errada são engano. **Objetivo**: testes que falham por exatamente uma razão — a violação da invariante explicitada. Mocks isolam, sistemas reais validam, cobertura ilumina, mutation score classifica.

---

## Fontes

Bibliografia consolidada em [references/fontes.md](references/fontes.md).
