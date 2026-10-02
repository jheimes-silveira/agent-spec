# Checklist — Revisão Final do Handoff

> Usado pela skill na FASE 8 (auto-revisão) antes de salvar. Cada item é verificado mecanicamente. Se algo falha, **corrige antes de gravar**. Se não puder corrigir (falta evidência), converte em `[DÚVIDA]` na seção `Open Questions`.

---

## 1. Estrutura

- [ ] Tem seção `Feature` com nome em pt-BR alinhado ao glossário (se existe).
- [ ] Tem seção `Scope` com bullets do que entra e o que NÃO entra.
- [ ] Tem seção `Backend Entry Points` em tabela.
- [ ] Tem ao menos um bloco em `Contracts` (4.1, 4.2, ...).
- [ ] Tem seção `UI States Required`.
- [ ] Tem seção `Error Mapping`.
- [ ] Tem seção `Fixtures`.
- [ ] Tem seção `Frontend Implementation Notes` (mesmo que curta).
- [ ] Tem seção `Acceptance Criteria`.
- [ ] Tem seção `Open Questions` (ou vazia explicitamente: `Nenhuma.`).
- [ ] Seções não aplicáveis foram **removidas**, não deixadas com placeholder.

## 2. Contratos

Para cada operação em `Contracts`:

- [ ] `Tipo` declarado (REST | GraphQL | RPC | WebSocket | Event | Local SDK).
- [ ] `Método/Ação` declarado.
- [ ] `Path/Operação` declarado.
- [ ] `Auth` explícita (não vazio — declare "nenhuma" se for público).
- [ ] `Permissões` explícitas (declare "pública" se aplicável).
- [ ] `Idempotência` declarada.
- [ ] `Cache` declarado (TTL, invalidação, ou "sem cache").
- [ ] Bloco `Request` com payload + path params + query params + headers relevantes.
- [ ] Bloco `Response (sucesso)` com payload.
- [ ] Tabela de `Erros possíveis` com pelo menos os erros que o handler retorna.
- [ ] `Side effects` listados (ou "nenhum").
- [ ] Cada afirmação não-óbvia tem `<!-- fonte: ... -->` apontando para código/contrato.

## 3. Erros

- [ ] Toda operação tem ao menos um erro mapeado em `Error Mapping`.
- [ ] Cada erro tem: operação, código backend, estado UI, mensagem (chave i18n), retry, invalidação.
- [ ] Estados UI usados batem com os listados em `UI States Required`.
- [ ] Retry segue regras: idempotente pode retentar, não idempotente não.
- [ ] Erros 5xx têm comportamento de fallback declarado.

## 4. Auth e Permissões

- [ ] Cada operação declara explicitamente se exige auth.
- [ ] Tipo de credencial identificado (Bearer JWT, cookie, API key, ...).
- [ ] Permissões descritas em termos verificáveis (role, scope, claim, ownership, tenant, feature flag).
- [ ] Comportamento de falha de auth/autz declarado (401 vs 403, redirect, refresh).
- [ ] Dados condicionais por usuário (campos ocultos, filtros implícitos) explicitados.

## 5. Estados de UI

- [ ] Tabela cobre todas as operações principais.
- [ ] Estados marcados com ✓ refletem o que o backend realmente pode retornar.
- [ ] Não há estados marcados sem suporte do backend (ex: `empty` em endpoint que não é listagem).

## 6. Fixtures

- [ ] Cada operação que altera estado (POST/PUT/PATCH/DELETE) tem ao menos `success` e um erro de cliente (400/422 ou 409).
- [ ] Cada listagem tem `success` + `empty`.
- [ ] Fixtures usam valores determinísticos (IDs, datas, tokens fixos).
- [ ] Fixtures não contêm PII real, segredos ou tokens reais.
- [ ] Há ao menos uma fixture exemplar embutida no handoff (a mais importante).

## 7. Critérios de Aceite

- [ ] Lista é objetivamente verificável (sem "deve ser performático").
- [ ] Cobre estados principais (loading, empty, erro, success).
- [ ] Cobre fluxos críticos de erro (401 → redirect, 403 → mensagem, 409 → refetch).
- [ ] Não copia CA do PRD — converteu em comportamento de UI/integração.

## 8. Testes Mínimos

- [ ] Lista testes mínimos esperados sem impor framework.
- [ ] Cobre happy path + ao menos 2 erros principais.
- [ ] Inclui teste de estado vazio (quando aplicável).

## 9. Dúvidas e Hipóteses

- [ ] Todo `[DÚVIDA]` está em `Open Questions` (não enterrado no meio).
- [ ] Todo `[HIPÓTESE]` está marcado inline E justificado.
- [ ] Nenhuma afirmação especulativa sem marcação.
- [ ] `Open Questions` lista ações necessárias para resolver, não só constatações vagas.

## 10. Concisão

- [ ] Handoff cabe em ≤3 páginas por operação (printar e ver).
- [ ] Sem parágrafos de introdução, conclusão ou justificativa histórica.
- [ ] Sem repetir conteúdo do PRD/tech_spec — apenas referências.
- [ ] Snippets de código em blocos, não em prosa.
- [ ] Cada linha tem motivo de existir. Em dúvida, cortou.

## 11. Auditabilidade

- [ ] Toda afirmação tem origem rastreável (`<!-- fonte: ... -->` para cada bloco não-óbvio).
- [ ] Referências usam paths reais e linhas estáveis (não trechos "perto da função X").
- [ ] Quando cita ADR, usa o ID (ADR-XXXX) — não o título mutável.
- [ ] Quando cita PRD/tech_spec/scope/taskcard, usa caminho relativo do projeto.

## 12. Integração com framework agent-spec

(Aplicável apenas quando invocado dentro do framework SDD/miniSpec/TaskCard.)

- [ ] Path do output respeita `shared.handoff_frontend.path` da `agent-spec-workflow-rules.md` (casos TaskCard/genérico: tabela "Paths" no SKILL.md).
- [ ] Não duplica conteúdo do PRD/tech_spec/scope/taskcard.
- [ ] Glossário (`domain-glossary.md` — global em `/docs/specs/` e feature em `/docs/specs/features/{feature}/`) honrado para nomes canônicos.
- [ ] ADRs aplicáveis citadas por ID.
- [ ] Não declara decisões — apenas extrai e empacota o já decidido.

---

## Como executar a auto-revisão

1. Releia o handoff inteiro (sequencial, sem pular).
2. Para cada item da checklist acima, marque ✓ ou ✗.
3. Para cada ✗:
   - Corrige se for completude ou clareza.
   - Move para `Open Questions` se for falta de evidência.
   - Reescreve se for prosa excessiva.
4. Releia uma segunda vez — agora procurando por **inferência sem evidência**. Se qualquer linha afirma algo que você não conseguiria justificar com um comentário `<!-- fonte: ... -->`, ela vira `[HIPÓTESE]` ou `[DÚVIDA]`.
5. Se mais de 30% das operações ficaram com `[DÚVIDA]`, o handoff está prematuro — sinalize ao usuário que faltam evidências e sugira uma rodada com mais código/spec antes de gravar.

---

## Quando o handoff falha a revisão

Se a checklist acusa muitas falhas, **não grave**. Em vez disso:

- Liste no chat os 3–5 problemas críticos.
- Pergunte ao usuário se quer:
  - Marcar todos como `[DÚVIDA]` e gravar handoff parcial.
  - Pausar e buscar mais evidência (mais código/specs/testes).
  - Reduzir escopo (cobrir só as operações com evidência suficiente).
