using DevInn.Application.Common.Data.Abstractions;
using DevInn.Application.Common.ICal.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Abstractions;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.Abstractions;
using DevInn.Domain.Shared.ValueObjects;

using Microsoft.Extensions.Logging;

namespace DevInn.Application.Features.Integrations.Services;

internal sealed class ICalSyncService(
    IChannelIntegrationRepository integrationRepository,
    IBookingRepository bookingRepository,
    IICalService iCalService,
    IUnitOfWork uow,
    ILogger<ICalSyncService> logger
) : IICalSyncService
{
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
            var importedCount = 0;

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

            var nextSync = DateTimeOffset.UtcNow.AddHours(3);
            integration.MarkSyncSuccess(importedCount, nextSync);
            await uow.CommitAsync(cancellationToken);

            logger.LogInformation("Successfully synced {Count} bookings for integration {IntegrationId}",
                importedCount, integrationId);

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

    private async Task ProcessICalEventAsync(
        ICalEventDto iCalEvent,
        ChannelIntegration integration,
        CancellationToken cancellationToken)
    {
        // Check if booking with this ExternalId already exists
        var existingBooking = await FindBookingByExternalIdAsync(iCalEvent.Uid, cancellationToken);

        if (existingBooking is not null)
        {
            logger.LogDebug("Booking with ExternalId {ExternalId} already exists, skipping", iCalEvent.Uid);
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

        // Create booking from iCal event
        var source = integration.ChannelType == Domain.Aggregates.Integrations.Enums.ChannelType.Booking
            ? BookingSource.BookingIcal
            : BookingSource.AirbnbIcal;

        var guest = new Guest(
            Name: iCalEvent.Summary,
            Phone: "N/A", // iCal doesn't provide phone
            Email: null,
            Document: null,
            BirthDate: null
        );

        var stay = new StayPeriod(iCalEvent.Start, iCalEvent.End);
        var occupancy = new Occupancy(1, 0, null); // iCal doesn't provide occupancy details

        var booking = new Booking(
            roomId: integration.RoomId,
            guest: guest,
            stayPeriod: stay,
            occupancy: occupancy,
            totalValue: new Money(0), // iCal doesn't provide pricing
            source: source,
            notes: iCalEvent.Description,
            externalId: iCalEvent.Uid,
            channelIntegrationId: integration.Id
        );

        await bookingRepository.AddAsync(booking, cancellationToken);

        logger.LogInformation("Created booking from iCal event {EventUid} for room {RoomId}",
            iCalEvent.Uid, integration.RoomId);
    }

    private async Task<Booking?> FindBookingByExternalIdAsync(string externalId, CancellationToken cancellationToken)
    {
        return await bookingRepository.GetByExternalIdAsync(externalId, cancellationToken);
    }
}