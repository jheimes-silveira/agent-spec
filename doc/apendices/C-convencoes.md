---
title: "Apêndice C — Convenções"
description: "Convenções de nomenclatura de feature, versão, variante, commits e identificadores em código."
---
# Apêndice C — Convenções

| Elemento | Convenção | Exemplo |
| --- | --- | --- |
| Nome da feature (`{feature}`) | kebab-case, minúsculas, sem acentos | `autenticacao-oauth2`, `cardapio-digital` |
| Versão (`{version}`) | `v1`, `v2`, … (incremental); `v{N}-debits` para cleanup | `v1`, `v2-debits` |
| Variante (`{variant}`) | `web`, `mobile`, `backend` — gravada em `state.yaml` e na §1 da spec; **NÃO entra no path** | `variant: backend` |
| Commits | Conventional Commits em pt-BR, sem rodapé de autoria de IA | `feat(auth): adiciona validação 2FA` |
| Identificadores em código | Em inglês (functions, variables, structs, packages) | `getUserByEmail`, não `obterUsuarioPorEmail` |

> A variante muda template e checklist da spec, mas o arquivo continua `scope.md`/`tech_spec.md` sem sufixo — só o `state.yaml` e a §1 registram a variante.

## 📚 Aprofundamento na Referência

* **[Paths canônicos (framework-paths)](../configuration/framework-paths.md)** — a fonte única de paths.
* **[Path templates](../configuration/path-templates.md)** — como `{feature}`/`{version}`/`{variant}` resolvem.
* **[/agent-spec-semantic-commit (skill)](../skills/shared/semantic-commit.md)** — a convenção de commits.
