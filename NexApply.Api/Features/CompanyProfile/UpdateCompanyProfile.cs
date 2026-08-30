using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyProfile;

public static class UpdateCompanyProfile
{
    public sealed record Command(
        string CompanyName,
        string? Tagline,
        string? Description,
        string? Mission,
        string? Website,
        string? LogoUrl,
        string? Industry,
        string? Location,
        string? CompanySize,
        string? Founded,
        string? PerksAndBenefits,
        string? WorkCulture,
        string? ContactEmail,
        string? ContactPhone,
        string? LinkedInUrl,
        string? TwitterUrl,
        string? FacebookUrl,
        string? GitHubUrl,
        string? HiringManagerName,
        string? HiringManagerTitle,
        string? HiringManagerEmail) : IRequest<Result<CompanyProfileResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.CompanyName)
                .NotEmpty().WithMessage("Company name is required")
                .MaximumLength(200).WithMessage("Company name cannot exceed 200 characters");

            RuleFor(command => command.Tagline)
                .MaximumLength(200).When(command => !string.IsNullOrEmpty(command.Tagline))
                .WithMessage("Tagline cannot exceed 200 characters");

            RuleFor(command => command.Website)
                .MaximumLength(500).When(command => !string.IsNullOrEmpty(command.Website))
                .WithMessage("Website URL cannot exceed 500 characters");

            RuleFor(command => command.Industry)
                .MaximumLength(100).When(command => !string.IsNullOrEmpty(command.Industry))
                .WithMessage("Industry cannot exceed 100 characters");

            RuleFor(command => command.Location)
                .MaximumLength(200).When(command => !string.IsNullOrEmpty(command.Location))
                .WithMessage("Location cannot exceed 200 characters");

            RuleFor(command => command.CompanySize)
                .MaximumLength(50).When(command => !string.IsNullOrEmpty(command.CompanySize))
                .WithMessage("Company size cannot exceed 50 characters");

            RuleFor(command => command.Founded)
                .MaximumLength(50).When(command => !string.IsNullOrEmpty(command.Founded))
                .WithMessage("Founded cannot exceed 50 characters");

            RuleFor(command => command.ContactEmail)
                .EmailAddress().When(command => !string.IsNullOrEmpty(command.ContactEmail))
                .WithMessage("Invalid email address");

            RuleFor(command => command.ContactPhone)
                .MaximumLength(50).When(command => !string.IsNullOrEmpty(command.ContactPhone))
                .WithMessage("Phone number cannot exceed 50 characters");

            RuleFor(command => command.LinkedInUrl)
                .MaximumLength(500).When(command => !string.IsNullOrEmpty(command.LinkedInUrl))
                .WithMessage("LinkedIn URL cannot exceed 500 characters");

            RuleFor(command => command.GitHubUrl)
                .MaximumLength(500).When(command => !string.IsNullOrEmpty(command.GitHubUrl))
                .WithMessage("GitHub URL cannot exceed 500 characters");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<CompanyProfileResponse>>
    {
        public async Task<Result<CompanyProfileResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.CompanyProfiles
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<CompanyProfileResponse>.NotFound();
            }

            profile.UpdateProfile(
                request.CompanyName,
                request.Tagline,
                request.Description,
                request.Mission,
                request.Website,
                request.LogoUrl,
                request.Industry,
                request.Location,
                request.CompanySize,
                request.Founded,
                request.PerksAndBenefits,
                request.WorkCulture,
                request.ContactEmail,
                request.ContactPhone,
                request.LinkedInUrl,
                request.TwitterUrl,
                request.FacebookUrl,
                request.GitHubUrl,
                request.HiringManagerName,
                request.HiringManagerTitle,
                request.HiringManagerEmail);

            await context.SaveChangesAsync(cancellationToken);

            var activeListingsCount = await context.JobListings
                .CountAsync(
                    listing => listing.CompanyId == userId && listing.Status == JobListingStatus.Active,
                    cancellationToken);

            return Result<CompanyProfileResponse>.Success(CompanyProfileResponse.From(profile, activeListingsCount));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateCompanyProfile));
}
