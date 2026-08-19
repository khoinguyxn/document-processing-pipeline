using ErrorOr;

namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IStorageService
{
    Task<ErrorOr<Success>> UploadFileAsync(Stream fileStream, string bucketName, string storagePath, string contentType,
        CancellationToken cancellationToken);
}