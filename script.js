let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];

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

/* SISTEMA */
function abrirCaixa(){
  caixa = { valorInicial:+valorInicial.value, vendas:[] };
  salvar();
  render();
}

function cadastrarCliente(){
  clientes.push({ nome:nomeCliente.value });
  nomeCliente.value="";
  localStorage.setItem("clientes",JSON.stringify(clientes));
  render();
}

function cadastrarServico(){
  servicos.push({ nome:nomeServico.value, preco:+precoServico.value });
  nomeServico.value=precoServico.value="";
  localStorage.setItem("servicos",JSON.stringify(servicos));
  render();
}

function registrarVenda(){
  const c = clientes[clienteVenda.value];
  const s = servicos[servicoVenda.value];
  caixa.vendas.push({ cliente:c.nome, servico:s.nome, valor:s.preco });
  salvar();
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa=null;
  render();
}

function salvar(){
  localStorage.setItem("caixa",JSON.stringify(caixa));
}

function render(){
  clienteVenda.innerHTML="";
  clientes.forEach((c,i)=>clienteVenda.innerHTML+=`<option value="${i}">${c.nome}</option>`);

  servicoVenda.innerHTML="";
  servicos.forEach((s,i)=>servicoVenda.innerHTML+=`<option value="${i}">${s.nome}</option>`);

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
