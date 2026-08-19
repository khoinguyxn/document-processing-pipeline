using System.Net;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using ErrorOr;
using Google;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentProcessingPipeline.Server.Infrastructure.Services;

public class GcpStorageService(
    StorageClient storageClient,
    ILogger<GcpStorageService> logger,
    IOptions<GcpOptions> options) : IStorageService
{
    public async Task<ErrorOr<Success>> UploadFileAsync(Stream fileStream, string bucketName, string storagePath,
        string contentType,
        CancellationToken cancellationToken)
    {
        var result = await EnsureBucketCreatedAsync(bucketName, cancellationToken);
        
        if (result.IsError)
        {
            return result.Errors;
        }

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
            logger.LogError(ex,
                "GcpStorageService.UploadFileAsync: Failed to upload file to GCS bucket '{BucketName}' at path '{StoragePath}'",
                bucketName, storagePath);

            return Error.Failure("Storage.UploadFailed", $"Failed to upload file to storage: {ex.Message}");
        }
    }

    private async Task<ErrorOr<Success>> EnsureBucketCreatedAsync(string bucketName,
        CancellationToken cancellationToken)
    {
        try
        {
            await storageClient.CreateBucketAsync(options.Value.ProjectId, bucketName,
                cancellationToken: cancellationToken);

            logger.LogInformation("GcpStorageService.EnsureBucketCreatedAsync: Bucket '{BucketName}' created",
                bucketName);

            return Result.Success;
        }
        catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Conflict)
        {
            logger.LogDebug("GcpStorageService.EnsureBucketCreatedAsync: Bucket '{BucketName}' already exists",
                bucketName);

            return Result.Success;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GcpStorageService.EnsureBucketCreatedAsync: Failed to create bucket '{BucketName}'",
                bucketName);

            return Error.Failure("Storage.BucketCreationFailed",
                $"Failed to create bucket '{bucketName}': {ex.Message}");
        }
    }
}