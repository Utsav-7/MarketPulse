using MarketPulse.Infrastructure.MarketData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CryptoController : ControllerBase
{
    private readonly YahooFinanceClient _yahoo;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "crypto:prices";

    public CryptoController(YahooFinanceClient yahoo, IMemoryCache cache)
    {
        _yahoo = yahoo;
        _cache = cache;
    }

    /// <summary>
    /// Crypto prices from Yahoo Finance (no key, no rate limit).
    /// BTC, ETH, SOL, BNB, XRP, DOGE — cached 30 seconds.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CryptoPriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        if (_cache.TryGetValue(CacheKey, out List<CryptoPriceDto>? cached) && cached is not null)
            return Ok(cached);

        var data = await _yahoo.GetCryptoPricesAsync(ct);

        var result = data.Select(r => new CryptoPriceDto
        {
            Symbol        = r.Symbol,
            Name          = r.Name,
            Price         = r.Price,
            ChangePercent = r.ChangePercent,
            MarketCap     = r.MarketCap,
        }).ToList();

        _cache.Set(CacheKey, result, TimeSpan.FromSeconds(30));
        return Ok(result);
    }
}
