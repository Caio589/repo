let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

/* SPLASH */
window.onload=()=>{
  if(localStorage.getItem("splash_ok")){
    const s=document.getElementById("splash");
    if(s) s.style.display="none";
  }
  render();
};

/* TOAST */
function toast(msg,erro=false){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.className="toast"+(erro?" erro":"");
  t.style.display="block";
  setTimeout(()=>t.style.display="none",2500);
}

/* NAVEGAÇÃO */
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
  toast("Plano cadastrado");
  render();
}

/* CLIENTES */
function cadastrarCliente(){
  let plano=null;
  if(planoCliente.value!==""){
    const p=planos[planoCliente.value];
    const hoje=new Date();
    const fim=new Date();
    fim.setDate(hoje.getDate()+30);
    plano={
      nome:p.nome,total:p.total,usados:0,valor:p.valor,
      inicio:hoje.toISOString().split("T")[0],
      fim:fim.toISOString().split("T")[0]
    };
  }
  clientes.push({nome:nomeCliente.value,plano});
  localStorage.setItem("clientes",JSON.stringify(clientes));
  nomeCliente.value="";
  toast("Cliente cadastrado");
  render();
}

/* VALIDA PLANO */
function planoValido(c){
  if(!c.plano) return true;
  if(c.plano.usados>=c.plano.total) return false;
  if(new Date(c.plano.fim)<new Date()) return false;
  return true;
}

/* SERVIÇOS */
function cadastrarServico(){
  servicos.push({nome:nomeServico.value,preco:+precoServico.value});
  localStorage.setItem("servicos",JSON.stringify(servicos));
  nomeServico.value=precoServico.value="";
  toast("Serviço cadastrado");
  render();
}

/* PRODUTOS */
function cadastrarProduto(){
  produtos.push({nome:nomeProduto.value,preco:+precoProduto.value});
  localStorage.setItem("produtos",JSON.stringify(produtos));
  nomeProduto.value=precoProduto.value="";
  toast("Produto cadastrado");
  render();
}

/* CAIXA */
function abrirCaixa(){
  caixa={valorInicial:+valorInicial.value,vendas:[]};
  localStorage.setItem("caixa",JSON.stringify(caixa));
  toast("Caixa aberto");
  render();
}

function registrarVenda(){
  if(!caixa) return toast("Abra o caixa",true);
  const c=clientes[clienteVenda.value];
  const s=servicos[servicoVenda.value];

  if(!planoValido(c)) return toast("Plano vencido ou esgotado",true);

  let valor=s.preco;
  if(c.plano){ c.plano.usados++; valor=0; }

  caixa.vendas.push({cliente:c.nome,servico:s.nome,valor,data:new Date()});
  localStorage.setItem("caixa",JSON.stringify(caixa));
  localStorage.setItem("clientes",JSON.stringify(clientes));
  toast("Corte registrado");
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa=null;
  toast("Caixa fechado");
  render();
}

/* PDF */
function gerarPDF(){
  if(!caixa) return;
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF();
  let y=10;
  pdf.text("Fechamento de Caixa",10,y);
  caixa.vendas.forEach(v=>{
    y+=8;
    pdf.text(`${v.cliente} - ${v.servico} R$${v.valor}`,10,y);
  });
  pdf.save("caixa.pdf");
}

/* RENDER */
function render(){
  clienteVenda.innerHTML=clientes.map((c,i)=>{
    let info=c.plano?`(${c.plano.total-c.plano.usados})`:"";
    return `<option value="${i}">${c.nome} ${info}</option>`;
  }).join("");

  servicoVenda.innerHTML=servicos.map((s,i)=>`<option value="${i}">${s.nome}</option>`).join("");

  listaVendas.innerHTML=caixa?caixa.vendas.map(v=>`<li>${v.cliente} - ${v.servico} R$${v.valor}</li>`).join(""):"";

  listaClientes.innerHTML=clientes.map(c=>{
    if(!c.plano) return `<li>${c.nome} (avulso)</li>`;
    return `<li>${c.nome} • ${c.plano.nome} • ${c.plano.total-c.plano.usados} usos</li>`;
  }).join("");

  listaServicos.innerHTML=servicos.map(s=>`<li>${s.nome} R$${s.preco}</li>`).join("");
  listaProdutos.innerHTML=produtos.map(p=>`<li>${p.nome} R$${p.preco}</li>`).join("");
  listaPlanos.innerHTML=planos.map(p=>`<li>${p.nome} • ${p.total} cortes • R$${p.valor}</li>`).join("");

  planoCliente.innerHTML=`<option value="">Sem plano</option>`;
  planos.forEach((p,i)=>planoCliente.innerHTML+=`<option value="${i}">${p.nome}</option>`);

  if(!caixa) return;
  const total=caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText=caixa.valorInicial;
  resVendas.innerText=total.toFixed(2);
  resTotal.innerText=(total+caixa.valorInicial).toFixed(2);

  /* RELATÓRIO DE PLANOS */
  const ativos=clientes.filter(c=>c.plano).length;
  const usados=clientes.reduce((s,c)=>s+(c.plano?c.plano.usados:0),0);
  relatorioPlanos.innerHTML=
    `<p>Clientes com plano: ${ativos}</p>
     <p>Cortes usados: ${usados}</p>`;
}
