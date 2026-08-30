using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.SavedJobs;

public static class SaveJob
{
    public sealed record Command(Guid JobListingId) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.JobListingId).NotEmpty();
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<bool>.NotFound("Student profile not found");
            }

            var jobExists = await context.JobListings
                .AnyAsync(listing => listing.Id == request.JobListingId, cancellationToken);

            if (!jobExists)
            {
                return Result<bool>.NotFound("Job listing not found");
            }

            var alreadySaved = await context.SavedJobs.AnyAsync(
                saved => saved.StudentId == student.Id && saved.JobListingId == request.JobListingId,
                cancellationToken);

            if (alreadySaved)
            {
                return Result<bool>.Conflict("Job already saved");
            }

            context.SavedJobs.Add(SavedJob.Create(student.Id, request.JobListingId));
            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(SaveJob));
}
