/* ===== TELAS ===== */
function show(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ===== DB ===== */
const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[], planos:[], produtos:[], vendas:[], despesas:[], agenda:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};
let carrinho=[];
function save(){localStorage.setItem("db",JSON.stringify(db))}

/* ===== CAIXA ===== */
function abrirCaixa(){db.caixa.aberto=true;db.caixa.abertura=+valorAbertura.value||0;save();render()}
function fecharCaixa(){db.caixa.aberto=false;db.caixa.dinheiro=db.caixa.pix=db.caixa.cartao=0;save();render()}

/* ===== PRODUTOS ===== */
function salvarProduto(){
  db.produtos.push({nome:nomeProd.value,valor:+valorProd.value||0,tipo:tipoProd.value});
  save();render();
}

/* ===== PLANOS ===== */
function salvarPlano(){
  db.planos.push({nome:nomePlano.value,valor:+valorPlano.value||0,qtd:+qtdPlano.value||0,servico:tipoPlano.value});
  save();render();
}

/* ===== CLIENTES ===== */
function salvarCliente(){
  const plano=db.planos.find(p=>p.nome===planoCliente.value);
  db.clientes.push({nome:nomeCliente.value,plano:plano?{nome:plano.nome,servico:plano.servico,saldo:plano.qtd}:null});
  save();render();
}
function renovarPlanoCliente(){
  const c=db.clientes.find(c=>c.nome===cliente.value);
  if(!c||!c.plano)return alert("Cliente sem plano");
  const p=db.planos.find(p=>p.nome===c.plano.nome);
  c.plano.saldo+=p.qtd;
  db.caixa.dinheiro+=p.valor;
  db.vendas.push({data:new Date().toISOString(),total:p.valor});
  save();render();
}

/* ===== DESPESAS ===== */
function salvarDespesa(){
  db.despesas.push({desc:descDespesa.value,valor:+valorDespesa.value||0,data:new Date().toISOString()});
  save();render();
}

/* ===== AGENDA ===== */
function gerarHorarios15(){
  let h=[];for(let i=8;i<=20;i++)["00","15","30","45"].forEach(m=>h.push(`${String(i).padStart(2,"0")}:${m}`));
  return h;
}
function salvarAgendamento(){
  db.agenda.push({data:dataAgenda.value,hora:horaAgenda.value,cliente:clienteAgenda.value,servico:servicoAgenda.value});
  save();render();
}
function removerAgendamento(i){db.agenda.splice(i,1);save();render()}

/* ===== PDV ===== */
function addItem(){
  const [n,v]=produto.value.split("|");
  carrinho.push({nome:n,valor:+v});
  renderCarrinho();
}
function usarPlano(){
  const c=db.clientes.find(c=>c.nome===cliente.value);
  if(!c||!c.plano||c.plano.saldo<=0)return alert("Plano inválido");
  c.plano.saldo--;save();render();
}
function finalizarVenda(){
  const total=carrinho.reduce((s,i)=>s+i.valor,0);
  if(pagamento.value==="dinheiro")db.caixa.dinheiro+=total;
  if(pagamento.value==="pix")db.caixa.pix+=total;
  if(pagamento.value==="cartao")db.caixa.cartao+=total;
  db.vendas.push({data:new Date().toISOString(),total});
  carrinho=[];save();render();
}

/* ===== RELATÓRIO ===== */
function gerarRelatorioMensal(){
  const [a,m]=mesRelatorio.value.split("-");
  const v=db.vendas.filter(v=>{const d=new Date(v.data);return d.getFullYear()==a&&d.getMonth()+1==m});
  const d=db.despesas.filter(d=>{const dt=new Date(d.data);return dt.getFullYear()==a&&dt.getMonth()+1==m});
  const tv=v.reduce((s,x)=>s+x.total,0);
  const td=d.reduce((s,x)=>s+x.valor,0);
  resumoMensal.innerHTML=`Vendas: R$ ${tv.toFixed(2)}<br>Despesas: R$ ${td.toFixed(2)}<br><b>Resultado: R$ ${(tv-td).toFixed(2)}</b>`;
}

/* ===== RENDER ===== */
function renderCarrinho(){
  let h="<tr><th>Item</th><th>Valor</th></tr>",s=0;
  carrinho.forEach(i=>{h+=`<tr><td>${i.nome}</td><td>${i.valor.toFixed(2)}</td></tr>`;s+=i.valor});
  carrinhoElem.innerHTML=h;total.innerText=s.toFixed(2);
}
function render(){
  statusCaixa.innerText=db.caixa.aberto?"🟢 Caixa aberto":"🔴 Caixa fechado";
  abrirBox.style.display=db.caixa.aberto?"none":"block";
  produto.innerHTML=db.produtos.map(p=>`<option value="${p.nome}|${p.valor}">${p.nome}</option>`).join("");
  cliente.innerHTML=db.clientes.map(c=>`<option>${c.nome}</option>`).join("");
  clienteAgenda.innerHTML=cliente.innerHTML;
  tipoPlano.innerHTML=db.produtos.filter(p=>p.tipo==="servico").map(p=>`<option>${p.nome}</option>`).join("");
  planoCliente.innerHTML=`<option value="">Sem plano</option>`+db.planos.map(p=>`<option>${p.nome}</option>`).join("");
  servicoAgenda.innerHTML=tipoPlano.innerHTML;
  horaAgenda.innerHTML=gerarHorarios15().map(h=>`<option>${h}</option>`).join("");
  listaAgenda.innerHTML=db.agenda.map((a,i)=>`<li>${a.data} ${a.hora} ${a.cliente} <button onclick="removerAgendamento(${i})">✏️</button></li>`).join("");
  listaClientes.innerHTML=db.clientes.map(c=>`<li>${c.nome} ${c.plano?`| Plano ${c.plano.nome} (${c.plano.saldo})`:""}</li>`).join("");
  listaPlanos.innerHTML=db.planos.map(p=>`<li>${p.nome}</li>`).join("");
  listaProdutos.innerHTML=db.produtos.map(p=>`<li>${p.nome}</li>`).join("");
  listaDespesas.innerHTML=db.despesas.map(d=>`<li>${d.desc} - ${d.valor}</li>`).join("");
  resumoCaixa.innerHTML=`💰 ${db.caixa.dinheiro.toFixed(2)} | 📲 ${db.caixa.pix.toFixed(2)} | 💳 ${db.caixa.cartao.toFixed(2)}`;
}
render();
