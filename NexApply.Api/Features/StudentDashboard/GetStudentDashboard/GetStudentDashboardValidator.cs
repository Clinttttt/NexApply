using FluentValidation;
using NexApply.Contracts.StudentDashboard;

namespace NexApply.Api.Features.StudentDashboard.GetStudentDashboard;

public class GetStudentDashboardValidator : AbstractValidator<GetStudentDashboardQuery>
{
    public GetStudentDashboardValidator()
    {
    }
}
