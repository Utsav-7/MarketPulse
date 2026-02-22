using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarketPulse.Infrastructure.MarketData;

public class FinnhubApiClient
{
    private readonly HttpClient _http;
    private readonly FinnhubOptions _options;
    private readonly ILogger<FinnhubApiClient> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public FinnhubApiClient(HttpClient http, IOptions<FinnhubOptions> options, ILogger<FinnhubApiClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
    }

    public async Task<IReadOnlyList<FinnhubSymbol>> GetSymbolsAsync(string exchange, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Finnhub ApiKey not configured; returning empty symbol list.");
            return Array.Empty<FinnhubSymbol>();
        }

        try
        {
            var url = $"stock/symbol?exchange={Uri.EscapeDataString(exchange)}&token={_options.ApiKey}";
            var list = await _http.GetFromJsonAsync<List<FinnhubSymbol>>(url, JsonOptions, cancellationToken);
            return list ?? new List<FinnhubSymbol>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch symbols for exchange {Exchange}", exchange);
            return Array.Empty<FinnhubSymbol>();
        }
    }

    public async Task<FinnhubQuote?> GetQuoteAsync(string symbol, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            return null;

        try
        {
            var url = $"quote?symbol={Uri.EscapeDataString(symbol)}&token={_options.ApiKey}";
            var quote = await _http.GetFromJsonAsync<FinnhubQuote>(url, JsonOptions, cancellationToken);
            return quote;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch quote for symbol {Symbol}", symbol);
            return null;
        }
    }
}

public class FinnhubSymbol
{
    public string? Description { get; set; }
    public string? DisplaySymbol { get; set; }
    public string? Symbol { get; set; }
    public string? Type { get; set; }
}

public class FinnhubQuote
{
    public decimal C { get; set; }
    public decimal? D { get; set; }
    public decimal? Dp { get; set; }
    public decimal? H { get; set; }
    public decimal? L { get; set; }
    public decimal? O { get; set; }
    public decimal? Pc { get; set; }
}
