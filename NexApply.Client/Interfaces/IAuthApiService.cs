using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Client.Interfaces
{
    public interface IAuthApiService
    {
        Task<Result<TokenResponseDto>> LoginWithEmail(LoginWithEmailCommand request);
        Task<Result<TokenResponseDto>> LogIn(LoginCommand request);
        Task<Result<TokenResponseDto>> Register(RegisterCommand request);
        Task<Result<string>> SendVerificationCode(SendVerificationCodeCommand request);
        Task<Result<TokenResponseDto>> VerifyEmail(VerifyEmailCommand request);
        Task<Result<TokenResponseDto>> Refresh(RefreshTokenCommand request);
    }
}
