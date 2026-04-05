using MarketPulse.Application.Authentication.Interfaces;
using MarketPulse.Application.Authentication.Options;
using MarketPulse.Application.Common.Interfaces;
using MarketPulse.Application.Exchanges.Interfaces;
using MarketPulse.Infrastructure.Exchanges;
using MarketPulse.Application.Markets.Interfaces;
using MarketPulse.Application.Users.Interfaces;
using MarketPulse.Infrastructure.Authentication;
using MarketPulse.Infrastructure.MarketData;
using MarketPulse.Infrastructure.News;
using MarketPulse.Infrastructure.Persistence;
using MarketPulse.Infrastructure.Persistence.Repositories;
using MarketPulse.Infrastructure.Sectors;
using MarketPulse.Infrastructure.Users;
using MarketPulse.Infrastructure.Weather;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MarketPulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<FinnhubOptions>(configuration.GetSection(FinnhubOptions.SectionName));
        services.Configure<WeatherOptions>(configuration.GetSection(WeatherOptions.SectionName));
        services.Configure<NewsOptions>(configuration.GetSection(NewsOptions.SectionName));
        services.Configure<AlphaVantageOptions>(configuration.GetSection(AlphaVantageOptions.SectionName));
        services.Configure<EiaOptions>(configuration.GetSection(EiaOptions.SectionName));

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddMemoryCache();

        services.AddHttpClient<FinnhubApiClient>();
        services.AddHttpClient<WeatherApiClient>();
        services.AddHttpClient<NewsApiClient>();
        services.AddHttpClient<AlphaVantageClient>();
        services.AddHttpClient<YahooFinanceClient>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                UseCookies = true,
                CookieContainer = new System.Net.CookieContainer(),
                AllowAutoRedirect = true,
            });
        services.AddHttpClient<CoinGeckoClient>();
        services.AddHttpClient<EiaClient>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserCreationService, UserCreationService>();
        services.AddScoped<IStockRepository, StockRepository>();
        services.AddScoped<IExchangeRepository, ExchangeRepository>();
        services.AddScoped<IExchangeService, ExchangeService>();
        services.AddScoped<IMarketDataService, MarketDataService>();

        return services;
    }
}
