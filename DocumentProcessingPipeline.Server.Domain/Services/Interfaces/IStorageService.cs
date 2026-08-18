namespace DocumentProcessingPipeline.Server.Domain.Services.Interfaces;

public interface IStorageService
{
    Task UploadFileAsync(Stream fileStream, string storagePath, string contentType, CancellationToken cancellationToken);
}