using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IDocumentService
{
    Task<ErrorOr<Created>> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
}