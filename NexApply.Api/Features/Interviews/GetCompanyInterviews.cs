using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Interviews;

public static class GetCompanyInterviews
{
    public sealed record Query : IRequest<Result<Response>>;

    public sealed class Response
    {
        public List<InterviewResponse> Interviews { get; init; } = [];
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        private const string UnknownCandidate = "Unknown";

        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var companyExists = await context.CompanyProfiles
                .AnyAsync(profile => profile.UserId == companyId, cancellationToken);

            if (!companyExists)
            {
                return Result<Response>.NotFound();
            }

            var interviews = await context.Interviews
                .AsNoTracking()
                .Where(interview => interview.Application.JobListing.CompanyId == companyId)
                .OrderBy(interview => interview.ScheduledAt)
                .Select(interview => new InterviewResponse
                {
                    Id = interview.Id,
                    CandidateName = interview.Application.Student.FullName ?? UnknownCandidate,
                    JobTitle = interview.Application.JobListing.Title,
                    ScheduledAt = interview.ScheduledAt,
                    DurationMinutes = interview.DurationMinutes,
                    Format = interview.Format.ToString(),
                    Status = interview.Status.ToString(),
                    Location = interview.Location,
                    MeetingLink = interview.MeetingLink,
                    Interviewers = interview.Panelists.Select(panelist => panelist.Name).ToList(),
                    Notes = interview.Notes,
                    Feedback = interview.Feedback,
                    Rating = interview.Rating,
                    Recommendation = interview.Recommendation
                })
                .ToListAsync(cancellationToken);

            return Result<Response>.Success(new Response { Interviews = interviews });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanyInterviews))
            .Produces<Response>(StatusCodes.Status200OK);
}
