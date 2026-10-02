# Coleta de Débitos — Procedimento de Extração

> Referência consumida por `SKILL.md` na FASE 1. Define como ler `_run/run-report.md` e arquivos de task para coletar débitos elegíveis.

---

## Fontes de débito (em ordem de prioridade)

### 1. `_run/run-report.md` (fonte primária)

Arquivo principal. Hoje é o **relatório humano** escrito pelo orquestrador como **snapshot regenerável** (4 seções fixas). Os débitos vivem na **Seção 2 — "Débitos Técnicos Não Resolvidos"**, um **bloco por débito** (Formato C, canônico atual). Runs antigos têm os formatos legados A/B no corpo do arquivo — **todos os três devem ser reconhecidos**.

**Formato C — bloco da §2 do snapshot** (canônico atual; gerado pelos `*-run-tasks`):

```markdown
## 2. Débitos Técnicos Não Resolvidos

### D1 · baixo · project_pattern · T2 · Tech Review
- **Onde:** `lib/features/auth/model/authenticated_user.dart:4`
- **Problema:** AuthenticatedUser usa parâmetro posicional em vez de named required.
- **Impacto:** inconsistência com o padrão do projeto; construtor frágil de evoluir.
- **O que fazer:** trocar para `const AuthenticatedUser({required this.id})`.
```

Mapeamento direto para o schema: o cabeçalho `### D{n} · {sev} · {cat} · {task} · {gate}` dá `severidade`/`categoria`/`origem_task`; `Onde` → `arquivo`:`linha`; `Problema` → `titulo`; `Impacto` → `descricao`; `O que fazer` → `correcao_sugerida`. Origem (`gate`) é metadado útil mas não obrigatório no schema. A telemetria de pipeline NÃO está mais aqui — vive em `_run/workflow-report.md` (não é fonte de débito).

**Formato A — one-liner por problema** (legado; runs anteriores ao snapshot; inclui o path do código):

```markdown
T8 — medio/code_quality: Duplicata semântica CT-014 vs TestX_ListaVaziaNuncaNull — internal/api/handlers/franchise_dish/list_handler_test.go:271 — remover o teste autônomo
T8 — baixo/style: inconsistência de naming em variável `x` no handler — internal/api/handlers/franchise_dish/list_handler.go:42 — renomear para nome descritivo
```

> Severidades em pt-BR quando a origem é o QA (`medio`/`baixo`) e em inglês quando é o Tech Review (`MEDIO`/`BAIXO`). Trate como sinônimos.

**Formato B — bloco rico de log** (legado; observado em runs reais; pode não ter path explícito):

```markdown
#### T2 — QA tentativa 1 (APROVADO_COM_OBSERVACOES)
- veredito: APROVADO_COM_OBSERVACOES | nota: 8 | ...
- problemas.medios: 3 | problemas.baixos: 1
  - MED-001 (logic): `MenuItemData.path` permanece obrigatório vs spec (`path?: string`).
  - MED-002 (tests): CT-013 não asserta `aria-expanded='true'` após clique — lacuna WCAG.
  - BAIXO-001 (tests): CT-013 não valida estado inicial colapsado antes do clique.

#### T7 — Tech Review (APROVADO_COM_OBSERVACOES)
- 4 problemas, todos medium/low → APROVADA por política débito-controlado (exemplo **legado**: sob a política atual `MEDIO` bloqueia e não chegaria a `APROVADO_COM_OBSERVACOES`; estes blocos ainda aparecem em features rodadas antes da mudança):
  - P1 (medium, testability): fluxo `pending-removal → cancelar` sem teste.
  - P3 (low, best_practices): import de `ConfirmModal` via path direto em vez do barrel.
```

> Runs reais costumam ter também uma seção-resumo final ("Débito anotado para cleanup futuro") agrupada por task — use-a como **checklist de completude** da coleta (todo item dela deve ter sido coletado de algum bloco), não como fonte primária (ela é mais comprimida que os blocos).

#### Padrões de extração

A skill DEVE detectar débitos via:

- **Blocos da §2** `### D{n} · {sev} · {cat} · {task} · {gate}` seguidos de `- **Onde:** ... / **Problema:** ... / **Impacto:** ... / **O que fazer:** ...` (Formato C — canônico atual). A §2 já contém **apenas débito não resolvido** (o orquestrador acumula só os baixos remanescentes) — não precisa de filtro de "já resolvido".
- **One-liners** `T{N} — {sev}/{categoria}: ...` com severidade `medio|baixo|medium|low` (Formato A, legado).
- **Marcadores de item**: linhas `MED-XXX (categoria):`, `BAIXO-XXX (categoria):`, `P{n} (medium|low, categoria):` (Formato B, legado).
- **Veredito `APROVADO_COM_OBSERVACOES` / `APROVADO_COM_OBSERVACOES`** (legado): tasks listadas sob esse veredito carregam débitos nas linhas seguintes (procurar até o próximo `### T`/`#### T` ou `## ` ou fim do arquivo).
- **Exclusão de já-resolvidos (só legado A/B)**: blocos `### T{N} — retry classification` com `requires_qa_revalidation: false` indicam débitos `code_review_only` já corrigidos sem re-QA — **NÃO recoletar**. Em runs atuais esse bloco vive em `_run/workflow-report.md` (telemetria), não no `_run/run-report.md`; ao processar features antigas, se o `_run/run-report.md` ainda tiver esses blocos no corpo, aplique a exclusão.

#### Como NÃO incluir débitos já resolvidos

- Se um débito aparece em uma seção e há indicação posterior de correção (ex.: "retry classification" mostrando que o executor corrigiu, ou nota "(RESOLVIDO em T{M})" no resumo final), pular.
- Se a feature está em uma versão posterior (`v{N+1}` existe e foi gerada por esta skill), olhar o `scope.md` da v{N+1} — débitos lá listados como `Inclui` já estão sendo resolvidos; se já listados como `Fora do escopo`, foram ignorados conscientemente. Em ambos os casos, **não recoletar**.

### 2. `tasks/T*.md` e `tasks/task-*.md` — campo "Notas / Observações" (fallback)

Tasks individuais podem ter seção "## Notas / Observações" ou "## Observações" com débitos anotados durante execução. Cubra os DOIS padrões de arquivo: `tasks/T*.md` (SDD/miniSpec) **e** `tasks/task-*.md` (TaskCard — `task-{nn}-{slug}.md`). Estrutura:

```markdown
## 8. Notas / Observações

- [DÉBITO] Refatorar helper `parseCpf` — atualmente repetido em 3 arquivos.
- [TODO] Adicionar comentário explicando regra de NULL no índice composto.
```

#### Padrões de extração (fallback)

- Linhas começando com `- [DÉBITO]`, `- [TODO]`, `- [CLEANUP]`, `- [TECH-DEBT]`.
- Só usar como fallback se `_run/run-report.md` resultou em poucos débitos (<2). Razão: notas em tasks são ad-hoc e podem misturar débito real com lembretes do executor.

### 3. NÃO usar

- **TODOs no código** (grep `// TODO`/`# TODO`): fora do escopo desta skill. São débitos do projeto, não da feature específica.
- **Issues do GitHub/GitLab**: fora do escopo — esta skill opera só sobre artefatos do framework agent-spec.
- **CRITICOS/ALTOS** em `_run/run-report.md`: esses NÃO chegam aqui como débito anotado. Eles bloquearam o pipeline e foram resolvidos via re-execução da task. Se aparecer um nesta fonte, há bug no gate — **logue um warning e pule** (não confunda débito MEDIO/BAIXO com bug crítico não resolvido).

---

## Schema de cada débito coletado

```yaml
id: D-001                                  # contador local sequencial nesta sessão
origem_task: T8                            # ID da task original (a partir do "### T{N}" / one-liner)
origem_arquivo: _run/run-report.md         # ou "tasks/T8.md" se fallback
origem_linha: 142                          # linha onde o débito foi encontrado (audit)
severidade: MEDIO                          # ou BAIXO
categoria: code_quality                    # canônica (vocabulário do QA ou do Tech Review)
arquivo: internal/.../x.go                 # path do código a corrigir (ver Passo 3 quando ausente)
linha: 271                                 # opcional
titulo: "Duplicata CT-014 vs TestX..."     # 1 linha
descricao: "Table-driven CT-014 já..."     # 2-3 linhas
correcao_sugerida: "Remover o teste..."    # ação proposta no gate original
```

---

## Procedimento detalhado

### Passo 1 — Ler `_run/run-report.md`

```bash
cat <feature_path>/_run/run-report.md
```

(Use a ferramenta `Read` no Claude Code — não rode `cat` via Bash.)

### Passo 2 — Parsear seções

Identifique, em ordem de prioridade:

- **Blocos `### D{n} · {sev} · {cat} · {task} · {gate}`** sob a §2 (Formato C — fonte canônica atual); cada bloco já é um débito completo.
- One-liners `T{N} — {sev}/{cat}:` e blocos `### T{N}` / `#### T{N}` (legado) que contenham:
  - Severidades de débito: `medio`, `baixo`, `MEDIO`, `BAIXO` (one-liners) ou marcadores `MED-`, `BAIXO-`, `P{n} (medium|low, ...)` (blocos ricos).
  - Veredito `APROVADO_COM_OBSERVACOES` / `APROVADO_COM_OBSERVACOES` (lista débitos imediatamente abaixo).

### Passo 3 — Extrair cada débito

Para cada item identificado, monte o YAML do schema acima:

- `id`: contador local, comece em `D-001`.
- `origem_task`: no Formato C, do 4º campo do cabeçalho `### D{n} · {sev} · {cat} · {task} · {gate}` (regex `·\s*(T\d+|TC-\d+)\s*·`). No legado, do prefixo da one-liner — `T{N} —` / `TC-{NNN} —` — ou do heading `### T{N}` / `#### T{N}` / `### TC-{NNN}` mais próximo acima (regex `^(T\d+|TC-\d+)\s*—`).
- `origem_arquivo`: literalmente `_run/run-report.md`.
- `origem_linha`: linha em `_run/run-report.md` onde o débito foi achado.
- `severidade`: normalizar para `MEDIO`/`BAIXO` (`medio`/`MEDIO`/`MED-` → `MEDIO`; `baixo`/`BAIXO`/`BAIXO-` → `BAIXO`). No Formato C, do 2º campo do cabeçalho.
- `categoria`: no Formato C, do 3º campo do cabeçalho. No legado, do `{sev}/{cat}` da one-liner ou do parêntese `(categoria)` do item. Se ausente, inferir do contexto (ex.: "duplicata de teste" → `code_quality`; "naming inconsistente" → `naming`). Vocabulários do QA e do Tech Review são ambos válidos.
- `arquivo` + `linha`: no Formato C, do campo `**Onde:** [arquivo]:[linha]`. No legado, do segmento `[arquivo]:[linha]` da one-liner, quando presente. **Se ausente** (formato rico antigo): inferir lendo a seção "Arquivos Impactados" da task de origem (`tasks/T{N}.md`) e localizando o símbolo/teste citado no título via `Grep` — registre `arquivo` sempre; `linha` é opcional. Débito sem `arquivo` resolvível → marque `arquivo: "?"` e sinalize ao usuário na FASE 2 (o especialista pode resolver).
- `titulo`: no Formato C, o campo `**Problema:**`. No legado, o corpo do título (cortar em ~80 chars).
- `descricao`: no Formato C, o campo `**Impacto:**`. No legado, as linhas imediatamente após o título (até o próximo marcador de item ou heading).
- `correcao_sugerida`: no Formato C, o campo `**O que fazer:**`. No legado, o último segmento da one-liner, ou linha "Correção:" quando existir; ausente → derivar do título.

### Passo 4 — Deduplicação

Se 2 entradas têm mesmo `(arquivo, linha, titulo_normalizado)`, mantenha apenas a primeira ocorrência (severidade maior vence se houver conflito). Registre a deduplicação no log da FASE 4.6 (append no `_run/run-report.md` da **v{N} original** — o da v{N+1}-debits ainda não existe na geração).

### Passo 5 — Filtro de elegibilidade

Pule entradas que:

- Já estão em `<feature_path>/../v{N+1}-debits/scope.md` (se a versão existir) — já tratadas.
- Severidade `CRITICO` ou `ALTO` (`CRITICO`/`ALTO`) — não deveriam estar aqui; logue warning e pule (possível bug no gate).

> **O filtro é por SEVERIDADE, não por categoria.** Pela política débito-controlado atual, **baixos** de **qualquer** categoria canônica (QA: `code_quality`, `naming`, `style`, `documentation`, `dead_code`, `imports`, `tests`, `logic`, `data_handling`, `error_handling`, `performance`, `concurrency`, `architecture`, `security`, `adr_compliance`; Tech Review: `project_pattern`, `best_practices`, `testability`, etc.) são débito anotado legítimo e **elegível para cleanup**. **Back-compat**: médios legados (features rodadas antes da mudança que passou a bloquear médios) também são elegíveis — colete-os igualmente. A distinção `revalidation_required`/`code_review_only` governa apenas o skip de re-QA no loop de correção — não a elegibilidade de débito.

### Passo 6 — Resultado

Lista ordenada por `(origem_task ascendente, id ascendente)`. Apresente count + breakdown por categoria ao usuário antes de invocar o especialista (FASE 2).

---

## Casos especiais

### `_run/run-report.md` muito grande (>500 linhas)

Use `Grep` antes de `Read` para localizar marcadores de débito:

```
Grep(pattern="MED-|BAIXO-|medio/|baixo/|medium,|low,|medium/|low/|APROVADO_COM_OBSERVACOES|APROVADO_COM_OBSERVACOES", path=<qa-observations-path>, output_mode="content", -n=true, -B=2, -A=10)
```

Resultado: linhas com contexto suficiente para extrair cada débito sem carregar o arquivo inteiro.

### Múltiplas execuções da mesma task (retries)

Se T8 aparece 3 vezes (3 retries), considere apenas a **última** execução (veredito final). Débitos das tentativas intermediárias foram corrigidos ou viraram parte do veredito final.

### `_run/run-report.md` sem estrutura padrão

Algumas features podem ter `_run/run-report.md` mais livre (ex.: Challenge Sessions, anotações manuais). Nesses casos:

- Procure por listas com `[DÉBITO]`, `[TODO]`, `[CLEANUP]`.
- Se não achar nada estruturado → recorra ao fallback (Fonte 2: notas nas tasks).
- Se ainda zero → aborte limpamente: "Sem débitos elegíveis em `<feature_path>/_run/run-report.md`."

---

## Output esperado da FASE 1

JSON em memória do orquestrador (não escreve arquivo) para passar à FASE 2:

```json
{
  "feature": "cadastro-pratos-franquia",
  "version_origem": "v1",
  "total_coletado": 7,
  "debitos": [
    {
      "id": "D-001",
      "origem_task": "T8",
      "origem_arquivo": "_run/run-report.md",
      "origem_linha": 142,
      "severidade": "MEDIO",
      "categoria": "code_quality",
      "arquivo": "internal/api/handlers/franchise_dish/list_my_franchise_handler_test.go",
      "linha": 271,
      "titulo": "Duplicata semântica CT-014 vs TestX_ListaVaziaNuncaNull",
      "descricao": "Table-driven CT-014 já cobre o cenário; teste autônomo é redundante.",
      "correcao_sugerida": "Remover o teste autônomo TestX_ListaVaziaNuncaNull"
    }
  ]
}
```

Esse JSON alimenta diretamente o `<DÉBITOS_JSON>` do prompt do especialista (FASE 2).
