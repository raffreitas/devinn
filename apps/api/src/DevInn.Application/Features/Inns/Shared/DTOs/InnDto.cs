namespace DevInn.Application.Features.Inns.Shared.DTOs;

public record InnDto(
    Guid Id,
    string Name,
    string Address,
    string City,
    string State,
    string Country,
    string ZipCode,
    string Phone,
    string Email
);
