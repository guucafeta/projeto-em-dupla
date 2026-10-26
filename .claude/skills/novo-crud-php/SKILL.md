---
name: novo-crud-php
description: Orienta a criação de CRUDs completos e seguros nas APIs PHP do BoardPoint, usando PDO, JWT, validação, paginação e testes.
---

# Novo CRUD PHP

Use esta skill ao criar ou revisar um CRUD da API PHP do BoardPoint.

## 1. Antes de implementar

- Leia o AGENTS.md e siga a organização das APIs existentes.
- Identifique os campos obrigatórios, relacionamentos e regras da entidade.
- Não altere rotas públicas existentes para exigir autenticação sem necessidade.

## 2. Banco de dados e PDO

- Use PDO com prepared statements, sempre através de prepare e execute.
- Nunca concatene valores recebidos da requisição diretamente na query.
- Preserve os relacionamentos e restrições do banco.
- Paginação deve usar LIMIT e OFFSET com valores inteiros validados.

## 3. Rotas do CRUD

Implemente, conforme o padrão do projeto:

- Listagem com parâmetros pagina e por_pagina.
- Resposta da listagem com os registros e os metadados de paginação.
- Consulta de um registro por ID.
- Cadastro com validação dos campos obrigatórios.
- Edição com validação e verificação prévia de existência.
- Exclusão com verificação prévia de existência.
- Retorne 404 ao editar, consultar ou excluir um ID inexistente.

Nos CRUDs administrativos, proteja todas as rotas com exigirLogin().
Toda rota de escrita deve exigir autenticação JWT.
Nunca use um ID enviado no corpo da requisição para identificar o usuário logado.

## 4. Respostas e erros

- Use somente respostaSucesso, respostaErro ou respostaJson, conforme o padrão do projeto.
- Use os códigos HTTP adequados: 200, 201, 400, 401, 404 e 409.
- Não exponha SQL, stack trace, hash de senha, tokens ou credenciais nas respostas.
- Não registre segredos em logs.

## 5. Configuração e segurança

- Leia configurações somente pelas funções e variáveis de ambiente existentes.
- Não abra, copie ou imprima .env ou config_local.php.
- Não grave senhas, chaves ou tokens diretamente no código.

## 6. Testes obrigatórios

Antes de finalizar, mostre como testar com curl:

- Acesso sem autenticação em rota protegida, que deve retornar 401.
- Listagem com paginação.
- Cadastro válido e cadastro com campos inválidos.
- Consulta, edição e exclusão de ID inexistente, que devem retornar 404.
- Edição e exclusão de um registro válido.