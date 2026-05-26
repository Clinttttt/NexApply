using MediatR;
using NexApply.Common;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record GetStudentBrowseJobsQuery(DateTime? Cursor = null, int PageSize = 10)
    : IRequest<Result<CursorPagedResult<StudentBrowseJobDto>>>;
