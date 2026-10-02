# Fontes

> Reference de `agent-spec-testing-best-practices`. Bibliografia consolidada.

---

## Bibliografia (curada)

### Fundamentos de testing
- **Kent Beck** — *Test-Driven Development: By Example*. Princípio da invariante explícita.
- **Vladimir Khorikov** — *Unit Testing: Principles, Practices, and Patterns* (Manning). Pirâmide vs. trophy, mock vs. stub, classicista vs. mockista.
- **Martin Fowler** — [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html). Distinção canônica.
- **Kent C. Dodds** — [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications). Trophy para frontend.

### Antipadrões
- **James Carr** — *TDD Anti-Patterns* (lista clássica de 22 antipatterns, base histórica).
- **Gerard Meszaros** — *xUnit Test Patterns* (Addison-Wesley). Catálogo de smells.
- **Michael Feathers** — *Working Effectively with Legacy Code*. Test boundary, seam concepts.

### Real systems e contract testing
- **Pact** — [Documentation on contract testing](https://docs.pact.io/). Provider/consumer model.
- **Testcontainers** — [testcontainers.com](https://testcontainers.com/). DB efêmero por teste.
- **MSW (Mock Service Worker)** — [mswjs.io](https://mswjs.io/). Mock na fronteira HTTP do browser.

### Mutation testing
- **Henry Coles** — *PIT mutation testing for Java* (pitest.org).
- **Stryker** — [stryker-mutator.io](https://stryker-mutator.io/). JS/TS/C#.
- **mutmut** — Python. CLI simples.

### Flakiness e CI
- **Google Testing Blog** — *Flaky Tests at Google and How We Mitigate Them* (2016). Quarentena disciplinada.
- **Microsoft Research** — *An Empirical Analysis of Flaky Tests* (Luo et al., 2014). Taxonomia clássica.
- **CircleCI Blog** — vários posts sobre quarentena automática e retry telemetry.

### Selectors estáveis
- **Testing Library** — [About queries](https://testing-library.com/docs/queries/about). Selector hierarchy.
- **Playwright** — [Best Practices](https://playwright.dev/docs/best-practices). Locators by role.

---

## Fora do escopo desta versão

- **LLM/Agent evaluation** (oracle ladder, LLM-as-judge, RAG metrics, trajectory grading): omitido por enquanto. Reabrir quando o projeto adotar features LLM em produção.
- **Performance/load testing** (k6, Gatling, Locust): coberto parcialmente pelo `agent-spec-qa-test-generator` em "recomendacoes" quando aplicável, mas a doutrina específica de carga ficou fora.
- **Visual regression** (Percy, Chromatic, Playwright snapshots): cabe em Gate 5 (No Snapshot Without Contract) como classificação `PRODUCT_CONTRACT`, mas o ferramental específico não está detalhado.
- **Acessibilidade automatizada** (axe, Pa11y): mencionada em `agent-spec-qa-test-generator` como categoria, mas a doutrina detalhada (WCAG rule-by-rule) ficou fora.

Reabrir conforme necessidade. Documente em ADR (`docs/adr/`) qualquer extensão dessa doutrina antes de mergear.

---

## Notas de versão

| Versão | Data | Mudança |
|---|---|---|
| v1 | 2026-05-13 | Versão inicial. Sem LLM eval (fora de escopo). |
