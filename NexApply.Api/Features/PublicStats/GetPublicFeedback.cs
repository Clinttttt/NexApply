using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.PublicStats;

public static class GetPublicFeedback
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed record Response(string StudentName, string Role, string Testimonial, string? ProfilePictureUrl);

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Query, Result<List<Response>>>
    {
        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var studentFeedback = await context.StudentProfiles
                .AsNoTracking()
                .Where(profile => !string.IsNullOrWhiteSpace(profile.Feedback))
                .Select(profile => new Response(
                    profile.FullName,
                    profile.University ?? "Student",
                    profile.Feedback!.Trim(),
                    profile.ProfilePictureUrl
                ))
                .ToListAsync(cancellationToken);

            var companyFeedback = await (
                from settings in context.CompanyUserSettings.AsNoTracking()
                where !string.IsNullOrWhiteSpace(settings.Testimonial)
                join profile in context.CompanyProfiles.AsNoTracking()
                    on settings.UserId equals profile.UserId into profiles
                from profile in profiles.DefaultIfEmpty()
                select new Response(
                    profile != null && !string.IsNullOrWhiteSpace(profile.CompanyName) ? profile.CompanyName : "Company",
                    (profile != null ? profile.HiringManagerTitle : null) ?? "Company",
                    settings.Testimonial!.Trim(),
                    profile != null ? profile.LogoUrl : null
                )
            ).ToListAsync(cancellationToken);

            var feedback = studentFeedback
                .Concat(companyFeedback)
                .OrderBy(_ => Random.Shared.Next())
                .Take(10)
                .ToList();

            return Result<List<Response>>.Success(feedback);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/feedback", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetPublicFeedback));
}
