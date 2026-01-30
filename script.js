let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

/* TOAST */
function toast(msg, erro=false){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.className = "toast" + (erro ? " erro" : "");
  t.style.display = "block";
  setTimeout(()=>t.style.display="none",3000);
}

/* NAVEGAÇÃO */
function abrirTela(id){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

/* CADASTROS */
function cadastrarCliente(){
  if(!nomeCliente.value) return toast("Informe o nome",true);
  clientes.push({ nome:nomeCliente.value, plano:null });
  localStorage.setItem("clientes",JSON.stringify(clientes));
  nomeCliente.value="";
  toast("Cliente cadastrado com sucesso");
  render();
}

function cadastrarServico(){
  servicos.push({ nome:nomeServico.value, preco:+precoServico.value });
  localStorage.setItem("servicos",JSON.stringify(servicos));
  nomeServico.value=precoServico.value="";
  toast("Serviço cadastrado com sucesso");
  render();
}

function cadastrarProduto(){
  produtos.push({ nome:nomeProduto.value, preco:+precoProduto.value });
  localStorage.setItem("produtos",JSON.stringify(produtos));
  nomeProduto.value=precoProduto.value="";
  toast("Produto cadastrado com sucesso");
}

/* CAIXA */
function abrirCaixa(){
  caixa={ valorInicial:+valorInicial.value, vendas:[] };
  localStorage.setItem("caixa",JSON.stringify(caixa));
  toast("Caixa aberto");
  render();
}

function registrarVenda(){
  const c = clientes[clienteVenda.value];
  const s = servicos[servicoVenda.value];
  caixa.vendas.push({
    tipo:"servico",
    nome:s.nome,
    valor:s.preco,
    data:new Date()
  });
  localStorage.setItem("caixa",JSON.stringify(caixa));
  toast("Venda realizada com sucesso");
  render();
}

function fecharCaixa(){
  localStorage.removeItem("caixa");
  caixa=null;
  toast("Caixa fechado");
  render();
}

/* RELATÓRIOS */
function relatorio(tipo){
  const agora = new Date();
  let total = 0, qtd = 0;

  caixa?.vendas.forEach(v=>{
    const d = new Date(v.data);
    const diff = (agora - d)/(1000*60*60*24);

    if(
      (tipo==="dia" && diff<=1) ||
      (tipo==="semana" && diff<=7) ||
      (tipo==="mes" && diff<=30)
    ){
      total+=v.valor;
      qtd++;
    }
  });

  resultadoRelatorio.innerHTML = `
    <p>Vendas: ${qtd}</p>
    <p>Total: R$ ${total.toFixed(2)}</p>
  `;
}

/* RENDER */
function render(){
  if(!caixa) return;

  clienteVenda.innerHTML="";
  clientes.forEach((c,i)=>clienteVenda.innerHTML+=`<option value="${i}">${c.nome}</option>`);

  servicoVenda.innerHTML="";
  servicos.forEach((s,i)=>servicoVenda.innerHTML+=`<option value="${i}">${s.nome}</option>`);

  const total = caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText=caixa.valorInicial.toFixed(2);
  resVendas.innerText=total.toFixed(2);
  resTotal.innerText=(total+caixa.valorInicial).toFixed(2);
}
