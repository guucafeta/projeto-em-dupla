name: revisar-seguranca-api
description: Revisa uma rota PHP do BoardPoint antes do commit (SQL injection, autenticação, segredos, mensagens de erro).

Confira e liste o que falhar:
1. Alguma query concatena variável? Deve usar 'prepare' + 'execute'.
2. A rota de escrita chama exigirLogin()? O usuário editado vem do token?
3. PUT/DELETE de id inexistente devolve 404?
4. Há senha, chave ou token escrito no código ou no log? Tudo deve vir de 'configValor()'/'getenv()'.
5. A mensagem de erro vaza detalhes do banco ou o hash da senha?
6. Senha e CPF aparecem na resposta JSON? Não devem (senha nunca; CPF só na rota do próprio usuário).