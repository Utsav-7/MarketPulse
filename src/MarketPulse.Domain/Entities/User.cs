namespace MarketPulse.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string LoginCode { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public bool IsSystemUser { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
