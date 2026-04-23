using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Queries;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Client.Interfaces;

public interface IProfileApiService
{
    Task<Result<StudentProfileDto>> GetStudentProfile();
    Task<Result<StudentProfileDto>> UpdateStudentProfile(UpdateStudentProfileCommand request);
    Task<Result<ResumeUploadDto>> UploadResume(UploadResumeCommand request);
    Task<Result<ResumeContentDto>> GetResumeContent();
    Task<Result<ResumeContentDto>> UpdateResume(UpdateResumeCommand request);
}
