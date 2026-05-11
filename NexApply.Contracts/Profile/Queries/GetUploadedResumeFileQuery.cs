using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.Profile.Queries;

public record GetUploadedResumeFileQuery : IRequest<Result<UploadedResumeFileDto>>;
