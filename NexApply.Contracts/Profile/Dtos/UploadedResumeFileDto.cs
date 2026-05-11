namespace NexApply.Contracts.Profile.Dtos;

public class UploadedResumeFileDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public byte[] FileData { get; set; } = [];
}
