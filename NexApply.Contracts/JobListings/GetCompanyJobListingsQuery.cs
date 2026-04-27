using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record GetCompanyJobListingsQuery : IRequest<Result<List<JobListingSummaryDto>>>;
