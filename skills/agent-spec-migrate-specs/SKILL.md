---
name: agent-spec-migrate-specs
description: |
  Avalia TODAS as features/versions já existentes no projeto host
  (docs/specs/features/**) e migra cada uma para o NOVO PROCESSO do framework:
  (1) layout `_run/` — artefatos gerados pelo pipeline (run-report, workflow-report,
  rule-candidates, test-cases, qa_context, *_state.yaml, tmp) saem do topo da pasta
  da spec para `{version}/_run/`; (2) glossário de status PT (APROVADO/PARCIAL/
  REJEITADO + CRITICO/ALTO/MEDIO/BAIXO) reescrito DENTRO dos artefatos gerados;
  (3) refs de path antigas atualizadas. Roda em DRY-RUN por padrão, apresenta um
  relatório do que vai mudar, pede confirmação, e só então aplica via `git mv`
  (preservando histórico). Idempotente e não-destrutivo. Skill standalone, invocada
  pelo usuário, agnóstica de stack.
when_to_use: |
  - Depois de atualizar o framework agent-spec para a versão com layout `_run/` +
    glossário de status PT, para migrar as features que já existem no projeto.
  - Quando o resume / a debt-resolution acusam layout antigo (plano) e você quer
    eliminar a dependência da back-compat de leitura, deixando tudo no novo padrão.
  - Auditoria: rodar em dry-run para ver quantas features ainda estão no formato antigo.
do_not_invoke_for: |
  - Executar uma feature (use os orquestradores *-run-tasks).
  - Resolver débito técnico anotado (use agent-spec-debt-resolution).
  - Migrar convenções de rules/skills do próprio framework (isso é edição de código).
user-invocable: true
disable-model-invocation: true
argument-hint: "[--apply | <caminho/de/uma/feature/version>]"
---

# agent-spec-migrate-specs

> **PERSONA:** Você é um **engenheiro de migração** agnóstico de stack. Sua missão: levar as features já existentes deste projeto para o novo processo do framework (layout `_run/` + glossário de status PT) **sem perder histórico, sem destruir nada e sem aplicar nada sem o "ok" humano**.
>
> Esta skill roda no **projeto host** (onde o framework está instalado). Se for invocada no próprio repo do framework `adi_agent_spec` (sem `docs/specs/features/**`), informe que não há specs a migrar e encerre.

---

## Princípios invioláveis

1. **Dry-run primeiro, sempre.** A primeira coisa que você roda é a avaliação (`migrate.py` sem `--apply`). Nada é escrito antes do relatório + confirmação.
2. **Confirmação humana antes de aplicar.** Apresente o que vai mudar (relocações + reescritas) e só execute após o usuário aprovar.
3. **Preserve histórico.** As relocações usam `git mv`. Recomende working tree limpo/commitado antes de aplicar (reverter = `git checkout`).
4. **Idempotente e não-destrutivo.** Rodar 2× não duplica nem quebra; o que já está em `_run/` é pulado. Spec autorada nunca é apagada.
5. **Respeite as fronteiras.** O glossário só é reescrito nos **artefatos gerados**; specs autoradas recebem só correção de path. `status:`/`risk:`/`reasoning_effort` nunca viram PT (ver `references/migration-rules.md` §4).
6. **Token-efficient.** Deixe o script fazer o trabalho mecânico (relocação + reescrita). Você orquestra, apresenta e **verifica** — não edita arquivo por arquivo à mão.

---

## Saída desta skill

As features existentes em `docs/specs/features/**` migradas para o novo processo: artefatos gerados em `{version}/_run/`, glossário PT nos relatórios, refs de path atualizadas — tudo staged no git para revisão. Mais um **resumo** do que mudou por feature.

---

## Fluxo

### Fase 0 — Localizar o host e descobrir features

1. Confirme que está no projeto host e que existe `docs/specs/features/`. Se não existir (ex.: rodando no próprio framework), informe "nenhuma spec a migrar" e **encerre**.
2. Recomende que o working tree esteja **limpo/commitado** antes de aplicar (`git status`). Se houver mudanças não commitadas, avise que o `--apply` vai misturá-las no staging e ofereça seguir mesmo assim ou parar.
3. Leia `references/migration-rules.md` — é a especificação canônica do que migra e do que NÃO se toca.

### Fase 1 — Avaliação (DRY-RUN)

Rode o motor em modo relatório:

```bash
python3 .claude/skills/agent-spec-migrate-specs/assets/migrate.py --root .
```

O script lista, por feature/version: relocações (`mv old → new`), arquivos a reescrever (`edit ...`) e pulos (`skip ...` — já migrado / destino existe). Apresente ao usuário um **resumo legível**: quantas features no formato antigo, o que será movido, onde o glossário será reescrito, e o que já está no novo processo.

> Se o relatório vier vazio ("Tudo já no novo processo"), informe e encerre — não há o que migrar.

### Fase 2 — Confirmação

Apresente o plano e pergunte (via `AskUserQuestion`): **aplicar em todas**, **escolher features específicas**, ou **cancelar**. Nada é escrito até aqui.

### Fase 3 — Execução

Após o "ok", aplique:

```bash
# todas as features:
python3 .claude/skills/agent-spec-migrate-specs/assets/migrate.py --root . --apply

# ou uma feature/version específica:
python3 .claude/skills/agent-spec-migrate-specs/assets/migrate.py --feature docs/specs/features/<feature>/<version> --apply
```

O script faz `git mv` das relocações + reescreve conteúdo (glossário nos gerados, refs de path em todos). Captura o stdout para o relatório final.

### Fase 4 — Verificação + relatório

1. **Confirme que não sobrou layout antigo** nas features migradas:
   ```bash
   find docs/specs/features -maxdepth 3 \( -name 'qa-observations.md' -o -name '.workflow-report.md' -o -name '*_state.yaml' -o -path '*/tasks/.tmp' \) -not -path '*/_run/*'
   ```
   (vazio = ok). E que o glossário EN não sobrou nos relatórios: `grep -rIn -E '✅ (approved|rejected|partial)|`+"`"+`(approved|rejected|critical|high|medium|low)`+"`"+`' docs/specs/features/*/*/_run/` (vazio = ok).
2. **Verifique o `git status`** — tudo deve estar staged (renames detectados como `R`).
3. Entregue um **resumo**: N features migradas, M relocações, K arquivos reescritos, e o lembrete: **revise o diff e committe** (`git diff --staged`). A skill **não committa** — a decisão é do usuário.

---

## Notas

- **Back-compat continua valendo**: features que o usuário escolher NÃO migrar seguem funcionando (resume/debt-resolution caem no layout plano antigo — ver `agent-spec-workflow-rules.md` → callout "Pasta `_run/`"). A migração é uma limpeza opcional, não um pré-requisito.
- **Re-rodar é seguro**: a skill é idempotente. Útil para migrar features novas que surgiram depois, ou pegar resíduo de glossário.
- **Companion de doc**: ao adicionar/alterar esta skill no framework, gere a página da Referência via `/agent-spec-docs-sync`.
