using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications;

internal static class NotificationsBuilder
{
    public static async Task<List<NotificationDto>> BuildAsync(AppDbContext context, Guid studentId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var soonDeadline = now.AddDays(3);

        var applications = await context.Applications
            .AsNoTracking()
            .Where(a => a.StudentId == studentId)
            .Include(a => a.JobListing)
                .ThenInclude(j => j.Company)
                    .ThenInclude(c => c.CompanyProfile)
            .ToListAsync(ct);

        var interviews = await context.Interviews
            .AsNoTracking()
            .Include(i => i.Application)
                .ThenInclude(a => a.JobListing)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.CompanyProfile)
            .Where(i => i.Application.StudentId == studentId)
            .ToListAsync(ct);

        var savedJobsClosingSoon = await context.SavedJobs
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .Include(s => s.JobListing)
                .ThenInclude(j => j.Company)
                    .ThenInclude(c => c.CompanyProfile)
            .Include(s => s.JobListing)
                .ThenInclude(j => j.Applications)
            .Where(s =>
                s.JobListing.Deadline != null
                && s.JobListing.Deadline.Value >= now
                && s.JobListing.Deadline.Value <= soonDeadline)
            .ToListAsync(ct);

        var notifications = new List<NotificationDto>();

        foreach (var app in applications)
        {
            var company = app.JobListing.Company.CompanyProfile != null
                && app.JobListing.Company.CompanyProfile.CompanyName != null
                    ? app.JobListing.Company.CompanyProfile.CompanyName
                    : app.JobListing.Company.Username;

            var position = app.JobListing.Title;
            var statusLabel = FormatApplicationStatus(app.Status);
            var createdAt = app.UpdatedAt ?? app.CreatedAt;

            notifications.Add(new NotificationDto
            {
                Id = $"application:{app.Id}:{app.Status}",
                Category = "Application",
                Title = BuildApplicationTitle(app.Status),
                Body = BuildApplicationBody(company, position, statusLabel),
                DetailBody = BuildApplicationDetailBody(company, position, statusLabel),
                CreatedAt = createdAt,
                IsRead = false,
                ActionLabel = statusLabel,
                PrimaryAction = "View Application",
                SecondaryAction = string.Empty,
                MetaItems = new Dictionary<string, string>
                {
                    ["Company"] = company,
                    ["Position"] = position,
                    ["Status"] = statusLabel,
                    ["Applied"] = app.CreatedAt.ToString("MMM d, yyyy")
                }
            });
        }

        foreach (var interview in interviews)
        {
            var app = interview.Application;
            var company = app.JobListing.Company.CompanyProfile != null
                && app.JobListing.Company.CompanyProfile.CompanyName != null
                    ? app.JobListing.Company.CompanyProfile.CompanyName
                    : app.JobListing.Company.Username;

            var position = app.JobListing.Title;
            var scheduledLocal = interview.ScheduledAt;

            notifications.Add(new NotificationDto
            {
                Id = $"interview:{interview.Id}",
                Category = "Application",
                Title = "Interview scheduled",
                Body = $"{company} has scheduled an interview for {position} on {scheduledLocal:MMM d}.",
                DetailBody =
                    $"{company} confirmed an interview for the {position} position. The interview is scheduled for {scheduledLocal:MMMM d, yyyy} at {scheduledLocal:h:mm tt}.",
                CreatedAt = interview.CreatedAt,
                IsRead = false,
                ActionLabel = "For Interview",
                PrimaryAction = "View Interview Details",
                SecondaryAction = string.Empty,
                MetaItems = new Dictionary<string, string>
                {
                    ["Company"] = company,
                    ["Position"] = position,
                    ["Interview Date"] = scheduledLocal.ToString("MMM d, yyyy"),
                    ["Time"] = scheduledLocal.ToString("h:mm tt"),
                    ["Format"] = interview.Format.ToString()
                }
            });
        }

        foreach (var saved in savedJobsClosingSoon)
        {
            var job = saved.JobListing;
            var company = job.Company.CompanyProfile != null
                && job.Company.CompanyProfile.CompanyName != null
                    ? job.Company.CompanyProfile.CompanyName
                    : job.Company.Username;

            var position = job.Title;
            var deadline = job.Deadline!.Value;
            var daysLeft = (int)Math.Ceiling((deadline - now).TotalDays);
            var applied = job.Applications.Any(a => a.StudentId == studentId);

            // If already applied, the "closing soon" alert isn't that helpful.
            if (applied) continue;

            notifications.Add(new NotificationDto
            {
                Id = $"savedjob:{saved.Id}:closing",
                Category = "Saved",
                Title = "Saved job expiring soon",
                Body = $"{position} at {company} closes in {daysLeft} day{(daysLeft == 1 ? "" : "s")}. Apply before it's gone!",
                DetailBody =
                    $"You saved the {position} listing at {company}. This listing is set to close on {deadline:MMM d, yyyy}. If you're interested, now is a good time to apply.",
                CreatedAt = saved.CreatedAt,
                IsRead = false,
                ActionLabel = "Closing soon",
                PrimaryAction = "Apply Now",
                SecondaryAction = "View Listing",
                MetaItems = new Dictionary<string, string>
                {
                    ["Company"] = company,
                    ["Position"] = position,
                    ["Closes"] = deadline.ToString("MMM d, yyyy")
                }
            });
        }

        return notifications
            .OrderByDescending(n => n.CreatedAt)
            .ToList();
    }

    private static string FormatApplicationStatus(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Submitted => "Submitted",
        ApplicationStatus.UnderReview => "Under Review",
        ApplicationStatus.Shortlisted => "Shortlisted",
        ApplicationStatus.ForInterview => "For Interview",
        ApplicationStatus.Declined => "Declined",
        ApplicationStatus.Decided => "Decided",
        _ => status.ToString()
    };

    private static string BuildApplicationTitle(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Shortlisted => "You've been shortlisted!",
        ApplicationStatus.UnderReview => "Application under review",
        ApplicationStatus.ForInterview => "Application moved to interview stage",
        ApplicationStatus.Declined => "Application update",
        ApplicationStatus.Decided => "Application decided",
        _ => "Application submitted"
    };

    private static string BuildApplicationBody(string company, string position, string statusLabel) => statusLabel switch
    {
        "Submitted" => $"Your application to {company} for {position} has been submitted successfully.",
        "Under Review" => $"{company} has moved your {position} application to Under Review.",
        "Shortlisted" => $"{company} has shortlisted you for the {position} position.",
        "For Interview" => $"{company} has moved your {position} application to the interview stage.",
        "Declined" => $"{company} has updated your application for {position}.",
        "Decided" => $"{company} has made a decision on your application for {position}.",
        _ => $"{company} updated your application for {position}."
    };

    private static string BuildApplicationDetailBody(string company, string position, string statusLabel) => statusLabel switch
    {
        "Submitted" =>
            $"Your application has been successfully submitted to {company} for the {position} position. You can track updates in My Applications.",
        "Under Review" =>
            $"Your application to {company} for the {position} position is now Under Review. This means the hiring team is actively evaluating your profile.",
        "Shortlisted" =>
            $"Congratulations! {company} reviewed your application and moved you to the Shortlisted stage. They may reach out soon to schedule an interview.",
        "For Interview" =>
            $"{company} moved your application to the interview stage. Keep an eye out for an interview schedule or messages from the recruiter.",
        "Declined" =>
            $"{company} updated your application status. You can review details and keep applying to other opportunities.",
        "Decided" =>
            $"{company} has made a decision on your application. You can review the latest status in My Applications.",
        _ => $"{company} updated your application. You can review the latest status in My Applications."
    };
}

