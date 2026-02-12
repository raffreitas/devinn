using Bogus;

using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Inventory.ValueObjects;

namespace DevInn.UnitTests.Shared.DataBuilders.Inventory;

internal sealed class RoomCategoryDataBuilder
{
    private string _name;
    private string _description;
    private int _maxCapacity;
    private PricingPolicy _pricingPolicy;

    public RoomCategoryDataBuilder()
    {
        var faker = new Faker("pt_BR");
        _name = faker.Name.FullName();
        _description = faker.Lorem.Paragraph();
        _maxCapacity = faker.Random.Int(1, 10);
        _pricingPolicy = new PricingPolicy(basePrice: 150m, personPrice: 50m);
    }

    public RoomCategoryDataBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public RoomCategoryDataBuilder WithDescription(string description)
    {
        _description = description;
        return this;
    }

    public RoomCategoryDataBuilder WithMaxCapacity(int maxCapacity)
    {
        _maxCapacity = maxCapacity;
        return this;
    }

    public RoomCategoryDataBuilder WithPricingPolicy(PricingPolicy pricingPolicy)
    {
        _pricingPolicy = pricingPolicy;
        return this;
    }

    public RoomCategory Build()
    {
        return new RoomCategory(
            _name,
            _description,
            _maxCapacity,
            _pricingPolicy
        );
    }
}