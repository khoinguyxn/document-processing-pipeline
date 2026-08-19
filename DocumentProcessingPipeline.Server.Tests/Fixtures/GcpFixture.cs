using Google.Api.Gax;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Mvc.Testing;
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
                ["GCP:ProjectId"] = "test-project",
                ["STORAGE_EMULATOR_HOST"] = StorageContainer.GetConnectionString(),
                ["FIRESTORE_EMULATOR_HOST"] = FirestoreContainer.GetEmulatorEndpoint()
            };

            config.AddInMemoryCollection(settings);
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

        var storageClient = await new StorageClientBuilder
        {
            EmulatorDetection = EmulatorDetection.EmulatorOrProduction
        }.BuildAsync();

        await storageClient.CreateBucketAsync("test-project", "document-processing-pipeline-bucket");
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();

        await Task.WhenAll(
            FirestoreContainer.DisposeAsync().AsTask(),
            StorageContainer.DisposeAsync().AsTask()
        );

        Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", null);
        Environment.SetEnvironmentVariable("STORAGE_EMULATOR_HOST", null);
    }
}