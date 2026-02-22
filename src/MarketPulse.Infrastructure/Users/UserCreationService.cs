using MarketPulse.Application.Common.Interfaces;
using MarketPulse.Application.Users.DTOs;
using MarketPulse.Application.Users.Interfaces;
using MarketPulse.Domain.Entities;
using MarketPulse.Infrastructure.Persistence;

namespace MarketPulse.Infrastructure.Users;

public class UserCreationService : IUserCreationService
{
    private readonly IUserRepository _userRepository;

    public UserCreationService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<CreateUserResult> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        if (request.AdminCode?.Trim() != DataSeeder.SystemUserLoginCode)
            return new CreateUserResult(false, null, "InvalidAdminCode");

        var code = request.NewUserLoginCode?.Trim() ?? "";
        if (code.Length != 6 || !System.Text.RegularExpressions.Regex.IsMatch(code, @"^[A-Za-z0-9]{6}$"))
            return new CreateUserResult(false, null, "InvalidLoginCode");

        var existing = await _userRepository.GetByLoginCodeAsync(code, cancellationToken);
        if (existing != null)
            return new CreateUserResult(false, null, "LoginCodeAlreadyExists");

        var username = "User_" + Guid.NewGuid().ToString("N")[..8];

        var user = new User
        {
            Id = Guid.NewGuid(),
            LoginCode = code,
            Username = username,
            IsSystemUser = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        return new CreateUserResult(true, new CreateUserResponse(user.LoginCode, user.Username), null);
    }
}
