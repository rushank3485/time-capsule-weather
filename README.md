# ⏳ Time Capsule Weather · Historical Atmosphere & Almanac

> Pick any date from 1940 to recent history and unlock what the weather was like that day anywhere on Earth, discover what happened in history on that exact date, and download shareable memory cards.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frushank3485%2Ftime-capsule-weather)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)
![Stack: HTML5/CSS3/ES6](https://img.shields.io/badge/Stack-Vanilla_JS-yellow.svg?style=flat-square)
![Deploy: Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

---

## ⚡ Overview

**Time Capsule Weather** bridges modern meteorological reanalysis data with world history. Whether you want to know what the weather was like on the day you were born, the climate during Woodstock 1969, or the atmosphere in Tokyo on New Year's Day 2000, Time Capsule Weather reconstructs the exact atmospheric conditions alongside key historical events and births from that date.

---

## 🌟 Key Features

- **Historical Weather Engine (1940 – Present):** Access hourly and daily records (temperature, precipitation, wind gusts, day length, sunrise & sunset) across the globe via Open-Meteo reanalysis archives.
- **"On This Day in History" Panel:** Seamlessly integrated with Wikimedia to surface notable world milestones and historical figures born on the chosen date.
- **10-Year Climate Comparison Baseline:** Calculates whether the chosen historic date was warmer or cooler than the modern baseline average.
- **1080×1350 Shareable Memory Cards:** Generate downloadable high-resolution cards directly on HTML5 Canvas with 3 tailored aesthetic themes (*Vintage Paper*, *Midnight Obsidian*, and *Golden Dusk*).
- **Birthday Mode:** One-click toggle framing the archive as *"The weather on the day you were born in [City]"*.
- **Deep Shareable Links:** City, coordinates, date, and mode are synchronized to the URL query string (`?date=1998-07-14&lat=19.07&lon=72.87&city=Mumbai`) for instant sharing.
- **Zero API Keys & Zero Build Tools:** Pure, lightweight static client running with sub-millisecond execution.

---

## 🛠️ Tech Stack & APIs

- **Architecture:** Vanilla JavaScript (ES6+), Semantic HTML5, CSS Custom Properties with Glassmorphism & Film Grain textures.
- **Typography:** *Cinzel* (classical headings), *Plus Jakarta Sans* (interface), *JetBrains Mono* (meteorological metrics).
- **APIs:**
  - **Open-Meteo Geocoding API:** Fast debounced city search without rate-limiting keys.
  - **Open-Meteo Historical Weather Archive API:** ERA5-based global reanalysis back to 1940.
  - **Wikimedia On This Day API:** Curated historical events and births catalog.

---

## 🚀 Local Setup

```bash
# Clone the repository
git clone https://github.com/rushank3485/time-capsule-weather.git

# Enter the project directory
cd time-capsule-weather

# Run using any static web server
npx serve .
# Or open index.html directly in your web browser
```

---

## ☁️ Deployment on Vercel

```bash
# Deploy to Vercel production
vercel --prod
```

Or connect the repository on the [Vercel Dashboard](https://vercel.com/new). Every push to `main` deploys automatically.

---

## 📸 Screenshots

| Historical Weather View | 1080x1350 Canvas Share Card |
| :---: | :---: |
| *(Weather & Historical Almanac interface)* | *(Vintage Paper & Midnight Obsidian Card Themes)* |

---

## 🙏 Credits

- Meteorological data provided courtesy of [Open-Meteo](https://open-meteo.com/).
- Historical events and birth records provided by the [Wikimedia Foundation](https://wikimedia.org/).

---

## 📄 License

MIT © [Rushank](https://github.com/rushank3485)
