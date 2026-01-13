using Microsoft.AspNetCore.Identity;

namespace DevInn.Shared.Identity.Models;

public sealed class ApplicationUser : IdentityUser
{
    public Guid InnId { get; set; }
    public Guid UserId { get; set; }
}