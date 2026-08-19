namespace DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;

public record GcpOptions
{
    public required string ProjectId { get; init; }
}