using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanySettings;

public static class UpdateCompanyTestimonial
{
    public sealed record Command(string Testimonial) : IRequest<Result<CompanySettingsResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Testimonial).MaximumLength(200);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<CompanySettingsResponse>>
    {
        public async Task<Result<CompanySettingsResponse>> Handle(Command request, CancellationToken cancellationToken)
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
            }

            settings.UpdateTestimonial(
                string.IsNullOrWhiteSpace(request.Testimonial) ? null : request.Testimonial.Trim());

            await context.SaveChangesAsync(cancellationToken);

            return Result<CompanySettingsResponse>.Success(CompanySettingsResponse.From(user, settings));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/testimonial", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateCompanyTestimonial));
}
