using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.SavedJobs;

public record UnsaveJobCommand(Guid JobListingId) : IRequest<Result<bool>>;

