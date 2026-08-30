using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class SwitchRole
{
    public sealed record Command(UserRole NewRole) : IRequest<Result<TokenResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.NewRole)
                .IsInEnum()
                .WithMessage("Invalid role. Must be Student or Company.");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser, TokenService tokenService)
        : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

            if (user is null)
            {
                return Result<TokenResponse>.NotFound();
            }

            if (request.NewRole == UserRole.Company)
            {
                user.SwitchToCompany();
            }
            else
            {
                user.SwitchToStudent();
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result<TokenResponse>.Success(await tokenService.CreateTokenResponse(user));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/switch-role", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization()
            .WithName(nameof(SwitchRole));
}
