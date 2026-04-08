using FluentValidation;
using NpgsqlTypes;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace NexApply.Api.Common.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                await HandlingValidationException(context, ex);
            }
            catch (Exception ex)
            {
                await HandlingException(context, ex);
            }
        }
        public static Task HandlingValidationException(HttpContext context, ValidationException exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status400BadRequest;

            var error = exception.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray());

            var response = new
            {
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                message = "Validation failed",
                title = "One or more validation errors occurred.",
                status = 400,
                error
            };
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
        public static Task HandlingException(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            var response = new
            {
                type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                message = "An unexpected error occurred.",
                title = "Internal Server Error",
                status = 500,
                error = exception.Message
            };
            return context.Response.WriteAsync(JsonSerializer.Serialize(response));

        }
    }
}
