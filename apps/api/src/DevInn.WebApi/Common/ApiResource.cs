using System.Text.Json.Serialization;

using DevInn.Application.Common.Pagination;

using Microsoft.AspNetCore.Mvc;

namespace DevInn.WebApi.Common;

public sealed record Metadata
{
    public int TotalCount { get; init; }
    public int PageSize { get; init; }
    public int CurrentPage { get; init; }
    public int TotalPages { get; init; }
    public bool HasNext => CurrentPage < TotalPages;
    public bool HasPrevious => CurrentPage > 1;

    public static Metadata FromPaginationResult<T>(PaginatedResult<T> result) => new()
    {
        TotalCount = result.TotalCount,
        PageSize = result.PageSize,
        CurrentPage = result.PageNumber,
        TotalPages = (int)Math.Ceiling(result.TotalCount / (double)result.PageSize)
    };
}

public sealed record ApiResource<T>
{
    [JsonPropertyName("data")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public T Data { get; init; }

    [JsonPropertyName("meta")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public Metadata? Metadata { get; init; }

    public ApiResource(T data)
    {
        if (data is PaginatedResult<T> paginatedResult)
        {
            Metadata = Metadata.FromPaginationResult(paginatedResult);
            Data = paginatedResult is { Items: T items } ? items : default!;
        }
        else
        {
            Data = data;
        }
    }
}

public sealed class ApiProblemDetails : ProblemDetails
{
    [JsonPropertyName("errors")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public Dictionary<string, string>? Errors { get; init; }
}