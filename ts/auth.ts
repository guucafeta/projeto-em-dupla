import { registrarUsuario, loginUsuario } from './api';

document.addEventListener('DOMContentLoaded', () => {
  const formRegistro = document.getElementById('form-registro') as HTMLFormElement | null;
  const formLogin = document.getElementById('form-login') as HTMLFormElement | null;
  const msgBox = document.getElementById('mensagem-status') as HTMLDivElement | null;

  function exibirMensagem(texto: string, sucesso: boolean = false) {
    if (!msgBox) return;
    msgBox.textContent = texto;
    msgBox.style.color = sucesso ? 'green' : 'red';
  }

  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = (document.getElementById('reg-nome') as HTMLInputElement).value;
      const email = (document.getElementById('reg-email') as HTMLInputElement).value;
      const cpf = (document.getElementById('reg-cpf') as HTMLInputElement).value;
      const senha = (document.getElementById('reg-senha') as HTMLInputElement).value;

      try {
        const res = await registrarUsuario({ nome, email, cpf, senha });
        if (res.erro) {
          exibirMensagem(res.erro, false);
        } else {
          exibirMensagem(res.mensagem || 'Conta criada com sucesso!', true);
          formRegistro.reset();
        }
      } catch (err) {
        exibirMensagem('Erro de conexão com o servidor.', false);
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement).value;
      const senha = (document.getElementById('login-senha') as HTMLInputElement).value;

      try {
        const res = await loginUsuario({ email, senha });
        if (res.erro) {
          exibirMensagem(res.erro, false);
        } else {
          exibirMensagem('Login realizado com sucesso! Redirecionando...', true);
          setTimeout(() => {
            window.location.href = '/admin/pages/dashboard.html';
          }, 1000);
        }
      } catch (err) {
        exibirMensagem('Erro de conexão com o servidor.', false);
      }
    });
  }
});