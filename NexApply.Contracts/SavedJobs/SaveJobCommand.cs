using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.SavedJobs;

public record SaveJobCommand(Guid JobListingId) : IRequest<Result<bool>>;

