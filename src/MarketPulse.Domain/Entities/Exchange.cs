namespace MarketPulse.Domain.Entities;

public class Exchange
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Mic { get; set; }
    public string? Timezone { get; set; }
    public string? PreMarket { get; set; }
    public string? Hour { get; set; }
    public string? PostMarket { get; set; }
    public string? CloseDate { get; set; }
    public string? Country { get; set; }
    public string? CountryName { get; set; }
    public string? Reference { get; set; }
}
