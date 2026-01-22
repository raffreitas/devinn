using System.Diagnostics;

namespace DevInn.WebApi.Middlewares;

public sealed class RequestLoggingMiddleware(ILogger<RequestLoggingMiddleware> logger) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var sw = Stopwatch.StartNew();

        var request = context.Request;
        var method = request.Method;
        var path = request.Path + request.QueryString;

        Activity.Current?.SetTag("http.method", method);
        Activity.Current?.SetTag("http.target", path);

        await next(context);

        sw.Stop();
        var status = context.Response.StatusCode;

        logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds}ms",
            method, path, status, sw.Elapsed.TotalMilliseconds);

        Activity.Current?.SetTag("http.status_code", status);
        Activity.Current?.SetTag("http.duration_ms", sw.Elapsed.TotalMilliseconds);
    }
}