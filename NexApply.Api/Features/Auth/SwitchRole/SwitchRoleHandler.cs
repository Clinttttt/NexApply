using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Features.Auth.SwitchRole;

public record SwitchRoleCommand(UserRole NewRole) : IRequest<Result<TokenResponseDto>>;

public class SwitchRoleHandler(AppDbContext context, CurrentUser currentUser, TokenService tokenService) 
    : IRequestHandler<SwitchRoleCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(SwitchRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == new Guid(currentUser.UserId), cancellationToken);
        if (user is null) return Result<TokenResponseDto>.NotFound();

        if (request.NewRole == UserRole.Company)
            user.SwitchToCompany();
        else
            user.SwitchToStudent();

        await context.SaveChangesAsync(cancellationToken);

        // Return new token with updated role claim
        return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
    }
}
