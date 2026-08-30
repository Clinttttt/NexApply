namespace NexApply.Api.Features.Auth;

public interface IEmailService
{
    Task<bool> SendVerificationCodeAsync(string toEmail, string code);
    Task<bool> SendPasswordResetCodeAsync(string toEmail, string code);
    Task<bool> SendWelcomeEmailAsync(string toEmail, string fullName);
}
