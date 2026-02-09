console.log("Sistema Agro v2.0: Persistência e Carrinho Móvel Ativados!");

document.addEventListener('DOMContentLoaded', () => {
/*
Caderno de anotações (LocalStorage)
Pergunta "Tinha alguma coisa lá antes de sair?"
*/
    let carrinho = JSON.parse(localStorage.getItem('carrinhoAgro')) || [];
/* qualquer mudança, ele atualiza*/
    atualizarInterface();

    const campoBusca = document.getElementById('campo-busca');
    if (campoBusca) {
        campoBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.card');
 /*
 Esconde(none)
 Deixa visivel(flex)
 */
            cards.forEach(card => {
                const nome = card.querySelector('h3').innerText.toLowerCase();
                card.style.display = nome.includes(termo) ? "flex" : "none";
            });
        });
    }


    function adicionarAoCarrinho(nome, preco, estoque) {
        const index = carrinho.findIndex(item => item.nome === nome);
        const estoqueMaximo = parseInt(estoque);
/* alert(puxão de orelha)*/
        if (index !== -1) {
            if (carrinho[index].qtd >= estoqueMaximo) {
                alert(`⚠️ Limite atingido! Estoque de: ${estoqueMaximo}`);
                return;
            }
            carrinho[index].qtd++;
        } else {
            if (estoqueMaximo > 0) {
                carrinho.push({ 
                    nome: nome, 
                    preco: parseFloat(preco), 
                    qtd: 1, 
                    estoque: estoqueMaximo 
                });
            } else {
                alert("❌ Sem estoque.");
            }
        }
        atualizarInterface();
    }

    window.alterarQtd = function(index, delta) {
        const item = carrinho[index];
        if (delta === 1 && item.qtd >= item.estoque) {
            alert(`⚠️ Limite de estoque atingido.`);
            return;
        }
/*
deleta ou adiciona 
*/
        item.qtd += delta;
        if (item.qtd <= 0) {
            carrinho.splice(index, 1);
        }
        atualizarInterface();
    };

    function atualizarInterface() {
        const container = document.getElementById('lista-carrinho');
        const totalItens = document.getElementById('total-itens');
        const valorTotal = document.getElementById('valor-total');

        localStorage.setItem('carrinhoAgro', JSON.stringify(carrinho));

        if (carrinho.length === 0) {
            container.innerHTML = '<p class="carrinho-vazio">Carrinho vazio</p>';
            totalItens.innerText = "0";
            valorTotal.innerText = "R$ 0,00";
            return;
        }

        let html = '';
        let somaPreco = 0;
        let somaItens = 0;

        carrinho.forEach((item, index) => {
            somaPreco += item.preco * item.qtd;
            somaItens += item.qtd;
            html += `
                <div class="item-carrinho">
                    <div>
                        <strong>${item.nome}</strong><br>
                        <small>R$ ${item.preco.toFixed(2)}</small>
                    </div>
                    <div class="controles-qtd">
                        <button onclick="alterarQtd(${index}, -1)">-</button>
                        <span>${item.qtd}</span>
                        <button onclick="alterarQtd(${index}, 1)">+</button>
                    </div>
                </div>`;
        });

        container.innerHTML = html;
        totalItens.innerText = somaItens;
        valorTotal.innerText = `R$ ${somaPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add')) {
            const btn = e.target;
            adicionarAoCarrinho(
                btn.getAttribute('data-nome'), 
                btn.getAttribute('data-preco'), 
                btn.getAttribute('data-estoque')
            );
        }

        if (e.target.classList.contains('btn-add-tudo')) {
            const botoesVisiveis = document.querySelectorAll('.card:not([style*="display: none"]) .btn-add');
            botoesVisiveis.forEach(btn => {
                adicionarAoCarrinho(
                    btn.getAttribute('data-nome'), 
                    btn.getAttribute('data-preco'), 
                    btn.getAttribute('data-estoque')
                );
            });
        }
    });

    const dragItem = document.querySelector("#carrinho-lateral");
    const dragHeader = document.querySelector(".cart-header");

    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    dragHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    dragHeader.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag, { passive: false });
/*
Se um mouse mexeu 30 cm pra direita, o carrin vai mexer também!
*/
    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === dragHeader || dragHeader.contains(e.target)) {
            active = true;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        active = false;
    }

    function drag(e) {
        if (active) {
            e.preventDefault(); 
        
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;
/*
Mudar!
*/
            setTranslate(currentX, currentY, dragItem);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
});