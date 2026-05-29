using Microsoft.AspNetCore.Diagnostics;

using Microsoft.AspNetCore.Mvc;

namespace StockoApi.Presentation
{
    /// <summary>
    /// Global exception handler that catches all unhandled exceptions
    /// and returns RFC 9457-compliant ProblemDetails responses.
    /// </summary>
    public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetailsService) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            logger.LogError(exception, "Unhandled exception occurred. TraceId: {TraceId}", httpContext.TraceIdentifier);

            var (statusCode, title) = MapException(exception);

            httpContext.Response.StatusCode = statusCode;

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Type = GetProblemType(statusCode),
                Detail = GetSafeErrorMessage(exception, httpContext)
            };

            return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = problemDetails
            });
        }

        private static (int StatusCode, string Title) MapException(Exception exception) => exception switch
        {
            ArgumentNullException => (StatusCodes.Status400BadRequest, "Invalid argument provided"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        private static string GetProblemType(int statusCode) => statusCode switch
        {
            400 => "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            401 => "https://tools.ietf.org/html/rfc9110#section-15.5.2",
            403 => "https://tools.ietf.org/html/rfc9110#section-15.5.4",
            404 => "https://tools.ietf.org/html/rfc9110#section-15.5.5",
            409 => "https://tools.ietf.org/html/rfc9110#section-15.5.10",
            _ => "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        };

        private static string? GetSafeErrorMessage(Exception exception, HttpContext context)
        {
            // TODO add sanitized error messages for app-specific exceptions
            return "Application error occurred";
        }
    }
}