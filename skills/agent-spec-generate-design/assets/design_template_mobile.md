# DESIGN — Especificação de Design (Mobile)

## 1. Identificação
- **Feature/Projeto**:
- **Frente**: mobile
- **Plataformas Alvo**: iOS | Android | iOS+Android
- **Documento de Definição**: (path do prd.md ou intent.md)
- **Design System Global**: (path do design-system.md, ou "inexistente")
- **Origem do Design**: Figma | Mockups/Screenshots | Descritivo | Inferido do design system
- **Referências**: (links de Figma/protótipo, paths de imagens)
- **Autor**:
- **Data**:
- **Status**: Draft | Refinando | Aprovado

---

## 2. Princípios Visuais da Feature

(2-4 linhas: a direção visual desta feature e como ela se encaixa na identidade do app. Ex.: "fluxo de uma ação por tela, botão primário fixo no rodapé, feedback háptico em confirmações".)

---

## 3. Design System Aplicável

### 3.1 Tokens Utilizados

<!-- LLM-ONLY: Referencie tokens EXISTENTES (do design-system.md global ou do código — ThemeData/ColorScheme, tokens do app). Tokens novos vão na seção 3.3. Não invente valores se o projeto já os define. -->

| Categoria | Tokens | Origem |
|-----------|--------|--------|
| Cores     |        |        |
| Tipografia |       |        |
| Espaçamento |      |        |

### 3.2 Componentes/Widgets Reutilizados

| Componente/Widget | Origem (design system / biblioteca / path) | Uso nesta feature |
|-------------------|--------------------------------------------|-------------------|
|                   |                                            |                   |

### 3.3 Componentes e Tokens Novos

<!-- LLM-ONLY: Só entra aqui o que comprovadamente NÃO existe no projeto. Cada item novo reutilizável é candidato a promoção para o design-system.md global (com confirmação do usuário). -->

| Item | Tipo (componente/token) | Justificativa (por que o existente não atende) | Promover ao global? |
|------|--------------------------|-----------------------------------------------|---------------------|
|      |                          |                                               |                     |

---

## 4. Mapa Visual de Telas

<!-- LLM-ONLY: Uma subseção por tela da feature. O layout deve ser descrito de forma que um executor implemente sem adivinhar: regiões, hierarquia, componentes, safe areas. Wireframe ASCII é bem-vindo quando ajudar. -->

### 4.1 [Nome da Tela]

- **Propósito visual**: (1 frase)
- **Layout**: (regiões e hierarquia — app bar, conteúdo, ações; posição do CTA primário; comportamento com teclado aberto; safe areas)
- **Componentes**: (lista dos componentes das seções 3.2/3.3 usados aqui)

```
(wireframe ASCII opcional)
```

---

## 5. Estados Visuais por Tela

<!-- LLM-ONLY: O coração do documento — é o que o QA valida na Camada 4 (Completude). Cada célula descreve comportamento CONCRETO: "shimmer na lista, 5 placeholders" e não "loading"; "snackbar com ação Tentar novamente" e não "mostrar erro". Offline é estado de primeira classe no mobile. Use o VOCABULÁRIO VISUAL da plataforma/stack do projeto (snackbar vs toast vs alert/sheet — Material, Cupertino ou design system próprio, descoberto na ancoragem), não o de um framework que ele não usa. -->

| Tela / Componente | Loading | Sucesso | Erro | Vazio | Offline |
|-------------------|---------|---------|------|-------|---------|
|                   |         |         |      |       |         |

### 5.1 Mensagens e Ações de Recuperação

| Cenário | Mensagem exibida (literal) | Ação oferecida |
|---------|----------------------------|----------------|
|         |                            |                |

---

## 6. Adaptação de Plataforma e Telas

- **iOS vs Android**: (idêntico | adaptativo — o que muda: navegação, diálogos, pickers, ícones)
- **Tamanhos de tela**: (comportamento em telas pequenas/grandes/tablet, se suportado)
- **Orientação**: (portrait apenas | landscape suportado — o que muda)

---

## 7. Tema e Modo Escuro

- **Tema**: (herda integralmente o tema do app? Exceções?)
- **Dark mode**: Suportado pelo app? Sim/Não. (Se sim: alguma atenção especial nesta feature? Se não: `N/A — app não suporta dark mode`.)

---

## 8. Interações, Gestos e Motion

<!-- LLM-ONLY: Apenas o que importa para esta feature. Inclui gestos (swipe, pull-to-refresh, long-press), feedback háptico e transições de tela. Se o app não tem linguagem de animação própria, mantenha mínimo — motion especulativo é over-design. -->

| Interação/Gesto | Comportamento visual | Háptico? |
|-----------------|----------------------|----------|
|                 |                      |          |

---

## 9. Acessibilidade Visual

<!-- LLM-ONLY: Decisões VISUAIS que viabilizam a11y — contraste, touch targets, escala de fonte. VoiceOver/TalkBack e auditoria formal ficam na tech spec (seção a11y). -->

- **Contraste**: (pares de cor críticos desta feature verificados contra o token set)
- **Touch targets**: (mínimo de 44/48pt respeitado nos componentes densos)
- **Escala de fonte**: (comportamento do layout com fonte do sistema ampliada)
- **Reduced motion**: (o que acontece com animações/gestos da seção 8)

---

## 10. Assets Necessários

| Asset | Tipo (ícone/ilustração/imagem/fonte/lottie) | Origem (biblioteca do projeto / a produzir / link) | Densidades/Variantes |
|-------|----------------------------------------------|----------------------------------------------------|----------------------|
|       |                                              |                                                    |                      |

---

## 11. Observações e Pontos em Aberto

- **Candidatos a ADR (tag `ui`)**: (decisões de design transversais com trade-off real — sinalizar, não criar)
- **Dependências de produto**: (decisões visuais bloqueadas por definição de produto pendente)
- **Deixado para a tech spec**: (decisões técnicas detectadas mas fora do escopo deste documento)

---

## 12. Checklist Final

- [ ] Toda tela do PRD/Intent tem entrada no Mapa Visual (seção 4)
- [ ] Toda tela tem os 5 estados especificados com comportamento concreto, incluindo offline (seção 5)
- [ ] Componentes classificados: reuso com origem (3.2) vs novos justificados (3.3)
- [ ] Tokens referenciam o design system/app — nada inventado em paralelo
- [ ] Adaptação de plataforma/orientação definida (seção 6)
- [ ] Tema/dark mode resolvido ou marcado N/A (seção 7)
- [ ] Acessibilidade visual coberta (seção 9)
- [ ] Assets listados com origem e variantes (seção 10)
- [ ] Nenhuma regra de negócio; nenhuma mecânica técnica (estado/API/arquivos de código)
- [ ] Candidatos ao design-system.md global confirmados com o usuário
