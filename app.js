// Time Capsule Weather Core Engine
(function() {
  'use strict';

  // State
  let currentCity = {
    name: "Mumbai",
    region: "Maharashtra",
    country: "India",
    lat: 19.0728,
    lon: 72.8826
  };

  let currentDate = "2000-01-01";
  let unit = localStorage.getItem('tc_weather_unit') || 'C';
  let isBirthdayMode = false;
  let activeTheme = 'vintage';

  let currentWeatherData = null;
  let currentHistoryData = { events: [], births: [] };

  const SURPRISE_CITIES = [
    { name: "Mumbai", region: "Maharashtra", country: "India", lat: 19.0728, lon: 72.8826 },
    { name: "Tokyo", region: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
    { name: "Paris", region: "Île-de-France", country: "France", lat: 48.8566, lon: 2.3522 },
    { name: "London", region: "England", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
    { name: "New York", region: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
    { name: "Cairo", region: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
    { name: "Rio de Janeiro", region: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
    { name: "Sydney", region: "New South Wales", country: "Australia", lat: -33.8688, lon: 151.2093 }
  ];

  // DOM Elements
  const cityInput = document.getElementById('city-input');
  const citySuggestions = document.getElementById('city-suggestions');
  const dateInput = document.getElementById('date-input');
  const searchBtn = document.getElementById('search-btn');
  const surpriseBtn = document.getElementById('surprise-btn');
  const birthdayToggle = document.getElementById('birthday-toggle');
  const unitToggle = document.getElementById('unit-toggle');
  const unitLabel = document.getElementById('unit-label');
  const mainHeadline = document.getElementById('main-headline');
  const subHeadline = document.getElementById('sub-headline');

  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const capsuleContent = document.getElementById('capsule-content');

  // Display fields
  const displayCity = document.getElementById('display-city');
  const displayDate = document.getElementById('display-date');
  const tempDisplay = document.getElementById('temp-display');
  const conditionText = document.getElementById('condition-text');
  const hiTemp = document.getElementById('hi-temp');
  const loTemp = document.getElementById('lo-temp');
  const weatherArt = document.getElementById('weather-art');
  const comparisonText = document.getElementById('comparison-text');

  const precipVal = document.getElementById('precip-val');
  const windVal = document.getElementById('wind-val');
  const sunVal = document.getElementById('sun-val');
  const daylightVal = document.getElementById('daylight-val');

  const historyDateHeading = document.getElementById('history-date-heading');
  const eventsList = document.getElementById('events-list');
  const birthsList = document.getElementById('births-list');

  // Modal & Canvas
  const openShareModalBtn = document.getElementById('open-share-modal');
  const shareModal = document.getElementById('share-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const shareCanvas = document.getElementById('share-canvas');
  const downloadCardBtn = document.getElementById('download-card-btn');
  const nativeShareBtn = document.getElementById('native-share-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const toastMsg = document.getElementById('toast-msg');
  const themeButtons = document.querySelectorAll('.theme-btn');

  // Set Max Date: 7 days ago
  const now = new Date();
  const maxDateObj = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];
  dateInput.max = maxDateStr;

  // WMO Weather Codes
  function decodeWMO(code) {
    if (code === 0) return { label: "Clear Sky", icon: "☀️", art: "☀️", theme: "amber" };
    if (code === 1) return { label: "Mainly Clear", icon: "🌤️", art: "🌤️", theme: "amber" };
    if (code === 2) return { label: "Partly Cloudy", icon: "⛅", art: "⛅", theme: "amber" };
    if (code === 3) return { label: "Overcast", icon: "☁️", art: "☁️", theme: "dark" };
    if (code >= 45 && code <= 48) return { label: "Foggy", icon: "🌫️", art: "🌫️", theme: "vintage" };
    if (code >= 51 && code <= 55) return { label: "Drizzle", icon: "🌦️", art: "🌦️", theme: "vintage" };
    if (code >= 61 && code <= 65) return { label: "Rainy", icon: "🌧️", art: "🌧️", theme: "dark" };
    if (code >= 71 && code <= 77) return { label: "Snowy", icon: "❄️", art: "❄️", theme: "dark" };
    if (code >= 80 && code <= 82) return { label: "Rain Showers", icon: "🌧️", art: "🌧️", theme: "dark" };
    if (code >= 85 && code <= 86) return { label: "Snow Showers", icon: "🌨️", art: "🌨️", theme: "dark" };
    if (code >= 95 && code <= 99) return { label: "Thunderstorm", icon: "⛈️", art: "⛈️", theme: "dark" };
    return { label: "Fair", icon: "🌤️", art: "🌤️", theme: "amber" };
  }

  // Format Temperature
  function fmtTemp(celsius) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return "--";
    if (unit === 'F') {
      const f = (celsius * 9 / 5) + 32;
      return `${f.toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  }

  // Format Date Pretty: YYYY-MM-DD -> "Month D, YYYY"
  function formatDatePretty(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[monthIdx]} ${day}, ${year}`;
  }

  function getMonthDay(dateStr) {
    const parts = dateStr.split('-');
    return { month: parts[1], day: parts[2], year: parseInt(parts[0], 10) };
  }

  // Unit Toggle
  unitToggle.addEventListener('click', () => {
    unit = unit === 'C' ? 'F' : 'C';
    localStorage.setItem('tc_weather_unit', unit);
    unitLabel.textContent = `°${unit}`;
    if (currentWeatherData) renderWeather(currentWeatherData);
    drawShareCard();
  });
  unitLabel.textContent = `°${unit}`;

  // Birthday Mode Toggle
  birthdayToggle.addEventListener('click', () => {
    isBirthdayMode = !isBirthdayMode;
    birthdayToggle.classList.toggle('active', isBirthdayMode);
    
    if (isBirthdayMode) {
      document.getElementById('date-label').textContent = "Your Birth Date";
      mainHeadline.textContent = "The Weather on the Day You Were Born";
      subHeadline.textContent = "Discover the exact atmosphere, skies, and world events on your birth date.";
    } else {
      document.getElementById('date-label').textContent = "Capsule Date";
      mainHeadline.textContent = "The Weather on Any Day in History";
      subHeadline.textContent = "Select any city and date from 1940 onwards to unlock climate records and historical headlines.";
    }
    updateURL();
    drawShareCard();
  });

  // Autocomplete City Search
  let debounceTimer = null;
  cityInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = cityInput.value.trim();
    if (query.length < 2) {
      citySuggestions.classList.add('hidden');
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          citySuggestions.innerHTML = data.results.map(r => `
            <div class="suggestion-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}" data-region="${r.admin1 || ''}" data-country="${r.country || ''}">
              <b>${r.name}</b>
              <span class="suggestion-meta">${r.admin1 ? r.admin1 + ', ' : ''}${r.country || ''}</span>
            </div>
          `).join('');
          citySuggestions.classList.remove('hidden');
        } else {
          citySuggestions.classList.add('hidden');
        }
      } catch (e) {
        citySuggestions.classList.add('hidden');
      }
    }, 300);
  });

  // Suggestion Click
  citySuggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;

    currentCity = {
      name: item.dataset.name,
      region: item.dataset.region,
      country: item.dataset.country,
      lat: parseFloat(item.dataset.lat),
      lon: parseFloat(item.dataset.lon)
    };

    const fullLabel = [currentCity.name, currentCity.region, currentCity.country].filter(Boolean).join(', ');
    cityInput.value = fullLabel;
    citySuggestions.classList.add('hidden');
    openTimeCapsule();
  });

  document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !citySuggestions.contains(e.target)) {
      citySuggestions.classList.add('hidden');
    }
  });

  // Action Buttons
  searchBtn.addEventListener('click', openTimeCapsule);

  surpriseBtn.addEventListener('click', () => {
    const randomCity = SURPRISE_CITIES[Math.floor(Math.random() * SURPRISE_CITIES.length)];
    currentCity = randomCity;
    cityInput.value = [randomCity.name, randomCity.region, randomCity.country].filter(Boolean).join(', ');

    const minYear = 1945;
    const maxYear = 2020;
    const randYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const randMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const randDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    dateInput.value = `${randYear}-${randMonth}-${randDay}`;

    openTimeCapsule();
  });

  // Open Time Capsule
  async function openTimeCapsule() {
    currentDate = dateInput.value;
    if (!currentDate) return;

    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    capsuleContent.classList.add('hidden');

    updateURL();

    try {
      const [weather, history] = await Promise.all([
        fetchWeather(currentCity.lat, currentCity.lon, currentDate),
        fetchHistory(currentDate)
      ]);

      currentWeatherData = weather;
      currentHistoryData = history;

      renderWeather(weather);
      renderHistory(history, currentDate);

      // Baseline comparison (parallel async, non-blocking)
      fetchComparison(currentCity.lat, currentCity.lon, currentDate, weather.meanTemp);

      loadingState.classList.add('hidden');
      capsuleContent.classList.remove('hidden');

      drawShareCard();
    } catch (err) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = err.message || "Failed to load archival weather data for this date.";
    }
  }

  // Fetch Open-Meteo Archive API
  async function fetchWeather(lat, lon, date) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max,sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather archive unavailable for this location and date.");
    const data = await res.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error("No meteorological records exist for this exact date.");
    }

    const d = data.daily;
    const wmo = decodeWMO(d.weather_code[0]);

    // calculate daylight length
    let daylightStr = "--";
    if (d.sunrise[0] && d.sunset[0]) {
      const rise = new Date(d.sunrise[0]);
      const set = new Date(d.sunset[0]);
      const diffMs = set - rise;
      if (diffMs > 0) {
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        daylightStr = `${hrs}h ${mins}m`;
      }
    }

    return {
      date,
      wmo,
      maxTemp: d.temperature_2m_max[0],
      minTemp: d.temperature_2m_min[0],
      meanTemp: d.temperature_2m_mean ? d.temperature_2m_mean[0] : ((d.temperature_2m_max[0] + d.temperature_2m_min[0]) / 2),
      precip: d.precipitation_sum ? d.precipitation_sum[0] : 0,
      wind: d.wind_speed_10m_max ? d.wind_speed_10m_max[0] : 0,
      sunrise: d.sunrise[0] ? d.sunrise[0].split('T')[1] : "--",
      sunset: d.sunset[0] ? d.sunset[0].split('T')[1] : "--",
      daylight: daylightStr
    };
  }

  // Fetch Wikimedia On This Day
  async function fetchHistory(dateStr) {
    const { month, day, year } = getMonthDay(dateStr);
    try {
      const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
      const res = await fetch(url);
      if (!res.ok) return { events: [], births: [] };
      const data = await res.json();

      const filterClosest = (arr) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr
          .filter(item => item && item.text && item.year)
          .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))
          .slice(0, 3);
      };

      const events = filterClosest(data.selected || data.events || []);
      const births = filterClosest(data.births || []);

      return { events, births };
    } catch (e) {
      return { events: [], births: [] };
    }
  }

  // Fetch 10-year Baseline Comparison
  async function fetchComparison(lat, lon, dateStr, dayMean) {
    comparisonText.textContent = "Comparing against modern 10-year baseline for this date...";
    const { month, day } = getMonthDay(dateStr);
    
    // Compare against 2012–2021 on the same date
    try {
      const startYear = 2012;
      const endYear = 2021;
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startYear}-${month}-${day}&end_date=${endYear}-${month}-${day}&daily=temperature_2m_mean&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) {
        document.getElementById('comparison-banner').classList.add('hidden');
        return;
      }
      const data = await res.json();
      if (data.daily && data.daily.temperature_2m_mean) {
        const valid = data.daily.temperature_2m_mean.filter(t => t !== null && !isNaN(t));
        if (valid.length > 0) {
          const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
          const diff = dayMean - avg;
          const sign = diff >= 0 ? "+" : "";
          const diffFormatted = unit === 'F' ? `${(diff * 9/5).toFixed(1)}°F` : `${diff.toFixed(1)}°C`;
          const comparisonWord = diff >= 0 ? "warmer" : "cooler";

          document.getElementById('comparison-banner').classList.remove('hidden');
          comparisonText.innerHTML = `<b>${sign}${diffFormatted}</b> ${comparisonWord} than the modern 2012–2021 baseline for this calendar date.`;
          return;
        }
      }
      document.getElementById('comparison-banner').classList.add('hidden');
    } catch (e) {
      document.getElementById('comparison-banner').classList.add('hidden');
    }
  }

  // Render Weather
  function renderWeather(w) {
    displayCity.textContent = [currentCity.name, currentCity.region, currentCity.country].filter(Boolean).join(', ');
    displayDate.textContent = formatDatePretty(w.date);

    tempDisplay.textContent = fmtTemp(w.meanTemp);
    conditionText.textContent = w.wmo.label;
    hiTemp.textContent = fmtTemp(w.maxTemp);
    loTemp.textContent = fmtTemp(w.minTemp);
    weatherArt.textContent = w.wmo.art;

    precipVal.textContent = `${w.precip.toFixed(1)} mm`;
    windVal.textContent = `${w.wind.toFixed(1)} km/h`;
    sunVal.textContent = `${w.sunrise} · ${w.sunset}`;
    daylightVal.textContent = w.daylight;

    // Auto theme suggestion
    activeTheme = w.wmo.theme;
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === activeTheme);
    });
  }

  // Render History
  function renderHistory(h, dateStr) {
    const { month, day } = getMonthDay(dateStr);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    historyDateHeading.textContent = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;

    if (h.events.length === 0) {
      eventsList.innerHTML = `<p class="history-item" style="color:var(--text-muted)">No major digitized world events cataloged for this specific date.</p>`;
    } else {
      eventsList.innerHTML = h.events.map(ev => {
        const link = ev.pages && ev.pages[0] && ev.pages[0].content_urls ? ev.pages[0].content_urls.desktop.page : `https://en.wikipedia.org/wiki/${ev.year}`;
        return `
          <div class="history-item">
            <span class="history-year">${ev.year}</span>
            <span>${ev.text}</span>
            <a href="${link}" target="_blank" rel="noopener">Wikipedia ↗</a>
          </div>
        `;
      }).join('');
    }

    if (h.births.length === 0) {
      birthsList.innerHTML = `<p class="history-item" style="color:var(--text-muted)">No prominent historical birth records logged for this day.</p>`;
    } else {
      birthsList.innerHTML = h.births.map(b => {
        const link = b.pages && b.pages[0] && b.pages[0].content_urls ? b.pages[0].content_urls.desktop.page : `https://en.wikipedia.org/wiki/${b.year}`;
        return `
          <div class="history-item">
            <span class="history-year">${b.year}</span>
            <span>${b.text}</span>
            <a href="${link}" target="_blank" rel="noopener">Wikipedia ↗</a>
          </div>
        `;
      }).join('');
    }
  }

  // URL Sync
  function updateURL() {
    const params = new URLSearchParams();
    params.set('city', currentCity.name);
    params.set('lat', currentCity.lat.toFixed(4));
    params.set('lon', currentCity.lon.toFixed(4));
    params.set('date', currentDate);
    if (isBirthdayMode) params.set('mode', 'birthday');
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  function readURL() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    const cityParam = params.get('city');
    const latParam = params.get('lat');
    const lonParam = params.get('lon');
    const modeParam = params.get('mode');

    if (modeParam === 'birthday') {
      isBirthdayMode = true;
      birthdayToggle.classList.add('active');
      document.getElementById('date-label').textContent = "Your Birth Date";
      mainHeadline.textContent = "The Weather on the Day You Were Born";
      subHeadline.textContent = "Discover the exact atmosphere, skies, and world events on your birth date.";
    }

    if (dateParam && dateParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateInput.value = dateParam;
      currentDate = dateParam;
    }

    if (cityParam && latParam && lonParam) {
      currentCity = {
        name: cityParam,
        region: "",
        country: "",
        lat: parseFloat(latParam),
        lon: parseFloat(lonParam)
      };
      cityInput.value = cityParam;
    }
  }

  // Canvas Share Card (1080 x 1350)
  function drawShareCard() {
    if (!currentWeatherData) return;
    const ctx = shareCanvas.getContext('2d');
    const W = 1080;
    const H = 1350;

    // Theme Configs
    const themes = {
      vintage: {
        bg1: "#fdfbf7",
        bg2: "#ece3d0",
        border: "#8c7355",
        text: "#1c1813",
        subtext: "#635848",
        accent: "#a25a28",
        cardBg: "rgba(255, 255, 255, 0.65)"
      },
      dark: {
        bg1: "#0b0f19",
        bg2: "#141c2e",
        border: "#25334d",
        text: "#f8fafc",
        subtext: "#94a3b8",
        accent: "#38bdf8",
        cardBg: "rgba(22, 31, 49, 0.75)"
      },
      amber: {
        bg1: "#1a120b",
        bg2: "#301d0e",
        border: "#5c3d1e",
        text: "#fffbeb",
        subtext: "#d1a877",
        accent: "#f59e0b",
        cardBg: "rgba(35, 22, 12, 0.75)"
      }
    };

    const t = themes[activeTheme] || themes.vintage;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, t.bg1);
    bgGrad.addColorStop(1, t.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Border Frame
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = t.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, W - 110, H - 110);

    // Top Header: Time Capsule Weather
    ctx.fillStyle = t.accent;
    ctx.font = "bold 32px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("TIME CAPSULE WEATHER", W / 2, 130);

    // Sub-banner badge
    ctx.fillStyle = t.subtext;
    ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("ATMOSPHERIC ARCHIVES & ALMANAC", W / 2, 175);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(W / 2 - 140, 205);
    ctx.lineTo(W / 2 + 140, 205);
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Headline
    const headline = isBirthdayMode
      ? `The Weather on the Day I Was Born`
      : `The Weather in History`;
    ctx.fillStyle = t.text;
    ctx.font = "bold 52px 'Cinzel', serif";
    ctx.fillText(headline, W / 2, 280);

    // Location & Date
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.fillText(`${currentCity.name}`, W / 2, 345);

    ctx.font = "34px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = t.subtext;
    ctx.fillText(`${formatDatePretty(currentWeatherData.date)}`, W / 2, 395);

    // Central Weather Card (Round Rect)
    const cardX = 100;
    const cardY = 440;
    const cardW = 880;
    const cardH = 430;

    ctx.fillStyle = t.cardBg;
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 3;
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    // Weather Emoji / Art
    ctx.font = "140px sans-serif";
    ctx.fillText(currentWeatherData.wmo.art, W / 2, cardY + 160);

    // Big Temp
    ctx.fillStyle = t.text;
    ctx.font = "bold 82px 'JetBrains Mono', monospace";
    ctx.fillText(fmtTemp(currentWeatherData.meanTemp), W / 2, cardY + 265);

    // Condition
    ctx.fillStyle = t.accent;
    ctx.font = "bold 38px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(currentWeatherData.wmo.label, W / 2, cardY + 320);

    // High / Low
    ctx.fillStyle = t.subtext;
    ctx.font = "30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`High: ${fmtTemp(currentWeatherData.maxTemp)}   ·   Low: ${fmtTemp(currentWeatherData.minTemp)}`, W / 2, cardY + 375);

    // Metrics Row (4 Columns inside smaller boxes)
    const metricsY = 910;
    const mBoxW = 200;
    const mBoxH = 110;
    const gap = 26;
    const startX = (W - (4 * mBoxW + 3 * gap)) / 2;

    const metricsData = [
      { label: "RAIN/SNOW", val: `${currentWeatherData.precip.toFixed(1)} mm` },
      { label: "MAX WIND", val: `${currentWeatherData.wind.toFixed(1)} km/h` },
      { label: "SUNRISE", val: currentWeatherData.sunrise },
      { label: "SUNSET", val: currentWeatherData.sunset }
    ];

    metricsData.forEach((m, idx) => {
      const bx = startX + idx * (mBoxW + gap);
      ctx.fillStyle = t.cardBg;
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 2;
      roundRect(ctx, bx, metricsY, mBoxW, mBoxH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.subtext;
      ctx.font = "19px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(m.label, bx + mBoxW / 2, metricsY + 40);

      ctx.fillStyle = t.text;
      ctx.font = "bold 24px 'JetBrains Mono', monospace";
      ctx.fillText(m.val, bx + mBoxW / 2, metricsY + 80);
    });

    // History Snippet Box
    const histY = 1055;
    const histW = 880;
    const histH = 160;
    const histX = 100;

    ctx.fillStyle = t.cardBg;
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 2;
    roundRect(ctx, histX, histY, histW, histH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = t.accent;
    ctx.font = "bold 24px 'Cinzel', serif";
    ctx.textAlign = "left";
    ctx.fillText("📜 ALSO ON THIS DAY IN HISTORY:", histX + 30, histY + 45);

    // Fact text
    let fact = "Historical events recorded on this date across the globe.";
    if (currentHistoryData.events && currentHistoryData.events.length > 0) {
      const ev = currentHistoryData.events[0];
      fact = `${ev.year}: ${ev.text}`;
    }
    ctx.fillStyle = t.text;
    ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
    wrapText(ctx, fact, histX + 30, histY + 85, histW - 60, 32, 2);

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = t.subtext;
    ctx.font = "22px 'JetBrains Mono', monospace";
    ctx.fillText("Created with Time Capsule Weather · time-capsule-weather.vercel.app", W / 2, 1275);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lineCount++;
        if (lineCount >= maxLines) {
          ctx.fillText(line + '...', x, y);
          return;
        }
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  // Modal Controls
  openShareModalBtn.addEventListener('click', () => {
    drawShareCard();
    shareModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    shareModal.classList.add('hidden');
  });

  shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) shareModal.classList.add('hidden');
  });

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTheme = btn.dataset.theme;
      drawShareCard();
    });
  });

  // Download Card
  downloadCardBtn.addEventListener('click', () => {
    shareCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-capsule-${currentCity.name.toLowerCase()}-${currentDate}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  });

  // Native Share Card
  nativeShareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      shareCanvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], `weather-time-capsule-${currentDate}.png`, { type: 'image/png' });
          await navigator.share({
            title: `Weather on ${currentDate} in ${currentCity.name}`,
            text: `Check out what the weather was like on ${currentDate} in ${currentCity.name}!`,
            url: window.location.href,
            files: [file]
          });
        } catch (e) {
          // fallback to link copy
          copyLink();
        }
      });
    } else {
      copyLink();
    }
  });

  // Copy Link
  copyLinkBtn.addEventListener('click', copyLink);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toastMsg.classList.remove('hidden');
      setTimeout(() => toastMsg.classList.add('hidden'), 2500);
    });
  }

  // Startup
  readURL();
  openTimeCapsule();

})();
