namespace MarketPulse.Application.Markets.DTOs;

public record StockQuoteDto(
    string Ticker,
    decimal CurrentPrice,
    decimal? Open,
    decimal? High,
    decimal? Low,
    decimal? PreviousClose,
    decimal? Change,
    decimal? ChangePercent);
