using MarketPulse.Infrastructure.News;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NewsController : ControllerBase
{
    private readonly NewsApiClient _newsApi;
    private readonly IMemoryCache _cache;

    // Maps card name → (source, query/category, isCategory)
    private static readonly Dictionary<string, (string Query, bool IsCategory)> CardMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["war"]        = ("war military conflict geopolitics", false),
        ["climate"]    = ("climate change environment carbon", false),
        ["finance"]    = ("finance stock market investment banking", false),
        ["ai-ml"]      = ("artificial intelligence machine learning LLM", false),
        ["government"] = ("government policy legislation regulation", false),
        ["energy"]     = ("energy oil gas OPEC renewable", false),
        ["technology"] = ("technology", true),
        ["live-news"]  = ("world", true),
    };

    public NewsController(NewsApiClient newsApi, IMemoryCache cache)
    {
        _newsApi = newsApi;
        _cache = cache;
    }

    /// <summary>
    /// Get news articles for a given card.
    /// <br/>Valid card values: war, climate, finance, ai-ml, government, energy, technology, live-news.
    /// Cached 15 minutes per card.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<NewsArticleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] string card, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(card))
            return BadRequest(new { message = "card query parameter is required." });

        if (!CardMap.TryGetValue(card, out var def))
            return BadRequest(new { message = $"Unknown card '{card}'. Valid: {string.Join(", ", CardMap.Keys)}." });

        var cacheKey = $"news:{card}";
        if (_cache.TryGetValue(cacheKey, out List<NewsArticleDto>? cached) && cached is not null)
            return Ok(cached);

        var articles = def.IsCategory
            ? await _newsApi.GetByCategory(def.Query, 8, ct)
            : await _newsApi.GetByQueryAsync(def.Query, 8, ct);

        _cache.Set(cacheKey, articles, TimeSpan.FromMinutes(15));
        return Ok(articles);
    }
}
