using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyProfile;

public static class GetCompanyProfile
{
    public sealed record Query : IRequest<Result<CompanyProfileResponse>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<CompanyProfileResponse>>
    {
        public async Task<Result<CompanyProfileResponse>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.CompanyProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<CompanyProfileResponse>.NotFound();
            }

            var activeListingsCount = await context.JobListings
                .CountAsync(
                    listing => listing.CompanyId == userId && listing.Status == JobListingStatus.Active,
                    cancellationToken);

            return Result<CompanyProfileResponse>.Success(CompanyProfileResponse.From(profile, activeListingsCount));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanyProfile))
            .Produces<CompanyProfileResponse>(StatusCodes.Status200OK);
}
