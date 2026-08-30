using NexApply.Api.Domain.Common;

namespace NexApply.Api.Shared.Extensions;

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result) => result.Status switch
    {
        ResultStatus.Success => Results.Ok(result.Value),
        ResultStatus.Created => Results.Created(string.Empty, result.Value),
        ResultStatus.NoContent => Results.NoContent(),
        ResultStatus.Validation or ResultStatus.Failure => BadRequest(result),
        ResultStatus.Unauthorized => Results.Unauthorized(),
        ResultStatus.Forbidden => Results.StatusCode(StatusCodes.Status403Forbidden),
        ResultStatus.NotFound => Results.NotFound(),
        ResultStatus.Conflict => Results.Conflict(),
        _ => Results.StatusCode(StatusCodes.Status500InternalServerError)
    };

    private static IResult BadRequest<T>(Result<T> result) =>
        result.ValidationErrors is { Count: > 0 }
            ? Results.BadRequest(new { IsSuccess = false, Errors = result.ValidationErrors })
            : Results.BadRequest(new { IsSuccess = false, result.Error });
}
