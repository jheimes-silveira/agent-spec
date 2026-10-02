# Fundamentos — placement, invariantes, pyramid vs trophy

> Reference de `agent-spec-testing-best-practices`. Leia antes de decidir ONDE um teste deve viver.

---

## A invariante é o contrato

Antes de escrever qualquer teste, formule a **invariante** em uma frase declarativa:

> "Dado X, o sistema deve garantir Y, independente da implementação."

Se você não consegue escrever a invariante em uma frase, o teste não está pronto para ser escrito — provavelmente está testando implementação, não comportamento.

**Exemplos válidos**:

- "Um pedido com total negativo nunca deve ser persistido."
- "Login com credencial inválida retorna 401 e não cria sessão."
- "Componente `<Modal>` fecha quando o usuário pressiona Escape."

**Exemplos inválidos** (são testes de implementação disfarçados):

- "A função `validate()` é chamada antes de `save()`." → acoplamento à ordem interna; teste o efeito, não a chamada.
- "O estado interno `isLoading` vira `true` enquanto o request roda." → teste o que o usuário vê (spinner, disable), não o estado.
- "A query usa índice `idx_users_email`." → teste o resultado, não o plano de execução.

---

## OWNING_LAYER — a camada mais baixa que detecta a falha

Para cada invariante, escolha a camada **mais baixa** que falharia se a invariante quebrasse. Subir é dívida (lento, frágil, caro de manter); descer é eficiência.

| Camada | Quando usar | Custo | Sinal de teste mal-colocado |
|---|---|---|---|
| `unit` | Lógica pura, função sem I/O, regra de negócio isolada | baixo | Você está mockando "tudo" para conseguir rodar |
| `service-integration` | Orquestração de colaboradores reais (DB efêmero, fila in-memory, clock injetável) | médio | Você está testando 1 função pura via service |
| `route-integration` | Handler HTTP atravessando middleware (auth, validation) e DB real | médio-alto | Você está testando lógica que cabe em unit |
| `e2e` | Fluxo do usuário através de UI ou cliente externo (CLI, SDK) | alto | Você está testando regra de negócio que já tem unit |

### Decisão prática (3 perguntas)

1. **A invariante envolve I/O externo?** Não → `unit`. Sim → próxima.
2. **A invariante depende do contrato HTTP/API ou da composição de middlewares?** Sim → `route-integration`. Não → `service-integration`.
3. **A invariante envolve o usuário operando a UI (e não só o backend)?** Sim → `e2e`. Não → camada decidida acima.

---

## Pyramid vs Trophy — não é dogma

A pirâmide clássica (muitos unit, alguns integration, poucos e2e) **continua válida**, mas com nuance:

- **Backend de regras de negócio**: pirâmide funciona bem (60% unit, 30% integration, 10% e2e).
- **Frontend de UI**: a "trophy" (Kent C. Dodds) faz sentido — peso maior em testes de componente/integration porque a maior parte das invariantes do frontend é sobre composição/interação, não sobre lógica pura.
- **Mobile**: similar a frontend; testes de widget/screen pesam mais.

**Regra agnóstica**: distribua peso onde as invariantes valem a pena ser testadas, não onde o livro mandou.

---

## Risk-based prioritization

Nem toda invariante merece teste. Use `likelihood × blast-radius`:

| Likelihood (chance de quebrar) | Blast radius (dano se quebrar) | Decisão |
|---|---|---|
| Alta | Alto | **Teste obrigatório** em camada baixa + smoke e2e |
| Alta | Baixo | Teste unit (cheap insurance) |
| Baixa | Alto | Contract test ou integration test no caminho crítico |
| Baixa | Baixo | **Rejeite** — teste é decoração |

**Exemplos de blast radius alto**: pagamentos, auth, cálculo de preço, migração de dados, audit log. **Exemplos baixos**: tooltip text, ordem de campos em formulário não-crítico, helper de formatação visual.

---

## Cobertura é farol, não objetivo

Cobertura mede o quê foi **executado**, não o quê foi **validado**. Cuidado com:

- **Cobertura alta + zero asserções específicas** (testes que apenas chamam a função e não verificam resultado).
- **Cobertura 100% local + nenhum integration real** (mocks fazem o número subir, não a confiança).
- **Cobertura como métrica única em PR review** (vaidade — ver `antipadroes.md` §15).

Métricas melhores que cobertura:
- **Mutation score** (PIT, Stryker, mutmut) — quão bem os testes detectam mutações no código.
- **Defect escape rate** — quantos bugs chegam em prod por release.
- **Mean time to detect** — quando um bug entra, em quantas horas o teste o pega.

---

## Test boundary contracts

A fronteira de um teste é onde ele troca informação com o mundo. Mockar **dentro** da fronteira do SUT é mock misuse; mockar **na fronteira** é correto.

| Fronteira do SUT | Mockar? |
|---|---|
| Banco de dados de produção (Postgres remoto) | Sim — use DB efêmero ou container |
| Banco de dados embarcado (SQLite in-memory) | Não — use o real |
| HTTP externo (API de terceiro) | Sim — use cassette/MSW/respx |
| HTTP interno (microserviço da casa) | Prefira contract test; mock só se necessário |
| Clock / timer / RNG | Sim — injete via interface |
| Filesystem temporário | Não — use `tmpdir` real |
| Filesystem produtivo (S3, NFS) | Sim — use stub local |

Regra de ouro: **mocke nas bordas do SUT, não dentro**. Mockar colaborador interno do SUT é testar a fiação, não o comportamento.

---

## Quando NÃO escrever teste

- A invariante é validada pelo **type system** (tipos, generics, schema). Não duplique.
- O código é uma **demo de uma vez** que será descartada.
- A complexidade do teste excede a complexidade do código testado **e** o blast radius é baixo.
- O bug seria pego pelo `linter`/`formatter` mais cedo.

Em todos esses casos, documente em `recomendacoes` (no JSON do agent-spec-qa-test-generator) por que o teste foi omitido.
