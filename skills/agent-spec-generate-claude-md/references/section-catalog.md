# Catálogo de seções e diretrizes de escrita

> Carregue ao montar o contrato (Fase 3). As 10 seções abaixo são um cardápio — **selecione as relevantes**, não force todas. Regra de seleção: frontend ganha 5–6; backend puro pode pular. Nem todo projeto precisa das 10.

## Índice
1. As 10 seções estruturais (quando incluir + como redigir)
2. Diretrizes de escrita (o que separa contrato de prosa)
3. Erros comuns ao gerar CLAUDE.md

---

## 1. As 10 seções estruturais

| # | Seção | Inclua quando | Como redigir (e o que evitar) |
|---|---|---|---|
| 1 | **Visão do Projeto** (mais importante) | Sempre | O que é, para quem, o que otimiza, restrições. **Sem** história de empresa nem marketing. |
| 2 | **Stack** | Sempre | Framework, linguagem, versões, state, navegação, testes — **e o que NÃO usar** (libs proibidas sem aprovação). O negativo é metade do valor. |
| 3 | **Arquitetura** | Projeto com camadas/decisões não óbvias | **Regras de decisão**, não só nomes de pastas. Inclua subseção "onde coisas novas vão". Keys/segredos ficam em `.env`. |
| 4 | **Convenções de código** (2º mais importante) | Quase sempre | Regras **objetivas e verificáveis**. Nunca "escreva código limpo". Bom: "named exports exceto em route files". |
| 5 | **UI / Design System** | **Só frontend** | Traduza estilo em implementação: "ritmo de espaçamento de 8px", "tokens em `theme.ts`". Nunca "make it modern" / "deixe bonito". |
| 6 | **Content / Copy** | Só se o produto tem copy relevante | Tom, comprimento, padrões proibidos (ex.: "sem emoji em erro", "CTA no imperativo"). |
| 7 | **Testing & Quality Bar** | Projeto com suíte/CI | Defina o que significa **"feito"**: typecheck passa, lint limpo, testes relevantes verdes. Comandos reais. |
| 8 | **Placement de arquivos** | Projeto onde duplicação é risco | Contra quase-duplicata: "preferir **editar** componente existente a criar um quase-igual". Onde cada tipo de arquivo nasce. |
| 9 | **Safe-Change Rules** | Há superfícies públicas/sensíveis | Não renomear rota pública; não mexer em schema/auth sem confirmar; preservar backward-compatibility. |
| 10 | **Comandos específicos** | Sempre que existirem | install / dev / build / lint / typecheck / test — **comandos reais e atuais**, extraídos de manifest/Makefile/CI, não inventados. |

> As seções 1, 2, 4 e 10 são o núcleo de quase todo CLAUDE.md. As demais entram por necessidade.

---

## 2. Diretrizes de escrita

O que transforma uma seção em **contrato** (e não em prosa que custa token):

- **Negativos > positivos.** "NÃO faça X" reduz mais erro do que "faça Y". Liste o que **não** usar, o que **não** tocar, o que **não** renomear.
- **Objetivo e verificável.** Se você não consegue checar a regra olhando um diff, ela é frouxa.
  - Ruim: "use named exports quando fizer sentido."
  - Bom: "use named exports exceto em route files."
- **Defina o comportamento sob incerteza.** O agente deve perguntar? Mostrar plano antes de editar N arquivos? Parar e pedir confirmação? Diga.
- **"Onde coisas novas vão"** vale mais que "como está organizado". O agente já vê a estrutura; ele precisa saber **onde colocar o próximo arquivo**.
- **Cite arquivo real** quando a convenção tem um exemplar (`handler segue padrão de src/users/users.handler.ts`). Aponte e pare — não copie 40 linhas (sai de sincronia com o código).
- **Comando real, não aspiracional.** Se o `test` script não existe no manifest, não escreva que ele existe. Marque "a confirmar" se não rodou.
- **Sem ALL-CAPS gratuito.** "NUNCA"/"SEMPRE" só quando o impacto da violação justifica (perda de dado, vulnerabilidade, regressão crítica). Caso contrário, dê o **porquê** e deixe o agente julgar o edge case.

---

## 3. Erros comuns ao gerar CLAUDE.md

| Erro | Por que dói | Correção |
|---|---|---|
| Arquivo de 150+ linhas | Custo de token a cada turno; sinal diluído | Alvo 40–80. Corte prosa, seções vazias, regras óbvias da linguagem. |
| "Use boas práticas" / "código limpo" | Não-verificável; o agente não sabe o que fazer com isso | Substitua por regra objetiva ou remova. |
| Stack inventada / versão chutada | Regra falsa é pior que ausente — o agente confia | Só claims com fonte concreta (Fase 2). |
| Comando de teste/build que não existe | Agente roda e quebra; perde confiança nas demais regras | Extraia de manifest/Makefile/CI; senão "a confirmar". |
| Repetir o que a linguagem/framework já dá | É linguagem, não regra do projeto | Remova. Documente só o que **diverge** do default. |
| Seção de UI num backend puro | Token morto | Selecione seções pelo tipo de projeto. |
| Esquecer as 5 Regras de comportamento | Some a parte que mais reduz erro de LLM | Entram sempre, verbatim. |
