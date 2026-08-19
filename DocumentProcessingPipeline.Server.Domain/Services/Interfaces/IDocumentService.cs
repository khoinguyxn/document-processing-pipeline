using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IDocumentService
{
    Task<ErrorOr<Success>> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
}