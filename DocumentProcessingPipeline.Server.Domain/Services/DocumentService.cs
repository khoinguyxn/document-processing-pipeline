using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

namespace DocumentProcessingPipeline.Server.Domain.Services;

public class DocumentService : IDocumentService
{
    public Task UploadAsync(Stream file, string fileName, string contentType, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}