using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanyDashboard;

public record GetCompanyDashboardQuery : IRequest<Result<CompanyDashboardDto>>;
