using Google.Apis.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;
using NexApply.Contracts.Enums;

namespace NexApply.Api.Features.Auth.LoginWithEmail;

public class LoginWithEmailHandler(IConfiguration configuration, AppDbContext context, TokenService tokenService)
    : IRequestHandler<LoginWithEmailCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(LoginWithEmailCommand request, CancellationToken cancellationToken)
    {
        var googleClientId = configuration["Authentication:Google:ClientId"];
        if (string.IsNullOrWhiteSpace(googleClientId))
            return Result<TokenResponseDto>.Failure("Google login is not configured");

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                });
        }
        catch
        {
            return Result<TokenResponseDto>.Failure("Invalid Google token");
        }

        if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
            return Result<TokenResponseDto>.Failure("Google email is not verified");

        var email = payload.Email;
        var user = await context.Users.FirstOrDefaultAsync(s => s.Email == email, cancellationToken);

        if (user is null)
        {
            var desiredRole = request.Role ?? UserRole.Student;

            using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            var baseUsername = email.Split('@')[0];
            var userName = baseUsername;
            var counter = 1;
            while (await context.Users.AnyAsync(s => s.Username == userName, cancellationToken))
            {
                userName = $"{baseUsername}{counter}";
                counter++;
            }

            var fullName = string.IsNullOrWhiteSpace(payload.Name) ? userName : payload.Name;

            user = desiredRole == UserRole.Company
                ? User.CreateCompany(email, userName, string.Empty)
                : User.CreateStudent(email, userName, string.Empty);
            await context.Users.AddAsync(user, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            if (desiredRole == UserRole.Company)
            {
                var companyProfile = Entities.CompanyProfile.Create(user.Id, fullName);
                await context.CompanyProfiles.AddAsync(companyProfile, cancellationToken);
            }
            else
            {
                var studentProfile = StudentProfile.Create(user.Id, fullName);
                await context.StudentProfiles.AddAsync(studentProfile, cancellationToken);
            }

            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }

        return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
    }
}
