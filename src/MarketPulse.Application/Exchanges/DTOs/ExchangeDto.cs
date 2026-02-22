namespace MarketPulse.Application.Exchanges.DTOs;

public record ExchangeDto(
    Guid Id,
    string Code,
    string Name,
    string? Mic,
    string? Timezone,
    string? PreMarket,
    string? Hour,
    string? PostMarket,
    string? CloseDate,
    string? Country,
    string? CountryName,
    string? Reference);
