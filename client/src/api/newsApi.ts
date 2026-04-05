import { useEffect, useRef, useState } from 'react';
import type { NewsItem, WeatherCity } from '../data/dashboardDummyData';
import {
  getNewsByCard,
  getWeather,
  getSectorPerformance,
  getIndexes,
  getCrypto,
  getCommodities,
  type BackendNewsArticle,
  type WeatherResult,
  type SectorPerformance,
  type IndexQuoteDto,
  type CryptoPriceDto,
  type CommodityPriceDto,
} from './client';

const GNEWS_BASE = 'https://gnews.io/api/v4';

interface GNewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

function getApiKey(): string {
  return typeof import.meta.env.VITE_GNEWS_API_KEY === 'string'
    ? import.meta.env.VITE_GNEWS_API_KEY
    : '';
}

export function hasNewsApiKey(): boolean {
  return !!getApiKey();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function gNewsRequest(
  endpoint: string,
  params: Record<string, string>
): Promise<GNewsResponse> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('VITE_GNEWS_API_KEY not configured');
  const searchParams = new URLSearchParams({ ...params, apikey: apiKey });
  const res = await fetch(`${GNEWS_BASE}/${endpoint}?${searchParams}`);
  if (!res.ok) throw new Error(`GNews API error: ${res.status}`);
  return res.json() as Promise<GNewsResponse>;
}

function mapArticles(data: GNewsResponse): NewsItem[] {
  return (data.articles ?? []).map((a) => ({
    source: a.source.name,
    headline: a.title,
    timeAgo: timeAgo(a.publishedAt),
  }));
}

export async function fetchNewsByCategory(
  category: string,
  max = 8
): Promise<NewsItem[]> {
  const data = await gNewsRequest('top-headlines', {
    category,
    lang: 'en',
    max: String(max),
  });
  return mapArticles(data);
}

export async function fetchNewsByQuery(
  query: string,
  max = 8
): Promise<NewsItem[]> {
  const data = await gNewsRequest('search', {
    q: query,
    lang: 'en',
    sortby: 'publishedAt',
    max: String(max),
  });
  return mapArticles(data);
}

// Category labels shown in the News card tabs
export const NEWS_CATEGORIES = ['Business', 'Technology', 'World', 'Science', 'Health'] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

// Map each category label to GNews category or query
const CATEGORY_FETCH: Record<string, () => Promise<NewsItem[]>> = {
  Business: () => fetchNewsByCategory('business'),
  Technology: () => fetchNewsByCategory('technology'),
  World: () => fetchNewsByCategory('world'),
  Science: () => fetchNewsByCategory('science'),
  Health: () => fetchNewsByCategory('health'),
};

export function useLiveNews(
  category: string,
  fallback: NewsItem[]
): { items: NewsItem[]; loading: boolean } {
  const [items, setItems] = useState<NewsItem[]>(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasNewsApiKey()) return;
    const fetcher = CATEGORY_FETCH[category];
    if (!fetcher) return;
    setLoading(true);
    fetcher()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return { items, loading };
}

export function useLiveNewsByQuery(
  query: string,
  fallback: NewsItem[]
): { items: NewsItem[]; loading: boolean } {
  const [items, setItems] = useState<NewsItem[]>(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasNewsApiKey()) return;
    setLoading(true);
    fetchNewsByQuery(query)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  return { items, loading };
}

export function useLiveNewsByCategory(
  category: string,
  fallback: NewsItem[]
): { items: NewsItem[]; loading: boolean } {
  const [items, setItems] = useState<NewsItem[]>(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasNewsApiKey()) return;
    setLoading(true);
    fetchNewsByCategory(category)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return { items, loading };
}

// ── Backend-proxied NewsAPI hook ─────────────────────────────────────────────

function mapBackendArticle(a: BackendNewsArticle): NewsItem {
  return {
    source: a.source,
    headline: a.headline,
    timeAgo: timeAgo(a.publishedAt),
  };
}

/**
 * Fetches news from the backend `/api/news?card=<card>` endpoint (NewsAPI proxied,
 * 15-min server cache). Falls back to `fallback` on error or empty response.
 * Re-fetches every `pollMs` ms (default 15 min).
 */
export function useBackendNews(
  card: string,
  fallback: NewsItem[],
  pollMs = 15 * 60 * 1000
): { items: NewsItem[]; loading: boolean } {
  const [items, setItems] = useState<NewsItem[]>(fallback);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const data = await getNewsByCard(card);
        if (!cancelled && data.length > 0) setItems(data.map(mapBackendArticle));
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    timerRef.current = setInterval(fetch, pollMs);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [card, pollMs]);

  return { items, loading };
}

// ── Weather hook ─────────────────────────────────────────────────────────────

/**
 * Fetches live weather for a city from `/api/weather?city=<city>`.
 * - Debounces 600 ms after the last keystroke before calling the API.
 * - Clears result immediately when the input is emptied.
 * - Re-fetches every 10 minutes for the current city.
 */
export function useLiveWeather(
  city: string
): { data: WeatherResult | null; loading: boolean } {
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear result immediately when input is empty
    if (!city.trim()) {
      setData(null);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      try {
        const result = await getWeather(city.trim());
        if (!cancelled) setData(result);
      } catch {
        // keep previous result on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Debounce: wait 600 ms after last keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (pollRef.current) clearInterval(pollRef.current);

    debounceRef.current = setTimeout(() => {
      doFetch();
      // After first fetch, re-poll every 10 min
      pollRef.current = setInterval(doFetch, 10 * 60 * 1000);
    }, 600);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [city]);

  return { data, loading };
}

// ── Sector Heatmap hook ──────────────────────────────────────────────────────

/**
 * Fetches US sector performance from the backend `/api/sectors` endpoint (Alpha Vantage,
 * 5-min server cache). Falls back to `fallback` on error.
 * Re-fetches every 5 minutes.
 */
export function useSectorPerformance(
  fallback: { sector: string; change: number }[]
): { rows: { sector: string; change: number }[]; loading: boolean } {
  const [rows, setRows] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const data: SectorPerformance[] = await getSectorPerformance();
        if (!cancelled && data.length > 0) setRows(data);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    timerRef.current = setInterval(fetch, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { rows, loading };
}

// ── Stock Indexes hook ───────────────────────────────────────────────────────

export function useIndexes(
  fallback: IndexQuoteDto[]
): { rows: IndexQuoteDto[]; loading: boolean } {
  const [rows, setRows] = useState<IndexQuoteDto[]>(fallback);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      try {
        const data = await getIndexes();
        if (!cancelled && data.length > 0) setRows(data);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doFetch();
    timerRef.current = setInterval(doFetch, 60 * 1000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { rows, loading };
}

// ── Crypto hook ──────────────────────────────────────────────────────────────

export function useCrypto(
  fallback: CryptoPriceDto[]
): { rows: CryptoPriceDto[]; loading: boolean } {
  const [rows, setRows] = useState<CryptoPriceDto[]>(fallback);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      try {
        const data = await getCrypto();
        if (!cancelled && data.length > 0) setRows(data);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doFetch();
    timerRef.current = setInterval(doFetch, 30 * 1000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { rows, loading };
}

// ── Commodities hook ─────────────────────────────────────────────────────────

export function useCommodities(
  fallback: CommodityPriceDto[]
): { rows: CommodityPriceDto[]; loading: boolean } {
  const [rows, setRows] = useState<CommodityPriceDto[]>(fallback);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      try {
        const data = await getCommodities();
        if (!cancelled && data.length > 0) setRows(data);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doFetch();
    timerRef.current = setInterval(doFetch, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { rows, loading };
}
