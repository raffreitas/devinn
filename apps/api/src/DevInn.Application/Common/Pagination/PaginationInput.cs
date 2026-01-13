namespace DevInn.Application.Common.Pagination;

public record PaginationInput(int PageNumber = 1, int PageSize = 10)
{
    public int Offset => (PageNumber - 1) * PageSize;
};