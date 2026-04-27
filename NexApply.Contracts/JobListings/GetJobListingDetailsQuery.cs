using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record GetJobListingDetailsQuery(Guid JobListingId) : IRequest<Result<JobListingDetailsDto>>;
