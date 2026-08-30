namespace NexApply.Api.Domain.Common;

public sealed class Result<T>
{
    private Result(
        bool isSuccess,
        T? value,
        ResultStatus status,
        string? error,
        IReadOnlyDictionary<string, string[]>? validationErrors)
    {
        IsSuccess = isSuccess;
        Value = value;
        Status = status;
        Error = error;
        ValidationErrors = validationErrors;
    }

    public bool IsSuccess { get; }
    public T? Value { get; }
    public ResultStatus Status { get; }
    public string? Error { get; }
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; }

    public static Result<T> Success(T value) =>
        new(true, value, ResultStatus.Success, null, null);

    public static Result<T> Created(T value) =>
        new(true, value, ResultStatus.Created, null, null);

    public static Result<T> NoContent() =>
        new(true, default, ResultStatus.NoContent, null, null);

    public static Result<T> Failure(string error) =>
        new(false, default, ResultStatus.Failure, error, null);

    public static Result<T> ValidationFailure(IReadOnlyDictionary<string, string[]> errors) =>
        new(
            false,
            default,
            ResultStatus.Validation,
            string.Join("; ", errors.Values.SelectMany(messages => messages)),
            errors);

    public static Result<T> NotFound(string? error = null) =>
        new(false, default, ResultStatus.NotFound, error, null);

    public static Result<T> Unauthorized(string? error = null) =>
        new(false, default, ResultStatus.Unauthorized, error, null);

    public static Result<T> Forbidden(string? error = null) =>
        new(false, default, ResultStatus.Forbidden, error, null);

    public static Result<T> Conflict(string? error = null) =>
        new(false, default, ResultStatus.Conflict, error, null);

    public static Result<T> InternalServerError(string? error = null) =>
        new(false, default, ResultStatus.Unexpected, error, null);
}
