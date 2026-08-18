namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IDocumentService
{
    Task UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
}