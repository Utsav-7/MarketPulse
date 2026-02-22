using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MarketPulse.API.Swagger;

public class SwaggerLoginOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.ApiDescription.RelativePath?.Contains("auth/login", StringComparison.OrdinalIgnoreCase) != true)
            return;

        operation.Summary = "Login with 6-character code";
        operation.Description = "Enter your 6-character alphanumeric login code in the single box below. Returns a JWT token—copy the **token** value, then click **Authorize** above and paste it to call protected endpoints.";

        if (operation.RequestBody?.Content.TryGetValue("application/json", out var mediaType) == true)
        {
            var schema = new OpenApiSchema
            {
                Type = "object",
                Required = { "loginCode" },
                Description = "Login code (6 alphanumeric characters only)",
                Properties =
                {
                    ["loginCode"] = new OpenApiSchema
                    {
                        Type = "string",
                        MinLength = 6,
                        MaxLength = 6,
                        Description = "Exactly 6 alphanumeric characters (e.g. SYS001)",
                        Example = new OpenApiString("SYS001"),
                        Title = "Login Code"
                    }
                }
            };
            mediaType.Schema = schema;
            mediaType.Example = new OpenApiObject { ["loginCode"] = new OpenApiString("SYS001") };
        }
    }
}
