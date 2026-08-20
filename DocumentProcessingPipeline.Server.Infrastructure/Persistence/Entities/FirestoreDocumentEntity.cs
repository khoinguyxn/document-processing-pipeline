using DocumentProcessingPipeline.Server.Domain.Models;
using Google.Cloud.Firestore;

namespace DocumentProcessingPipeline.Server.Infrastructure.Persistence.Entities;

[FirestoreData]
public record FirestoreDocumentEntity
{
    [FirestoreDocumentId] public string? Id { get; init; }
    [FirestoreProperty("fileName")] public required string FileName { get; init; }
    [FirestoreProperty("contentType")] public required string ContentType { get; init; }
    [FirestoreProperty("status")] public required string Status { get; init; }

    [FirestoreProperty("extractedContent")]
    public IDictionary<string, object>? ExtractedContent { get; init; }

    [FirestoreProperty("bucketName")] public required string BucketName { get; init; }
    [FirestoreProperty("storagePath")] public required string StoragePath { get; init; }
    [FirestoreProperty("createdAt")] public DateTimeOffset? CreatedAt { get; init; }
};

public static class DocumentMappingExtensions
{
    public static Document ToModel(this FirestoreDocumentEntity entity) => new()
    {
        Id = entity.Id,
        FileName = entity.FileName,
        ContentType = entity.ContentType,
        Status = Enum.TryParse<DocumentStatus>(entity.Status, ignoreCase: true, out var status)
            ? status
            : DocumentStatus.Pending,
        ExtractedContent = entity.ExtractedContent,
        BucketName = entity.BucketName,
        StoragePath = entity.StoragePath,
        CreatedAt = entity.CreatedAt
    };

    public static FirestoreDocumentEntity ToEntity(this Document entity) => new()
    {
        Id = entity.Id,
        FileName = entity.FileName,
        ContentType = entity.ContentType,
        Status = entity.Status.ToString(),
        ExtractedContent = entity.ExtractedContent,
        BucketName = entity.BucketName,
        StoragePath = entity.StoragePath,
        CreatedAt = entity.CreatedAt
    };
}