# Board Point — Guia do projeto

Loja online de skate com três partes, todas no mesmo site:

1. **Loja** — vitrine com busca, filtro por categoria, carrinho e checkout por PIX.
2. **Área do cliente** — cadastro (com CPF), login e edição do perfil.
3. **Painel admin** — dashboard e CRUDs de categorias, produtos (com foto), pedidos e mensagens de contato.

O front-end é uma SPA em **React + TypeScript (Vite)**. O back-end é uma API em **PHP 8.2** com **MariaDB**. Tudo roda com **Docker**.

---

## 1. Subir o projeto

Requisitos: Docker Engine + Docker Compose v2 (ou Docker Desktop).

```bash
cp .env.example .env
```

Edite o `.env` e preencha pelo menos:

| Variável | Para quê |
|---|---|
| `DB_PASS`, `DB_ROOT_PASS` | Senhas do banco (escolha qualquer uma) |
| `JWT_SECRET` | **Obrigatória.** Sem ela, todo login (cliente e admin) dá erro 500. Gere uma com `openssl rand -hex 32` |
| `PIX_CHAVE` | Chave PIX do checkout. Sem ela, o checkout responde "PIX indisponível" |
| `GEMINI_API_KEY` | Opcional. Sugestão de senha no cadastro por IA; sem ela, a senha é gerada localmente |
| `HTTP_PORT` | Porta do site (padrão `8081`) |

Depois:

```bash
docker compose up --build -d
```

Na primeira subida, o MariaDB importa sozinho os scripts de `back/database/`.

## 2. Acessar

- **Loja:** `http://localhost:8081/`
- **Cliente:** `http://localhost:8081/cliente/login` e `/cliente/cadastro`
- **Painel admin:** `http://localhost:8081/admin/login`

### Login do admin (padrão de desenvolvimento)
- **E-mail:** `admin@boardpoint.com`
- **Senha:** `admin123`

Troque essa senha antes de publicar o site (veja "Trocar a senha do admin").

> Se uma tela antiga aparecer depois de atualizar, recarregue com **Ctrl + Shift + R** (limpa o cache do navegador).

---

## 3. Desenvolver o front-end

Com o Docker no ar (ele fornece a API e as fotos):

```bash
cd front/app
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite recarrega a tela a cada arquivo salvo e repassa `/admin/api`, `/produtos` e `/assets` para o Docker na porta 8081.

Outros comandos (dentro de `front/app`):

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes automatizados (Vitest) |
| `npm run typecheck` | Confere os tipos do TypeScript |
| `npm run lint` | Confere o código com ESLint |
| `npm run build` | Gera a versão de produção em `dist/` |

O container `frontend` usa uma imagem com o build pronto. Então, depois de mudar o front, reconstrua para ver a mudança na porta 8081:

```bash
docker compose up --build -d frontend
```

O back-end (`back/api`) entra no container por volume: mudanças no PHP valem na hora, sem reconstruir.

---

## 4. Como o Docker está montado

**Serviços:**
- `db` — MariaDB
- `backend` — PHP/Apache com a API (`back/api`)
- `frontend` — Nginx servindo o build do React, mais as fotos do site e dos produtos
- `nginx` — proxy reverso, o único com porta publicada. Manda `/admin/api/` para o `backend` e todo o resto para o `frontend`

**Redes:** `rede_frontend` (nginx ↔ frontend), `rede_backend` (nginx ↔ backend) e `rede_db` (backend ↔ db, marcada como `internal`, sem internet nem acesso do host).

**Volumes:** `db_data` guarda o banco e `uploads` guarda as fotos enviadas pelo admin.

### Testar a persistência

```bash
docker compose exec db mariadb -uroot -p boardpoint -e "SELECT COUNT(*) FROM produtos"
docker compose down                 # SEM -v
docker compose up -d
docker compose exec db mariadb -uroot -p boardpoint -e "SELECT COUNT(*) FROM produtos"
```

(Ele pede a `DB_ROOT_PASS` do seu `.env`.) O número deve ser o mesmo nas duas vezes. Cuidado: `docker compose down -v` apaga os volumes, ou seja, o banco e as fotos.

---

## 5. O que dá para fazer no painel

- **Dashboard** — total de produtos e categorias, produtos com preço e sem estoque, faturamento potencial, preço médio, destaques, produtos por categoria e estoque crítico.
- **Categorias** — criar, editar (nome e slug) e excluir. Uma categoria com produtos não pode ser excluída.
- **Produtos** — criar, editar e excluir, com foto. Busca sem acento (digitar "tenis" acha "Tênis") e filtro por categoria. Preço vazio aparece como "Consulte o valor" na loja.
- **Pedidos** — criar pedido com vários itens, confirmar pagamento (abate o estoque), cancelar, editar dados do cliente e excluir.
- **Mensagens** — ver os contatos enviados pela loja, marcar como lida, editar e excluir.

Tudo o que muda no painel aparece na hora na loja, porque os dois usam o mesmo banco.

---

## 6. Trocar a senha do admin

1. Gere o hash da nova senha pelo próprio container do back-end:
   ```bash
   docker compose exec backend php -r "echo password_hash('SUA_NOVA_SENHA', PASSWORD_BCRYPT), PHP_EOL;"
   ```
2. Grave o hash no banco (troque `HASH_GERADO` pelo resultado acima). Mantenha as **aspas simples por fora**: o hash tem `$`, e com aspas duplas por fora o terminal estragaria o valor.
   ```bash
   docker compose exec db mariadb -uroot -p boardpoint -e 'UPDATE admins SET senha_hash = "HASH_GERADO" WHERE email = "admin@boardpoint.com"'
   ```

---

## 7. Estrutura do projeto

```
boardpoint/
├── docker-compose.yml        → os 4 serviços, redes e volumes
├── .env.example              → modelo das variáveis (copie para .env, que não vai para o Git)
├── docker/nginx/             → config do proxy reverso
├── AGENTS.md                 → regras para agentes de IA (Claude Code)
├── .claude/skills/           → skills usadas pelos agentes
├── back/
│   ├── api/                  → API PHP (auth, clientes, categorias, produtos, pedidos, contato, dashboard...)
│   ├── database/             → scripts SQL importados na primeira subida
│   └── docker/               → Dockerfile do back-end
└── front/
    ├── app/                  → SPA React (código-fonte)
    │   ├── Dockerfile        → build com Node + Nginx servindo o resultado
    │   ├── docker/           → config do Nginx do front
    │   └── src/
    │       ├── paginas/      → telas da loja e do cliente (paginas/admin: telas do painel)
    │       ├── componentes/  → peças de tela (loja, conta, admin)
    │       ├── hooks/        → lógica reaproveitável de React
    │       ├── dominio/      → regras, serviços, validações e acesso à API (sem React)
    │       ├── infra/        → instâncias únicas dos serviços
    │       └── estilos/      → CSS
    ├── assets/               → fotos e vídeo do site
    └── produtos/             → fotos dos produtos (uploads/: fotos enviadas pelo admin)
```

---

## Se algo der errado

- **Login dá erro (cliente ou admin)** → confira se o `JWT_SECRET` está preenchido no `.env` e rode `docker compose up -d` de novo.
- **"Falha na conexão com o banco de dados"** → veja se o `db` subiu: `docker compose ps` e `docker compose logs db`.
- **Tela antiga ou "Página não encontrada" depois de atualizar** → recarregue com **Ctrl + Shift + R**.
- **Mudei o front e nada mudou na porta 8081** → reconstrua: `docker compose up --build -d frontend`.
- **Foto não aparece depois de trocar no admin** → as fotos novas ficam no volume `uploads`; veja se o upload deu certo pelo aviso no canto da tela.
- **Quero começar o banco do zero** → `docker compose down -v` e `docker compose up -d`. Isso apaga todos os dados e fotos enviadas.
