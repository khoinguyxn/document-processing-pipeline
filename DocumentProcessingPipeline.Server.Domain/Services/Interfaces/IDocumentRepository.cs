using DocumentProcessingPipeline.Server.Domain.Models;
using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IDocumentRepository
{
    Task<ErrorOr<Created>> CreateDocumentAsync(Document document, CancellationToken cancellationToken);

    Task<ErrorOr<Updated>> UpdateDocumentAsync(
        string documentId,
        IDictionary<string, object> extractedContent,
        DocumentStatus status,
        CancellationToken cancellationToken
    );
}