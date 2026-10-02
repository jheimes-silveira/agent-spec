<!--
Esqueleto do CLAUDE.md. Preencha SÓ com claims aprovados na Fase 2 (≥2 caminhos
ou fonte concreta verificada). Apague as seções que o projeto não usa — nem todo
projeto precisa das 10. Alvo: 40–80 linhas no arquivo final.

As 5 Regras de comportamento são UNIVERSAIS — copie-as verbatim, não adapte por stack.
Tudo entre [ ] é placeholder a substituir; remova os comentários antes de gravar.
-->

# CLAUDE.md

## Visão do Projeto
[O que é, para quem, o que otimiza, restrições principais. Sem marketing nem história de empresa.]

## Stack
- [Framework / linguagem / versões / state / navegação / testes — só o que tem fonte concreta]
- NÃO usar: [libs/padrões proibidos sem aprovação — este negativo vale ouro]

## Como rodar
- Install / Dev / Lint / Typecheck / Build / Testes: [comandos REAIS extraídos de manifest/Makefile/CI]

## Regras de comportamento (não negocie)
1. **Incerteza → leia o arquivo ou rode `grep`. Nunca chute.** Se não achou (função, campo, API, arquivo), diga que não achou.
2. **Menor delta possível.** Resolva só o pedido. Oportunidade de melhoria fora do escopo → reporte separado, não execute sem pedir.
3. **Não toque em código fora do escopo sem autorização explícita.** Viu algo errado → sinalize, não conserte por conta própria.
4. **"Funciona" só com evidência.** Ao afirmar que algo funciona, mostre o output do comando/teste. Não rodou → diga "não rodei".
5. **Ações destrutivas exigem confirmação prévia.** Migração de schema, delete em massa, mudança de CI/auth → confirme antes de executar.

## Convenções
- [Regras objetivas e verificáveis. Nunca "escreva código limpo". Use negativos: "NÃO faça X".]

## Onde coisas novas vão
- [Regras de placement: que tipo de arquivo mora onde. Preferir editar componente existente a criar quase-duplicata.]

<!-- SEÇÕES OPCIONAIS — inclua só se o projeto pedir (ver references/section-catalog.md):
## Arquitetura            (regras de decisão, não só nomes de pastas; keys ficam em .env)
## UI / Design System     (só frontend: traduza estilo em implementação — "ritmo de 8px", nunca "make it modern")
## Content / Copy         (só se relevante: tom, comprimento, padrões proibidos)
## Testing & Quality Bar  (o que significa "feito": typecheck + lint + testes relevantes)
## Safe-Change Rules      (não renomear rota pública, não mexer em schema/auth sem confirmar, preservar backward-compat)
-->

<!-- Itere este arquivo: erro que estava neste contrato → fortaleça a regra existente;
     erro que NÃO estava → adicione uma regra nova. O arquivo cresce com o uso, não de uma vez. -->
