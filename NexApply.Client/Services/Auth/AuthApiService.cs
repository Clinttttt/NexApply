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

        public async Task<Result<TokenResponseDto>> LoginWithEmail(LoginWithEmailCommand request) => await PostAsync<LoginWithEmailCommand, TokenResponseDto>("api/auth/login-google", request);
        public async Task<Result<TokenResponseDto>> LogIn(LoginCommand request) => await PostAsync<LoginCommand, TokenResponseDto>("api/auth/login", request);
        public async Task<Result<TokenResponseDto>> Register(RegisterCommand request) => await PostAsync<RegisterCommand, TokenResponseDto>("api/auth/register", request);
        public async Task<Result<string>> SendVerificationCode(SendVerificationCodeCommand request) => await PostAsync<SendVerificationCodeCommand, string>("api/auth/send-verification-code", request);
        public async Task<Result<TokenResponseDto>> VerifyEmail(VerifyEmailCommand request) => await PostAsync<VerifyEmailCommand, TokenResponseDto>("api/auth/verify-email", request);
        public async Task<Result<TokenResponseDto>> Refresh(RefreshTokenCommand request) => await PostAsync<RefreshTokenCommand, TokenResponseDto>("api/auth/refresh", request);
    }
}
