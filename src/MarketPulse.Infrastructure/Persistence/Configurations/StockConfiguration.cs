using MarketPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketPulse.Infrastructure.Persistence.Configurations;

public class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("Stocks");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Ticker).HasMaxLength(32).IsRequired();
        builder.Property(s => s.Name).HasMaxLength(256).IsRequired();
        builder.Property(s => s.Exchange).HasMaxLength(16).IsRequired();
        builder.Property(s => s.CountryCode).HasMaxLength(4).IsRequired();

        builder.HasIndex(s => new { s.Ticker, s.CountryCode }).IsUnique();
        builder.HasIndex(s => s.CountryCode);
    }
}
