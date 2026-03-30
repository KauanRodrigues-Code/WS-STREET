let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

const contador = document.getElementById("contador");
const listaCarrinho = document.getElementById("lista-carrinho");
const carrinhoBox = document.getElementById("carrinho");
const toastBox = document.getElementById("toast");

/* =========================
   NOVAS FUNÇÕES DO MENU
   ========================= */
function toggleMenuCategorias() {
    const overlay = document.getElementById("menu-categorias-overlay");
    if (overlay.style.display === "flex") {
        overlay.style.display = "none";
    } else {
        overlay.style.display = "flex";
    }
}

function filtrarEDirecionar(categoria) {
    filtrar(categoria);
    toggleMenuCategorias();
    const section = document.getElementById('catalogo-completo');
    if(section) section.scrollIntoView({behavior: 'smooth'});
}

/* =========================
   FUNÇÕES DE CARRINHO
   ========================= */
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function abrirCarrinho() {
    carrinhoBox.classList.toggle("ativo");
    renderCarrinho();
}

/* =========================
   FUNÇÃO BANNER
   ========================= */
function carregarBanner() {
    const bannerSalvo = localStorage.getItem("bannerPrincipal");
    const hero = document.getElementById("bannerHero");
    if (bannerSalvo && hero) {
        hero.style.backgroundImage = `url('${bannerSalvo}')`;
    }
}

/* =========================
   RENDERIZAÇÃO DE DESTAQUES
   ========================= */
function renderDestaques() {
    const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
    const destaquesSalvos = JSON.parse(localStorage.getItem("produtosDestaques")) || []; 
    const containerDestaques = document.getElementById("produtos-destaques");

    if (!containerDestaques) return;
    containerDestaques.innerHTML = "";

    const produtosEmDestaque = produtosSalvos.filter(p => destaquesSalvos.includes(p.nome));

    if (produtosEmDestaque.length === 0) {
        containerDestaques.innerHTML = "<p style='color:#666'>Nenhum destaque selecionado.</p>";
        return;
    }

    produtosEmDestaque.forEach((p) => {
        const indexOriginal = produtosSalvos.findIndex(prod => prod.nome === p.nome);
        const esgotado = p.estoque <= 0;

        containerDestaques.innerHTML += `
        <div class="produto-card" style="opacity: ${esgotado ? '0.7' : '1'}">
            <img src="${p.imagem}" style="width:100%;height:250px;object-fit:cover;border-radius:6px" onerror="this.src='img/logo.png'">
            <div class="destaque-info">
                <h3 style="margin-top:10px">${p.nome}</h3>
                <p style="color:red; font-weight:bold; margin-bottom:10px">R$ ${p.preco}</p>
                <button onclick="adicionarPeloIndex(${indexOriginal}, this)" 
                        class="btn-add" 
                        ${esgotado ? 'disabled style="background:#333"' : ''}>
                    ${esgotado ? 'ESGOTADO' : 'ADICIONAR AGORA'}
                </button>
            </div>
        </div>`;
    });
}

/* =========================
   FUNÇÕES DE ADICIONAR/REMOVER
   ========================= */
function addCarrinho(nome, preco, imagem, botao, indexOriginal) {
    const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
    const p = produtosSalvos[indexOriginal];

    if (p && p.estoque > 0) {
        carrinho.push({ nome, preco, imagem });
        salvarCarrinho();

        p.estoque--;
        localStorage.setItem("produtos", JSON.stringify(produtosSalvos));

        if (contador) contador.innerText = carrinho.length;
        
        animarCarrinho();
        animarProduto(botao); 

        renderCarrinho();
        carregarProdutos(); 
        renderDestaques(); 
        mostrarToast(nome + " adicionado ao carrinho!");
    } else {
        mostrarToast("Ops! Este item acabou.");
    }
}

function adicionarPeloIndex(index, botao) {
    const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
    const p = produtosSalvos[index];
    if (p) {
        addCarrinho(p.nome, p.preco, p.imagem, botao, index);
    }
}

function removerCarrinho(index) {
    const itemRemovido = carrinho[index];
    const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
    const pDB = produtosSalvos.find(prod => prod.nome === itemRemovido.nome);
    
    if(pDB) {
        pDB.estoque++;
        localStorage.setItem("produtos", JSON.stringify(produtosSalvos));
    }

    carrinho.splice(index, 1);
    salvarCarrinho();
    if (contador) contador.innerText = carrinho.length;
    
    carregarProdutos();
    renderDestaques(); 
    renderCarrinho();
}

/* =========================
   RENDER CARRINHO
   ========================= */
function renderCarrinho() {
    if (!listaCarrinho) return;
    listaCarrinho.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += Number(item.preco);
        listaCarrinho.innerHTML += `
        <div class="item-carrinho" style="display:flex;gap:10px;margin-bottom:15px;border-bottom:1px solid #333;padding-bottom:10px">
            <img src="${item.imagem}" style="width:60px;height:60px;object-fit:cover;border-radius:6px" onerror="this.src='img/logo.png'">
            <div style="flex:1">
                <b style="color:white; font-size:14px">${item.nome}</b>
                <p style="color:#ff4d4d; margin: 5px 0;">R$ ${item.preco}</p>
                <button onclick="removerCarrinho(${index})" 
                        style="background:none;border:none;color:#888;cursor:pointer;text-decoration:underline;font-size:11px;padding:0">
                    Remover
                </button>
            </div>
        </div>`;
    });

    listaCarrinho.innerHTML += `
        <div style="margin-top:20px; border-top: 1px solid #444; padding-top: 10px; display:flex; justify-content: space-between;">
            <b style="color:white">Total:</b>
            <b style="color:red">R$ ${total.toFixed(2)}</b>
        </div>`;
}

/* =========================
   ANIMAÇÕES
   ========================= */
function animarCarrinho() {
    const icon = document.querySelector(".carrinho-icon");
    if (!icon) return;
    icon.classList.add("carrinho-animar");
    setTimeout(() => icon.classList.remove("carrinho-animar"), 400);
}

function animarProduto(botao) {
    if (!botao) return;
    const card = botao.closest(".produto-card");
    const img = card ? card.querySelector("img") : null;
    const carrinhoIcon = document.querySelector(".carrinho-icon");
    if (!img || !carrinhoIcon) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = carrinhoIcon.getBoundingClientRect();
    const clone = img.cloneNode(true);

    Object.assign(clone.style, {
        position: "fixed",
        left: imgRect.left + "px",
        top: imgRect.top + "px",
        width: imgRect.width + "px",
        height: imgRect.height + "px",
        transition: "all 0.7s cubic-bezier(0.42, 0, 0.58, 1)",
        zIndex: "9999",
        pointerEvents: "none",
        borderRadius: "50%"
    });

    document.body.appendChild(clone);

    setTimeout(() => {
        Object.assign(clone.style, {
            left: cartRect.left + "px",
            top: cartRect.top + "px",
            width: "20px",
            height: "20px",
            opacity: "0",
            transform: "rotate(360deg)"
        });
    }, 50);

    setTimeout(() => clone.remove(), 700);
}

/* =========================
   CARREGAR PRODUTOS
   ========================= */
function carregarProdutos() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = "";

    produtos.forEach((p, index) => {
        const esgotado = p.estoque <= 0;
        container.innerHTML += `
        <div class="produto-card" data-categoria="${p.categoria}" style="opacity: ${esgotado ? '0.5' : '1'}">
            <div class="produto-img">
                <img src="${p.imagem}" style="width:100%;height:200px;object-fit:cover;border-radius:6px;" onerror="this.src='img/logo.png'">
            </div>
            <h3>${p.nome}</h3>
            <p class="preco">R$ ${p.preco}</p>
            <p style="font-size: 11px; margin-bottom:10px; color: ${esgotado ? 'red' : '#00ff00'}">
                ${esgotado ? 'ESGOTADO' : 'Disponível: ' + p.estoque}
            </p>
            <button 
                onclick="adicionarPeloIndex(${index}, this)" 
                class="btn-add" 
                ${esgotado ? 'disabled style="background:#333; cursor:not-allowed"' : ''}>
                ${esgotado ? 'Indisponível' : 'Adicionar'}
            </button>
        </div>`;
    });
}

/* =========================
   FILTRAR PRODUTOS
   ========================= */
function filtrar(categoria) {
    const produtosCards = document.querySelectorAll(".produto-card");
    produtosCards.forEach((p) => {
        const catProduto = p.getAttribute("data-categoria") ? p.getAttribute("data-categoria").toLowerCase() : "";
        const catFiltro = categoria.toLowerCase();
        
        if (catFiltro === "todos" || catProduto === catFiltro) {
            p.style.display = "block";
        } else {
            p.style.display = "none";
        }
    });
}

/* =========================
   TOAST
   ========================= */
function mostrarToast(texto) {
    if (!toastBox) return;
    toastBox.innerText = texto;
    toastBox.classList.add("show");
    setTimeout(() => toastBox.classList.remove("show"), 2000);
}

/* =========================
   CHECKOUT WHATSAPP
   ========================= */
function finalizarWhatsApp() {
    if(carrinho.length === 0) {
        mostrarToast("Seu carrinho está vazio!");
        return;
    }
    
    let mensagem = "🔥 *NOVO PEDIDO - STREET WS* 🔥\n\n";
    let total = 0;
    
    carrinho.forEach(item => {
        mensagem += `🛍️ *${item.nome}* - R$ ${item.preco}\n`;
        total += Number(item.preco);
    });
    
    mensagem += `\n💳 *TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    mensagem += "📦 Entrega ou retirada?\n";
    mensagem += "📍 Informe seu endereço:\n";
    mensagem += "💰 Forma de pagamento:\n\n";
    mensagem += "🙏 Obrigado por comprar na *Street WS*!\n";
    mensagem += "🔥 Streetwear de verdade.";

    let telefone = "5543988230563"; // SEU NÚMERO
    let url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}

/* =========================
   INICIALIZAÇÃO
   ========================= */
carregarBanner();
carregarProdutos();
renderDestaques(); 
renderCarrinho();
if (contador) contador.innerText = carrinho.length;