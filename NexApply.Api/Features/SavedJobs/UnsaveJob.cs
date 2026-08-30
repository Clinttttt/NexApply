using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.SavedJobs;

public static class UnsaveJob
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

            var savedJob = await context.SavedJobs.FirstOrDefaultAsync(
                saved => saved.StudentId == student.Id && saved.JobListingId == request.JobListingId,
                cancellationToken);

            if (savedJob is null)
            {
                return Result<bool>.NotFound("Saved job not found");
            }

            context.SavedJobs.Remove(savedJob);
            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/{jobListingId:guid}", async (
                Guid jobListingId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(jobListingId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UnsaveJob));
}
