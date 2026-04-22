using DevInn.Application.Features.Inventory.Queries.Rooms.GetRoomICalFeed;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.ICal;

public sealed class GetRoomICalFeedEndpoint : IEndpoint
{
    private const string Route = "api/ical/{exportToken}";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(Route, async (string exportToken, ISender sender, CancellationToken ct) =>
            {
                var query = new GetRoomICalFeedQuery(exportToken);
                var iCalContent = await sender.Send(query, ct);

                if (iCalContent.IsFailed)
                    return TypedResults.NotFound();

                return Results.Content(
                    content: iCalContent.Value,
                    contentType: "text/calendar; charset=utf-8",
                    statusCode: StatusCodes.Status200OK);
            })
            .WithTags("ICal")
            .WithName("Get Room iCal Feed")
            .Produces(StatusCodes.Status200OK, contentType: "text/calendar")
            .Produces(StatusCodes.Status404NotFound)
            .AllowAnonymous();
    }
}
