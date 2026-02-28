using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
using DevInn.Domain.Shared.Enums;
using DevInn.Domain.Shared.ValueObjects;
using DevInn.Infrastructure.Identity.Models;
using DevInn.Infrastructure.Persistence.Context;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.SeedData;

internal sealed class DatabaseSeed(
    ApplicationDbContext appDb,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    ITenantContext tenantContext
)
{
    const int InnsToSeed = 10;
    const int CategoriesPerInn = 4;
    const int RoomsPerCategory = 8;
    const int BookingsPerRoom = 30;

    const string SuperAdminEmail = "superadmin@devinn.local";
    const string SuperAdminRole = nameof(UserRole.SuperAdmin);
    const string SuperAdminName = "SuperAdmin";
    const string InnAdminRole = nameof(UserRole.InnAdmin);
    const string Password = "ChangeIt123!";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!await roleManager.RoleExistsAsync(SuperAdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(SuperAdminRole));

        if (!await roleManager.RoleExistsAsync(InnAdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(InnAdminRole));

        if (await userManager.FindByEmailAsync(SuperAdminEmail) is null)
        {
            var superUser = new ApplicationUser(SuperAdminName, SuperAdminEmail);
            var createResult = await userManager.CreateAsync(superUser, Password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException(createResult.Errors.First().Description);

            await userManager.AddToRoleAsync(superUser, SuperAdminRole);
        }

        for (int index = 1; index <= InnsToSeed; index++)
        {
            await SeedDatabaseAsync(index, cancellationToken);
        }
    }

    private async Task SeedDatabaseAsync(int index, CancellationToken cancellationToken = default)
    {
        var innName = $"Pousada Exemplo - {index}";
        var inn = await appDb.Inns.FirstOrDefaultAsync(i => i.Name == innName, cancellationToken);

        if (inn is null)
        {
            inn = new Inn(
                innName,
                "Rua das Flores, 123",
                "São Roque de Minas",
                "Brasil",
                "MG",
                $"+55 31 90000-{index:0000}",
                $"contato{index}@pousadaexemplo.com"
            );

            await appDb.Inns.AddAsync(inn, cancellationToken);
            await appDb.SaveChangesAsync(cancellationToken);
        }

        var innId = inn.Id;
        var innAdminEmail = $"innadmin{index}@pousada.local";
        var innAdminName = $"InnAdmin-{index}";

        if (await userManager.FindByEmailAsync(innAdminEmail) is null)
        {
            var innUser = new ApplicationUser(innAdminName, innAdminEmail, innId);
            var createResult = await userManager.CreateAsync(innUser, Password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException(createResult.Errors.First().Description);

            await userManager.AddToRoleAsync(innUser, InnAdminRole);
        }

        tenantContext.SetTenant(new Tenant(innId));

        if (await appDb.RoomCategories.AnyAsync(cancellationToken))
            return;

        var random = new Random(index * 1_000);
        var seedStartDate = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero).AddDays(15);

        for (int i = 1; i <= CategoriesPerInn; i++)
        {
            var category = new RoomCategory(
                $"Standard-{index}-{i:00}",
                $"Quarto padrão categoria {i}",
                i % 2 == 0 ? 3 : 2,
                new PricingPolicy(160m + (i * 25), 45m + (i * 5))
            );

            await appDb.RoomCategories.AddAsync(category, cancellationToken);

            for (int j = 1; j <= RoomsPerCategory; j++)
            {
                var roomNumber = i * 100 + j;
                var room = new Room(category.Id, roomNumber, $"Q-{index:00}-{i:00}-{j:00}");
                room.Activate();
                await appDb.Rooms.AddAsync(room, cancellationToken);

                for (int k = 1; k <= BookingsPerRoom; k++)
                {
                    var offsetDays = ((i - 1) * RoomsPerCategory * BookingsPerRoom) + ((j - 1) * BookingsPerRoom) + (k - 1);
                    var checkIn = seedStartDate.AddDays(offsetDays * 2);
                    var totalValue = random.Next(minValue: 350, maxValue: 1_200);

                    var booking = new Booking(
                        room.Id,
                        new Guest(
                            $"Hóspede {index}-{i}-{j}-{k}",
                            $"+55 31 9{index:00}{i:00}{j:00}{k:00}",
                            $"hospede-{index}-{i}-{j}-{k}@devinn.local"
                        ),
                        new StayPeriod(checkIn, checkIn.AddDays(2)),
                        new Occupancy(2, 0, []),
                        new Money(totalValue),
                        BookingSource.Manual
                    );

                    var paymentMethod = (PaymentMethod)random.Next(0, Enum.GetValues<PaymentMethod>().Length);
                    var paymentValue = Math.Round(totalValue * random.Next(30, 80) / 100m, 2);

                    booking.AddPayment(
                        new Money(paymentValue),
                        paymentMethod,
                        checkIn.AddDays(-random.Next(1, 10)),
                        "Pagamento inicial"
                    );

                    await appDb.Bookings.AddAsync(booking, cancellationToken);
                }
            }
        }

        await appDb.SaveChangesAsync(cancellationToken);
    }
}