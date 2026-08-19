using DocumentProcessingPipeline.Server.Infrastructure.Services;
using ErrorOr;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Logging;
using Moq;
using Object = Google.Apis.Storage.v1.Data.Object;

namespace DocumentProcessingPipeline.Server.Infrastructure.Tests.Services;

public class GcpStorageServiceTests
{
    private readonly Mock<StorageClient> _mockStorageClient = new();
    private readonly Mock<ILogger<GcpStorageService>> _mockLogger = new();
    private readonly GcpStorageService _service;

    private readonly CancellationToken _cancellationToken = CancellationToken.None;
    private const string StoragePath = "/hello.txt";
    private const string ContentType = "text/plain";
    private const string BucketName = "test-bucket";

    public GcpStorageServiceTests()
    {
        _service = new GcpStorageService(_mockStorageClient.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task UploadFileAsync_ShouldSucceed()
    {
        // Arrange
        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        var fileStream = await fileContent.ReadAsStreamAsync(_cancellationToken);

        _mockStorageClient.Setup(x => x.UploadObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<Stream>(),
                It.IsAny<UploadObjectOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(It.IsAny<Object>());

        // Act
        var result = await _service.UploadFileAsync(
            fileStream,
            BucketName,
            StoragePath,
            ContentType,
            _cancellationToken
        );

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(Result.Success, result.Value);

        _mockStorageClient.Verify(x => x.UploadObjectAsync(
                BucketName,
                StoragePath,
                ContentType,
                fileStream,
                It.IsAny<UploadObjectOptions>(),
                _cancellationToken),
            Times.Once);
    }

    [Fact]
    public async Task UploadFileAsync_ShouldReturnError_WhenUploadThrowsException()
    {
        // Arrange
        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        var fileStream = await fileContent.ReadAsStreamAsync(_cancellationToken);

        _mockStorageClient.Setup(x => x.UploadObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<Stream>(),
                It.IsAny<UploadObjectOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("GCS connection failed"));

        // Act
        var result = await _service.UploadFileAsync(
            fileStream,
            BucketName,
            StoragePath,
            ContentType,
            _cancellationToken
        );

        // Assert
        Assert.True(result.IsError);
        Assert.Equal("Storage.UploadFailed", result.FirstError.Code);
        Assert.Equal(ErrorType.Failure, result.FirstError.Type);
    }
}