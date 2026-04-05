using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace MarketPulse.Infrastructure.MarketData;

/// <summary>
/// CoinGecko public API — no key needed for basic endpoints.
/// Free tier: ~30 calls/min.
/// </summary>
public class CoinGeckoClient
{
    private readonly HttpClient _http;
    private readonly ILogger<CoinGeckoClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    // Coins to track: CoinGecko ID → (symbol, display name)
    private static readonly (string Id, string Symbol, string Name)[] Coins =
    [
        ("bitcoin",   "BTC",  "Bitcoin"),
        ("ethereum",  "ETH",  "Ethereum"),
        ("solana",    "SOL",  "Solana"),
        ("binancecoin","BNB", "BNB"),
        ("ripple",    "XRP",  "XRP"),
        ("dogecoin",  "DOGE", "Dogecoin"),
    ];

    public CoinGeckoClient(HttpClient http, ILogger<CoinGeckoClient> logger)
    {
        _http = http;
        _logger = logger;
        _http.BaseAddress = new Uri("https://api.coingecko.com/api/v3/");
        _http.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<List<CryptoPriceDto>> GetPricesAsync(CancellationToken ct = default)
    {
        var ids = string.Join(",", Coins.Select(c => c.Id));
        var results = new List<CryptoPriceDto>();

        try
        {
            var url = $"coins/markets?vs_currency=usd&ids={ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h";
            var raw = await _http.GetFromJsonAsync<List<JsonElement>>(url, JsonOpts, ct);
            if (raw is null) return results;

            foreach (var item in raw)
            {
                var id = item.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? "" : "";
                var meta = Coins.FirstOrDefault(c => c.Id == id);
                var price = item.TryGetProperty("current_price", out var p) ? p.GetDouble() : 0;
                var change = item.TryGetProperty("price_change_percentage_24h", out var ch) ? ch.GetDouble() : 0;
                var cap = item.TryGetProperty("market_cap", out var mc) ? mc.GetDouble() : 0;

                results.Add(new CryptoPriceDto
                {
                    Symbol = meta.Symbol ?? id.ToUpperInvariant(),
                    Name = meta.Name ?? id,
                    Price = Math.Round(price, price >= 1 ? 2 : 6),
                    ChangePercent = Math.Round(change, 2),
                    MarketCap = cap,
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CoinGecko price fetch failed");
        }

        return results;
    }
}

public class CryptoPriceDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public double ChangePercent { get; set; }
    public double MarketCap { get; set; }
}
