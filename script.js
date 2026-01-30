const { jsPDF } = window.jspdf;

/* ===== BASE ===== */
function show(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[], planos:[], produtos:[],
  vendas:[], despesas:[], agenda:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};

/* blindagem */
db.caixa.abertura ||= 0;
db.caixa.dinheiro ||= 0;
db.caixa.pix ||= 0;
db.caixa.cartao ||= 0;

let carrinho=[];
function save(){localStorage.setItem("db",JSON.stringify(db))}

/* ===== AGENDA ===== */
function gerarHorarios15(){
  let h=[];
  for(let i=8;i<=20;i++){
    ["00","15","30","45"].forEach(m=>h.push(`${String(i).padStart(2,"0")}:${m}`));
  }
  return h;
}

function salvarAgendamento(){
  if(db.agenda.find(a=>a.data===dataAgenda.value && a.hora===horaAgenda.value))
    return alert("Horário ocupado");

  db.agenda.push({
    data:dataAgenda.value,
    hora:horaAgenda.value,
    cliente:clienteAgenda.value,
    servico:servicoAgenda.value
  });
  save(); render();
}

/* ===== CLIENTES ===== */
function salvarCliente(){
  const plano=db.planos.find(p=>p.nome===planoCliente.value);
  db.clientes.push({
    nome:nomeCliente.value,
    plano:plano?plano.nome:null,
    saldo:plano?plano.qtd:0
  });
  save(); render();
}

/* ===== PLANOS ===== */
function salvarPlano(){
  db.planos.push({
    nome:nomePlano.value,
    valor:+valorPlano.value||0,
    qtd:+qtdPlano.value||0,
    tipo:tipoPlano.value
  });
  save(); render();
}

/* ===== PRODUTOS ===== */
function salvarProduto(){
  db.produtos.push({
    nome:nomeProd.value,
    valor:+valorProd.value||0,
    tipo:tipoProd.value
  });
  save(); render();
}

/* ===== DESPESAS ===== */
function salvarDespesa(){
  db.despesas.push({
    desc:descDespesa.value,
    valor:+valorDespesa.value||0,
    data:new Date().toLocaleString()
  });
  save(); render();
}

/* ===== CAIXA ===== */
function abrirCaixa(){
  db.caixa.aberto=true;
  db.caixa.abertura=+valorAbertura.value||0;
  save(); render();
}

function addItem(){
  const [nome,valor]=produto.value.split("|");
  carrinho.push({nome,valor:+valor||0});
  renderCarrinho();
}

function finalizarVenda(){
  if(!db.caixa.aberto) return alert("Caixa fechado");
  if(!carrinho.length) return alert("Carrinho vazio");

  const total=carrinho.reduce((s,i)=>s+i.valor,0);
  const pago=+valorPago.value||0;

  if(pagamento.value==="dinheiro"){
    if(pago<total) return alert("Valor insuficiente");
    db.caixa.dinheiro+=total;
    trocoInfo.innerText=`Troco: R$ ${(pago-total).toFixed(2)}`;
  }
  if(pagamento.value==="pix") db.caixa.pix+=total;
  if(pagamento.value==="cartao") db.caixa.cartao+=total;

  db.vendas.push({data:new Date().toISOString(),total});
  carrinho=[]; valorPago.value="";
  save(); render();
}

/* ===== PDF CAIXA ===== */
function gerarPDFCaixa(){
  const pdf=new jsPDF();
  let y=20;
  pdf.text("Fechamento de Caixa",20,y); y+=10;
  pdf.text(`Data: ${new Date().toLocaleString()}`,20,y); y+=10;
  pdf.text(`Abertura: R$ ${db.caixa.abertura.toFixed(2)}`,20,y); y+=8;
  pdf.text(`Dinheiro: R$ ${db.caixa.dinheiro.toFixed(2)}`,20,y); y+=8;
  pdf.text(`Pix: R$ ${db.caixa.pix.toFixed(2)}`,20,y); y+=8;
  pdf.text(`Cartão: R$ ${db.caixa.cartao.toFixed(2)}`,20,y);
  pdf.save("fechamento_caixa.pdf");
}

function fecharCaixa(){
  gerarPDFCaixa();
  db.caixa.aberto=false;
  db.caixa.dinheiro=db.caixa.pix=db.caixa.cartao=0;
  save(); render();
}

/* ===== PDF MENSAL ===== */
function gerarRelatorioMensal(){
  const [ano,mes]=mesRelatorio.value.split("-");
  const vendas=db.vendas.filter(v=>{
    const d=new Date(v.data);
    return d.getFullYear()==ano && d.getMonth()+1==mes;
  });
  const total=vendas.reduce((s,v)=>s+v.total,0);
  resumoMensal.innerHTML=`Total: R$ ${total.toFixed(2)}`;

  const pdf=new jsPDF();
  let y=20;
  pdf.text(`Relatório ${mes}/${ano}`,20,y); y+=10;
  vendas.forEach(v=>{
    pdf.text(`Venda: R$ ${v.total.toFixed(2)}`,20,y); y+=7;
  });
  pdf.text(`Total: R$ ${total.toFixed(2)}`,20,y+5);
  pdf.save("relatorio_mensal.pdf");
}

/* ===== RENDER ===== */
function renderCarrinho(){
  let h="<tr><th>Item</th><th>Valor</th></tr>",s=0;
  carrinho.forEach(i=>{
    h+=`<tr><td>${i.nome}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    s+=i.valor;
  });
  carrinho.innerHTML=h;
  total.innerText=s.toFixed(2);
}

function render(){
  statusCaixa.innerText=db.caixa.aberto?"🟢 Caixa aberto":"🔴 Caixa fechado";
  abrirBox.style.display=db.caixa.aberto?"none":"block";

  cliente.innerHTML=db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  clienteAgenda.innerHTML=cliente.innerHTML;

  planoCliente.innerHTML=`<option value="">Sem plano</option>`+
    db.planos.map(p=>`<option>${p.nome}</option>`).join("");

  produto.innerHTML=db.produtos.map(p=>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  servicoAgenda.innerHTML=db.produtos
    .filter(p=>p.tipo==="servico")
    .map(p=>`<option>${p.nome}</option>`).join("");

  horaAgenda.innerHTML=gerarHorarios15().map(h=>`<option>${h}</option>`).join("");

  listaClientes.innerHTML=db.clientes.map(c=>
    `<li>${c.nome} | Plano: ${c.plano||"-"} | Saldo: ${c.saldo}</li>`
  ).join("");

  listaPlanos.innerHTML=db.planos.map(p=>
    `<li>${p.nome} - R$ ${p.valor}</li>`
  ).join("");

  listaProdutos.innerHTML=db.produtos.map(p=>
    `<li>${p.nome} (${p.tipo})</li>`
  ).join("");

  listaDespesas.innerHTML=db.despesas.map(d=>
    `<li>${d.desc} - R$ ${d.valor}</li>`
  ).join("");

  listaAgenda.innerHTML=db.agenda
    .filter(a=>a.data===dataAgenda.value)
    .map(a=>`<li>${a.hora} | ${a.cliente} | ${a.servico}</li>`).join("");

  resumoCaixa.innerHTML=`
    💰 Dinheiro: R$ ${(db.caixa.dinheiro||0).toFixed(2)}<br>
    📲 Pix: R$ ${(db.caixa.pix||0).toFixed(2)}<br>
    💳 Cartão: R$ ${(db.caixa.cartao||0).toFixed(2)}
  `;
}

render();
