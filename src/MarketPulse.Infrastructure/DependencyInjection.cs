using MarketPulse.Application.Authentication.Interfaces;
using MarketPulse.Application.Authentication.Options;
using MarketPulse.Application.Common.Interfaces;
using MarketPulse.Application.Exchanges.Interfaces;
using MarketPulse.Infrastructure.Exchanges;
using MarketPulse.Application.Markets.Interfaces;
using MarketPulse.Application.Users.Interfaces;
using MarketPulse.Infrastructure.Authentication;
using MarketPulse.Infrastructure.MarketData;
using MarketPulse.Infrastructure.Persistence;
using MarketPulse.Infrastructure.Persistence.Repositories;
using MarketPulse.Infrastructure.Users;
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

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddHttpClient<FinnhubApiClient>();

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
