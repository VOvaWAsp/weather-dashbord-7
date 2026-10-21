const apiKey = "a66281db80595ed12520a9c8df8e5b0a";

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

const cityInput = document.querySelector(".input-selection input");
const cityButton = document.querySelector(".input-selection button");

const error = document.querySelector(".error");
const containerSingle = document.querySelector(".container-single-weather");
const listContainer = document.querySelector(".container-forecast-weather");
const title = document.querySelector(".title");
const weatherImg = document.querySelector(".weather-img");
const avgTemp = document.querySelector("#avg-temp");

const weatherTranslations = {
  "clear sky": "Ясно",
  "few clouds": "Малохмарно",
  "scattered clouds": "Мінлива хмарність",
  "broken clouds": "Хмарно",
  "overcast clouds": "Похмуро",
  "shower rain": "Злива",
  rain: "Дощ",
  "light rain": "Невеликий дощ",
  "moderate rain": "Помірний дощ",
  "heavy intensity rain": "Сильний дощ",
  thunderstorm: "Гроза",
  snow: "Сніг",
  mist: "Туман",
  fog: "Туман",
};

async function getWeather(city) {
  try {

    const response = await fetch(
      `${apiUrl}${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ua`
    );

    const data = await response.json();

    if (!response.ok) {
      error.style.display = "block";
      containerSingle.style.display = "none";
      listContainer.style.display = "none";
      title.style.display = "none";
      avgTemp.textContent = "Середня температура: —";
      return;
    }

    const temperature = Math.round(data.main.temp);

    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = `${temperature}°C`;

    document.querySelector(".description").textContent =
      weatherTranslations[data.weather[0].description] ||
      data.weather[0].description;

    weatherImg.src =
      `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    weatherImg.alt = data.weather[0].description;

    containerSingle.classList.remove("cold", "warm", "mild");

    if (temperature <= 10) {
      containerSingle.classList.add("cold");
    } else if (temperature >= 25) {
      containerSingle.classList.add("warm");
    } else {
      containerSingle.classList.add("mild");
    }

    error.style.display = "none";
    containerSingle.style.display = "grid";
    listContainer.style.display = "grid";
    title.style.display = "block";

  } catch (err) {
    console.error(err);
  }
}

function renderForecast(days) {
  listContainer
    .querySelectorAll(".forecast-card")
    .forEach((card) => card.remove());

  if (days.length === 0) {
    avgTemp.textContent = "Прогноз відсутній";
    return;
  }

  let totalTemp = 0;

  days.forEach((day) => {
    const date = new Date(day.dt_txt);

    const description =
      weatherTranslations[day.weather[0].description] ||
      day.weather[0].description;

    const temp = Math.round(day.main.temp);
    totalTemp += temp;

    const card = document.createElement("article");
    card.classList.add("forecast-card");

    if (temp < 0) {
      card.classList.add("cold");
    }

    card.dataset.date = day.dt_txt;

    const titleDay = document.createElement("h3");
    titleDay.textContent = date.toLocaleDateString("uk-UA");

    const icon = document.createElement("img");
    icon.classList.add("forecast-icon");
    icon.src =
      `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    icon.alt = description;

    const tempText = document.createElement("p");
    tempText.textContent = `${temp}°C`;

    const desc = document.createElement("p");
    desc.textContent = description;

    card.append(titleDay, icon, tempText, desc);

    listContainer.append(card);
  });

  const average = (totalTemp / days.length).toFixed(1);

  avgTemp.textContent = `Середня температура: ${average}°C`;
}

async function getForecast(city) {
  try {
    const response = await fetch(
      `${forecastUrl}${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ua`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Не вдалося отримати прогноз");
    }

    const days = data.list
      .filter((item, index) => index % 4 === 0)
      .slice(0, 7);

    renderForecast(days);
  } catch (err) {
    console.error("Помилка отримання прогнозу:", err);
    avgTemp.textContent = "Не вдалося завантажити прогноз";
  }
}

cityButton.addEventListener("click", () => {

  const city = cityInput.value.trim();

  if (!city) return;

  getWeather(city);
  getForecast(city);

  cityInput.value = "";

});

cityInput.addEventListener("keydown", (e) => {

  if (e.key === "Enter") {

    const city = cityInput.value.trim();

    if (!city) return;

    getWeather(city);
    getForecast(city);

    cityInput.value = "";

  }

});
