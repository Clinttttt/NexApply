using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class UpdateJobListing
{
    public sealed record Request(
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
        DateTime? Deadline);

    public sealed record Command(
        Guid Id,
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
            RuleFor(command => command.Id)
                .NotEmpty().WithMessage("Job listing ID is required.");

            RuleFor(command => command.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

            RuleFor(command => command.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

            RuleFor(command => command.Responsibilities)
                .NotEmpty().WithMessage("Responsibilities are required.")
                .MaximumLength(2000).WithMessage("Responsibilities cannot exceed 2000 characters.");

            RuleFor(command => command.Qualifications)
                .NotEmpty().WithMessage("Qualifications are required.")
                .MaximumLength(2000).WithMessage("Qualifications cannot exceed 2000 characters.");

            RuleFor(command => command.RequiredSkills)
                .NotEmpty().WithMessage("Required skills are required.")
                .MaximumLength(500).WithMessage("Required skills cannot exceed 500 characters.");

            RuleFor(command => command.Benefits)
                .MaximumLength(2000).WithMessage("Benefits cannot exceed 2000 characters.")
                .When(command => !string.IsNullOrEmpty(command.Benefits));

            RuleFor(command => command.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

            RuleFor(command => command.JobType)
                .Must(jobType => Enum.IsDefined(typeof(JobType), jobType))
                .WithMessage("Invalid job type.");

            RuleFor(command => command.WorkSetup)
                .Must(workSetup => Enum.IsDefined(typeof(WorkSetup), workSetup))
                .WithMessage("Invalid work setup.");

            RuleFor(command => command.SalaryMin)
                .GreaterThan(0).WithMessage("Minimum salary must be greater than 0.")
                .When(command => command.SalaryMin.HasValue);

            RuleFor(command => command.SalaryMax)
                .GreaterThan(0).WithMessage("Maximum salary must be greater than 0.")
                .GreaterThanOrEqualTo(command => command.SalaryMin)
                .WithMessage("Maximum salary must be greater than or equal to minimum salary.")
                .When(command => command.SalaryMax.HasValue && command.SalaryMin.HasValue);

            RuleFor(command => command.ExperienceLevel)
                .MaximumLength(100).WithMessage("Experience level cannot exceed 100 characters.")
                .When(command => !string.IsNullOrEmpty(command.ExperienceLevel));

            RuleFor(command => command.Openings)
                .GreaterThan(0).WithMessage("Openings must be at least 1.");

            RuleFor(command => command.Deadline)
                .GreaterThan(DateTime.UtcNow).WithMessage("Deadline must be in the future.")
                .When(command => command.Deadline.HasValue);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<JobListingResponse>>
    {
        public async Task<Result<JobListingResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var jobListing = await context.JobListings
                .FirstOrDefaultAsync(listing => listing.Id == request.Id, cancellationToken);

            if (jobListing is null)
            {
                return Result<JobListingResponse>.NotFound();
            }

            if (jobListing.CompanyId != companyId)
            {
                return Result<JobListingResponse>.Forbidden();
            }

            jobListing.Update(
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
                request.Deadline);

            await context.SaveChangesAsync(cancellationToken);

            return Result<JobListingResponse>.Success(JobListingResponse.From(jobListing));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/{id:guid}", async (
                [FromRoute] Guid id,
                [FromBody] Request request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var command = new Command(
                    id,
                    request.Title,
                    request.Description,
                    request.Responsibilities,
                    request.Qualifications,
                    request.RequiredSkills,
                    request.Benefits,
                    request.Location,
                    request.JobType,
                    request.WorkSetup,
                    request.SalaryMin,
                    request.SalaryMax,
                    request.ExperienceLevel,
                    request.Openings,
                    request.Deadline);

                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(UpdateJobListing));
}
