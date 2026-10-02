# Checklist de Challenge — `scope.md` (miniSpec)

> Use este checklist na FASE 1 da skill `agent-spec-challenge-spec` para construir a lista priorizada de questões. **Não escreva o checklist no chat com o usuário** — é um plano interno. Cada item vira potencialmente uma pergunta na FASE 2.

> **Diferença vs Tech Spec**: o SCOPE do miniSpec é mais condensado (cobre features menores, 1-2 objetivos). O challenge aqui é mais cirúrgico — foque em consistência e reuso, raramente em modelagem profunda.

---

## A. Terminologia (vs `domain-glossary.md` — global + feature)

> Considere os **dois níveis** de glossário: global (`/docs/specs/domain-glossary.md`) com termos cross-feature do projeto e feature (`/docs/specs/features/{feature}/domain-glossary.md`) com termos específicos. Em conflito, feature sobrescreve global (raro).

- [ ] Entidades, telas e componentes nomeados consultam algum dos dois glossários?
- [ ] O escopo introduz aliases de termos canônicos sem perceber?
- [ ] Nomes de endpoints/recursos seguem os termos canônicos?
- [ ] Há inconsistência interna (mesmo conceito com 2 nomes dentro do próprio SCOPE)?
- [ ] Termos de entidade de negócio (que vão aparecer em outras features) estão no glossário **global** — não duplicados no feature?

## B. Contradição com Código Real

- [ ] Cada arquivo "A modificar" existe?
- [ ] Endpoints/handlers "a criar" não colidem com existentes?
- [ ] A camada onde o escopo posiciona o código é coerente com o projeto?
- [ ] Há módulos/utilitários no projeto que cobrem parte do escopo e não foram referenciados?

## C. Conformidade com ADRs Existentes

- [ ] Decisões técnicas do escopo aderem às ADRs ativas (consulte `adr.index_file`)?
- [ ] Se divergem, a divergência está justificada?
- [ ] A seção 5 (Observações) sinaliza candidatos a ADR conforme os 5 critérios?

## D. Escopo Bem Delimitado

- [ ] A seção "incluído" cobre todas as US/objetivos da INTENT?
- [ ] A seção "excluído" é específica (não vaga como "futuras melhorias")?
- [ ] As fronteiras com features adjacentes estão claras?
- [ ] Não há "creep" — coisas no escopo que não estavam na INTENT?

## E. Decisões Implícitas

- [ ] Cada escolha de tecnologia/padrão tem 1 frase de justificativa?
- [ ] Termos vagos ("simples", "rápido", "robusto") têm tradução em critério mensurável?
- [ ] A variante (web/mobile/backend) está coerente com as definições técnicas?

## F. Edge Cases (proporcionais ao tamanho do escopo)

- [ ] Para cada endpoint/operação principal: timeout, falha, concorrência básica.
- [ ] Para cada tela/componente: estado vazio, estado de erro, estado de carregamento.
- [ ] Idempotência onde aplicável.

## G. Reuso

- [ ] O escopo referencia explicitamente código/componentes existentes que serão reutilizados?
- [ ] Há padrões transversais (auth, validação, paginação) que aparecem implicitamente no escopo e merecem referência?

## H. Critical Paths

- [ ] O escopo toca categorias críticas (auth, security, crypto, db_migrations, secrets, api_contracts, payments)?
- [ ] Se toca, as decisões estão articuladas com cuidado proporcional?

---

## Como priorizar

Ao formar a lista da FASE 1:

1. **Alta prioridade** (sempre questione se ≥1 item bate): A, B, C, H, D.
2. **Média prioridade** (questione 2-3 itens): E, F.
3. **Baixa prioridade** (só se sobrar fôlego): G.

Meta: 3-7 questões. SCOPE é menor que Tech Spec — sessão deve ser proporcionalmente mais curta.
