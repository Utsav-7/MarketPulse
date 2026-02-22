import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GridLayout, { useContainerWidth } from 'react-grid-layout';
import { useAuth } from '../context/AuthContext';
import {
  getExchangeCountries,
  getExchangesByCountry,
  ApiError,
  type CountryDto,
  type ExchangeDto,
} from '../api/client';
import { PageLoader } from '../components/common';
import {
  DashboardCard,
  DashboardHeader,
  HeadlinesList,
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
  dummyNewsChannels,
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

const LAYOUT_STORAGE_KEY = 'marketpulse-dashboard-layout';

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
  const { username, logout, isAuthenticated, isLoading } = useAuth();
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<LayoutItem[]>(loadStoredLayout);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newsChannel, setNewsChannel] = useState<string>(dummyNewsChannels[0]);
  const [liveNewsRegion, setLiveNewsRegion] = useState<string>('All');
  const [videoRegion, setVideoRegion] = useState<string>('All');
  const [webcamLocation, setWebcamLocation] = useState<string>('All');
  const [weatherSearch, setWeatherSearch] = useState<string>('');
  const navigate = useNavigate();

  const filteredNews = dummyNews.filter((n) => n.source === newsChannel);
  const newsToShow = filteredNews.length > 0 ? filteredNews : dummyNews;
  const liveNewsItems = liveNewsByRegion[liveNewsRegion] ?? liveNewsByRegion.All;
  const videoId = liveNewsVideoIds[videoRegion] ?? liveNewsVideoIds.All;
  const webcamId = liveWebcamIds[webcamLocation] ?? liveWebcamIds.Mideast;
  const weatherSearchLower = weatherSearch.trim().toLowerCase();
  const filteredWeatherCities = weatherSearchLower
    ? weatherCities.filter(
        (c) =>
          c.name.toLowerCase().includes(weatherSearchLower) ||
          c.country.toLowerCase().includes(weatherSearchLower)
      )
    : weatherCities;

  const loadCountries = useCallback(() => {
    return getExchangeCountries()
      .then(setCountries)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          navigate('/login', { replace: true });
        } else {
          toast.error('Failed to load countries.');
        }
      });
  }, [logout, navigate]);

  const loadExchanges = useCallback(() => {
    return getExchangesByCountry(selectedCountry || null)
      .then(setExchanges)
      .catch(() => toast.error('Failed to load exchanges.'));
  }, [selectedCountry]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingCountries(true);
    loadCountries().finally(() => setLoadingCountries(false));
  }, [isAuthenticated, loadCountries]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingExchanges(true);
    loadExchanges().finally(() => setLoadingExchanges(false));
  }, [isAuthenticated, selectedCountry, loadExchanges]);

  const handleLayoutChange = useCallback((newLayout: ReadonlyArray<LayoutItem>) => {
    const next = newLayout.map((item) => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h }));
    setLayout(next);
    saveLayout(next);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadCountries(), loadExchanges()]).finally(() => setRefreshing(false));
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login', { replace: true });
  };

  if (isLoading || !isAuthenticated) return <PageLoader />;

  const countryDropdown = (
    <select
      id="country-select"
      value={selectedCountry}
      onChange={(e) => setSelectedCountry(e.target.value)}
      disabled={loadingCountries}
      className="max-w-[140px] rounded border border-border bg-background-primary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
      title="Country"
    >
      <option value="">All</option>
      {countries.map((c) => (
        <option key={c.countryCode} value={c.countryCode}>
          {c.countryCode}
        </option>
      ))}
    </select>
  );

  const cardClassName = 'h-full min-h-0 flex flex-col';
  const scrollClassName = 'scrollbar-invisible flex-1 min-h-0 overflow-y-auto';

  return (
    <div className="min-h-screen bg-background-primary">
      <DashboardHeader username={username} onLogout={handleLogout} />

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
            <DashboardCard
              title="Markets"
              badge="LIVE"
              headerRight={countryDropdown}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              dragHandle
            >
              {loadingExchanges ? (
                <div className="flex items-center justify-center py-6 text-text-secondary">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : (
                <div className={scrollClassName}>
                  {exchanges.length === 0 ? (
                    <div className="py-4 text-center text-xs text-text-secondary">No exchanges</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {exchanges.map((ex) => (
                        <div
                          key={ex.id}
                          className="truncate py-1.5 text-xs text-text-primary"
                          title={`${ex.code} — ${ex.name}`}
                        >
                          <span className="font-medium">{ex.code}</span>
                          <span className="ml-1 text-text-secondary">— {ex.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </DashboardCard>
          </div>

          <div key="indexes" className={cardClassName}>
            <DashboardCard title="Stock Indexes" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <IndexGrid rows={dummyStockIndexes} />
              </div>
            </DashboardCard>
          </div>

          <div key="commodities" className={cardClassName}>
            <DashboardCard title="Commodities" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <PriceGrid
                  rows={dummyCommodities}
                  formatPrice={(p) =>
                    `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                />
              </div>
            </DashboardCard>
          </div>

          <div key="crypto" className={cardClassName}>
            <DashboardCard title="Crypto" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <PriceGrid
                  rows={dummyCrypto}
                  formatPrice={(p) =>
                    `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                />
              </div>
            </DashboardCard>
          </div>

          <div key="news" className={cardClassName}>
            <DashboardCard title="News" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <NewsGrid
                  items={newsToShow}
                  channels={dummyNewsChannels}
                  activeChannel={newsChannel}
                  onChannelChange={setNewsChannel}
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
            <DashboardCard title="Live News" badge="LIVE" dragHandle>
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
                <HeadlinesList items={liveNewsItems} />
              </div>
            </DashboardCard>
          </div>

          <div key="government" className={cardClassName}>
            <DashboardCard title="Government" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyGovernment} />
              </div>
            </DashboardCard>
          </div>

          <div key="energy" className={cardClassName}>
            <DashboardCard title="Energy & Resources" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyEnergy} />
              </div>
            </DashboardCard>
          </div>

          <div key="technology" className={cardClassName}>
            <DashboardCard title="Technology" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyTechnology} />
              </div>
            </DashboardCard>
          </div>

          <div key="sector-heatmap" className={cardClassName}>
            <DashboardCard title="Sector Heatmap" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <SectorHeatmap rows={dummySectorHeatmap} />
              </div>
            </DashboardCard>
          </div>

          <div key="ai-ml" className={cardClassName}>
            <DashboardCard title="AI/ML" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyAiMl} />
              </div>
            </DashboardCard>
          </div>

          <div key="finance" className={cardClassName}>
            <DashboardCard title="Finance" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyFinance} />
              </div>
            </DashboardCard>
          </div>

          <div key="index-charts" className={cardClassName}>
            <DashboardCard title="Charts — Major Indexes" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <IndexCharts labels={dummyIndexChartLabels} values={dummyIndexChartValues} />
              </div>
            </DashboardCard>
          </div>

          <div key="climate" className={cardClassName}>
            <DashboardCard title="Climate" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyClimate} />
              </div>
            </DashboardCard>
          </div>

          <div key="war" className={cardClassName}>
            <DashboardCard title="War" badge="LIVE" dragHandle>
              <div className={scrollClassName}>
                <HeadlinesList items={dummyWar} />
              </div>
            </DashboardCard>
          </div>

          <div key="weather" className={cardClassName}>
            <DashboardCard title="Weather" badge="LIVE" dragHandle>
              <div className="flex flex-col h-full min-h-0">
                <input
                  type="search"
                  value={weatherSearch}
                  onChange={(e) => setWeatherSearch(e.target.value)}
                  placeholder="Search city or country..."
                  className="mb-2 w-full rounded border border-border bg-background-primary px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  aria-label="Search city or country"
                />
                <div className={scrollClassName}>
                  <div className="divide-y divide-border">
                    {filteredWeatherCities.length === 0 ? (
                      <div className="py-3 text-center text-xs text-text-secondary">No cities match</div>
                    ) : (
                      filteredWeatherCities.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 truncate">
                            <div className="text-xs font-medium text-text-primary">
                              {c.name}, {c.country}
                            </div>
                            <div className="truncate text-[10px] text-text-secondary">
                              {c.condition} · H {c.highC}° L {c.lowC}°
                            </div>
                          </div>
                          <div className="flex shrink-0 items-baseline gap-1 text-right">
                            <span className="text-xs font-medium text-text-primary">{c.tempC}°C</span>
                            <span className="text-[10px] text-text-secondary">
                              {c.humidity}% · {c.windKmh} km/h
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </GridLayout>
        )}
        </div>
      </main>
    </div>
  );
}
