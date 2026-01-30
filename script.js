/* ================== BASE ================== */
function show(id){
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.remove("active");
    s.style.display = "none";
  });
  const tela = document.getElementById(id);
  if(!tela) return;
  tela.classList.add("active");
  tela.style.display = "block";
}

/* ================== DB ================== */
const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[],
  planos:[],
  produtos:[],
  vendas:[],
  despesas:[],
  agenda:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};

db.caixa.abertura ||= 0;
db.caixa.dinheiro ||= 0;
db.caixa.pix ||= 0;
db.caixa.cartao ||= 0;

let carrinho = [];

function save(){
  localStorage.setItem("db", JSON.stringify(db));
}

/* ================== CAIXA ================== */
function abrirCaixa(){
  db.caixa.aberto = true;
  db.caixa.abertura = Number(valorAbertura.value) || 0;
  save();
  render();
}

function fecharCaixa(){
  db.caixa.aberto = false;
  db.caixa.dinheiro = 0;
  db.caixa.pix = 0;
  db.caixa.cartao = 0;
  save();
  render();
}

/* ================== PRODUTOS ================== */
function salvarProduto(){
  db.produtos.push({
    nome: nomeProd.value,
    valor: Number(valorProd.value) || 0,
    tipo: tipoProd.value
  });
  save();
  render();
}

/* ================== CLIENTES ================== */
function salvarCliente(){
  db.clientes.push({
    nome: nomeCliente.value
  });
  save();
  render();
}

/* ================== PLANOS ================== */
function salvarPlano(){
  db.planos.push({
    nome: nomePlano.value,
    valor: Number(valorPlano.value) || 0,
    qtd: Number(qtdPlano.value) || 0,
    servico: tipoPlano.value
  });
  save();
  render();
}

/* ================== DESPESAS ================== */
function salvarDespesa(){
  db.despesas.push({
    desc: descDespesa.value,
    valor: Number(valorDespesa.value) || 0,
    data: new Date().toISOString()
  });
  save();
  render();
}

/* ================== RENDER ================== */
function render(){
  statusCaixa.innerText = db.caixa.aberto ? "🟢 Caixa aberto" : "🔴 Caixa fechado";
  abrirBox.style.display = db.caixa.aberto ? "none" : "block";

  /* produtos */
  produto.innerHTML = db.produtos.map(p =>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  listaProdutos.innerHTML = db.produtos.map(p =>
    `<li>${p.nome} - R$ ${p.valor}</li>`
  ).join("");

  /* clientes */
  cliente.innerHTML = db.clientes.map(c =>
    `<option>${c.nome}</option>`
  ).join("");

  listaClientes.innerHTML = db.clientes.map(c =>
    `<li>${c.nome}</li>`
  ).join("");

  /* planos */
  listaPlanos.innerHTML = db.planos.map(p =>
    `<li>${p.nome} (${p.qtd}x)</li>`
  ).join("");

  /* despesas */
  listaDespesas.innerHTML = db.despesas.map(d =>
    `<li>${d.desc} - R$ ${d.valor}</li>`
  ).join("");
}

/* ================== EXPOR FUNÇÕES ================== */
window.show = show;
window.abrirCaixa = abrirCaixa;
window.fecharCaixa = fecharCaixa;
window.salvarProduto = salvarProduto;
window.salvarCliente = salvarCliente;
window.salvarPlano = salvarPlano;
window.salvarDespesa = salvarDespesa;

/* ================== INIT ================== */
render();
