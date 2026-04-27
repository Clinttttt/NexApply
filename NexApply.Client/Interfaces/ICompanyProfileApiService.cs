using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Commands;
using NexApply.Contracts.CompanyProfile.Dtos;
using NexApply.Contracts.CompanyProfile.Queries;

namespace NexApply.Client.Interfaces;

public interface ICompanyProfileApiService
{
    Task<Result<CompanyProfileDto>> GetCompanyProfile();
    Task<Result<CompanyProfileDto>> UpdateCompanyProfile(UpdateCompanyProfileCommand request);
}
