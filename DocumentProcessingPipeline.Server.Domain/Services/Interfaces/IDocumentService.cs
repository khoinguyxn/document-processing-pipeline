namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IDocumentService
{
    Task UploadAsync(Stream file, string fileName, string contentType, CancellationToken cancellationToken);
}