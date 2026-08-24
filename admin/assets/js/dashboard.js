"use strict";
/* =========================================================================
   BOARD POINT — dashboard.ts
   Painel administrativo: busca os produtos BRUTOS da API (sem nenhuma
   agregação feita pelo banco) e calcula aqui, em TypeScript, os números
   e destaques exibidos na tela. Compilado para admin/assets/js/dashboard.js
   via `tsc` (ver ts/tsconfig.json).
   ========================================================================= */
// Limite abaixo do qual um produto é considerado "estoque crítico".
const LIMITE_ESTOQUE_CRITICO = 3;
(function () {
    "use strict";
    // -----------------------------------------------------------------
    // Busca o array BRUTO de produtos (200 é o máximo já usado no site
    // público — cobre todo o catálogo numa única chamada).
    // -----------------------------------------------------------------
    async function buscarTodosOsProdutos() {
        const resposta = (await apiFetch("produtos.php?por_pagina=200&categoria=todos"));
        if (!resposta.sucesso)
            return [];
        return resposta.dados.produtos;
    }
    // -----------------------------------------------------------------
    // Toda a lógica de negócio: nada disso vem pronto do banco, é
    // calculado aqui em cima do array bruto de produtos.
    // -----------------------------------------------------------------
    function calcularMetricas(produtos) {
        // FILTER — separa só os produtos com preço definido.
        const comPreco = produtos.filter((p) => p.preco !== null);
        // FILTER — separa os que estão zerados.
        const semEstoque = produtos.filter((p) => p.estoque === 0);
        // FILTER — estoque baixo (mas não zerado) = alerta de reposição.
        const estoqueCritico = produtos.filter((p) => p.estoque > 0 && p.estoque <= LIMITE_ESTOQUE_CRITICO);
        // REDUCE — soma preço × estoque de cada produto para estimar
        // quanto o estoque atual vale se tudo for vendido.
        const faturamentoPotencial = produtos.reduce((soma, p) => {
            if (p.preco === null)
                return soma;
            return soma + p.preco * p.estoque;
        }, 0);
        // REDUCE — média de preço só entre os produtos que têm preço.
        const precoMedio = comPreco.length === 0
            ? 0
            : comPreco.reduce((soma, p) => soma + p.preco, 0) / comPreco.length;
        // RANKING — produto com maior estoque, usando reduce como
        // acumulador de "maior valor visto até agora".
        const produtoComMaisEstoque = produtos.reduce((atual, p) => {
            if (!atual || p.estoque > atual.estoque)
                return p;
            return atual;
        }, null);
        // FREQUÊNCIA — conta quantos produtos existem por categoria usando
        // um objeto chave-valor (Record<string, number>), depois transforma
        // esse objeto de volta em lista com MAP para desenhar a tabela e
        // acha a categoria de maior frequência.
        const contagemPorCategoria = {};
        produtos.forEach((p) => {
            const chave = p.categoria_nome || "Outros";
            contagemPorCategoria[chave] = (contagemPorCategoria[chave] || 0) + 1;
        });
        const nomesCategorias = Object.keys(contagemPorCategoria);
        // MAP — transforma o objeto de contagem em array de linhas de tabela.
        const porCategoria = nomesCategorias
            .map((nome) => ({ nome, total_produtos: contagemPorCategoria[nome] }))
            .sort((a, b) => b.total_produtos - a.total_produtos);
        const categoriaComMaisProdutos = nomesCategorias.length === 0
            ? null
            : nomesCategorias.reduce((maior, atual) => contagemPorCategoria[atual] > contagemPorCategoria[maior] ? atual : maior);
        return {
            totalProdutos: produtos.length,
            totalCategorias: nomesCategorias.length,
            produtosComPreco: comPreco.length,
            produtosSemEstoque: semEstoque.length,
            faturamentoPotencial,
            precoMedio,
            produtosEstoqueCritico: estoqueCritico,
            produtoDestaque: produtoComMaisEstoque
                ? { nome: produtoComMaisEstoque.nome, estoque: produtoComMaisEstoque.estoque }
                : null,
            categoriaDestaque: categoriaComMaisProdutos
                ? { nome: categoriaComMaisProdutos, quantidade: contagemPorCategoria[categoriaComMaisProdutos] }
                : null,
            porCategoria,
        };
    }
    function formatarPreco(valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    // -----------------------------------------------------------------
    // Preenche a tela com os números calculados. Trata o caso de banco
    // vazio (edge case) mostrando mensagens no lugar de erro/NaN.
    // -----------------------------------------------------------------
    function renderizarDashboard(m) {
        const cards = document.querySelectorAll("#gradeStats .card-stat .valor");
        if (cards[0])
            cards[0].textContent = String(m.totalProdutos);
        if (cards[1])
            cards[1].textContent = String(m.totalCategorias);
        if (cards[2])
            cards[2].textContent = String(m.produtosComPreco);
        if (cards[3])
            cards[3].textContent = String(m.produtosSemEstoque);
        const faturamentoEl = document.getElementById("faturamentoPotencial");
        if (faturamentoEl)
            faturamentoEl.textContent = formatarPreco(m.faturamentoPotencial);
        const precoMedioEl = document.getElementById("precoMedio");
        if (precoMedioEl)
            precoMedioEl.textContent = formatarPreco(m.precoMedio);
        const destaqueEl = document.getElementById("produtoDestaque");
        if (destaqueEl) {
            destaqueEl.textContent = m.produtoDestaque
                ? `${m.produtoDestaque.nome} (${m.produtoDestaque.estoque} un.)`
                : "Nenhum produto cadastrado";
        }
        const categoriaDestaqueEl = document.getElementById("categoriaDestaque");
        if (categoriaDestaqueEl) {
            categoriaDestaqueEl.textContent = m.categoriaDestaque
                ? `${m.categoriaDestaque.nome} (${m.categoriaDestaque.quantidade} produtos)`
                : "Nenhuma categoria cadastrada";
        }
        // Tabela por categoria — edge case: banco limpo mostra mensagem, não tabela vazia.
        const corpo = document.getElementById("corpoCategorias");
        if (corpo) {
            if (m.porCategoria.length === 0) {
                corpo.innerHTML = '<tr><td colspan="2" class="estado-vazio">Nenhuma categoria cadastrada.</td></tr>';
            }
            else {
                corpo.innerHTML = m.porCategoria
                    .map((c) => `<tr><td>${c.nome}</td><td>${c.total_produtos}</td></tr>`)
                    .join("");
            }
        }
        // Lista de estoque crítico — edge case: lista vazia mostra mensagem elegante.
        const listaCritico = document.getElementById("listaEstoqueCritico");
        if (listaCritico) {
            if (m.produtosEstoqueCritico.length === 0) {
                listaCritico.innerHTML = '<li class="estado-vazio">Nenhum produto com estoque crítico.</li>';
            }
            else {
                listaCritico.innerHTML = m.produtosEstoqueCritico
                    .map((p) => `<li>${p.nome} — ${p.estoque} un.</li>`)
                    .join("");
            }
        }
    }
    function renderizarVazio() {
        const corpo = document.getElementById("corpoCategorias");
        if (corpo) {
            corpo.innerHTML = '<tr><td colspan="2" class="estado-vazio">Nenhum dado registrado.</td></tr>';
        }
    }
    // -----------------------------------------------------------------
    // Init — busca os produtos brutos, calcula as métricas e renderiza.
    // Se der erro de rede ou o banco estiver vazio, mostra mensagem
    // amigável em vez de deixar a tela quebrada.
    // -----------------------------------------------------------------
    async function iniciarDashboard() {
        try {
            const produtos = await buscarTodosOsProdutos();
            if (produtos.length === 0) {
                renderizarVazio();
                return;
            }
            const metricas = calcularMetricas(produtos);
            renderizarDashboard(metricas);
        }
        catch (e) {
            renderizarVazio();
        }
    }
    document.addEventListener("DOMContentLoaded", iniciarDashboard);
})();
