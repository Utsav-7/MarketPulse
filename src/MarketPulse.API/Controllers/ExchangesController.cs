using MarketPulse.Application.Exchanges.DTOs;
using MarketPulse.Application.Exchanges.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/exchanges")]
[Authorize]
public class ExchangesController : ControllerBase
{
    private readonly IExchangeService _exchangeService;

    public ExchangesController(IExchangeService exchangeService)
    {
        _exchangeService = exchangeService;
    }

    [HttpGet("countries")]
    [ProducesResponseType(typeof(IReadOnlyList<CountryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCountries(CancellationToken cancellationToken)
    {
        var countries = await _exchangeService.GetCountriesAsync(cancellationToken);
        return Ok(countries);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ExchangeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCountry([FromQuery] string? country, CancellationToken cancellationToken)
    {
        var exchanges = await _exchangeService.GetExchangesByCountryAsync(country, cancellationToken);
        return Ok(exchanges);
    }
}
