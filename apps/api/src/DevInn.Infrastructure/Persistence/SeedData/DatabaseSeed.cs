using DevInn.Application.Common.Identity;
using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Enums;
using DevInn.Domain.Aggregates.Bookings.ValueObjects;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;
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
    const string SuperAdminEmail = "superadmin@devinn.local";
    const string SuperAdminRole = nameof(UserRole.SuperAdmin);
    const string SuperAdminName = "SuperAdmin";
    const string InnAdminEmail = "innadmin@pousada.local";
    const string InnAdminRole = nameof(UserRole.InnAdmin);
    const string InnAdminName = "InnAdmin";
    const string Password = "ChangeIt123!";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        // Create roles
        if (!await roleManager.RoleExistsAsync(SuperAdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(SuperAdminRole));
        if (!await roleManager.RoleExistsAsync(InnAdminRole))
            await roleManager.CreateAsync(new IdentityRole<Guid>(InnAdminRole));

        // Create a single Inn using constructor so no reflection
        var inn = new Inn(
            "Pousada Exemplo",
            "Rua das Flores, 123",
            "São Roque de Minas",
            "Brasil",
            "MG",
            "37928000",
            "1234567890",
            "contato@pousadaexemplo.com"
        );

        Guid innId = inn.Id;

        // Add inn if not exists
        if (!await appDb.Inns.AnyAsync(i => i.Name == inn.Name, cancellationToken))
        {
            await appDb.Inns.AddAsync(inn, cancellationToken);
            await appDb.SaveChangesAsync(cancellationToken);
        }
        else
        {
            var innDb = await appDb.Inns.FirstAsync(i => i.Name == inn.Name, cancellationToken);
            innId = innDb.Id;
        }

        // Create users
        if (await userManager.FindByEmailAsync(SuperAdminEmail) is null)
        {
            var superUser = new ApplicationUser(SuperAdminName, SuperAdminEmail);
            var createResult = await userManager.CreateAsync(superUser, Password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException(createResult.Errors.First().Description);

            await userManager.AddToRoleAsync(superUser, SuperAdminRole);
        }

        if (await userManager.FindByEmailAsync(InnAdminEmail) is null)
        {
            var innUser = new ApplicationUser(InnAdminName, InnAdminEmail, innId);
            var createResult = await userManager.CreateAsync(innUser, Password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException(createResult.Errors.First().Description);

            await userManager.AddToRoleAsync(innUser, InnAdminRole);
        }

        // Set tenant context to the created inn
        tenantContext.SetTenant(new Tenant(innId));

        // Create a room category and room
        if (!await appDb.RoomCategories.AnyAsync(c => c.Name == "Standard", cancellationToken))
        {
            var category = new RoomCategory("Standard", "Quarto padrão", 2, new PricingPolicy(200m, 50m));
            await appDb.RoomCategories.AddAsync(category, cancellationToken);
            await appDb.SaveChangesAsync(cancellationToken);

            var room = new Room(category.Id, 101, "101");
            room.Activate();
            await appDb.Rooms.AddAsync(room, cancellationToken);
            await appDb.SaveChangesAsync(cancellationToken);

            // Create bookings for the created room
            var booking1 = new Booking(
                room.Id,
                new Guest("Fulano", "+55 12 98765-4321", "fulano@example.com"),
                new StayPeriod(DateTimeOffset.UtcNow.AddDays(7), DateTimeOffset.UtcNow.AddDays(10)),
                new Occupancy(2, 0, []),
                new Money(600m),
                BookingSource.Manual
            );

            var booking2 = new Booking(
                room.Id,
                new Guest("Sicrano", "+55 12 91234-5678", "sicrano@example.com"),
                new StayPeriod(DateTimeOffset.UtcNow.AddDays(15), DateTimeOffset.UtcNow.AddDays(17)),
                new Occupancy(1, 0, []),
                new Money(400m),
                BookingSource.Manual
            );

            await appDb.Bookings.AddRangeAsync([booking1, booking2], cancellationToken);
            await appDb.SaveChangesAsync(cancellationToken);
        }
    }
}