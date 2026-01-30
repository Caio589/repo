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
  nomePlano.value=qtdPlano.value=valorPlano.value="";
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
  nomeCliente.value="";
  render();
}

/* SERVIÇOS */
function cadastrarServico(){
  servicos.push({ nome:nomeServico.value, preco:+precoServico.value });
  localStorage.setItem("servicos",JSON.stringify(servicos));
  nomeServico.value=precoServico.value="";
  render();
}

/* CAIXA */
function abrirCaixa(){
  caixa = { valorInicial:+valorInicial.value, vendas:[] };
  localStorage.setItem("caixa",JSON.stringify(caixa));
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
  localStorage.setItem("caixa",JSON.stringify(caixa));
  localStorage.setItem("clientes",JSON.stringify(clientes));
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa=null;
  render();
}

/* RENDER SEM ERRO */
function render(){
  /* SELECT CLIENTES */
  const selCliente = document.getElementById("clienteVenda");
  if(selCliente){
    selCliente.innerHTML="";
    clientes.forEach((c,i)=>{
      let info = c.plano ? `(${c.plano.total-c.plano.usados})` : "";
      selCliente.innerHTML += `<option value="${i}">${c.nome} ${info}</option>`;
    });
  }

  /* SELECT SERVIÇOS */
  const selServico = document.getElementById("servicoVenda");
  if(selServico){
    selServico.innerHTML="";
    servicos.forEach((s,i)=>{
      selServico.innerHTML += `<option value="${i}">${s.nome}</option>`;
    });
  }

  /* SELECT PLANOS */
  const selPlano = document.getElementById("planoCliente");
  if(selPlano){
    selPlano.innerHTML = `<option value="">Sem plano</option>`;
    planos.forEach((p,i)=>{
      selPlano.innerHTML += `<option value="${i}">${p.nome}</option>`;
    });
  }

  if(!caixa) return;
  const total = caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText = caixa.valorInicial.toFixed(2);
  resVendas.innerText = total.toFixed(2);
  resTotal.innerText = (total + caixa.valorInicial).toFixed(2);
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
