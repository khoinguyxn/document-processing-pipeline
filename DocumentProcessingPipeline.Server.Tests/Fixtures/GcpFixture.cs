using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Testcontainers.FakeGcsServer;
using Testcontainers.Firestore;

namespace DocumentProcessingPipeline.Server.Tests.Fixtures;

extern alias ServerApp;

public class GcpFixture : WebApplicationFactory<ServerApp::Program>, IAsyncLifetime
{
    private FirestoreContainer FirestoreContainer { get; } =
        new FirestoreBuilder("google/cloud-sdk:emulators")
            .Build();

    private FakeGcsServerContainer StorageContainer { get; } =
        new FakeGcsServerBuilder("fsouza/fake-gcs-server:latest")
            .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Gcp:ProjectId"] = "test-project",
                ["STORAGE_EMULATOR_HOST"] = StorageContainer.GetConnectionString(),
                ["FIRESTORE_EMULATOR_HOST"] = FirestoreContainer.GetEmulatorEndpoint()
            };

            config.AddInMemoryCollection(settings);
        });

        builder.ConfigureTestServices(services =>
        {
            var mockOcrService = new Mock<IOcrService>();

            mockOcrService.Setup(x => x.ExtractDocumentAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()
            )).ReturnsAsync(Enumerable.Empty<ExtractedFormField>().ToErrorOr());

            services.RemoveAll<IOcrService>();
            services.AddScoped<IOcrService>(_ => mockOcrService.Object);
        });

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<ILogger>();
            services.AddSingleton<ILogger, NullLogger>();
        });

        builder.UseEnvironment("TEST");
    }

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(
            FirestoreContainer.StartAsync(),
            StorageContainer.StartAsync()
        );

        Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", FirestoreContainer.GetEmulatorEndpoint());
        Environment.SetEnvironmentVariable("STORAGE_EMULATOR_HOST", StorageContainer.GetConnectionString());
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            await base.DisposeAsync();

            await Task.WhenAll(
                FirestoreContainer.DisposeAsync().AsTask(),
                StorageContainer.DisposeAsync().AsTask()
            );
        }
        finally
        {
            Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", null);
            Environment.SetEnvironmentVariable("STORAGE_EMULATOR_HOST", null);
        }
    }
}