/* ================= TELAS ================= */
function show(id){
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.remove("active");
    s.style.display="none";
  });
  const tela=document.getElementById(id);
  if(!tela) return;
  tela.classList.add("active");
  tela.style.display="block";
}

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

db.caixa.abertura ||= 0;
db.caixa.dinheiro ||= 0;
db.caixa.pix ||= 0;
db.caixa.cartao ||= 0;

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

/* ================= PRODUTOS ================= */
function salvarProduto(){
  if(!nomeProd.value) return;
  db.produtos.push({
    nome: nomeProd.value,
    valor: Number(valorProd.value)||0,
    tipo: tipoProd.value
  });
  nomeProd.value=""; valorProd.value="";
  save(); render();
}

/* ================= PLANOS ================= */
function salvarPlano(){
  if(!nomePlano.value) return;
  db.planos.push({
    nome: nomePlano.value,
    valor: Number(valorPlano.value)||0,
    qtd: Number(qtdPlano.value)||0,
    servico: tipoPlano.value
  });
  nomePlano.value=""; valorPlano.value=""; qtdPlano.value="";
  save(); render();
}

/* ================= CLIENTES ================= */
function salvarCliente(){
  if(!nomeCliente.value) return;
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

/* 🔁 RENOVAR PLANO (somente com caixa aberto) */
function renovarPlanoCliente(){
  if(!db.caixa.aberto){
    alert("Abra o caixa para renovar o plano");
    return;
  }
  const c = db.clientes.find(c=>c.nome===cliente.value);
  if(!c || !c.plano) return alert("Cliente sem plano");
  const p = db.planos.find(p=>p.nome===c.plano.nome);
  if(!p) return alert("Plano não encontrado");

  c.plano.saldo += p.qtd;
  db.caixa.dinheiro += p.valor;
  db.vendas.push({
    data:new Date().toISOString(),
    total:p.valor,
    tipo:"renovacao"
  });

  save(); render();
}

/* ================= DESPESAS ================= */
function salvarDespesa(){
  if(!descDespesa.value) return;
  db.despesas.push({
    desc: descDespesa.value,
    valor: Number(valorDespesa.value)||0,
    data: new Date().toISOString()
  });
  descDespesa.value=""; valorDespesa.value="";
  save(); render();
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
  if(!dataAgenda.value) return;
  db.agenda.push({
    data:dataAgenda.value,
    hora:horaAgenda.value,
    cliente:clienteAgenda.value,
    servico:servicoAgenda.value
  });
  save(); render();
}

function removerAgendamento(i){
  db.agenda.splice(i,1);
  save(); render();
}

/* ================= PDV ================= */
function addItem(){
  if(!produto.value) return;
  const [nome,valor] = produto.value.split("|");
  carrinho.push({nome,valor:Number(valor)||0});
  renderCarrinho();
}

function usarPlano(){
  const c = db.clientes.find(c=>c.nome===cliente.value);
  if(!c || !c.plano || c.plano.saldo<=0){
    alert("Plano indisponível");
    return;
  }
  c.plano.saldo--;
  save(); render();
}

/* 🚫 VENDA SÓ COM CAIXA ABERTO */
function finalizarVenda(){
  if(!db.caixa.aberto){
    alert("Abra o caixa para vender");
    return;
  }
  if(carrinho.length===0){
    alert("Carrinho vazio");
    return;
  }

  const total = carrinho.reduce((s,i)=>s+i.valor,0);

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

/* ================= RELATÓRIO ================= */
function gerarRelatorioMensal(){
  const [a,m]=mesRelatorio.value.split("-");
  const vendas=db.vendas.filter(v=>{
    const d=new Date(v.data);
    return d.getFullYear()==a&&(d.getMonth()+1)==m;
  });
  const despesas=db.despesas.filter(d=>{
    const dt=new Date(d.data);
    return dt.getFullYear()==a&&(dt.getMonth()+1)==m;
  });
  const tv=vendas.reduce((s,v)=>s+v.total,0);
  const td=despesas.reduce((s,d)=>s+d.valor,0);

  resumoMensal.innerHTML=`
    <p>Vendas: R$ ${tv.toFixed(2)}</p>
    <p>Despesas: R$ ${td.toFixed(2)}</p>
    <b>Resultado: R$ ${(tv-td).toFixed(2)}</b>
  `;
}

/* ================= RENDER GERAL ================= */
function render(){
  statusCaixa.innerText = db.caixa.aberto ? "🟢 Caixa aberto" : "🔴 Caixa fechado";
  abrirBox.style.display = db.caixa.aberto ? "none" : "block";

  produto.innerHTML = db.produtos.map(p=>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  cliente.innerHTML = db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  clienteAgenda.innerHTML = cliente.innerHTML;

  tipoPlano.innerHTML = db.produtos
    .filter(p=>p.tipo==="servico")
    .map(p=>`<option>${p.nome}</option>`).join("");

  planoCliente.innerHTML =
    `<option value="">Sem plano</option>` +
    db.planos.map(p=>`<option>${p.nome}</option>`).join("");

  servicoAgenda.innerHTML = tipoPlano.innerHTML;
  horaAgenda.innerHTML = gerarHorarios15().map(h=>`<option>${h}</option>`).join("");

  listaAgenda.innerHTML = db.agenda.map((a,i)=>
    `<li>${a.data} ${a.hora} | ${a.cliente}
     <button onclick="removerAgendamento(${i})">✏️</button></li>`
  ).join("");

  listaClientes.innerHTML = db.clientes.map(c=>
    `<li>${c.nome} ${c.plano ? `| Plano ${c.plano.nome} (${c.plano.saldo})` : ""}</li>`
  ).join("");

  listaPlanos.innerHTML = db.planos.map(p=>
    `<li>${p.nome} - ${p.qtd}x ${p.servico}</li>`
  ).join("");

  listaProdutos.innerHTML = db.produtos.map(p=>
    `<li>${p.nome} (${p.tipo}) - R$ ${p.valor}</li>`
  ).join("");

  listaDespesas.innerHTML = db.despesas.map(d=>
    `<li>${d.desc} - R$ ${d.valor}</li>`
  ).join("");

  resumoCaixa.innerHTML = `
    💰 Dinheiro: R$ ${db.caixa.dinheiro.toFixed(2)} |
    📲 Pix: R$ ${db.caixa.pix.toFixed(2)} |
    💳 Cartão: R$ ${db.caixa.cartao.toFixed(2)}
  `;
}

/* ================= START ================= */
render();
