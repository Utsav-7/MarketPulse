namespace MarketPulse.Infrastructure.MarketData;

public class FinnhubOptions
{
    public const string SectionName = "Finnhub";
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://finnhub.io/api/v1";
    /// <summary>Secret for validating webhook requests (X-Finnhub-Secret header).</summary>
    public string WebhookSecret { get; set; } = string.Empty;
}
