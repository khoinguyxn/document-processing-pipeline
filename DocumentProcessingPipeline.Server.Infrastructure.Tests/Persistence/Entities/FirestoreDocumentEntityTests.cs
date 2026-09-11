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
        var vertexFaker = new Faker<Vertex>()
            .RuleFor(v => v.X, f => f.Random.Float())
            .RuleFor(v => v.Y, f => f.Random.Float());

        var formFieldElementFaker = new Faker<FormFieldElement>()
            .RuleFor(e => e.Text, f => f.Lorem.Word())
            .RuleFor(e => e.Confidence, f => f.Random.Float())
            .RuleFor(e => e.NormalizedVertices, _ => vertexFaker.Generate(4));

        var extractedFormFieldFaker = new Faker<ExtractedFormField>()
            .RuleFor(f => f.FieldName, _ => formFieldElementFaker.Generate())
            .RuleFor(f => f.FieldValue, _ => formFieldElementFaker.Generate())
            .RuleFor(f => f.PageNumber, f => f.Random.Int(1, 10));

        _documentFaker = new Faker<Document>()
            .RuleFor(d => d.Id, f => f.Random.Guid().ToString())
            .RuleFor(d => d.FileName, f => f.System.FileName("pdf"))
            .RuleFor(d => d.ContentType, _ => "application/pdf")
            .RuleFor(d => d.BucketName, f => f.Internet.DomainWord() + "-bucket")
            .RuleFor(d => d.StoragePath, (_, d) => $"documents/{d.Id}/{d.FileName}")
            .RuleFor(d => d.ExtractedFormFields, _ => extractedFormFieldFaker.Generate(2))
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
        Assert.Equal(document.CreatedAt, entity.CreatedAt);

        var expectedFields = document.ExtractedFormFields.ToList();
        var actualFields = entity.ExtractedFormFields.ToList();
        Assert.Equal(expectedFields.Count, actualFields.Count);

        for (var i = 0; i < expectedFields.Count; i++)
        {
            var expected = expectedFields[i];
            var actual = actualFields[i];

            Assert.Equal(expected.PageNumber, actual.PageNumber);

            Assert.Equal(expected.FieldName.Text, actual.FieldName.Text);
            Assert.Equal(expected.FieldName.Confidence, actual.FieldName.Confidence);
            Assert.Equal(
                expected.FieldName.NormalizedVertices.Select(v => (v.X, v.Y)),
                actual.FieldName.NormalizedVertices.Select(v => (v.X, v.Y)));

            Assert.Equal(expected.FieldValue.Text, actual.FieldValue.Text);
            Assert.Equal(expected.FieldValue.Confidence, actual.FieldValue.Confidence);
            Assert.Equal(
                expected.FieldValue.NormalizedVertices.Select(v => (v.X, v.Y)),
                actual.FieldValue.NormalizedVertices.Select(v => (v.X, v.Y)));
        }
    }

    [Fact]
    public void ToEntity_ShouldHandleNullOptionalFields()
    {
        // Arrange
        var document = new Document
        {
            Id = _faker.Random.Guid().ToString(),
            FileName = _faker.System.FileName("pdf"),
            ContentType = "application/pdf",
            BucketName = _faker.Internet.DomainWord() + "-bucket",
            StoragePath = _faker.System.FilePath(),
            ExtractedFormFields = [],
            Status = DocumentStatus.Pending,
            CreatedAt = null
        };

        // Act
        var entity = document.ToEntity();

        // Assert
        Assert.NotNull(entity);
        Assert.Equal(document.Id, entity.Id);
        Assert.Equal(document.FileName, entity.FileName);
        Assert.Equal(document.ContentType, entity.ContentType);
        Assert.Equal(document.BucketName, entity.BucketName);
        Assert.Equal(document.StoragePath, entity.StoragePath);
        Assert.Equal(nameof(DocumentStatus.Pending), entity.Status);
        Assert.Empty(entity.ExtractedFormFields);
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