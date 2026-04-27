using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record UpdateJobListingStatusCommand(
    Guid JobListingId,
    int Status
) : IRequest<Result<bool>>;
