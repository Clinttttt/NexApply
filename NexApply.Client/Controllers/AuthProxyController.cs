using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NexApply.Contracts.Auth;
using NexApply.Client.Interfaces;
using System.Security.Claims;

namespace NexApply.Client.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthProxyController(IAuthApiService authApiService) : ControllerBase
    {
         [HttpPost("login-google")]
          public async Task<ActionResult<TokenResponseDto>> LoginWithGoogle([FromBody] LoginWithEmailCommand command)
          {
            var result = await authApiService.LoginWithEmail(command);  
            if(result.IsSuccess || result.Value == null)
            {
                return Unauthorized(401);
            }
            var claims = new List<Claim>
            {
                new Claim("AccessToken",result.Value.AccessToken!),
                new Claim("RefreshToken", result.Value.RefreshToken!)
            };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };
            await HttpContext.SignInAsync
                (CookieAuthenticationDefaults.AuthenticationScheme, 
                new ClaimsPrincipal(claimsIdentity), authProperties);
            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginCommand command)
        {
            var result = await authApiService.LogIn(command);
            if (result.IsSuccess || result.Value == null)
            {
                return Unauthorized(401);
            }
            var claims = new List<Claim>
            {
                new Claim("AccessToken",result.Value.AccessToken!),
                new Claim("RefreshToken", result.Value.RefreshToken!)
            };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };
            await HttpContext.SignInAsync
                (CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity), authProperties);
            return Ok();
        }
        [HttpPost("refresh")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken([FromBody] RefreshTokenCommand command)
        {
            var result = await authApiService.Refresh(command);
            if (!result.IsSuccess || result.Value == null)
                return Unauthorized();

            var claims = new List<Claim>
        {
            new Claim("AccessToken", result.Value.AccessToken!),
            new Claim("RefreshToken", result.Value.RefreshToken!)
        };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            return Ok(result.Value.AccessToken);

        }
    }

}