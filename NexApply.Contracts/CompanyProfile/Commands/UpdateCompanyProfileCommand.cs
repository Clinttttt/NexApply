using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Dtos;

namespace NexApply.Contracts.CompanyProfile.Commands;

public record UpdateCompanyProfileCommand(
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
    string? HiringManagerEmail
) : IRequest<Result<CompanyProfileDto>>;
