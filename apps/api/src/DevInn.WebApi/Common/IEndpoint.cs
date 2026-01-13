namespace DevInn.WebApi.Common;

public interface IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app);
}