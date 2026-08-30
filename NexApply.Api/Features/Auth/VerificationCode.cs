namespace NexApply.Api.Features.Auth;

internal static class VerificationCode
{
    public static string Generate() => Random.Shared.Next(100000, 999999).ToString();
}
