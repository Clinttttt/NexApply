using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class CreateJobListing
{
    public sealed record Command(
        string Title,
        string Description,
        string Responsibilities,
        string Qualifications,
        string RequiredSkills,
        string? Benefits,
        string Location,
        int JobType,
        int WorkSetup,
        decimal? SalaryMin,
        decimal? SalaryMax,
        string? ExperienceLevel,
        int Openings,
        DateTime? Deadline) : IRequest<Result<JobListingResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Title)
                .NotEmpty().WithMessage("Job title is required")
                .MaximumLength(300).WithMessage("Job title cannot exceed 300 characters");

            RuleFor(command => command.Description)
                .NotEmpty().WithMessage("Job description is required");

            RuleFor(command => command.Responsibilities)
                .NotEmpty().WithMessage("Responsibilities are required");

            RuleFor(command => command.Qualifications)
                .NotEmpty().WithMessage("Qualifications are required");

            RuleFor(command => command.RequiredSkills)
                .NotEmpty().WithMessage("Required skills are required");

            RuleFor(command => command.Location)
                .NotEmpty().WithMessage("Location is required")
                .MaximumLength(200).WithMessage("Location cannot exceed 200 characters");

            RuleFor(command => command.JobType)
                .InclusiveBetween(0, 4).WithMessage("Invalid job type");

            RuleFor(command => command.WorkSetup)
                .InclusiveBetween(0, 2).WithMessage("Invalid work setup");

            RuleFor(command => command.SalaryMin)
                .GreaterThanOrEqualTo(0)
                .When(command => command.SalaryMin.HasValue)
                .WithMessage("Minimum salary must be greater than or equal to 0");

            RuleFor(command => command.SalaryMax)
                .GreaterThanOrEqualTo(command => command.SalaryMin ?? 0)
                .When(command => command.SalaryMax.HasValue && command.SalaryMin.HasValue)
                .WithMessage("Maximum salary must be greater than or equal to minimum salary");

            RuleFor(command => command.Openings)
                .GreaterThan(0).WithMessage("Number of openings must be greater than 0");

            RuleFor(command => command.Deadline)
                .GreaterThan(DateTime.UtcNow)
                .When(command => command.Deadline.HasValue)
                .WithMessage("Deadline must be in the future");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<JobListingResponse>>
    {
        public async Task<Result<JobListingResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var companyExists = await context.CompanyProfiles
                .AnyAsync(profile => profile.UserId == userId, cancellationToken);

            if (!companyExists)
            {
                return Result<JobListingResponse>.NotFound();
            }

            var jobListing = JobListing.Create(
                userId,
                request.Title,
                request.Description,
                request.Responsibilities,
                request.Qualifications,
                request.RequiredSkills,
                request.Benefits,
                request.Location,
                (JobType)request.JobType,
                (WorkSetup)request.WorkSetup,
                request.SalaryMin,
                request.SalaryMax,
                request.ExperienceLevel,
                request.Openings,
                request.Deadline.HasValue
                    ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc)
                    : null);

            context.JobListings.Add(jobListing);
            await context.SaveChangesAsync(cancellationToken);

            return Result<JobListingResponse>.Success(JobListingResponse.From(jobListing));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(CreateJobListing))
            .Produces<JobListingResponse>(StatusCodes.Status200OK);
}
