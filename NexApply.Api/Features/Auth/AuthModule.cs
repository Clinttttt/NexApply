namespace NexApply.Api.Features.Auth;

public static class AuthModule
{
    public static IServiceCollection AddAuthFeature(this IServiceCollection services)
    {
        services.AddScoped<TokenService>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        return services;
    }

    public static void MapAuth(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/auth")
            .WithTags("Auth");

        Login.Map(group);
        LoginWithGoogle.Map(group);
        RefreshToken.Map(group);
        Register.Map(group);
        SendVerificationCode.Map(group);
        VerifyEmail.Map(group);
        ForgotPassword.Map(group);
        ResetPassword.Map(group);
        ChangePassword.Map(group);
        SwitchRole.Map(group);
    }
}
