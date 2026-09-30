# Board Point — Guia de instalação (site + painel admin)

Este projeto agora tem duas partes:

1. **Site público** (`index.html`) — a vitrine, igual antes, mas agora os produtos vêm do banco de dados em vez de um arquivo fixo.
2. **Painel administrativo** (`/admin`) — onde você loga e gerencia categorias e produtos (criar, editar, excluir, trocar foto).

Como agora existe banco de dados, **não dá mais pra abrir só com duplo-clique**. Precisa rodar via XAMPP.

---

## 1. Instalar

1. Baixe e instale o [XAMPP](https://www.apachefriends.org/) (Apache + PHP + MySQL).
2. Descompacte este zip e copie a pasta `boardpoint` inteira para dentro de:
   - Windows: `C:\xampp\htdocs\`
   - Mac: `/Applications/XAMPP/htdocs/`
3. Abra o **painel de controle do XAMPP** e inicie:
   - **Apache**
   - **MySQL**

## 2. Importar o banco de dados

O script `boardpoint_completo.sql` fica fora da pasta do site (não vai dentro de `htdocs/boardpoint`), já que ele só precisa ser executado uma vez, na instalação — o site nunca lê esse arquivo em produção.

1. No painel do XAMPP, clique em **Admin** ao lado do MySQL (abre o phpMyAdmin no navegador).
2. Clique em **Importar** no menu de cima.
3. Clique em **Escolher arquivo** e selecione o `boardpoint_completo.sql` que veio junto (fora da pasta `boardpoint`).
4. Clique em **Executar** lá embaixo.
5. Pronto — isso cria o banco `boardpoint` já com as tabelas, os 33 produtos originais, e o usuário de login do admin.

Se aparecer algum erro de "banco já existe", é porque você já importou antes — pode ignorar ou apagar o banco `boardpoint` no phpMyAdmin e importar de novo.

## 3. Acessar

- **Site público:** `http://localhost/boardpoint/`
- **Painel admin:** `http://localhost/boardpoint/admin/login.html`

### Login do admin (padrão)
- **Usuário:** `admin`
- **Senha:** `admin123`

**Troque essa senha depois de configurar tudo** — veja a seção "Trocar a senha do admin" mais abaixo.

---

## Rodando com Docker (alternativa ao XAMPP)

Requisitos: Docker Desktop (ou Docker Engine + Compose v2).

```bash
cp .env.example .env        # edite: senhas do banco e PIX_CHAVE
docker compose up --build -d
```

Acesse `http://localhost:8080` (site) e `http://localhost:8080/admin/login.html` (painel).
Na primeira subida o MariaDB importa `database/boardpoint_completo.sql` sozinho.

**Serviços:** `db` (MariaDB) · `backend` (PHP/Apache, API em `admin/api`) · `frontend` (estáticos) · `nginx` (proxy reverso, único com porta publicada).

**Redes:** `rede_frontend` (nginx ↔ frontend), `rede_backend` (nginx ↔ backend) e `rede_db` (backend ↔ db, marcada como `internal`, sem internet nem acesso do host).

**Volumes:** `db_data` guarda o banco e `uploads` guarda as fotos enviadas pelo admin.

### Testar a persistência

```bash
docker compose exec db mariadb -uroot -p"$DB_ROOT_PASS" boardpoint -e "SELECT COUNT(*) FROM produtos"
docker compose down                 # SEM -v
docker compose up -d
docker compose exec db mariadb -uroot -p"$DB_ROOT_PASS" boardpoint -e "SELECT COUNT(*) FROM produtos"
```

O número deve ser o mesmo. `docker compose down -v` apaga os volumes (banco e fotos).

### Chave PIX

- **Docker:** `PIX_CHAVE` no `.env`.
- **XAMPP:** copie `admin/api/config_local.example.php` para `config_local.php` e preencha (o arquivo não vai para o Git).

Sem chave configurada o checkout responde "PIX indisponível".

---

## O que dá pra fazer no painel

- **Dashboard** — números gerais: total de produtos, categorias, quantos têm preço definido, quantos estão sem estoque, e quantos produtos tem em cada categoria.
- **Categorias** — criar, editar (nome/slug) e excluir. Você não consegue excluir uma categoria que ainda tem produtos dentro — precisa mover ou excluir os produtos primeiro.
- **Produtos** — criar, editar e excluir. Tem busca (funciona sem acento, ex: digitar "tenis" acha "Tênis") e filtro por categoria. Ao criar/editar você escolhe a categoria, nome, preço (deixe vazio pra aparecer "Consulte o valor" no site), estoque e a foto.

Toda alteração feita no admin aparece na hora no site público, porque os dois usam o mesmo banco de dados.

---

## Trocar a senha do admin

O jeito mais simples é gerar um novo hash de senha e atualizar direto no phpMyAdmin:

1. Crie um arquivo temporário `gerar_senha.php` em qualquer lugar dentro de `htdocs` com este conteúdo:
   ```php
   <?php echo password_hash('SUA_NOVA_SENHA_AQUI', PASSWORD_BCRYPT);
   ```
2. Acesse `http://localhost/gerar_senha.php` no navegador — ele mostra um hash tipo `$2y$10$...`.
3. No phpMyAdmin, abra o banco `boardpoint` → tabela `admins` → edite a linha do usuário `admin` → cole o hash gerado no campo `senha_hash`.
4. Apague o arquivo `gerar_senha.php` depois de usar.

---

## Estrutura do projeto

```
boardpoint/
├── index.html               → site público (carrega js/main.js como módulo ES)
├── css/style.css
├── ts/                      → CÓDIGO-FONTE TypeScript (edite aqui)
│   ├── main.ts              → ponto de entrada do site (só liga as peças)
│   ├── dashboard.ts         → ponto de entrada do dashboard admin
│   ├── entidades/           → Produto, Categoria, Carrinho, ItemCarrinho (dados + regras)
│   ├── repositorios/        → acesso à API e ao localStorage
│   ├── servicos/            → carrinho, pedido, contato e métricas do dashboard
│   ├── ui/                  → modais, vitrine, filtros, painel (tudo que mexe no DOM)
│   ├── excecoes/            → erros próprios (ErroRede, ErroApi, ErroValidacao...)
│   ├── tipos/               → interfaces e type aliases
│   └── utilitarios/
├── js/                      → JavaScript GERADO por `tsc` (não edite; o navegador roda este)
├── produtos/                → fotos dos produtos originais + pasta uploads/ (fotos novas do admin)
└── admin/
    ├── login.html
    ├── pages/               → dashboard, produtos, categorias, pedidos, contatos
    ├── assets/              → CSS e JS do painel
    └── api/                 → PHP: config.php, config_loja.php, auth.php, categorias.php, produtos.php, pedidos.php, dashboard.php

docker-compose.yml           → 4 serviços (db, backend, frontend, nginx)
docker/                      → Dockerfile do backend e configs do Nginx
.env.example                 → modelo das variáveis (copie para .env)
```

### Recompilar o TypeScript

O `js/` já vem compilado. Só precisa recompilar se alterar algo em `ts/`:

```
npm install -g typescript
tsc -p ts
```

O código usa campos privados nativos (`#campo`, ES2022): funciona em navegadores de 2021 em diante.
As páginas carregam os scripts como módulos, então precisam ser abertas por um servidor
(XAMPP ou Docker), nunca clicando duas vezes no arquivo .html.

> O script `boardpoint_completo.sql` (criação do banco) é entregue separado, fora desta pasta — veja a seção "Importar o banco de dados" acima.

## Se algo der errado

- **"Falha na conexão com o banco de dados"** → confira se o MySQL está rodando no painel do XAMPP, e se o banco `boardpoint` foi importado.
- **Login não funciona** → confirme que importou o `boardpoint_completo.sql` (ele já cria o usuário `admin`/`admin123`). Se você mudou a senha e esqueceu, repita o passo "Trocar a senha do admin".
- **Imagem não aparece depois de trocar no admin** → o arquivo é salvo em `produtos/uploads/`; confira se essa pasta tem permissão de escrita (no XAMPP local normalmente já vem liberado).
- **Busca/filtro não funciona ao abrir com duplo clique no index.html** → isso é esperado, precisa acessar via `http://localhost/...` (servidor rodando), não abrindo o arquivo direto no navegador.
