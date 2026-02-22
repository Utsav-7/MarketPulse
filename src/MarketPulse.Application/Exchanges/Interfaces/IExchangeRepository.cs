using MarketPulse.Domain.Entities;

namespace MarketPulse.Application.Exchanges.Interfaces;

public interface IExchangeRepository
{
    Task<IReadOnlyList<Exchange>> GetByCountryAsync(string countryCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Exchange>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(string Code, string Name)>> GetDistinctCountriesAsync(CancellationToken cancellationToken = default);
}
