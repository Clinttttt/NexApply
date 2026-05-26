using System.Net;
using System.Net.Http.Json;
using NexApply.Contracts.JobListings;
using Xunit;

namespace NexApply.Tests.Integration;

public class JobBoardTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task GetJobBoardJobs_ReturnsOk()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/jobs/board");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<List<JobBoardJobDto>>();
        Assert.NotNull(body);
    }
}

