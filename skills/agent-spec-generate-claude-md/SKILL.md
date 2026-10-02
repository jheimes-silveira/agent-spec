---
name: agent-spec-generate-claude-md
description: |
  Gera (greenfield) ou audita/augmenta um CLAUDE.md eficiente para o projeto
  host, usando Chain-of-Thought Self-Consistency como filtro anti-alucinação:
  investiga o codebase por k caminhos independentes e só fixa como regra o que
  ≥2 caminhos confirmam. Trata CLAUDE.md como CONTRATO (40–80 linhas, regras
  imperativas e verificáveis, negativos), não como prosa. Use SEMPRE que o
  usuário pedir para "criar/gerar um CLAUDE.md", "configurar o agente para
  este projeto", "fazer o arquivo de instruções do Claude Code", "melhorar/
  enxugar/auditar o CLAUDE.md existente", "documentar a stack e convenções
  para o agente", ou perguntar "como o Claude deve trabalhar neste repo?".
  Acione também quando ele descrever um projeto novo e pedir um onboarding
  para o agente de coding — mesmo sem dizer a palavra "CLAUDE.md".
when_to_use: |
  - Bootstrap de CLAUDE.md num repo que ainda não tem.
  - Auditar/enxugar/fortalecer um CLAUDE.md existente (bloat, regras frouxas).
  - Traduzir stack + convenções + anti-padrões de um projeto em contrato para o agente.
  - Reduzir erro recorrente do agente (suposição, overengineering, edição não pedida) via regras.
do_not_invoke_for: |
  - Decidir se UM item isolado vira regra / onde colocá-lo — isso é a `agent-spec-curate-project-rules`.
  - Estabelecer do zero as convenções de UM tema arquitetural inteiro (DB, HTTP, testes) — `agent-spec-rule-create`.
  - Escrever PRD, spec, tech-spec, ADR, taskcard (conteúdo de feature, não contrato de agente).
  - Configurar hooks, permissões ou settings.json (não é instrução de comportamento, é config da harness).
disable-model-invocation: true
---

# agent-spec-generate-claude-md

> Esta skill roda em **qualquer projeto hospedeiro**. O "host" é o repo onde o CLAUDE.md vai morar — quase nunca este repo do framework. Não force a stack nem as convenções de outro projeto neste.

## O que estamos otimizando

CLAUDE.md é um **contrato**, não prosa. Ele entra no system-prompt **a cada turno** — cada linha inchada é custo de token permanente e dilui o sinal. **Alvo: 40–80 linhas.** Comece enxuto; o arquivo cresce com o uso.

O maior risco ao gerar esse contrato é **afirmar coisa errada sobre o codebase** (framework que não está lá, comando de teste que não existe, convenção imaginada). Uma regra falsa é pior que regra nenhuma: o agente vai confiar nela. Por isso esta skill não gera o arquivo num passo só — ela usa **Chain-of-Thought Self-Consistency** (ver `/CoT-self-consistency`) como **filtro anti-alucinação**.

A adaptação importa: self-consistency clássico vota numa resposta discreta, e um CLAUDE.md é texto livre longo (não dá para votar no documento inteiro — ver o report `references/CoT-self-consistency.md` §7). **Então votamos no nível de cada _claim_** (cada afirmação/regra candidata), não do documento. Um fato sobre a stack que 3 investigações independentes levantam é confiável; um que só 1 caminho levanta é candidato a alucinação → verificar ou perguntar.

---

## Fase 0 — Discovery do host (ou perguntar)

Faça uma varredura factual (não chute). Procure os sinais e **anote a fonte de cada um** (arquivo:linha) — a fonte é o que torna o claim votável depois.

| O que descobrir | Onde olhar (exemplos agnósticos) |
|---|---|
| Linguagem(ns) + versão | manifest/lockfile da stack (`package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `Gemfile`…) |
| Framework / libs principais | dependências do manifest + imports recorrentes |
| Gerenciador de pacotes | lockfile presente (`pnpm-lock`, `go.sum`, `poetry.lock`, `package-lock`…) |
| Comandos reais (install/dev/build/lint/typecheck/test) | scripts do manifest, `Makefile`, `Taskfile`, `justfile`, CI (`.github/workflows`) |
| Estrutura de pastas + "onde coisas novas vão" | layout de diretórios + 1–2 arquivos exemplares por camada |
| Tratamento de env/segredos | `.env.example`, config loader, `.gitignore` |
| Convenções já escritas | `CLAUDE.md`/`AGENTS.md` existentes, `.cursor/rules`, `CONTRIBUTING.md`, lint config |
| Frontend? | presença de UI (componentes, CSS/design tokens) → habilita seções 5–6 do catálogo |

O que **não** for dedutível do repo, **pergunte** — em especial os **3 anti-padrões mais frequentes deste projeto** (o que o time mais corrige em review) e convenções de time que não viram lint. Não invente convenção para preencher seção.

**Idioma do contrato: pt-BR ou English (US).** Sempre pergunte (via `AskUserQuestion`) — não tente adivinhar pelo idioma do código, dos commits ou deste repo do framework. É uma escolha de time: muitos times preferem o contrato no idioma de trabalho deles, e a decisão é do usuário, não sua. Faça essa pergunta junto com as demais não-dedutíveis, não isolada.

> **Já existe CLAUDE.md?** Leia-o inteiro primeiro. O modo passa a ser **auditar e augmentar**, não reescrever: você vai propor edições cirúrgicas (cortar bloat, fortalecer regra frouxa, adicionar regra faltante), preservando o que já está bom e os URLs/seções que o time referencia.

---

## Fase 1 — k caminhos de investigação independentes

Gere **k = 3** conjuntos de claims candidatos (use **k = 5** se o repo for grande, poliglota ou monorepo). Cada caminho usa uma **estratégia distinta** — não é o mesmo raciocínio reescrito; é uma lente diferente que descobre coisas diferentes:

```
Caminho A — Evidência de configuração:
  Derive stack, versões, gerenciador e comandos SOMENTE de manifests/lockfiles/CI.
  Claims aqui são os mais "duros" (têm arquivo:linha como prova).

Caminho B — Estrutura e placement:
  Derive de layout de pastas + arquivos exemplares. Responde "onde coisas novas vão",
  convenções de organização, e a regra anti-duplicação (preferir editar a duplicar).

Caminho C — Comportamento e anti-padrão:
  Derive de git log, rules/lint existentes, setup de teste e do que o usuário relatou.
  Responde o que costuma quebrar, o que NÃO usar, e os negativos específicos do projeto.
```

Cada caminho devolve uma **lista de claims**, um por linha, no formato:

```
[seção] claim — fonte: <arquivo:linha | usuário | "não encontrado">
```

Regra de ouro de cada caminho: se faltou dado, escreva `fonte: não encontrado` — **não invente** versão, comando, lib ou convenção para completar a seção.

---

## Fase 2 — Voto por claim (não pelo documento)

Consolide os claims dos k caminhos e classifique cada um por **convergência**, não por eloquência:

| Convergência | Significado | Ação |
|---|---|---|
| **≥2 caminhos + fonte concreta** | Alta confiança | **Inclui** no contrato. |
| **1 caminho, mas com fonte concreta** | Verdadeiro porém pouco saliente | Confirme lendo o arquivo/rodando `grep`; se bate, inclui. |
| **1 caminho, fonte "não encontrado"** | Possível alucinação | **NÃO inclui.** Pergunte ao usuário ou omita a seção. |
| **Caminhos conflitam** | Ex.: versões divergentes | Resolva **lendo o arquivo real**, nunca pelo caminho mais "bem escrito". |

Apresente a tabela de votação (claim · caminhos que sustentam · fonte · decisão) antes de montar — é onde o usuário pega um claim errado antes de virar regra.

> Comando que entra no contrato (build/test/lint) **tem que existir de verdade**. Se a confiança for alta mas você não rodou, marque-o como "a confirmar" em vez de afirmar que funciona — coerente com a Regra de comportamento #4 que o próprio contrato vai pregar.

---

## Fase 3 — Montar o contrato

Use `assets/claude-md-template.md` como esqueleto. Preencha **só com claims aprovados na Fase 2**.

Duas partes não-negociáveis:

1. **As 5 Regras de comportamento entram SEMPRE, verbatim** (estão no template). São universais — combatem os vícios de LLM (suposição silenciosa, overengineering, edição não pedida, afirmação sem evidência, ação destrutiva) e são a parte que mais reduz erro. Não dependem de stack. **"Verbatim" se refere ao conteúdo e à ordem das 5 regras**, não ao idioma: o template é pt-BR como estrutura canônica; se o usuário escolheu English na Fase 0, renderize o contrato inteiro em inglês — títulos de seção, as 5 regras e toda a prosa traduzidos. Comandos, nomes de pacote e identificadores de código nunca são traduzidos.
2. **Selecione as seções estruturais relevantes** ao tipo de projeto — nem todo projeto usa as 10. Critério e redação de cada seção: `references/section-catalog.md`. Regra rápida: frontend ganha UI/Design e Content; backend pode pular.

Diretrizes de escrita (detalhe em `references/section-catalog.md`):
- **Negativos reduzem mais erro que positivos.** Prefira "NÃO faça X" a "faça Y quando fizer sentido".
- **Regra objetiva e verificável.** Ruim: "use named exports quando fizer sentido". Bom: "named exports exceto em route files".
- **Defina o comportamento sob incerteza** (perguntar? mostrar plano antes de editar N arquivos?).
- **Sem marketing, sem história de empresa.** Visão = o que é, para quem, o que otimiza, restrições.

Feche o arquivo com um comentário de iteração: *erro que estava no spec → fortalecer a regra existente; erro que não estava → adicionar regra nova.*

---

## Fase 4 — Diff revisável (nunca grave direto)

1. Conte as linhas. Se passar de ~80, **sinalize e proponha o que cortar** (geralmente prosa, seções vazias, regras óbvias da linguagem) antes de gravar.
2. Mostre o conteúdo proposto como **diff** (greenfield = arquivo novo; augmentação = edições cirúrgicas sobre o existente).
3. Grave **só após o OK** do usuário. Ele pode discordar de um claim, de uma seção ou do tamanho.

---

## Relação com outras skills

- **`agent-spec-curate-project-rules`** — quando, *depois*, surgir UM item novo e a dúvida for "isso vira regra? vai no CLAUDE.md ou numa rule com matcher?". Esta skill gera o contrato inicial; a curate mantém o crescimento item a item.
- **`agent-spec-rule-create`** — quando um tema (DB, HTTP, testes) precisar de uma rule dedicada com matcher, separada do CLAUDE.md.

## Sinais de que você desviou

- Escreveu uma seção inteira sem nenhum claim com fonte concreta → é prosa, corte.
- Afirmou um comando de teste/build que não saiu de manifest/Makefile/CI → verifique ou marque "a confirmar".
- O arquivo passou de 80 linhas e você não sinalizou → pare e proponha cortes.
- Gerou o CLAUDE.md num passo só, sem a votação da Fase 2 → você pulou o filtro anti-alucinação, que é o ponto da skill.
