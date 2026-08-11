namespace DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;

public record GcpOptions
{
    public string? ProjectId { get; init; } = null;
}