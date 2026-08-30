namespace NexApply.Api.Features.CompanyProfile;

public static class CompanyProfileModule
{
    public static void MapCompanyProfile(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/company/profile")
            .WithTags("Company Profile")
            .RequireAuthorization(policy => policy.RequireRole("Company"));

        GetCompanyProfile.Map(group);
        UpdateCompanyProfile.Map(group);
    }
}
