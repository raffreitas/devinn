using DevInn.Application.Common.Pagination;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Integrations.Queries.ListChannelIntegrations;

public record ListChannelIntegrationsQuery(
    bool? IsActive = null,
    int PageNumber = 1,
    int PageSize = 50
) : PaginationInput(PageNumber, PageSize), IQuery<Result<PaginatedResult<ChannelIntegrationDto>>>;