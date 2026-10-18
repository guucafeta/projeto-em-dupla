import { registrarUsuario, loginUsuario } from "./api.js";
document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("form-registro");
    const formLogin = document.getElementById("form-login");
    const msgBox = document.getElementById("mensagem-status");
    function exibirMensagem(texto, sucesso = false) {
        if (!msgBox)
            return;
        msgBox.textContent = texto;
        msgBox.style.color = sucesso ? "green" : "red";
    }
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nome = document.getElementById("reg-nome")
                .value;
            const email = document.getElementById("reg-email")
                .value;
            const cpf = document.getElementById("reg-cpf")
                .value;
            const senha = document.getElementById("reg-senha")
                .value;
            try {
                const res = await registrarUsuario({ nome, email, cpf, senha });
                if (res.erro) {
                    exibirMensagem(res.erro, false);
                }
                else {
                    exibirMensagem(res.mensagem || "Conta criada com sucesso!", true);
                    formRegistro.reset();
                }
            }
            catch (err) {
                exibirMensagem("Erro de conexão com o servidor.", false);
            }
        });
    }
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email")
                .value;
            const senha = document.getElementById("login-senha")
                .value;
            try {
                const res = await loginUsuario({ email, senha });
                if (res.erro) {
                    exibirMensagem(res.erro, false);
                }
                else {
                    exibirMensagem("Login realizado com sucesso! Redirecionando...", true);
                    setTimeout(() => {
                       window.location.href = "pages/dashboard.html";
                    }, 1000);
                }
            }
            catch (err) {
                exibirMensagem("Erro de conexão com o servidor.", false);
            }
        });
    }
});
