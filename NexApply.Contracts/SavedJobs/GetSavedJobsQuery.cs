using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.SavedJobs;

public record GetSavedJobsQuery() : IRequest<Result<List<SavedJobDto>>>;

