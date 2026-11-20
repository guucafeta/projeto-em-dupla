# Correções do BoardPoint — onde colocar cada arquivo

Todos os caminhos são relativos à **raiz do projeto** (a pasta onde está o `docker-compose.yml`).
Copie respeitando as pastas e **substitua** quando o arquivo já existir.
Atenção: use as pastas `front/` e `back/` (são as que o Docker serve). As cópias antigas
`admin/`, `ts/`, `js/`, `css/` e `index.html` soltas na raiz NÃO são usadas pelo Docker.

## Depois de copiar
1. Não precisa reconstruir o Docker (`front/` e `back/api` são volumes). Se quiser recompilar o TypeScript: `tsc -p front/ts`
   (os `.js` já vão prontos neste pacote).
2. No navegador: `Ctrl + Shift + R` (limpa o cache) e entre em `http://localhost:8081/admin/login.html`.

## Back-end (PHP) — substituir em `back/api/`
| Arquivo | O que mudou |
|---|---|
| `back/api/clientes.php` | Login de cliente valida e-mail; removido `case 'GET:perfil'` duplicado |
| `back/api/config.php` | Removido o `error_log('DEBUG…')` |
| `back/api/contato.php` | **Novo:** POST (cadastrar) e PUT editando nome/e-mail/mensagem/lida |
| `back/api/pedidos.php` | **Novo:** POST (criar pedido pelo painel, com preço/estoque do banco) |

## Front-end — TypeScript (fontes) em `front/ts/`
| Arquivo | Ação |
|---|---|
| `front/ts/tipos/Tipos.ts` | Substituir (ganhou `excluir` e `enviarFormulario`) |
| `front/ts/repositorios/ClienteApi.ts` | Substituir |
| `front/ts/dashboard.ts` | Substituir (usa sidebar/login em TS) |
| `front/ts/admin/nucleo/` (pasta inteira, 12 arquivos) | **Nova pasta** (CRUD genérico, paginação, toast, sessão, sidebar…) |
| `front/ts/admin/paginaCategorias.ts`, `paginaCategoriaForm.ts` | Novos |
| `front/ts/admin/paginaProdutos.ts`, `paginaProdutoForm.ts` | Novos |
| `front/ts/admin/paginaPedidos.ts`, `paginaPedidoForm.ts` | Novos |
| `front/ts/admin/paginaContatos.ts`, `paginaContatoForm.ts` | Novos |

## Front-end — JavaScript compilado em `front/js/` (gerado pelo tsc)
| Arquivo | Ação |
|---|---|
| `front/js/tipos/Tipos.js`, `front/js/repositorios/ClienteApi.js`, `front/js/dashboard.js` | Substituir |
| `front/js/admin/nucleo/` (pasta inteira) | Nova pasta |
| `front/js/admin/pagina*.js` (8 arquivos) | Novos (não mexe no `paginaLoginAdmin.js`) |

## Front-end — páginas e estilo
| Arquivo | Ação |
|---|---|
| `front/admin/pages/categorias.html`, `produtos.html`, `pedidos.html`, `contatos.html`, `dashboard.html` | Substituir |
| `front/admin/pages/categoria-form.html`, `produto-form.html`, `pedido-form.html`, `contato-form.html` | Novos (telas separadas de cadastro/edição) |
| `front/admin/assets/css/admin-extras.css` | Novo |

## Agentes / IA
| Arquivo | Ação |
|---|---|
| `AGENTS.md` | Substituir (na raiz) |
| `.claude/settings.json` | Substituir |
| `.claude/skills/validacoes-br/SKILL.md` | Substituir |

## Apagar (depois de conferir que o painel funciona)
- `front/admin/assets/js/comum.js` e `front/admin/assets/js/template-sidebar.js` — nenhuma página usa mais (era o JavaScript escrito à mão).
- Cópias antigas na raiz: `admin/`, `ts/`, `js/`, `css/`, `index.html`, `assets/`, `produtos/` e `front/css/js/`
  (não são servidas pelo Docker e estão desatualizadas). Faça commit/backup antes de apagar.

## Segurança antes de entregar
- Troque a senha padrão do admin (`admin123`) e remova-a do `LEIA-ME.md` antigo da raiz.
- O login do painel usa **e-mail** (`admin@boardpoint.com`), não "usuário": atualize essa instrução.
- Não versione o `.env`.

## Como foi testado
- `tsc` sem erros (strict); PHP com `php -l` e testes reais (servidor PHP + SQLite de teste) das rotas novas de
  contatos e pedidos: criação, validações, 401/404/422, soma de itens repetidos e bloqueio de estoque.
- Telas em jsdom com API simulada: listagem, paginação, filtros, busca, excluir, formulários e proteção contra HTML injetado.
- **Não testado:** MariaDB real, Docker e upload de imagem pelo Nginx — confira no navegador.
