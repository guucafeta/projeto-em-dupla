# AGENTS.md

## Projeto
BoardPoint — loja online.
- Back-end: PHP 8.2 (PDO + MariaDB) em `back/api/`.
- Front-end: TypeScript em `front/ts/`, compilado para `front/js/` com `tsc -p front/ts`.
- Docker Compose com 4 serviços: `db`, `backend`, `frontend`, `nginx` (só o nginx expõe porta).

## Estrutura do front-end
- Páginas (um arquivo por tela): `front/ts/cliente/pagina*.ts` (loja) e `front/ts/admin/pagina*.ts` (painel).
- Componentes e serviços genéricos/reutilizáveis: `front/ts/ui/` (loja) e `front/ts/admin/nucleo/` (painel: `ServicoCrud`, `Paginacao`, `Toast`...).
- Domínio: `front/ts/entidades/`, `front/ts/repositorios/`, `front/ts/servicos/`, `front/ts/excecoes/`, `front/ts/tipos/`.
- Validações do cliente: `front/ts/cliente/validacoes.ts` (espelho de `back/api/validacoes.php`).

## Comandos
- Subir tudo: `docker compose up --build -d`
- Compilar TS: `tsc -p front/ts`
- Testar a API: `curl` em `http://localhost:8081/admin/api/...`

## Regras de código
- Nomes em português (variáveis, funções, tabelas).
- PHP: sempre PDO com prepared statements. Respostas só por `respostaSucesso`, `respostaErro` ou `respostaJson`.
- Toda rota de escrita chama `exigirLogin()` (JWT). Nunca use um id vindo do corpo da requisição para saber quem está logado.
- Nunca edite `front/js/` à mão (é gerado pelo `tsc`). Não escreva JavaScript puro novo: tudo em TypeScript, sem `any`.
- Validações (CPF, e-mail, senha) existem no back E no front. Mantenha as duas iguais.
- Listagens do admin são paginadas (`pagina`, `por_pagina`) e a resposta vem em `dados.itens`.
- Cadastro/edição ficam em telas separadas da listagem.

## Guardrails (limites do agente)
- NUNCA ler, abrir, imprimir, buscar (`cat`, `grep`, `head`, `less`...) ou citar `.env`, `.env.local`, `back/api/config_local.php` nem qualquer chave ou credencial. Só o `.env.example` pode ser lido.
- NUNCA colocar segredos no código, em commits, em logs ou em respostas. Use variáveis de ambiente.
- NUNCA rodar `docker compose down -v`, `DROP`, `TRUNCATE`, `rm -rf` ou `git push --force` sem pedir confirmação.
- Antes de mudanças grandes, descreva o plano e espere aprovação.
- Mudou o back-end? Mostre como testar com `curl`.

## Skills
`novo-crud-php`, `validacoes-br`, `revisar-seguranca-api` (pasta `.claude/skills/`).
