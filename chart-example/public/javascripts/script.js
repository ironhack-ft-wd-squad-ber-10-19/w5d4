const getStockData = symbol => {
  axios
    .get(
      `https://cloud.iexapis.com/v1/stock/${symbol}/chart?token=pk_a1e1e222130a4dc19368b57f2a8340fb`
    )
    .then(response => {
      console.log(response.data);
      const dates = response.data.map(el => {
        return el.date;
      });
      console.log(dates);
      const closes = response.data.map(el => {
        return el.close;
      });
      console.log(closes);

      drawCanvas(dates, closes);
    })
    .catch(err => {
      console.log(err);
    });
};

const drawCanvas = (labels, data) => {
  const ctx = document.getElementById("myChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          label: "Stocks chart",
          data: data
        }
      ]
    }
  });
};

document.querySelector("button").onclick = () => {
  const symbol = document.getElementById("symbol").value;
  getStockData(symbol);
};
