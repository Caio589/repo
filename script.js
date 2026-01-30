const { jsPDF } = window.jspdf;

/* ===== BASE ===== */
function show(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

const db = JSON.parse(localStorage.getItem("db")) || {
  produtos:[
    {nome:"Corte",valor:30},
    {nome:"Barba",valor:20}
  ],
  vendas:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};

/* 🔒 Blindagem contra undefined */
db.caixa.abertura = db.caixa.abertura || 0;
db.caixa.dinheiro = db.caixa.dinheiro || 0;
db.caixa.pix = db.caixa.pix || 0;
db.caixa.cartao = db.caixa.cartao || 0;

let carrinho=[];
function save(){localStorage.setItem("db",JSON.stringify(db))}

/* ===== CAIXA ===== */
function abrirCaixa(){
  db.caixa.aberto=true;
  db.caixa.abertura=+valorAbertura.value||0;
  save(); render();
}

function addItem(){
  const [nome,valor]=produto.value.split("|");
  carrinho.push({nome,valor:+valor});
  renderCarrinho();
}

function finalizarVenda(){
  if(!db.caixa.aberto) return alert("Caixa fechado");
  if(carrinho.length===0) return alert("Carrinho vazio");

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
  db.caixa.dinheiro=0;
  db.caixa.pix=0;
  db.caixa.cartao=0;
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
  resumoMensal.innerHTML=`Total do mês: R$ ${total.toFixed(2)}`;

  const pdf=new jsPDF();
  let y=20;
  pdf.text(`Relatório ${mes}/${ano}`,20,y); y+=10;
  vendas.forEach(v=>{
    pdf.text(`Venda: R$ ${v.total.toFixed(2)}`,20,y);
    y+=7;
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

  produto.innerHTML=db.produtos.map(p=>
    `<option value="${p.nome}|${p.valor}">${p.nome}</option>`
  ).join("");

  resumoCaixa.innerHTML=`
    💰 Dinheiro: R$ ${(db.caixa.dinheiro||0).toFixed(2)}<br>
    📲 Pix: R$ ${(db.caixa.pix||0).toFixed(2)}<br>
    💳 Cartão: R$ ${(db.caixa.cartao||0).toFixed(2)}
  `;
}

render();
