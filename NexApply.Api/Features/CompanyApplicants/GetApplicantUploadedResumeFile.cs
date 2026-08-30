using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;

namespace NexApply.Api.Features.CompanyApplicants;

public static class GetApplicantUploadedResumeFile
{
    public sealed record Query(Guid ApplicationId) : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string FileName { get; init; } = string.Empty;
        public string ContentType { get; init; } = "application/octet-stream";
        public byte[] FileData { get; init; } = [];
    }

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.ApplicationId).NotEmpty();
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment environment)
        : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var application = await context.Applications
                .AsNoTracking()
                .Include(candidate => candidate.Student)
                .Include(candidate => candidate.JobListing)
                .FirstOrDefaultAsync(
                    candidate => candidate.Id == request.ApplicationId
                        && candidate.JobListing.CompanyId == companyId,
                    cancellationToken);

            if (application is null)
            {
                return Result<Response>.NotFound();
            }

            var resumeFileName = application.Student.ResumeFilePath;
            if (string.IsNullOrWhiteSpace(resumeFileName))
            {
                return Result<Response>.NotFound("No uploaded resume found");
            }

            var filePath = Path.Combine(environment.ContentRootPath, "uploads", "resumes", resumeFileName);
            if (!File.Exists(filePath))
            {
                return Result<Response>.NotFound("Uploaded resume file not found");
            }

            return Result<Response>.Success(new Response
            {
                FileName = resumeFileName,
                ContentType = ResolveContentType(resumeFileName),
                FileData = await File.ReadAllBytesAsync(filePath, cancellationToken)
            });
        }

        private static string ResolveContentType(string fileName) =>
            Path.GetExtension(fileName).ToLowerInvariant() switch
            {
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{applicationId:guid}/resume/uploaded-file", async (
                Guid applicationId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(applicationId), cancellationToken);

                return result.IsSuccess && result.Value is not null
                    ? Results.File(result.Value.FileData, result.Value.ContentType, result.Value.FileName)
                    : Results.NotFound(new { result.Error });
            })
            .WithName(nameof(GetApplicantUploadedResumeFile));
}
