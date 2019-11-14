// fetch(`https://restcountries.eu/rest/v2/name/${countryName}`)
//     .then(response => {
//       return response.json();
//     })
//     .then(data => {
//       const countryDetail = data[0];

const getCountryDetail = countryName => {
  axios
    .get(`https://restcountries.eu/rest/v2/name/${countryName}`)
    .then(response => {
      console.log(response.data[0]);
      const countryDetail = response.data[0];

      document.getElementById("country-name").innerText = countryDetail.name;

      document.getElementById("country-capital").innerText =
        countryDetail.capital;

      document.getElementById("country-population").innerText =
        countryDetail.population;

      document
        .getElementById("country-flag")
        .setAttribute("src", countryDetail.flag);
    })
    .catch(err => {
      console.log(err);
    });
};

document.querySelector("button").onclick = () => {
  const inputValue = document.getElementById("country-search").value;
  console.log(inputValue);
  getCountryDetail(inputValue);
};

getCountryDetail("Argentina");
