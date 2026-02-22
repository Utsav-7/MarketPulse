namespace MarketPulse.Application.Markets.DTOs;

public record StockDto(Guid Id, string Ticker, string Name, string Exchange, string CountryCode);
