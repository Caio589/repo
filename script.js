const { jsPDF } = window.jspdf;

/* ===== BASE ===== */
function show(id){
  document.querySelectorAll(".section").forEach(s=>{
    if(s) s.classList.remove("active");
  });

  const tela = document.getElementById(id);
  if(!tela){
    console.warn("Tela não encontrada:", id);
    return;
  }

  tela.classList.add("active");
}

const db = JSON.parse(localStorage.getItem("db")) || {
  clientes:[],
  planos:[],
  produtos:[],
  vendas:[],
  despesas:[],
  agenda:[],
  caixa:{aberto:false,abertura:0,dinheiro:0,pix:0,cartao:0}
};

/* blindagem */
Object.assign(db.caixa,{
  abertura:db.caixa.abertura||0,
  dinheiro:db.caixa.dinheiro||0,
  pix:db.caixa.pix||0,
  cartao:db.caixa.cartao||0
});

let carrinho=[];
function save(){localStorage.setItem("db",JSON.stringify(db))}

/* ===== PLANOS (somente serviços existentes) ===== */
function salvarPlano(){
  db.planos.push({
    nome:nomePlano.value,
    valor:+valorPlano.value||0,
    qtd:+qtdPlano.value||0,
    servico:tipoPlano.value
  });
  save(); render();
}

/* ===== CLIENTE (venda do plano entra no caixa) ===== */
function salvarCliente(){
  const plano=db.planos.find(p=>p.nome===planoCliente.value);

  if(plano){
    db.caixa.dinheiro+=plano.valor;
    db.vendas.push({
      data:new Date().toISOString(),
      total:plano.valor,
      tipo:"plano"
    });
  }

  db.clientes.push({
    nome:nomeCliente.value,
    plano:plano?{
      nome:plano.nome,
      servico:plano.servico,
      saldo:plano.qtd
    }:null
  });
  save(); render();
}

/* ===== USO DO PLANO ===== */
function usarPlano(){
  const c=db.clientes.find(c=>c.nome===cliente.value);
  if(!c||!c.plano) return alert("Cliente sem plano");
  if(c.plano.saldo<=0) return alert("Plano esgotado");

  c.plano.saldo--;
  save(); render();
}

/* ===== DESPESAS COM DATA ===== */
function salvarDespesa(){
  db.despesas.push({
    desc:descDespesa.value,
    valor:+valorDespesa.value||0,
    data:new Date().toISOString()
  });
  save(); render();
}

/* ===== RELATÓRIO MENSAL ===== */
function gerarRelatorioMensal(){
  const [ano,mes]=mesRelatorio.value.split("-");
  const vendas=db.vendas.filter(v=>{
    const d=new Date(v.data);
    return d.getFullYear()==ano&&(d.getMonth()+1)==mes;
  });
  const despesas=db.despesas.filter(d=>{
    const dt=new Date(d.data);
    return dt.getFullYear()==ano&&(dt.getMonth()+1)==mes;
  });

  const totalV=vendas.reduce((s,v)=>s+v.total,0);
  const totalD=despesas.reduce((s,d)=>s+d.valor,0);

  resumoMensal.innerHTML=`
    <p>Vendas: R$ ${totalV.toFixed(2)}</p>
    <p>Despesas: R$ ${totalD.toFixed(2)}</p>
    <p><b>Resultado: R$ ${(totalV-totalD).toFixed(2)}</b></p>
  `;
}

/* ===== RESUMO DO CAIXA (TOTAL GERAL) ===== */
function render(){
  const totalCaixa=db.caixa.dinheiro+db.caixa.pix+db.caixa.cartao;

  resumoCaixa.innerHTML=`
    💰 Dinheiro: R$ ${db.caixa.dinheiro.toFixed(2)}<br>
    📲 Pix: R$ ${db.caixa.pix.toFixed(2)}<br>
    💳 Cartão: R$ ${db.caixa.cartao.toFixed(2)}<br>
    <b>Total Geral: R$ ${totalCaixa.toFixed(2)}</b>
  `;
}
