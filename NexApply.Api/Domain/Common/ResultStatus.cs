namespace NexApply.Api.Domain.Common;

public enum ResultStatus
{
    Success,
    Created,
    NoContent,
    Validation,
    Failure,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Unexpected
}
