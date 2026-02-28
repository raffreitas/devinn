using Dapper;

using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.Errors;
using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;

using FluentResults;

using Mediator;

namespace DevInn.Application.Features.Inventory.Rooms.GetRoomICalFeed;

internal sealed class GetRoomICalFeedHandler(
    IDbConnectionFactory dbConnectionFactory,
    IICalExportService iCalExportService)
    : IQueryHandler<GetRoomICalFeedQuery, Result<string>>
{
    public async ValueTask<Result<string>> Handle(GetRoomICalFeedQuery query, CancellationToken cancellationToken)
    {
        // Validate token format
        try
        {
            _ = ICalExportToken.FromString(query.ExportToken);
        }
        catch
        {
            return Result.Fail(new NotFoundError("Feed iCal não encontrado."));
        }

        var room = await GetRoomByTokenAsync(query.ExportToken, cancellationToken);
        if (room is null)
            return Result.Fail(new NotFoundError("Feed iCal não encontrado."));

        // Query bookings for this room
        var events = await GetRoomBookingsAsync(room.Id, room.InnId, cancellationToken);
        var roomName = room.Name ?? $"Quarto {room.Number}";

        return await iCalExportService.GenerateICalFeedAsync(roomName, events, cancellationToken);
    }

    private async Task<RoomProjection?> GetRoomByTokenAsync(
        string token,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT r.id     AS "Id",
                                  r.inn_id AS "InnId",
                                  r.number AS "Number",
                                  r.name   AS "Name"
                           FROM rooms r
                           WHERE r.ical_export_token = @Token
                           LIMIT 1;
                           """;

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        return await connection.QueryFirstOrDefaultAsync<RoomProjection>(sql, new { Token = token });
    }

    private async Task<IEnumerable<ICalEventDto>> GetRoomBookingsAsync(
        Guid roomId,
        Guid innId,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT b.id         AS "Id",
                                  b.check_in   AS "CheckIn",
                                  b.check_out  AS "CheckOut",
                                  b.status     AS "Status"
                           FROM bookings b
                           WHERE b.inn_id = @InnId
                             AND b.room_id = @RoomId
                             AND b.source NOT IN (@BookingIcal, @AirbnbIcal)
                             AND b.status != @CanceledStatus
                             AND b.check_out >= @StartWindow
                             AND b.check_in <= @EndWindow
                           ORDER BY b.check_in;
                           """;

        var startWindow = DateTimeOffset.UtcNow.AddDays(-30);
        var endWindow = DateTimeOffset.UtcNow.AddDays(365);

        await using var connection = await dbConnectionFactory.OpenConnectionAsync(cancellationToken);
        var bookings = await connection.QueryAsync<BookingProjection>(sql,
            new
            {
                InnId = innId,
                RoomId = roomId,
                BookingIcal = nameof(BookingSource.BookingIcal),
                AirbnbIcal = nameof(BookingSource.AirbnbIcal),
                CanceledStatus = nameof(BookingStatus.Canceled),
                StartWindow = startWindow,
                EndWindow = endWindow
            });

        return bookings.Select(b => new ICalEventDto(
            Uid: b.Id.ToString(),
            Summary: "Reservado",
            Start: b.CheckIn,
            End: b.CheckOut,
            Description: null
        ));
    }

    private sealed record RoomProjection(Guid Id, Guid InnId, int Number, string? Name);

    private sealed record BookingProjection(
        Guid Id,
        DateTime CheckIn,
        DateTime CheckOut,
        string Status);
}