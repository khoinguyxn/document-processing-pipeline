using Bogus;
using Document = DocumentProcessingPipeline.Server.Domain.Models.Document;
using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Infrastructure.Persistence.Repositories;
using ErrorOr;
using Google.Api.Gax.Grpc;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using WriteResult = Google.Cloud.Firestore.V1.WriteResult;

namespace DocumentProcessingPipeline.Server.Infrastructure.Tests.Persistence.Repositories;

public class FirestoreDocumentRepositoryTests
{
    private readonly Mock<FirestoreClient> _mockFirestoreClient = new();
    private readonly FirestoreDocumentRepository _repository;

    private readonly CancellationToken _cancellationToken = CancellationToken.None;
    private const string ProjectId = "test-project";

    private readonly Faker<Document> _documentFaker;
    private readonly Faker _faker = new();

    public FirestoreDocumentRepositoryTests()
    {
        var firestoreDb = FirestoreDb.Create(ProjectId, client: _mockFirestoreClient.Object);
        _repository = new FirestoreDocumentRepository(firestoreDb, NullLogger<FirestoreDocumentRepository>.Instance);

        _documentFaker = new Faker<Document>()
            .RuleFor(d => d.Id, f => f.Random.Guid().ToString())
            .RuleFor(d => d.FileName, f => f.System.FileName("pdf"))
            .RuleFor(d => d.ContentType, _ => "application/pdf")
            .RuleFor(d => d.BucketName, f => f.Internet.DomainWord() + "-bucket")
            .RuleFor(d => d.StoragePath, (_, d) => $"documents/{d.Id}/{d.FileName}")
            .RuleFor(d => d.Status, f => f.PickRandom<DocumentStatus>())
            .RuleFor(d => d.CreatedAt, f => f.Date.RecentOffset());
    }

    [Fact]
    public async Task CreateDocumentAsync_ShouldReturnCreated_WhenSuccessful()
    {
        // Arrange
        var document = _documentFaker.Generate();

        _mockFirestoreClient
            .Setup(x => x.CommitAsync(
                It.IsAny<CommitRequest>(),
                It.IsAny<CallSettings>()))
            .ReturnsAsync(new CommitResponse
            {
                CommitTime = Google.Protobuf.WellKnownTypes.Timestamp.FromDateTimeOffset(DateTimeOffset.UtcNow),
                WriteResults =
                {
                    new WriteResult
                    {
                        UpdateTime = Google.Protobuf.WellKnownTypes.Timestamp.FromDateTimeOffset(DateTimeOffset.UtcNow)
                    }
                }
            });

        // Act
        var result = await _repository.CreateDocumentAsync(document, _cancellationToken);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(Result.Created, result.Value);

        _mockFirestoreClient.Verify(x => x.CommitAsync(
            It.Is<CommitRequest>(req =>
                req.Database == $"projects/{ProjectId}/databases/(default)" &&
                req.Writes.Count == 1 &&
                req.Writes[0].Update.Name ==
                $"projects/{ProjectId}/databases/(default)/documents/documents/{document.Id}" &&
                req.Writes[0].Update.Fields["fileName"].StringValue == document.FileName &&
                req.Writes[0].Update.Fields["contentType"].StringValue == document.ContentType &&
                req.Writes[0].Update.Fields["bucketName"].StringValue == document.BucketName &&
                req.Writes[0].Update.Fields["storagePath"].StringValue == document.StoragePath &&
                req.Writes[0].Update.Fields["status"].StringValue == document.Status.ToString()),
            It.IsAny<CallSettings>()), Times.Once);
    }

    [Fact]
    public async Task CreateDocumentAsync_ShouldReturnFailure_WhenExceptionIsThrown()
    {
        // Arrange
        var document = _documentFaker.Generate();
        var errorMessage = _faker.Lorem.Sentence();

        _mockFirestoreClient
            .Setup(x => x.CommitAsync(
                It.IsAny<CommitRequest>(),
                It.IsAny<CallSettings>()))
            .ThrowsAsync(new Exception(errorMessage));

        // Act
        var result = await _repository.CreateDocumentAsync(document, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal("FirestoreDocumentRepository.CreateDocumentAsync", result.FirstError.Code);
        Assert.Contains(errorMessage, result.FirstError.Description);
    }

    [Fact]
    public async Task UpdateDocumentAsync_ShouldReturnUpdated_WhenSuccessful()
    {
        // Arrange
        var document = _documentFaker.Generate();

        _mockFirestoreClient
            .Setup(x => x.CommitAsync(
                It.IsAny<CommitRequest>(),
                It.IsAny<CallSettings>()))
            .ReturnsAsync(new CommitResponse
            {
                CommitTime = Google.Protobuf.WellKnownTypes.Timestamp.FromDateTimeOffset(DateTimeOffset.UtcNow),
                WriteResults =
                {
                    new WriteResult
                    {
                        UpdateTime = Google.Protobuf.WellKnownTypes.Timestamp.FromDateTimeOffset(DateTimeOffset.UtcNow)
                    }
                }
            });

        // Act
        var result = await _repository.UpdateDocumentAsync(document, _cancellationToken);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal(Result.Updated, result.Value);

        _mockFirestoreClient.Verify(x => x.CommitAsync(
            It.Is<CommitRequest>(req =>
                req.Database == $"projects/{ProjectId}/databases/(default)" &&
                req.Writes.Count == 1 &&
                req.Writes[0].Update.Name ==
                $"projects/{ProjectId}/databases/(default)/documents/documents/{document.Id}" &&
                req.Writes[0].Update.Fields["status"].StringValue == document.Status.ToString()),
            It.IsAny<CallSettings>()), Times.Once);
    }

    [Fact]
    public async Task UpdateDocumentAsync_ShouldReturnFailure_WhenExceptionIsThrown()
    {
        // Arrange
        var document = _documentFaker.Generate();
        var errorMessage = $"Failed to update document '{document.Id}'";

        _mockFirestoreClient
            .Setup(x => x.CommitAsync(
                It.IsAny<CommitRequest>(),
                It.IsAny<CallSettings>()))
            .ThrowsAsync(new Exception(errorMessage));

        // Act
        var result = await _repository.UpdateDocumentAsync(document, _cancellationToken);

        // Assert
        Assert.True(result.IsError);
        Assert.Single(result.Errors);
        Assert.Equal("FirestoreDocumentRepository.UpdateDocumentAsync", result.FirstError.Code);
        Assert.Contains(errorMessage, result.FirstError.Description);
    }
}