using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.PublicStats;

namespace NexApply.Api.Features.PublicStats.GetPublicStats;

public class GetPublicStatsHandler(AppDbContext db) : IRequestHandler<GetPublicStatsQuery, Result<PublicStatsDto>>
{
    public async Task<Result<PublicStatsDto>> Handle(GetPublicStatsQuery request, CancellationToken cancellationToken)
    {
        var activeListings = await db.JobListings
            .Where(j => j.Status == JobListingStatus.Active)
            .CountAsync(cancellationToken);

        var companies = await db.CompanyProfiles
            .CountAsync(cancellationToken);

        var students = await db.StudentProfiles
            .CountAsync(cancellationToken);

        return Result<PublicStatsDto>.Success(new PublicStatsDto(activeListings, companies, students));
    }
}
