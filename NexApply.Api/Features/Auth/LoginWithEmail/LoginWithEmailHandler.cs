using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using System.Text.Json;

namespace NexApply.Api.Features.Auth.LoginWithEmail;

public record LoginWithEmailCommand(string IdToken) : IRequest<Result<TokenResponseDto>>;

public class LoginWithEmailHandler(IHttpClientFactory _http, AppDbContext context, TokenService tokenService) 
    : IRequestHandler<LoginWithEmailCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(LoginWithEmailCommand request, CancellationToken cancellationToken)
    {
        var http = _http.CreateClient();
        var response = await http.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={request.IdToken}", cancellationToken);
        if (!response.IsSuccessStatusCode)
            return Result<TokenResponseDto>.Failure("Invalid Google token");

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        var email = json.GetProperty("email").GetString()!;

        var user = await context.Users.FirstOrDefaultAsync(s => s.Email == email, cancellationToken);

        if (user is null)
        {
            using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            
            var baseUsername = email.Split('@')[0];
            var userName = baseUsername;
            var counter = 1;
            while (await context.Users.AnyAsync(s => s.Username == userName, cancellationToken))
            {
                userName = $"{baseUsername}{counter}";
                counter++;
            }

            // Create user with Student role by default - they can change it after login
            user = User.CreateStudent(email, userName, string.Empty);

            await context.Users.AddAsync(user, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }

        return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
    }
}
