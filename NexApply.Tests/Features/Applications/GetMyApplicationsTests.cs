using System.Net;
using System.Net.Http.Json;
using NexApply.Api.Features.Applications;

namespace NexApply.Tests.Features.Applications;

public class GetMyApplicationsTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task WithValidStudentToken_ReturnsApplications()
    {
        var client = factory.CreateClient();

        await TestDatabase.AddStudentWithApplicationAsync(
            "apps_student",
            "apps_company",
            "Frontend Engineer Intern");

        await TestDatabase.AuthenticateAsync(client, "apps_student@test.com");

        var response = await client.GetAsync("/api/applications");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var applications = await response.Content.ReadFromJsonAsync<List<GetMyApplications.Response>>();
        Assert.NotNull(applications);
        Assert.NotEmpty(applications);
        Assert.Equal("Submitted", applications[0].Status);
    }
}
