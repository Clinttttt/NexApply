using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record GetJobBoardJobsQuery() : IRequest<Result<List<JobBoardJobDto>>>;

