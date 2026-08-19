using System.Net;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using DocumentProcessingPipeline.Server.Infrastructure.Services;
using ErrorOr;
using Google;
using Google.Apis.Storage.v1.Data;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Object = Google.Apis.Storage.v1.Data.Object;

namespace DocumentProcessingPipeline.Server.Infrastructure.Tests.Services;

public class GcpStorageServiceTests
{
    private readonly Mock<StorageClient> _mockStorageClient = new();
    private readonly Mock<ILogger<GcpStorageService>> _mockLogger = new();
    private readonly Mock<IOptions<GcpOptions>> _mockOptions = new();
    private readonly GcpStorageService _service;

    private readonly CancellationToken _cancellationToken = CancellationToken.None;
    private const string StoragePath = "/hello.txt";
    private const string ContentType = "text/plain";
    private const string BucketName = "test-bucket";
    private const string ProjectId = "test-project";

    public GcpStorageServiceTests()
    {
        _mockOptions.Setup(x => x.Value).Returns(new GcpOptions { ProjectId = ProjectId });
        _service = new GcpStorageService(_mockStorageClient.Object, _mockLogger.Object, _mockOptions.Object);
    }

    [Fact]
    public async Task UploadFileAsync_ShouldSucceed_WhenBucketAlreadyExists()
    {
        // Arrange
        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        var fileStream = await fileContent.ReadAsStreamAsync(_cancellationToken);

        var conflictException = new GoogleApiException("Storage", "Bucket already exists")
        {
            HttpStatusCode = HttpStatusCode.Conflict
        };

        _mockStorageClient.Setup(x => x.CreateBucketAsync(
                ProjectId,
                BucketName,
                It.IsAny<CreateBucketOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(conflictException);

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

        _mockStorageClient.Verify(x => x.CreateBucketAsync(
                ProjectId,
                BucketName,
                It.IsAny<CreateBucketOptions>(),
                _cancellationToken),
            Times.Once);

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
    public async Task UploadFileAsync_ShouldCreateBucketAndSucceed_WhenBucketDoesNotExist()
    {
        // Arrange
        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        var fileStream = await fileContent.ReadAsStreamAsync(_cancellationToken);

        _mockStorageClient.Setup(x => x.CreateBucketAsync(
                ProjectId,
                BucketName,
                It.IsAny<CreateBucketOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Bucket
            {
                Name = BucketName
            });

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

        _mockStorageClient.Verify(x => x.CreateBucketAsync(
                ProjectId,
                BucketName,
                It.IsAny<CreateBucketOptions>(),
                _cancellationToken),
            Times.Once);

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
    public async Task UploadFileAsync_ShouldReturnError_WhenBucketCreationThrowsException()
    {
        // Arrange
        var fileContent = new ByteArrayContent([.. "Hello World!"u8]);
        var fileStream = await fileContent.ReadAsStreamAsync(_cancellationToken);

        _mockStorageClient.Setup(x => x.CreateBucketAsync(
                ProjectId,
                BucketName,
                It.IsAny<CreateBucketOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Failed to create bucket"));

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
        Assert.Equal("Storage.BucketCreationFailed", result.FirstError.Code);
        Assert.Equal(ErrorType.Failure, result.FirstError.Type);

        _mockStorageClient.Verify(x => x.UploadObjectAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<Stream>(),
                It.IsAny<UploadObjectOptions>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
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