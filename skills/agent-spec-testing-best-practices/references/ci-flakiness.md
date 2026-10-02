# CI e disciplina de flakiness

> Reference de `agent-spec-testing-best-practices`. Aplicado em revisão de suítes existentes e ao avaliar resultado da execução do `agent-spec-qa-validator`.

---

## Definição operacional

Um teste é **flaky** quando produz resultados diferentes (passa/falha) **na mesma versão do código**, sem mudança de input. Causas mais comuns:

1. **Tempo** — espera fixa, race condition, dependência de clock real, ordem de execução.
2. **Estado compartilhado** — DB/filesystem/global state não isolado entre testes.
3. **Concorrência** — paralelização sem isolamento, lock missing.
4. **Inputs não-determinísticos** — RNG, `Date.now()`, UUID v1, locale, timezone.
5. **Fronteira externa instável** — testar contra third-party live, DNS flutuante, rate limit.
6. **Animação/transição** — `await waitFor` curto demais em UI com easing.

---

## Taxonomia (use no agent-spec-qa-validator e ci_flakiness reports)

| Tipo | Sinal observável | Fix canônico |
|---|---|---|
| `time_based` | `sleep`, `setTimeout` fixo, `cy.wait(N)` | Wait on observable state (padrão #3) |
| `order_dependency` | Falha com `.only` ou ordem alternada | beforeEach cleanup, fixtures locais |
| `shared_state` | Passa isolado, falha em paralelo | Isolar DB/files por worker, schema por teste |
| `non_deterministic_input` | Usa `Date`/`Math.random`/locale | Inject clock/RNG, freeze locale |
| `external_dependency` | Falha quando rede/serviço externo cai | Cassette, contract test, mock na fronteira |
| `concurrency_race` | Passa de manhã, falha à tarde | Lock explícito, fila determinística |
| `animation_race` | Falha em CI rápido, passa local | Esperar transition end / disable animation |

---

## Workflow de quarentena

Quando um teste flaky é detectado:

### Primeiras 1h
1. **Marcar `it.skip`/`xit`/`@Disabled`** com comentário obrigatório:
   ```
   @flaky owner=@joao deadline=2026-05-20 motivo=race em assinatura de email; type=time_based
   ```
2. **Abrir issue** com link para a run do CI que mostrou flake.
3. **CI volta ao verde** — não merge bloqueia em flaky.

### Próximas 24h
1. **Owner é definido** (não pode ser "ninguém"; sem owner, deletar o teste).
2. Owner classifica o tipo (`time_based`, `order_dependency`, etc.).
3. Owner registra hipótese de causa raiz na issue.

### Em até 1 sprint (≤ 2 semanas)
1. Fix aplicado **na raiz** (não retry, não aumentar timeout).
2. Quarentena removida.
3. Issue fechada com root cause documentado.

### Após deadline
Se passou da deadline e o teste continua quarentenado:
- O teste tem que ser **deletado** (e o gap registrado em `recomendacoes`) ou **a feature tem que ser bloqueada** até fix.
- Quarentena permanente é antipattern `quarantine_as_cemetery` (AP-21).

---

## Métricas mínimas

Operar suíte sem essas métricas é dirigir no escuro:

| Métrica | Como medir | Alvo |
|---|---|---|
| `flaky_rate` | testes flaky / testes totais executados em janela de 7 dias | < 1-2% |
| `quarantine_age_p95` | p95 do tempo em quarentena | < 7 dias |
| `mean_time_to_quarantine` | tempo entre primeira flake e quarentena | < 1h |
| `mean_time_to_fix` | tempo entre quarentena e fix mergeado | < 5 dias úteis |
| `retry_rate_per_test` | nº de retries por teste por run | ≤ 1 (ideal: 0) |

Se você não tem essas métricas hoje, comece pelo `flaky_rate` — é o mais barato de instrumentar (parsing dos exit codes das runs).

---

## Retry ≠ fix

Auto-retry sem telemetria visível é **`retry_as_fix` (AP-22)** — antipattern crítico.

Quando retry **é aceitável**:

- N ≤ 1 (no máximo 1 retry).
- Telemetria por teste: qual teste retry-ou, quantas vezes, com qual erro.
- Quarentena automática quando o mesmo teste retry-a em 3 runs seguidas em janela de 24h.
- Dashboard visível mostrando trend de `retry_rate`.

Sem esses 4 itens, retry é dívida tóxica que mascara bugs reais.

---

## Real systems no gate final

Antes do merge na main:

- Pelo menos **um layer** de testes atravessa fronteiras reais (DB efêmero, HTTP via testcontainers, filesystem real).
- **Não pode** ser opcional ou pulado por flag.
- Se a feature inteira só tem unit + mock → adicionar 1 teste de integração antes de mergear.

Razão: mocks divergem do real ao longo do tempo. Sem real-system no gate final, o merge promove código que **passou nos testes do agente, não nos testes do sistema**.

---

## Detecção de não-determinismo via re-execução

Heurística leve para agent-spec-qa-validator detectar flakiness emergente:

- Em tasks que tocam `testes_executados.tocou_area_critica == true`, rodar a suíte **2x** em vez de 1x.
- Comparar resultados: se algum teste passa em uma run e falha na outra **na mesma versão do código** → flag como `potencialmente_flaky` em `testing_smells.red_flags_detectadas`.

Não é obrigatório (custo dobra), mas útil em áreas críticas e quando há suspeita.

---

## Padrões para reduzir flakiness na origem

1. **Cleanup em `beforeEach`**, não `afterEach`.
2. **Schema/DB por worker** em testes paralelos.
3. **Inject clock/RNG/locale** como dependência; nunca uso direto.
4. **Wait on observable state** (padrão #3) em vez de `sleep`.
5. **Container ephemeral** (testcontainers) com lifecycle por arquivo de teste.
6. **Disable animation** em e2e (`prefers-reduced-motion`, CSS override).
7. **Snapshot de transição completada**, nunca durante animação.
