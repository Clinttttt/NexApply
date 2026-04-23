using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record VerifyEmailCommand(string Email, string Code) : IRequest<Result<TokenResponseDto>>;
