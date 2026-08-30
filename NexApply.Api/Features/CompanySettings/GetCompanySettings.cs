using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanySettings;

public static class GetCompanySettings
{
    public sealed record Query : IRequest<Result<CompanySettingsResponse>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<CompanySettingsResponse>>
    {
        public async Task<Result<CompanySettingsResponse>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var user = await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

            if (user is null)
            {
                return Result<CompanySettingsResponse>.NotFound("User not found");
            }

            var settings = await context.CompanyUserSettings
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (settings is null)
            {
                settings = CompanyUserSettings.Create(userId);
                context.CompanyUserSettings.Add(settings);
                await context.SaveChangesAsync(cancellationToken);
            }

            return Result<CompanySettingsResponse>.Success(CompanySettingsResponse.From(user, settings));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanySettings))
            .Produces<CompanySettingsResponse>(StatusCodes.Status200OK);
}
