using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Application.Features.Integrations.Services;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

using NSubstitute;

using Shouldly;

namespace DevInn.UnitTests.Application.Integrations.Services;

[Trait("Category", "Unit")]
[Trait("Category", "Application")]
public sealed class ICalSyncServiceTests
{
    private readonly IChannelIntegrationRepository _integrationRepository = Substitute.For<IChannelIntegrationRepository>();
    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IICalService _icalService = Substitute.For<IICalService>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly ILogger<ICalSyncService> _logger = NullLogger<ICalSyncService>.Instance;

    private readonly ICalSyncService _sut;

    public ICalSyncServiceTests()
    {
        _sut = new ICalSyncService(_integrationRepository, _bookingRepository, _icalService, _uow, _logger);
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldUpdateExistingImportedBlock()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var existingBooking = new Booking(
            roomId: Guid.NewGuid(),
            guest: null,
            stayPeriod: new StayPeriod(
                new DateTimeOffset(2026, 03, 10, 12, 0, 0, TimeSpan.Zero),
                new DateTimeOffset(2026, 03, 11, 12, 0, 0, TimeSpan.Zero)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal,
            notes: "Antigo",
            externalId: "event-1",
            channelIntegrationId: integration.Id);
        var updatedStart = new DateTimeOffset(2026, 03, 14, 12, 0, 0, TimeSpan.Zero);
        var updatedEnd = new DateTimeOffset(2026, 03, 15, 12, 0, 0, TimeSpan.Zero);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Blocked", updatedStart, updatedEnd, "Changed")
        ]);
        _bookingRepository.GetByExternalIdAsync("event-1", TestContext.Current.CancellationToken).Returns(existingBooking);
        _bookingRepository.HasOverlappingAsync(
                integration.RoomId,
                updatedStart,
                updatedEnd,
                existingBooking.Id,
                TestContext.Current.CancellationToken)
            .Returns(false);
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns([existingBooking]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        existingBooking.RoomId.ShouldBe(integration.RoomId);
        existingBooking.StayPeriod.CheckIn.ShouldBe(updatedStart);
        existingBooking.StayPeriod.CheckOut.ShouldBe(updatedEnd);
        existingBooking.Notes.ShouldBe("Blocked\nChanged");
        await _bookingRepository.DidNotReceive().AddAsync(Arg.Any<Booking>(), Arg.Any<CancellationToken>());
        await _uow.Received().CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldNotUpdateManualBookingWithSameExternalId()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var originalStay = new StayPeriod(
            new DateTimeOffset(2026, 03, 10, 12, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 03, 11, 12, 0, 0, TimeSpan.Zero));
        var existingBooking = new Booking(
            roomId: Guid.NewGuid(),
            guest: new Guest("Manual", "11999999999", "manual@test.com", "12345678900"),
            stayPeriod: originalStay,
            occupancy: new Occupancy(2, 0),
            totalValue: new Money(300m),
            source: BookingSource.Manual,
            notes: "Reserva manual",
            externalId: "event-1");
        var updatedStart = new DateTimeOffset(2026, 03, 14, 12, 0, 0, TimeSpan.Zero);
        var updatedEnd = new DateTimeOffset(2026, 03, 15, 12, 0, 0, TimeSpan.Zero);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Blocked", updatedStart, updatedEnd)
        ]);
        _bookingRepository.GetByExternalIdAsync("event-1", TestContext.Current.CancellationToken).Returns(existingBooking);
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns(Array.Empty<Booking>());

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        existingBooking.StayPeriod.ShouldBe(originalStay);
        existingBooking.Source.ShouldBe(BookingSource.Manual);
        await _bookingRepository.DidNotReceive().HasOverlappingAsync(
            integration.RoomId,
            updatedStart,
            updatedEnd,
            existingBooking.Id,
            TestContext.Current.CancellationToken);
    }
}
