---
name: agent-spec-semantic-commit
description: >-
  Gera mensagens de commit em Português Brasileiro seguindo a especificação
  Conventional Commits, escolhendo o tipo correto (feat, fix, refactor, chore,
  docs, test, perf, etc.), definindo escopo e redigindo a linha de assunto no
  imperativo pt-BR dentro de 72 caracteres. Use sempre que o usuário quiser
  commitar mudanças, pedir uma mensagem de commit, mostrar um diff e querer
  registrar a alteração no git, ou perguntar como commitar algo que acabou de
  fazer — mesmo que não mencione explicitamente "semântico", "conventional
  commits" ou os tipos feat/fix/refactor. Acione também quando o usuário
  disser "commita isso", "como commito isso?", "gera o commit", "qual seria
  o commit?" ou simplesmente descrever o que mudou no código sem pedir nada
  formalmente.
---

# Semantic Commit pt-BR

Gera mensagens de commit padronizadas em Português Brasileiro usando a convenção [Conventional Commits](https://www.conventionalcommits.org/).

## Fluxo de trabalho

**1. Capturar o contexto**

Se o usuário não forneceu diff inline, rode:

```bash
git diff --staged          # mudanças em stage (prioridade)
git diff                   # fallback se stage vazio
git status --short         # visão geral dos arquivos afetados
```

Se ambos estiverem vazios, pergunte ao usuário o que ele quer commitar antes de continuar.

**2. Identificar tipo e escopo**

Analise o diff e escolha o tipo na tabela abaixo. O escopo vem do diretório ou pacote mais afetado (`auth`, `handler`, `db`, `config`). Omita o escopo se as mudanças tocarem muitas áreas sem um centro claro.

**3. Redigir a mensagem**

Siga o formato da próxima seção. Em caso de dúvida entre dois tipos, prefira o mais específico (`fix` > `refactor` quando um bug está sendo corrigido).

**4. Propor e confirmar**

Apresente a mensagem com formatação clara. Pergunte se o usuário quer:
- Aprovar e executar o commit agora
- Ajustar algo na mensagem
- Dividir em commits separados (quando o diff mistura responsabilidades distintas)

**5. Executar (se aprovado)**

```bash
git commit -m "tipo(escopo): descrição curta"
```

Para mensagens com corpo ou rodapé, use heredoc para evitar problemas de escaping:

```bash
git commit -m "$(cat <<'EOF'
tipo(escopo): descrição curta

Corpo explicando o porquê da mudança.

Closes #42
EOF
)"
```

---

## Tipos semânticos

| Tipo       | Quando usar                                                   | Escopo típico              |
| ---------- | ------------------------------------------------------------- | -------------------------- |
| `feat`     | Nova funcionalidade visível ao usuário ou consumidor da API   | `auth`, `pagamento`, `api` |
| `fix`      | Correção de bug                                               | `login`, `db`, `handler`   |
| `refactor` | Reorganização interna sem mudança de comportamento observável | `user`, `core`, `pkg`      |
| `perf`     | Melhoria de performance sem alterar comportamento             | `query`, `cache`           |
| `test`     | Adiciona ou corrige testes (sem mudar código de produção)     | `user_test`, `e2e`         |
| `docs`     | Apenas documentação (README, comentários, godoc, swagger)     | `readme`, `api`            |
| `style`    | Formatação, espaçamento, lint — zero lógica alterada          | `fmt`, `lint`              |
| `chore`    | Manutenção: deps, scripts de build, configs de ferramentas    | `deps`, `makefile`, `ci`   |
| `ci`       | Mudanças exclusivas em pipelines de CI/CD                     | `github`, `gitlab`         |
| `build`    | Sistema de build, Dockerfile, compilação                      | `docker`, `go`, `gradle`   |
| `revert`   | Reverte um commit anterior                                    | (tipo revertido ou hash)   |

---

## Formato oficial

```
<tipo>(<escopo>): <descrição curta>

[corpo — explica o quê e o porquê, não o como]

[rodapé: BREAKING CHANGE: <detalhe>]
[rodapé: Closes #<número>]
```

**Regras obrigatórias:**

- Linha de assunto: **máximo 72 caracteres**
- Verbo em **imperativo presente pt-BR**: "adiciona", "corrige", "remove", "atualiza" — nunca "adicionado", "corrigindo", "foi adicionado"
- **Letras minúsculas** em toda a linha de assunto; **sem ponto final**
- Escopo entre parênteses é opcional mas recomendado quando a mudança é localizada
- Breaking change: adicione `!` após tipo/escopo (`feat!:`) **e** `BREAKING CHANGE:` no rodapé
- Corpo e rodapé separados da linha de assunto por **uma linha em branco**
- Nomes de código na linha de assunto (funções, tipos, métodos em PascalCase ou camelCase) devem ser convertidos para minúsculas ou colocados entre backticks — nunca deixe maiúsculas na linha de assunto; ex.: `TotalPrice` → `totalprice` ou `` `TotalPrice` ``

---

## Exemplos

Consulte `references/exemplos.md` para exemplos completos cobrindo todos os tipos.
Os mais comuns:

```
feat(handler): adiciona endpoint GET /products/:id
fix(auth): corrige expiração de token JWT em timezone UTC-3
refactor(pkg): centraliza utilitários de string em pacote dedicado
feat(api)!: renomeia campo `preco` para `valor` em todos os endpoints
```

Se precisar de um exemplo para um tipo específico (breaking change com corpo, revert, ci, etc.), leia `references/exemplos.md`.

---

## Boas práticas

- **Um commit = uma responsabilidade.** Se o diff mistura uma nova feature com um fix em módulo diferente, proponha dois commits.
- **O corpo explica o porquê**, não o como. Omita-o quando a mudança é óbvia pelo assunto.
- **`chore` nunca é para bug fix.** Mesmo que pareça manutenção, se algo estava quebrado, é `fix`.
- **`style` é só formatação.** Se qualquer linha de lógica mudou, o tipo é outro.
- **Revert inclui referência.** Use: `revert: reverte feat(auth): adiciona login social (abc1234)`
- **Issues no rodapé.** Use `Closes #N` (fecha), `Fixes #N` (sinônimo) ou `Refs #N` (só referencia).

## Restrições

- Não faça `git add` automático — opere apenas sobre o que já está staged.
- Não use `--no-verify` nem `--amend` sem pedido explícito do usuário.
- Não faça push.
- **NUNCA** inclua `Co-Authored-By: Claude` (ou qualquer rodapé indicando autoria por IA) na mensagem de commit. Muitas empresas não aceitam atribuição de IA em commits — o commit deve sair como autoria exclusiva do usuário. Vale para linha de assunto, corpo e rodapé.
