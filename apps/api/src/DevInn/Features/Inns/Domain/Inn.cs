using DevInn.Shared.Domain;

namespace DevInn.Features.Inns.Domain;

public sealed class Inn : AggregateRoot
{
    public string Name { get; private set; }
    public string Address { get; private set; }
    public string City { get; private set; }
    public string Country { get; private set; }
    public string State { get; private set; }
    public string Phone { get; set; }
    public string Email { get; set; }

    public Inn(string name, string address, string city, string country, string state, string phone, string email)
    {
        Name = name;
        Address = address;
        City = city;
        Country = country;
        State = state;
        Phone = phone;
        Email = email;
    }
}
