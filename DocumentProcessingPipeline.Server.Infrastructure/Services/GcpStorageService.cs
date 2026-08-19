using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Logging;

namespace DocumentProcessingPipeline.Server.Infrastructure.Services;

public class GcpStorageService(StorageClient storageClient, ILogger<GcpStorageService> logger) : IStorageService
{
    public async Task<ErrorOr<Success>> UploadFileAsync(Stream fileStream, string bucketName, string storagePath, string contentType,
        CancellationToken cancellationToken)
    {
        try
        {
            await storageClient.UploadObjectAsync(
                bucketName,
                storagePath,
                contentType,
                fileStream,
                null,
                cancellationToken
            );

            return Result.Success;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload file to GCS bucket '{BucketName}' at path '{StoragePath}'", bucketName, storagePath);
            
            return Error.Failure("Storage.UploadFailed", $"Failed to upload file to storage: {ex.Message}");
        }
    }
}