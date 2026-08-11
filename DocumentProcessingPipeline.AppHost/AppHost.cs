var builder = DistributedApplication.CreateBuilder(args);

var cloudStorage = builder.AddContainer("cloud-storage", "fsouza/fake-gcs-server")
    .WithArgs("-scheme", "http", "-port", "4443", "-external-url", "http://localhost:4443")
    .WithHttpEndpoint(targetPort: 4443, name: "http");

var firestore = builder.AddContainer("firestore", "google/cloud-sdk:emulators").WithEntrypoint("gcloud")
    .WithArgs("beta", "emulators", "firestore", "start", "--host-port=0.0.0.0:4444")
    .WithHttpEndpoint(targetPort: 4444, name: "http");

var server = builder.AddProject<Projects.DocumentProcessingPipeline_Server>("server")
    .WithHttpHealthCheck("/health").WithEnvironment("FIREBASE_EMULATOR_HOST",
        $"{firestore.GetEndpoint("http").Property(EndpointProperty.Host)}:{firestore.GetEndpoint("http").Property(EndpointProperty.TargetPort)}")
    .WithEnvironment("STORAGE_EMULATOR_HOST",
        $"{cloudStorage.GetEndpoint("http").Property(EndpointProperty.Host)}:{cloudStorage.GetEndpoint("http").Property(EndpointProperty.TargetPort)}")
    .WithEnvironment("GCP__ProjectId", "document-processing-pipeline")
    .WithExternalHttpEndpoints().WaitFor(firestore).WaitFor(cloudStorage);

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server).WithBun()
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();