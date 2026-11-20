# AGENTS.md

## Projeto
BoardPoint — loja online.
- Back-end: PHP 8.2 (PDO + MariaDB) em `back/api/`.
- Front-end: SPA em React 19 + TypeScript (Vite) em `front/app/`. Loja, área do cliente e painel admin ficam no mesmo app.
- Docker Compose com 4 serviços: `db`, `backend`, `frontend`, `nginx` (só o nginx expõe porta).

## Estrutura do front-end (`front/app/src/`)
- Telas: `paginas/` (loja e cliente) e `paginas/admin/` (painel). Uma tela por arquivo; rotas declaradas em `App.tsx`.
- Componentes: `componentes/loja/`, `componentes/conta/` e `componentes/admin/` (`LayoutAdmin`, `RotaProtegidaAdmin`, `ToastAdmin`, `Paginacao`).
- Hooks: `hooks/` (ex.: `useListagemPaginada`, `useSessao`, `useSessaoAdmin`).
- Domínio (sem React): `dominio/entidades/`, `dominio/repositorios/`, `dominio/servicos/`, `dominio/excecoes/`, `dominio/tipos/`, `dominio/utilitarios/`.
- Domínio do painel: `dominio/admin/` (`ServicoCrud` genérico, um serviço e um arquivo de validações por recurso).
- Composição (instâncias únicas): `infra/servicos.ts` (loja/cliente) e `infra/servicosAdmin.ts` (painel). O token do admin (`bp_admin_token`) é separado do token do cliente.
- Validações do cliente: `dominio/utilitarios/validacoesConta.ts` (espelho de `back/api/validacoes.php`).
- Estilos: `estilos/` (CSS puro, importado em `main.tsx`).

## Comandos
- Subir tudo: `docker compose up --build -d` (site em `http://localhost:8081`)
- Front em modo desenvolvimento (em `front/app/`, com o Docker no ar): `npm install` e `npm run dev` (`http://localhost:5173`)
- Checar o front (em `front/app/`): `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
- Testar a API: `curl` em `http://localhost:8081/admin/api/...`

## Regras de código
- Nomes em português (variáveis, funções, tabelas).
- PHP: sempre PDO com prepared statements. Respostas só por `respostaSucesso`, `respostaErro` ou `respostaJson`.
- Toda rota de escrita chama `exigirLogin()` (JWT). Nunca use um id vindo do corpo da requisição para saber quem está logado.
- Front: tudo em TypeScript `strict`, sem `any`. Componentes não chamam `fetch` direto: usam os serviços de `infra/`.
- Não crie `useState` + `setState` síncrono dentro de `useEffect` (o lint barra); siga o padrão de `useListagemPaginada`.
- Validações (CPF, e-mail, senha) existem no back E no front. Mantenha as duas iguais.
- Listagens do admin são paginadas (`pagina`, `por_pagina`) e a resposta vem em `dados.itens`.
- Cadastro/edição ficam em rotas separadas da listagem (`/admin/<recurso>/novo` e `/admin/<recurso>/:id/editar`).
- O build do Vite gera JS/CSS em `build-assets/`, porque `/assets/` é das fotos do site. Não mude `build.assetsDir`.

## Guardrails (limites do agente)
- NUNCA ler, abrir, imprimir, buscar (`cat`, `grep`, `head`, `less`...) ou citar `.env`, `.env.local`, `back/api/config_local.php` nem qualquer chave ou credencial. Só o `.env.example` pode ser lido.
- NUNCA colocar segredos no código, em commits, em logs ou em respostas. Use variáveis de ambiente.
- NUNCA rodar `docker compose down -v`, `DROP`, `TRUNCATE`, `rm -rf` ou `git push --force` sem pedir confirmação.
- Antes de mudanças grandes, descreva o plano e espere aprovação.
- Mudou o back-end? Mostre como testar com `curl`. Mudou o front? Rode `npm run build` e `npm test` em `front/app/`.

## Skills
`novo-crud-php`, `validacoes-br`, `revisar-seguranca-api` (pasta `.claude/skills/`).
