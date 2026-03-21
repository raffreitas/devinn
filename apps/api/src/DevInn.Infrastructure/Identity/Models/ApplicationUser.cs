using Microsoft.AspNetCore.Identity;

namespace DevInn.Infrastructure.Identity.Models;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public override Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid? InnId { get; init; }
    public string Name { get; set; }

    public ApplicationUser(string name, string email, Guid? innId = null) : base(email)
    {
        Name = name;
        Email = email;
        InnId = innId;
        EmailConfirmed = true;
    }
}
