namespace NexApply.Api.Domain;

public static class SalaryRange
{
    private const string Unspecified = "Not specified";

    public static string Format(decimal? salaryMin, decimal? salaryMax)
    {
        if (salaryMin.HasValue && salaryMax.HasValue)
        {
            return $"PHP {salaryMin.Value:N0} - PHP {salaryMax.Value:N0}";
        }

        if (salaryMin.HasValue)
        {
            return $"From PHP {salaryMin.Value:N0}";
        }

        if (salaryMax.HasValue)
        {
            return $"Up to PHP {salaryMax.Value:N0}";
        }

        return Unspecified;
    }
}
