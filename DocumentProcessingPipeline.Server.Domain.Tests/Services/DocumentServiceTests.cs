using Bogus;
using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;
using Moq;

namespace DocumentProcessingPipeline.Server.Domain.Tests.Services;

public class DocumentServiceTests
{
    private readonly Mock<IStorageService> _mockStorageService = new();
    private readonly Mock<IDocumentRepository> _mockDocumentRepository = new();
    private readonly Mock<IOcrService> _mockOcrService = new();
    private readonly DocumentService _service;

    private readonly CancellationToken _cancellationToken = CancellationToken.None;
    private const string ExpectedBucketName = "document-processing-pipeline-bucket";

    private readonly Faker<ExtractedFormField> _formFieldFaker;
    private readonly Faker _faker = new();

    public DocumentServiceTests()
    {
        _service = new DocumentService(
            _mockStorageService.Object,
            _mockDocumentRepository.Object,
            _mockOcrService.Object
        );

        _formFieldFaker = new Faker<ExtractedFormField>()
            .RuleFor(f => f.FieldName, f => new FormFieldElement
            {
                Text = f.Random.Word(),
                Confidence = f.Random.Float(),
                NormalizedVertices = []
            })
            .RuleFor(f => f.FieldValue, f => new FormFieldElement
            {
                Text = f.Random.Word(),
                Confidence = f.Random.Float(),
                NormalizedVertices = []
            })
            .RuleFor(f => f.PageNumber, f => f.Random.Int(1, 10));
    }

    [Fact]
    public async Task UploadAsync_ShouldReturnCreated_WhenSuccessful()
    {
        // Arrange
        var stream = new MemoryStream(_faker.Random.Bytes(100));
        var fileName = _faker.System.FileName("pdf");
        const string contentType = "application/pdf";
        var formFields = _formFieldFaker.Generate(3);

        _mockStorageService
            .Setup(x => x.UploadFileAsync(
                stream,
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(Result.Success);

        _mockDocumentRepository
            .Setup(x => x.CreateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(Result.Created);

        _mockOcrService
            .Setup(x => x.ExtractDocumentAsync(
                It.IsAny<string>(),
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(formFields);

        _mockDocumentRepository
            .Setup(x => x.UpdateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(Result.Updated);

        // Act
        var result = await _service.UploadAsync(stream, fileName, contentType, _cancellationToken);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(Result.Created, result.Value);

        _mockStorageService.Verify(x => x.UploadFileAsync(
            stream,
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);

        _mockDocumentRepository.Verify(x => x.CreateDocumentAsync(
            It.Is<Document>(doc =>
                !string.IsNullOrWhiteSpace(doc.Id) &&
                doc.FileName == fileName &&
                doc.ContentType == contentType &&
                doc.BucketName == ExpectedBucketName &&
                doc.StoragePath.StartsWith($"documents/{doc.Id}/{fileName}_") &&
                doc.Status == DocumentStatus.Pending),
            _cancellationToken), Times.Once);

        _mockOcrService.Verify(x => x.ExtractDocumentAsync(
            It.IsAny<string>(),
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);

        _mockDocumentRepository.Verify(x => x.UpdateDocumentAsync(
            It.Is<Document>(doc =>
                doc.Status == DocumentStatus.Completed &&
                doc.ExtractedFormFields == formFields),
            _cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UploadAsync_ShouldReturnErrors_WhenStorageUploadFails()
    {
        // Arrange
        var stream = new MemoryStream(_faker.Random.Bytes(100));
        var fileName = _faker.System.FileName("pdf");
        const string contentType = "application/pdf";
        var expectedError = Error.Failure("Storage.UploadFailed", _faker.Lorem.Sentence());

        _mockStorageService
            .Setup(x => x.UploadFileAsync(
                stream,
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(expectedError);

        // Act
        var result = await _service.UploadAsync(stream, fileName, contentType, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal(expectedError.Code, result.FirstError.Code);
        Assert.Equal(expectedError.Description, result.FirstError.Description);

        _mockDocumentRepository.Verify(x => x.CreateDocumentAsync(
            It.IsAny<Document>(),
            It.IsAny<CancellationToken>()), Times.Never);

        _mockOcrService.Verify(x => x.ExtractDocumentAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);

        _mockDocumentRepository.Verify(x => x.UpdateDocumentAsync(
            It.IsAny<Document>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UploadAsync_ShouldReturnErrors_WhenCreateDocumentFails()
    {
        // Arrange
        var stream = new MemoryStream(_faker.Random.Bytes(100));
        var fileName = _faker.System.FileName("pdf");
        const string contentType = "application/pdf";
        var expectedError = Error.Failure("DocumentRepository.CreateFailed", _faker.Lorem.Sentence());

        _mockStorageService
            .Setup(x => x.UploadFileAsync(
                stream,
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(Result.Success);

        _mockDocumentRepository
            .Setup(x => x.CreateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(expectedError);

        // Act
        var result = await _service.UploadAsync(stream, fileName, contentType, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal(expectedError.Code, result.FirstError.Code);
        Assert.Equal(expectedError.Description, result.FirstError.Description);

        _mockOcrService.Verify(x => x.ExtractDocumentAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);

        _mockDocumentRepository.Verify(x => x.UpdateDocumentAsync(
            It.IsAny<Document>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UploadAsync_ShouldUpdateDocumentAsFailedAndReturnErrors_WhenOcrExtractionFails()
    {
        // Arrange
        var stream = new MemoryStream(_faker.Random.Bytes(100));
        var fileName = _faker.System.FileName("pdf");
        const string contentType = "application/pdf";
        var expectedError = Error.Failure("OcrService.ExtractFailed", _faker.Lorem.Sentence());

        _mockStorageService
            .Setup(x => x.UploadFileAsync(
                stream,
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(Result.Success);

        _mockDocumentRepository
            .Setup(x => x.CreateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(Result.Created);

        _mockOcrService
            .Setup(x => x.ExtractDocumentAsync(
                It.IsAny<string>(),
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(expectedError);

        _mockDocumentRepository
            .Setup(x => x.UpdateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(Result.Updated);

        // Act
        var result = await _service.UploadAsync(stream, fileName, contentType, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal(expectedError.Code, result.FirstError.Code);
        Assert.Equal(expectedError.Description, result.FirstError.Description);

        _mockStorageService.Verify(x => x.UploadFileAsync(
            stream,
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);

        _mockDocumentRepository.Verify(x => x.CreateDocumentAsync(
            It.Is<Document>(doc =>
                !string.IsNullOrWhiteSpace(doc.Id) &&
                doc.FileName == fileName &&
                doc.ContentType == contentType &&
                doc.BucketName == ExpectedBucketName &&
                doc.StoragePath.StartsWith($"documents/{doc.Id}/{fileName}_") &&
                doc.Status == DocumentStatus.Pending),
            _cancellationToken), Times.Once);

        _mockOcrService.Verify(x => x.ExtractDocumentAsync(
            It.IsAny<string>(),
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);

        _mockDocumentRepository.Verify(x => x.UpdateDocumentAsync(
            It.Is<Document>(doc => doc.Status == DocumentStatus.Failed),
            _cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UploadAsync_ShouldReturnErrors_WhenUpdateDocumentFails()
    {
        // Arrange
        var stream = new MemoryStream(_faker.Random.Bytes(100));
        var fileName = _faker.System.FileName("pdf");
        const string contentType = "application/pdf";
        var formFields = _formFieldFaker.Generate(3);
        var expectedError = Error.Failure("DocumentRepository.UpdateFailed", _faker.Lorem.Sentence());

        _mockStorageService
            .Setup(x => x.UploadFileAsync(
                stream,
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(Result.Success);

        _mockDocumentRepository
            .Setup(x => x.CreateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(Result.Created);

        _mockOcrService
            .Setup(x => x.ExtractDocumentAsync(
                It.IsAny<string>(),
                ExpectedBucketName,
                It.IsAny<string>(),
                contentType,
                _cancellationToken))
            .ReturnsAsync(formFields);

        _mockDocumentRepository
            .Setup(x => x.UpdateDocumentAsync(
                It.IsAny<Document>(),
                _cancellationToken))
            .ReturnsAsync(expectedError);

        // Act
        var result = await _service.UploadAsync(stream, fileName, contentType, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal(expectedError.Code, result.FirstError.Code);
        Assert.Equal(expectedError.Description, result.FirstError.Description);

        _mockStorageService.Verify(x => x.UploadFileAsync(
            stream,
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);

        _mockDocumentRepository.Verify(x => x.CreateDocumentAsync(
            It.Is<Document>(doc =>
                !string.IsNullOrWhiteSpace(doc.Id) &&
                doc.FileName == fileName &&
                doc.ContentType == contentType &&
                doc.BucketName == ExpectedBucketName &&
                doc.StoragePath.StartsWith($"documents/{doc.Id}/{fileName}_") &&
                doc.Status == DocumentStatus.Pending),
            _cancellationToken), Times.Once);

        _mockOcrService.Verify(x => x.ExtractDocumentAsync(
            It.IsAny<string>(),
            ExpectedBucketName,
            It.Is<string>(path => path.StartsWith("documents/") && path.Contains(fileName)),
            contentType,
            _cancellationToken), Times.Once);
        
        _mockDocumentRepository.Verify(x => x.UpdateDocumentAsync(
            It.Is<Document>(doc =>
                doc.Status == DocumentStatus.Completed &&
                doc.ExtractedFormFields == formFields),
            _cancellationToken), Times.Once);
    }
}