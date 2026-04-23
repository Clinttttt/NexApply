using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Queries;
using NexApply.Contracts.Profile.Dtos;
using NexApply.Client.Helper;
using NexApply.Client.Interfaces;

namespace NexApply.Client.Services.Profile;

public class ProfileApiService : HandleResponse, IProfileApiService
{
    public ProfileApiService(HttpClient http) : base(http) { }

    public async Task<Result<StudentProfileDto>> GetStudentProfile() 
        => await GetAsync<StudentProfileDto>("api/profile/student");

    public async Task<Result<StudentProfileDto>> UpdateStudentProfile(UpdateStudentProfileCommand request) 
        => await PutAsync<UpdateStudentProfileCommand, StudentProfileDto>("api/profile/student", request);

    public async Task<Result<ResumeUploadDto>> UploadResume(UploadResumeCommand request) 
        => await PostAsync<UploadResumeCommand, ResumeUploadDto>("api/profile/resume/upload", request);

    public async Task<Result<ResumeContentDto>> GetResumeContent() 
        => await GetAsync<ResumeContentDto>("api/profile/resume/content");

    public async Task<Result<ResumeContentDto>> UpdateResume(UpdateResumeCommand request) 
        => await PutAsync<UpdateResumeCommand, ResumeContentDto>("api/profile/resume", request);
}
