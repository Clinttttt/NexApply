using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace NexApply.Api.Shared.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is ValidationException validationException)
        {
            await WriteValidationProblemAsync(httpContext, validationException, cancellationToken);
            return true;
        }

        logger.LogError(
            exception,
            "Unhandled exception while processing {Method} {Path}",
            httpContext.Request.Method,
            httpContext.Request.Path);

        await WriteUnexpectedProblemAsync(httpContext, cancellationToken);
        return true;
    }

    private static Task WriteValidationProblemAsync(
        HttpContext httpContext,
        ValidationException exception,
        CancellationToken cancellationToken)
    {
        httpContext.Response.ContentType = "application/json";
        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        var error = exception.Errors
            .GroupBy(failure => failure.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(failure => failure.ErrorMessage).ToArray());

        var payload = new
        {
            type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            message = "Validation failed",
            title = "One or more validation errors occurred.",
            status = StatusCodes.Status400BadRequest,
            error
        };

        return httpContext.Response.WriteAsync(JsonSerializer.Serialize(payload, SerializerOptions), cancellationToken);
    }

    private static Task WriteUnexpectedProblemAsync(HttpContext httpContext, CancellationToken cancellationToken)
    {
        httpContext.Response.ContentType = "application/json";
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var payload = new
        {
            type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            message = "An unexpected error occurred.",
            title = "Internal Server Error",
            status = StatusCodes.Status500InternalServerError
        };

        return httpContext.Response.WriteAsync(JsonSerializer.Serialize(payload, SerializerOptions), cancellationToken);
    }
}
