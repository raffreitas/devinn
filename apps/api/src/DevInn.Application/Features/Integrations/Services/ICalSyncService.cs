using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Aggregates.Integrations.Enums;
using DevInn.Domain.Shared.ValueObjects;

using Microsoft.Extensions.Logging;

namespace DevInn.Application.Features.Integrations.Services;

internal sealed class ICalSyncService(
    IChannelIntegrationRepository integrationRepository,
    IBookingRepository bookingRepository,
    IICalService iCalService,
    INextSyncTimeProvider nextSyncTimeProvider,
    IUnitOfWork uow,
    ILogger<ICalSyncService> logger
) : IICalSyncService
{
    private const int ReconciliationWindowDays = 30;

    public async Task<int> SyncChannelIntegrationAsync(Guid integrationId,
        CancellationToken cancellationToken = default)
    {
        var integration = await integrationRepository.GetByIdAsync(integrationId, cancellationToken);
        if (integration is null)
        {
            logger.LogWarning("Integration {IntegrationId} not found", integrationId);
            return 0;
        }

        if (!integration.IsActive)
        {
            logger.LogInformation("Integration {IntegrationId} is not active, skipping sync", integrationId);
            return 0;
        }

        try
        {
            integration.MarkSyncStarted();
            await uow.CommitAsync(cancellationToken);

            var events = await iCalService.ParseICalFeedAsync(integration.ICalUrl, cancellationToken);
            var iCalEventUids = events.Select(e => e.Uid).ToHashSet();

            var importedCount = 0;

            // Process new/existing iCal events
            foreach (var iCalEvent in events)
            {
                try
                {
                    await ProcessICalEventAsync(iCalEvent, integration, cancellationToken);
                    importedCount++;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing iCal event {EventUid} for integration {IntegrationId}",
                        iCalEvent.Uid, integrationId);
                }
            }

            // Reconcile: cancel bookings that no longer exist in iCal feed
            var canceledCount = await ReconcileBookingsAsync(integration.Id, iCalEventUids, cancellationToken);

            var nextSync = nextSyncTimeProvider.GetNextSyncAt(DateTimeOffset.UtcNow);
            integration.MarkSyncSuccess(importedCount, nextSync);
            await uow.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Successfully synced integration {IntegrationId}: {ImportedCount} imported, {CanceledCount} canceled",
                integrationId, importedCount, canceledCount);

            return importedCount;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error syncing integration {IntegrationId}", integrationId);
            integration.MarkSyncFailed(ex.Message);
            await uow.CommitAsync(cancellationToken);
            throw;
        }
    }

    private async Task<int> ReconcileBookingsAsync(
        Guid integrationId,
        HashSet<string> iCalEventUids,
        CancellationToken cancellationToken)
    {
        // Only reconcile bookings from last 30 days + future to optimize performance
        var cutoffDate = DateTimeOffset.UtcNow.AddDays(-ReconciliationWindowDays);
        var existingBookings = await bookingRepository.GetByChannelIntegrationIdAsync(
            integrationId,
            checkOutAfter: cutoffDate,
            cancellationToken);

        var bookingsToCancel = existingBookings
            .Where(b => b.ExternalId != null && !iCalEventUids.Contains(b.ExternalId))
            .ToList();

        foreach (var booking in bookingsToCancel)
        {
            booking.Cancel(CancellationReason.ExternalCancellation);

            logger.LogInformation(
                "Canceled booking {BookingId} (ExternalId: {ExternalId}) for room {RoomId} - no longer in iCal feed",
                booking.Id, booking.ExternalId, booking.RoomId);
        }

        if (bookingsToCancel.Count > 0)
        {
            await uow.CommitAsync(cancellationToken);
        }

        return bookingsToCancel.Count;
    }

    private async Task ProcessICalEventAsync(
        ICalEventDto iCalEvent,
        ChannelIntegration integration,
        CancellationToken cancellationToken)
    {
        var source = GetBookingSource(integration);
        var stay = new StayPeriod(iCalEvent.Start, iCalEvent.End);
        var notes = BuildEventNotes(iCalEvent);

        // Check if booking with this ExternalId already exists
        var existingBooking = await bookingRepository.GetByExternalIdAsync(iCalEvent.Uid, cancellationToken);

        if (existingBooking is not null)
        {
            await UpdateExistingICalBookingAsync(existingBooking, integration, iCalEvent, stay, source, notes,
                cancellationToken);
            return;
        }

        // Check for conflicts with manual bookings (policy: manual bookings have priority)
        var hasConflict = await bookingRepository.HasOverlappingAsync(
            integration.RoomId,
            iCalEvent.Start,
            iCalEvent.End,
            cancellationToken: cancellationToken);

        if (hasConflict)
        {
            logger.LogWarning(
                "Conflict detected for room {RoomId} between {Start} and {End}. Manual booking has priority. Skipping iCal event {EventUid}",
                integration.RoomId, iCalEvent.Start, iCalEvent.End, iCalEvent.Uid);
            return;
        }

        // Create booking from iCal event (blocks, not real bookings)
        var booking = new Booking(
            roomId: integration.RoomId,
            guest: null, // Blocks don't have guest information
            stayPeriod: stay,
            occupancy: null,
            totalValue: new Money(0), // iCal doesn't provide pricing
            source: source,
            notes: notes,
            externalId: iCalEvent.Uid,
            channelIntegrationId: integration.Id
        );

        await bookingRepository.AddAsync(booking, cancellationToken);

        logger.LogInformation("Created booking from iCal event {EventUid} for room {RoomId}",
            iCalEvent.Uid, integration.RoomId);
    }

    private async Task UpdateExistingICalBookingAsync(
        Booking existingBooking,
        ChannelIntegration integration,
        ICalEventDto iCalEvent,
        StayPeriod stay,
        BookingSource source,
        string? notes,
        CancellationToken cancellationToken)
    {
        if (!CanUpdateImportedBlock(existingBooking, integration))
        {
            logger.LogWarning(
                "Booking with ExternalId {ExternalId} already exists but is not an updatable imported block. Skipping sync update.",
                iCalEvent.Uid);
            return;
        }

        var hasConflict = await bookingRepository.HasOverlappingAsync(
            integration.RoomId,
            iCalEvent.Start,
            iCalEvent.End,
            existingBooking.Id,
            cancellationToken);

        if (hasConflict)
        {
            logger.LogWarning(
                "Conflict detected while updating imported block {BookingId} for event {EventUid}. Manual booking has priority. Skipping update.",
                existingBooking.Id, iCalEvent.Uid);
            return;
        }

        existingBooking.ResyncExternalBlock(integration.RoomId, stay, source, notes);

        logger.LogInformation("Updated booking from iCal event {EventUid} for room {RoomId}",
            iCalEvent.Uid, integration.RoomId);
    }

    private static BookingSource GetBookingSource(ChannelIntegration integration)
    {
        return integration.ChannelType == ChannelType.Booking
            ? BookingSource.BookingIcal
            : BookingSource.AirbnbIcal;
    }

    private static string BuildEventNotes(ICalEventDto iCalEvent)
        => string.IsNullOrWhiteSpace(iCalEvent.Description)
            ? iCalEvent.Summary
            : $"{iCalEvent.Summary}\n{iCalEvent.Description}";


    private static bool CanUpdateImportedBlock(Booking existingBooking, ChannelIntegration integration)
        => existingBooking.IsBlock
           && existingBooking.ChannelIntegrationId == integration.Id
           && existingBooking.Source is BookingSource.BookingIcal or BookingSource.AirbnbIcal;
}
