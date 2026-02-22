using MarketPulse.Application.Exchanges.Interfaces;
using MarketPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MarketPulse.Infrastructure.Persistence.Repositories;

public class ExchangeRepository : IExchangeRepository
{
    private readonly ApplicationDbContext _context;

    public ExchangeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Exchange>> GetByCountryAsync(string countryCode, CancellationToken cancellationToken = default)
    {
        return await _context.Exchanges
            .AsNoTracking()
            .Where(e => e.Country == countryCode)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Exchange>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Exchanges
            .AsNoTracking()
            .OrderBy(e => e.CountryName)
            .ThenBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(string Code, string Name)>> GetDistinctCountriesAsync(CancellationToken cancellationToken = default)
    {
        var pairs = await _context.Exchanges
            .AsNoTracking()
            .Where(e => e.Country != null && e.CountryName != null)
            .Select(e => new { Country = e.Country!, CountryName = e.CountryName! })
            .ToListAsync(cancellationToken);
        return pairs
            .DistinctBy(p => p.Country)
            .OrderBy(p => p.CountryName)
            .Select(p => (p.Country, p.CountryName))
            .ToList();
    }
}
