# PRD -- Product Requirements Document (O QUE / POR QUÊ)

## 1. Metadados
- **Nome da Feature/Projeto**:
- **Responsável/Autor**:
- **Data**:
- **Versão**:
- **Status**: Draft | Revisão | Aprovado
- **Relacionados**: (Issues, RFCs, Figmas, Documentos de pesquisa...)

---

## 2. Contexto & Motivação
- **Qual problema ou dor existe hoje?**
- **Como funciona atualmente?**
- **Por que isso precisa ser resolvido agora?**
- **Quem sofre o impacto do problema?**

---

## 3. Objetivo da Feature
- **O que se deseja alcançar?**
- **Qual mudança de comportamento esta feature deve gerar?**
- **Qual o resultado final esperado do ponto de vista do usuário?**

---

## 4. Escopo
### 4.1 O que está incluído (dentro do O QUE)
- [ ] Comportamento esperado 1
- [ ] Comportamento esperado 2

### 4.2 O que está explicitamente fora do escopo
- [ ] Item não incluído A
- [ ] Item não incluído B

---

## 5. Usuários & Personas
- **Quem é o usuário principal?**
- **Qual é seu objetivo ao usar essa feature?**
- **Quais dores/dificuldades essa feature resolve pra ele?**

### 5.1 Histórias de Usuário (User Stories)
Formato:
- **US-01**: Como `<persona>`, quero `<ação>` para `<resultado esperado>`.
- **US-02**: Como `<persona>`, preciso `<necessidade>` para `<benefício>`.

<!-- LLM-ONLY: Cada historia de usuario sera rastreada nas etapas seguintes (TECH_SPEC e TASK PLAN) para garantir cobertura completa. -->

---

## 6. Regras de Negócio (alto nível)
(Não confundir com lógica técnica. Somente regras do domínio.)

- RN-01 -- Quando a condição X existir, o sistema deve permitir/impedir Y.
- RN-02 -- Um item só pode ser considerado válido se atender aos critérios Z.

<!-- LLM-ONLY: Numeracao canonica RN-XX (com hifen e zero a esquerda) — o tech_spec rastreia cada RN do PRD na secao de Regras de Processamento/Dominio. -->

---

## 7. Fluxo Comportamental (não técnico)
Descreve **o que o usuário faz**, não como a UI ou o backend implementa.

### 7.1 Fluxo Principal
1. O usuário inicia o processo...
2. O sistema apresenta X ao usuário...
3. O usuário toma uma ação Y...
4. O sistema responde com Z...

### 7.2 Fluxos Alternativos
- Caso aconteça A, o sistema deve permitir B.
- Se faltar informação X, o sistema deve avisar Y.

---

## 8. Critérios de Aceite (O QUE deve acontecer)
- [ ] CA-01: DADO <situação> QUANDO <ação do usuário> ENTÃO <resultado esperado>.
- [ ] CA-02: DADO <que o usuário está em X> QUANDO <realiza a ação Y> ENTÃO <o sistema confirma Z sem erro>.
- [ ] CA-03: DADO <condição Z presente> QUANDO <o usuário acessa W> ENTÃO <o sistema apresenta Y>.

<!-- LLM-ONLY: Formato DADO/QUANDO/ENTAO e OBRIGATORIO em todo CA — e o que permite ao qa-test-generator derivar invariantes verificaveis. Forma curta ("O usuario consegue X") so para comportamento atomico sem pre-condicao, e mesmo assim com resultado observavel explicito. Nenhum detalhe tecnico permitido aqui. Apenas comportamento do ponto de vista do usuario. -->

---

## 9. Restrições & Considerações
- Limitações externas
- Regras de negócio obrigatórias
- Dependências de times, dados ou decisões
- Considerações legais ou de UX

---

## 10. Métricas de Sucesso
- Adoção da feature (%)
- Redução de erros
- Melhora no fluxo
- Tempo reduzido
- Engajamento

---

## 11. Roadmap / Fases
- **Fase 1:**
- **Fase 2:**
- **Fase 3:**

---

## 12. Rastreabilidade de User Stories

| User Story | Descrição Resumida | Critério de Aceite Relacionado |
|------------|-------------------|-------------------------------|
| US-01      |                   | CA-01                         |
| US-02      |                   | CA-02                         |

<!-- LLM-ONLY: Esta tabela sera usada como referencia no TECH_SPEC e TASK PLAN para garantir que todas as historias de usuario foram atendidas. -->

---

## 13. Checklist Final
- [ ] PRD descreve apenas O QUE / POR QUÊ
- [ ] Escopo fechado
- [ ] User Stories definidas e numeradas (US-XX)
- [ ] Critérios de aceite claros
- [ ] Tabela de rastreabilidade preenchida
- [ ] Pronto para criar o TECH_SPEC (COMO)
