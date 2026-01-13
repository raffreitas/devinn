using DevInn.Shared.Domain;

namespace DevInn.Features.Users.Domain;

public sealed class User : AggregateRoot
{
    public Guid InnId { get; private set; }
    public string Email { get; private set; }
    public UserRole Role { get; private set; }

    public User(Guid innId, string email)
    {
        InnId = innId;
        Email = email;
        Role = UserRole.Admin;
    }
}

public enum UserRole
{
    SuperAdmin = 1,
    Admin
}