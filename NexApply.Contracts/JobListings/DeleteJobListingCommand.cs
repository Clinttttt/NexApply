using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record DeleteJobListingCommand(Guid JobListingId) : IRequest<Result<bool>>;

