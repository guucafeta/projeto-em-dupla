import type { ClienteHttp, ConsultaProdutosCompleta, ConsultaProdutosFiltrada, FiltroProdutos, ProdutoDto, RespostaProdutos } from "../tipos/Tipos.js";
import { Produto } from "../entidades/Produto.js";
import { RepositorioApi } from "./RepositorioApi.js";

const POR_PAGINA = "100";
export class RepositorioProdutos extends RepositorioApi<ProdutoDto, Produto> implements ConsultaProdutosFiltrada, ConsultaProdutosCompleta {
  constructor(cliente: ClienteHttp) { super(cliente); }
  protected override converter(dto: ProdutoDto): Produto { return Produto.deDto(dto); }

  buscar(filtro: FiltroProdutos): Promise<Produto[]> {
    return this.#listarTudo(new URLSearchParams({ busca: filtro.busca, categoria: filtro.categoria }));
  }
  buscarTodos(): Promise<Produto[]> {
    return this.#listarTudo(new URLSearchParams({ categoria: "todos" }));
  }

  async #listarTudo(base: URLSearchParams): Promise<Produto[]> {
    const dtos: ProdutoDto[] = [];
    let pagina = 1;
    while (pagina < 1000) {
      const params = new URLSearchParams(base);
      params.set("recurso", "produtos");
      params.set("por_pagina", POR_PAGINA);
      params.set("pagina", String(pagina));
      const dados = await this.cliente.obter<RespostaProdutos>("catalogo.php?" + params.toString());
      dtos.push(...dados.produtos);
      if (dtos.length >= dados.total || dados.produtos.length === 0) break;
      pagina += 1;
    }
    return this.converterLista(dtos);
  }
}
