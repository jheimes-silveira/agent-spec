# Checklist de Challenge — `tech_spec.md` (SDD)

> Use este checklist na FASE 1 da skill `agent-spec-challenge-spec` para construir a lista priorizada de questões. **Não escreva o checklist no chat com o usuário** — é um plano interno. Cada item vira potencialmente uma pergunta na FASE 2.

---

## A. Terminologia (vs `domain-glossary.md` — global + feature)

> Considere os **dois níveis** de glossário: global (`/docs/specs/domain-glossary.md`) com termos cross-feature do projeto e feature (`/docs/specs/features/{feature}/domain-glossary.md`) com termos específicos. Em conflito, feature sobrescreve global (raro).

- [ ] Toda entidade/modelo nomeada na spec consta em algum dos dois glossários OU é introduzida pela primeira vez nesta spec?
- [ ] Algum termo usado é alias de um termo canônico (ex: spec usa um sinônimo de um termo já canonizado no glossário com nome diferente)?
- [ ] Nomes de endpoints/recursos REST usam consistentemente os termos canônicos (ex: `/customers` vs `/clients`)?
- [ ] Nomes de tabelas/colunas/campos seguem o glossário?
- [ ] Existem dois termos diferentes referindo-se ao mesmo conceito dentro da própria spec (inconsistência interna)?
- [ ] Termos de entidade de negócio (que vão aparecer em outras features) estão no glossário **global** — não duplicados no feature?

## B. Contradição com Código Real

- [ ] Cada arquivo "A modificar" realmente existe no codebase?
- [ ] Cada endpoint "a criar" não colide com endpoint existente (mesmo path + verbo)?
- [ ] Cada entidade "a criar" não duplica entidade existente com nome diferente?
- [ ] Cada migração "a criar" não conflita com schema atual (coluna duplicada, FK quebrada)?
- [ ] Cada utilitário/helper "a criar" não duplica um existente que poderia ser reusado?
- [ ] A camada onde a spec posiciona o código (handler/service/repo) é coerente com a arquitetura real do projeto?

## C. Conformidade com ADRs Existentes

- [ ] Para cada decisão técnica significativa, existe ADR ativa cobrindo o tema? (consulte `adr.index_file` por tag)
- [ ] **Conformidade LITERAL**: para cada ADR aplicável que fixa um artefato concreto (path/diretório, lib, padrão, identificador), o `Decision` da ADR foi **aberto e confrontado** contra a decisão concreta da spec — bate **exatamente** (mesmo path, mesma lib, mesmo padrão)? Não aceite "obedece" no vibe; compare o texto.
- [ ] A spec NÃO cita nenhuma ADR como "obedecida" afirmando um path/símbolo que a ADR **não contém** (armadilha do caso `arquitetura-projeto`: spec alegou `internal/platform/logger` citando ADR-0003 que mandava `pkg/logger`).
- [ ] Se DIVERGIR de uma ADR, a divergência foi **resolvida explicitamente** (spec conformada à ADR OU ADR supersedida/atualizada antes) — e **não** apenas anotada como observação? Divergência não resolvida = achado de **alta prioridade**.
- [ ] **Consistência ADR×ADR**: as ADRs aplicáveis são mutuamente consistentes nas decisões concretas (nenhum par se contradiz, ex.: estrutura `internal/platform/` vs `pkg/`)?
- [ ] A spec lista as ADRs consultadas na subseção "ADRs Aplicáveis nesta Feature" (seção de Observações)?

## D. Decisões Implícitas Sem Justificativa

- [ ] Toda escolha de tecnologia (DB, cache, broker, framework) tem trade-off articulado?
- [ ] Toda escolha de padrão (sync vs async, push vs pull, polling vs webhook) tem trade-off articulado?
- [ ] A spec evita afirmações vagas como "performático", "escalável", "seguro" sem métrica/critério?
- [ ] Decisões de modelagem (1:1 vs 1:N, agregado vs entidades soltas) têm justificativa?

## E. Edge Cases Técnicos

- [ ] Timeout de chamadas externas está definido?
- [ ] Comportamento sob falha parcial (ex: write OK + commit do evento falha) está coberto?
- [ ] Concorrência: dois requests simultâneos para o mesmo recurso — qual o comportamento?
- [ ] Idempotência: re-executar a mesma operação produz o mesmo resultado?
- [ ] Limites: o que acontece com input no limite superior (lista vazia, lista de 10k itens, payload de 100MB)?
- [ ] Recuperação: se a operação falhar no meio, há rollback ou cleanup?

## F. Cobertura de User Stories (rastreabilidade)

- [ ] Cada US-XX do PRD tem mapeamento explícito para definição técnica?
- [ ] Cada CA-XX do PRD tem cobertura na seção de Testes (rastreabilidade CA→CT)?
- [ ] Existe alguma definição técnica que NÃO se mapeia a uma US? (potencial overengineering)

## G. Reuso

- [ ] A spec aproveita explicitamente padrões do `CLAUDE.md` e regras do projeto?
- [ ] A spec referencia código existente nas "Definições Técnicas" quando aplicável?
- [ ] Há padrões/módulos no projeto que a spec poderia usar mas não menciona?

## H. Critical Paths

- [ ] A spec toca categorias críticas (auth, security, crypto, db_migrations, secrets, api_contracts, payments)?
- [ ] Se toca, há plano de validação reforçada (testes de segurança, revisão de migrações, etc.)?
- [ ] As tasks decorrentes herdarão `risk: high` para escalação no executor?

---

## Como priorizar

Ao formar a lista da FASE 1:

1. **Alta prioridade** (sempre questione se ≥1 item bate): A, B, C, H.
2. **Média prioridade** (questione os 2-3 itens mais impactantes): D, E.
3. **Baixa prioridade** (questione apenas se sobrar fôlego e o usuário ainda estiver engajado): F, G.

Meta: 5-10 questões na sessão. Mais que isso desengaja o usuário e dilui o sinal.
