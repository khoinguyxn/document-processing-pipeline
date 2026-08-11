var builder = DistributedApplication.CreateBuilder(args);

var firestore = builder.AddContainer("firestore", "google/cloud-sdk:emulators").WithEntrypoint("gcloud")
    .WithArgs("beta", "emulators", "firestore", "start", "--host-port=0.0.0.0:8080")
    .WithEndpoint(port: 8080, targetPort: 8080, name: "http");

var server = builder.AddProject<Projects.DocumentProcessingPipeline_Server>("server")
    .WithHttpHealthCheck("/health").WithEnvironment("FIREBASE_EMULATOR_HOST",
        $"{firestore.GetEndpoint("http").Property(EndpointProperty.Host)}:{firestore.GetEndpoint("http").Property(EndpointProperty.TargetPort)}")
    .WithEnvironment("GCP__ProjectId", "document-processing-pipeline")
    .WithExternalHttpEndpoints().WaitFor(firestore);

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server).WithBun()
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();