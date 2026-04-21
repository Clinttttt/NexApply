using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;
using NexApply.Client.Helper;
using NexApply.Client.Interfaces;

namespace NexApply.Client.Services.Auth
{
    public class AuthApiService : HandleResponse, IAuthApiService
    {
        public AuthApiService(HttpClient http) : base(http)
        {
        }

        public async Task<Result<TokenResponseDto>> LoginWithEmail(LoginWithEmailCommand request) => await PostAsync<LoginWithEmailCommand, TokenResponseDto>("api/auth/login-email", request);
        public async Task<Result<TokenResponseDto>> LogIn(LoginCommand request) => await PostAsync<LoginCommand, TokenResponseDto>("api/auth/login", request);
        public async Task<Result<TokenResponseDto>> Refresh(RefreshTokenCommand request) => await PostAsync<RefreshTokenCommand, TokenResponseDto>("api/auth/refresh", request);
    }
}
