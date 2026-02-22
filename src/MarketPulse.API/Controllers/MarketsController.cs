using MarketPulse.Application.Markets.DTOs;
using MarketPulse.Application.Markets.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/markets")]
[Authorize]
public class MarketsController : ControllerBase
{
    private const string IndiaCountryCode = "IN";

    private readonly IMarketDataService _marketDataService;

    public MarketsController(IMarketDataService marketDataService)
    {
        _marketDataService = marketDataService;
    }

    [HttpGet("india/stocks")]
    [ProducesResponseType(typeof(IReadOnlyList<StockDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIndiaStocks(CancellationToken cancellationToken)
    {
        var stocks = await _marketDataService.GetStocksAsync(IndiaCountryCode, cancellationToken);
        return Ok(stocks);
    }

    [HttpPost("india/sync")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncIndiaStocks(CancellationToken cancellationToken)
    {
        var added = await _marketDataService.SyncStocksFromApiAsync(IndiaCountryCode, cancellationToken);
        return Ok(new { message = $"Synced. {added} new stock(s) added.", added });
    }

    [HttpGet("india/quote")]
    [ProducesResponseType(typeof(StockQuoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIndiaQuote([FromQuery] string ticker, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(ticker))
            return BadRequest(new { message = "Ticker is required." });

        var quote = await _marketDataService.GetQuoteAsync(ticker.Trim(), IndiaCountryCode, cancellationToken);
        if (quote == null)
            return NotFound(new { message = "Quote not found for the given ticker." });

        return Ok(quote);
    }
}
