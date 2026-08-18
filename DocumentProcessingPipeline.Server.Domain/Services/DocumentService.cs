using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

namespace DocumentProcessingPipeline.Server.Domain.Services;

public class DocumentService(IStorageService storageService) : IDocumentService
{
    public async Task UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken)
    {
        var documentId = Guid.NewGuid().ToString();
        var fileNameWithUtc = $"{fileName}_{DateTime.UtcNow:yyyyMMddHHmmss}";
        var storagePath = $"documents/{documentId}/{fileNameWithUtc}";
        
        await storageService.UploadFileAsync(fileStream, storagePath, contentType, cancellationToken);
    }
}