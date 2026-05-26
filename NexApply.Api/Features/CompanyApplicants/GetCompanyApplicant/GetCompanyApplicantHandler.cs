using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicant;

public class GetCompanyApplicantHandler : IRequestHandler<GetCompanyApplicantQuery, Result<ApplicantDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetCompanyApplicantHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ApplicantDto>> Handle(GetCompanyApplicantQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var application = await _context.Applications
            .Include(a => a.Student)
                .ThenInclude(s => s.Resume)
            .Include(a => a.Student)
                .ThenInclude(s => s.User)
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.JobListing.CompanyId == companyId, ct);

        if (application is null)
            return Result<ApplicantDto>.NotFound();

        var dto = new ApplicantDto
        {
            ApplicationId = application.Id,
            StudentId = application.StudentId,
            StudentName = application.Student.FullName,
            Email = application.Student.User.Email,
            Phone = application.Student.Phone,
            Location = application.Student.Location,
            Portfolio = application.Student.Portfolio,
            LinkedIn = application.Student.LinkedIn,
            GitHub = application.Student.GitHub,
            ResumeUrl = application.ResumeUrl,
            JobListingId = application.JobListingId,
            JobTitle = application.JobListing.Title,
            JobType = application.JobListing.JobType.ToString(),
            Status = application.Status.ToString(),
            MatchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, application.Student),
            AppliedAt = application.CreatedAt,
            CoverLetter = application.CoverLetter,
            RecruiterNotes = application.RecruiterNotes,
            Skills = GetSkills(application.Student.Resume?.SkillsJson)
        };

        return Result<ApplicantDto>.Success(dto);
    }

    private static List<string> GetSkills(string? skillsJson)
    {
        if (string.IsNullOrWhiteSpace(skillsJson))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(skillsJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}

