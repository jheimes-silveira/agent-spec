# Prompt do Especialista — Classificação de Débitos

> Referência consumida por `SKILL.md` na FASE 2 (Análise via Especialista). Leia este arquivo antes de invocar `Agent({...})`.

---

## Objetivo

O agente especialista da stack (escolhido em FASE 0 — descoberta interativa) recebe a lista de débitos coletada na FASE 1 e devolve **classificação binária** (`recomendado_corrigir` ou `perfumaria`) com justificativa de 1 linha e custo estimado em minutos.

A LLM não escolhe quais débitos entrarão — apenas **opina** sobre o valor de cada um. A decisão final é do usuário em FASE 3.

---

## Prompt completo

Use exatamente este texto como `prompt` na invocação `Agent({...})`. Substitua `<DÉBITOS_JSON>` pela serialização real coletada em FASE 1.

```
Você está classificando débitos técnicos acumulados em uma feature do projeto.

Seu papel é OPINAR sobre o valor de corrigir cada débito — não decidir. O usuário fará a escolha final com base na sua análise.

## Lista de débitos a classificar

```json
<DÉBITOS_JSON>
```

Cada item tem:
- `id`: identificador local (D-001, D-002, ...)
- `origem_task`: qual task da v{N} original originou o débito
- `severidade`: BAIXO (e MEDIO legado de features pré-mudança) — críticos/altos/médios não chegam aqui sob a política atual, que os bloqueia; MEDIO só aparece em débito anotado antes da mudança
- `categoria`: code_quality | naming | style | documentation | dead_code | imports
- `arquivo`: path relativo
- `linha`: linha (se aplicável)
- `titulo`: descrição curta
- `descricao`: contexto
- `correcao_sugerida`: ação proposta pelo gate original

## O que você deve produzir

Para CADA débito, emita uma classificação:

### `recomendado_corrigir` quando todos verdadeiros:
1. **Custo de correção é trivial** (≤ 5min wall-clock) — delete único, rename simples, mover imports, remover dead code óbvio.
2. **Risco de regressão é nenhum ou muito baixo** — não toca lógica de domínio, não muda contratos públicos.
3. **Valor de correção é tangível** — sinaliza qualidade para próximas features, evita confusão de manutenção, ou pega um anti-padrão que se proliferaria.

### `perfumaria` quando ao menos um:
1. **Custo de correção exige refactor não-trivial** (>10min, exige extrair builder/helper, reescrever múltiplos arquivos).
2. **Valor é marginal** — magic string em teste isolado, comentário de estilo, naming subótimo mas funcional.
3. **Toca área que se beneficiaria mais de uma refatoração maior** — corrigir pontualmente cria inconsistência (ex.: renomear 1 variável quando o módulo inteiro segue convenção antiga).

## Critérios de qualidade da sua classificação

- **Inspecione o arquivo** mencionado em cada débito quando o título não dá contexto suficiente. Use Read/Grep para entender o cenário real antes de classificar.
- **Considere o pattern do projeto** — leia outros arquivos similares na mesma camada (ex.: outros handlers do mesmo sub-pacote) para calibrar o que é "convenção" vs "exceção".
- **Justifique em 1 linha objetiva** — citando custo + risco + valor. Sem floreio.
- **Estime custo realisticamente** — em minutos de wall-clock de um executor sonnet aplicando a correção. Não inclua tempo de QA/Tech Review.

## Formato de saída (OBRIGATÓRIO JSON, sem markdown ao redor)

```json
{
  "classificacoes": [
    {
      "id": "D-001",
      "classificacao": "recomendado_corrigir",
      "justificativa": "Custo: 1min (delete). Risco: nenhum (table-driven CT-014 cobre o cenário). Valor: legibilidade da suíte + evitar propagar padrão.",
      "custo_estimado_min": 1,
      "risco_regressao": "nenhum"
    },
    {
      "id": "D-002",
      "classificacao": "perfumaria",
      "justificativa": "Custo: ~15min (extrair builder + refactor 3 testes). Risco: baixo. Valor marginal — magic string num teste isolado que ninguém vai ler.",
      "custo_estimado_min": 15,
      "risco_regressao": "baixo"
    }
  ]
}
```

## Regras invioláveis

1. Retorne EXCLUSIVAMENTE JSON válido. Sem markdown, sem texto antes/depois.
2. Cada débito da entrada tem que ter classificação na saída — sem omissões.
3. `classificacao` ∈ {`recomendado_corrigir`, `perfumaria`}. Nada mais.
4. `risco_regressao` ∈ {`nenhum`, `baixo`, `medio`, `alto`}. Se for `medio` ou `alto`, justifique explicitamente por que não é crítico (caso contrário, esse débito deveria ter sido CRÍTICO no gate original).
5. `custo_estimado_min` é inteiro em minutos. Use realismo de quem implementa.
6. NUNCA invente débitos que não estavam na lista.
7. NUNCA descarte débitos (todos devem ser classificados — usuário escolhe depois).
```

---

## Validação do retorno

Após receber o JSON do agente, o orquestrador (SKILL.md FASE 2.4) deve:

1. **Parsear como JSON estrito** — se falhar, registrar erro em `_run/run-report.md` e re-perguntar (1 retry).
2. **Validar que `classificacoes[]` tem mesma quantidade de entradas que a lista enviada** — se faltar algum ID, re-perguntar pedindo APENAS os faltantes.
3. **Validar valores enumerados** — `classificacao` e `risco_regressao` precisam estar nos sets permitidos.
4. **Após 2 tentativas falhas** — marcar débitos não classificados como `perfumaria` por default conservador, com justificativa "agente não classificou".

---

## Observação sobre o modelo do especialista

O agente especialista invocado herda o `subagent_type` escolhido na descoberta interativa. Para classificação de débitos:

- **Sonnet basta** — pattern recognition + estimativa de custo, não exige raciocínio profundo.
- **Não use Opus** salvo se o usuário pedir explicitamente — custo extra não justifica para essa tarefa.
- **Nunca Haiku** — mesmo regra do framework principal.

O `model` é passado pela skill via `Agent(model="sonnet", ...)` independentemente do default do agente.
