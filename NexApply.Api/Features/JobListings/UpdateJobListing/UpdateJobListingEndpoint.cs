using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListing;

public static class UpdateJobListingEndpoint
{
    public static IEndpointRouteBuilder MapUpdateJobListing(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/jobs/{id:guid}", async (
            [FromRoute] Guid id,
            [FromBody] UpdateJobListingRequest request,
            IMediator mediator) =>
        {
            var command = new UpdateJobListingCommand(
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
                request.Deadline
            );

            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings");

        return app;
    }
}

public record UpdateJobListingRequest(
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
    DateTime? Deadline
);
