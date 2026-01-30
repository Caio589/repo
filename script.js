let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

/* SPLASH */
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

/* TOAST */
function toast(msg, erro=false){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.className="toast"+(erro?" erro":"");
  t.style.display="block";
  setTimeout(()=>t.style.display="none",3000);
}

/* NAVEGAÇÃO */
function abrirTela(id){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

/* CADASTROS */
function cadastrarCliente(){
  if(!nomeCliente.value) return toast("Nome obrigatório",true);
  clientes.push({nome:nomeCliente.value});
  localStorage.setItem("clientes",JSON.stringify(clientes));
  nomeCliente.value="";
  toast("Cliente cadastrado");
  render();
}

function cadastrarServico(){
  servicos.push({nome:nomeServico.value,preco:+precoServico.value});
  localStorage.setItem("servicos",JSON.stringify(servicos));
  nomeServico.value=precoServico.value="";
  toast("Serviço cadastrado");
  render();
}

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
  caixa.vendas.push({
    cliente:c.nome,
    servico:s.nome,
    valor:s.preco,
    data:new Date()
  });
  localStorage.setItem("caixa",JSON.stringify(caixa));
  toast("Venda realizada");
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa=null;
  toast("Caixa fechado");
  render();
}

/* RELATÓRIO */
function relatorio(dias){
  if(!caixa) return;
  const agora=new Date();
  let total=0,qtd=0;
  caixa.vendas.forEach(v=>{
    if((agora-new Date(v.data))/(1000*60*60*24)<=dias){
      total+=v.valor;
      qtd++;
    }
  });
  resultadoRelatorio.innerHTML=
    `<p>Vendas: ${qtd}</p><p>Total: R$ ${total.toFixed(2)}</p>`;
}

/* RENDER */
function render(){
  clienteVenda.innerHTML=clientes.map((c,i)=>`<option value="${i}">${c.nome}</option>`).join("");
  listaClientes.innerHTML=clientes.map(c=>`<li>${c.nome}</li>`).join("");

  servicoVenda.innerHTML=servicos.map((s,i)=>`<option value="${i}">${s.nome}</option>`).join("");
  listaServicos.innerHTML=servicos.map(s=>`<li>${s.nome} - R$${s.preco}</li>`).join("");

  listaProdutos.innerHTML=produtos.map(p=>`<li>${p.nome} - R$${p.preco}</li>`).join("");

  if(!caixa) return;

  listaVendas.innerHTML=caixa.vendas.map(v=>
    `<li>${v.cliente} - ${v.servico} R$${v.valor}</li>`
  ).join("");

  const total=caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText=caixa.valorInicial;
  resVendas.innerText=total.toFixed(2);
  resTotal.innerText=(total+caixa.valorInicial).toFixed(2);
}
