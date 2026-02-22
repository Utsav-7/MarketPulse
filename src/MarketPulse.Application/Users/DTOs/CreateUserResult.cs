namespace MarketPulse.Application.Users.DTOs;

public record CreateUserResult(bool Success, CreateUserResponse? Data, string? ErrorCode);
