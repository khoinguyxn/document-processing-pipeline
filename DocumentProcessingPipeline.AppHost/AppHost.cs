using Bogus;
using DocumentProcessingPipeline.AppHost.Fixtures;

var builder = DistributedApplication.CreateBuilder(args);

var faker = new Faker();

var home = Environment.GetEnvironmentVariable("HOME") ?? "";
if (!string.IsNullOrEmpty(home))
{
    var miseShimsPath = Path.Combine(home, ".local/share/mise/shims");
    Environment.SetEnvironmentVariable("PATH", $"{miseShimsPath}:{Environment.GetEnvironmentVariable("PATH")}");
}

var documentAi = builder
    .AddWireMock("document-ai", "http://*:8081", "grpc://*:9093")
    .AsHttp2Service()
    .WithDocumentAiFixture()
    .WithOpenTelemetry();

var cloudStorage = builder.AddContainer("cloud-storage", "fsouza/fake-gcs-server")
    .WithArgs(
        "-scheme", "http",
        "-port", "4443",
        "-external-url", "http://localhost:4443"
    )
    .WithHttpEndpoint(port: 4443, targetPort: 4443, name: "http");

var firestore = builder.AddContainer("firestore", "google/cloud-sdk:emulators")
    .WithEntrypoint("gcloud")
    .WithArgs("beta", "emulators", "firestore", "start", "--host-port=0.0.0.0:4444")
    .WithHttpEndpoint(port: 4444, targetPort: 4444, name: "http");

#pragma warning disable ASPIRECERTIFICATES001
var server = builder
    .AddProject<Projects.DocumentProcessingPipeline_Server>("server")
    .WithHttpHealthCheck("/health")
    .WithEnvironment("FIRESTORE_EMULATOR_HOST", firestore.GetEndpoint("http"))
    .WithEnvironment("STORAGE_EMULATOR_HOST", $"{cloudStorage.GetEndpoint("http")}/storage/v1/")
    .WithEnvironment("Gcp__DocumentAi__Endpoint", documentAi.GetEndpoint("grpc-9093").Property(EndpointProperty.HostAndPort))
    .WithEnvironment("Gcp__DocumentAi__ProcessorId", faker.Random.Guid().ToString())
    .WithEnvironment("Gcp__ProjectId", faker.Random.AlphaNumeric(20))
    .WithEnvironment("Gcp__ProjectNumber", faker.Random.Number(100000000, 999999999).ToString())
    .WithEnvironment("Gcp__LocationId", faker.PickRandom("us", "eu", "asia"))
    .WithExternalHttpEndpoints()
    .WithHttpsDeveloperCertificate()
    .WithReference(documentAi)
    .WaitFor(firestore)
    .WaitFor(cloudStorage)
    .WaitFor(documentAi);

#pragma warning disable ASPIREJAVASCRIPT001
var webfrontend = builder
    .AddViteApp("web", "../frontend")
    .PublishAsNodeServer(".output/server/index.mjs", ".output")
#pragma warning restore ASPIREJAVASCRIPT001
    .WithHttpsDeveloperCertificate()
    .WithReference(server)
    .WithBun()
    .WaitFor(server);
#pragma warning restore ASPIRECERTIFICATES001

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();