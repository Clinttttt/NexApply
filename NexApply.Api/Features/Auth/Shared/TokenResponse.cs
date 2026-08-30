namespace NexApply.Api.Features.Auth;

public sealed class TokenResponse
{
    public string? AccessToken { get; init; }
    public string? RefreshToken { get; init; }
}
