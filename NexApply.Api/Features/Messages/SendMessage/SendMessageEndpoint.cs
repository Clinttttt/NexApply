using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.SendMessage;

public static class SendMessageEndpoint
{
    public static void MapSendMessage(this WebApplication app)
    {
        app.MapPost("/api/messages", [Authorize] async (SendMessageCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
           }).WithTags("Company Message");
    }
}
