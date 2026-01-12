using DevInn.Shared.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Shared Services
builder.Services.AddPersistenceConfiguration(builder.Configuration);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

await app.RunAsync();