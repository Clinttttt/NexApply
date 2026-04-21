using Microsoft.EntityFrameworkCore;
using NexApply.Contracts.Common;
using System.Security.Claims;

namespace NexApply.Api.Common
{
    public static class ResultExtensions
    {
        public static IResult ToIResult<T>(this Result<T> result)
        {
            return result.StatusCode switch
            {
                200 => Results.Ok(result.Value),
                201 => Results.Created("", result.Value),
                204 => Results.NoContent(),

                400 => result.ValidationErrors != null && result.ValidationErrors.Any()
                    ? Results.BadRequest(new
                    {
                        IsSuccess = false,
                        Errors = result.ValidationErrors
                    })
                    : Results.BadRequest(new
                    {
                        IsSuccess = false,
                        Error = result.Error
                    }),

                401 => Results.Unauthorized(),
                403 => Results.StatusCode(403),
                404 => Results.NotFound(),
                409 => Results.Conflict(),
                _ => Results.BadRequest()
            };
        }
    }
}
