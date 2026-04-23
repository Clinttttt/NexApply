using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Enums;

namespace NexApply.Contracts.Auth;

public record RegisterCommand(
    string FullName,
    string Username,
    string Email,
    string Password,
    string ConfirmPassword,
    UserRole Role
) : IRequest<Result<TokenResponseDto>>;
