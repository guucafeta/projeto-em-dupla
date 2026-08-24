"use strict";
/* =========================================================================
   BOARD POINT — main.ts
   Versão TypeScript do script principal do site. Compilado para
   js/main.js via `tsc` (ver ts/tsconfig.json). O navegador só executa o
   .js gerado — este arquivo é o código-fonte tipado.

   Monta os filtros e a vitrine buscando produtos/categorias da API PHP
   (admin/api/), cuida da busca, do filtro por categoria, da animação de
   "aparecer ao rolar", do lightbox, do carrinho e do checkout com PIX.
   ========================================================================= */
(function () {
    "use strict";
    const API_BASE = "admin/api/";
    const grade = document.getElementById("grade");
    const contagem = document.getElementById("contagem");
    const filtrosEl = document.getElementById("filtros");
    const campoBusca = document.getElementById("campoBusca");
    const botaoLimpar = document.getElementById("botaoLimpar");
    const lightbox = document.getElementById("lightbox");
    const lightboxImagem = document.getElementById("lightboxImagem");
    const lightboxTag = document.getElementById("lightboxTag");
    const lightboxNome = document.getElementById("lightboxNome");
    const lightboxPreco = document.getElementById("lightboxPreco");
    const lightboxEstoque = document.getElementById("lightboxEstoque");
    const lightboxCompra = document.getElementById("lightboxCompra");
    const fecharLightbox = document.getElementById("fecharLightbox");
    const qtdMenos = document.getElementById("qtdMenos");
    const qtdMais = document.getElementById("qtdMais");
    const qtdValor = document.getElementById("qtdValor");
    const botaoAdicionarCarrinho = document.getElementById("botaoAdicionarCarrinho");
    let categorias = [];
    let categoriaAtiva = "todos";
    let termoBusca = "";
    let debounceBusca;
    let produtoAtualLightbox = null;
    let quantidadeAtualLightbox = 1;
    let carrinho = [];
    try {
        carrinho = JSON.parse(localStorage.getItem("bp_carrinho") || "[]");
    }
    catch (e) {
        carrinho = [];
    }
    function salvarCarrinho() {
        localStorage.setItem("bp_carrinho", JSON.stringify(carrinho));
        atualizarContadorCarrinho();
    }
    function formatarPreco(preco) {
        if (preco === null || preco === undefined)
            return null;
        return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    // ---------------------------------------------------------------------
    // Carregamento inicial: categorias
    // ---------------------------------------------------------------------
    async function carregarCategorias() {
        try {
            const resp = await fetch(API_BASE + "categorias.php");
            const data = (await resp.json());
            if (data.sucesso)
                categorias = data.dados;
        }
        catch (e) {
            // Site continua funcionando sem filtros se a API estiver fora do ar
            categorias = [];
        }
        montarFiltros();
    }
    function montarFiltros() {
        filtrosEl.innerHTML = "";
        categorias.forEach((cat) => {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "pilula";
            botao.textContent = cat.nome;
            botao.dataset.categoria = cat.slug;
            botao.setAttribute("role", "tab");
            botao.setAttribute("aria-selected", "false");
            botao.addEventListener("click", () => {
                const jaEstavaAtiva = botao.classList.contains("ativa");
                filtrosEl.querySelectorAll(".pilula").forEach((p) => {
                    p.classList.remove("ativa");
                    p.setAttribute("aria-selected", "false");
                });
                if (jaEstavaAtiva) {
                    categoriaAtiva = "todos";
                }
                else {
                    categoriaAtiva = cat.slug;
                    botao.classList.add("ativa");
                    botao.setAttribute("aria-selected", "true");
                }
                carregarProdutos();
            });
            filtrosEl.appendChild(botao);
        });
    }
    // ---------------------------------------------------------------------
    // Grade de produtos
    // ---------------------------------------------------------------------
    async function carregarProdutos() {
        grade.setAttribute("aria-busy", "true");
        const params = new URLSearchParams({
            busca: termoBusca,
            categoria: categoriaAtiva,
            por_pagina: "200",
        });
        try {
            const resp = await fetch(API_BASE + "produtos.php?" + params.toString());
            const data = (await resp.json());
            if (!data.sucesso) {
                renderizarErro();
                return;
            }
            renderizarGrade(data.dados.produtos);
        }
        catch (e) {
            renderizarErro();
        }
        finally {
            grade.removeAttribute("aria-busy");
        }
    }
    function renderizarErro() {
        grade.innerHTML = `
      <div class="vazio">
        <strong>Não foi possível carregar os produtos</strong>
        Tente recarregar a página em instantes.
      </div>`;
        contagem.textContent = "";
    }
    function ativarPreviewNaBarra(carrossel) {
        const preview = document.createElement("div");
        preview.className = "carrossel-preview";
        preview.innerHTML = '<img alt="">';
        carrossel.appendChild(preview);
        const previewImg = preview.querySelector("img");
        let escondendoTimeout;
        carrossel.querySelectorAll(".card").forEach((card) => {
            card.addEventListener("mouseenter", () => {
                clearTimeout(escondendoTimeout);
                const img = card.querySelector("img");
                if (!img)
                    return;
                previewImg.src = img.src;
                // Posiciona a miniatura alinhada horizontalmente com o card em
                // que o mouse está, dentro da largura visível do carrossel.
                const posicaoCard = card.offsetLeft - carrossel.scrollLeft;
                preview.style.left = posicaoCard + card.offsetWidth / 2 + "px";
                preview.classList.add("visivel");
            });
            card.addEventListener("mouseleave", () => {
                escondendoTimeout = setTimeout(() => {
                    preview.classList.remove("visivel");
                }, 80);
            });
        });
        // Some se o mouse sair do carrossel inteiro (evita ficar "grudado"
        // ao rolar rápido entre produtos).
        carrossel.addEventListener("scroll", () => {
            preview.classList.remove("visivel");
        });
    }
    // Margem de tolerância (px) pra considerar "chegou no fim" mesmo com
    // pequenas diferenças de arredondamento entre navegadores.
    const TOLERANCIA_FIM_SCROLL = 4;
    // Adiciona a setinha "tem mais produtos pro lado" em cima de um
    // carrossel (.grade__linha), dentro do seu .grade__grupo pai. Ela some
    // sozinha quando o conteúdo não passa da largura visível, e também
    // quando o usuário já rolou até o fim.
    function ativarIndicadorDeScroll(carrossel, grupo) {
        const seta = document.createElement("div");
        seta.className = "grade__seta";
        seta.setAttribute("aria-hidden", "true");
        seta.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';
        grupo.appendChild(seta);
        function atualizar() {
            const rolavel = carrossel.scrollWidth - carrossel.clientWidth > TOLERANCIA_FIM_SCROLL;
            const chegouNoFim = carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - TOLERANCIA_FIM_SCROLL;
            grupo.classList.toggle("sem-mais-conteudo", !rolavel || chegouNoFim);
        }
        carrossel.addEventListener("scroll", atualizar, { passive: true });
        window.addEventListener("resize", atualizar);
        // Estado inicial — espera o layout assentar (imagens carregando, etc.)
        atualizar();
        setTimeout(atualizar, 300);
    }
    function criarCard(produto, indice) {
        const card = document.createElement("article");
        card.className = "card";
        card.style.transitionDelay = (indice % 8) * 40 + "ms";
        const precoFormatado = formatarPreco(produto.preco);
        const semEstoque = produto.preco !== null && produto.estoque <= 0;
        card.innerHTML = `
      <div class="card__imagem">
        ${semEstoque ? '<span class="card__esgotado">Esgotado</span>' : ""}
        <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
      </div>
      <div class="card__info">
        <p class="card__nome">${produto.nome}</p>
        <p class="card__preco ${precoFormatado ? "" : "consulta"}">${precoFormatado || "Consulte o valor"}</p>
      </div>
    `;
        card.addEventListener("click", () => abrirLightbox(produto));
        return card;
    }
    function renderizarGrade(lista) {
        grade.innerHTML = "";
        contagem.textContent = lista.length === 1
            ? "1 produto"
            : lista.length + " produtos";
        if (lista.length === 0) {
            grade.innerHTML = `
        <div class="vazio">
          <strong>Nenhum produto encontrado</strong>
          Tente outro termo de busca ou escolha outra categoria.
        </div>`;
            return;
        }
        // Mesmo com um filtro de categoria específico ativo, mantém o carrossel
        // (mesmo comportamento da vitrine agrupada).
        if (categoriaAtiva !== "todos") {
            const grupo = document.createElement("div");
            grupo.className = "grade__grupo";
            const wrap = document.createElement("div");
            wrap.className = "grade__linha";
            lista.forEach((produto, indice) => {
                wrap.appendChild(criarCard(produto, indice));
            });
            grupo.appendChild(wrap);
            grade.appendChild(grupo);
            ativarPreviewNaBarra(wrap);
            ativarIndicadorDeScroll(wrap, grupo);
            observarCards();
            return;
        }
        // Sem filtro: agrupa os produtos por categoria, cada uma com seu título,
        // na mesma ordem em que as categorias aparecem nos filtros.
        const porCategoria = new Map();
        lista.forEach((produto) => {
            const chave = produto.categoria_nome || "Outros";
            if (!porCategoria.has(chave))
                porCategoria.set(chave, []);
            porCategoria.get(chave).push(produto);
        });
        let indiceGlobal = 0;
        porCategoria.forEach((produtosDaCategoria, nomeCategoria) => {
            const secao = document.createElement("section");
            secao.className = "grade__grupo";
            const titulo = document.createElement("h3");
            titulo.className = "grade__grupo-titulo";
            titulo.textContent = nomeCategoria;
            secao.appendChild(titulo);
            const linha = document.createElement("div");
            linha.className = "grade__linha";
            produtosDaCategoria.forEach((produto) => {
                linha.appendChild(criarCard(produto, indiceGlobal));
                indiceGlobal++;
            });
            secao.appendChild(linha);
            grade.appendChild(secao);
            ativarPreviewNaBarra(linha);
            ativarIndicadorDeScroll(linha, secao);
        });
        observarCards();
    }
    // ---------------------------------------------------------------------
    // Animação: produtos aparecem conforme rola a tela
    // ---------------------------------------------------------------------
    let observador;
    function observarCards() {
        if (!("IntersectionObserver" in window)) {
            grade.querySelectorAll(".card").forEach((c) => c.classList.add("em-vista"));
            return;
        }
        if (observador)
            observador.disconnect();
        observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("em-vista");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        grade.querySelectorAll(".card").forEach((c) => observador.observe(c));
    }
    // ---------------------------------------------------------------------
    // Busca (com debounce, já que agora cada busca é uma chamada à API)
    // ---------------------------------------------------------------------
    campoBusca.addEventListener("input", (e) => {
        termoBusca = e.target.value;
        botaoLimpar.classList.toggle("ativo", termoBusca.length > 0);
        clearTimeout(debounceBusca);
        debounceBusca = setTimeout(carregarProdutos, 300);
    });
    botaoLimpar.addEventListener("click", () => {
        termoBusca = "";
        campoBusca.value = "";
        botaoLimpar.classList.remove("ativo");
        campoBusca.focus();
        carregarProdutos();
    });
    // ---------------------------------------------------------------------
    // Lightbox
    // ---------------------------------------------------------------------
    function abrirLightbox(produto) {
        produtoAtualLightbox = produto;
        quantidadeAtualLightbox = 1;
        qtdValor.textContent = "1";
        lightboxImagem.src = produto.imagem;
        lightboxImagem.alt = produto.nome;
        lightboxTag.textContent = produto.categoria_nome;
        lightboxNome.textContent = produto.nome;
        lightboxPreco.textContent = formatarPreco(produto.preco) || "Consulte o valor";
        const semPreco = produto.preco === null || produto.preco === undefined;
        const semEstoque = produto.estoque <= 0;
        if (semPreco) {
            lightboxEstoque.textContent = "";
            lightboxCompra.style.display = "none";
        }
        else if (semEstoque) {
            lightboxEstoque.textContent = "Esgotado";
            lightboxEstoque.classList.add("esgotado");
            lightboxCompra.style.display = "flex";
            qtdMenos.disabled = true;
            qtdMais.disabled = true;
            botaoAdicionarCarrinho.disabled = true;
            botaoAdicionarCarrinho.textContent = "Esgotado";
        }
        else {
            lightboxEstoque.textContent = produto.estoque + " em estoque";
            lightboxEstoque.classList.remove("esgotado");
            lightboxCompra.style.display = "flex";
            qtdMenos.disabled = false;
            qtdMais.disabled = produto.estoque <= 1;
            botaoAdicionarCarrinho.disabled = false;
            botaoAdicionarCarrinho.textContent = "Adicionar ao carrinho";
        }
        lightbox.classList.add("aberto");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function fecharLightboxFn() {
        lightbox.classList.remove("aberto");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
    fecharLightbox.addEventListener("click", fecharLightboxFn);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox)
            fecharLightboxFn();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape")
            fecharLightboxFn();
    });
    // ---------------------------------------------------------------------
    // Carrinho
    // ---------------------------------------------------------------------
    const botaoCarrinho = document.getElementById("botaoCarrinho");
    const carrinhoContador = document.getElementById("carrinhoContador");
    const modalCarrinho = document.getElementById("modalCarrinho");
    const fundoModalCarrinho = document.getElementById("fundoModalCarrinho");
    const fecharModalCarrinhoBtn = document.getElementById("fecharModalCarrinho");
    const carrinhoItensEl = document.getElementById("carrinhoItens");
    const carrinhoRodapeEl = document.getElementById("carrinhoRodape");
    const carrinhoTotalEl = document.getElementById("carrinhoTotal");
    const botaoIrParaCheckout = document.getElementById("botaoIrParaCheckout");
    function atualizarContadorCarrinho() {
        // REDUCE — soma a quantidade de todos os itens para mostrar no ícone do carrinho.
        const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
        carrinhoContador.textContent = String(totalItens);
        carrinhoContador.style.display = totalItens > 0 ? "flex" : "none";
    }
    let timeoutToastCarrinho;
    function mostrarConfirmacaoAdicionado() {
        let toast = document.getElementById("toastCarrinho");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toastCarrinho";
            toast.className = "toast-carrinho";
            document.body.appendChild(toast);
        }
        toast.textContent = "Adicionado ao carrinho ✓";
        toast.classList.add("visivel");
        clearTimeout(timeoutToastCarrinho);
        timeoutToastCarrinho = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 2200);
    }
    function adicionarAoCarrinho(produto, quantidade) {
        const existente = carrinho.find((item) => item.produto_id === produto.id);
        const jaNoCarrinho = existente ? existente.quantidade : 0;
        const quantidadeFinal = Math.min(jaNoCarrinho + quantidade, produto.estoque);
        if (existente) {
            existente.quantidade = quantidadeFinal;
        }
        else {
            carrinho.push({
                produto_id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                estoque: produto.estoque,
                quantidade: quantidadeFinal,
            });
        }
        salvarCarrinho();
    }
    function removerDoCarrinho(produtoId) {
        // FILTER — reconstrói o carrinho sem o item removido.
        carrinho = carrinho.filter((item) => item.produto_id !== produtoId);
        salvarCarrinho();
        renderizarCarrinho();
    }
    function renderizarCarrinho() {
        if (carrinho.length === 0) {
            carrinhoItensEl.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
            carrinhoRodapeEl.style.display = "none";
            return;
        }
        carrinhoRodapeEl.style.display = "block";
        carrinhoItensEl.innerHTML = carrinho.map((item) => `
      <div class="item-carrinho">
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="item-carrinho__info">
          <p class="item-carrinho__nome">${item.nome}</p>
          <p class="item-carrinho__preco">${item.quantidade} × ${formatarPreco(item.preco)}</p>
        </div>
        <button type="button" class="item-carrinho__remover" data-id="${item.produto_id}" aria-label="Remover">✕</button>
      </div>
    `).join("");
        carrinhoItensEl.querySelectorAll(".item-carrinho__remover").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                removerDoCarrinho(id);
            });
        });
        // REDUCE — soma (preço × quantidade) de cada item para o total do carrinho.
        const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
        carrinhoTotalEl.textContent = formatarPreco(total) || "";
    }
    function abrirModalCarrinho() {
        renderizarCarrinho();
        modalCarrinho.classList.add("aberto");
        modalCarrinho.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function fecharModalCarrinhoFn() {
        modalCarrinho.classList.remove("aberto");
        modalCarrinho.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
    botaoCarrinho.addEventListener("click", abrirModalCarrinho);
    fundoModalCarrinho.addEventListener("click", fecharModalCarrinhoFn);
    fecharModalCarrinhoBtn.addEventListener("click", fecharModalCarrinhoFn);
    qtdMenos.addEventListener("click", () => {
        if (quantidadeAtualLightbox > 1) {
            quantidadeAtualLightbox--;
            qtdValor.textContent = String(quantidadeAtualLightbox);
            qtdMais.disabled = false;
        }
    });
    qtdMais.addEventListener("click", () => {
        if (produtoAtualLightbox && quantidadeAtualLightbox < produtoAtualLightbox.estoque) {
            quantidadeAtualLightbox++;
            qtdValor.textContent = String(quantidadeAtualLightbox);
            qtdMais.disabled = quantidadeAtualLightbox >= produtoAtualLightbox.estoque;
        }
    });
    botaoAdicionarCarrinho.addEventListener("click", () => {
        if (!produtoAtualLightbox)
            return;
        adicionarAoCarrinho(produtoAtualLightbox, quantidadeAtualLightbox);
        fecharLightboxFn();
        mostrarConfirmacaoAdicionado();
    });
    // ---------------------------------------------------------------------
    // Checkout / PIX
    // ---------------------------------------------------------------------
    const modalCheckout = document.getElementById("modalCheckout");
    const fundoModalCheckout = document.getElementById("fundoModalCheckout");
    const fecharModalCheckoutBtn = document.getElementById("fecharModalCheckout");
    const checkoutPasso1 = document.getElementById("checkoutPasso1");
    const checkoutPasso2 = document.getElementById("checkoutPasso2");
    const formCheckout = document.getElementById("formCheckout");
    const botaoGerarPix = document.getElementById("botaoGerarPix");
    const checkoutQrCode = document.getElementById("checkoutQrCode");
    const checkoutValorPix = document.getElementById("checkoutValorPix");
    const checkoutPixCopiaCola = document.getElementById("checkoutPixCopiaCola");
    const checkoutCodigoPedido = document.getElementById("checkoutCodigoPedido");
    const botaoCopiarPix = document.getElementById("botaoCopiarPix");
    const botaoFecharCheckout = document.getElementById("botaoFecharCheckout");
    function abrirModalCheckout() {
        checkoutPasso1.style.display = "block";
        checkoutPasso2.style.display = "none";
        formCheckout.reset();
        modalCheckout.classList.add("aberto");
        modalCheckout.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function fecharModalCheckoutFn() {
        modalCheckout.classList.remove("aberto");
        modalCheckout.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
    botaoIrParaCheckout.addEventListener("click", () => {
        fecharModalCarrinhoFn();
        abrirModalCheckout();
    });
    fundoModalCheckout.addEventListener("click", fecharModalCheckoutFn);
    fecharModalCheckoutBtn.addEventListener("click", fecharModalCheckoutFn);
    formCheckout.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("checkoutNome").value.trim();
        const telefone = document.getElementById("checkoutTelefone").value.trim();
        const email = document.getElementById("checkoutEmail").value.trim();
        botaoGerarPix.disabled = true;
        botaoGerarPix.textContent = "Gerando...";
        try {
            const resposta = await fetch(API_BASE + "pedidos.php?acao=criar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome, telefone, email,
                    itens: carrinho.map((item) => ({
                        produto_id: item.produto_id,
                        quantidade: item.quantidade,
                    })),
                }),
            });
            const dados = (await resposta.json());
            if (!resposta.ok || !dados.sucesso) {
                throw new Error(dados.erro || "Não foi possível criar o pedido.");
            }
            // Limpa o carrinho: o pedido já foi registrado no servidor.
            carrinho = [];
            salvarCarrinho();
            checkoutValorPix.textContent = formatarPreco(dados.dados.total) || "";
            checkoutPixCopiaCola.value = dados.dados.pix_payload;
            checkoutCodigoPedido.textContent = dados.dados.codigo;
            checkoutQrCode.innerHTML = "";
            if (typeof QRCode !== "undefined") {
                new QRCode(checkoutQrCode, {
                    text: dados.dados.pix_payload,
                    width: 220,
                    height: 220,
                    colorDark: "#0b0b0b",
                    colorLight: "#ffffff",
                });
            }
            checkoutPasso1.style.display = "none";
            checkoutPasso2.style.display = "block";
        }
        catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : "Não foi possível criar o pedido. Tente novamente.";
            alert(mensagem);
        }
        finally {
            botaoGerarPix.disabled = false;
            botaoGerarPix.textContent = "Gerar PIX";
        }
    });
    botaoCopiarPix.addEventListener("click", () => {
        checkoutPixCopiaCola.select();
        navigator.clipboard.writeText(checkoutPixCopiaCola.value).then(() => {
            botaoCopiarPix.textContent = "Copiado!";
            setTimeout(() => { botaoCopiarPix.textContent = "Copiar"; }, 2000);
        }).catch(() => {
            document.execCommand("copy");
        });
    });
    botaoFecharCheckout.addEventListener("click", fecharModalCheckoutFn);
    atualizarContadorCarrinho();
    // ---------------------------------------------------------------------
    // Modal de contato
    // ---------------------------------------------------------------------
    const botaoContato = document.getElementById("botaoContato");
    const modalContato = document.getElementById("modalContato");
    const fundoModalContato = document.getElementById("fundoModalContato");
    const fecharModalContato = document.getElementById("fecharModalContato");
    const formContato = document.getElementById("formContato");
    function abrirModalContato() {
        modalContato.classList.add("aberto");
        modalContato.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function fecharModalContatoFn() {
        modalContato.classList.remove("aberto");
        modalContato.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
    if (botaoContato) {
        botaoContato.addEventListener("click", abrirModalContato);
        fundoModalContato.addEventListener("click", fecharModalContatoFn);
        fecharModalContato.addEventListener("click", fecharModalContatoFn);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modalContato.classList.contains("aberto")) {
                fecharModalContatoFn();
            }
        });
        formContato.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nome = document.getElementById("campoNome").value.trim();
            const emailRemetente = document.getElementById("campoEmailRemetente").value.trim();
            const mensagem = document.getElementById("campoMensagem").value.trim();
            const botaoEnviar = formContato.querySelector(".modal-contato__enviar");
            const textoOriginal = botaoEnviar.textContent;
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = "Enviando...";
            try {
                const resposta = await fetch("admin/api/contato.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email: emailRemetente, mensagem }),
                });
                const dados = (await resposta.json());
                if (!resposta.ok || !dados.sucesso) {
                    throw new Error(dados.erro || "Não foi possível enviar sua mensagem.");
                }
                fecharModalContatoFn();
                formContato.reset();
                alert("Mensagem enviada! Em breve entraremos em contato.");
            }
            catch (erro) {
                const mensagemErro = erro instanceof Error ? erro.message : "Não foi possível enviar sua mensagem. Tente novamente.";
                alert(mensagemErro);
            }
            finally {
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = textoOriginal;
            }
        });
    }
    // ---------------------------------------------------------------------
    // Vídeo de fundo (hero): alguns navegadores de celular bloqueiam o
    // autoplay mesmo com os atributos corretos no HTML. Forçamos o play()
    // via JS assim que possível, e de novo no primeiro toque na tela como
    // último recurso — todo navegador libera autoplay após interação real
    // do usuário.
    // ---------------------------------------------------------------------
    const heroVideo = document.querySelector(".hero__video");
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        const tentarTocar = () => {
            const promessa = heroVideo.play();
            if (promessa !== undefined) {
                promessa.catch(() => {
                    // Autoplay ainda bloqueado — vai tentar de novo no próximo
                    // toque/clique na página (listener abaixo).
                });
            }
        };
        tentarTocar();
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden)
                tentarTocar();
        });
        const destravarComToque = () => {
            tentarTocar();
            document.removeEventListener("touchstart", destravarComToque);
            document.removeEventListener("click", destravarComToque);
        };
        document.addEventListener("touchstart", destravarComToque, { once: true, passive: true });
        document.addEventListener("click", destravarComToque, { once: true });
    }
    // ---------------------------------------------------------------------
    // Init
    // ---------------------------------------------------------------------
    document.getElementById("ano").textContent = String(new Date().getFullYear());
    carregarCategorias();
    carregarProdutos();
})();
