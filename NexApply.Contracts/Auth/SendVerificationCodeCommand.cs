using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record SendVerificationCodeCommand(string Email) : IRequest<Result<string>>;
