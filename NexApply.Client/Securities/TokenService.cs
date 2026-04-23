namespace NexApply.Client.Securities
{
    public  class TokenService
    {
        private string? _accessToken;
        private string? _refreshToken;
        
        public void SetToken(string accessToken) => _accessToken = accessToken;
        public string? GetToken() => _accessToken;
        
        public Task SetTokensAsync(string? accessToken, string? refreshToken)
        {
            _accessToken = accessToken;
            _refreshToken = refreshToken;
            return Task.CompletedTask;
        }
        
        public string? GetRefreshToken() => _refreshToken;
    }
}
