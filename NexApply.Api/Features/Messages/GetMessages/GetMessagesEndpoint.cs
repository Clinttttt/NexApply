using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.GetMessages;

public static class GetMessagesEndpoint
{
    public static void MapGetMessages(this WebApplication app)
    {
        app.MapGet("/api/messages/{otherUserId:guid}", [Authorize] async (Guid otherUserId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMessagesQuery(otherUserId));
            return result.ToIResult();
            }).WithTags("Company Message");
    }
}
