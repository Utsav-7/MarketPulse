using MarketPulse.Infrastructure.MarketData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IndexesController : ControllerBase
{
    private readonly YahooFinanceClient _yahoo;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "indexes:quotes";

    public IndexesController(YahooFinanceClient yahoo, IMemoryCache cache)
    {
        _yahoo = yahoo;
        _cache = cache;
    }

    /// <summary>Global stock index quotes from Yahoo Finance. Cached 1 minute.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<IndexQuoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        if (_cache.TryGetValue(CacheKey, out List<IndexQuoteDto>? cached) && cached is not null)
            return Ok(cached);

        var data = await _yahoo.GetIndexQuotesAsync(ct);
        _cache.Set(CacheKey, data, TimeSpan.FromMinutes(1));
        return Ok(data);
    }
}
