using System.Text.Json.Serialization;

namespace NexApply.Api.Features.Profile;

public sealed class ResumeContent
{
    public string? FullName { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Location { get; init; }
    public string? Headline { get; init; }
    public string? AboutMe { get; init; }
    public List<ResumeEducation> Education { get; init; } = [];
    public List<ResumeWorkExperience> WorkExperience { get; init; } = [];
    public List<string> Skills { get; init; } = [];
}

public sealed class ResumeEducation
{
    [JsonIgnore]
    public Guid Id { get; init; }

    public string Institution { get; init; } = string.Empty;
    public string Degree { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Field { get; init; }

    public int? StartYear { get; init; }
    public int? EndYear { get; init; }
    public string? Description { get; init; }
}

public sealed class ResumeWorkExperience
{
    [JsonIgnore]
    public Guid Id { get; init; }

    public string Company { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Location { get; init; }

    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }

    [JsonIgnore]
    public bool IsCurrent { get; init; }

    public string? Description { get; init; }
}
