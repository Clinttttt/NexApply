using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;

public class GetCompanyApplicantsHandler : IRequestHandler<GetCompanyApplicantsQuery, Result<List<ApplicantDto>>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetCompanyApplicantsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ApplicantDto>>> Handle(GetCompanyApplicantsQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var query = _context.Applications
            .Include(a => a.Student)
                .ThenInclude(s => s.Resume)
            .Include(a => a.Student)
                .ThenInclude(s => s.User)
            .Include(a => a.JobListing)
            .Where(a => a.JobListing.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<ApplicationStatus>(request.Status, out var status))
        {
            query = query.Where(a => a.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.JobListingId) && Guid.TryParse(request.JobListingId, out var jobId))
        {
            query = query.Where(a => a.JobListingId == jobId);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(a =>
                a.Student.FullName.ToLower().Contains(searchLower) ||
                a.JobListing.Title.ToLower().Contains(searchLower) ||
                (a.Student.ParsedResumeText != null && a.Student.ParsedResumeText.ToLower().Contains(searchLower))
            );
        }

        query = request.SortBy switch
        {
            "Oldest" => query.OrderBy(a => a.CreatedAt),
            "NameAsc" => query.OrderBy(a => a.Student.FullName),
            "BestMatch" => query.OrderByDescending(a => a.CreatedAt), // TODO: Implement match score sorting
            _ => query.OrderByDescending(a => a.CreatedAt) // Newest
        };

        var applications = await query
            .ToListAsync(ct);

        var applicants = applications
            .Select(a => new ApplicantDto
            {
                ApplicationId = a.Id,
                StudentId = a.StudentId,
                StudentName = a.Student.FullName,
                Email = a.Student.User.Email,
                Phone = a.Student.Phone,
                Location = a.Student.Location,
                Portfolio = a.Student.Portfolio,
                LinkedIn = a.Student.LinkedIn,
                GitHub = a.Student.GitHub,
                ResumeUrl = a.ResumeUrl,
                JobListingId = a.JobListingId,
                JobTitle = a.JobListing.Title,
                JobType = a.JobListing.JobType.ToString(),
                Status = a.Status.ToString(),
                MatchScore = null,
                AppliedAt = a.CreatedAt,
                CoverLetter = a.CoverLetter,
                RecruiterNotes = a.RecruiterNotes,
                Skills = GetSkills(a.Student.Resume?.SkillsJson)
            })
            .ToList();

        return Result<List<ApplicantDto>>.Success(applicants);
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
