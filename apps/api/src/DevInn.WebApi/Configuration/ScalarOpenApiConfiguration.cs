using DevInn.Infrastructure.Common.Constants;

using Microsoft.OpenApi;

using Scalar.AspNetCore;

namespace DevInn.WebApi.Configuration;

public static class ScalarOpenApiConfiguration
{
    public static IServiceCollection AddScalarOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Insira seu token JWT. Exemplo: Bearer {seu_token}"
                };

                document.Security?.Add(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference("Bearer")
                        {
                            Reference = new JsonSchemaReference
                            {
                                Type = ReferenceType.SecurityScheme, Id = "Bearer"
                            }
                        },
                        []
                    }
                });

                foreach (var operation in document.Paths.Values.SelectMany(o => o.Operations?.Values ?? Enumerable.Empty<OpenApiOperation>()))
                {
                    operation.Parameters ??= [];

                    var alreadyExists = operation.Parameters.Any(parameter =>
                        parameter.In == ParameterLocation.Header &&
                        parameter.Name is not null &&
                        parameter.Name.Equals(TenantKeys.InnHeader, StringComparison.OrdinalIgnoreCase));

                    if (alreadyExists) continue;

                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = TenantKeys.InnHeader,
                        In = ParameterLocation.Header,
                        Required = false,
                        Description = "ID da Inn para a qual a requisição está sendo feita.",
                        Schema = new OpenApiSchema
                        {
                            Type = JsonSchemaType.String,
                            Format = "uuid"
                        }
                    });

                }

                return Task.CompletedTask;
            });
        });

        return services;
    }

    public static WebApplication UseScalarOpenApi(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return app;

        app.MapOpenApi().AllowAnonymous();
        app.MapScalarApiReference().AllowAnonymous();

        return app;
    }
}