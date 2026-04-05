using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarketPulse.Infrastructure.MarketData;

/// <summary>
/// US Energy Information Administration (EIA) API — free, no rate limit.
/// Returns WTI crude, Brent crude, and Henry Hub natural gas spot prices.
/// </summary>
public class EiaClient
{
    private readonly HttpClient _http;
    private readonly EiaOptions _options;
    private readonly ILogger<EiaClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public EiaClient(HttpClient http, IOptions<EiaOptions> options, ILogger<EiaClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri("https://api.eia.gov/v2/");
    }

    public async Task<List<CommodityPriceDto>> GetCommodityPricesAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("EIA ApiKey not configured.");
            return new List<CommodityPriceDto>();
        }

        var results = new List<CommodityPriceDto>();

        // WTI Crude Oil
        var wti = await FetchLatestAsync("petroleum/pri/spt/data/",
            "EER_EWTI_PF4_Y35NY_DPD", "WTI Crude", "OIL", ct);
        if (wti != null) results.Add(wti);

        // Brent Crude
        var brent = await FetchLatestAsync("petroleum/pri/spt/data/",
            "EER_EPBRENT_PF4_Y35NY_DPD", "Brent Crude", "BRENT", ct);
        if (brent != null) results.Add(brent);

        // Henry Hub Natural Gas
        var gas = await FetchLatestAsync("natural-gas/pri/sum/data/",
            "N9190US3", "Natural Gas", "NATGAS", ct);
        if (gas != null) results.Add(gas);

        return results;
    }

    private async Task<CommodityPriceDto?> FetchLatestAsync(
        string path, string seriesId, string name, string symbol, CancellationToken ct)
    {
        try
        {
            var url = $"{path}?api_key={_options.ApiKey}&frequency=daily&data[0]=value&facets[series][]={seriesId}&sort[0][column]=period&sort[0][direction]=desc&length=2";
            var raw = await _http.GetFromJsonAsync<JsonElement>(url, JsonOpts, ct);

            if (!raw.TryGetProperty("response", out var resp) ||
                !resp.TryGetProperty("data", out var data)) return null;

            var arr = data.EnumerateArray().ToList();
            if (arr.Count == 0) return null;

            var latest = arr[0];
            var prev   = arr.Count > 1 ? arr[1] : arr[0];

            if (!latest.TryGetProperty("value", out var valEl)) return null;
            var price = valEl.ValueKind == JsonValueKind.Number ? valEl.GetDouble() :
                        double.TryParse(valEl.GetString(), out var d) ? d : 0;
            var prevPrice = prev.TryGetProperty("value", out var prevEl) &&
                            prevEl.ValueKind == JsonValueKind.Number ? prevEl.GetDouble() : price;

            var change = prevPrice != 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;

            return new CommodityPriceDto
            {
                Symbol = symbol,
                Name = name,
                Price = Math.Round(price, 2),
                ChangePercent = Math.Round(change, 2),
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "EIA fetch failed for series {SeriesId}", seriesId);
            return null;
        }
    }
}

public class CommodityPriceDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double ChangePercent { get; set; }
}

public class EiaOptions
{
    public const string SectionName = "Eia";
    public string ApiKey { get; set; } = string.Empty;
}
