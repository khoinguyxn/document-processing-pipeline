using Aspire.Hosting;
using Microsoft.Extensions.Logging;
using Xunit.DependencyInjection.Logging;

namespace DocumentProcessingPipeline.Server.Tests;

public class DistributedAppFixture : IAsyncLifetime
{
    private readonly CancellationToken _cancellationToken = CancellationToken.None;

    private DistributedApplication? _app;

    public DistributedApplication App =>
        _app ?? throw new InvalidOperationException("The testing app fixture has not been initialized.");


    public async ValueTask InitializeAsync()
    {
        var appHost =
            await DistributedApplicationTestingBuilder.CreateAsync<Projects.DocumentProcessingPipeline_AppHost>(
                args: [],
                configureBuilder: (options, _) => options.EnableResourceLogging = true, cancellationToken:
                _cancellationToken);

        appHost.Services.AddLogging(loggingBuilder =>
        {
            loggingBuilder.AddConsole()
                .SetMinimumLevel(LogLevel.Debug)
                .AddFilter("Default", LogLevel.Information)
                .AddFilter("Microsoft.AspNetCore", LogLevel.Warning)
                .AddFilter("Aspire.Hosting.Dcp", LogLevel.Warning);
        });

        appHost.Services.ConfigureHttpClientDefaults(clientBuilder =>
        {
            clientBuilder.AddStandardResilienceHandler();
        });


        _app = await appHost.BuildAsync(_cancellationToken);

        await _app.StartAsync(_cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);

        await App.DisposeAsync();
    }
}