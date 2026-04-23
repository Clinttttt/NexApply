using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.Profile.Commands;

public record UploadResumeCommand(
    string FileName,
    string ContentType,
    byte[] FileData
) : IRequest<Result<ResumeUploadDto>>;
