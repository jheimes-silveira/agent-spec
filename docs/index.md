---
layout: "home"
hero:
  {
    "name": "agent-spec",
    "text": "Do zero à operação",
    "tagline": "Especifique antes de codar — transforme ambiguidade em software confiável, com revisão automática em duas camadas e dívida técnica sob controle.",
    "actions": [
      {
        "theme": "brand",
        "text": "Começar pelo Prefácio",
        "link": "/prefacio"
      },
      {
        "theme": "alt",
        "text": "Framework em 5 minutos",
        "link": "/capitulo-0"
      },
      {
        "theme": "alt",
        "text": "Referência técnica",
        "link": "/skills/overview"
      }
    ]
  }
features:
  [
    {
      "icon": "🏃",
      "title": "Trilha rápida (~1h)",
      "details": "Prefácio → Capítulo 0 → Parte II (passo a passo) → Apêndice D.<br>\\nVocê sai sabendo operar o básico.\\n",
      "link": "/capitulo-0",
      "linkText": "Começar"
    },
    {
      "icon": "📚",
      "title": "Trilha completa (onboarding — capacitação inicial)",
      "details": "Leia linear, do Prefácio aos Apêndices.<br>\\nÉ o caminho desenhado para aprender de verdade.\\n",
      "link": "/prefacio",
      "linkText": "Abrir o guia"
    },
    {
      "icon": "🔍",
      "title": "Trilha de referência",
      "details": "Após o Capítulo 0, cada capítulo é autocontido.<br>\\nUse a busca ou a área 🔧 Referência da sidebar.\\n",
      "link": "/skills/overview",
      "linkText": "Ir à referência"
    }
  ]
---
## O que esse framework resolve

| Problema | Como o framework resolve |
| --- | --- |
| **Escolha de ferramenta errada** | `/agent-spec-pre-refinement` aplica o **Strategy Selector** e recomenda TaskCard / miniSpec / SDD / Conversa direta |
| **Contexto perdido entre sessões** | Artefatos versionados (`prd.md`, `intent.md`, `taskcard.md`) em `docs/specs/features/` |
| **Qualidade inconsistente** | Gates **QA** + **Tech Review** rodam automaticamente em cada task; críticos/altos bloqueiam e disparam loop, médios/baixos viram débito anotado |
| **Custo alto de IA** | Sonnet por padrão; Opus só em área crítica; memória proativa; `.qa_context.md` pré-extraído |

## Princípios cardeais

Spec antes de código

Quanto mais cedo a ambiguidade morre, mais barato sai.

Contexto mínimo por subagente

Cada agente recebe só o que precisa para sua etapa.

Modelo mínimo viável

Sonnet por padrão; Opus só onde o custo se paga.

Débito técnico controlado

Bloquear risco real (crítico/alto); anotar dívida de manutenibilidade (médio/baixo).

## Próximo passo

* **[Prefácio — Como navegar esta documentação](/prefacio.html)** — para quem é, o que você vai saber fazer, as três trilhas.
* **[Capítulo 0 — Framework em 5 minutos](/capitulo-0.html)** — o mapa antes do território.
* **[Apêndice D — Quem chama quem](/apendices/D-mapa-skills.html)** — referência rápida.
