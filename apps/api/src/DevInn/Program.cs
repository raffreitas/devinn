using DevInn.Features.Authentication;
using DevInn.Shared.Identity;
using DevInn.Shared.Persistence;
using DevInn.Shared.Tenancy;

var builder = WebApplication.CreateBuilder(args);

// Shared Services
builder.Services.AddTenancyConfiguration();
builder.Services.AddPersistenceConfiguration(builder.Configuration);
builder.Services.AddIdentityConfiguration(builder.Configuration);

var app = builder.Build();

// Middlewares
app.UseTenantMiddleware();
app.UseAuthentication();
app.UseAuthorization();


// Features
app.UseAuthenticationFeature();

app.MapGet("/", () => "Hello World!");

await app.RunAsync();