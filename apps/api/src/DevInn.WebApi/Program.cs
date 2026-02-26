using System.IO.Compression;
using System.Text.Json.Serialization;

using DevInn.Application;
using DevInn.Infrastructure;
using DevInn.WebApi.Common.ExceptionHandlers;
using DevInn.WebApi.Configuration;
using DevInn.WebApi.Endpoints;
using DevInn.WebApi.Middlewares;

using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});
builder.Services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);

builder.Services.AddCorsConfiguration();
builder.Services.AddHealthCheckConfiguration();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScalarOpenApi();

builder.Services.AddApplicationModule();
builder.Services.AddInfrastructureModule(builder.Configuration);
builder.Services.AddEndpoints(typeof(Program).Assembly);

// Middlewares registration
builder.Services.AddScoped<RequestLoggingMiddleware>();
builder.Services.AddScoped<TenantMiddleware>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseScalarOpenApi();
}

app.UseCorsConfiguration();
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseHealthCheckConfiguration();

app.UseAuthentication();
app.UseAuthorization();

app.UseInfrastructureModule();


// Middlewares
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<TenantMiddleware>();

app.MapEndpoints();

await app.RunAsync();