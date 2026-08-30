using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.PublicStats;

public static class GetPublicStats
{
    public sealed record Query : IRequest<Result<Response>>;

    public sealed record Response(int ActiveListings, int Companies, int Students);

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activeListings = await context.JobListings
                .Where(listing => listing.Status == JobListingStatus.Active)
                .CountAsync(cancellationToken);

            var companies = await context.CompanyProfiles
                .CountAsync(cancellationToken);

            var students = await context.StudentProfiles
                .CountAsync(cancellationToken);

            return Result<Response>.Success(new Response(activeListings, companies, students));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/stats", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetPublicStats));
}
