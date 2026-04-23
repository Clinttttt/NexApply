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
            if(!result.IsSuccess || result.Value == null)
            {
                return Unauthorized();
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
            return Ok(result.Value);
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginCommand command)
        {
            var result = await authApiService.LogIn(command);
            if (!result.IsSuccess || result.Value == null)
            {
                return Unauthorized();
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
            return Ok(result.Value);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            var result = await authApiService.Register(command);
            if (!result.IsSuccess)
            {
                // Return detailed error with validation errors if available
                if (result.ValidationErrors != null && result.ValidationErrors.Any())
                {
                    var errors = string.Join(", ", result.ValidationErrors.SelectMany(e => e.Value));
                    return BadRequest(new { error = errors });
                }
                return BadRequest(new { error = result.Error ?? "Registration failed" });
            }
            return Ok(new { message = "Registration successful. Please check your email for verification code." });
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult<TokenResponseDto>> VerifyEmail([FromBody] VerifyEmailCommand command)
        {
            var result = await authApiService.VerifyEmail(command);
            if (!result.IsSuccess || result.Value == null)
            {
                return BadRequest(new { error = result.Error });
            }
            
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
            
            return Ok(result.Value);
        }

        [HttpPost("send-verification-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeCommand command)
        {
            var result = await authApiService.SendVerificationCode(command);
            if (!result.IsSuccess)
            {
                return BadRequest(new { error = result.Error });
            }
            return Ok(new { message = result.Value });
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

            return Ok(result.Value);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
        }
    }
}