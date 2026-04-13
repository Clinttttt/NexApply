using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace NexApply.Client.Utilities;

public static class JwtParser
{
    private static readonly Dictionary<string, string> _claimMap = new()
    {
        ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] = ClaimTypes.Role,
        ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] = ClaimTypes.Name,
        ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] = ClaimTypes.NameIdentifier
    };

    public static ClaimsPrincipal? ParseToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token.Trim().Trim('"'));

            if (jwt.ValidTo < DateTime.UtcNow) return null;

            var claims = jwt.Claims
                .Select(c => new Claim(_claimMap.GetValueOrDefault(c.Type, c.Type), c.Value));

            return new ClaimsPrincipal(new ClaimsIdentity(claims, "jwt"));
        }
        catch { return null; }
    }
}