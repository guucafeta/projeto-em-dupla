/** Componente reutilizável de paginação das telas administrativas. */
export class Paginacao {
  readonly #elemento: HTMLElement;
  readonly #porPagina: number;
  readonly #aoMudar: (pagina: number) => void;
  #pagina = 1;
  #total = 0;

  constructor(id: string, porPagina: number, aoMudar: (pagina: number) => void) {
    const elemento = document.getElementById(id);
    if (!elemento) throw new Error(`Elemento #${id} não encontrado.`);
    this.#elemento = elemento;
    this.#porPagina = porPagina;
    this.#aoMudar = aoMudar;
  }

  atualizar(total: number, pagina: number): void {
    this.#total = total;
    this.#pagina = pagina;
    this.#renderizar();
  }

  #renderizar(): void {
    const paginas = Math.max(1, Math.ceil(this.#total / this.#porPagina));
    this.#elemento.innerHTML = "";
    const anterior = this.#botao("← Anterior", this.#pagina <= 1, () => this.#aoMudar(this.#pagina - 1));
    const proxima = this.#botao("Próxima →", this.#pagina >= paginas, () => this.#aoMudar(this.#pagina + 1));
    const texto = document.createElement("span");
    texto.textContent = `Página ${this.#pagina} de ${paginas} — ${this.#total} registro(s)`;
    this.#elemento.append(anterior, texto, proxima);
  }

  #botao(texto: string, desabilitado: boolean, acao: () => void): HTMLButtonElement {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.disabled = desabilitado;
    botao.className = "botao-secundario";
    botao.addEventListener("click", acao);
    return botao;
  }
}
