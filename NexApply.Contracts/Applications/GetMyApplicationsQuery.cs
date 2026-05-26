using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Applications;

public record GetMyApplicationsQuery() : IRequest<Result<List<StudentApplicationDto>>>;

