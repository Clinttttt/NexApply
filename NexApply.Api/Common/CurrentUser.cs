using System.Security.Claims;

namespace NexApply.Api.Common
{
    public class CurrentUser(IHttpContextAccessor httpContext)
    {
        public string UserId => httpContext.HttpContext!.User
            .FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        public string Email => httpContext.HttpContext!.User
            .FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        public string Role => httpContext.HttpContext!.User
            .FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }
}
