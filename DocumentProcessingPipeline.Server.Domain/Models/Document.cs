namespace DocumentProcessingPipeline.Server.Domain.Models;

public record Document
{
    public string? Id { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public IDictionary<string, object>? ExtractedContent { get; init; }
    public required string BucketName { get; init; }
    public required string StoragePath { get; init; }
    public DocumentStatus Status { get; init; }
    public DateTimeOffset? CreatedAt { get; init; }
};

public enum DocumentStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}