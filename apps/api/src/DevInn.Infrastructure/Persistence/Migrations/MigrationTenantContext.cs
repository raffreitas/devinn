using DevInn.Application.Common.Tenancy;
using DevInn.Application.Common.Tenancy.Abstractions;

namespace DevInn.Infrastructure.Persistence.Migrations;

internal sealed class MigrationTenantContext : ITenantContext
{
    public Tenant Tenant { get; private set; } = new(Guid.Empty);

    public void SetTenant(Tenant tenant)
    {
        Tenant = tenant;
    }
}