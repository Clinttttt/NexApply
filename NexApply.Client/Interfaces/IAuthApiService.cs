using NexApply.Api.Common;
using NexApply.Api.Features.Auth;
using NexApply.Api.Features.Auth.Login;
using NexApply.Api.Features.Auth.LoginWithEmail;
using NexApply.Api.Features.Auth.Refresh;

namespace NexApply.Client.Interfaces
{
    public interface IAuthApiService
    {
        Task<Result<TokenResponseDto>> LoginWithEmail(LoginWithEmailCommand request);
        Task<Result<TokenResponseDto>> LogIn(LoginCommand request);
        Task<Result<TokenResponseDto>> Refresh(RefreshTokenCommand request);
    }
}
