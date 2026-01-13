using DevInn.Application;
using DevInn.Infrastructure;
using DevInn.WebApi.Endpoints;
using DevInn.WebApi.Middlewares;

using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationModule();
builder.Services.AddInfrastructureModule(builder.Configuration);
builder.Services.AddEndpoints(typeof(Program).Assembly);

// Middlewares registration
builder.Services.AddScoped<TenantMiddleware>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference().AllowAnonymous();
}

app.UseHttpsRedirection();

// Middlewares
app.UseMiddleware<TenantMiddleware>();

app.MapEndpoints();

await app.RunAsync();