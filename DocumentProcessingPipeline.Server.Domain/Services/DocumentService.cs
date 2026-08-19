using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services;

public class DocumentService(IStorageService storageService) : IDocumentService
{
    private const string BucketName = "document-processing-pipeline-bucket";

    public async Task<ErrorOr<Success>> UploadAsync(Stream fileStream, string fileName, string contentType,
        CancellationToken cancellationToken)
    {
        var documentId = Guid.NewGuid().ToString();
        var fileNameWithUtc = $"{fileName}_{DateTime.UtcNow:yyyyMMddHHmmss}";
        var storagePath = $"documents/{documentId}/{fileNameWithUtc}";

        return await storageService.UploadFileAsync(fileStream, BucketName, storagePath, contentType, cancellationToken);
    }
}