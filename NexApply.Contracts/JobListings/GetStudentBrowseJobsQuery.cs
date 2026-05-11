using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record GetStudentBrowseJobsQuery : IRequest<Result<List<StudentBrowseJobDto>>>;
