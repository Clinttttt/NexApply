using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyApplicants;

public static class UpdateApplicationStatus
{
    public sealed record Request(string Status);

    public sealed record Command(Guid ApplicationId, string Status) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.ApplicationId).NotEmpty();

            RuleFor(command => command.Status)
                .NotEmpty()
                .Must(status => Enum.TryParse<ApplicationStatus>(status, true, out _))
                .WithMessage("Status must be one of: Submitted, UnderReview, Shortlisted, ForInterview, Declined, Decided");
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

            if (!Enum.TryParse<ApplicationStatus>(request.Status, true, out var status))
            {
                return Result<bool>.Failure("Invalid application status.");
            }

            switch (status)
            {
                case ApplicationStatus.Submitted:
                    application.MarkAsSubmitted();
                    break;
                case ApplicationStatus.UnderReview:
                    application.MoveToUnderReview();
                    break;
                case ApplicationStatus.Shortlisted:
                    application.Shortlist();
                    break;
                case ApplicationStatus.ForInterview:
                    application.MoveToInterview();
                    break;
                case ApplicationStatus.Declined:
                    application.Decline();
                    break;
                case ApplicationStatus.Decided:
                    application.MarkAsDecided();
                    break;
                default:
                    return Result<bool>.Failure("Invalid application status.");
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPatch("/{applicationId:guid}/status", async (
                [FromRoute] Guid applicationId,
                [FromBody] Request request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(applicationId, request.Status), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateApplicationStatus));
}
