using MarketPulse.Domain.Entities;

namespace MarketPulse.Application.Markets.Interfaces;

public interface IStockRepository
{
    Task<IReadOnlyList<Stock>> GetByCountryAsync(string countryCode, CancellationToken cancellationToken = default);
    Task<Stock?> GetByTickerAsync(string ticker, string countryCode, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string ticker, string countryCode, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<Stock> stocks, CancellationToken cancellationToken = default);
}
