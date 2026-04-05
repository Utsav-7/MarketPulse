using MarketPulse.Infrastructure.Sectors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectorsController : ControllerBase
{
    private readonly AlphaVantageClient _client;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "sectors:performance";

    public SectorsController(AlphaVantageClient client, IMemoryCache cache)
    {
        _client = client;
        _cache = cache;
    }

    /// <summary>US sector performance (Alpha Vantage SECTOR). Cached 5 minutes.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SectorPerformanceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        if (_cache.TryGetValue(CacheKey, out List<SectorPerformanceDto>? cached) && cached is not null)
            return Ok(cached);

        var data = await _client.GetSectorPerformanceAsync(ct);
        _cache.Set(CacheKey, data, TimeSpan.FromMinutes(5));
        return Ok(data);
    }
}
