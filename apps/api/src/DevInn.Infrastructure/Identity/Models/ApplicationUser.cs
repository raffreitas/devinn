using Microsoft.AspNetCore.Identity;

namespace DevInn.Infrastructure.Identity.Models;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public override Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid? InnId { get; init; }

    public ApplicationUser(string userName, string email, Guid? innId = null) : base(userName)
    {
        Email = email;
        InnId = innId;
        EmailConfirmed = true;
    }
}