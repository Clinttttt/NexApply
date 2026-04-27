using NexApply.Api.Features.JobListings.CreateJobListing;
using NexApply.Api.Features.JobListings.GetCompanyJobListings;
using NexApply.Api.Features.JobListings.GetJobListingDetails;
using NexApply.Api.Features.JobListings.UpdateJobListing;
using NexApply.Api.Features.JobListings.UpdateJobListingStatus;

namespace NexApply.Api.Features.JobListings;

public static class JobListingsEndpoints
{
    public static void MapJobListingsEndpoints(this WebApplication app)
    {
        app.MapCreateJobListing();
        app.MapGetJobListingDetailsEndpoint();
        app.MapUpdateJobListing();
        app.MapUpdateJobListingStatus();
        app.MapGetCompanyJobListings();
    }
}
