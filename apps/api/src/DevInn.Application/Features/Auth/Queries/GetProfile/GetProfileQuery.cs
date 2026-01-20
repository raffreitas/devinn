using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Auth.Queries.GetProfile;

public sealed record GetProfileQuery : IQuery<Result<GetProfileResponse>>;