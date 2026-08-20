using Bogus;
using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Infrastructure.Persistence.Entities;
using Document = DocumentProcessingPipeline.Server.Domain.Models.Document;

namespace DocumentProcessingPipeline.Server.Infrastructure.Tests.Persistence.Entities;

public class FirestoreDocumentEntityTests
{
    private readonly Faker<Document> _documentFaker;
    private readonly Faker _faker = new();

    public FirestoreDocumentEntityTests()
    {
        _documentFaker = new Faker<Document>()
            .RuleFor(d => d.Id, f => f.Random.Guid().ToString())
            .RuleFor(d => d.FileName, f => f.System.FileName("pdf"))
            .RuleFor(d => d.ContentType, _ => "application/pdf")
            .RuleFor(d => d.BucketName, f => f.Internet.DomainWord() + "-bucket")
            .RuleFor(d => d.StoragePath, (_, d) => $"documents/{d.Id}/{d.FileName}")
            .RuleFor(d => d.ExtractedContent, f => new Dictionary<string, object>
            {
                { f.Random.Word(), f.Lorem.Sentence() }
            })
            .RuleFor(d => d.Status, f => f.PickRandom<DocumentStatus>())
            .RuleFor(d => d.CreatedAt, f => f.Date.RecentOffset());
    }

    [Fact]
    public void ToEntity_ShouldMapAllPropertiesCorrectly_WhenDocumentIsValid()
    {
        // Arrange
        var document = _documentFaker.Generate();

        // Act
        var entity = document.ToEntity();

        // Assert
        Assert.NotNull(entity);
        Assert.Equal(document.Id, entity.Id);
        Assert.Equal(document.FileName, entity.FileName);
        Assert.Equal(document.ContentType, entity.ContentType);
        Assert.Equal(document.BucketName, entity.BucketName);
        Assert.Equal(document.StoragePath, entity.StoragePath);
        Assert.Equal(document.Status.ToString(), entity.Status);
        Assert.Equal(document.ExtractedContent, entity.ExtractedContent);
        Assert.Equal(document.CreatedAt, entity.CreatedAt);
    }

    [Fact]
    public void ToEntity_ShouldHandleNullOptionalFields()
    {
        // Arrange
        var document = new Document
        {
            Id = null,
            FileName = _faker.System.FileName("pdf"),
            ContentType = "application/pdf",
            BucketName = _faker.Internet.DomainWord() + "-bucket",
            StoragePath = _faker.System.FilePath(),
            ExtractedContent = null,
            Status = DocumentStatus.Pending,
            CreatedAt = null
        };

        // Act
        var entity = document.ToEntity();

        // Assert
        Assert.NotNull(entity);
        Assert.Null(entity.Id);
        Assert.Equal(document.FileName, entity.FileName);
        Assert.Equal(document.ContentType, entity.ContentType);
        Assert.Equal(document.BucketName, entity.BucketName);
        Assert.Equal(document.StoragePath, entity.StoragePath);
        Assert.Equal(nameof(DocumentStatus.Pending), entity.Status);
        Assert.Null(entity.ExtractedContent);
        Assert.Null(entity.CreatedAt);
    }

    [Theory]
    [InlineData(DocumentStatus.Pending)]
    [InlineData(DocumentStatus.Processing)]
    [InlineData(DocumentStatus.Completed)]
    [InlineData(DocumentStatus.Failed)]
    public void ToEntity_ShouldCorrectlyMapDifferentDocumentStatuses(DocumentStatus status)
    {
        // Arrange
        var document = _documentFaker.Clone()
            .RuleFor(d => d.Status, _ => status)
            .Generate();

        // Act
        var entity = document.ToEntity();

        // Assert
        Assert.Equal(status.ToString(), entity.Status);
    }
}