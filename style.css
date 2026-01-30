let caixa = JSON.parse(localStorage.getItem("caixa")) || null;

function abrirCaixa() {
  const valorInicial = parseFloat(document.getElementById("valorInicial").value);

  if (isNaN(valorInicial) || valorInicial < 0) {
    alert("Informe um valor inicial válido");
    return;
  }

  caixa = {
    aberto: true,
    valorInicial: valorInicial,
    dataAbertura: new Date().toLocaleString("pt-BR"),
    vendas: []
  };

  localStorage.setItem("caixa", JSON.stringify(caixa));
  render();
}

function fecharCaixa() {
  if (!confirm("Deseja realmente fechar o caixa?")) return;

  localStorage.removeItem("caixa");
  caixa = null;
  render();
}

function render() {
  const abertura = document.getElementById("aberturaCaixa");
  const aberto = document.getElementById("caixaAberto");

  if (caixa && caixa.aberto) {
    abertura.classList.add("hidden");
    aberto.classList.remove("hidden");

    document.getElementById("dataAbertura").innerText = caixa.dataAbertura;
    document.getElementById("valorAbertura").innerText = caixa.valorInicial.toFixed(2);
  } else {
    abertura.classList.remove("hidden");
    aberto.classList.add("hidden");
  }
}

render();
