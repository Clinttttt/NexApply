using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record LoginCommand(string Email, string Password) : IRequest<Result<TokenResponseDto>>;
