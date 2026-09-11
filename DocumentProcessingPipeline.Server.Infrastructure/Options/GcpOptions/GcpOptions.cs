namespace DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;

public record GcpOptions
{
    public required string ProjectId { get; init; }
    public required string ProjectNumber { get; init; }
    public required string LocationId { get; init; }
}