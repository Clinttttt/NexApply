namespace NexApply.Api.Features.Messages;

public static class MessagesModule
{
    public static void MapMessages(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/messages")
            .WithTags("Messages")
            .RequireAuthorization();

        GetConversations.Map(group);
        GetMessages.Map(group);
        SendMessage.Map(group);
    }
}
