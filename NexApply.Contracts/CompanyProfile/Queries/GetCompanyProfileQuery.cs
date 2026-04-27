using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Dtos;

namespace NexApply.Contracts.CompanyProfile.Queries;

public record GetCompanyProfileQuery : IRequest<Result<CompanyProfileDto>>;
