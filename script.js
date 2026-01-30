/* ================= DB ================= */
const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[],
  planos:[],
  produtos:[],
  vendas:[],
  despesas:[],
  agenda:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};

let carrinho = [];

function save(){
  localStorage.setItem("db", JSON.stringify(db));
}

/* ================= CAIXA ================= */
function abrirCaixa(){
  db.caixa.aberto = true;
  db.caixa.abertura = Number(valorAbertura.value) || 0;
  save(); render();
}

function fecharCaixa(){
  db.caixa.aberto = false;
  db.caixa.dinheiro = 0;
  db.caixa.pix = 0;
  db.caixa.cartao = 0;
  save(); render();
}

/* ================= CLIENTES ================= */
function salvarCliente(){
  const plano = db.planos.find(p=>p.nome===planoCliente.value);
  db.clientes.push({
    nome: nomeCliente.value,
    plano: plano ? {
      nome: plano.nome,
      servico: plano.servico,
      saldo: plano.qtd
    } : null
  });
  nomeCliente.value="";
  save(); render();
}

/* 🔁 RENOVAÇÃO DE PLANO (NOVO) */
function renovarPlanoCliente(){
  if(!db.caixa.aberto){
    alert("Abra o caixa para renovar o plano");
    return;
  }

  const clienteNome = cliente.value;
  const c = db.clientes.find(c=>c.nome===clienteNome);

  if(!c || !c.plano){
    alert("Cliente não possui plano");
    return;
  }

  const plano = db.planos.find(p=>p.nome===c.plano.nome);
  if(!plano){
    alert("Plano não encontrado");
    return;
  }

  // soma saldo do plano
  c.plano.saldo += plano.qtd;

  // entra no caixa como venda
  db.caixa.dinheiro += plano.valor;

  db.vendas.push({
    data: new Date().toISOString(),
    total: plano.valor,
    tipo: "renovacao",
    cliente: c.nome,
    plano: plano.nome
  });

  alert("Plano renovado com sucesso");

  save();
  render();
}

/* ================= PDV ================= */
function addItem(){
  const [nome,valor] = produto.value.split("|");
  carrinho.push({nome,valor:Number(valor)||0});
  renderCarrinho();
}

function finalizarVenda(){
  if(!db.caixa.aberto){
    alert("Abra o caixa para vender");
    return;
  }

  const total = carrinho.reduce((s,i)=>s+i.valor,0);
  if(total <= 0) return;

  if(pagamento.value==="dinheiro") db.caixa.dinheiro += total;
  if(pagamento.value==="pix") db.caixa.pix += total;
  if(pagamento.value==="cartao") db.caixa.cartao += total;

  db.vendas.push({
    data:new Date().toISOString(),
    total,
    tipo:"venda"
  });

  carrinho=[];
  save(); render();
}

/* ================= CARRINHO ================= */
function renderCarrinho(){
  const carrinhoElem = document.getElementById("carrinho");
  let h="<tr><th>Item</th><th>Valor</th></tr>";
  let s=0;

  carrinho.forEach(i=>{
    h+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    s+=i.valor;
  });

  carrinhoElem.innerHTML=h;
  total.innerText=s.toFixed(2);
}

/* ================= RENDER ================= */
function render(){
  statusCaixa.innerText = db.caixa.aberto ? "🟢 Caixa aberto" : "🔴 Caixa fechado";
  abrirBox.style.display = db.caixa.aberto ? "none" : "block";

  cliente.innerHTML = db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  listaClientes.innerHTML = db.clientes.map(c=>
    `<li>${c.nome} ${c.plano ? `| Plano ${c.plano.nome} (${c.plano.saldo})` : ""}</li>`
  ).join("");

  resumoCaixa.innerHTML = `
    💰 Dinheiro: R$ ${db.caixa.dinheiro.toFixed(2)} |
    📲 Pix: R$ ${db.caixa.pix.toFixed(2)} |
    💳 Cartão: R$ ${db.caixa.cartao.toFixed(2)}
  `;
}

render();
