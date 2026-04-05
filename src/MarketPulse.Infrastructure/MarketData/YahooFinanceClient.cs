using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace MarketPulse.Infrastructure.MarketData;

/// <summary>
/// Fetches quotes from Yahoo Finance v8 JSON endpoint.
/// Requires a one-time crumb + cookie obtained from finance.yahoo.com.
/// No API key needed — free and unlimited for low-volume use.
/// </summary>
public class YahooFinanceClient
{
    private readonly HttpClient _http;
    private readonly ILogger<YahooFinanceClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    // Crumb is session-scoped; refresh when a request returns 401
    private string? _crumb;
    private readonly SemaphoreSlim _crumbLock = new(1, 1);

    // Crypto symbols (Yahoo Finance -USD suffix)
    public static readonly (string Symbol, string Name, string Ticker)[] CryptoSymbols =
    [
        ("BTC-USD",  "Bitcoin",  "BTC"),
        ("ETH-USD",  "Ethereum", "ETH"),
        ("SOL-USD",  "Solana",   "SOL"),
        ("BNB-USD",  "BNB",      "BNB"),
        ("XRP-USD",  "XRP",      "XRP"),
        ("DOGE-USD", "Dogecoin", "DOGE"),
    ];

    // Commodity futures symbols
    public static readonly (string Symbol, string DisplaySymbol, string Name)[] CommoditySymbols =
    [
        ("GC=F",  "GOLD",   "Gold"),
        ("SI=F",  "SILVER", "Silver"),
        ("CL=F",  "OIL",    "WTI Crude"),
        ("BZ=F",  "BRENT",  "Brent Crude"),
        ("NG=F",  "NATGAS", "Natural Gas"),
        ("HG=F",  "COPPER", "Copper"),
    ];

    // Well-known index symbols
    public static readonly (string Symbol, string Name, string Country)[] IndexSymbols =
    [
        ("^GSPC",  "S&P 500",            "US"),
        ("^IXIC",  "NASDAQ",             "US"),
        ("^DJI",   "Dow Jones",          "US"),
        ("^NSEI",  "Nifty 50",           "India"),
        ("^BSESN", "Sensex",             "India"),
        ("^FTSE",  "FTSE 100",           "UK"),
        ("^GDAXI", "DAX",                "Germany"),
        ("^N225",  "Nikkei 225",         "Japan"),
        ("^HSI",   "Hang Seng",          "Hong Kong"),
        ("^AXJO",  "ASX 200",            "Australia"),
        ("^SSEC",  "Shanghai Composite", "China"),
        ("^VIX",   "VIX",                "US"),
    ];

    public YahooFinanceClient(HttpClient http, ILogger<YahooFinanceClient> logger)
    {
        _http = http;
        _logger = logger;
        _http.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _http.DefaultRequestHeaders.Add("Accept", "application/json,text/plain,*/*");
        _http.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
        _http.DefaultRequestHeaders.Add("Origin", "https://finance.yahoo.com");
        _http.DefaultRequestHeaders.Add("Referer", "https://finance.yahoo.com/");
    }

    // ── Crumb management ────────────────────────────────────────────────────────

    private async Task EnsureCrumbAsync(CancellationToken ct)
    {
        if (_crumb != null) return;
        await _crumbLock.WaitAsync(ct);
        try
        {
            if (_crumb != null) return;
            _crumb = await FetchCrumbAsync(ct);
        }
        finally
        {
            _crumbLock.Release();
        }
    }

    private async Task<string?> FetchCrumbAsync(CancellationToken ct)
    {
        try
        {
            // Visit finance.yahoo.com to get session cookies
            var htmlResp = await _http.GetAsync("https://finance.yahoo.com/", ct);
            htmlResp.EnsureSuccessStatusCode();

            // Fetch the crumb
            var crumbResp = await _http.GetAsync("https://query2.finance.yahoo.com/v1/test/getcrumb", ct);
            if (!crumbResp.IsSuccessStatusCode) return null;
            var crumb = (await crumbResp.Content.ReadAsStringAsync(ct)).Trim();
            _logger.LogInformation("Yahoo Finance crumb obtained: {Crumb}", crumb);
            return string.IsNullOrWhiteSpace(crumb) ? null : crumb;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch Yahoo Finance crumb");
            return null;
        }
    }

    private async Task InvalidateCrumbAsync(CancellationToken ct)
    {
        await _crumbLock.WaitAsync(ct);
        try { _crumb = null; }
        finally { _crumbLock.Release(); }
    }

    // ── Core quote fetch ─────────────────────────────────────────────────────────

    private async Task<JsonElement?> FetchQuotesAsync(string symbols, CancellationToken ct)
    {
        await EnsureCrumbAsync(ct);

        var crumbParam = _crumb != null ? $"&crumb={Uri.EscapeDataString(_crumb)}" : "";
        var url = $"https://query2.finance.yahoo.com/v8/finance/quote?symbols={Uri.EscapeDataString(symbols)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,marketCap{crumbParam}";

        var resp = await _http.GetAsync(url, ct);

        if (resp.StatusCode == HttpStatusCode.Unauthorized || resp.StatusCode == HttpStatusCode.Forbidden)
        {
            // Crumb expired — refresh once and retry
            await InvalidateCrumbAsync(ct);
            await EnsureCrumbAsync(ct);
            crumbParam = _crumb != null ? $"&crumb={Uri.EscapeDataString(_crumb)}" : "";
            url = $"https://query2.finance.yahoo.com/v8/finance/quote?symbols={Uri.EscapeDataString(symbols)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,marketCap{crumbParam}";
            resp = await _http.GetAsync(url, ct);
        }

        resp.EnsureSuccessStatusCode();
        var raw = await resp.Content.ReadFromJsonAsync<JsonElement>(JsonOpts, ct);

        if (!raw.TryGetProperty("quoteResponse", out var qr) ||
            !qr.TryGetProperty("result", out var result))
            return null;

        return result;
    }

    // ── Public methods ───────────────────────────────────────────────────────────

    public async Task<List<IndexQuoteDto>> GetIndexQuotesAsync(CancellationToken ct = default)
    {
        var results = new List<IndexQuoteDto>();
        try
        {
            var symbols = string.Join(",", IndexSymbols.Select(s => s.Symbol));
            var resultArr = await FetchQuotesAsync(symbols, ct);
            if (resultArr is null) return results;

            foreach (var item in resultArr.Value.EnumerateArray())
            {
                var symbol = item.TryGetProperty("symbol", out var s) ? s.GetString() ?? "" : "";
                var meta   = IndexSymbols.FirstOrDefault(x => x.Symbol == symbol);
                var price  = item.TryGetProperty("regularMarketPrice", out var p) ? p.GetDouble() : 0;
                var change = item.TryGetProperty("regularMarketChangePercent", out var c) ? c.GetDouble() : 0;

                results.Add(new IndexQuoteDto
                {
                    Symbol        = symbol,
                    Name          = meta.Name ?? symbol,
                    Country       = meta.Country ?? "",
                    Value         = Math.Round(price, 2),
                    ChangePercent = Math.Round(change, 2),
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "YahooFinance index fetch failed");
        }
        return results;
    }

    public async Task<List<CryptoQuoteDto>> GetCryptoPricesAsync(CancellationToken ct = default)
    {
        var results = new List<CryptoQuoteDto>();
        try
        {
            var symbols    = string.Join(",", CryptoSymbols.Select(s => s.Symbol));
            var resultArr  = await FetchQuotesAsync(symbols, ct);
            if (resultArr is null) return results;

            foreach (var item in resultArr.Value.EnumerateArray())
            {
                var symbol = item.TryGetProperty("symbol", out var s) ? s.GetString() ?? "" : "";
                var meta   = CryptoSymbols.FirstOrDefault(x => x.Symbol == symbol);
                var price  = item.TryGetProperty("regularMarketPrice", out var p) ? p.GetDouble() : 0;
                var change = item.TryGetProperty("regularMarketChangePercent", out var c) ? c.GetDouble() : 0;
                var cap    = item.TryGetProperty("marketCap", out var mc) ? mc.GetDouble() : 0;

                results.Add(new CryptoQuoteDto
                {
                    Symbol        = meta.Ticker ?? symbol,
                    Name          = meta.Name ?? symbol,
                    Price         = Math.Round(price, price >= 1 ? 2 : 6),
                    ChangePercent = Math.Round(change, 2),
                    MarketCap     = cap,
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "YahooFinance crypto fetch failed");
        }
        return results;
    }

    public async Task<List<CommodityQuoteDto>> GetCommodityPricesAsync(CancellationToken ct = default)
    {
        var results = new List<CommodityQuoteDto>();
        try
        {
            var symbols   = string.Join(",", CommoditySymbols.Select(s => s.Symbol));
            var resultArr = await FetchQuotesAsync(symbols, ct);
            if (resultArr is null) return results;

            foreach (var item in resultArr.Value.EnumerateArray())
            {
                var symbol = item.TryGetProperty("symbol", out var s) ? s.GetString() ?? "" : "";
                var meta   = CommoditySymbols.FirstOrDefault(x => x.Symbol == symbol);
                var price  = item.TryGetProperty("regularMarketPrice", out var p) ? p.GetDouble() : 0;
                var change = item.TryGetProperty("regularMarketChangePercent", out var c) ? c.GetDouble() : 0;

                results.Add(new CommodityQuoteDto
                {
                    Symbol        = meta.DisplaySymbol ?? symbol,
                    Name          = meta.Name ?? symbol,
                    Price         = Math.Round(price, 2),
                    ChangePercent = Math.Round(change, 2),
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "YahooFinance commodity fetch failed");
        }
        return results;
    }
}

public class CryptoQuoteDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double ChangePercent { get; set; }
    public double MarketCap { get; set; }
}

public class CommodityQuoteDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double ChangePercent { get; set; }
}

public class IndexQuoteDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double Value { get; set; }
    public double ChangePercent { get; set; }
}
