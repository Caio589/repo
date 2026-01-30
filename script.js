/* =========================
   CONTROLE DE TELAS
========================= */
function show(id){
  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
    sec.style.display = "none";
  });

  const tela = document.getElementById(id);
  if(!tela) return;

  tela.classList.add("active");
  tela.style.display = "block";
}

/* =========================
   BANCO DE DADOS LOCAL
========================= */
const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[],
  planos:[],
  produtos:[],
  vendas:[],
  despesas:[],
  agenda:[],
  caixa:{
    aberto:false,
    abertura:0,
    dinheiro:0,
    pix:0,
    cartao:0
  }
};

db.caixa.abertura = db.caixa.abertura || 0;
db.caixa.dinheiro = db.caixa.dinheiro || 0;
db.caixa.pix = db.caixa.pix || 0;
db.caixa.cartao = db.caixa.cartao || 0;

let carrinho = [];

function save(){
  localStorage.setItem("db", JSON.stringify(db));
}

/* =========================
   CAIXA
========================= */
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

/* =========================
   PRODUTOS / SERVIÇOS
========================= */
function salvarProduto(){
  if(!nomeProd.value) return;

  db.produtos.push({
    nome: nomeProd.value,
    valor: Number(valorProd.value) || 0,
    tipo: tipoProd.value
  });

  nomeProd.value = "";
  valorProd.value = "";

  save();
  render();
}

/* =========================
   CLIENTES
========================= */
function salvarCliente(){
  if(!nomeCliente.value) return;

  const planoSel = db.planos.find(p=>p.nome === planoCliente.value);

  db.clientes.push({
    nome: nomeCliente.value,
    plano: planoSel ? {
      nome: planoSel.nome,
      servico: planoSel.servico,
      saldo: planoSel.qtd
    } : null
  });

  nomeCliente.value = "";

  save();
  render();
}

/* =========================
   PLANOS
========================= */
function salvarPlano(){
  if(!nomePlano.value) return;

  db.planos.push({
    nome: nomePlano.value,
    valor: Number(valorPlano.value) || 0,
    qtd: Number(qtdPlano.value) || 0,
    servico: tipoPlano.value
  });

  nomePlano.value = "";
  valorPlano.value = "";
  qtdPlano.value = "";

  save();
  render();
}

/* =========================
   DESPESAS
========================= */
function salvarDespesa(){
  if(!descDespesa.value) return;

  db.despesas.push({
    desc: descDespesa.value,
    valor: Number(valorDespesa.value) || 0,
    data: new Date().toISOString()
  });

  descDespesa.value = "";
  valorDespesa.value = "";

  save();
  render();
}

/* =========================
   AGENDA
========================= */
function gerarHorarios15(){
  const h=[];
  for(let i=8;i<=20;i++){
    ["00","15","30","45"].forEach(m=>{
      h.push(`${String(i).padStart(2,"0")}:${m}`);
    });
  }
  return h;
}

function salvarAgendamento(){
  if(!dataAgenda.value) return;

  if(db.agenda.find(a=>a.data===dataAgenda.value && a.hora===horaAgenda.value)){
    alert("Horário ocupado");
    return;
  }

  db.agenda.push({
    data:dataAgenda.value,
    hora:horaAgenda.value,
    cliente:clienteAgenda.value,
    servico:servicoAgenda.value
  });

  save();
  render();
}

/* =========================
   CARRINHO
========================= */
function addItem(){
  if(!produto.value) return;

  const [nome, valor] = produto.value.split("|");

  carrinho.push({
    nome,
    valor: Number(valor) || 0
  });

  renderCarrinho();
}

function usarPlano(){
  const nome = cliente.value;
  if(!nome) return alert("Selecione um cliente");

  const c = db.clientes.find(c=>c.nome===nome);
  if(!c || !c.plano) return alert("Cliente sem plano");
  if(c.plano.saldo <= 0) return alert("Plano esgotado");

  c.plano.saldo--;
  alert(`Plano usado. Saldo restante: ${c.plano.saldo}`);

  save();
  render();
}

/* =========================
   RENDER
========================= */
function renderCarrinho(){
  let html = "<tr><th>Item</th><th>Valor</th></tr>";
  let soma = 0;

  carrinho.forEach(i=>{
    html += `<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    soma += i.valor;
  });

  carrinhoElem = document.getElementById("carrinho");
  if(carrinhoElem) carrinhoElem.innerHTML = html;

  total.innerText = soma.toFixed(2);
}

function render(){
  statusCaixa.innerText = db.caixa.aberto ? "🟢 Caixa aberto" : "🔴 Caixa fechado";
  abrirBox.style.display = db.caixa.aberto ? "none" : "block";

  /* selects */
  cliente.innerHTML = db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  clienteAgenda.innerHTML = cliente.innerHTML;

  produto.innerHTML = db.produtos.map(p=>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  tipoPlano.innerHTML = db.produtos
    .filter(p=>p.tipo==="servico")
    .map(p=>`<option>${p.nome}</option>`)
    .join("");

  servicoAgenda.innerHTML = tipoPlano.innerHTML;

  horaAgenda.innerHTML = gerarHorarios15().map(h=>`<option>${h}</option>`).join("");

  /* listas */
  listaProdutos.innerHTML = db.produtos.map(p=>
    `<li>${p.nome} (${p.tipo}) - R$ ${p.valor}</li>`
  ).join("");

  listaClientes.innerHTML = db.clientes.map(c=>
    `<li>${c.nome} ${c.plano ? "| Plano: "+c.plano.nome+" ("+c.plano.saldo+")" : ""}</li>`
  ).join("");

  listaPlanos.innerHTML = db.planos.map(p=>
    `<li>${p.nome} - ${p.qtd}x ${p.servico}</li>`
  ).join("");

  listaDespesas.innerHTML = db.despesas.map(d=>
    `<li>${d.desc} - R$ ${d.valor}</li>`
  ).join("");

  listaAgenda.innerHTML = db.agenda
    .filter(a=>a.data===dataAgenda.value)
    .map(a=>`<li>${a.hora} | ${a.cliente} | ${a.servico}</li>`)
    .join("");

  const totalCaixa = db.caixa.dinheiro + db.caixa.pix + db.caixa.cartao;

  resumoCaixa.innerHTML = `
    💰 Dinheiro: R$ ${db.caixa.dinheiro.toFixed(2)}<br>
    📲 Pix: R$ ${db.caixa.pix.toFixed(2)}<br>
    💳 Cartão: R$ ${db.caixa.cartao.toFixed(2)}<br>
    <b>Total Geral: R$ ${totalCaixa.toFixed(2)}</b>
  `;
}

/* =========================
   EXPOR FUNÇÕES (ONCLICK)
========================= */
window.show = show;
window.abrirCaixa = abrirCaixa;
window.fecharCaixa = fecharCaixa;
window.salvarProduto = salvarProduto;
window.salvarCliente = salvarCliente;
window.salvarPlano = salvarPlano;
window.salvarDespesa = salvarDespesa;
window.salvarAgendamento = salvarAgendamento;
window.addItem = addItem;
window.usarPlano = usarPlano;

/* =========================
   START
========================= */
render();
