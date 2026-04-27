using NexApply.Client.Helper;
using NexApply.Client.Interfaces;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Commands;
using NexApply.Contracts.CompanyProfile.Dtos;

namespace NexApply.Client.Services.CompanyProfile;

public class CompanyProfileApiService : HandleResponse, ICompanyProfileApiService
{
    public CompanyProfileApiService(HttpClient http) : base(http) { }

    public async Task<Result<CompanyProfileDto>> GetCompanyProfile()
        => await GetAsync<CompanyProfileDto>("api/company/profile");

    public async Task<Result<CompanyProfileDto>> UpdateCompanyProfile(UpdateCompanyProfileCommand request)
        => await PutAsync<UpdateCompanyProfileCommand, CompanyProfileDto>("api/company/profile", request);
}
