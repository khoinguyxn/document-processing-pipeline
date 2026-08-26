using Bogus;
using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using DocumentProcessingPipeline.Server.Infrastructure.Options.GcpOptions;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentProcessingPipeline.Server.Infrastructure.Services.DocumentAiServices;

public class FixtureOcrService(ILogger<FixtureOcrService> logger, IOptions<DocumentAiOptions> options) : IOcrService
{
    public async Task<ErrorOr<IEnumerable<ExtractedFormField>>> ExtractDocumentAsync(string id, string bucketName,
        string storagePath, string contentType,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("[DEV OCR] Processing document {Id} using Fixture Provider", id);

        await Task.Delay(options.Value.SimulatedDelayMs, cancellationToken);

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

        return extractedFormFieldFaker.Generate(2).AsEnumerable().ToErrorOr();
    }
}