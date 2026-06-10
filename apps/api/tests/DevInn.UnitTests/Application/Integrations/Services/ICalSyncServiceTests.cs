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
    private readonly IChannelIntegrationRepository _integrationRepository =
        Substitute.For<IChannelIntegrationRepository>();

    private readonly IBookingRepository _bookingRepository = Substitute.For<IBookingRepository>();
    private readonly IICalService _icalService = Substitute.For<IICalService>();
    private readonly INextSyncTimeProvider _nextSyncTimeProvider = Substitute.For<INextSyncTimeProvider>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly ILogger<ICalSyncService> _logger = NullLogger<ICalSyncService>.Instance;

    private readonly ICalSyncService _sut;

    public ICalSyncServiceTests()
    {
        _nextSyncTimeProvider.GetNextSyncAt(Arg.Any<DateTimeOffset>())
            .Returns(new DateTimeOffset(2026, 03, 20, 15, 0, 0, TimeSpan.Zero));
        _bookingRepository.GetByExternalIdsAsync(
                Arg.Any<IReadOnlyCollection<string>>(),
                Arg.Any<CancellationToken>())
            .Returns([]);
        _bookingRepository.GetPotentialOverlapsAsync(
                Arg.Any<Guid>(),
                Arg.Any<DateTimeOffset>(),
                Arg.Any<DateTimeOffset>(),
                Arg.Any<CancellationToken>())
            .Returns([]);
        _bookingRepository.GetByChannelIntegrationIdAsync(
                Arg.Any<Guid>(),
                Arg.Any<DateTimeOffset?>(),
                Arg.Any<CancellationToken>())
            .Returns([]);
        _sut = new ICalSyncService(
            _integrationRepository,
            _bookingRepository,
            _icalService,
            _nextSyncTimeProvider,
            _uow,
            _logger);
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
        _bookingRepository.GetByExternalIdsAsync(
                Arg.Is<IReadOnlyCollection<string>>(ids => ids.Contains("event-1")),
                TestContext.Current.CancellationToken)
            .Returns([existingBooking]);
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
        integration.SyncStatus.NextSyncAt.ShouldBe(new DateTimeOffset(2026, 03, 20, 15, 0, 0, TimeSpan.Zero));
        await _bookingRepository.DidNotReceive().AddAsync(Arg.Any<Booking>(), Arg.Any<CancellationToken>());
        await _uow.Received().CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldReactivateCanceledImportedBlock_WhenSameUidReturns()
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
            notes: "Cancelado anteriormente",
            externalId: "event-1",
            channelIntegrationId: integration.Id);
        var updatedStart = new DateTimeOffset(2026, 03, 14, 12, 0, 0, TimeSpan.Zero);
        var updatedEnd = new DateTimeOffset(2026, 03, 15, 12, 0, 0, TimeSpan.Zero);

        existingBooking.Cancel(CancellationReason.ExternalCancellation);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Blocked", updatedStart, updatedEnd, "Retornou")
        ]);
        _bookingRepository.GetByExternalIdsAsync(
                Arg.Is<IReadOnlyCollection<string>>(ids => ids.Contains("event-1")),
                TestContext.Current.CancellationToken)
            .Returns([existingBooking]);
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns([]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        existingBooking.Status.ShouldBe(BookingStatus.Scheduled);
        existingBooking.CancellationReason.ShouldBeNull();
        existingBooking.StayPeriod.CheckIn.ShouldBe(updatedStart);
        existingBooking.StayPeriod.CheckOut.ShouldBe(updatedEnd);
        await _bookingRepository.DidNotReceive().AddAsync(Arg.Any<Booking>(), Arg.Any<CancellationToken>());
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
        _bookingRepository.GetByExternalIdsAsync(
                Arg.Is<IReadOnlyCollection<string>>(ids => ids.Contains("event-1")),
                TestContext.Current.CancellationToken)
            .Returns([existingBooking]);
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns(Array.Empty<Booking>());

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        existingBooking.StayPeriod.ShouldBe(originalStay);
        existingBooking.Source.ShouldBe(BookingSource.Manual);
        await _bookingRepository.DidNotReceive().AddAsync(Arg.Any<Booking>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldCreateNewBlock_UsingBatchLookups()
    {
        var integration = new ChannelIntegration(ChannelType.Airbnb, "https://example.com/feed.ics", Guid.NewGuid());
        var start = new DateTimeOffset(2026, 03, 14, 12, 0, 0, TimeSpan.Zero);
        var end = new DateTimeOffset(2026, 03, 15, 12, 0, 0, TimeSpan.Zero);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Blocked", start, end)
        ]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        await _bookingRepository.Received(1).GetByExternalIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new List<string> { "event-1" })),
            TestContext.Current.CancellationToken);
        await _bookingRepository.Received(1).GetPotentialOverlapsAsync(
            integration.RoomId,
            start,
            end,
            TestContext.Current.CancellationToken);
        await _bookingRepository.Received(1).AddAsync(
            Arg.Is<Booking>(booking =>
                booking.ExternalId == "event-1" &&
                booking.ChannelIntegrationId == integration.Id &&
                booking.Source == BookingSource.AirbnbIcal &&
                booking.ReconciliationStatus == BookingReconciliationStatus.NeedsReview),
            TestContext.Current.CancellationToken);
        await _bookingRepository.DidNotReceive().GetByExternalIdAsync(
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldSkipNewBlock_WhenPotentialOverlapExists()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var start = new DateTimeOffset(2026, 03, 14, 12, 0, 0, TimeSpan.Zero);
        var end = new DateTimeOffset(2026, 03, 15, 12, 0, 0, TimeSpan.Zero);
        var manualBooking = new Booking(
            roomId: integration.RoomId,
            guest: new Guest("Manual", "11999999999", "manual@test.com", "12345678900"),
            stayPeriod: new StayPeriod(start.AddHours(1), end.AddHours(-1)),
            occupancy: new Occupancy(2, 0),
            totalValue: new Money(300m),
            source: BookingSource.Manual,
            notes: "Reserva manual");

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken).Returns([
            new ICalEventDto("event-1", "Blocked", start, end)
        ]);
        _bookingRepository.GetPotentialOverlapsAsync(
                integration.RoomId,
                start,
                end,
                TestContext.Current.CancellationToken)
            .Returns([manualBooking]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(1);
        await _bookingRepository.DidNotReceive().AddAsync(Arg.Any<Booking>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldMarkFailed_WhenFeedParsingFails()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var exception = new InvalidOperationException("Feed unavailable");

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken)
            .Returns<Task<IReadOnlyList<ICalEventDto>>>(_ => throw exception);

        var thrown = await Should.ThrowAsync<InvalidOperationException>(() =>
            _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken));

        thrown.ShouldBe(exception);
        integration.SyncStatus.Status.ShouldBe(SyncStatusType.Failed);
        integration.SyncStatus.ErrorMessage.ShouldBe("Feed unavailable");
        await _uow.Received(1).CommitAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldNotCancelPastImportedBlock_WhenUidIsMissingFromFeed()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var pastBooking = new Booking(
            roomId: integration.RoomId,
            guest: null,
            stayPeriod: new StayPeriod(
                DateTimeOffset.UtcNow.AddDays(-5),
                DateTimeOffset.UtcNow.AddDays(-2)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal,
            notes: "Reserva passada",
            externalId: "past-event",
            channelIntegrationId: integration.Id);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken)
            .Returns(Array.Empty<ICalEventDto>());
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns([pastBooking]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(0);
        pastBooking.Status.ShouldBe(BookingStatus.Scheduled);
        pastBooking.CancellationReason.ShouldBeNull();
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldNotCancelOngoingImportedBlock_WhenUidIsMissingFromFeed()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var ongoingBooking = new Booking(
            roomId: integration.RoomId,
            guest: null,
            stayPeriod: new StayPeriod(
                DateTimeOffset.UtcNow.AddHours(-6),
                DateTimeOffset.UtcNow.AddHours(18)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal,
            notes: "Reserva em andamento",
            externalId: "ongoing-event",
            channelIntegrationId: integration.Id);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken)
            .Returns(Array.Empty<ICalEventDto>());
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns([ongoingBooking]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(0);
        ongoingBooking.Status.ShouldBe(BookingStatus.Scheduled);
        ongoingBooking.CancellationReason.ShouldBeNull();
    }

    [Fact]
    public async Task SyncChannelIntegrationAsync_ShouldCancelFutureImportedBlock_WhenUidIsMissingFromFeed()
    {
        var integration = new ChannelIntegration(ChannelType.Booking, "https://example.com/feed.ics", Guid.NewGuid());
        var futureBooking = new Booking(
            roomId: integration.RoomId,
            guest: null,
            stayPeriod: new StayPeriod(
                DateTimeOffset.UtcNow.AddDays(2),
                DateTimeOffset.UtcNow.AddDays(4)),
            occupancy: null,
            totalValue: new Money(0m),
            source: BookingSource.BookingIcal,
            notes: "Reserva futura",
            externalId: "future-event",
            channelIntegrationId: integration.Id);

        _integrationRepository.GetByIdAsync(integration.Id, TestContext.Current.CancellationToken).Returns(integration);
        _icalService.ParseICalFeedAsync(integration.ICalUrl, TestContext.Current.CancellationToken)
            .Returns(Array.Empty<ICalEventDto>());
        _bookingRepository.GetByChannelIntegrationIdAsync(
                integration.Id,
                Arg.Any<DateTimeOffset?>(),
                TestContext.Current.CancellationToken)
            .Returns([futureBooking]);

        var result = await _sut.SyncChannelIntegrationAsync(integration.Id, TestContext.Current.CancellationToken);

        result.ShouldBe(0);
        futureBooking.Status.ShouldBe(BookingStatus.Canceled);
        futureBooking.CancellationReason.ShouldBe(CancellationReason.ExternalCancellation);
    }
}
