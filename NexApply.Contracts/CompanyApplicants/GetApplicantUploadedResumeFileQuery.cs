using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.CompanyApplicants;

public record GetApplicantUploadedResumeFileQuery(Guid ApplicationId) : IRequest<Result<UploadedResumeFileDto>>;

