using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.GetConversations;

public static class GetConversationsEndpoint
{
    public static void MapGetConversations(this WebApplication app)
    {
        app.MapGet("/api/messages/conversations", [Authorize(Roles = "Company")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetConversationsQuery());
            return result.ToIResult();
        }).WithTags("Company Message");
    }
}
