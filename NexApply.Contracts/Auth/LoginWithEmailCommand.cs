using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Enums;

namespace NexApply.Contracts.Auth;

public record LoginWithEmailCommand(string IdToken, UserRole? Role = null) : IRequest<Result<TokenResponseDto>>;
