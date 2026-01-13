namespace DevInn.Shared.Tenancy;

public interface ITenantContext
{
    Guid TenantId { get; }

    void SetTenant(Guid tenantId);

    bool IsSet { get; }
}

public sealed class TenantContext : ITenantContext
{
    private static readonly AsyncLocal<Guid> _tenantId = new();

    public Guid TenantId
    {
        get
        {
            if (_tenantId.Value == Guid.Empty)
            {
                throw new InvalidOperationException(
                    "Tenant não foi definido para esta requisição. " +
                    "Certifique-se de que o middleware de tenant está registrado corretamente.");
            }

            return _tenantId.Value;
        }
    }

    public bool IsSet => _tenantId.Value != Guid.Empty;

    public void SetTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("ID do tenant não pode estar vazio.", nameof(tenantId));
        }

        _tenantId.Value = tenantId;
    }
}