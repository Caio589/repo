let caixa = JSON.parse(localStorage.getItem("caixa")) || null;
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];

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

function registrarVenda() {
  const idx = servicoVenda.value;
  if (idx === "") return;

  const servico = servicos[idx];

  caixa.vendas.push({
    nome: servico.nome,
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

  resInicial.innerText = caixa.valorInicial.toFixed(2);
  const totalVendas = caixa.vendas.reduce((s, v) => s + v.preco, 0);
  resVendas.innerText = totalVendas.toFixed(2);
  resTotal.innerText = (caixa.valorInicial + totalVendas).toFixed(2);

  servicoVenda.innerHTML = `<option value="">Selecione</option>`;
  servicos.forEach((s, i) => {
    servicoVenda.innerHTML += `<option value="${i}">${s.nome} - R$${s.preco}</option>`;
  });

  listaVendas.innerHTML = "";
  caixa.vendas.forEach(v => {
    listaVendas.innerHTML += `<li>${v.hora} - ${v.nome} - R$${v.preco}</li>`;
  });
}

render();
