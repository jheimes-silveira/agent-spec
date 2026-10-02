# Exemplos de mensagens de commit

## feat — nova funcionalidade

```
feat(handler): adiciona endpoint GET /products/:id
```

```
feat(auth): implementa login social via Google OAuth

Adiciona o fluxo OAuth 2.0 com Google. O usuário é redirecionado
para autenticação e retorna com token de sessão válido.

Closes #98
```

## fix — correção de bug

```
fix(auth): corrige expiração de token JWT em timezone UTC-3

O middleware comparava o tempo de expiração sem converter para UTC,
causando rejeição de tokens válidos durante horário de verão.

Closes #142
```

```
fix(order): corrige truncamento no cálculo de preço total

Variável `total` declarada como int em vez de float64 causava
perda de centavos em pedidos com valores decimais.
```

## refactor — reorganização sem mudança de comportamento

```
refactor(pkg): centraliza utilitários de string em pacote dedicado
```

```
refactor(db): extrai lógica de conexão para pacote interno

Move inicialização do pool de conexões de main.go para
internal/db/connect.go, sem alterar comportamento.
```

## breaking change — alteração de contrato

```
feat(api)!: renomeia campo `preco` para `valor` em todos os endpoints

BREAKING CHANGE: clientes que leem o campo `preco` devem migrar para
`valor`. Nenhuma mudança de comportamento além da renomeação.
```

```
feat(auth)!: remove suporte a autenticação básica HTTP

BREAKING CHANGE: endpoints que aceitavam Authorization: Basic foram
descontinuados. Use Authorization: Bearer com JWT.
```

## perf — melhoria de performance

```
perf(query): substitui consultas N+1 por JOIN em listagem de pedidos
```

## test — adição ou correção de testes

```
test(order): adiciona casos de teste para desconto acima de 100%
```

## docs — apenas documentação

```
docs(readme): adiciona seção de variáveis de ambiente obrigatórias
```

## chore — manutenção

```
chore(deps): atualiza go.mod para Go 1.22 e dependências diretas
```

## ci — pipeline

```
ci(github): adiciona job de lint no workflow de pull request
```

## revert — reversão

```
revert: reverte feat(auth): adiciona login social (abc1234)
```

## style — formatação

```
style: aplica gofmt em todos os arquivos do pacote internal
```
