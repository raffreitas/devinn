using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.GetRoomICalFeed;

public sealed record GetRoomICalFeedQuery(string ExportToken) : IQuery<Result<string>>;