namespace MarketPulse.Infrastructure.Weather;

public class WeatherOptions
{
    public const string SectionName = "Weather";
    public string ApiKey { get; set; } = string.Empty;
}
