using DocumentProcessingPipeline.Server.Domain.Models;
using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IOcrService
{
    Task<ErrorOr<IEnumerable<ExtractedFormField>>> ExtractDocumentAsync(
        string id,
        string bucketName,
        string storagePath,
        string contentType,
        CancellationToken cancellationToken
    );
}