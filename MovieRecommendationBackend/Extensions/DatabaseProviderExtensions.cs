using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;

namespace MovieRecommendationBackend.Extensions;

/// <summary>
/// Extension methods for configuring database providers
/// </summary>
public static class DatabaseProviderExtensions
{
    /// <summary>
    /// Configures the database context based on the configured provider
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddDatabaseContext(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var provider = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
        
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            switch (provider.ToLower())
            {
                case "sqlserver":
                    var sqlServerConnection = configuration.GetConnectionString("SqlServer");
                    if (string.IsNullOrEmpty(sqlServerConnection))
                    {
                        throw new InvalidOperationException(
                            "SqlServer connection string is not configured in appsettings.json");
                    }
                    options.UseSqlServer(sqlServerConnection);
                    Console.WriteLine($"✅ Using SQL Server database provider");
                    break;

                case "postgresql":
                default:
                    var postgresConnection = configuration.GetConnectionString("PostgreSQL");
                    if (string.IsNullOrEmpty(postgresConnection))
                    {
                        throw new InvalidOperationException(
                            "PostgreSQL connection string is not configured in appsettings.json");
                    }
                    options.UseNpgsql(postgresConnection);
                    Console.WriteLine($"✅ Using PostgreSQL database provider");
                    break;
            }
        });

        return services;
    }

    /// <summary>
    /// Gets the currently configured database provider name
    /// </summary>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The database provider name (PostgreSQL or SqlServer)</returns>
    public static string GetDatabaseProvider(this IConfiguration configuration)
    {
        return configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
    }

    /// <summary>
    /// Validates that the required connection string exists for the configured provider
    /// </summary>
    /// <param name="configuration">The application configuration</param>
    /// <exception cref="InvalidOperationException">Thrown when connection string is missing</exception>
    public static void ValidateDatabaseConfiguration(this IConfiguration configuration)
    {
        var provider = configuration.GetDatabaseProvider();
        var connectionString = configuration.GetConnectionString(provider);
        
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException(
                $"Connection string for '{provider}' is not configured in appsettings.json. " +
                $"Please add a connection string with the key 'ConnectionStrings:{provider}'");
        }
    }
}

