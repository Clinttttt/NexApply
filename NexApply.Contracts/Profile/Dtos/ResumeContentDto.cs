using System.Text.Json.Serialization;

namespace NexApply.Contracts.Profile.Dtos;

public class ResumeContentDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
    public List<EducationDto> Education { get; set; } = [];
    public List<WorkExperienceDto> WorkExperience { get; set; } = [];
    public List<string> Skills { get; set; } = [];
}

public class EducationDto
{
    [JsonIgnore]
    public Guid Id { get; set; }
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Field { get; set; }
    public int? StartYear { get; set; }
    public int? EndYear { get; set; }
    public string? Description { get; set; }
}

public class WorkExperienceDto
{
    [JsonIgnore]
    public Guid Id { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Location { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    [JsonIgnore]
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
}
