using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MarketPulse.Infrastructure.MarketData;

namespace MarketPulse.API.Controllers;

/// <summary>
/// Receives webhooks from Finnhub. Validates X-Finnhub-Secret and returns 2xx immediately
/// to acknowledge receipt before any processing (per Finnhub requirements).
/// </summary>
[ApiController]
[Route("api/webhooks/finnhub")]
public class FinnhubWebhookController : ControllerBase
{
    public const string FinnhubSecretHeaderName = "X-Finnhub-Secret";

    private readonly FinnhubOptions _options;
    private readonly ILogger<FinnhubWebhookController> _logger;

    public FinnhubWebhookController(
        IOptions<FinnhubOptions> options,
        ILogger<FinnhubWebhookController> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Accepts Finnhub webhook events. Validates X-Finnhub-Secret and returns 200 immediately.
    /// Any processing runs after the response is sent to avoid timeouts.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        if (!Request.Headers.TryGetValue(FinnhubSecretHeaderName, out var receivedSecret) ||
            string.IsNullOrEmpty(receivedSecret))
        {
            _logger.LogWarning("Finnhub webhook rejected: missing or empty X-Finnhub-Secret header.");
            return Unauthorized();
        }

        var configuredSecret = _options.WebhookSecret ?? string.Empty;
        if (configuredSecret.Length == 0)
        {
            _logger.LogWarning("Finnhub webhook rejected: WebhookSecret not configured.");
            return Unauthorized();
        }

        var receivedBytes = Encoding.UTF8.GetBytes(receivedSecret!);
        var configuredBytes = Encoding.UTF8.GetBytes(configuredSecret);
        if (receivedBytes.Length != configuredBytes.Length || !CryptographicOperations.FixedTimeEquals(receivedBytes, configuredBytes))
        {
            _logger.LogWarning("Finnhub webhook rejected: X-Finnhub-Secret does not match.");
            return Unauthorized();
        }

        // Read body before responding so we can process after acknowledge (optional)
        string? body = null;
        try
        {
            using var reader = new StreamReader(Request.Body);
            body = await reader.ReadToEndAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read Finnhub webhook body.");
        }

        // Acknowledge immediately with 2xx (required by Finnhub; do this before heavy logic).
        var bodyForBackground = body;
        _ = Task.Run(() => ProcessWebhookAsync(bodyForBackground), CancellationToken.None);

        return Ok();
    }

    private async Task ProcessWebhookAsync(string? payload)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                _logger.LogDebug("Finnhub webhook received with empty body.");
                return;
            }
            _logger.LogInformation("Finnhub webhook event received. Payload length: {Length}. Process as needed (e.g. update cache, notify).", payload.Length);
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Finnhub webhook in background.");
        }
    }
}
