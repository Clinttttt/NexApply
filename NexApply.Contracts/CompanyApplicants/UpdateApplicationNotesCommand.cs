using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanyApplicants;

public record UpdateApplicationNotesCommand(
    Guid ApplicationId,
    string? RecruiterNotes
) : IRequest<Result<bool>>;
