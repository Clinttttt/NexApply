namespace NexApply.Api.Features.Profile;

internal static class ResumeStorage
{
    public static string FolderPath(string contentRootPath) =>
        Path.Combine(contentRootPath, "uploads", "resumes");

    public static string ResolveContentType(string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
}
