using MarketPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarketPulse.Infrastructure.Persistence.Configurations;

public class ExchangeConfiguration : IEntityTypeConfiguration<Exchange>
{
    public void Configure(EntityTypeBuilder<Exchange> builder)
    {
        builder.ToTable("Exchanges");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).HasMaxLength(16).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(256).IsRequired();
        builder.Property(e => e.Mic).HasMaxLength(64);
        builder.Property(e => e.Timezone).HasMaxLength(64);
        builder.Property(e => e.PreMarket).HasMaxLength(64);
        builder.Property(e => e.Hour).HasMaxLength(128);
        builder.Property(e => e.PostMarket).HasMaxLength(64);
        builder.Property(e => e.CloseDate).HasMaxLength(10);
        builder.Property(e => e.Country).HasMaxLength(4);
        builder.Property(e => e.CountryName).HasMaxLength(100);
        builder.Property(e => e.Reference).HasMaxLength(512);

        builder.HasIndex(e => e.Code);
        builder.HasIndex(e => e.Country);
    }
}
