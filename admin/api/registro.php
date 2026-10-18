<?php
header('Content-Type: application/json');

require_once __DIR__ . '/validacoes.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nome  = trim($input['nome'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$cpf   = preg_replace('/\D/', '', $input['cpf'] ?? '');
$senha = $input['senha'] ?? '';

if (empty($nome) || !validarEmail($email) || !validarCPF($cpf) || !validarSenha($senha)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados inválidos. Verifique nome, e-mail, CPF e requisitos de senha.']);
    exit;
}

try {
    $pdo = getConexao();

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? OR cpf = ?");
    $stmt->execute([$email, $cpf]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['erro' => 'E-mail ou CPF já cadastrado.']);
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, cpf, senha_hash) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nome, $email, $cpf, $senhaHash]);

    http_response_code(201);
    echo json_encode(['mensagem' => 'Usuário cadastrado com sucesso!']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno do servidor.']);
}