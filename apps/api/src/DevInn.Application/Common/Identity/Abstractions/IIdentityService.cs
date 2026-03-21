using FluentResults;

namespace DevInn.Application.Common.Identity.Abstractions;

public interface IIdentityService
{
    Task<Result<User>> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<User>> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
    Task<Result<User>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> UpdateProfileAsync(User user, CancellationToken cancellationToken = default);
    Task<Result> ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default);
}

public sealed record RegisterUserRequest(string Name, string Email, string Password, Guid? InnId, UserRole Role);

public sealed record ChangePasswordRequest(Guid UserId, string CurrentPassword, string NewPassword);