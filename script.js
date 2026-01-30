let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

function abrirCaixa() {
  const valor = parseFloat(valorInicial.value);
  if (isNaN(valor) || valor < 0) return alert("Valor inválido");

  caixa = {
    aberto: true,
    valorInicial: valor,
    vendas: [],
    data: new Date().toLocaleString("pt-BR")
  };

  salvar();
  render();
}

/* CLIENTES */
function cadastrarCliente() {
  const nome = nomeCliente.value.trim();
  const tel = telCliente.value.trim();

  if (!nome) return alert("Informe o nome do cliente");

  clientes.push({ nome, tel });
  localStorage.setItem("clientes", JSON.stringify(clientes));

  nomeCliente.value = "";
  telCliente.value = "";
  render();
}

/* SERVIÇOS */
function cadastrarServico() {
  const nome = nomeServico.value.trim();
  const preco = parseFloat(precoServico.value);
  if (!nome || isNaN(preco)) return alert("Dados inválidos");

  servicos.push({ nome, preco });
  localStorage.setItem("servicos", JSON.stringify(servicos));

  nomeServico.value = "";
  precoServico.value = "";
  render();
}

/* VENDA */
function registrarVenda() {
  const idxCliente = clienteVenda.value;
  const idxServico = servicoVenda.value;

  if (idxServico === "") return alert("Selecione um serviço");

  const cliente = clientes[idxCliente] || { nome: "Cliente não informado" };
  const servico = servicos[idxServico];

  caixa.vendas.push({
    cliente: cliente.nome,
    servico: servico.nome,
    preco: servico.preco,
    hora: new Date().toLocaleTimeString("pt-BR")
  });

  salvar();
  render();
}

function fecharCaixa() {
  if (!confirm("Fechar caixa?")) return;
  localStorage.removeItem("caixa");
  caixa = null;
  render();
}

function salvar() {
  localStorage.setItem("caixa", JSON.stringify(caixa));
}

function render() {
  aberturaCaixa.classList.toggle("hidden", caixa && caixa.aberto);
  sistema.classList.toggle("hidden", !(caixa && caixa.aberto));
  if (!caixa) return;

  /* RESUMO */
  resInicial.innerText = caixa.valorInicial.toFixed(2);
  const totalVendas = caixa.vendas.reduce((s, v) => s + v.preco, 0);
  resVendas.innerText = totalVendas.toFixed(2);
  resTotal.innerText = (caixa.valorInicial + totalVendas).toFixed(2);

  /* SELECT CLIENTES */
  clienteVenda.innerHTML = `<option value="">Cliente</option>`;
  clientes.forEach((c, i) => {
    clienteVenda.innerHTML += `<option value="${i}">${c.nome}</option>`;
  });

  /* SELECT SERVIÇOS */
  servicoVenda.innerHTML = `<option value="">Serviço</option>`;
  servicos.forEach((s, i) => {
    servicoVenda.innerHTML += `<option value="${i}">${s.nome} - R$${s.preco}</option>`;
  });

  /* HISTÓRICO */
  listaVendas.innerHTML = "";
  caixa.vendas.forEach(v => {
    listaVendas.innerHTML += `
      <li>
        ${v.hora} - ${v.cliente}<br>
        ${v.servico} - R$${v.preco}
      </li>`;
  });
}

render();
