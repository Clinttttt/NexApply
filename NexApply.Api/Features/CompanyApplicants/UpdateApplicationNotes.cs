using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyApplicants;

public static class UpdateApplicationNotes
{
    public sealed record Request(string? RecruiterNotes);

    public sealed record Command(Guid ApplicationId, string? RecruiterNotes) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.ApplicationId).NotEmpty();
            RuleFor(command => command.RecruiterNotes).MaximumLength(2000);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var application = await context.Applications
                .Include(candidate => candidate.JobListing)
                .FirstOrDefaultAsync(candidate => candidate.Id == request.ApplicationId, cancellationToken);

            if (application is null)
            {
                return Result<bool>.NotFound();
            }

            if (application.JobListing.CompanyId != companyId)
            {
                return Result<bool>.Forbidden();
            }

            application.UpdateRecruiterNotes(request.RecruiterNotes ?? string.Empty);
            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPatch("/{applicationId:guid}/notes", async (
                [FromRoute] Guid applicationId,
                [FromBody] Request request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(applicationId, request.RecruiterNotes), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateApplicationNotes));
}
