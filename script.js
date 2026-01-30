let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

function entrarSistema(){
  document.getElementById("splash").style.display = "none";
  localStorage.setItem("splash_ok","1");
}

window.onload = () => {
  if(localStorage.getItem("splash_ok")){
    document.getElementById("splash").style.display = "none";
  }
  render();
};

function abrirTela(id){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

/* PLANOS */
function cadastrarPlano(){
  planos.push({
    nome:nomePlano.value,
    total:+qtdPlano.value,
    valor:+valorPlano.value
  });
  localStorage.setItem("planos",JSON.stringify(planos));
  render();
}

/* CLIENTES */
function cadastrarCliente(){
  const p = planos[planoCliente.value];
  clientes.push({
    nome:nomeCliente.value,
    plano: p ? { nome:p.nome, total:p.total, usados:0 } : null
  });
  localStorage.setItem("clientes",JSON.stringify(clientes));
  render();
}

/* SERVIÇOS */
function cadastrarServico(){
  servicos.push({ nome:nomeServico.value, preco:+precoServico.value });
  localStorage.setItem("servicos",JSON.stringify(servicos));
  render();
}

/* CAIXA */
function abrirCaixa(){
  caixa = { valorInicial:+valorInicial.value, vendas:[] };
  salvar();
  render();
}

function registrarVenda(){
  const c = clientes[clienteVenda.value];
  const s = servicos[servicoVenda.value];

  let valor = s.preco;

  if(c.plano){
    if(c.plano.usados >= c.plano.total){
      alert("Plano esgotado");
      return;
    }
    c.plano.usados++;
    valor = 0;
  }

  caixa.vendas.push({ cliente:c.nome, servico:s.nome, valor });
  salvar();
  localStorage.setItem("clientes",JSON.stringify(clientes));
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa = null;
  render();
}

function salvar(){
  localStorage.setItem("caixa",JSON.stringify(caixa));
}

function render(){
  /* selects */
  clienteVenda.innerHTML="";
  clientes.forEach((c,i)=>{
    let info = c.plano ? `(${c.plano.total-c.plano.usados})` : "";
    clienteVenda.innerHTML += `<option value="${i}">${c.nome} ${info}</option>`;
  });

  servicoVenda.innerHTML="";
  servicos.forEach((s,i)=>{
    servicoVenda.innerHTML += `<option value="${i}">${s.nome}</option>`;
  });

  planoCliente.innerHTML=`<option value="">Sem plano</option>`;
  planos.forEach((p,i)=>{
    planoCliente.innerHTML += `<option value="${i}">${p.nome}</option>`;
  });

  if(!caixa) return;
  const total = caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText = caixa.valorInicial.toFixed(2);
  resVendas.innerText = total.toFixed(2);
  resTotal.innerText = (total+caixa.valorInicial).toFixed(2);
}

function gerarPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 10;
  pdf.text("Fechamento de Caixa",10,y);
  caixa.vendas.forEach(v=>{
    y+=8;
    pdf.text(`${v.cliente} - ${v.servico} R$${v.valor}`,10,y);
  });
  pdf.save("caixa.pdf");
}
