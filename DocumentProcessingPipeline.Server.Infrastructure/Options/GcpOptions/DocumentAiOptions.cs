namespace DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;

public record DocumentAiOptions
{
    public required string Endpoint { get; init; }
};