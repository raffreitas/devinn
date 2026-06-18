using DevInn.Application.Common.Identity.Abstractions;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Queries.GetProfile;

internal sealed class GetProfileQueryHandler(IUserContext userContext, IIdentityGateway identityGateway)
    : IQueryHandler<GetProfileQuery, Result<GetProfileResponse>>
{
    public async ValueTask<Result<GetProfileResponse>> Handle(GetProfileQuery query,
        CancellationToken cancellationToken)
    {
        var user = await identityGateway.GetUserByIdAsync(userContext.UserId, cancellationToken);
        return user.IsFailed
            ? Result.Fail(user.Errors)
            : new GetProfileResponse(user.Value.Name, user.Value.Email);
    }
}
