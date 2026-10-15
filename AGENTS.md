# AGENTS.md
## Projeto
BoardPoint
Loja Board Point. Back-end PHP 8.2 (PDO + MariaDB) em 'admin/api/'.
Front-end TypeScript em 'ts/' (compila para 'js/' com 'tsc -p ts').
Docker Compose com 4 serviços: db, backend, frontend, nginx.

## Comandos
Subir tudo: 'docker compose up --build -d'
Compilar TS: 'tsc -p ts'
Testar a API: 'curl' em http://localhost:8080/admin/api/...

## Regras de código
Nomes em português (variáveis, funções, tabelas).
PHP: sempre PDO com prepared statements. Respostas só por 'respostaSucesso', 'respostaErro' ou 'respostaJson'.
Toda rota de escrita chama 'exigirLogin()' (JWT). Nunca use um id vindo do corpo da requisição para saber quem está logado.
Nunca edite 'js/' à mão (é gerado pelo 'tsc').
Componentes genéricos em 'ts/app/componentes/', páginas em 'ts/app/paginas/'.
Validações (CPF, e-mail, senha) existem no back E no front. Mantenha as duas iguais.

## Guardrails (limites do agente)
NUNCA ler, abrir, imprimir ou citar '.env', '.env.local', 'admin/api/config_local.php' nem qualquer chave ou credencial. Só o '.env.example' pode ser lido.
NUNCA colocar segredos no código, em commits, em logs ou em respostas. Use variáveis de ambiente.
NUNCA rodar 'docker compose down -v', 'DROP', 'TRUNCATE', 'rm -rf' ou 'git push --force' sem pedir confirmação.
Antes de mudanças grandes, descreva o plano e espere aprovação.
Mudou o back-end? Mostre como testar com 'curl'.

## Skills
'novo-crud-php', 'validacoes-br', 'revisar-seguranca-api' (pasta '.claude/skills/').