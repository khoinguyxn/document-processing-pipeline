using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using Google.Cloud.Storage.V1;

namespace DocumentProcessingPipeline.Server.Infrastructure.Services;

public class GcpStorageService(StorageClient storageClient) : IStorageService
{
    private const string BucketName = "document-processing-pipeline-bucket";

    public async Task UploadFileAsync(Stream fileStream, string storagePath, string contentType,
        CancellationToken cancellationToken)
    {
        await storageClient.UploadObjectAsync(
            BucketName,
            storagePath,
            contentType,
            fileStream,
            null,
            cancellationToken
        );
    }
}