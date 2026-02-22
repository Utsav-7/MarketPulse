export interface IndexRow {
  name: string;
  country: string;
  value: number;
  changePercent: number;
}

export interface PriceRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface NewsItem {
  source: string;
  headline: string;
  timeAgo: string;
}

export const dummyStockIndexes: IndexRow[] = [
  { name: 'S&P 500', country: 'US', value: 5823.14, changePercent: 0.42 },
  { name: 'NASDAQ', country: 'US', value: 18189.32, changePercent: 0.68 },
  { name: 'Nifty 50', country: 'India', value: 24351.8, changePercent: -0.21 },
  { name: 'Sensex', country: 'India', value: 80123.45, changePercent: 0.15 },
  { name: 'FTSE 100', country: 'UK', value: 7689.2, changePercent: -0.33 },
  { name: 'DAX', country: 'Germany', value: 18452.67, changePercent: 0.55 },
  { name: 'Nikkei 225', country: 'Japan', value: 38542.1, changePercent: 1.02 },
  { name: 'Hang Seng', country: 'Hong Kong', value: 16782.34, changePercent: -0.58 },
  { name: 'Shanghai Composite', country: 'China', value: 2987.56, changePercent: 0.24 },
  { name: 'ASX 200', country: 'Australia', value: 7645.9, changePercent: 0.31 },
];

export const dummyCommodities: PriceRow[] = [
  { symbol: 'VIX', name: 'Volatility Index', price: 19.09, changePercent: -5.64 },
  { symbol: 'GOLD', name: 'Gold', price: 2651.8, changePercent: 1.67 },
  { symbol: 'SILVER', name: 'Silver', price: 31.42, changePercent: 0.89 },
  { symbol: 'OIL', name: 'WTI Crude', price: 66.48, changePercent: 0.12 },
  { symbol: 'BRENT', name: 'Brent Crude', price: 71.25, changePercent: -0.08 },
  { symbol: 'NATGAS', name: 'Natural Gas', price: 2.98, changePercent: -2.15 },
  { symbol: 'COPPER', name: 'Copper', price: 4.28, changePercent: 0.45 },
];

export const dummyCrypto: PriceRow[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 68031, changePercent: 0.07 },
  { symbol: 'ETH', name: 'Ethereum', price: 1973.84, changePercent: -0.01 },
  { symbol: 'SOL', name: 'Solana', price: 84.9, changePercent: -0.33 },
  { symbol: 'BNB', name: 'BNB', price: 612.4, changePercent: 0.52 },
  { symbol: 'XRP', name: 'XRP', price: 0.582, changePercent: -0.21 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.089, changePercent: 1.12 },
];

export const dummyNewsChannels = ['Bloomberg', 'CNBC', 'Reuters', 'Financial Times', 'Economic Times'];

export const dummyNews: NewsItem[] = [
  { source: 'Bloomberg', headline: 'Fed signals cautious stance on rate cuts amid inflation data', timeAgo: '5 min ago' },
  { source: 'CNBC', headline: 'Tech earnings beat expectations; Nasdaq futures rise', timeAgo: '12 min ago' },
  { source: 'Reuters', headline: 'Oil prices steady as demand outlook offsets supply concerns', timeAgo: '18 min ago' },
  { source: 'Financial Times', headline: 'European indices open higher on ECB policy outlook', timeAgo: '25 min ago' },
  { source: 'Economic Times', headline: 'Nifty 50 holds 24,300; banking and IT stocks lead', timeAgo: '32 min ago' },
  { source: 'Bloomberg', headline: 'Gold hits record high as investors seek haven assets', timeAgo: '41 min ago' },
  { source: 'CNBC', headline: 'Crypto market cap holds above $2.5T as BTC consolidates', timeAgo: '55 min ago' },
  { source: 'Reuters', headline: 'Asian shares mixed; Japan gains on yen weakness', timeAgo: '1 hr ago' },
];

export const liveNewsRegions = ['All', 'Mideast', 'Europe', 'Americas', 'Asia'] as const;
export const liveNewsByRegion: Record<string, NewsItem[]> = {
  All: dummyNews.slice(0, 6),
  Mideast: [
    { source: 'Al Jazeera', headline: 'Regional talks resume on energy corridor', timeAgo: '8 min ago' },
    { source: 'Al Arabiya', headline: 'Gulf indices close higher on oil outlook', timeAgo: '22 min ago' },
    { source: 'Reuters', headline: 'Middle East sovereign funds increase tech allocations', timeAgo: '45 min ago' },
  ],
  Europe: [
    { source: 'Euronews', headline: 'ECB holds rates; signals June cut', timeAgo: '12 min ago' },
    { source: 'DW', headline: 'German industrial output beats forecast', timeAgo: '28 min ago' },
    { source: 'Sky News', headline: 'FTSE 100 lifted by miners and banks', timeAgo: '1 hr ago' },
  ],
  Americas: [
    { source: 'CNBC', headline: 'S&P 500 hits fresh high on earnings', timeAgo: '5 min ago' },
    { source: 'Bloomberg', headline: 'Fed officials signal patience on cuts', timeAgo: '18 min ago' },
    { source: 'Reuters', headline: 'Latam currencies rally on dollar weakness', timeAgo: '38 min ago' },
  ],
  Asia: [
    { source: 'Nikkei', headline: 'Tokyo stocks rise on yen weakness', timeAgo: '10 min ago' },
    { source: 'Reuters', headline: 'China PMI data shows manufacturing expansion', timeAgo: '35 min ago' },
    { source: 'Economic Times', headline: 'Indian bonds gain on index inclusion flows', timeAgo: '52 min ago' },
  ],
};

export const dummyGovernment: NewsItem[] = [
  { source: 'Reuters', headline: 'White House unveils new tariff package on steel', timeAgo: '15 min ago' },
  { source: 'FT', headline: 'EU agrees on next round of Russia sanctions', timeAgo: '1 hr ago' },
  { source: 'AP', headline: 'Treasury yields rise after auction results', timeAgo: '2 hr ago' },
  { source: 'Bloomberg', headline: 'Fed vice chair flags inflation uncertainty', timeAgo: '3 hr ago' },
];

export const dummyEnergy: NewsItem[] = [
  { source: 'Reuters', headline: 'OPEC+ extends output cuts into Q3', timeAgo: '20 min ago' },
  { source: 'Bloomberg', headline: 'US natural gas futures drop on mild weather', timeAgo: '45 min ago' },
  { source: 'FT', headline: 'European power prices fall on renewable surge', timeAgo: '1 hr ago' },
  { source: 'IEA', headline: 'Global oil demand growth revised lower for 2025', timeAgo: '2 hr ago' },
];

export const dummyTechnology: NewsItem[] = [
  { source: 'TechCrunch', headline: 'Major cloud provider reports record capex', timeAgo: '25 min ago' },
  { source: 'Reuters', headline: 'Chip stocks rally on AI demand outlook', timeAgo: '48 min ago' },
  { source: 'Bloomberg', headline: 'Apple announces new AI features at WWDC', timeAgo: '1 hr ago' },
  { source: 'CNBC', headline: 'Cybersecurity M&A activity hits record', timeAgo: '2 hr ago' },
];

export const dummySectorHeatmap: { sector: string; change: number }[] = [
  { sector: 'Tech', change: 1.2 },
  { sector: 'Healthcare', change: 0.3 },
  { sector: 'Financials', change: -0.5 },
  { sector: 'Energy', change: 0.8 },
  { sector: 'Consumer', change: -0.2 },
  { sector: 'Industrials', change: 0.6 },
  { sector: 'Materials', change: -0.4 },
  { sector: 'Utilities', change: 0.1 },
  { sector: 'Real Estate', change: -0.9 },
];

export const dummyAiMl: NewsItem[] = [
  { source: 'VentureBeat', headline: 'OpenAI releases new reasoning model', timeAgo: '30 min ago' },
  { source: 'Reuters', headline: 'Nvidia revenue beats on data center demand', timeAgo: '55 min ago' },
  { source: 'MIT Tech', headline: 'Study shows LLMs improve coding productivity 40%', timeAgo: '1 hr ago' },
  { source: 'Bloomberg', headline: 'AI chip startups raise $2B in latest round', timeAgo: '2 hr ago' },
];

export const dummyFinance: NewsItem[] = [
  { source: 'Bloomberg', headline: 'Hedge funds increase equity exposure to 18-month high', timeAgo: '10 min ago' },
  { source: 'Reuters', headline: 'Investment grade bond issuance hits record', timeAgo: '32 min ago' },
  { source: 'FT', headline: 'Private credit funds face redemption pressure', timeAgo: '1 hr ago' },
  { source: 'CNBC', headline: 'Major bank beats earnings; raises guidance', timeAgo: '2 hr ago' },
];

export const dummyClimate: NewsItem[] = [
  { source: 'Reuters', headline: 'Carbon credit prices rise on regulation clarity', timeAgo: '18 min ago' },
  { source: 'Bloomberg', headline: 'Green bond issuance tops $500B year-to-date', timeAgo: '42 min ago' },
  { source: 'FT', headline: 'Insurers raise climate risk premiums in Florida', timeAgo: '1 hr ago' },
  { source: 'IEA', headline: 'Renewable capacity additions set new record', timeAgo: '2 hr ago' },
];

export const dummyWar: NewsItem[] = [
  { source: 'Reuters', headline: 'Defense contractors see order backlog rise', timeAgo: '22 min ago' },
  { source: 'AP', headline: 'UN reports humanitarian corridor progress', timeAgo: '50 min ago' },
  { source: 'Bloomberg', headline: 'Commodity traders flag shipping disruption risk', timeAgo: '1 hr ago' },
  { source: 'FT', headline: 'NATO members agree on increased spending target', timeAgo: '2 hr ago' },
];

export const dummyAiInsights: string[] = [
  'Market sentiment: Bullish (72% long).',
  'Sector rotation: Money flowing into Tech and Healthcare.',
  'Volatility forecast: VIX expected to stay below 20 next week.',
  'Correlation: Equity-bond correlation turned positive.',
  'Earnings: 68% of S&P 500 beat estimates this quarter.',
];

export const dummyIndexChartLabels = ['S&P 500', 'NASDAQ', 'Nifty 50', 'DAX', 'Nikkei'];
export const dummyIndexChartValues = [5823, 18189, 24351, 18452, 38542];

/** YouTube video/stream IDs for Live News by region (embeddable). */
export const liveNewsVideoIds: Record<string, string> = {
  All: 'YDvsBbKfLPA',
  Mideast: 'gCNeDWCI0vo',
  Europe: 'Lh5GXucy2EU',
  Americas: 'I0p3AYOxVmk',
  Asia: 'XWq5kBlakcQ',
};

/** YouTube embed IDs for Live Webcam by location. "All" shows grid of Mideast, Americas, Europe, Asia. */
export const liveWebcamIds: Record<string, string> = {
  All: '', // grid view in UI
  Mideast: '-zGuR1qVKrU',
  Americas: '1wV9lLe14aU',
  Europe: 'e2gC37ILQmk',
  Asia: 'B8iK5cX8DKY',
};

/** Region keys used for All webcam grid (order: Mideast, Americas, Europe, Asia). */
export const liveWebcamGridRegions = ['Mideast', 'Americas', 'Europe', 'Asia'] as const;

export interface WeatherCity {
  id: string;
  name: string;
  country: string;
  tempC: number;
  condition: string;
  humidity: number;
  windKmh: number;
  highC: number;
  lowC: number;
}

/** Dummy weather for cities around the world (replace with real API e.g. OpenWeather). */
export const weatherCities: WeatherCity[] = [
  { id: 'london', name: 'London', country: 'UK', tempC: 12, condition: 'Partly cloudy', humidity: 72, windKmh: 18, highC: 14, lowC: 8 },
  { id: 'new-york', name: 'New York', country: 'US', tempC: 22, condition: 'Sunny', humidity: 45, windKmh: 12, highC: 24, lowC: 16 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', tempC: 28, condition: 'Clear', humidity: 58, windKmh: 8, highC: 30, lowC: 24 },
  { id: 'dubai', name: 'Dubai', country: 'UAE', tempC: 38, condition: 'Sunny', humidity: 32, windKmh: 14, highC: 40, lowC: 32 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', tempC: 32, condition: 'Humid', humidity: 78, windKmh: 11, highC: 34, lowC: 28 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', tempC: 19, condition: 'Partly cloudy', humidity: 65, windKmh: 22, highC: 21, lowC: 15 },
  { id: 'paris', name: 'Paris', country: 'France', tempC: 15, condition: 'Cloudy', humidity: 68, windKmh: 15, highC: 17, lowC: 10 },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', tempC: 31, condition: 'Thunderstorms', humidity: 82, windKmh: 9, highC: 32, lowC: 26 },
  { id: 'berlin', name: 'Berlin', country: 'Germany', tempC: 11, condition: 'Rain', humidity: 85, windKmh: 20, highC: 13, lowC: 7 },
  { id: 'toronto', name: 'Toronto', country: 'Canada', tempC: 18, condition: 'Sunny', humidity: 52, windKmh: 16, highC: 20, lowC: 12 },
];
