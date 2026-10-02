# SCOPE -- MiniSpec (Backend)

> **Variante**: backend
> **Stack**: Go | Node | Python | Java | .NET | Outro

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

### 3.3 Endpoints / Rotas

| Método | Rota | Descrição | Auth | Status Codes |
|--------|------|-----------|------|--------------|
| -      | -    | -         | -    | -            |

#### 3.3.1 Exemplo de Payload por Endpoint (OBRIGATÓRIO para verbos PUT/PATCH/POST com multipart parcial)

> Para cada endpoint que aceita atualização parcial (`PUT`/`PATCH` cujo critério de aceite diga "campos opcionais", "atualização parcial", "qualquer campo pode estar ausente"), você DEVE registrar:
>
> 1. Exemplo de body/form **mínimo** (só com o campo mais comumente atualizado isoladamente).
> 2. Observação literal: "campos ausentes são ignorados; **sem `binding:"required"`** / **sem `@NotNull`** / **sem `validates_presence_of`** no Request — apenas o ID na URL é obrigatório".
> 3. Diferenciar do verbo `POST` correspondente — no `POST` os campos obrigatórios continuam obrigatórios; no `PUT`/`PATCH` parcial, **não**.

Exemplo (preencher com payload real):

```
PUT /<recurso>/v1/:id  (multipart parcial)

Caso A — atualiza só o nome:
  Content-Type: multipart/form-data
  nome=Novo Nome

Caso B — substitui só o anexo:
  Content-Type: multipart/form-data
  anexo=@arquivo.pdf

Regra: campos não enviados permanecem inalterados. Request struct: SEM binding/required.
```

> **Por que obrigatório**: o post-mortem `cadastro-pratos-franquia` (T9) gastou rodada extra porque o executor copiou `binding:"required"` do `POST` para o `PUT` e o QA não pegou (título de CT-010 dizia "só com nome" mas enviava 2 campos). Payload-exemplo explícito + observação anti-required no Request elimina a ambiguidade.

### 3.4 Banco de Dados

#### Tabelas

| Tabela | Colunas | Tipos | Constraints | Índices |
|--------|---------|-------|-------------|---------|
| -      | -       | -     | -           | -       |

#### Migrações

| Versão | Arquivo | Descrição |
|--------|---------|-----------|
| -      | -       | -         |

### 3.5 Services / Regras de Negócio

- [ ] Service / Regra A
- [ ] Service / Regra B

### 3.6 Integrações Externas (clientes / eventos)

| Integração | Tipo (REST/gRPC/Fila/SDK) | Direção (consumir/expor/ambos) | Auth |
|------------|---------------------------|--------------------------------|------|
| -          | -                         | -                              | -    |

### 3.7 Logs / Observabilidade (resumo)

- **Logs estruturados**: -
- **Métricas chave**: -
- **Tracing**: -
- **Alertas**: -

### 3.8 Feature Flags

| Flag | Propósito | Default |
|------|-----------|---------|
| -    | -         | -       |

### 3.9 Versionamento de API

- **Estratégia**: URL path | header | content-type | query param
- **Versão atual**: v1
- **Política de breaking changes**: -

### 3.10 Dependências de Pacotes

| Pacote | Versão | Motivo |
|--------|--------|--------|
| -      | -      | -      |

---

## 4. Critérios de Aceite (técnicos)
- [ ] Critério técnico A
- [ ] Critério técnico B

---

## 5. Observações
- Pontos de atenção
- Restrições técnicas
- Candidatos a ADR (sinalizar tag e motivo, não criar automaticamente)
