using MarketPulse.Application.Markets.Interfaces;
using MarketPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MarketPulse.Infrastructure.Persistence.Repositories;

public class StockRepository : IStockRepository
{
    private readonly ApplicationDbContext _context;

    public StockRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Stock>> GetByCountryAsync(string countryCode, CancellationToken cancellationToken = default)
    {
        return await _context.Stocks
            .AsNoTracking()
            .Where(s => s.CountryCode == countryCode)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Stock?> GetByTickerAsync(string ticker, string countryCode, CancellationToken cancellationToken = default)
    {
        return await _context.Stocks
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Ticker == ticker && s.CountryCode == countryCode, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string ticker, string countryCode, CancellationToken cancellationToken = default)
    {
        return await _context.Stocks
            .AnyAsync(s => s.Ticker == ticker && s.CountryCode == countryCode, cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<Stock> stocks, CancellationToken cancellationToken = default)
    {
        await _context.Stocks.AddRangeAsync(stocks, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
