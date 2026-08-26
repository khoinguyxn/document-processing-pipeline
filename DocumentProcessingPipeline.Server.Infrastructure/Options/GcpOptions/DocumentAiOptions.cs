namespace DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;

public record DocumentAiOptions
{
    public required string ProcessorId { get; init; }
    public required string Endpoint { get; init; }
    public OcrProvider OcrProvider { get; init; } = OcrProvider.Auto;
    public int SimulatedDelayMs { get; init; } = 0;
}

public enum OcrProvider
{
    Auto,
    Live,
    Fixture
}