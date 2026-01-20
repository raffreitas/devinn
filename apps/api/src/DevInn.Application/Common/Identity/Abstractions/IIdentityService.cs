using FluentResults;

namespace DevInn.Application.Common.Identity.Abstractions;

public interface IIdentityService
{
    Task<Result<User>> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<User>> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
    Task<Result<User>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed record RegisterUserRequest(string Name, string Email, string Password, Guid? InnId, UserRole Role);