using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class DeleteJobListing
{
    public sealed record Command(Guid JobListingId) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.JobListingId)
                .NotEmpty().WithMessage("Job listing ID is required.");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var jobListing = await context.JobListings
                .Include(listing => listing.Applications)
                .FirstOrDefaultAsync(listing => listing.Id == request.JobListingId, cancellationToken);

            if (jobListing is null)
            {
                return Result<bool>.NotFound();
            }

            if (jobListing.CompanyId != companyId)
            {
                return Result<bool>.Forbidden();
            }

            if (jobListing.Applications.Count != 0)
            {
                return Result<bool>.Conflict("This listing has applications and cannot be deleted. Close it instead.");
            }

            context.JobListings.Remove(jobListing);
            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/{id:guid}", async (
                [FromRoute] Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(id), cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(DeleteJobListing));
}
