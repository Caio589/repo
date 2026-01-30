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

function abrirCaixa(){
  caixa = { valorInicial:+valorInicial.value, vendas:[], data:new Date() };
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

  caixa.vendas.push({
    cliente:c.nome,
    servico:s.nome,
    valor:s.preco,
    hora:new Date().toLocaleTimeString("pt-BR")
  });

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
  aberturaCaixa.classList.toggle("hidden",!!caixa);
  sistema.classList.toggle("hidden",!caixa);
  if(!caixa) return;

  const total = caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText = caixa.valorInicial.toFixed(2);
  resVendas.innerText = total.toFixed(2);
  resTotal.innerText = (total + caixa.valorInicial).toFixed(2);

  clienteVenda.innerHTML="";
  clientes.forEach((c,i)=>clienteVenda.innerHTML+=`<option value="${i}">${c.nome}</option>`);

  servicoVenda.innerHTML="";
  servicos.forEach((s,i)=>servicoVenda.innerHTML+=`<option value="${i}">${s.nome}</option>`);

  listaVendas.innerHTML="";
  caixa.vendas.forEach(v=>{
    listaVendas.innerHTML+=`<li>${v.hora} - ${v.cliente} - ${v.servico} R$${v.valor}</li>`;
  });
}

function gerarPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 10;
  pdf.text("Fechamento de Caixa - Barbearia",10,y);
  y+=10;

  caixa.vendas.forEach(v=>{
    pdf.text(`${v.hora} - ${v.cliente} - ${v.servico} R$${v.valor}`,10,y);
    y+=8;
  });

  const total = caixa.vendas.reduce((s,v)=>s+v.valor,0);
  y+=10;
  pdf.text(`Total em vendas: R$ ${total.toFixed(2)}`,10,y);

  pdf.save("fechamento-caixa.pdf");
}
