using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanyApplicants;

public record GetCompanyApplicantsQuery(
    string? Status = null,
    string? JobListingId = null,
    string? SearchTerm = null,
    string? SortBy = "Newest"
) : IRequest<Result<List<ApplicantDto>>>;
