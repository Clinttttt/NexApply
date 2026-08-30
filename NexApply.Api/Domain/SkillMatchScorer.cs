using System.Text.Json;
using System.Text.RegularExpressions;

namespace NexApply.Api.Domain;

public static class SkillMatchScorer
{
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public static int CalculateMatchScore(string? requiredSkillsRaw, StudentProfile student)
    {
        if (student is null)
        {
            return 0;
        }

        var requiredSkills = ParseSkills(requiredSkillsRaw);
        if (requiredSkills.Count == 0)
        {
            return 0;
        }

        var resumeSkills = GetResumeSkills(student);
        var searchableResumeText = BuildSearchableResumeText(student, resumeSkills);

        var matchedCount = requiredSkills.Count(skill => IsSkillMatched(skill, resumeSkills, searchableResumeText));
        return (int)Math.Round((double)matchedCount / requiredSkills.Count * 100, MidpointRounding.AwayFromZero);
    }

    public static List<string> GetSkillsFromJson(string? skillsJson)
    {
        if (string.IsNullOrWhiteSpace(skillsJson))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(skillsJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static List<string> ParseSkills(string? requiredSkillsRaw)
    {
        if (string.IsNullOrWhiteSpace(requiredSkillsRaw))
        {
            return [];
        }

        return requiredSkillsRaw
            .Split([',', ';', '|', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(skill => WhitespaceRegex.Replace(skill, " "))
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static List<string> GetResumeSkills(StudentProfile student)
    {
        if (!string.IsNullOrWhiteSpace(student.ResumeFilePath) && HasMeaningfulUploadedResumeText(student.ParsedResumeText))
        {
            return [];
        }

        if (student.Resume is null || string.IsNullOrWhiteSpace(student.Resume.SkillsJson))
        {
            return [];
        }

        return GetSkillsFromJson(student.Resume.SkillsJson);
    }

    public static string BuildSearchableResumeText(StudentProfile student, List<string> resumeSkills)
    {
        if (!string.IsNullOrWhiteSpace(student.ResumeFilePath) && HasMeaningfulUploadedResumeText(student.ParsedResumeText))
        {
            return Normalize(student.ParsedResumeText!);
        }

        var parts = new[]
        {
            student.ParsedResumeText,
            student.Resume?.Headline,
            student.Resume?.AboutMe,
            string.Join(' ', resumeSkills),
            student.Resume?.EducationJson,
            student.Resume?.WorkExperienceJson
        };

        return Normalize(string.Join(' ', parts.Where(part => !string.IsNullOrWhiteSpace(part))));
    }

    public static bool IsSkillMatched(string requiredSkill, List<string> resumeSkills, string searchableResumeText)
    {
        var normalizedRequired = Normalize(requiredSkill);
        if (string.IsNullOrWhiteSpace(normalizedRequired))
        {
            return false;
        }

        var requiredVariants = GetSkillVariants(normalizedRequired);

        return resumeSkills.Any(skill =>
            {
                var resumeVariants = GetSkillVariants(Normalize(skill));
                return requiredVariants.Any(required => resumeVariants.Any(resume => SkillsEquivalent(required, resume)));
            })
            || requiredVariants.Any(variant => ContainsSkill(searchableResumeText, variant));
    }

    private static bool SkillsEquivalent(string requiredSkill, string resumeSkill)
    {
        return requiredSkill == resumeSkill
            || requiredSkill.Contains(resumeSkill, StringComparison.OrdinalIgnoreCase)
            || resumeSkill.Contains(requiredSkill, StringComparison.OrdinalIgnoreCase);
    }

    private static bool ContainsSkill(string resumeText, string requiredSkill)
    {
        return Regex.IsMatch(resumeText, $@"(^|[^a-z0-9+#.]){Regex.Escape(requiredSkill)}([^a-z0-9+#.]|$)", RegexOptions.IgnoreCase);
    }

    private static bool HasMeaningfulUploadedResumeText(string? parsedResumeText)
    {
        if (string.IsNullOrWhiteSpace(parsedResumeText))
        {
            return false;
        }

        var normalized = Normalize(parsedResumeText);
        return !normalized.StartsWith("uploaded resume image:", StringComparison.OrdinalIgnoreCase)
            && !normalized.StartsWith("uploaded resume:", StringComparison.OrdinalIgnoreCase)
            && normalized.Length >= 20;
    }

    private static HashSet<string> GetSkillVariants(string skill)
    {
        var variants = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { skill };
        variants.Add(skill.Replace(" ", string.Empty));

        if (skill.EndsWith(" apis", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add(skill[..^1]);
        }

        if (skill.EndsWith(" api", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add($"{skill}s");
        }

        if (skill is "c#" or "c sharp" or "csharp")
        {
            variants.Add("c#");
            variants.Add("c sharp");
            variants.Add("csharp");
        }

        if (skill.StartsWith(".net", StringComparison.OrdinalIgnoreCase) || skill.StartsWith("dotnet", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add(".net");
            variants.Add("dotnet");
            variants.Add(skill.Replace(".net", "dotnet", StringComparison.OrdinalIgnoreCase));
            variants.Add(skill.Replace("dotnet", ".net", StringComparison.OrdinalIgnoreCase));
        }

        if (skill.Contains("javascript", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add(skill.Replace("javascript", "js", StringComparison.OrdinalIgnoreCase));
        }

        if (skill.Contains("typescript", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add(skill.Replace("typescript", "ts", StringComparison.OrdinalIgnoreCase));
        }

        return variants;
    }

    private static string Normalize(string value)
    {
        return WhitespaceRegex.Replace(value.Trim().ToLowerInvariant(), " ");
    }
}
