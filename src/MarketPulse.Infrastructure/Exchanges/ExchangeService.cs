using MarketPulse.Application.Exchanges.DTOs;
using MarketPulse.Application.Exchanges.Interfaces;
using MarketPulse.Domain.Entities;

namespace MarketPulse.Infrastructure.Exchanges;

public class ExchangeService : IExchangeService
{
    private readonly IExchangeRepository _repository;

    public ExchangeService(IExchangeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CountryDto>> GetCountriesAsync(CancellationToken cancellationToken = default)
    {
        var countries = await _repository.GetDistinctCountriesAsync(cancellationToken);
        return countries.Select(c => new CountryDto(c.Code, c.Name)).ToList();
    }

    public async Task<IReadOnlyList<ExchangeDto>> GetExchangesByCountryAsync(string? countryCode, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Exchange> exchanges = string.IsNullOrWhiteSpace(countryCode)
            ? await _repository.GetAllAsync(cancellationToken)
            : await _repository.GetByCountryAsync(countryCode!.Trim(), cancellationToken);

        return exchanges.Select(Map).ToList();
    }

    private static ExchangeDto Map(Exchange e) => new(
        e.Id,
        e.Code,
        e.Name,
        e.Mic,
        e.Timezone,
        e.PreMarket,
        e.Hour,
        e.PostMarket,
        e.CloseDate,
        e.Country,
        e.CountryName,
        e.Reference);
}
