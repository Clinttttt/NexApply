using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanySettings;

public record UpdateCompanySettingsCommand(
    bool ApplicantUpdatesEnabled,
    bool WeeklyDigestEnabled
) : IRequest<Result<CompanySettingsDto>>;

