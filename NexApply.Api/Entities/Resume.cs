namespace NexApply.Api.Entities;

public class Resume : BaseEntity
{
    public Guid StudentProfileId { get; private set; }
    public string? Headline { get; private set; }
    public string? AboutMe { get; private set; }
    public string EducationJson { get; private set; } = "[]";
    public string WorkExperienceJson { get; private set; } = "[]";
    public string SkillsJson { get; private set; } = "[]";

    public StudentProfile StudentProfile { get; private set; } = null!;

    private Resume() { }

    public static Resume Create(Guid studentProfileId)
    {
        return new Resume
        {
            StudentProfileId = studentProfileId,
            Headline = null,
            AboutMe = null,
            EducationJson = "[]",
            WorkExperienceJson = "[]",
            SkillsJson = "[]"
        };
    }

    public void UpdateContent(string? headline, string? aboutMe, string educationJson, string workExperienceJson, string skillsJson)
    {
        Headline = headline;
        AboutMe = aboutMe;
        EducationJson = educationJson;
        WorkExperienceJson = workExperienceJson;
        SkillsJson = skillsJson;
    }
}
