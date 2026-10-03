---
title: "Apêndice F — Gabarito dos exercícios"
description: "Respostas dos exercícios de fixação por Parte."
---
# Apêndice F — Gabarito dos exercícios

## Parte I

1. **(Ambiguidade)** Suposições escondidas em *"melhore a tela de login"*:

   * (a) o que melhorar — visual, validação, performance, acessibilidade?
   * (b) qual o critério de "melhor"?
   * (c) mantém o fluxo atual ou redesenha?
   * (d) afeta o backend de autenticação ou só o front?

   Uma reescrita sem ambiguidade fixaria escopo, critério mensurável, e o que **não** muda.
2. **(Princípios)** (a) **contexto mínimo**; (b) **modelo mínimo viável**; (c) **débito-controlado**.
3. **(Rastreabilidade)** Exemplo:

   * **CA1** — "um e-mail de recuperação é enviado em até 1 min para um endereço cadastrado".
   * **CT1** — "dado e-mail cadastrado, o serviço de envio é chamado 1x com um token válido".
   * **CA2** — "e-mail não cadastrado não revela se existe conta".
   * **CT2** — "dado e-mail inexistente, a resposta é idêntica à do caso cadastrado".

## Parte II

1. **(Modo escuro)** Provável caminho: **TaskCard** (mudança pontual de UI + persistência simples) ou **miniSpec** se houver tela de preferências e backend.

   Passos:

   * `/agent-spec-pre-refinement` recomenda
   * gera `taskcard.md` (ou `intent.md` + `scope.md`)
   * `*-run-tasks`
   * Gate 1 testa persistência e estados
   * Gate 2 (ou fast-path `[qa]`)
   * stage.

## Parte III

1. **(Escolha de caminho)**

   * a. **TaskCard** — mudança pontual, 1 arquivo, sem decomposição.
   * b. **miniSpec** — 1-2 user stories, mais de um componente (endpoint + serializador + tela), risco moderado.
   * c. **Conversa direta** — spike descartável, sem compromisso de manter o código.
   * d. **SDD** — ≥ 4 user stories, integração externa e decisões candidatas a ADR.
2. **(Promoção vs degradação)** Promover custa reescrever o cartão como `intent.md` + `scope.md` + `task_plan.md` — overhead de geração, único e temporal. Seguir como TaskCard com 3 tasks acopladas custa perder ordem, paralelismo e rastreabilidade, com retrabalho provável quando os gates pegarem entregas parciais. O custo de promoção é **pontual**; o de insistir no caminho errado é **risco recorrente**.
3. **(Variante)** Porque o `tech-alignment.md` apenas **pré-sugere** a plataforma; assumir a variante errada propaga template e checklist incorretos para o `scope.md` e para os testes. A confirmação explícita é barata e evita um erro caro de fundação.

## Parte IV

1. **(Divisão de trabalho)**

   * a. **Gate 1** — robustez funcional (caminho de erro).
   * b. **Gate 2** — conformidade arquitetural / ADR de dependências.
   * c. **Gate 2** — segurança profunda (IDOR).
   * d. **Gate 1** — único gate que executa a suíte.
2. **(Re-validação seletiva)** Como o problema era arquitetural puro (`naming`, sem risco funcional), `requires_qa_revalidation` é `false` → re-roda **só o Gate 2**. Não há necessidade de re-executar testes nem re-validar CAs, porque o conserto não muda comportamento.
3. **(Hard stop)** A task é marcada **BLOQUEADA**; o framework para e escala ao usuário com o relatório completo (JSONs dos gates, memória lazy, paths tocados). Em geral indica que a task estava **mal-formulada** — não que o modelo é incapaz.

## Parte V

1. **(Veredito)**

   * a. **APROVADO\_COM\_OBSERVACOES** — só um baixo.
   * b. **REJEITADO** — há um alto.
   * c. **APROVADO** — zero problemas em todas as severidades.
   * d. **REJEITADO** — há um crítico (o naming médio é irrelevante para o veredito quando há crítico).
2. **(Re-validação)** Não — `naming` e `imports` são `code_review_only`; com todos os problemas nessa classe, pula o QA e vai direto ao Tech Review. **Mas** se a task original tinha `tocou_area_critica: true`, esse override **força re-QA** mesmo assim.
3. **(Ciclo)** Porque corrigir cada débito no momento da detecção dispara um loop de 5-8 min + ~30-50k tokens por item, de valor marginal (o teste já passava) — e o fix mínimo frequentemente introduz nova divergência. Recolher em batch é mais barato em tokens, mais limpo em commits, e deixa a decisão do que vale corrigir para um especialista + o usuário.

## Parte VI

1. **(Iron Laws)**

   * a. **Determinismo** — `new Date()` torna o resultado dependente do relógio.
   * b. **Independência** — depende da ordem/efeito colateral de outro teste.
   * c. **Asserção significativa** — `.toBeDefined()` não valida valor específico.
2. **(Antipadrão)** Fere o **Mock budget** (Iron Law 5) e cai na família **Mock misuse**. Mockando todos os colaboradores sem companheiro de integração, o teste valida o próprio mock, não o sistema — esconde bugs reais de integração (ordenação, serialização, contrato).
3. **(7 gates)** Porque o viés mais comum da IA é gerar só o happy path e parar. Tornar `negative_companion` **obrigatório** transforma a recomendação em gate: sem o par negativo, o caso de teste não é aceito — fechando a porta para suítes que só provam o caminho feliz.

## Parte VII

1. **(5 critérios)**

   * a. **Não vira** — falha C1 (`transversal`): é decisão local de um endpoint, não do projeto.
   * b. **Vira ADR** — passa nos 5: transversal, tag `data`/`architecture`, custo de reversão alto, surpreendente sem contexto, com alternativa (injeção direta) rejeitada.
   * c. **Não vira** — falha C5 (`trade_off_real`): não havia alternativa genuína; "única opção viável" não é decisão.
2. **(Lifecycle)** Status **Superseded**. **Não é apagada** — continua no repositório apontando para a ADR que a substituiu (`Superseded by`), como histórico. Os gates **não a leem** mais: skills consumidoras só aplicam ADRs `Accepted`.
3. **(Compliance)** A regra de idioma de tag é **grep-detectável** (um grep sobre o diff acha a tag em pt-BR) → Camada 6 do Gate 1. A regra de dependência entre camadas exige **análise estrutural** (entender quem importa quem no grafo de módulos) → Gate 2.

## Parte VIII

1. **(Memória)** Não. A memória lazy (`T{N}.md` em `.tmp/`) é criada **apenas em rejeição de gate**. Aprovação na primeira tentativa não gera arquivo — é o "lazy": custo só quando há retrabalho.
2. **(Auditoria)** Em `qa-observations.md` da feature, no log de **retry classification** daquela task. Esperaria encontrar `problemas_por_categoria`, os `overrides_ativos`, o `requires_qa_revalidation` calculado e a `justificativa` da decisão — o suficiente para distinguir bug do algoritmo de execução correta.
3. **(State)** `overridden` diz que o Strategy Selector recomendou **outro** caminho e o usuário forçou este. É observacional (não muda o run), mas agregado ao longo de muitos runs revela se a heurística de recomendação está desalinhada com as escolhas reais do time.
