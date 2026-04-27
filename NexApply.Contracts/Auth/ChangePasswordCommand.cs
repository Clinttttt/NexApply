using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
) : IRequest<Result<string>>;
