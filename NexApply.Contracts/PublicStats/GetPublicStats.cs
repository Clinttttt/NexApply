using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.PublicStats;

public record GetPublicStatsQuery : IRequest<Result<PublicStatsDto>>;

public record PublicStatsDto(
    int ActiveListings,
    int Companies,
    int Students
);
