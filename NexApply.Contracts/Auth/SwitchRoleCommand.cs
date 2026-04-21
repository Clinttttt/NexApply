using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Enums;

namespace NexApply.Contracts.Auth;

public record SwitchRoleCommand(UserRole NewRole) : IRequest<Result<TokenResponseDto>>;
