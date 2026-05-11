using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanyApplicants;

public record UpdateApplicationStatusCommand(
    Guid ApplicationId,
    string Status
) : IRequest<Result<bool>>;
