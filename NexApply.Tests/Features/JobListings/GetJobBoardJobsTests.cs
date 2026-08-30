using System.Net;
using System.Net.Http.Json;
using NexApply.Api.Features.JobListings;

namespace NexApply.Tests.Features.JobListings;

public class GetJobBoardJobsTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task WithoutAuthentication_ReturnsOk()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/jobs/board");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var jobs = await response.Content.ReadFromJsonAsync<List<GetJobBoardJobs.Response>>();
        Assert.NotNull(jobs);
    }
}
