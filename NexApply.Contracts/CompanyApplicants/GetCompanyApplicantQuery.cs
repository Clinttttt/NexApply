using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanyApplicants;

public record GetCompanyApplicantQuery(Guid ApplicationId) : IRequest<Result<ApplicantDto>>;

