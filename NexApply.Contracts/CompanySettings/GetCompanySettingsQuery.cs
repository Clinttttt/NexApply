using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanySettings;

public record GetCompanySettingsQuery() : IRequest<Result<CompanySettingsDto>>;

