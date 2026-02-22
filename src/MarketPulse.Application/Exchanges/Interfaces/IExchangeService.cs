using MarketPulse.Application.Exchanges.DTOs;

namespace MarketPulse.Application.Exchanges.Interfaces;

public interface IExchangeService
{
    Task<IReadOnlyList<CountryDto>> GetCountriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ExchangeDto>> GetExchangesByCountryAsync(string? countryCode, CancellationToken cancellationToken = default);
}
