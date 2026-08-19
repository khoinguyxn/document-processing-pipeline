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
        try
        {
            await EnsureBucketCreatedAsync(bucketName, cancellationToken);

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
            logger.LogError(ex, "Failed to upload file to GCS bucket '{BucketName}' at path '{StoragePath}'",
                bucketName, storagePath);

            return Error.Failure("Storage.UploadFailed", $"Failed to upload file to storage: {ex.Message}");
        }
    }

    private async Task EnsureBucketCreatedAsync(string bucketName, CancellationToken cancellationToken)
    {
        try
        {
            await storageClient.GetBucketAsync(bucketName, cancellationToken: cancellationToken);
        }
        catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
        {
            await storageClient.CreateBucketAsync(options.Value.ProjectId, bucketName,
                cancellationToken: cancellationToken);
        }
    }
}