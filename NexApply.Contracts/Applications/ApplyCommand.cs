using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Applications;

public record ApplyCommand(
    Guid JobListingId,
    string? CoverLetter = null,
    string? ResumeUrl = null) : IRequest<Result<ApplyResponseDto>>;
