name: validacoes-br
description: Regras de validação de CPF, e-mail e nível de senha, iguais no PHP e no TypeScript.

CPF: 11 dígitos, rejeitar sequências iguais (111.111.111-11), conferir os 2 dígitos verificadores. Guardar só dígitos.
E-mail: regex ^[^\s@]+@[^\s@]+\.[^\s@]{2,}$; salvar em minúsculas.
Senha: mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
PHP em 'admin/api/validacoes.php'; TS em 'ts/app/validadores/validadores.ts'. Altere os dois juntos.