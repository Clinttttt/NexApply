using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Profile;

public static class UploadResume
{
    private const long MaxFileSizeInBytes = 5 * 1024 * 1024;

    public sealed record Command(string FileName, string ContentType, byte[] FileData) : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string FilePath { get; init; } = string.Empty;
        public string ParsedText { get; init; } = string.Empty;
    }

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.FileName).NotEmpty();

            RuleFor(command => command.FileData)
                .NotEmpty()
                .Must(fileData => fileData.Length <= MaxFileSizeInBytes)
                .WithMessage("File size must not exceed 5MB");

            RuleFor(command => command.ContentType)
                .Must(ResumeTextExtractor.IsSupported)
                .WithMessage("Only PDF, DOCX, and image files are allowed");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment environment)
        : IRequestHandler<Command, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<Response>.NotFound("Profile not found");
            }

            var folder = ResumeStorage.FolderPath(environment.ContentRootPath);
            Directory.CreateDirectory(folder);

            var fileName = $"{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{Path.GetExtension(request.FileName)}";
            await File.WriteAllBytesAsync(Path.Combine(folder, fileName), request.FileData, cancellationToken);

            var parsedText = ResumeTextExtractor.Extract(request.ContentType, request.FileData, request.FileName);

            profile.UpdateResume(fileName, parsedText);
            await context.SaveChangesAsync(cancellationToken);

            return Result<Response>.Success(new Response
            {
                FilePath = fileName,
                ParsedText = parsedText
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/resume/upload", async (
                IFormFile file,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await using var stream = file.OpenReadStream();
                using var buffer = new MemoryStream();
                await stream.CopyToAsync(buffer, cancellationToken);

                var command = new Command(file.FileName, file.ContentType, buffer.ToArray());
                var result = await sender.Send(command, cancellationToken);

                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .DisableAntiforgery()
            .WithName(nameof(UploadResume))
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<Response>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
}
