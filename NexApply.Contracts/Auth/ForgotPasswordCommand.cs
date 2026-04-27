using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record ForgotPasswordCommand(string Email) : IRequest<Result<string>>;
