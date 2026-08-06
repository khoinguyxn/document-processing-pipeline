var builder = DistributedApplication.CreateBuilder(args);

var server = builder.AddProject<Projects.DocumentProcessingPipeline_Server>("server")
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server).WithBun()
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();