using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record ResetPasswordCommand(
    string Email,
    string ResetCode,
    string NewPassword,
    string ConfirmPassword
) : IRequest<Result<string>>;
