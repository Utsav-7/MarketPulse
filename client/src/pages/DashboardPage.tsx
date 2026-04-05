import React, { useCallback, useState } from 'react';
import GridLayout, { useContainerWidth } from 'react-grid-layout';
import {
  DashboardCard,
  DashboardHeader,
  GlobeCard,
  HeadlinesList,
  WorldMapCard,
  IndexCharts,
  IndexGrid,
  NewsGrid,
  PriceGrid,
  SectorHeatmap,
} from '../components/dashboard';
import {
  dummyStockIndexes,
  dummyCommodities,
  dummyCrypto,
  dummyNews,
  liveNewsRegions,
  liveNewsByRegion,
  dummyGovernment,
  dummyEnergy,
  dummyTechnology,
  dummySectorHeatmap,
  dummyAiMl,
  dummyFinance,
  dummyClimate,
  dummyWar,
  dummyAiInsights,
  dummyIndexChartLabels,
  dummyIndexChartValues,
  liveNewsVideoIds,
  liveWebcamIds,
  liveWebcamGridRegions,
  weatherCities,
} from '../data/dashboardDummyData';
import {
  NEWS_CATEGORIES,
  useLiveNews,
  useBackendNews,
  useLiveWeather,
  useSectorPerformance,
  useIndexes,
  useCrypto,
  useCommodities,
} from '../api/newsApi';

const LAYOUT_STORAGE_KEY = 'marketpulse-dashboard-layout';

const STATIC_EXCHANGES = [
  { code: 'NYSE',    name: 'New York Stock Exchange',       country: 'US' },
  { code: 'NASDAQ',  name: 'NASDAQ',                        country: 'US' },
  { code: 'LSE',     name: 'London Stock Exchange',         country: 'UK' },
  { code: 'TSE',     name: 'Tokyo Stock Exchange',          country: 'JP' },
  { code: 'SSE',     name: 'Shanghai Stock Exchange',       country: 'CN' },
  { code: 'SZSE',    name: 'Shenzhen Stock Exchange',       country: 'CN' },
  { code: 'HKEX',    name: 'Hong Kong Stock Exchange',      country: 'HK' },
  { code: 'Euronext',name: 'Euronext',                      country: 'EU' },
  { code: 'DB',      name: 'Deutsche Börse (XETRA)',        country: 'DE' },
  { code: 'BSE',     name: 'Bombay Stock Exchange',         country: 'IN' },
  { code: 'NSE',     name: 'National Stock Exchange',       country: 'IN' },
  { code: 'TSX',     name: 'Toronto Stock Exchange',        country: 'CA' },
  { code: 'ASX',     name: 'Australian Securities Exchange',country: 'AU' },
  { code: 'KRX',     name: 'Korea Exchange',                country: 'KR' },
  { code: 'SGX',     name: 'Singapore Exchange',            country: 'SG' },
  { code: 'BOVESPA', name: 'B3 Brasil Bolsa Balcão',        country: 'BR' },
  { code: 'SIX',     name: 'SIX Swiss Exchange',            country: 'CH' },
  { code: 'Borsa',   name: 'Borsa Italiana',                country: 'IT' },
  { code: 'MOEX',    name: 'Moscow Exchange',               country: 'RU' },
  { code: 'TASE',    name: 'Tel Aviv Stock Exchange',       country: 'IL' },
  { code: 'JSE',     name: 'Johannesburg Stock Exchange',   country: 'ZA' },
  { code: 'BMV',     name: 'Bolsa Mexicana de Valores',     country: 'MX' },
  { code: 'IDX',     name: 'Indonesia Stock Exchange',      country: 'ID' },
  { code: 'SET',     name: 'Stock Exchange of Thailand',    country: 'TH' },
  { code: 'PSE',     name: 'Philippine Stock Exchange',     country: 'PH' },
  { code: 'KLSE',    name: 'Bursa Malaysia',                country: 'MY' },
  { code: 'NZX',     name: 'New Zealand Exchange',          country: 'NZ' },
  { code: 'TADAWUL', name: 'Saudi Exchange',                country: 'SA' },
  { code: 'DFM',     name: 'Dubai Financial Market',        country: 'AE' },
  { code: 'QSE',     name: 'Qatar Stock Exchange',          country: 'QA' },
] as const;

type LayoutItem = { i: string; x: number; y: number; w: number; h: number };

const ALL_LAYOUT_KEYS: LayoutItem[] = [
  { i: 'live-news-videos', x: 0, y: 0, w: 12, h: 3 },
  { i: 'live-webcam', x: 0, y: 3, w: 12, h: 2 },
  { i: 'markets', x: 0, y: 5, w: 2, h: 2 },
  { i: 'indexes', x: 2, y: 5, w: 2, h: 2 },
  { i: 'commodities', x: 4, y: 5, w: 2, h: 2 },
  { i: 'crypto', x: 6, y: 5, w: 2, h: 2 },
  { i: 'news', x: 8, y: 5, w: 2, h: 2 },
  { i: 'ai-insights', x: 10, y: 5, w: 2, h: 2 },
  { i: 'live-news', x: 0, y: 7, w: 3, h: 2 },
  { i: 'government', x: 3, y: 7, w: 2, h: 2 },
  { i: 'energy', x: 5, y: 7, w: 2, h: 2 },
  { i: 'technology', x: 7, y: 7, w: 2, h: 2 },
  { i: 'sector-heatmap', x: 9, y: 7, w: 3, h: 2 },
  { i: 'ai-ml', x: 0, y: 9, w: 2, h: 2 },
  { i: 'finance', x: 2, y: 9, w: 2, h: 2 },
  { i: 'index-charts', x: 4, y: 9, w: 4, h: 2 },
  { i: 'climate', x: 8, y: 9, w: 2, h: 2 },
  { i: 'war', x: 10, y: 9, w: 2, h: 2 },
  { i: 'weather', x: 0, y: 11, w: 2, h: 2 },
  { i: 'globe',     x: 2, y: 11, w: 4, h: 4 },
  { i: 'world-map', x: 6, y: 11, w: 6, h: 4 },
];

function loadStoredLayout(): LayoutItem[] {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return ALL_LAYOUT_KEYS;
    const parsed = JSON.parse(raw) as LayoutItem[];
    if (!Array.isArray(parsed)) return ALL_LAYOUT_KEYS;
    const byId = new Map(parsed.map((item) => [item.i, item]));
    const merged: LayoutItem[] = [];
    for (const def of ALL_LAYOUT_KEYS) {
      merged.push(byId.get(def.i) ?? def);
    }
    return merged;
  } catch {
    return ALL_LAYOUT_KEYS;
  }
}

function saveLayout(layout: LayoutItem[]) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // ignore
  }
}

export function DashboardPage() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<LayoutItem[]>(loadStoredLayout);
  const [newsCategory, setNewsCategory] = useState<string>(NEWS_CATEGORIES[0]);
  const [liveNewsRegion, setLiveNewsRegion] = useState<string>('All');
  const [videoRegion, setVideoRegion] = useState<string>('All');
  const [webcamLocation, setWebcamLocation] = useState<string>('All');

  // Main news card — GNews (frontend key)
  const { items: newsToShow } = useLiveNews(newsCategory, dummyNews);

  // Category news cards — backend-proxied NewsAPI (15-min server cache, auto-poll)
  const { items: govNews, loading: govLoading }     = useBackendNews('government', dummyGovernment);
  const { items: energyNews, loading: energyLoading } = useBackendNews('energy', dummyEnergy);
  const { items: techNews, loading: techLoading }   = useBackendNews('technology', dummyTechnology);
  const { items: aiMlNews, loading: aiMlLoading }   = useBackendNews('ai-ml', dummyAiMl);
  const { items: financeNews, loading: financeLoading } = useBackendNews('finance', dummyFinance);
  const { items: climateNews, loading: climateLoading } = useBackendNews('climate', dummyClimate);
  const { items: warNews, loading: warLoading }     = useBackendNews('war', dummyWar);
  const { items: liveHeadlines, loading: liveHeadlinesLoading } = useBackendNews('live-news', liveNewsByRegion[liveNewsRegion] ?? liveNewsByRegion.All);

  // Sector heatmap — Alpha Vantage (5-min server cache)
  const { rows: sectorRows, loading: sectorLoading } = useSectorPerformance(dummySectorHeatmap);

  // Stock Indexes — Yahoo Finance (1-min server cache)
  const { rows: indexRows, loading: indexLoading } = useIndexes(
    dummyStockIndexes.map((r) => ({ symbol: r.name, name: r.name, country: r.country, value: r.value, changePercent: r.changePercent }))
  );

  // Crypto — CoinGecko (30-sec server cache)
  const { rows: cryptoRows, loading: cryptoLoading } = useCrypto(
    dummyCrypto.map((r) => ({ symbol: r.symbol, name: r.name, price: r.price, changePercent: r.changePercent, marketCap: 0 }))
  );

  // Commodities — EIA (5-min server cache)
  const { rows: commodityRows, loading: commodityLoading } = useCommodities(
    dummyCommodities.map((r) => ({ symbol: r.symbol, name: r.name, price: r.price, changePercent: r.changePercent }))
  );

  // Weather — OpenWeatherMap per searched city (10-min server cache)
  const [weatherCity, setWeatherCity] = useState('');
  const { data: liveWeatherData, loading: weatherLoading } = useLiveWeather(weatherCity);

  const videoId = liveNewsVideoIds[videoRegion] ?? liveNewsVideoIds.All;
  const webcamId = liveWebcamIds[webcamLocation] ?? liveWebcamIds.Mideast;

  const handleLayoutChange = useCallback((newLayout: ReadonlyArray<LayoutItem>) => {
    const next = newLayout.map((item) => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h }));
    setLayout(next);
    saveLayout(next);
  }, []);

  const cardClassName = 'h-full min-h-0 flex flex-col';
  const scrollClassName = 'scrollbar-invisible flex-1 min-h-0 overflow-y-auto';

  return (
    <div className="min-h-screen bg-background-primary">
      <DashboardHeader />

      <div className="w-full border-b border-border bg-background-secondary px-3 py-2">
        <input
          type="search"
          placeholder="Search markets, symbols, news..."
          className="w-full rounded border border-border bg-background-primary px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          aria-label="Search"
        />
      </div>

      <main className="w-full px-2 py-2">
        <div ref={containerRef as React.RefObject<HTMLDivElement>} className="w-full">
        {mounted && width > 0 && (
        <GridLayout
          className="layout"
          layout={layout}
          onLayoutChange={handleLayoutChange}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 100, margin: [8, 8], containerPadding: [0, 0] }}
          dragConfig={{ handle: '.dashboard-card-drag-handle' }}
          resizeConfig={{ handles: ['se', 's', 'e'] as const }}
        >
          <div key="live-news-videos" className={cardClassName}>
            <DashboardCard title="Live News — Regions" badge="LIVE" dragHandle>
              <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-wrap gap-1 border-b border-border pb-2 mb-2 shrink-0">
                  {Object.keys(liveNewsVideoIds).map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setVideoRegion(region)}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        videoRegion === region
                          ? 'bg-accent text-white'
                          : 'bg-background-primary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-h-0 rounded overflow-hidden bg-background-primary">
                  <iframe
                    title={`Live news — ${videoRegion}`}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    className="w-full h-full min-h-[200px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </DashboardCard>
          </div>

          <div key="live-webcam" className={cardClassName}>
            <DashboardCard title="Live Webcam" badge="LIVE" dragHandle>
              <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-wrap gap-1 border-b border-border pb-2 mb-2 shrink-0">
                  {Object.keys(liveWebcamIds).map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => setWebcamLocation(location)}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        webcamLocation === location
                          ? 'bg-accent text-white'
                          : 'bg-background-primary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
                {webcamLocation === 'All' ? (
                  <div className="grid grid-cols-2 gap-1 flex-1 min-h-0 rounded overflow-hidden bg-background-primary">
                    {liveWebcamGridRegions.map((region) => {
                      const id = liveWebcamIds[region];
                      if (!id) return null;
                      return (
                        <div key={region} className="min-h-0 rounded overflow-hidden">
                          <iframe
                            title={`Live webcam — ${region}`}
                            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
                            className="w-full h-full min-h-[120px]"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 rounded overflow-hidden bg-background-primary">
                    <iframe
                      title={`Live webcam — ${webcamLocation}`}
                      src={`https://www.youtube.com/embed/${webcamId}?autoplay=1`}
                      className="w-full h-full min-h-[160px]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="markets" className={cardClassName}>
            <DashboardCard title="Markets" dragHandle>
              <div className={scrollClassName}>
                <div className="divide-y divide-border">
                  {STATIC_EXCHANGES.map((ex) => (
                    <div
                      key={ex.code}
                      className="flex items-center justify-between py-1.5 text-xs"
                      title={`${ex.code} — ${ex.name}`}
                    >
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-text-primary">{ex.code}</span>
                        <span className="ml-1 text-text-secondary truncate">— {ex.name}</span>
                      </div>
                      <span className="ml-2 shrink-0 text-[10px] text-text-secondary">{ex.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </div>

          <div key="indexes" className={cardClassName}>
            <DashboardCard title="Stock Indexes" badge="LIVE" live dragHandle>
              {indexLoading ? (
                <div className="flex items-center justify-center py-6 text-text-secondary">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : (
                <div className={scrollClassName}>
                  <IndexGrid rows={indexRows.map((r) => ({ name: r.name, country: r.country, value: r.value, changePercent: r.changePercent }))} />
                </div>
              )}
            </DashboardCard>
          </div>

          <div key="commodities" className={cardClassName}>
            <DashboardCard title="Commodities" badge="LIVE" live dragHandle>
              {commodityLoading ? (
                <div className="flex items-center justify-center py-6 text-text-secondary">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : (
                <div className={scrollClassName}>
                  <PriceGrid
                    rows={commodityRows.map((r) => ({ symbol: r.symbol, name: r.name, price: r.price, changePercent: r.changePercent }))}
                    formatPrice={(p) =>
                      `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  />
                </div>
              )}
            </DashboardCard>
          </div>

          <div key="crypto" className={cardClassName}>
            <DashboardCard title="Crypto" badge="LIVE" live dragHandle>
              {cryptoLoading ? (
                <div className="flex items-center justify-center py-6 text-text-secondary">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : (
                <div className={scrollClassName}>
                  <PriceGrid
                    rows={cryptoRows.map((r) => ({ symbol: r.symbol, name: r.name, price: r.price, changePercent: r.changePercent }))}
                    formatPrice={(p) =>
                      `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  />
                </div>
              )}
            </DashboardCard>
          </div>

          <div key="news" className={cardClassName}>
            <DashboardCard title="News" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                <NewsGrid
                  items={newsToShow}
                  channels={[...NEWS_CATEGORIES]}
                  activeChannel={newsCategory}
                  onChannelChange={setNewsCategory}
                />
              </div>
            </DashboardCard>
          </div>

          <div key="ai-insights" className={cardClassName}>
            <DashboardCard title="AI Insights" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <ul className="space-y-1.5 text-xs text-text-primary">
                  {dummyAiInsights.map((line, i) => (
                    <li key={i} className="line-clamp-2">{line}</li>
                  ))}
                </ul>
              </div>
            </DashboardCard>
          </div>

          <div key="live-news" className={cardClassName}>
            <DashboardCard title="Live News" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                <div className="flex flex-wrap gap-0.5 border-b border-border pb-1 mb-1">
                  {liveNewsRegions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLiveNewsRegion(r)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                        liveNewsRegion === r
                          ? 'bg-accent text-white'
                          : 'bg-background-primary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {liveHeadlinesLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={liveHeadlines} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="government" className={cardClassName}>
            <DashboardCard title="Government" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {govLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={govNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="energy" className={cardClassName}>
            <DashboardCard title="Energy & Resources" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {energyLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={energyNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="technology" className={cardClassName}>
            <DashboardCard title="Technology" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {techLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={techNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="sector-heatmap" className={cardClassName}>
            <DashboardCard title="Sector Heatmap" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {sectorLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <SectorHeatmap rows={sectorRows} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="ai-ml" className={cardClassName}>
            <DashboardCard title="AI/ML" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {aiMlLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={aiMlNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="finance" className={cardClassName}>
            <DashboardCard title="Finance" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {financeLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={financeNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="index-charts" className={cardClassName}>
            <DashboardCard title="Charts — Major Indexes" dragHandle>
              <div className={scrollClassName}>
                <IndexCharts labels={dummyIndexChartLabels} values={dummyIndexChartValues} />
              </div>
            </DashboardCard>
          </div>

          <div key="climate" className={cardClassName}>
            <DashboardCard title="Climate" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {climateLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={climateNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="war" className={cardClassName}>
            <DashboardCard title="War" badge="LIVE" live dragHandle>
              <div className={scrollClassName}>
                {warLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent text-text-secondary" />
                  </div>
                ) : (
                  <HeadlinesList items={warNews} />
                )}
              </div>
            </DashboardCard>
          </div>

          <div key="weather" className={cardClassName}>
            <DashboardCard title="Weather" badge="LIVE" live dragHandle>
              <div className="flex flex-col h-full min-h-0">
                {/* Search input */}
                <div className="relative mb-2 shrink-0">
                  <input
                    type="text"
                    value={weatherCity}
                    onChange={(e) => setWeatherCity(e.target.value)}
                    placeholder="Search city (e.g. London)..."
                    className="w-full rounded border border-border bg-background-primary px-2 py-1.5 pr-6 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                    aria-label="Search city"
                  />
                  {weatherCity && (
                    <button
                      type="button"
                      onClick={() => setWeatherCity('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      aria-label="Clear"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className={scrollClassName}>
                  {/* Loading spinner while debounce + fetch is in flight */}
                  {weatherLoading && (
                    <div className="flex items-center justify-center py-6">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    </div>
                  )}

                  {/* API result — shown above the default list when a city was searched */}
                  {!weatherLoading && liveWeatherData && (
                    <>
                      {/* Live result row */}
                      <div className="mb-2 rounded border border-accent/30 bg-accent/5 px-2 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-text-primary">
                              {liveWeatherData.city}, {liveWeatherData.country}
                            </div>
                            <div className="mt-0.5 text-[10px] capitalize text-text-secondary">
                              {liveWeatherData.condition}
                            </div>
                            <div className="mt-0.5 text-[10px] text-text-secondary">
                              Feels {liveWeatherData.feelsLikeC}°C · H {liveWeatherData.highC}° L {liveWeatherData.lowC}°
                            </div>
                            <div className="mt-0.5 text-[10px] text-text-secondary">
                              Humidity {liveWeatherData.humidity}% · Wind {liveWeatherData.windKmh} km/h
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-bold leading-none text-text-primary">
                              {liveWeatherData.tempC}°C
                            </div>
                            <div className="mt-1 text-[9px] font-medium uppercase tracking-wide text-accent">
                              Live
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Default city list below the live result */}
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        Quick picks
                      </div>
                      <div className="divide-y divide-border">
                        {weatherCities.map((c) => (
                          <div
                            key={c.id}
                            className="flex cursor-pointer items-center justify-between rounded px-1 py-1.5 hover:bg-background-primary/60"
                            onClick={() => setWeatherCity(c.name)}
                          >
                            <div className="min-w-0 truncate">
                              <div className="text-xs font-medium text-text-primary">{c.name}, {c.country}</div>
                              <div className="truncate text-[10px] text-text-secondary">{c.condition} · H {c.highC}° L {c.lowC}°</div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-xs font-medium text-text-primary">{c.tempC}°C</span>
                              <span className="ml-1 text-[10px] text-text-secondary">{c.humidity}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Default list only — no search active */}
                  {!weatherLoading && !liveWeatherData && (
                    <div className="divide-y divide-border">
                      {weatherCities.map((c) => (
                        <div
                          key={c.id}
                          className="flex cursor-pointer items-center justify-between rounded px-1 py-1.5 hover:bg-background-primary/60"
                          onClick={() => setWeatherCity(c.name)}
                        >
                          <div className="min-w-0 truncate">
                            <div className="text-xs font-medium text-text-primary">{c.name}, {c.country}</div>
                            <div className="truncate text-[10px] text-text-secondary">{c.condition} · H {c.highC}° L {c.lowC}°</div>
                          </div>
                          <div className="flex shrink-0 items-baseline gap-1 text-right">
                            <span className="text-xs font-medium text-text-primary">{c.tempC}°C</span>
                            <span className="text-[10px] text-text-secondary">{c.humidity}% · {c.windKmh} km/h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          </div>
          <div key="globe" className={cardClassName}>
            <DashboardCard title="Global Markets — Live Earth" dragHandle>
              <GlobeCard />
            </DashboardCard>
          </div>

          <div key="world-map" className={cardClassName}>
            <DashboardCard title="World Markets Map" dragHandle>
              <WorldMapCard />
            </DashboardCard>
          </div>

        </GridLayout>
        )}
        </div>
      </main>
    </div>
  );
}
