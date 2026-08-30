using System.Security.Claims;

namespace NexApply.Api.Shared.Authorization;

public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor)
{
    public string UserId => Claim(ClaimTypes.NameIdentifier);

    public string Email => Claim(ClaimTypes.Email);

    public string Role => Claim(ClaimTypes.Role);

    private string Claim(string claimType) =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(claimType) ?? string.Empty;
}
