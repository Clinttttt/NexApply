using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record LoginCommand(string Username, string Password) : IRequest<Result<TokenResponseDto>>;
