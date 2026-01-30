/* ================= TELAS ================= */
function show(id){
  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
    sec.style.display = "none";
  });
  const el = document.getElementById(id);
  if(el){
    el.classList.add("active");
    el.style.display = "block";
  }
}

/* ================= DB ================= */
const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[],
  planos:[],
  produtos:[],
  vendas:[],
  despesas:[],
  agenda:[],
  caixa:{aberto:false,abertura:0}
};

let carrinho = [];

function save(){
  localStorage.setItem("db", JSON.stringify(db));
}

/* ================= CAIXA ================= */
function abrirCaixa(){
  db.caixa.aberto = true;
  db.caixa.abertura = Number(valorAbertura.value)||0;
  save();
  render();
}

/* ================= PRODUTOS ================= */
function salvarProduto(){
  db.produtos.push({
    nome:nomeProd.value,
    valor:Number(valorProd.value)||0,
    tipo:tipoProd.value
  });
  nomeProd.value="";
  valorProd.value="";
  save();
  render();
}

/* ================= PLANOS ================= */
function salvarPlano(){
  db.planos.push({
    nome:nomePlano.value,
    valor:Number(valorPlano.value)||0,
    qtd:Number(qtdPlano.value)||0,
    servico:tipoPlano.value
  });
  nomePlano.value="";
  valorPlano.value="";
  qtdPlano.value="";
  save();
  render();
}

/* ================= CLIENTES ================= */
function salvarCliente(){
  const plano = db.planos.find(p=>p.nome===planoCliente.value);
  db.clientes.push({
    nome:nomeCliente.value,
    plano: plano ? {
      nome:plano.nome,
      saldo:plano.qtd
    } : null
  });
  nomeCliente.value="";
  save();
  render();
}

/* ================= RENOVAÇÃO DE PLANO ================= */
function renovarPlanoCliente(){
  if(!db.caixa.aberto){
    alert("Abra o caixa para renovar plano");
    return;
  }

  const nome = cliente.value;
  const c = db.clientes.find(c=>c.nome===nome);

  if(!c || !c.plano){
    alert("Cliente sem plano");
    return;
  }

  const planoBase = db.planos.find(p=>p.nome===c.plano.nome);
  if(!planoBase){
    alert("Plano não encontrado");
    return;
  }

  c.plano.saldo += planoBase.qtd;

  db.vendas.push({
    data:new Date().toISOString(),
    total:planoBase.valor,
    tipo:"renovacao"
  });

  save();
  render();
}

/* ================= DESPESAS ================= */
function salvarDespesa(){
  db.despesas.push({
    desc:descDespesa.value,
    valor:Number(valorDespesa.value)||0,
    data:new Date().toISOString()
  });
  descDespesa.value="";
  valorDespesa.value="";
  save();
  render();
}

/* ================= AGENDA ================= */
function gerarHorarios15(){
  let h=[];
  for(let i=8;i<=20;i++){
    ["00","15","30","45"].forEach(m=>{
      h.push(`${String(i).padStart(2,"0")}:${m}`);
    });
  }
  return h;
}

function salvarAgendamento(){
  db.agenda.push({
    data:dataAgenda.value,
    hora:horaAgenda.value,
    cliente:clienteAgenda.value,
    servico:servicoAgenda.value
  });
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

  db.vendas.push({
    data:new Date().toISOString(),
    total,
    pagamento:pagamento.value,
    tipo:"venda"
  });

  carrinho=[];
  save();
  render();
}

/* ================= CARRINHO ================= */
function renderCarrinho(){
  let html="<tr><th>Item</th><th>Valor</th></tr>";
  let soma=0;

  carrinho.forEach(i=>{
    html+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    soma+=i.valor;
  });

  carrinhoElem = document.getElementById("carrinho");
  carrinhoElem.innerHTML = html;
  total.innerText = soma.toFixed(2);
}

/* ================= RELATÓRIO ================= */
function gerarRelatorioMensal(){
  const [ano,mes] = mesRelatorio.value.split("-");
  const vendas = db.vendas.filter(v=>{
    const d = new Date(v.data);
    return d.getFullYear()==ano && (d.getMonth()+1)==mes;
  });

  const total = vendas.reduce((s,v)=>s+v.total,0);
  resumoMensal.innerHTML = `<p>Faturamento: R$ ${total.toFixed(2)}</p>`;
}

/* ================= RENDER ================= */
function render(){
  statusCaixa.innerText = db.caixa.aberto ? "🟢 Caixa aberto" : "🔴 Caixa fechado";
  abrirBox.style.display = db.caixa.aberto ? "none" : "block";

  cliente.innerHTML = db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  clienteAgenda.innerHTML = cliente.innerHTML;

  produto.innerHTML = db.produtos.map(p=>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  planoCliente.innerHTML =
    `<option value="">Sem plano</option>` +
    db.planos.map(p=>`<option>${p.nome}</option>`).join("");

  tipoPlano.innerHTML = db.produtos
    .filter(p=>p.tipo==="servico")
    .map(p=>`<option>${p.nome}</option>`).join("");

  servicoAgenda.innerHTML = tipoPlano.innerHTML;
  horaAgenda.innerHTML = gerarHorarios15().map(h=>`<option>${h}</option>`).join("");

  listaClientes.innerHTML = db.clientes.map(c=>
    `<li>${c.nome} ${c.plano?`| Plano ${c.plano.nome} (${c.plano.saldo})`:""}</li>`
  ).join("");

  listaPlanos.innerHTML = db.planos.map(p=>
    `<li>${p.nome} - ${p.qtd} serviços</li>`
  ).join("");

  listaProdutos.innerHTML = db.produtos.map(p=>
    `<li>${p.nome} (${p.tipo})</li>`
  ).join("");

  listaDespesas.innerHTML = db.despesas.map(d=>
    `<li>${d.desc} - R$ ${d.valor}</li>`
  ).join("");

  listaAgenda.innerHTML = db.agenda
    .filter(a=>a.data===dataAgenda.value)
    .map(a=>`<li>${a.hora} | ${a.cliente} | ${a.servico}</li>`)
    .join("");
}

/* ================= EXPOR PARA HTML ================= */
window.show = show;
window.abrirCaixa = abrirCaixa;
window.salvarProduto = salvarProduto;
window.salvarPlano = salvarPlano;
window.salvarCliente = salvarCliente;
window.salvarDespesa = salvarDespesa;
window.salvarAgendamento = salvarAgendamento;
window.addItem = addItem;
window.finalizarVenda = finalizarVenda;
window.gerarRelatorioMensal = gerarRelatorioMensal;
window.renovarPlanoCliente = renovarPlanoCliente;

/* ================= START ================= */
render();
