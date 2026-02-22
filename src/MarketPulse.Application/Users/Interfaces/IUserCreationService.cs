using MarketPulse.Application.Users.DTOs;

namespace MarketPulse.Application.Users.Interfaces;

public interface IUserCreationService
{
    /// <summary>
    /// Creates a new user when adminCode matches the system user code.
    /// Username is generated dynamically. Not exposed on login screen; admin-only.
    /// ErrorCode: "InvalidAdminCode" (401), "LoginCodeAlreadyExists" (400).
    /// </summary>
    Task<CreateUserResult> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
}
