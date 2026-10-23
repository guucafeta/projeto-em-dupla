# BoardPoint — instalação e estrutura

O projeto é dividido em três repositórios:

- `guucafeta/projeto-em-dupla`: Docker Compose, Nginx, documentação e agentes.
- `xjoaovictor82/boardpoint-front`: site, painel e TypeScript.
- `xjoaovictor82/boardpoint-back`: API PHP e scripts MariaDB.

## Estrutura necessária

Monte esta árvore no computador:

```text
projeto-em-dupla/
├── docker-compose.yml
├── docker/
├── front/    # conteúdo de boardpoint-front
└── back/     # conteúdo de boardpoint-back
```

Exemplo com Git:

```bash
git clone https://github.com/xjoaovictor82/boardpoint-front.git front
git clone https://github.com/xjoaovictor82/boardpoint-back.git back
```

As pastas `front/` e `back/` ficam ignoradas no repositório principal porque são projetos independentes.

## Docker

1. Copie `.env.example` para `.env` e preencha as senhas, um `JWT_SECRET` aleatório com pelo menos 32 caracteres e os dados do PIX. Não envie esse arquivo ao Git.
2. Execute:

```bash
docker compose up --build -d
```

3. Acesse:
   - Loja: `http://localhost:8081/`
   - Conta do cliente: `http://localhost:8081/cliente/login.html`
   - Administração: `http://localhost:8081/admin/login.html`

Na primeira criação do volume, o MariaDB importa `boardpoint_completo.sql`, `002_usuarios.sql` e `003_login_admin_email.sql`. Se o banco já existia, importe manualmente a migração `003_login_admin_email.sql` para transformar o login administrativo inicial em `admin@boardpoint.local`. Use a senha administrativa inicial do projeto e troque-a depois do primeiro acesso.

Somente o Nginx publica porta. O volume `db_data` preserva o banco e `uploads` preserva as fotos enviadas.

## TypeScript

Os arquivos-fonte ficam em `front/ts/` e o navegador usa os arquivos gerados em `front/js/`.

```bash
cd front
tsc -p ts
```

Não edite os JavaScript gerados manualmente.

## XAMPP

1. Coloque o conteúdo de `boardpoint-front` em `htdocs/boardpoint/`.
2. Coloque o conteúdo de `boardpoint-back/api` em `htdocs/boardpoint/admin/api/`.
3. Importe os três scripts SQL na ordem: `boardpoint_completo.sql`, `002_usuarios.sql` e `003_login_admin_email.sql`.
4. Copie `config_local.example.php` para `config_local.php`, preencha banco, PIX e `JWT_SECRET`, e mantenha esse arquivo fora do Git.
5. Acesse `http://localhost/boardpoint/` pelo servidor Apache, nunca por duplo-clique no HTML.

## Testes básicos antes da entrega

- Login administrativo e de cliente por e-mail, incluindo tentativa inválida.
- Cadastro, login e edição do próprio cliente; e-mail deve permanecer bloqueado.
- Acesso aos CRUDs sem token deve retornar 401.
- Criar, listar, editar e excluir categorias, produtos, pedidos e contatos.
- IDs inexistentes devem retornar 404 e as quatro listagens devem ter paginação.
- Checkout PIX, upload de imagem e persistência após reiniciar os containers.
