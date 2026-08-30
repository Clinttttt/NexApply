namespace NexApply.Api.Features.JobListings;

public static class JobListingsModule
{
    public static void MapJobListings(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/jobs")
            .WithTags("Job Listings");

        CreateJobListing.Map(group);
        UpdateJobListing.Map(group);
        DeleteJobListing.Map(group);
        UpdateJobListingStatus.Map(group);
        GetCompanyJobListings.Map(group);
        GetJobListingDetails.Map(group);
        GetStudentBrowseJobs.Map(group);
        GetJobBoardJobs.Map(group);
    }
}
