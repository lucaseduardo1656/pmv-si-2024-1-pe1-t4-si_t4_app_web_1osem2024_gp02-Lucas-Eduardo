const CChart = document.getElementById("categoria-Chart");
const EChart = document.getElementById("entry-charts");
const PDChart = document.getElementById("day-charts");

let transactions = [];

// Carregar transações do LocalStorage ou inicializar como vazio
function loadFromLocalStorage() {
  const storedTransactions = localStorage.getItem("transactions");
  transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
}
loadFromLocalStorage();

//Pegando dados necessários

// Categorias fornecidas
const categories = [
  "Mercado",
  "Lazer",
  "Saúde",
  "Transporte",
  "Educação",
  "Casa",
  "Cuidados Pessoais",
  "Viagem",
];

// Inicializa os valores das categorias com zero
let categoryValues = categories.reduce((acc, category) => {
  acc[category] = 0;
  return acc;
}, {});

// Função para mapear categorias das transações para as categorias definidas
function mapCategory(transactionCategory) {
  const categoryMap = {
    mercado: "Mercado",
    lazer: "Lazer",
    saude: "Saúde",
    transporte: "Transporte",
    educação: "Educação",
    compras: "compras",
    casa: "Casa",
    cp: "Cuidados Pessoais",
    viagem: "Viagem",
  };
  return categoryMap[transactionCategory];
}

// Percorre as transações e adiciona os valores às categorias correspondentes
transactions.forEach((transaction) => {
  //console.log(transaction.value); // Exibe o valor de cada transação
  //console.log(transaction.category); // Exibe a categoria de cada transação
  const mappedCategory = mapCategory(transaction.category);
  if (categoryValues.hasOwnProperty(mappedCategory)) {
    categoryValues[mappedCategory] += transaction.value;
  }
});

const data = categories.map((category) => categoryValues[category]);

// Separar receitas e despesas
const receitas = transactions.filter(
  (transaction) => transaction.type === "Receita"
);
const despesas = transactions.filter(
  (transaction) => transaction.type === "Despesa"
);

// Calcular totais de receitas e despesas a partir das transações
const totalReceitas = receitas.reduce(
  (acc, transaction) => acc + transaction.value,
  0
);
const totalDespesas = despesas.reduce(
  (acc, transaction) => acc + transaction.value,
  0
);

// Agrupar transações por dia e calcular saldo diário
const dailyBalances = transactions.reduce((acc, transaction) => {
  const date = transaction.date;
  const value =
    transaction.type === "Receita" ? transaction.value : -transaction.value;

  if (!acc[date]) {
    acc[date] = 0;
  }
  acc[date] += value;

  return acc;
}, {});

const dates = Object.keys(dailyBalances);
const balances = Object.values(dailyBalances);
const backgroundColors = balances.map((balance) =>
  balance >= 0 ? "rgba(54, 162, 235)" : "rgba(255, 99, 132)"
);

// Configuração dos gráficos usando a biblioteca Chart.js

const graficoCategoria = new Chart(CChart, {
  type: "bar",
  data: {
    labels: categories,
    datasets: [
      {
        label: "Valor Gasto",
        data: data,
        borderWidth: 1,
        backgroundColor: "rgb(0, 132, 255)",
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const graficoReceitaDespesa = new Chart(EChart, {
  type: "bar",
  data: {
    labels: ["Receitas", "Despesas"],
    datasets: [
      {
        label: "Valor",
        data: [totalReceitas, totalDespesas],
        borderWidth: 1,
        backgroundColor: [
          "rgba(54, 162, 235)", // Azul claro para receitas
          "rgba(255, 99, 132)", // Vermelho claro para despesas
        ],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
      },
    ],
  },
  options: {
    indexAxis: "y",
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const graficoBalancoDiario = new Chart(PDChart, {
  type: "bar",
  data: {
    labels: dates,
    datasets: [
      {
        label: "Balanço Diário",
        data: balances,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value, index, values) {
            return value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
          },
        },
      },
    },
  },
});
