---
id: "executor-discipline"
title: "Disciplina do Executor (Iron Rules)"
sidebar_position: 6
---
# Disciplina do Executor — Iron Rules

Seis regras invioláveis injetadas **verbatim** no prompt de todo sub-agente executor invocado pelos orquestradores de execução (`*-run-tasks` e `agent-spec-taskcard-run`). As quatro primeiras são adaptação das [Karpathy Guidelines](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md) ao vocabulário agent-spec; a quinta (disciplina de testes) e a sexta (Lei do seam) espelham as 6 Iron Laws de [`agent-spec-testing-best-practices`](/concepts/testing-best-practices.html).

> **Onde a referência vive** (sob demanda, NÃO no system-prompt):
>
> * Canônico: `.claude/skills/agent-spec-minispec-run-tasks/references/executor-discipline.md`
> * Symlinks: `agent-spec-sdd-run-tasks/references/executor-discipline.md` e `agent-spec-taskcard-run/references/executor-discipline.md`
>
> Carregada pelos 3 orquestradores `agent-spec-*-run-tasks` na FASE 0 e injetada **verbatim** (apenas o conteúdo entre os marcadores `<<<EXECUTOR_DISCIPLINE … EXECUTOR_DISCIPLINE>>>`) no prompt de cada `Agent(executor, ...)`.
>
> ::: info 📝 Por que NÃO é rule do system-prompt
> Rules em `.claude/rules/` são carregadas em TODA interação do Claude no projeto — sem matcher condicional. Para esse bloco de ~80 linhas que só é útil aos 3 orquestradores `\*-run-tasks`, isso gastava ~320 tokens permanentes em chat trivial, outras skills, leitura de arquivo, etc. Mover para `references/` segue a mesma convenção de `config.md`, `guardrails.md`, `qa-validator-prompt.md`, `staff-review-prompt.md` — carregamento lazy, custo zero quando não é usado.
> :::

---

## Por que existe

O sub-agente executor roda em **contexto isolado** — não herda `CLAUDE.md` nem rules do orquestrador. Sem instrução explícita no prompt, o LLM tende aos vícios típicos de IA em código:

* Over-engineering (abstrações antecipadas, generics para 1 caso).
* Refactor não pedido ("limpar enquanto está aqui").
* Error handling defensivo para casos não declarados.
* Mudanças além do escopo (modificar arquivos que não estavam na lista da task).
* Assumir interpretação silenciosamente quando a task admite ≥2 leituras.

As 6 Iron Rules mitigam esses vícios **na fonte**: o executor recebe a doutrina junto com a task.

---

## As 6 Iron Rules

### 1. Pense antes de codar

Pause e pergunte via `AskUserQuestion` (não assuma silenciosamente) se qualquer:

* A task admite ≥ 2 interpretações plausíveis do critério de aceite.
* Termo do domínio aparece com sentido ambíguo e não está no glossário.
* Implementar como descrito vai exigir mexer em arquivo **fora da lista declarada**.
* Critério usa palavras vagas ("apropriado", "razoável") sem âncora mensurável.

### 2. Simplicidade primeiro (YAGNI / KISS)

Implemente **apenas** o que a task pede. Pergunta-âncora antes de cada bloco adicionado:

> "Um engenheiro sênior chamaria isso de over-engineering?"

Materializada no Tech Review pela categoria [`speculative_complexity`](/advanced/conditional-gates.html).

### 3. Mudanças cirúrgicas

Toda linha alterada deve rastrear de volta a um item da task. Modifique APENAS arquivos listados nas seções de impacto. Dead code preexistente **não é seu escopo**. Você pode (e deve) remover apenas o que **suas** mudanças tornaram órfão.

Exceção explícita: **mudança de assinatura arrasta seus dependentes** — tocar callers/composition root/testes que instanciam para o build/contrato voltar a compilar é "limpar a própria bagunça", não desvio de escopo. Faça cirúrgico e registre em Pendências; se o conjunto for além do trivial e a task não os lista, pause e pergunte (Regra 1). Reduz falso-positivo de `scope_deviation` no gate.

### 4. Execução orientada a objetivo

Critério vago vira teste concreto (TDD-lite):

1. Primeiro escreva o teste falhando.
2. Implemente o mínimo para passar.
3. Refatore só se justificável pelas Regras 2 e 3.

Sem teste verde para cada critério, não reporte concluída.

### 5. Disciplina de testes

A asserção definida na seção de Testes é **contrato literal** — implemente-a sem enfraquecer. Espelha as 6 Iron Laws de [`agent-spec-testing-best-practices`](/concepts/testing-best-practices.html) e é exatamente o que o [Gate 1 (QA)](/agents/qa-validator.html) usa para reprovar:

* **Asserção literal, nunca genérica** — tipo/sentinela específico de erro, valor exato, argumentos e número de chamadas do dublê (nunca apenas "ocorreu um erro" / "não vazio" / "foi chamado").
* **Todo positivo tem negativo** — `negative_companion` obrigatório com asserção específica.
* **Não asserte o que o mock plantou** — mock-driven confidence é teste oco; suíte 100% mockada exige companheiro de integração.
* **Toda ação tem asserção** — teste sem verificação observável não conta.
* **Falha = corrija o SUT, não o teste** — só altere o teste com `SUT_IS_CORRECT_BECAUSE: <motivo>`.

### 6. Lei do seam — nenhum símbolo test-only em produção

Promovida a **regra numerada própria** (jun/2026) — era bullet da Regra 5 e, sendo a que mais reprova, ganhou saliência máxima.

::: danger 🚫 Lei do seam (Iron Law #6) — agnóstica de stack
Precisa de uma \*\*precondição que a produção não expõe publicamente\*\* (contexto autenticado, estado interno, relógio, identidade)? \*\*Não alargue a superfície pública de produção para obtê-la.\*\* Em ordem de preferência:
1. \*\*Imite um teste análogo existente\*\* que já monta essa precondição.
2. Construa pela \*\*API/caminho real\*\* do boundary.
3. Use o \*\*mecanismo de teste-interno nativo\*\* da stack (que não altera a superfície de produção).
\*\*NUNCA\*\* crie/exporte/adicione um símbolo de produção apenas para teste — proibição reforçada em arquivos de \*\*auth/security/crypto\*\*, onde um seam exposto torna o estado forjável. Foi a causa recorrente de reprovação no run `esqueci-a-senha` (símbolo de auth exportado só para o teste injetar o `sub`). Quando a seção de Testes da task traz \*\*"Setup (caminho legítimo)"\*\*, ele É a receita do seam — siga-o literalmente.
:::

---

## Fluxo de injeção

::: tip 💡 Dica
O orquestrador carrega o bloco UMA VEZ na inicialização (FASE 0) e o reaplica em todas as delegações ao executor. Custo: ~200 tokens por delegação. Sem retry duplicado, paga-se de volta.
:::
::: warning ⚠️ Injete íntegro — comprimir é defeito
O bloco vai \*\*verbatim e completo\*\*. Resumir/parafrasear as regras "em uma linha" por task dilui a saliência — e a \*\*Lei do seam\*\* (Regra 6) é a primeira a se perder na compressão, justamente a que mais reprova. Reforço específico da task (alerta de blast radius, convenção de naming) vai em \*\*outra seção\*\* do prompt, nunca dentro do bloco nem no lugar dele.
:::
```mermaid
flowchart LR
classDef phase fill:#5046e4,stroke:#3f3ac9,color:#fff
classDef done fill:#16a34a,stroke:#15803d,color:#fff
classDef gate fill:#facc15,stroke:#ca8a04,color:#000
A[FASE 0: orquestrador  
lê references/executor-discipline.md]:::phase
B[extrai bloco entre  
«EXECUTOR\_DISCIPLINE»  
SEM os marcadores]:::phase
C[para cada task: monta prompt  
com bloco no TOPO,  
antes do task content]:::phase
D[Agent(executor, prompt)  
com bloco verbatim]:::done
E[Gate 2: detecta  
speculative\_complexity]:::gate
A --> B --> C --> D --> E
```

---

## Reforço no Tech Review

A categoria **`speculative_complexity`** no [`agent-spec-staff-architecture-review`](/agents/staff-architecture-review-agent.html) materializa a Regra 2 como problema detectável no Gate 2:

| Severidade | Quando aplicar |
| --- | --- |
| `high` | Abstração desnecessária acoplou outras partes do código |
| `medium` | Violação localizada, fácil de remover |

A categoria entra na tabela `requires_qa_revalidation` como **`revalidation_required`** (default conservador — remoção de abstração pode quebrar usos inadvertidos). Detalhes em [Gates Condicionais](/advanced/conditional-gates.html).

A Regra 3 (cirúrgico) já tem suporte via categoria `scope_deviation`. A **Regra 5 (disciplina de testes)** é validada no [Gate 1 (QA)](/agents/qa-validator.html), não no Tech Review — asserção fraca, mock-driven, happy-path-only e a violação da Lei do seam (símbolo test-only em produção) viram problemas com `categoria: tests`. As Regras 1 e 4 são preventivas — quando aparecem como problema, são consequência (acoplamento, testes fracos) e caem nas categorias existentes.

---

## Logs e auditabilidade

O orquestrador loga **uma vez por run** em [`qa-observations.md`](/observability/qa-observations.html):

```
[run] executor\_discipline injetado (fonte: references/executor-discipline.md)
```

Sem o log, não há prova de que o bloco chegou ao executor. Para todo executor invocado durante o run, o bloco está presente — não é necessário logar por task.

---

## Quando NÃO mudar

::: warning ⚠️ Armadilha comum
Tentações típicas de relaxar a doutrina, e por que resistir:
:::

* **"Mas o executor já é experiente, não precisa disso."** O executor é um LLM em contexto isolado, sem memória entre runs. Disciplina precisa entrar no prompt — não há outro canal.
* **"As regras parecem genéricas."** São. É de propósito. Karpathy mira os vícios universais de LLMs em código, não particularidades de stack — e a Regra 5 é deliberadamente agnóstica (usa o equivalente idiomático da stack descoberta).
* **"Posso adicionar mais uma regra X."** Pode, mas no arquivo canônico em `.claude/skills/agent-spec-minispec-run-tasks/references/executor-discipline.md` — os outros 2 orquestradores enxergam via symlink, então edição em UM lugar propaga para os 3.

---

## 📚 Aprofundamento na Referência

* [Gates Condicionais — `requires_qa_revalidation`](/advanced/conditional-gates.html) — onde `speculative_complexity` força re-QA.
* [Staff Architecture Review Agent](/agents/staff-architecture-review-agent.html) — categoria `speculative_complexity` no enum.
* [Criar Agent Executor Custom](/customization/custom-executor.html) — o que esperar do prompt recebido.
* [Pipeline agent-spec-minispec-run-tasks](/pipeline/minispec-run-tasks.html) | [agent-spec-sdd-run-tasks](/pipeline/sdd-run-tasks.html) | [agent-spec-taskcard-run](/pipeline/taskcard-run.html) — momento da injeção.
