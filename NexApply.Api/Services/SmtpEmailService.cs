using System.Net;
using System.Net.Mail;

namespace NexApply.Api.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendVerificationCodeAsync(string toEmail, string code)
    {
        var subject = "NexApply - Verify Your Email";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #1D4ED8;'>Welcome to NexApply!</h2>
                    <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
                    <div style='background-color: #EFF6FF; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #1D4ED8; font-size: 36px; letter-spacing: 8px; margin: 0;'>{code}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style='border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;'>
                    <p style='color: #64748B; font-size: 12px;'>NexApply - Your next opportunity starts here</p>
                </div>
            </body>
            </html>
        ";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendPasswordResetCodeAsync(string toEmail, string code)
    {
        var subject = "NexApply - Password Reset Code";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #1D4ED8;'>Password Reset Request</h2>
                    <p>You requested to reset your password. Use the code below:</p>
                    <div style='background-color: #EFF6FF; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #1D4ED8; font-size: 36px; letter-spacing: 8px; margin: 0;'>{code}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                    <hr style='border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;'>
                    <p style='color: #64748B; font-size: 12px;'>NexApply - Your next opportunity starts here</p>
                </div>
            </body>
            </html>
        ";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string fullName)
    {
        var subject = "Welcome to NexApply!";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #1D4ED8;'>Welcome to NexApply, {fullName}!</h2>
                    <p>Your account has been successfully created. You're now ready to explore thousands of job opportunities.</p>
                    <div style='background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <h3 style='color: #1D4ED8; margin-top: 0;'>Get Started:</h3>
                        <ul style='color: #475569;'>
                            <li>Complete your profile</li>
                            <li>Upload your resume</li>
                            <li>Browse job listings</li>
                            <li>Apply to your dream job</li>
                        </ul>
                    </div>
                    <p>Good luck with your job search!</p>
                    <hr style='border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;'>
                    <p style='color: #64748B; font-size: 12px;'>NexApply - Your next opportunity starts here</p>
                </div>
            </body>
            </html>
        ";

        return await SendEmailAsync(toEmail, subject, body);
    }

    private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
            var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
            var fromEmail = _configuration["EmailSettings:FromEmail"];
            var fromName = _configuration["EmailSettings:FromName"] ?? "NexApply";

            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUsername, smtpPassword)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }
}
