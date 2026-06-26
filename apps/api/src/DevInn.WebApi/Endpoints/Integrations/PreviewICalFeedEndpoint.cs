using DevInn.Application.Features.Integrations.Queries.PreviewICalFeed;
using DevInn.WebApi.Common;

using Mediator;

namespace DevInn.WebApi.Endpoints.Integrations;

public sealed class PreviewICalFeedEndpoint : IEndpoint
{
    private const string Route = "api/v1/integrations/preview";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (PreviewICalFeedQuery query, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(query, ct);
                return result.ToOk();
            })
            .WithTags(Tags.Integrations)
            .WithName("Preview iCal Feed")
            .Produces<ApiResource<PreviewICalFeedResponse>>()
            .Produces<ApiProblemDetails>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
    }
}
