# Snippets de badges (shields.io)

Cole apenas os badges que correspondem ao que o repo **realmente** tem. Badge que aponta para um pipeline/registry inexistente é pior que nenhum badge — quebra a confiança no resto do README. Substitua `OWNER`, `REPO`, `PACOTE` etc. pelos valores reais extraídos do repo. Se nenhum se aplica, remova o placeholder `{{BADGES}}` inteiro.

Todos os badges seguem o padrão markdown `[![alt](img)](link)` — o clique leva ao recurso real (pipeline, página do pacote, arquivo de licença).

## Build / CI

GitHub Actions (descobrir o nome do workflow em `.github/workflows/*.yml`):
```markdown
[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
```

## Versão no registry

npm:
```markdown
[![npm](https://img.shields.io/npm/v/PACOTE)](https://www.npmjs.com/package/PACOTE)
```
PyPI:
```markdown
[![PyPI](https://img.shields.io/pypi/v/PACOTE)](https://pypi.org/project/PACOTE/)
```
pub.dev (Dart/Flutter):
```markdown
[![pub](https://img.shields.io/pub/v/PACOTE)](https://pub.dev/packages/PACOTE)
```
Go module:
```markdown
[![Go Reference](https://pkg.go.dev/badge/github.com/OWNER/REPO.svg)](https://pkg.go.dev/github.com/OWNER/REPO)
```
crates.io (Rust):
```markdown
[![crates.io](https://img.shields.io/crates/v/PACOTE)](https://crates.io/crates/PACOTE)
```

## Cobertura

Codecov:
```markdown
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/OWNER/REPO)
```

## Licença

Lê a licença real do arquivo LICENSE / campo `license` do manifest:
```markdown
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
```

## Outros úteis (use com parcimônia)

```markdown
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Downloads](https://img.shields.io/npm/dm/PACOTE)](https://www.npmjs.com/package/PACOTE)
```

> Regra de ouro: 3–5 badges no máximo. Uma fileira que importa (build + versão + licença) vale mais que dez badges decorativos.
