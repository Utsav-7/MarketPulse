using MarketPulse.Application.Authentication.DTOs;

namespace MarketPulse.Application.Authentication.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string loginCode, CancellationToken cancellationToken = default);
}
