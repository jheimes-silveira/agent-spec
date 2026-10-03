---
id: "agent-spec-curate-project-rules"
title: "agent-spec-curate-project-rules"
sidebar_position: 7
---
# agent-spec-curate-project-rules

`Compartilhada`
> **Resumo**: Decide se uma convenção, decisão ou padrão merece virar regra de projeto (em `CLAUDE.md`, em `.claude/rules/*.md` ou equivalente do projeto host) — e, se merece, com que **escopo**, **matcher** e **forma**. Aplica teste de fricção rigoroso (4 perguntas) antes de gravar.

> Uma regra mal-colocada custa mais do que regra nenhuma — ela polui o contexto de toda futura sessão ou, pior, não carrega quando deveria.

---

## Quando usar

* Usuário pergunta "vale uma regra?", "documenta isso no CLAUDE.md?", "isso é regra?", "adiciona ao `.claude/rules`".
* Usuário descreve uma convenção/decisão e pede para "deixar isso registrado" — mesmo sem usar a palavra "regra".
* Você está prestes a escrever uma linha nova em qualquer rule.
* Revisar diff de `CLAUDE.md` ou rules procurando bloat, redundância ou conteúdo apodrecido.
* Receber feedback "X foi feito errado" e decidir se vira regra.
* Migrar conteúdo entre rule global ↔ rule de escopo.
* Auditoria periódica de rules ("isso ainda faz sentido?").

## Quando NÃO usar

| Cenário | Use |
| --- | --- |
| Escrever PRD, spec, tech-spec, ADR, taskcard | Skills `*-generate-*` (conteúdo de feature, não regra global) |
| Atualizar README ou docs do site | Edição direta |
| Editar memória (estado, não regra) | Memória do projeto |
| Configurações de hook, permissões ou `settings.json` | Edição direta de `settings.json` |

---

## Modelo mental

Três camadas, cada uma com dono:

| Camada | Onde mora (típico) | Estabilidade | Função |
| --- | --- | --- | --- |
| **Modelo mental + decisões + comandos globais** | `CLAUDE.md` (raiz) | Estável (meses) | Orientação que todo agente precisa em toda sessão |
| **Detalhes operacionais por domínio/área** | Rule com matcher (path glob) | Vivo (semanas) | Convenções específicas. Só carrega quando relevante |
| **Estado, feature em andamento, contexto efêmero** | Memória, PRD, spec, ADR, git log | Volátil (dias) | **Não é regra**. Não entra |

A camada do meio **só funciona se o matcher for bom**. Matcher errado → rule fica decorativa.

---

## Fase 0 — Discovery do projeto host (obrigatório)

> Esta skill vive no framework agent-spec, mas roda em **qualquer projeto hospedeiro**. Antes de propor qualquer coisa, descobre a convenção do projeto host. Não força a convenção de outro projeto.

Varredura rápida (≤60s) para descobrir:

| O que descobrir | Onde olhar | Por quê |
| --- | --- | --- |
| **Onde moram as rules** | `.claude/rules/`, `.cursor/rules/`, `.windsurfrules`, `CLAUDE.md`, `AGENTS.md`, `docs/rules/` | Convenção do host. Não inventa diretório novo |
| **Que frontmatter as rules usam** | Abre 1-2 rules existentes e lê o YAML do topo | Replica o estilo. Campos comuns: `description`, `paths`/`globs`/`applies_to`, `when_to_use`, `auto-load` |
| **Como expressam matchers** | Mesmo frontmatter — campo de glob/path | Decide se a próxima rule vai precisar/herdar esse campo |
| **Quais rules são globais vs com escopo** | Quais não têm matcher (ou têm matcher trivial tipo `"**"`) vs quais têm globs específicos | Sabe em qual bucket a nova rule cai |
| **Idioma e tom** | Estilo das rules existentes (pt-BR/EN, formal/direto) | Combina — não cria dissonância |

Se nada existir ainda, **pergunta ao usuário** o destino antes de criar. Não inventa convenção sem confirmar.

---

## Teste de fricção (obrigatório antes de gravar)

Faz as **4 perguntas**. Se qualquer uma falhar, **descarta ou reformula**.

### 1. Sem isto, alguém faria errado?

Imagina um agente competente lendo o repo pela primeira vez. Faria errado? Se "não, descobriria sozinho", a regra não pega peso.

* ✅ Convenção que diverge do default da linguagem/framework.
* ❌ "Use `defer` para fechar arquivos" — qualquer um que sabe Go já faz.

### 2. Está derivável lendo um arquivo do projeto em 1 minuto?

Se sim, **linka o arquivo** em vez de duplicar a regra.

* ✅ "Handler segue padrão de `<path/exemplar.ext>`" — aponta e para.
* ❌ Copiar 40 linhas da estrutura — sai de sincronia com o código.

### 3. Vai apodrecer em 3 meses?

Datas, números de ticket, branches, "atualmente em X", "estamos migrando para Y" — apodrece. Remove a parte volátil ou aceita revisitar.

* ✅ Invariante estável ("pool é singleton").
* ❌ "Atualmente em 000045, indo para 000050" — apodrece na próxima migração.

### 4. Tem o "porquê"?

Regra forte sem racional vira ruído. Edge case → o leitor precisa do motivo.

* ✅ "Pool singleton — recriar causa `Error 1040: Too many connections`."
* ❌ "NUNCA recrie o pool" — sem motivo, ninguém julga edge case.

---

## O que documentar

| Tipo | Característica |
| --- | --- |
| **Convenção não-inferível** | "Um handler = um caso de uso = um arquivo." Sem regra, copia-se legado |
| **Decisão arquitetural com racional** | Sempre o porquê (incidente, constraint, vendor lock) |
| **Padrão em ≥2-3 domínios** | Se aparece só uma vez, ainda não é padrão. Espera repetir |
| **Anti-padrão que queimou** | Causa concreta observada + alternativa |
| **Default diferente da linguagem/framework** | Ex.: schema em pt-BR num projeto Go |
| **Comando/fluxo específico** | Ex.: `make X` antes de compilar; ordem dos N passos |
| **Tradução entre camadas** | SQLC→DTO, validator→400, `errors.Is`→status code |

## O que NÃO documentar

| Tipo | Por que não |
| --- | --- |
| **Óbvio do código** | Leitura rápida resolve. Não duplica |
| **Geral da linguagem/framework** | É linguagem, não regra do projeto |
| **Estado que muda toda hora** | Branch atual, task em andamento, PR aberto → memória |
| **Detalhe de feature** | Pertence ao PRD/spec/taskcard |
| **Já dito em outro lugar** | **Linka**. Não duplica |
| **Comentário narrativo/histórico** | "Decidido em jan/2024 porque..." apodrece. Git log é a fonte |
| **Regra sem exemplo real** | Sem arquivo apontado, ainda não é regra |

---

## Decisão de escopo e matcher

Esta é a parte que **mais importa** e que costuma ser ignorada.

### Toda rule tem uma decisão de escopo

| Escopo | O que é | Custo | Quando vale |
| --- | --- | --- | --- |
| **Global** (sem matcher, ou em CLAUDE.md) | Carrega em **toda** sessão | Polui contexto sempre | Vale só se a regra é mesmo transversal e estável |
| **Por área/path** (matcher com globs) | Carrega **só** quando agente toca o escopo | Não polui fora do escopo, mas pode não disparar quando deveria | Default para detalhes operacionais de um workflow/módulo/domínio |
| **Sem rule, apenas link** | Não carrega — só lida quando o agente segue o link | Custo mínimo | Quando o conteúdo é raro de precisar ou já existe em código que o agente vai ler |

### Quando a rule **precisa** de matcher

* Vale só dentro de um **workflow** (ex.: SDD, miniSpec, TaskCard).
* Vale só dentro de um **módulo/domínio** (ex.: `services/payments/**`).
* Vale só para um **tipo de arquivo** (ex.: `**/*.handler.go`, `**/*.sql`).
* Aplica a **paths bem demarcados** que o frontmatter do host suporta expressar.

### Quando a rule **dispensa** matcher (vai global / CLAUDE.md)

* É **modelo mental** do projeto (mapa de onde mora o quê).
* É **comando** que todo agente precisa em toda sessão (`make X` antes de Y).
* É **decisão de arquitetura cross-cutting** (auth, errors, logging).
* A penalidade de carregar sempre é menor que a penalidade de **não** carregar quando precisa.

### Como escolher os globs do matcher

1. **Começa estreito.** Glob amplo demais transforma rule de escopo em rule global disfarçada.
2. **Cobre os caminhos onde a regra realmente se aplica.** Não inclui path "porque pode ser útil".
3. **Inclui skills/agents que executam o workflow**, se a convenção do host carrega rules por path de skill (ex.: `.claude/skills/sdd-*/**`).
4. **Não usa `**` como matcher.** Se a regra vale sempre, ela é global — declara como global, não como "matcher universal".
5. **Espelha convenção do host.** Se as outras rules usam `paths:` com lista de globs, usa `paths:`; se usam `globs:` ou `applies_to:`, usa isso.

### Sinais de matcher errado

* Rule carrega em sessões onde claramente não se aplica → glob amplo demais.
* Rule **não** carrega numa sessão onde deveria → glob estreito demais; faltou path; ou conflito com convenção de carregamento.
* Duas rules cobrindo o mesmo glob → consolida ou particiona melhor o escopo.

---

## Onde colocar (algoritmo)

Depois que o item passou no teste de fricção, decide na ordem:

1. **Já existe rule equivalente?** → propõe **edição** em vez de criar nova.
2. **A regra é global e estável?** → CLAUDE.md (ou rule global do host).
3. **A regra pertence a um domínio/workflow já com rule?** → adiciona lá; ajusta matcher se necessário.
4. **A regra pertence a um domínio/workflow SEM rule ainda E vai ter ≥3 regras?** → cria rule nova, define matcher estreito.
5. **A regra é só uma?** → adiciona na rule do domínio mais próximo, ou aceita que vai pra CLAUDE.md como item solto. **Não cria arquivo para uma linha**.

---

## Forma da regra

### Corpo

1. **Curto.** Uma linha, no máximo um parágrafo. Mais que isso → é reference, não rule.
2. **Com exemplo do código real** (`path/arquivo.ext:linha`). Sem exemplo → ainda não é regra.
3. **Com "porquê" explícito** em regras críticas (pool, soft delete, segurança, anti-padrão que queimou).
4. **Linkada.** Uma fonte de verdade por tópico. Se outra rule cobre, aponta.
5. **Sem referência a task/PR/data.** "Adicionado para X" apodrece. Git log/blame é a fonte histórica.
6. **Sem ALL-CAPS gratuito.** "NUNCA"/"SEMPRE" só quando o impacto da violação justifica (perda de dados, vulnerabilidade, regressão crítica).

### Frontmatter (se o host usa)

Replica os campos do host:

```yaml
---
description: <uma linha do que a rule cobre + quando carrega>
<campo-de-matcher-do-host>:
  - "<glob-estreito>"
  - "<outro-glob>"
---
```

> **`description` do frontmatter também é matcher.** Em alguns hosts, ela informa o modelo sobre quando aplicar a rule mesmo se o glob casou por proximidade. Escreve como gatilho ("Carregada quando trabalhando com X ou Y"), não como abstract acadêmico.

### Templates

**Item simples:**

```markdown
- **<nome curto>.** <o que fazer>. Exemplo: `path/real.ext:linha`. Por quê: <motivo>.
```

**Anti-padrão:**

```markdown
- **Não <ação proibida>.** Causa <consequência observada>. Em vez disso: <alternativa>. Ver: `path/exemplo.ext`.
```

---

## Quando o usuário pede "documenta isso"

1. **Discovery silencioso** (Fase 0). Confirma convenção do host.
2. Aplica o **teste de fricção**. Se falhar, diz por quê em vez de escrever.
3. Se passa, decide **escopo + matcher** explicitamente. Mostra a decisão.
4. Se há regra equivalente, **propõe edição** em vez de adicionar nova.
5. Mostra o diff (corpo + frontmatter) antes de gravar — usuário pode discordar do escopo, do matcher ou da forma.

---

## Auditoria de rules existentes

Passes ao revisar rules do host:

| Passe | O que procurar | Ação |
| --- | --- | --- |
| **Apodrecimento** | Datas, "atualmente", "em migração", referências a task/PR | Remove parte volátil ou a regra inteira |
| **Duplicação** | Mesmo conceito em dois lugares | Mantém o mais completo, substitui o outro por link |
| **Sem exemplo** | Regra abstrata sem arquivo apontado | Acha exemplo real ou remove |
| **Sem porquê** | Regra crítica sem racional | Adiciona motivo ou rebaixa para "convenção" sem tom forte |
| **Óbvio do código** | Coisa que `grep` resolve em 30s | Remove |
| **Matcher amplo demais** | Glob `**` ou path raiz numa rule de detalhe | Estreita ou promove a global |
| **Matcher estreito demais** | Rule não carrega onde se aplica | Adiciona paths faltantes |
| **Matcher inexistente onde devia** | Rule global mas conteúdo é de um domínio | Move para rule de escopo ou adiciona matcher |

**Pergunta-âncora**: *"Se eu apagar esta linha, alguém faria errado num cenário real?"* Se não, apaga.

---

## Sinais de alerta (para e revisa)

* Escrevendo "ALWAYS"/"NEVER"/"MUST" sem justificar o impacto.
* Copiando 20+ linhas de código numa rule (é reference; move para `references/` ou linka o arquivo).
* Adicionando regra para caso que ainda não aconteceu ("preventivo"). Espera o segundo/terceiro caso.
* Citando task/PR/data no corpo.
* Não conseguindo apontar arquivo real onde o padrão já existe.
* Inventando diretório de rule sem confirmar convenção do host.
* Usando `**` como matcher (se vale sempre, declara global).

---

## Comando

Invocada por **descrição do contexto** (não tem `argument-hint` ativo — `disable-model-invocation: true`). O usuário pede coisas como:

```
"vale uma regra documentar X?"
"adiciona ao CLAUDE.md: handlers seguem padrão Y"
"isso aqui é regra?"
"audita as rules de .claude/rules/ — alguma apodreceu?"
```

A skill **não cria/edita** silenciosamente — sempre mostra:

1. Resultado do discovery (onde mora rule no host).
2. Resultado do teste de fricção (passou ou falhou, e por quê).
3. Decisão de escopo + matcher.
4. Diff proposto antes de gravar.

---

## Resumo executivo

> Toda regra precisa: (1) evitar erro que o código não evita, (2) não ser derivável em 1min, (3) não apodrecer em 3 meses, (4) ter o porquê, (5) ter exemplo real, (6) ter **escopo declarado** — global ou com matcher honesto. Antes de criar, faz discovery do host: onde moram as rules, que frontmatter usam, que matchers expressam. **Não força convenção**. Sem isso → não é regra.

---

## Skills relacionadas

* [`agent-spec-adr-create`](../adr/adr-create.md) — quando a decisão tem escopo de **arquitetura transversal** (5 critérios) e merece ADR formal, não uma rule.
* [`agent-spec-semantic-commit`](semantic-commit.md) — usada após gravar a rule para commit limpo.

---

## Próximos passos

* [Rules `agent-spec-*`](../../concepts/framework-paths.md) — exemplo de rules com matcher (este projeto host).
* [framework-paths.md](../../configuration/framework-paths.md) — fonte autoritativa de paths.
