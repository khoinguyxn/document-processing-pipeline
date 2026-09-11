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
            var documentReference = firestoreDb.Collection(Collection).Document(document.Id);

            await documentReference.SetAsync(document.ToEntity(), cancellationToken: cancellationToken);

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

    public async Task<ErrorOr<Updated>> UpdateDocumentAsync(Document updatedDocument,
        CancellationToken cancellationToken)
    {
        try
        {
            var documentReference = firestoreDb.Collection(Collection).Document(updatedDocument.Id);

            await documentReference.SetAsync(updatedDocument.ToEntity(), SetOptions.MergeAll,
                cancellationToken);

            return Result.Updated;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "FirestoreDocumentRepository.UpdateDocumentAsync: Failed to update document {DocumentId}: {ErrorMessage}",
                updatedDocument.Id, ex.Message);

            return Error.Failure("FirestoreDocumentRepository.UpdateDocumentAsync",
                $"Failed to update document '{updatedDocument.Id}'");
        }
    }
}