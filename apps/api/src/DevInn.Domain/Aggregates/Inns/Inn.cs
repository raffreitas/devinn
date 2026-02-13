using DevInn.Domain.SeedWork;

namespace DevInn.Domain.Aggregates.Inns;

public sealed class Inn : Entity
{
    public string Name { get; private set; }
    public string Address { get; private set; }
    public string City { get; private set; }
    public string Country { get; private set; }
    public string State { get; private set; }
    public string Phone { get; private set; }
    public string Email { get; private set; }
    public string TimeZoneId { get; private set; } // IANA timezone

    public Inn(
        string name,
        string address,
        string city,
        string country,
        string state,
        string phone,
        string email)
    {
        Name = name;
        Address = address;
        City = city;
        Country = country;
        State = state;
        Phone = phone;
        Email = email;
        TimeZoneId = "America/Sao_Paulo";
    }
}