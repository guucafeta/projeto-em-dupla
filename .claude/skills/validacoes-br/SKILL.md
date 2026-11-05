---
name: validacoes-br
description: Regras de validação de CPF, e-mail e nível de senha, iguais no PHP e no TypeScript.
---

# Validações brasileiras (PHP e TypeScript iguais)

Use esta skill ao criar ou alterar validação de CPF, e-mail ou senha.

## Regras
- **CPF:** 11 dígitos; rejeitar sequências iguais (`111.111.111-11`); conferir os 2 dígitos verificadores
  (1º: pesos 10..2 nos 9 primeiros; 2º: pesos 11..2 nos 10 primeiros; `((soma * 10) % 11) % 10`). Guardar só dígitos (`CHAR(11)`).
- **E-mail:** regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, no máximo 150 caracteres; salvar em minúsculas.
- **Senha:** mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo. Nunca devolver a senha nem o hash nas respostas.

## Onde ficam (altere os dois juntos)
- PHP: `back/api/validacoes.php` (`validarCPF`, `validarEmail`, `validarSenha`).
- TypeScript: `front/ts/cliente/validacoes.ts` (`validarCpf`, `validarEmail`, `validarSenha`).

## Conferência obrigatória
Teste ao menos: `529.982.247-25` (válido), `529.982.247-24` (dígito errado), `111.111.111-11` (repetido) e `123` (curto).
