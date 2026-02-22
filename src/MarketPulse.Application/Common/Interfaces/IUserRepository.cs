using MarketPulse.Domain.Entities;

namespace MarketPulse.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByLoginCodeAsync(string loginCode, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
