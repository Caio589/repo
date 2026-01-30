let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

let grafico;

/* TOAST */
function toast(msg){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",2500);
}

/* NAVEGAÇÃO */
function abrirTela(id){
  document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
  if(id==="relatorios") gerarGraficoMensal();
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
    plano={...p,usados:0,inicio:hoje,fim};
  }
  clientes.push({nome:nomeCliente.value,plano});
  localStorage.setItem("clientes",JSON.stringify(clientes));
  nomeCliente.value="";
  toast("Cliente cadastrado");
  render();
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
  const c=clientes[clienteVenda.value];
  const s=servicos[servicoVenda.value];

  let valor=s.preco;
  if(c.plano && c.plano.usados<c.plano.total){
    c.plano.usados++;
    valor=0;
  }

  caixa.vendas.push({
    valor,
    data:new Date()
  });

  localStorage.setItem("caixa",JSON.stringify(caixa));
  localStorage.setItem("clientes",JSON.stringify(clientes));
  toast("Venda registrada");
  render();
}

/* RENDER */
function render(){
  clienteVenda.innerHTML=clientes.map((c,i)=>`<option value="${i}">${c.nome}</option>`).join("");
  servicoVenda.innerHTML=servicos.map((s,i)=>`<option value="${i}">${s.nome}</option>`).join("");

  listaClientes.innerHTML=clientes.map(c=>`<li>${c.nome}</li>`).join("");
  listaServicos.innerHTML=servicos.map(s=>`<li>${s.nome} - R$${s.preco}</li>`).join("");
  listaProdutos.innerHTML=produtos.map(p=>`<li>${p.nome} - R$${p.preco}</li>`).join("");
  listaPlanos.innerHTML=planos.map(p=>`<li>${p.nome} (${p.total} cortes)</li>`).join("");

  planoCliente.innerHTML=`<option value="">Sem plano</option>`;
  planos.forEach((p,i)=>planoCliente.innerHTML+=`<option value="${i}">${p.nome}</option>`);

  if(!caixa) return;
  const total=caixa.vendas.reduce((s,v)=>s+v.valor,0);
  resInicial.innerText=caixa.valorInicial;
  resVendas.innerText=total.toFixed(2);
  resTotal.innerText=(total+caixa.valorInicial).toFixed(2);
}

/* GRÁFICO MENSAL */
function gerarGraficoMensal(){
  if(!caixa) return;
  const dias={};
  caixa.vendas.forEach(v=>{
    const d=new Date(v.data).getDate();
    dias[d]=(dias[d]||0)+v.valor;
  });

  const labels=Object.keys(dias);
  const valores=Object.values(dias);

  const ctx=document.getElementById("graficoMensal");

  if(grafico) grafico.destroy();

  grafico=new Chart(ctx,{
    type:"bar",
    data:{
      labels,
      datasets:[{
        label:"Faturamento diário",
        data:valores
      }]
    }
  });
}

render();
