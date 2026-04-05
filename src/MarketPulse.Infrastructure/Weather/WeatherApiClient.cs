using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MarketPulse.Infrastructure.Weather;

public class WeatherApiClient
{
    private readonly HttpClient _http;
    private readonly WeatherOptions _options;
    private readonly ILogger<WeatherApiClient> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public WeatherApiClient(HttpClient http, IOptions<WeatherOptions> options, ILogger<WeatherApiClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri("https://api.openweathermap.org/data/2.5/");
    }

    public async Task<WeatherResult?> GetCurrentAsync(string city, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("OpenWeatherMap ApiKey not configured.");
            return null;
        }

        try
        {
            var url = $"weather?q={Uri.EscapeDataString(city)}&appid={_options.ApiKey}&units=metric";
            var raw = await _http.GetFromJsonAsync<OWMCurrentResponse>(url, JsonOpts, ct);
            if (raw is null) return null;

            return new WeatherResult
            {
                City = raw.Name ?? city,
                Country = raw.Sys?.Country ?? string.Empty,
                TempC = Math.Round(raw.Main?.Temp ?? 0, 1),
                FeelsLikeC = Math.Round(raw.Main?.FeelsLike ?? 0, 1),
                Humidity = raw.Main?.Humidity ?? 0,
                WindKmh = Math.Round((raw.Wind?.Speed ?? 0) * 3.6, 1),
                Condition = raw.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                Icon = raw.Weather?.FirstOrDefault()?.Icon ?? string.Empty,
                HighC = Math.Round(raw.Main?.TempMax ?? 0, 1),
                LowC = Math.Round(raw.Main?.TempMin ?? 0, 1),
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch weather for {City}", city);
            return null;
        }
    }

    // ── Raw OWM shapes ──────────────────────────────────────────────────────────
    private sealed class OWMCurrentResponse
    {
        public string? Name { get; set; }
        public OWMMain? Main { get; set; }
        public OWMWind? Wind { get; set; }
        public OWMSys? Sys { get; set; }
        public List<OWMWeather>? Weather { get; set; }
    }
    private sealed class OWMMain
    {
        public double Temp { get; set; }
        public double FeelsLike { get; set; }
        public double TempMin { get; set; }
        public double TempMax { get; set; }
        public int Humidity { get; set; }
    }
    private sealed class OWMWind { public double Speed { get; set; } }
    private sealed class OWMSys { public string? Country { get; set; } }
    private sealed class OWMWeather { public string? Description { get; set; } public string? Icon { get; set; } }
}

public class WeatherResult
{
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double TempC { get; set; }
    public double FeelsLikeC { get; set; }
    public int Humidity { get; set; }
    public double WindKmh { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public double HighC { get; set; }
    public double LowC { get; set; }
}
