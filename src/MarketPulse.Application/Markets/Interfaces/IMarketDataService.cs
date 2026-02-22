using MarketPulse.Application.Markets.DTOs;

namespace MarketPulse.Application.Markets.Interfaces;

public interface IMarketDataService
{
    Task<IReadOnlyList<StockDto>> GetStocksAsync(string countryCode, CancellationToken cancellationToken = default);
    Task<int> SyncStocksFromApiAsync(string countryCode, CancellationToken cancellationToken = default);
    Task<StockQuoteDto?> GetQuoteAsync(string ticker, string countryCode, CancellationToken cancellationToken = default);
}
