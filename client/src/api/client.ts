const API_BASE = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresAtUtc: string;
}

export async function login(loginCode: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ loginCode: loginCode.trim() }),
  });
}

export async function getDashboard(): Promise<{ message: string; username: string; timestamp: string }> {
  return apiRequest('/api/dashboard');
}

export interface CountryDto {
  countryCode: string;
  countryName: string;
}

export interface ExchangeDto {
  id: string;
  code: string;
  name: string;
  mic: string | null;
  timezone: string | null;
  preMarket: string | null;
  hour: string | null;
  postMarket: string | null;
  closeDate: string | null;
  country: string | null;
  countryName: string | null;
  reference: string | null;
}

export async function getExchangeCountries(): Promise<CountryDto[]> {
  return apiRequest<CountryDto[]>('/api/exchanges/countries');
}

export async function getExchangesByCountry(countryCode: string | null): Promise<ExchangeDto[]> {
  const url = countryCode
    ? `/api/exchanges?country=${encodeURIComponent(countryCode)}`
    : '/api/exchanges';
  return apiRequest<ExchangeDto[]>(url);
}

export interface StockDto {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  countryCode: string;
}

export interface StockQuoteDto {
  ticker: string;
  currentPrice: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
}

export async function getIndiaStocks(): Promise<StockDto[]> {
  return apiRequest<StockDto[]>('/api/markets/india/stocks');
}

export async function syncIndiaStocks(): Promise<{ message: string; added: number }> {
  return apiRequest<{ message: string; added: number }>('/api/markets/india/sync', { method: 'POST' });
}

export async function getIndiaQuote(ticker: string): Promise<StockQuoteDto> {
  return apiRequest<StockQuoteDto>(`/api/markets/india/quote?ticker=${encodeURIComponent(ticker)}`);
}

export interface CreateUserRequest {
  newUserLoginCode: string;
  adminCode: string;
}

export interface CreateUserResponse {
  loginCode: string;
  username: string;
}

export async function createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>('/api/auth/create-user', {
    method: 'POST',
    body: JSON.stringify({
      newUserLoginCode: payload.newUserLoginCode.trim(),
      adminCode: payload.adminCode.trim(),
    }),
  });
}
