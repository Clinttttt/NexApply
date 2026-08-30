using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Profile;

public static class UpdateStudentProfile
{
    public sealed record Command(
        string FullName,
        string? Phone,
        string? Location,
        string? University,
        string? Course,
        int? GraduationYear,
        string? LinkedIn,
        string? GitHub,
        string? Portfolio,
        string? ProfilePictureUrl) : IRequest<Result<StudentProfileResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.FullName).NotEmpty().MaximumLength(100);

            RuleFor(command => command.Phone)
                .MaximumLength(20)
                .When(command => !string.IsNullOrEmpty(command.Phone));

            RuleFor(command => command.Location)
                .MaximumLength(100)
                .When(command => !string.IsNullOrEmpty(command.Location));

            RuleFor(command => command.University)
                .MaximumLength(200)
                .When(command => !string.IsNullOrEmpty(command.University));

            RuleFor(command => command.Course)
                .MaximumLength(200)
                .When(command => !string.IsNullOrEmpty(command.Course));

            RuleFor(command => command.GraduationYear)
                .InclusiveBetween(1950, 2100)
                .When(command => command.GraduationYear.HasValue);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<StudentProfileResponse>>
    {
        public async Task<Result<StudentProfileResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<StudentProfileResponse>.NotFound("Profile not found");
            }

            profile.UpdateProfile(
                request.FullName,
                request.Phone,
                request.Location,
                request.University,
                request.Course,
                request.GraduationYear,
                request.LinkedIn,
                request.GitHub,
                request.Portfolio,
                request.ProfilePictureUrl);

            await context.SaveChangesAsync(cancellationToken);

            return Result<StudentProfileResponse>.Success(new StudentProfileResponse
            {
                FullName = profile.FullName,
                Phone = profile.Phone,
                Location = profile.Location,
                University = profile.University,
                Course = profile.Course,
                GraduationYear = profile.GraduationYear,
                LinkedIn = profile.LinkedIn,
                GitHub = profile.GitHub,
                Portfolio = profile.Portfolio,
                ResumeFilePath = profile.ResumeFilePath,
                ProfilePictureUrl = profile.ProfilePictureUrl
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/student", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateStudentProfile))
            .Accepts<Command>("application/json")
            .Produces<StudentProfileResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
}
