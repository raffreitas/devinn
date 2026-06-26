using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Application.Common.Validation;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Queries.PreviewICalFeed;

internal sealed class PreviewICalFeedHandler(IICalFeedGateway iCalFeedGateway)
    : IQueryHandler<PreviewICalFeedQuery, Result<PreviewICalFeedResponse>>
{
    public async ValueTask<Result<PreviewICalFeedResponse>> Handle(
        PreviewICalFeedQuery query,
        CancellationToken cancellationToken)
    {
        var validation = query.Validate();
        if (validation.IsFailure)
            return Result.Fail(validation.ToError());

        try
        {
            var events = await iCalFeedGateway.ParseICalFeedAsync(query.ICalUrl, cancellationToken);
            var message = events.Count == 1
                ? "Link válido. Encontramos 1 evento neste calendário."
                : $"Link válido. Encontramos {events.Count} eventos neste calendário.";

            return Result.Ok(new PreviewICalFeedResponse(true, events.Count, message));
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch
        {
            return Result.Ok(new PreviewICalFeedResponse(
                false,
                0,
                "Não foi possível ler este calendário. Verifique se o link está correto e público para leitura."));
        }
    }
}
