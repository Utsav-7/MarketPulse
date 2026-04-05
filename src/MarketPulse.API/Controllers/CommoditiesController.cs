using MarketPulse.Infrastructure.MarketData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommoditiesController : ControllerBase
{
    private readonly YahooFinanceClient _yahoo;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "commodities:prices";

    public CommoditiesController(YahooFinanceClient yahoo, IMemoryCache cache)
    {
        _yahoo = yahoo;
        _cache = cache;
    }

    /// <summary>
    /// Commodity futures prices from Yahoo Finance (no key, no rate limit).
    /// Gold (GC=F), Silver (SI=F), WTI (CL=F), Brent (BZ=F), Natural Gas (NG=F), Copper (HG=F).
    /// Cached 5 minutes.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CommodityPriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        if (_cache.TryGetValue(CacheKey, out List<CommodityPriceDto>? cached) && cached is not null)
            return Ok(cached);

        var data = await _yahoo.GetCommodityPricesAsync(ct);

        var result = data.Select(r => new CommodityPriceDto
        {
            Symbol = r.Symbol,
            Name = r.Name,
            Price = r.Price,
            ChangePercent = r.ChangePercent,
        }).ToList();

        _cache.Set(CacheKey, result, TimeSpan.FromMinutes(5));
        return Ok(result);
    }
}
