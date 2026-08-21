using DocumentProcessingPipeline.Server.Domain.Models;
using Google.Cloud.Firestore;

namespace DocumentProcessingPipeline.Server.Infrastructure.Persistence.Entities;

[FirestoreData]
public record FirestoreDocumentEntity
{
    [FirestoreDocumentId] public required string Id { get; init; }
    [FirestoreProperty("fileName")] public required string FileName { get; init; }
    [FirestoreProperty("contentType")] public required string ContentType { get; init; }
    [FirestoreProperty("status")] public required string Status { get; init; }

    [FirestoreProperty("extractedFormFields")]
    public IEnumerable<FirestoreExtractedFormFieldEntity> ExtractedFormFields { get; init; } = [];

    [FirestoreProperty("bucketName")] public required string BucketName { get; init; }
    [FirestoreProperty("storagePath")] public required string StoragePath { get; init; }
    [FirestoreProperty("createdAt")] public DateTimeOffset? CreatedAt { get; init; }
}

[FirestoreData]
public record FirestoreExtractedFormFieldEntity
{
    [FirestoreProperty("fieldName")] public required FirestoreFormFieldElementEntity FieldName { get; init; }
    [FirestoreProperty("fieldValue")] public required FirestoreFormFieldElementEntity FieldValue { get; init; }
    [FirestoreProperty("pageNumber")] public required int PageNumber { get; init; }
}

[FirestoreData]
public record FirestoreFormFieldElementEntity
{
    [FirestoreProperty("text")] public required string Text { get; init; }
    [FirestoreProperty("confidence")] public required float Confidence { get; init; }

    [FirestoreProperty("normalizedVertices")]
    public List<FirestoreVertexEntity> NormalizedVertices { get; init; } = [];
}

[FirestoreData]
public record FirestoreVertexEntity
{
    [FirestoreProperty("x")] public required float X { get; init; }
    [FirestoreProperty("y")] public required float Y { get; init; }
}

public static class DocumentMappingExtensions
{
    public static FirestoreDocumentEntity ToEntity(this Document entity) => new()
    {
        Id = entity.Id,
        FileName = entity.FileName,
        ContentType = entity.ContentType,
        Status = entity.Status.ToString(),
        ExtractedFormFields = entity.ExtractedFormFields.Select(f => new FirestoreExtractedFormFieldEntity
        {
            PageNumber = f.PageNumber,
            FieldName = new FirestoreFormFieldElementEntity
            {
                Text = f.FieldName.Text,
                Confidence = f.FieldName.Confidence,
                NormalizedVertices =
                [
                    .. f.FieldName.NormalizedVertices
                        .Select(v => new FirestoreVertexEntity { X = v.X, Y = v.Y })
                ]
            },
            FieldValue = new FirestoreFormFieldElementEntity
            {
                Text = f.FieldValue.Text,
                Confidence = f.FieldValue.Confidence,
                NormalizedVertices =
                [
                    .. f.FieldValue.NormalizedVertices
                        .Select(v => new FirestoreVertexEntity { X = v.X, Y = v.Y })
                ]
            }
        }),
        BucketName = entity.BucketName,
        StoragePath = entity.StoragePath,
        CreatedAt = entity.CreatedAt
    };
}