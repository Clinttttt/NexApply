using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class UpdateJobListingStatus
{
    public sealed record Request(int Status);

    public sealed record Command(Guid JobListingId, int Status) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.JobListingId)
                .NotEmpty().WithMessage("Job listing ID is required.");

            RuleFor(command => command.Status)
                .Must(status => Enum.IsDefined(typeof(JobListingStatus), status))
                .WithMessage("Invalid status value.");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var jobListing = await context.JobListings
                .FirstOrDefaultAsync(listing => listing.Id == request.JobListingId, cancellationToken);

            if (jobListing is null)
            {
                return Result<bool>.NotFound();
            }

            if (jobListing.CompanyId != companyId)
            {
                return Result<bool>.Forbidden();
            }

            switch ((JobListingStatus)request.Status)
            {
                case JobListingStatus.Active:
                    jobListing.Activate();
                    break;
                case JobListingStatus.Paused:
                    jobListing.Pause();
                    break;
                case JobListingStatus.Closed:
                    jobListing.Close();
                    break;
                default:
                    return Result<bool>.Failure("Invalid status value.");
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPatch("/{id:guid}/status", async (
                [FromRoute] Guid id,
                [FromBody] Request request,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(id, request.Status), cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(UpdateJobListingStatus));
}
