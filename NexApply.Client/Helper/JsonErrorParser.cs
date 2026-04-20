using Microsoft.AspNetCore.Authentication;
using System.Text.Json;

namespace NexApply.Client.Helper
{
    public static class JsonErrorParser
    {
        public static string ExtractMessage(JsonElement element)
            => element.EnumerateObject()
            .SelectMany(s => s.Value.EnumerateArray().Select(s => s.GetString()))
            .Where(m => !string.IsNullOrEmpty(m))
            .ToList() is { Count: > 0 } messages
            ? string.Join(", ", messages) : string.Empty;
        public static Dictionary<string, string[]> ValidationErrorHandler(JsonElement error)
        {
            if (error.TryGetProperty("error", out var errorProp) && errorProp.ValueKind == JsonValueKind.Object)
            {
                var errors = errorProp.EnumerateObject()
                    .Select(s => new
                    {
                        Key = s.Name,
                        Messages = s.Value.EnumerateArray()
                       .Select(s => s.GetString()).Where(s => string.IsNullOrEmpty(s)).OfType<string>().ToArray()

                    })
                    .Where(s => s.Messages.Any())
                    .ToDictionary(s => s.Key, s => s.Messages);
                if (errors.Any())
                    return errors;

            }
            return new Dictionary<string, string[]> { { "BadRequest", ["400"] } };
        }
    }
}
