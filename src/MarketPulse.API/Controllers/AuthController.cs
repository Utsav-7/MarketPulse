using System.Text.RegularExpressions;
using MarketPulse.Application.Authentication.DTOs;
using MarketPulse.Application.Authentication.Interfaces;
using MarketPulse.Application.Users.DTOs;
using MarketPulse.Application.Users.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserCreationService _userCreationService;

    private static readonly Regex LoginCodeRegex = new(@"^[A-Za-z0-9]{6}$", RegexOptions.Compiled);

    public AuthController(IAuthService authService, IUserCreationService userCreationService)
    {
        _authService = authService;
        _userCreationService = userCreationService;
    }

    /// <summary>Login with 6-character alphanumeric code. Use the returned token in Authorize (Bearer) for protected endpoints.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.LoginCode))
            return BadRequest(new { message = "Login code is required." });

        var code = request.LoginCode.Trim();
        if (!LoginCodeRegex.IsMatch(code))
            return BadRequest(new { message = "Login code must be exactly 6 alphanumeric characters." });

        var result = await _authService.LoginAsync(code, cancellationToken);
        if (result == null)
            return Unauthorized(new { message = "Invalid login code." });

        return Ok(result);
    }

    /// <summary>Admin-only: create a new user. No link on login screen; only those who know the URL and system user code can create users. Username is generated dynamically.</summary>
    [HttpPost("create-user")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CreateUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.NewUserLoginCode) || string.IsNullOrWhiteSpace(request.AdminCode))
            return BadRequest(new { message = "New user login code and admin code are required." });

        var newCode = request.NewUserLoginCode.Trim();
        if (!LoginCodeRegex.IsMatch(newCode))
            return BadRequest(new { message = "New user login code must be exactly 6 alphanumeric characters." });

        if (!LoginCodeRegex.IsMatch(request.AdminCode.Trim()))
            return BadRequest(new { message = "Admin code must be exactly 6 alphanumeric characters." });

        var result = await _userCreationService.CreateUserAsync(request, cancellationToken);

        if (result.ErrorCode == "InvalidAdminCode")
            return Unauthorized(new { message = "Invalid admin (system user) code." });

        if (result.ErrorCode == "LoginCodeAlreadyExists")
            return BadRequest(new { message = "This login code is already in use." });

        if (result.ErrorCode == "InvalidLoginCode" || !result.Success || result.Data == null)
            return BadRequest(new { message = "Invalid new user login code." });

        return Ok(result.Data);
    }
}
