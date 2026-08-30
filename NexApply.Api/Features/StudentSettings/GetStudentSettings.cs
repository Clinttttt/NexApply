using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.StudentSettings;

public static class GetStudentSettings
{
    public sealed record Query : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string Email { get; init; } = string.Empty;
        public bool HasPassword { get; init; }
        public string SignInMethod { get; init; } = "Email & Password";
        public string? Feedback { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var user = await context.Users
                .Include(entity => entity.StudentProfile)
                .AsNoTracking()
                .FirstOrDefaultAsync(entity => entity.Id == userId, cancellationToken);

            if (user is null)
            {
                return Result<Response>.NotFound("User not found");
            }

            var hasPassword = !string.IsNullOrWhiteSpace(user.PasswordHash);

            return Result<Response>.Success(new Response
            {
                Email = user.Email,
                HasPassword = hasPassword,
                SignInMethod = hasPassword ? "Email & Password" : "Google One Tap",
                Feedback = user.StudentProfile?.Feedback
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetStudentSettings))
            .RequireAuthorization(policy => policy.RequireRole("Student"));
}
