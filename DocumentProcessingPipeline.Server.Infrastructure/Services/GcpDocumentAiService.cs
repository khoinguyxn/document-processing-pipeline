using DocumentProcessingPipeline.Server.Domain.Models;
using DocumentProcessingPipeline.Server.Domain.Services.Interfaces;
using ErrorOr;
using Google.Cloud.DocumentAI.V1;
using Microsoft.Extensions.Logging;
using Document = DocumentProcessingPipeline.Server.Domain.Models.Document;
using Vertex = DocumentProcessingPipeline.Server.Domain.Models.Vertex;

namespace DocumentProcessingPipeline.Server.Infrastructure.Services;

public class GcpDocumentAiService(DocumentProcessorServiceClient client, ILogger<GcpDocumentAiService> logger)
    : IOcrService
{
    public async Task<ErrorOr<IEnumerable<ExtractedFormField>>> ExtractDocumentAsync(
        string id,
        string bucketName,
        string storagePath,
        string contentType,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await client.ProcessDocumentAsync(new ProcessRequest
            {
                GcsDocument = new GcsDocument
                {
                    GcsUri = $"gs://{bucketName}/{storagePath}",
                    MimeType = contentType
                }
            }, cancellationToken);

            var extractedFormFields = response.Document.Pages.SelectMany(page =>
                page.FormFields.Select(field => new ExtractedFormField
                {
                    FieldName = new FormFieldElement
                    {
                        Text = field.FieldName.TextAnchor.Content,
                        Confidence = field.FieldName.Confidence,
                        NormalizedVertices = field.FieldName.BoundingPoly.NormalizedVertices.Select(vertex =>
                            new Vertex
                            {
                                X = vertex.X,
                                Y = vertex.Y
                            })
                    },
                    FieldValue = new FormFieldElement
                    {
                        Text = field.FieldValue.TextAnchor.Content,
                        Confidence = field.FieldValue.Confidence,
                        NormalizedVertices = field.FieldValue.BoundingPoly.NormalizedVertices.Select(vertex =>
                            new Vertex
                            {
                                X = vertex.X,
                                Y = vertex.Y
                            })
                    },
                    PageNumber = page.PageNumber
                })).ToList();

            return extractedFormFields;
        }
        catch (Exception ex)
        {
            logger.LogError(
                "GcpDocumentAiService.ExtractDocumentAsync: Failed to extract form fields from document {DocumentId}: {ErrorMessage}",
                id, ex.Message);

            return Error.Failure("DocumentAi.ExtractionFailed",
                $"Failed to extract form fields from document {id}");
        }
    }
}