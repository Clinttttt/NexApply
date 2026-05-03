using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Interviews;

public record GetCompanyInterviewsQuery : IRequest<Result<CompanyInterviewsDto>>;
