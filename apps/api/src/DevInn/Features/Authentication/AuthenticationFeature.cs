using DevInn.Features.Authentication.Commands.LoginUser;

namespace DevInn.Features.Authentication;

public static class AuthenticationFeature
{
    public static void UseAuthenticationFeature(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapLoginEndpoint();
    }
};