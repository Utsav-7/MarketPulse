using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarketPulse.Infrastructure.Sectors;

public class AlphaVantageClient
{
    private readonly HttpClient _http;
    private readonly AlphaVantageOptions _options;
    private readonly ILogger<AlphaVantageClient> _logger;

    public AlphaVantageClient(HttpClient http, IOptions<AlphaVantageOptions> options, ILogger<AlphaVantageClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri("https://www.alphavantage.co/");
    }

    /// <summary>
    /// Returns commodity prices using Alpha Vantage commodity + FX endpoints.
    /// Covers: WTI, Brent, Natural Gas, Gold, Silver, Copper.
    /// </summary>
    public async Task<List<CommodityPriceResultDto>> GetCommodityPricesAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("AlphaVantage ApiKey not configured; returning empty commodity data.");
            return new List<CommodityPriceResultDto>();
        }

        var results = new List<CommodityPriceResultDto>();

        // Energy — daily series (function=WTI / BRENT / NATURAL_GAS)
        var energySeries = new[]
        {
            ("WTI",     "WTI Crude",   "WTI"),
            ("BRENT",   "Brent Crude", "BRENT"),
            ("NATURAL_GAS", "Natural Gas", "NATGAS"),
        };

        foreach (var (fn, name, symbol) in energySeries)
        {
            var dto = await FetchEnergySeriesAsync(fn, name, symbol, ct);
            if (dto != null) results.Add(dto);
        }

        // Metals — physical commodity series
        var metalSeries = new[]
        {
            ("COPPER", "Copper", "COPPER"),
        };
        foreach (var (fn, name, symbol) in metalSeries)
        {
            var dto = await FetchEnergySeriesAsync(fn, name, symbol, ct);
            if (dto != null) results.Add(dto);
        }

        // Gold & Silver via CURRENCY_EXCHANGE_RATE (XAU/USD, XAG/USD)
        var precious = new[]
        {
            ("XAU", "Gold",   "GOLD"),
            ("XAG", "Silver", "SILVER"),
        };
        foreach (var (from, name, symbol) in precious)
        {
            var dto = await FetchForexRateAsync(from, name, symbol, ct);
            if (dto != null) results.Add(dto);
        }

        return results;
    }

    private async Task<CommodityPriceResultDto?> FetchEnergySeriesAsync(
        string function, string name, string symbol, CancellationToken ct)
    {
        try
        {
            var url = $"query?function={function}&interval=daily&apikey={_options.ApiKey}";
            var raw = await _http.GetFromJsonAsync<JsonElement>(url, ct);

            if (!raw.TryGetProperty("data", out var dataArr)) return null;
            var items = dataArr.EnumerateArray().Take(2).ToList();
            if (items.Count == 0) return null;

            var latest = items[0];
            var prev   = items.Count > 1 ? items[1] : items[0];

            if (!latest.TryGetProperty("value", out var valEl)) return null;
            var price    = double.TryParse(valEl.GetString(), System.Globalization.NumberStyles.Any,
                               System.Globalization.CultureInfo.InvariantCulture, out var p) ? p : 0;
            var prevPrice = prev.TryGetProperty("value", out var prevEl) &&
                            double.TryParse(prevEl.GetString(), System.Globalization.NumberStyles.Any,
                               System.Globalization.CultureInfo.InvariantCulture, out var pp) ? pp : price;

            var change = prevPrice != 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;
            return new CommodityPriceResultDto
            {
                Symbol = symbol, Name = name,
                Price = Math.Round(price, 2), ChangePercent = Math.Round(change, 2),
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AlphaVantage commodity fetch failed for {Function}", function);
            return null;
        }
    }

    private async Task<CommodityPriceResultDto?> FetchForexRateAsync(
        string fromCurrency, string name, string symbol, CancellationToken ct)
    {
        try
        {
            var url = $"query?function=CURRENCY_EXCHANGE_RATE&from_currency={fromCurrency}&to_currency=USD&apikey={_options.ApiKey}";
            var raw = await _http.GetFromJsonAsync<JsonElement>(url, ct);

            if (!raw.TryGetProperty("Realtime Currency Exchange Rate", out var rate)) return null;
            if (!rate.TryGetProperty("5. Exchange Rate", out var rateEl)) return null;

            var price = double.TryParse(rateEl.GetString(), System.Globalization.NumberStyles.Any,
                            System.Globalization.CultureInfo.InvariantCulture, out var p) ? p : 0;

            return new CommodityPriceResultDto
            {
                Symbol = symbol, Name = name,
                Price = Math.Round(price, 2), ChangePercent = 0, // no prev close in this endpoint
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AlphaVantage forex rate fetch failed for {From}", fromCurrency);
            return null;
        }
    }

    /// <summary>Returns sector performance for the US market (1-day change).</summary>
    public async Task<List<SectorPerformanceDto>> GetSectorPerformanceAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("AlphaVantage ApiKey not configured; returning empty sector data.");
            return new List<SectorPerformanceDto>();
        }

        try
        {
            var url = $"query?function=SECTOR&apikey={_options.ApiKey}";
            var raw = await _http.GetFromJsonAsync<JsonElement>(url, ct);

            var results = new List<SectorPerformanceDto>();
            if (raw.TryGetProperty("Rank A: Real-Time Performance", out var realtimeEl))
            {
                foreach (var prop in realtimeEl.EnumerateObject())
                {
                    if (prop.Name == "Meta Data") continue;
                    var valStr = prop.Value.GetString()?.TrimEnd('%');
                    if (double.TryParse(valStr, System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var change))
                    {
                        results.Add(new SectorPerformanceDto { Sector = prop.Name, Change = change });
                    }
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AlphaVantage SECTOR request failed");
            return new List<SectorPerformanceDto>();
        }
    }
}

public class SectorPerformanceDto
{
    public string Sector { get; set; } = string.Empty;
    public double Change { get; set; }
}

public class CommodityPriceResultDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double ChangePercent { get; set; }
}
