using FluentValidation;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;

public class GetCompanyApplicantsValidator : AbstractValidator<GetCompanyApplicantsQuery>
{
    public GetCompanyApplicantsValidator()
    {
        RuleFor(x => x.SortBy)
            .Must(x => string.IsNullOrWhiteSpace(x) || new[] { "Newest", "Oldest", "NameAsc", "BestMatch" }.Contains(x))
            .WithMessage("SortBy must be one of: Newest, Oldest, NameAsc, BestMatch");
    }
}
