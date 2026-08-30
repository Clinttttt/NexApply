namespace NexApply.Api.Domain.Enums;

public static class WorkSetupExtensions
{
    public static string ToDisplayName(this WorkSetup workSetup) => workSetup switch
    {
        WorkSetup.OnSite => "On-site",
        WorkSetup.Remote => "Remote",
        WorkSetup.Hybrid => "Hybrid",
        _ => workSetup.ToString()
    };
}
