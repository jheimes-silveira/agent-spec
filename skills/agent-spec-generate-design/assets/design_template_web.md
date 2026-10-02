# DESIGN — Especificação de Design (Web)

## 1. Identificação
- **Feature/Projeto**:
- **Frente**: web
- **Documento de Definição**: (path do prd.md ou intent.md)
- **Design System Global**: (path do design-system.md, ou "inexistente")
- **Origem do Design**: Figma | Mockups/Screenshots | Descritivo | Inferido do design system
- **Referências**: (links de Figma/protótipo, paths de imagens)
- **Autor**:
- **Data**:
- **Status**: Draft | Refinando | Aprovado

---

## 2. Princípios Visuais da Feature

(2-4 linhas: a direção visual desta feature e como ela se encaixa na identidade do produto. Ex.: "densidade alta de informação, tabela como elemento central, ações destrutivas sempre com confirmação".)

---

## 3. Design System Aplicável

### 3.1 Tokens Utilizados

<!-- LLM-ONLY: Referencie tokens EXISTENTES (do design-system.md global ou do código — tailwind.config, theme.ts, variáveis CSS). Tokens novos vão na seção 3.3. Não invente valores se o projeto já os define. -->

| Categoria | Tokens | Origem |
|-----------|--------|--------|
| Cores     |        |        |
| Tipografia |       |        |
| Espaçamento |      |        |

### 3.2 Componentes Reutilizados

| Componente | Origem (design system / biblioteca / path) | Uso nesta feature |
|------------|--------------------------------------------|-------------------|
|            |                                            |                   |

### 3.3 Componentes e Tokens Novos

<!-- LLM-ONLY: Só entra aqui o que comprovadamente NÃO existe no projeto. Cada item novo reutilizável é candidato a promoção para o design-system.md global (com confirmação do usuário). -->

| Item | Tipo (componente/token) | Justificativa (por que o existente não atende) | Promover ao global? |
|------|--------------------------|-----------------------------------------------|---------------------|
|      |                          |                                               |                     |

---

## 4. Mapa Visual de Telas

<!-- LLM-ONLY: Uma subseção por tela/página da feature. O layout deve ser descrito de forma que um executor implemente sem adivinhar: regiões, hierarquia, componentes usados. Wireframe ASCII é bem-vindo quando ajudar. -->

### 4.1 [Nome da Tela/Página]

- **Rota**: (a rota técnica detalhada fica na tech spec; aqui apenas a referência)
- **Propósito visual**: (1 frase)
- **Layout**: (regiões e hierarquia — header, conteúdo, ações; ordem de leitura; o que domina a tela)
- **Componentes**: (lista dos componentes das seções 3.2/3.3 usados aqui)

```
(wireframe ASCII opcional)
```

---

## 5. Estados Visuais por Tela

<!-- LLM-ONLY: O coração do documento — é o que o QA valida na Camada 4 (Completude). Cada célula descreve comportamento CONCRETO: "skeleton de 3 cards" e não "loading"; "banner inline com ação Tentar novamente" e não "mostrar erro". Estado genérico não é verificável. Use o VOCABULÁRIO VISUAL do projeto (toast/snackbar/banner/dialog — conforme a biblioteca que o projeto adota, descoberta na ancoragem), não o de um framework que ele não usa. -->

| Tela / Componente | Loading | Sucesso | Erro | Vazio |
|-------------------|---------|---------|------|-------|
|                   |         |         |      |       |

### 5.1 Mensagens e Ações de Recuperação

| Cenário | Mensagem exibida (literal) | Ação oferecida |
|---------|----------------------------|----------------|
|         |                            |                |

---

## 6. Responsividade

<!-- LLM-ONLY: Use os NOMES DE BREAKPOINT do próprio projeto (descobertos na ancoragem — Tailwind usa
  sm/md/lg, Bootstrap usa sm/md/lg/xl com outros valores, projetos custom usam media queries próprias).
  As faixas abaixo são genéricas — substitua pelos nomes/valores reais do projeto. Não imponha convenção
  de um framework que o projeto não usa. -->

- **Abordagem**: mobile-first | desktop-first | herdada do projeto
- **Breakpoints**: (os do design system/projeto — referencie pelos nomes reais, não redefina)

| Faixa (usar nomes do projeto) | O que muda no layout |
|-------------------------------|----------------------|
| Estreita (celular)            |                      |
| Média (tablet)                |                      |
| Larga (desktop)               |                      |

---

## 7. Tema e Modo Escuro

- **Tema**: (herda integralmente o tema do projeto? Exceções?)
- **Dark mode**: Suportado pelo projeto? Sim/Não. (Se sim: alguma atenção especial nesta feature? Se não: `N/A — projeto não suporta dark mode`.)

---

## 8. Interações e Motion

<!-- LLM-ONLY: Apenas o que importa para esta feature. Se o projeto não tem linguagem de animação própria, mantenha mínimo (transições default do design system) — motion especulativo é over-design. -->

| Interação | Comportamento visual | Duração/Easing (se relevante) |
|-----------|----------------------|-------------------------------|
|           |                      |                               |

---

## 9. Acessibilidade Visual

<!-- LLM-ONLY: Decisões VISUAIS que viabilizam a11y — contraste, foco, área de clique. A meta WCAG formal e as ferramentas de auditoria ficam na tech spec (seção a11y). -->

- **Contraste**: (pares de cor críticos desta feature verificados contra o token set)
- **Foco visível**: (como o foco aparece nos componentes interativos desta feature)
- **Alvos de clique**: (tamanho mínimo respeitado nos componentes densos)
- **Reduced motion**: (o que acontece com as animações da seção 8)

---

## 10. Assets Necessários

| Asset | Tipo (ícone/ilustração/imagem/fonte) | Origem (biblioteca do projeto / a produzir / link) |
|-------|---------------------------------------|---------------------------------------------------|
|       |                                       |                                                   |

---

## 11. Observações e Pontos em Aberto

- **Candidatos a ADR (tag `ui`)**: (decisões de design transversais com trade-off real — sinalizar, não criar)
- **Dependências de produto**: (decisões visuais bloqueadas por definição de produto pendente)
- **Deixado para a tech spec**: (decisões técnicas detectadas mas fora do escopo deste documento)

---

## 12. Checklist Final

- [ ] Toda tela do PRD/Intent tem entrada no Mapa Visual (seção 4)
- [ ] Toda tela tem os 4 estados especificados com comportamento concreto (seção 5)
- [ ] Componentes classificados: reuso com origem (3.2) vs novos justificados (3.3)
- [ ] Tokens referenciam o design system/projeto — nada inventado em paralelo
- [ ] Responsividade definida por faixa (seção 6)
- [ ] Tema/dark mode resolvido ou marcado N/A (seção 7)
- [ ] Acessibilidade visual coberta (seção 9)
- [ ] Assets listados com origem (seção 10)
- [ ] Nenhuma regra de negócio; nenhuma mecânica técnica (estado/API/arquivos de código)
- [ ] Candidatos ao design-system.md global confirmados com o usuário
