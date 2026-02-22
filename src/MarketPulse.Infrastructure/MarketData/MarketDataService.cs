using MarketPulse.Application.Markets.DTOs;
using MarketPulse.Application.Markets.Interfaces;
using MarketPulse.Domain.Entities;

namespace MarketPulse.Infrastructure.MarketData;

public class MarketDataService : IMarketDataService
{
    private const string IndiaCountryCode = "IN";
    private const string NseExchange = "NSE";

    private readonly IStockRepository _stockRepository;
    private readonly FinnhubApiClient _finnhub;

    public MarketDataService(IStockRepository stockRepository, FinnhubApiClient finnhub)
    {
        _stockRepository = stockRepository;
        _finnhub = finnhub;
    }

    public async Task<IReadOnlyList<StockDto>> GetStocksAsync(string countryCode, CancellationToken cancellationToken = default)
    {
        var stocks = await _stockRepository.GetByCountryAsync(countryCode, cancellationToken);
        return stocks.Select(s => new StockDto(s.Id, s.Ticker, s.Name, s.Exchange, s.CountryCode)).ToList();
    }

    public async Task<int> SyncStocksFromApiAsync(string countryCode, CancellationToken cancellationToken = default)
    {
        if (countryCode != IndiaCountryCode)
            return 0;

        var toAdd = new List<Stock>();

        var apiSymbols = await _finnhub.GetSymbolsAsync(NseExchange, cancellationToken);
        if (apiSymbols.Count > 0)
        {
            foreach (var sym in apiSymbols)
            {
                var ticker = NormalizeTicker(sym.Symbol, sym.DisplaySymbol);
                if (string.IsNullOrEmpty(ticker)) continue;
                var exists = await _stockRepository.ExistsAsync(ticker, countryCode, cancellationToken);
                if (!exists)
                    toAdd.Add(CreateStock(ticker, sym.Description ?? ticker, NseExchange, countryCode));
            }
        }

        if (toAdd.Count == 0 && (apiSymbols.Count == 0 || toAdd.Count == 0))
        {
            foreach (var (ticker, name) in IndianStockSeed.NseStocks)
            {
                var exists = await _stockRepository.ExistsAsync(ticker, countryCode, cancellationToken);
                if (!exists)
                    toAdd.Add(CreateStock(ticker, name, NseExchange, countryCode));
            }
        }

        if (toAdd.Count > 0)
            await _stockRepository.AddRangeAsync(toAdd, cancellationToken);

        return toAdd.Count;
    }

    public async Task<StockQuoteDto?> GetQuoteAsync(string ticker, string countryCode, CancellationToken cancellationToken = default)
    {
        if (countryCode != IndiaCountryCode)
            return null;

        var symbolForApi = ticker.Contains('.') ? ticker : $"{ticker}.NS";
        var quote = await _finnhub.GetQuoteAsync(symbolForApi, cancellationToken);
        if (quote == null) return null;

        var change = quote.Pc.HasValue ? quote.C - quote.Pc.Value : quote.D;
        var changePct = quote.Pc.HasValue && quote.Pc.Value != 0
            ? (change / quote.Pc.Value) * 100
            : quote.Dp;

        return new StockQuoteDto(
            ticker,
            quote.C,
            quote.O,
            quote.H,
            quote.L,
            quote.Pc,
            change,
            changePct);
    }

    private static string? NormalizeTicker(string? symbol, string? displaySymbol)
    {
        if (!string.IsNullOrWhiteSpace(displaySymbol)) return displaySymbol.Trim();
        if (string.IsNullOrWhiteSpace(symbol)) return null;
        var s = symbol.Trim();
        var dot = s.IndexOf('.');
        return dot > 0 ? s[..dot] : s;
    }

    private static Stock CreateStock(string ticker, string name, string exchange, string countryCode)
    {
        return new Stock
        {
            Id = Guid.NewGuid(),
            Ticker = ticker,
            Name = name,
            Exchange = exchange,
            CountryCode = countryCode,
            CreatedAtUtc = DateTime.UtcNow
        };
    }
}
