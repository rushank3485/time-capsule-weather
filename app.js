const CITIES = {
  mumbai: {
    name: "Mumbai, India",
    temp: 29,
    feels: 32,
    cond: "Clear Night",
    art: "🌙",
    humidity: "68%",
    wind: "14 km/h",
    aqi: "48 · Good",
    vis: "8.5 km",
    forecast: [
      { day: "Sun", icon: "☀️", temp: "33° / 26°" },
      { day: "Mon", icon: "⛅", temp: "32° / 25°" },
      { day: "Tue", icon: "🌤️", temp: "31° / 24°" },
      { day: "Wed", icon: "🌧️", temp: "29° / 23°" },
      { day: "Thu", icon: "⛈️", temp: "28° / 22°" }
    ]
  },
  tokyo: {
    name: "Tokyo, Japan",
    temp: 14,
    feels: 13,
    cond: "Overcast",
    art: "☁️",
    humidity: "52%",
    wind: "19 km/h",
    aqi: "22 · Excellent",
    vis: "12.0 km",
    forecast: [
      { day: "Sun", icon: "🌧️", temp: "15° / 10°" },
      { day: "Mon", icon: "🌤️", temp: "17° / 11°" },
      { day: "Tue", icon: "☀️", temp: "19° / 12°" },
      { day: "Wed", icon: "⛅", temp: "18° / 11°" },
      { day: "Thu", icon: "☁️", temp: "16° / 9°" }
    ]
  },
  london: {
    name: "London, UK",
    temp: 11,
    feels: 9,
    cond: "Drizzle",
    art: "🌧️",
    humidity: "86%",
    wind: "22 km/h",
    aqi: "31 · Good",
    vis: "6.0 km",
    forecast: [
      { day: "Sun", icon: "🌧️", temp: "12° / 7°" },
      { day: "Mon", icon: "☁️", temp: "13° / 8°" },
      { day: "Tue", icon: "⛅", temp: "14° / 9°" },
      { day: "Wed", icon: "🌦️", temp: "12° / 8°" },
      { day: "Thu", icon: "🌧️", temp: "11° / 6°" }
    ]
  },
  newyork: {
    name: "New York, USA",
    temp: 16,
    feels: 15,
    cond: "Breezy & Sunny",
    art: "☀️",
    humidity: "45%",
    wind: "28 km/h",
    aqi: "38 · Good",
    vis: "15.0 km",
    forecast: [
      { day: "Sun", icon: "☀️", temp: "17° / 9°" },
      { day: "Mon", icon: "⛅", temp: "18° / 11°" },
      { day: "Tue", icon: "🌧️", temp: "14° / 8°" },
      { day: "Wed", icon: "🌤️", temp: "15° / 7°" },
      { day: "Thu", icon: "☀️", temp: "16° / 8°" }
    ]
  }
};

const searchInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');

function renderCity(cityKey) {
  const data = CITIES[cityKey] || {
    name: `${cityKey.charAt(0).toUpperCase() + cityKey.slice(1)}, Global`,
    temp: 24,
    feels: 25,
    cond: "Partly Cloudy",
    art: "⛅",
    humidity: "55%",
    wind: "12 km/h",
    aqi: "42 · Good",
    vis: "10.0 km",
    forecast: [
      { day: "Day 1", icon: "☀️", temp: "26° / 18°" },
      { day: "Day 2", icon: "🌤️", temp: "25° / 17°" },
      { day: "Day 3", icon: "⛅", temp: "24° / 16°" },
      { day: "Day 4", icon: "🌦️", temp: "22° / 15°" },
      { day: "Day 5", icon: "🌧️", temp: "21° / 14°" }
    ]
  };

  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temp-display').textContent = `${data.temp}°`;
  document.getElementById('feels-display').textContent = `${data.feels}°`;
  document.getElementById('condition-text').textContent = data.cond;
  document.getElementById('weather-art').textContent = data.art;
  document.getElementById('humidity-val').textContent = data.humidity;
  document.getElementById('wind-val').textContent = data.wind;
  document.getElementById('aqi-val').textContent = data.aqi;
  document.getElementById('vis-val').textContent = data.vis;

  const fCards = document.getElementById('forecast-cards');
  fCards.innerHTML = data.forecast.map(f => `
    <div class="f-card">
      <div class="f-day">${f.day}</div>
      <div class="f-icon">${f.icon}</div>
      <div class="f-temp">${f.temp}</div>
    </div>
  `).join('');
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (query) {
    renderCity(query);
  }
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

renderCity('mumbai');
