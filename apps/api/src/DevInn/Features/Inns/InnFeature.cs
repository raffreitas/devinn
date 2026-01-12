using DevInn.Features.Inns.Commands.CreateInn;

namespace DevInn.Features.Inns;

public static class InnFeature
{
    public static void UseInnFeature(this WebApplication app)
    {
        var group = app.MapGroup("api/v1/inns")
            .WithTags("Inns")
            .WithGroupName("Inns");

        app.MapCreateInnEndpoint(group);
    }
}