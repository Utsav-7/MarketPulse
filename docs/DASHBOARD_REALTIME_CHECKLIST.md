# Dashboard cards – real-time data checklist

Cards that need to fetch real-time data (excluding **Live News Videos** and **Live Webcam**).

| # | Card | Current data | Needs API / source | Done |
|---|------|--------------|--------------------|------|
| 1 | **Markets** | Real (Exchanges API) | — | ✅ |
| 2 | **Stock Indexes** | `dummyStockIndexes` | Indices API (e.g. Yahoo Finance, Alpha Vantage, Twelve Data) | ☐ |
| 3 | **Commodities** | `dummyCommodities` | Commodities/prices API (VIX, gold, oil, etc.) | ☐ |
| 4 | **Crypto** | `dummyCrypto` | Crypto prices API (e.g. CoinGecko, Binance) | ☐ |
| 5 | **News** | `dummyNews`, `dummyNewsChannels` | News API (e.g. NewsAPI, Finnhub, Alpha Vantage news) | ☐ |
| 6 | **AI Insights** | `dummyAiInsights` | AI/analytics service or derived from market data | ☐ |
| 7 | **Live News** | `liveNewsByRegion` | Real-time headlines API by region | ☐ |
| 8 | **Government** | `dummyGovernment` | Government/policy news feed | ☐ |
| 9 | **Energy & Resources** | `dummyEnergy` | Energy sector news/headlines API | ☐ |
| 10 | **Technology** | `dummyTechnology` | Tech news feed | ☐ |
| 11 | **Sector Heatmap** | `dummySectorHeatmap` | Sector performance API (e.g. sector % change) | ☐ |
| 12 | **AI/ML** | `dummyAiMl` | AI/ML news feed | ☐ |
| 13 | **Finance** | `dummyFinance` | Finance news feed | ☐ |
| 14 | **Charts — Major Indexes** | `dummyIndexChartLabels`, `dummyIndexChartValues` | Historical index data for charts (e.g. time series) | ☐ |
| 15 | **Climate** | `dummyClimate` | Climate/ESG news or data feed | ☐ |
| 16 | **War** | `dummyWar` | Geopolitics/conflict news feed | ☐ |
| 17 | **Weather** | `weatherCities` | Weather API (e.g. OpenWeather, WeatherAPI) | ☐ |

---

## Summary

- **Already real-time:** Markets (Exchanges).
- **Excluded (video only):** Live News Videos, Live Webcam.
- **To integrate:** 16 cards (Stock Indexes through Weather).

## Data shape reference

- **Index/price rows:** `{ name, country?, symbol?, value/price, changePercent }`
- **News/headlines:** `{ source, headline, timeAgo }`
- **Sector heatmap:** `{ sector, change }`
- **Weather:** `{ id, name, country, tempC, condition, humidity, windKmh, highC, lowC }`

Use `client/src/data/dashboardDummyData.ts` for exact types and card usage.
