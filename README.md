# MarketPulse

<img width="1920" height="967" alt="MarketPulse Dashboard" src="https://github.com/user-attachments/assets/85709690-46b2-4aa5-ab98-79f6284c5239" />

---

**Live Demo → [https://utsav-7.github.io/MarketPulse/](https://utsav-7.github.io/MarketPulse/)**

---

MarketPulse is a real-time financial dashboard featuring live market data, global news, 3D earth visualization, satellite world map, weather, and webcam feeds — all in a draggable, resizable grid layout.

## Features

- **Live Stock Indexes** — S&P 500, NASDAQ, Dow Jones, Nifty 50, FTSE, DAX, Nikkei, Hang Seng, ASX 200 and more (Yahoo Finance, 1-min refresh)
- **Live Crypto** — BTC, ETH, SOL, BNB, XRP, DOGE (Yahoo Finance, 30s refresh)
- **Live Commodities** — Gold, Silver, WTI Crude, Brent, Natural Gas, Copper (Yahoo Finance futures, 5-min refresh)
- **Live News** — Government, Energy, Technology, AI/ML, Finance, Climate, War (NewsAPI backend proxy)
- **Live Weather** — City search with OpenWeatherMap
- **Sector Heatmap** — US sector performance (Alpha Vantage)
- **3D Globe** — Real-time day/night shader (NASA Blue Marble + city lights), animated trade arcs between financial hubs
- **Satellite World Map** — ESRI satellite tiles, clickable market hub markers
- **Live News Videos** — Regional YouTube embeds
- **Live Webcams** — Regional webcam grid
- **Draggable & Resizable** — All 21 cards freely repositioned and resized, layout saved to localStorage

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core 8, Entity Framework Core, SQL Server |
| 3D Globe | react-globe.gl, Three.js (custom GLSL shader) |
| 2D Map | Leaflet, ESRI World Imagery |
| Market Data | Yahoo Finance v8 (crumb auth) |
| News | NewsAPI (backend proxy), GNews (frontend) |
| Weather | OpenWeatherMap |
| Sectors | Alpha Vantage |
| Deployment | GitHub Pages (frontend), GitHub Actions CI/CD |

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK

### Run the client

```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

### Run the API

Copy `appsettings.json` to `appsettings.Development.json` and fill in your API keys:

```json
{
  "Finnhub":      { "ApiKey": "YOUR_KEY" },
  "Weather":      { "ApiKey": "YOUR_KEY" },
  "NewsApi":      { "ApiKey": "YOUR_KEY" },
  "AlphaVantage": { "ApiKey": "YOUR_KEY" }
}
```

Then run from `src/MarketPulse.API`:

```bash
dotnet run
```

### Build for production

```bash
cd client
npm run build
```

## Project Structure

```
MarketPulse/
├── client/                  # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/             # API client + live data hooks
│   │   ├── components/      # Dashboard cards, common UI
│   │   ├── data/            # Fallback dummy data
│   │   └── pages/           # DashboardPage
│   └── vite.config.ts
├── src/
│   ├── MarketPulse.API/     # ASP.NET Core controllers + config
│   ├── MarketPulse.Application/
│   ├── MarketPulse.Domain/
│   └── MarketPulse.Infrastructure/  # Yahoo Finance, NewsAPI, Weather, Alpha Vantage clients
├── docs/
│   └── PROJECT_TICKET.html  # Full project SRS & feature tickets
└── .github/workflows/
    └── deploy-pages.yml     # GitHub Actions → GitHub Pages CI/CD
```

## Deployment

The frontend is automatically deployed to GitHub Pages on every push to `main` via GitHub Actions.

**Live URL:** [https://utsav-7.github.io/MarketPulse/](https://utsav-7.github.io/MarketPulse/)

## License

Proprietary.
