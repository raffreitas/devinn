namespace DevInn.Application.Common.Tenancy.Abstractions;

public interface ITenantContext
{
    Tenant Tenant { get; }
    void SetTenant(Tenant tenant);
}

internal sealed class TenantContext : ITenantContext
{
    private static readonly AsyncLocal<Tenant> CurrentTenant = new();

    public Tenant Tenant => CurrentTenant.Value;

    public void SetTenant(Tenant tenant)
    {
        CurrentTenant.Value = tenant;
    }
}