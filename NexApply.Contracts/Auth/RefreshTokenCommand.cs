using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<TokenResponseDto>>;
