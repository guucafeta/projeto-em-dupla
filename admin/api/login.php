<?php
header('Content-Type: application/json');

require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = strtolower(trim($input['email'] ?? ''));
$senha = $input['senha'] ?? '';

if (empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail e senha são obrigatórios.']);
    exit;
}

$host = getenv('DB_HOST') ?: 'db';
$db   = getenv('DB_NAME') ?: 'boardpoint';
$user = getenv('DB_USER') ?: 'boardpoint';
$pass = getenv('DB_PASS') ?: 'boardpoint_pass';
$jwtSecret = getenv('JWT_SECRET') ?: 'sua_chave_secreta_padrao';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $stmt = $pdo->prepare("SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
        http_response_code(401);
        echo json_encode(['erro' => 'Credenciais inválidas.']);
        exit;
    }

    $payload = [
        'sub' => $usuario['id'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email'],
        'iat' => time(),
        'exp' => time() + (3600 * 8) // Token válido por 8 horas
    ];k

    $token = gerarJWT($payload, $jwtSecret);

    http_response_code(200);
    echo json_encode([
        'mensagem' => 'Login realizado com sucesso',
        'token' => $token
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno do servidor.']);
}