using NexApply.Api.Features.Applications;
using NexApply.Api.Features.Auth;
using NexApply.Api.Features.CompanyApplicants;
using NexApply.Api.Features.CompanyDashboard;
using NexApply.Api.Features.CompanyProfile;
using NexApply.Api.Features.CompanySettings;
using NexApply.Api.Features.Interviews;
using NexApply.Api.Features.JobListings;
using NexApply.Api.Features.Messages;
using NexApply.Api.Features.Notifications;
using NexApply.Api.Features.Profile;
using NexApply.Api.Features.PublicStats;
using NexApply.Api.Features.SavedJobs;
using NexApply.Api.Features.StudentDashboard;
using NexApply.Api.Features.StudentSettings;
using NexApply.Api.Shared.Extensions;
using NexApply.Api.Shared.Middleware;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddPersistence(builder.Configuration)
    .AddApiAuthentication(builder.Configuration)
    .AddApiCors(builder.Configuration)
    .AddApiDocumentation()
    .AddAuthFeature()
    .AddProblemDetails()
    .AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseCors(CorsServices.PolicyName);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuth();
app.MapProfile();
app.MapApplications();
app.MapJobListings();
app.MapSavedJobs();
app.MapNotifications();
app.MapMessages();
app.MapInterviews();
app.MapStudentDashboard();
app.MapStudentSettings();
app.MapCompanyProfile();
app.MapCompanySettings();
app.MapCompanyDashboard();
app.MapCompanyApplicants();
app.MapPublicStats();

app.Run();

public partial class Program;
