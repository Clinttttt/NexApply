using FluentValidation;
using NexApply.Contracts.CompanyDashboard;

namespace NexApply.Api.Features.CompanyDashboard.GetCompanyDashboard;

public class GetCompanyDashboardValidator : AbstractValidator<GetCompanyDashboardQuery>
{
    public GetCompanyDashboardValidator()
    {
    }
}
