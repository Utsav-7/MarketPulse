using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketPulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        var username = User.FindFirstValue(ClaimTypes.Name) ?? "User";
        return Ok(new
        {
            message = "Welcome to MarketPulse Dashboard",
            username,
            timestamp = DateTime.UtcNow
        });
    }
}
