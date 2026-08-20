using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services;

public class DocumentService(IStorageService storageService, IDocumentRepository documentRepository) : IDocumentService
{
    private const string BucketName = "document-processing-pipeline-bucket";

    public async Task<ErrorOr<Created>> UploadAsync(Stream fileStream, string fileName, string contentType,
        CancellationToken cancellationToken)
    {
        var documentId = Guid.NewGuid().ToString();
        var fileNameWithUtc = $"{fileName}_{DateTime.UtcNow:yyyyMMddHHmmss}";
        var storagePath = $"documents/{documentId}/{fileNameWithUtc}";

        var uploadedResult =
            await storageService.UploadFileAsync(fileStream, BucketName, storagePath, contentType, cancellationToken);

        if (uploadedResult.IsError)
        {
            return uploadedResult.Errors;
        }

        var document = new Document
        {
            Id = documentId,
            FileName = fileName,
            ContentType = contentType,
            BucketName = BucketName,
            StoragePath = storagePath,
            Status = DocumentStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createdResult = await documentRepository.CreateDocumentAsync(document, cancellationToken);

        if (createdResult.IsError)
        {
            return createdResult.Errors;
        }

        return Result.Created;
    }
}