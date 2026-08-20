using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using DocumentProcessingPipeline.Server.Infrastructure.Persistence.Entities;
using ErrorOr;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Logging;

namespace DocumentProcessingPipeline.Server.Infrastructure.Persistence.Repositories;

public class FirestoreDocumentRepository(FirestoreDb firestoreDb, ILogger<FirestoreDocumentRepository> logger)
    : IDocumentRepository
{
    private const string Collection = "documents";

    public async Task<ErrorOr<Created>> CreateDocumentAsync(Document document, CancellationToken cancellationToken)
    {
        try
        {
            var entity = document.ToEntity();
            var documentReference = firestoreDb.Collection(Collection).Document(entity.Id);

            await documentReference.SetAsync(entity, cancellationToken: cancellationToken);

            return Result.Created;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "FirestoreDocumentRepository: Failed to create document with ID {DocumentId}",
                document.Id);

            return Error.Failure("FirestoreDocumentRepository.CreateDocumentAsync",
                $"Failed to create document '{document.Id}': {ex.Message}");
        }
    }

    public async Task<ErrorOr<Updated>> UpdateDocumentAsync(
        string documentId,
        IDictionary<string, object> extractedContent,
        DocumentStatus status,
        CancellationToken cancellationToken)
    {
        try
        {
            var documentReference = firestoreDb.Collection(Collection).Document(documentId);

            await documentReference.UpdateAsync(new Dictionary<string, object>
                {
                    { "extractedContent", extractedContent },
                    { "status", status.ToString() }
                },
                cancellationToken: cancellationToken);

            return Result.Updated;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "FirestoreDocumentRepository: Failed to update document with ID {DocumentId}",
                documentId);

            return Error.Failure("FirestoreDocumentRepository.UpdateDocumentAsync",
                $"Failed to update document '{documentId}': {ex.Message}");
        }
    }
}