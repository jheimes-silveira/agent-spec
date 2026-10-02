# SCOPE -- MiniSpec (Mobile)

> **Variante**: mobile
> **Plataformas**: iOS | Android | iOS+Android
> **Stack**: Flutter | React Native | Nativo

## 1. O que está incluído
- [ ] Item incluído A
- [ ] Item incluído B

---

## 2. O que está fora do escopo
- [ ] Item fora A
- [ ] Item fora B

---

## 3. Definições Técnicas

### 3.1 Visão em Árvore

<!-- LLM-ONLY: Gere uma árvore ASCII de TODOS os arquivos da seção 3.2 organizados por diretório.
  Marque cada arquivo com: [N] Novo  [M] Modificado  [R] Referência
  Use os caracteres: ├── └── │ (não use + ou -)
  Inclua arquivos nativos (Info.plist, AndroidManifest.xml) quando aplicável.

  Legenda: [N] Novo  [M] Modificado  [R] Referência
-->

```
(treeview gerado pelo LLM aqui)
```

Legenda: `[N]` Novo &nbsp; `[M]` Modificado &nbsp; `[R]` Referência

### 3.2 Arquivos Envolvidos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| -       | -    | -         |

> **Legenda de Ações:** `criar` | `modificar` | `remover`

<!-- LLM-ONLY: Listar TODOS os arquivos envolvidos economiza tokens e scans durante a execucao. -->

### 3.3 Telas / Componentes

- **Design de referência**: <!-- path do design.md (design.feature.path) se existir; "—" se a feature não passou pelo fluxo de design -->

<!-- LLM-ONLY: Se "Design de referência" aponta para um design.md, a coluna Descricao referencia a secao
  correspondente dele (ex.: "ver design.md §4.1") em vez de redescrever layout/estados — duplicar cria duas
  fontes que divergem. Sem design.md, descreva normalmente. -->

| Tela / Componente | Rota | Tipo (page/widget/sheet) | Descrição |
|-------------------|------|--------------------------|-----------|
| -                 | -    | -                        | -         |

### 3.4 Estado / Store

| Store / BLoC | Solução (BLoC/Riverpod/Provider/Redux) | Estado | Persistência |
|--------------|-----------------------------------------|--------|--------------|
| -            | -                                       | -      | -            |

### 3.5 Integração com APIs (consumo)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| -      | -    | -         | -    |

### 3.6 Integração com Hardware

| Recurso | Uso | Permissão | Plugin/SDK | Fallback |
|---------|-----|-----------|------------|----------|
| -       | -   | -         | -          | -        |

### 3.7 Sincronização (offline-first)

- **Banco local**: SQLite/Drift | Realm | Isar | Hive | Room | CoreData
- **Estratégia**: pull on-demand | periódica | push | fila de comandos
- **Resolução de conflitos**: last-write-wins | server-wins | merge manual
- **Versionamento de schema local**: -

### 3.8 i18n / a11y

- **Idiomas**: -
- **Solução i18n**: -
- **Padrão a11y**: WCAG 2.1 AA + VoiceOver/TalkBack
- **Considerações**: -

### 3.9 Feature Flags

| Flag | Propósito | Default |
|------|-----------|---------|
| -    | -         | -       |

### 3.10 Dependências de Pacotes

| Pacote | Versão | Plataforma (iOS/Android/Cross) | Motivo |
|--------|--------|--------------------------------|--------|
| -      | -      | -                              | -      |

---

## 4. Critérios de Aceite (técnicos)
- [ ] Critério técnico A
- [ ] Critério técnico B

---

## 5. Observações
- Pontos de atenção (diferenças iOS/Android)
- Restrições técnicas
- Candidatos a ADR (sinalizar tag e motivo, não criar automaticamente)
