using MarketPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MarketPulse.Infrastructure.Persistence;

public class DataSeeder
{
    public const string SystemUserLoginCode = "SYS001";

    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await context.Users.AnyAsync(cancellationToken))
            return;

        var systemUser = new User
        {
            Id = Guid.NewGuid(),
            LoginCode = SystemUserLoginCode,
            Username = "SystemUser",
            IsSystemUser = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        context.Users.Add(systemUser);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded System User with LoginCode: {LoginCode}", SystemUserLoginCode);
    }
}
