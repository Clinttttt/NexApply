using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record LoginWithEmailCommand(string IdToken) : IRequest<Result<TokenResponseDto>>;
