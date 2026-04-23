using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Services;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;
using NexApply.Contracts.Enums;

namespace NexApply.Api.Features.Auth.Register;

public class RegisterHandler(AppDbContext context, IEmailService emailService) : IRequestHandler<RegisterCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
    
        if (await context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
            return Result<TokenResponseDto>.Conflict("Email is already registered.");


        if (await context.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
            return Result<TokenResponseDto>.Conflict("Username is already taken.");

      
        var passwordHasher = new PasswordHasher<User>();
        var passwordHash = passwordHasher.HashPassword(null!, request.Password);

    
        var user = request.Role == UserRole.Student
            ? User.CreateStudent(request.Email, request.Username, passwordHash)
            : User.CreateCompany(request.Email, request.Username, passwordHash);

        var verificationCode = GenerateVerificationCode();
        var expiry = DateTime.UtcNow.AddMinutes(10);
        user.SetEmailVerificationCode(verificationCode, expiry);

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);

      
        if (request.Role == UserRole.Student)
        {
            var studentProfile = StudentProfile.Create(user.Id, request.FullName);
            context.StudentProfiles.Add(studentProfile);
        }
        else
        {
            var companyProfile = CompanyProfile.Create(user.Id, request.FullName);
            context.CompanyProfiles.Add(companyProfile);
        }

        await context.SaveChangesAsync(cancellationToken);

        _ = emailService.SendVerificationCodeAsync(request.Email, verificationCode);

        return Result<TokenResponseDto>.Success(new TokenResponseDto());
    }

    private static string GenerateVerificationCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }
}
