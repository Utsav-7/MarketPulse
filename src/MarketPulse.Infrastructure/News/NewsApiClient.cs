using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarketPulse.Infrastructure.News;

public class NewsApiClient
{
    private readonly HttpClient _http;
    private readonly NewsOptions _options;
    private readonly ILogger<NewsApiClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public NewsApiClient(HttpClient http, IOptions<NewsOptions> options, ILogger<NewsApiClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri("https://newsapi.org/v2/");
    }

    /// <summary>
    /// Fetch top headlines by keyword query using /top-headlines?q= (free-tier compatible).
    /// Falls back to empty list on error.
    /// </summary>
    public async Task<List<NewsArticleDto>> GetByQueryAsync(string query, int pageSize = 8, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("NewsAPI ApiKey not configured.");
            return new List<NewsArticleDto>();
        }

        try
        {
            // /top-headlines?q= works on free tier; /everything requires paid plan
            var url = $"top-headlines?q={Uri.EscapeDataString(query)}&language=en&pageSize={pageSize}&apiKey={_options.ApiKey}";
            var raw = await _http.GetFromJsonAsync<NewsApiResponse>(url, JsonOpts, ct);
            if (raw?.Status != "ok")
                _logger.LogWarning("NewsAPI query '{Query}' returned status '{Status}': {Message}", query, raw?.Status, raw?.Message);
            return Map(raw?.Articles);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "NewsAPI query '{Query}' failed", query);
            return new List<NewsArticleDto>();
        }
    }

    /// <summary>Fetch top headlines by category (business, technology, etc.).</summary>
    public async Task<List<NewsArticleDto>> GetByCategory(string category, int pageSize = 8, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            return new List<NewsArticleDto>();

        try
        {
            var url = $"top-headlines?category={Uri.EscapeDataString(category)}&language=en&pageSize={pageSize}&apiKey={_options.ApiKey}";
            var raw = await _http.GetFromJsonAsync<NewsApiResponse>(url, JsonOpts, ct);
            if (raw?.Status != "ok")
                _logger.LogWarning("NewsAPI category '{Category}' returned status '{Status}': {Message}", category, raw?.Status, raw?.Message);
            return Map(raw?.Articles);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "NewsAPI category '{Category}' failed", category);
            return new List<NewsArticleDto>();
        }
    }

    private static List<NewsArticleDto> Map(List<NewsApiArticle>? articles)
    {
        if (articles is null) return new List<NewsArticleDto>();
        return articles
            .Where(a => a.Title != null && a.Title != "[Removed]")
            .Select(a => new NewsArticleDto
            {
                Source = a.Source?.Name ?? "NewsAPI",
                Headline = a.Title ?? string.Empty,
                Url = a.Url ?? string.Empty,
                PublishedAt = a.PublishedAt,
            })
            .ToList();
    }

    private sealed class NewsApiResponse
    {
        public string? Status { get; set; }
        public string? Message { get; set; }
        public List<NewsApiArticle>? Articles { get; set; }
    }
    private sealed class NewsApiArticle
    {
        public NewsApiSource? Source { get; set; }
        public string? Title { get; set; }
        public string? Url { get; set; }
        public DateTime PublishedAt { get; set; }
    }
    private sealed class NewsApiSource { public string? Name { get; set; } }
}

public class NewsArticleDto
{
    public string Source { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
}
