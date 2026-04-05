using MarketPulse.Infrastructure.Weather;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WeatherController : ControllerBase
{
    private readonly WeatherApiClient _client;
    private readonly IMemoryCache _cache;

    public WeatherController(WeatherApiClient client, IMemoryCache cache)
    {
        _client = client;
        _cache = cache;
    }

    /// <summary>Current weather for a city. Cached 10 minutes per city.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(WeatherResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get([FromQuery] string city, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(city))
            return BadRequest(new { message = "city query parameter is required." });

        var key = $"weather:{city.ToLowerInvariant().Trim()}";
        if (_cache.TryGetValue(key, out WeatherResult? cached) && cached is not null)
            return Ok(cached);

        var result = await _client.GetCurrentAsync(city, ct);
        if (result is null)
            return NotFound(new { message = $"Weather data not found for '{city}'." });

        _cache.Set(key, result, TimeSpan.FromMinutes(10));
        return Ok(result);
    }
}
