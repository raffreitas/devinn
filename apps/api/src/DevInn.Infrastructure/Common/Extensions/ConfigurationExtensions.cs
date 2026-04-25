using Microsoft.Extensions.Configuration;

namespace DevInn.Infrastructure.Common.Extensions;

public static class ConfigurationExtensions
{
    extension(IConfiguration configuration)
    {
        public string GetConnectionStringOrThrow(string name) =>
            configuration.GetConnectionString(name) ??
            throw new InvalidOperationException($"The connection string {name} was not found");

        public T GetValueOrThrow<T>(string name) =>
            configuration.GetValue<T?>(name) ?? throw new InvalidOperationException($"The value {name} was not found");

        public T GetOrThrow<T>(string name) =>
            configuration.GetSection(name).Get<T?>() ??
            throw new InvalidOperationException($"The section {name} was not found");
    }
}