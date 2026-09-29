const input = document.getElementById("city");

let results = [];
let selectedDay = 0;

const citySearch = document.querySelector(".city-search");
const weatherStats = document.querySelector(".weather-stats");
const cityForecast = document.querySelector(".city-forecast");
const dailyForecast = document.querySelector(".daily-forecast");
const hourlyForecast = document.querySelector(".hourly-forecast");

input.addEventListener("input", async () => {
  const city = input.value;

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
  );

  const data = await response.json();

  results = data.results || [];

  const html = results.map((city, index) => {
    return `
      <div class="city-option" data-index="${index}">
        city name ${city.name}, ${city.country}
      </div>
    `;
  });

  citySearch.innerHTML = html.join("");
});

citySearch.addEventListener("click", async (event) => {
  const index = event.target.dataset.index;
  const selectedCity = results[index];

  citySearch.innerHTML = "";

  const lat = selectedCity.latitude;
  const lon = selectedCity.longitude;

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m`,
  );

  const weatherData = await weatherResponse.json();

  const daily = weatherData.daily;

  const temperature = weatherData.current.temperature_2m;
  const feelsLike = weatherData.current.apparent_temperature;
  const humidity = weatherData.current.relative_humidity_2m;
  const wind = weatherData.current.wind_speed_10m;
  const precipitation = weatherData.current.precipitation;

  const hourly = weatherData.hourly.temperature_2m;
  const hourlyTime = weatherData.hourly.time;

  const start = selectedDay * 24;
  const end = start + 24;

  const selectedTemperatures = hourly.slice(start, end);
  const selectedTimes = hourlyTime.slice(start, end);

  console.log(selectedTimes);

  const hourlyHtml = selectedTimes.map((time, index) => {
    const temp = selectedTemperatures[index];
    const hour = time.slice(11, 16);

    return `
      <div>
        ${hour} ${temp}°C
      </div>
    `;
  });

  hourlyForecast.innerHTML = hourlyHtml.join("");

  cityForecast.textContent = `${selectedCity.name}, ${selectedCity.country} ${temperature}°C`;

  input.value = `${selectedCity.name}, ${selectedCity.country}`;

  weatherStats.innerHTML = `
    <p>Feels like: ${feelsLike}°C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind: ${wind} km/h</p>
    <p>Precipitation: ${precipitation} mm</p>
  `;

  const dailyHtml = daily.time.map((day, index) => {
    const date = new Date(day);

    const maxTemp = daily.temperature_2m_max[index];
    const minTemp = daily.temperature_2m_min[index];

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    return `
  <div class="day-option" data-index="${index}">
    <p>${dayName}</p>
    <p>${maxTemp}°</p>
    <p>${minTemp}°</p>
  </div>
    `;
  });

  dailyForecast.innerHTML = dailyHtml.join("");

  dailyForecast.addEventListener("click", (event) => {
    const day = event.target.closest(".day-option");

    if (!day) return;

    selectedDay = Number(day.dataset.index);

    console.log(selectedDay);
  });
});
