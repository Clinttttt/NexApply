using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.CompanyApplicants;

public record GetApplicantResumeContentQuery(Guid ApplicationId) : IRequest<Result<ResumeContentDto>>;

