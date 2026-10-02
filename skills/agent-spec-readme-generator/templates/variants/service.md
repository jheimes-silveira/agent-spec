# {{PROJECT_NAME}}

> {{ONE_LINE_DESCRIPTION}}
<!-- Uma frase. O que o serviço expõe + para quem consome. Sem jargão de marketing. -->

{{BADGES}}
<!-- Para serviços, priorize: build/CI, cobertura, licença. Snippets em reference/badges.md. -->

## Sobre
<!-- 1–2 parágrafos: o que o serviço faz, o que expõe (API REST/gRPC/fila) e por que existe. -->
{{WHY_PARAGRAPH}}

## Arquitetura
<!-- [OPCIONAL] Diagrama curto ou bullets dos componentes (DB, cache, filas, dependências externas). -->
{{ARCHITECTURE_OR_DIAGRAM}}

## Pré-requisitos
<!-- Runtime, banco, ferramentas. Ex.: Docker, Go >= 1.22, Postgres 15. -->
- {{PREREQ_1}}

## Como subir
```bash
{{INSTALL_COMMANDS}}
```
<!-- Forma REAL de subir localmente: docker compose up / make run. Extrair de docker-compose.yml / Makefile. -->

## Configuração
<!-- Variáveis de ambiente obrigatórias e opcionais. Tabela. Nunca vazar segredos — use placeholders. -->
| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| {{OPT}} | {{REQUIRED}} | {{DEFAULT}} | {{DESC}} |

## Endpoints / API
<!-- Resumo dos principais endpoints OU link para OpenAPI/Swagger/Postman. Não duplicar a spec inteira. -->
{{API_OR_LINK}}

## Testes
<!-- [OPCIONAL] Como rodar a suíte. Comando real. -->
```bash
{{TEST_COMMAND}}
```

## Contribuindo
<!-- Como rodar local + testar + abrir PR. Ou link para CONTRIBUTING.md. -->
{{CONTRIBUTING_OR_LINK}}

## Licença
{{LICENSE_NAME}} — ver [LICENSE]({{LICENSE_PATH}}).
