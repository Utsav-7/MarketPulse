namespace MarketPulse.Application.Authentication.DTOs;

public record LoginResponse(string Token, string Username, DateTime ExpiresAtUtc);
