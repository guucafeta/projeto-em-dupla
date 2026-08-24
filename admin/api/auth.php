<?php
// Login/logout do admin: senha comparada com password_verify() (nunca em
// texto puro) e a sessão é renovada (session_regenerate_id) a cada login
// para evitar fixação de sessão.
require_once __DIR__ . '/config.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$acao = $_GET['acao'] ?? '';

switch ("$metodo:$acao") {

    case 'POST:login':
        $dados = corpoJson();
        $usuario = trim($dados['usuario'] ?? '');
        $senha = $dados['senha'] ?? '';

        if ($usuario === '' || $senha === '') {
            respostaErro('Informe usuário e senha.', 422);
        }

        $pdo = getConexao();
        $stmt = $pdo->prepare('SELECT id, usuario, senha_hash FROM admins WHERE usuario = ?');
        $stmt->execute([$usuario]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($senha, $admin['senha_hash'])) {
            respostaErro('Usuário ou senha inválidos.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_usuario'] = $admin['usuario'];

        respostaSucesso(['usuario' => $admin['usuario']], 'Login realizado com sucesso.');
        break;

    case 'POST:logout':
        $_SESSION = [];
        session_destroy();
        respostaSucesso(null, 'Sessão encerrada.');
        break;

    case 'GET:status':
        if (!empty($_SESSION['admin_id'])) {
            respostaSucesso(['autenticado' => true, 'usuario' => $_SESSION['admin_usuario']]);
        } else {
            respostaSucesso(['autenticado' => false]);
        }
        break;

    default:
        respostaErro('Ação inválida.', 404);
}
