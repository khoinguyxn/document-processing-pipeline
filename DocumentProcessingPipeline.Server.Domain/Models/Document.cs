namespace DocumentProcessingPipeline.Server.Domain.Models;

public record Document
{
    public required string Id { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public IEnumerable<ExtractedFormField> ExtractedFormFields { get; init; } = [];
    public required string BucketName { get; init; }
    public required string StoragePath { get; init; }
    public DocumentStatus Status { get; init; }
    public DateTimeOffset? CreatedAt { get; init; }
}


public record ExtractedFormField
{
    public required FormFieldElement FieldName { get; init; }
    public required FormFieldElement FieldValue { get; init; }
    public required int PageNumber { get; init; }
}

public record FormFieldElement
{
    public required string Text { get; init; }
    public required float Confidence { get; init; }
    public IEnumerable<Vertex> NormalizedVertices { get; init; } = [];
}

public record Vertex
{
    public required float X { get; init; }
    public required float Y { get; init; }
}

public enum DocumentStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}