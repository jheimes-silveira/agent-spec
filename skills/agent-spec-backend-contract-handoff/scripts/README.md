# Scripts — agent-spec-backend-contract-handoff

> Os scripts deste diretório são **exemplos**, escritos em pseudocódigo agnóstico de linguagem. Eles **não fazem parte obrigatória da skill** — o agente pode gerar handoffs sem eles. Servem como ponto de partida para automatizar tarefas repetitivas quando o projeto justifica.

---

## Quando adotar (e quando não adotar)

### Adote quando

- O projeto tem volume relevante de endpoints e a descoberta manual gasta horas.
- O backend já expõe contrato formal (OpenAPI/GraphQL/protobuf) e dá para mapeá-lo deterministicamente.
- O time precisa rodar a geração de handoff em CI/pre-commit.
- Fixtures de teste estão sendo escritas à mão de forma repetitiva — vale gerar a base.

### NÃO adote quando

- A skill será usada uma ou duas vezes por feature — o overhead de manter scripts não compensa.
- O backend é heterogêneo (vários frameworks/linguagens no mesmo monorepo) — script vira árvore de exceções.
- A discovery exige raciocínio (regras de negócio, side effects implícitos) — script não substitui o agente.

---

## Scripts disponíveis

| Script | Função | Entrada | Saída |
|---|---|---|---|
| [`discover-contracts.example`](discover-contracts.example) | Vasculhar o backend e listar candidatos a contratos | Path raiz, padrões de arquivo, contrato formal opcional | Lista de operações + arquivos relacionados |
| [`generate-fixtures.example`](generate-fixtures.example) | Gerar fixtures mínimas por operação | Schema/DTO/OpenAPI/GraphQL + testes | Diretório com `success.json`, `validation-error.json`, etc. |
| [`validate-handoff.example`](validate-handoff.example) | Validar completude do handoff antes de gravar | Path do handoff.md | Lista de seções faltantes + erros |

---

## Convenções

- **Sem dependência de linguagem.** Pseudocódigo. Quem adotar traduz para Bash, Python, Node, Go, etc. — o que o time já usa.
- **Idempotência.** Rodar 2× produz o mesmo resultado.
- **Determinismo.** Mesma entrada, mesma saída. Sem timestamps ou IDs aleatórios.
- **Output legível por máquina E humano.** JSON ou markdown.
- **Exit code != 0** quando falha — para integrar com CI.

---

## Como traduzir

1. Leia o pseudocódigo do script.
2. Identifique as primitivas usadas (`glob`, `grep`, `parse-openapi`, `read-file`).
3. Mapeie para a stack do projeto:
   - Bash: `find`, `rg`, `jq`, `yq`.
   - Python: `pathlib`, `re`, `pyyaml`, `openapi-spec-validator`.
   - Node: `fast-glob`, `ts-morph`, `graphql`, `openapi-typescript`.
   - Go: `filepath.Walk`, `go/parser`, `kin-openapi`.
4. Implemente como CLI: `script.sh --root . --output handoff/`.
5. Teste com um endpoint conhecido — bata o resultado com o handoff manual.

---

## Integração com CI (sugestão)

Pre-commit ou pipeline de PR pode rodar `validate-handoff` em todos os handoffs do diretório `/docs/specs/**/handoff-frontend.md`:

```bash
for handoff in $(find docs/specs -name "handoff-frontend.md"); do
  validate-handoff "$handoff" || exit 1
done
```

Pode rodar também `discover-contracts` e fazer diff contra o handoff existente para detectar drift (rota nova, rota removida).

---

## O que NÃO automatizar

- Decidir o que entra no escopo do handoff (humano define).
- Classificar erros como `[DÚVIDA]` ou `[HIPÓTESE]` (precisa julgamento).
- Escrever `Frontend Implementation Notes` (depende de UX).
- Reescrever critérios de aceite — eles são para humanos validarem comportamento.

Scripts cuidam do **mecânico**. O agente cuida do **semântico**.
